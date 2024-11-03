// lib/video.ts

import { db } from '@/db';
import { videos, segments } from '@/db/schema';
import { youtube_v3 } from '@googleapis/youtube';
import { getEmbedding } from '@/lib/embeddings';
import { YoutubeTranscript } from 'youtube-transcript';

// Initialize YouTube API client
const youtube = new youtube_v3.Youtube({
    auth: process.env.YOUTUBE_API_KEY,
});

interface TranscriptItem {
    text: string;
    start: number;
    duration: number;
}

export async function fetchTranscript(videoId: string): Promise<TranscriptItem[]> {
    try {
        // Fetch the transcript using the provided YoutubeTranscript class
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });

        // Map the transcript data to match the TranscriptItem interface
        return transcript.map((item) => ({
            text: item.text,
            start: item.offset, // 'offset' corresponds to the 'start' time
            duration: item.duration,
        }));
    } catch (error) {
        console.error('Error fetching transcript:', error);
        throw error;
    }
}

export async function getVideoData(videoId: string) {
    // Fetch video details from YouTube
    const videoResponse = await youtube.videos.list({
        part: ['snippet'],
        id: [videoId],
    });

    const videoInfo = videoResponse.data.items?.[0];

    if (!videoInfo) {
        throw new Error('Video not found');
    }

    const { title, description, publishedAt } = videoInfo.snippet!;

    // Validate and format publishedAt
    let publishedAtDate: Date;

    if (publishedAt) {
        const date = new Date(publishedAt);
        if (!isNaN(date.getTime())) {
            // Valid date
            publishedAtDate = date;
        } else {
            // Invalid date
            console.warn('Invalid publishedAt date:', publishedAt);
            publishedAtDate = new Date();
        }
    } else {
        publishedAtDate = new Date();
    }

    const [video] = await db
        .insert(videos)
        .values({
            videoId,
            title: title || '',
            description: description || '',
            publishedAt: publishedAtDate,
        })
        .onConflictDoNothing()
        .returning();

    // Fetch the transcript
    const transcript = await fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
        throw new Error('Transcript not found');
    }

    // Process transcript: compute embeddings and prepare segments data
    const segmentsData = await Promise.all(
        transcript.map(async (item) => {
            const { text, start, duration } = item;
            const embedding = await getEmbedding(text);

            return {
                videoId,
                start,
                duration,
                text,
                embedding,
            };
        })
    );

    await db.insert(segments).values(segmentsData);

    return video;
}
