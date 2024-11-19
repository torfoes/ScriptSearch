// lib/video.ts

import { db } from '@/db';
import { videos, segments, segmentChunks } from '@/db/schema';
import { youtube_v3 } from '@googleapis/youtube';
import { getEmbedding } from '@/lib/embeddings';
import { YoutubeTranscript } from 'youtube-transcript';
import { encodingForModel } from "js-tiktoken";
import { decode } from 'he';

// Initialize YouTube API client
const youtube = new youtube_v3.Youtube({
    auth: process.env.YOUTUBE_API_KEY,
});

const encoding = encodingForModel('text-embedding-ada-002');

const TARGET_TOKEN_COUNT = 300;

interface TranscriptItem {
    text: string;
    start: number;
    duration: number;
}

export async function fetchTranscript(videoId: string): Promise<TranscriptItem[]> {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });

        return transcript.map((item) => {
            const originalText = item.text;
            const firstDecodedText = decode(originalText);
            const fullyDecodedText = decode(firstDecodedText);

            return {
                text: fullyDecodedText,
                start: item.offset,
                duration: item.duration,
            };
        });
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

    // Insert segments into the 'segments' table (without embeddings)
    const segmentsData = transcript.map((item) => {
        const { text, start, duration } = item;
        return {
            videoId,
            start,
            duration,
            text,
        };
    });

    await db.insert(segments).values(segmentsData);

    // Process segments into chunks
    const chunks = [];
    let currentChunkText = '';
    let currentTokenCount = 0;
    let currentStart: number | null = null;
    let currentEnd: number | null = null;

    for (const item of transcript) {
        const { text, start, duration } = item;

        // Tokenize the text
        const tokens = encoding.encode(text);
        const tokenCount = tokens.length;

        if (currentTokenCount + tokenCount > TARGET_TOKEN_COUNT) {
            // Save the current chunk
            if (currentChunkText.trim()) {
                chunks.push({
                    videoId,
                    start: currentStart!,
                    end: currentEnd!,
                    text: currentChunkText.trim(),
                });
            }

            // Reset variables
            currentChunkText = text;
            currentTokenCount = tokenCount;
            currentStart = start;
            currentEnd = start + duration;
        } else {
            // Accumulate
            if (currentStart === null) currentStart = start;
            currentChunkText += ' ' + text;
            currentTokenCount += tokenCount;
            currentEnd = start + duration;
        }
    }

    // Save any remaining chunk
    if (currentChunkText.trim()) {
        chunks.push({
            videoId,
            start: currentStart!,
            end: currentEnd!,
            text: currentChunkText.trim(),
        });
    }

    // Compute embeddings for each chunk and insert into 'segment_chunks' table
    const chunksData = await Promise.all(
        chunks.map(async (chunk) => {
            const embedding = await getEmbedding(chunk.text);
            return {
                videoId: chunk.videoId,
                start: chunk.start,
                end: chunk.end,
                text: chunk.text,
                embedding,
            };
        })
    );

    await db.insert(segmentChunks).values(chunksData);

    return video;
}
