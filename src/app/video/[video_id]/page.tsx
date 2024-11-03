import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/db';
import { videos, segmentChunks } from '@/db/schema';
import { getVideoData } from '@/lib/video';
import VideoPage from './VideoPage';
import { eq } from 'drizzle-orm';

interface VideoPageProps {
    params: {
        video_id: string;
    };
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
    const { video_id } = params;

    const video = await db
        .select()
        .from(videos)
        .where(eq(videos.videoId, video_id))
        .then((rows) => rows[0]);

    if (!video) {
        return {
            title: 'Video Not Found',
        };
    }

    return {
        title: video.title,
        description: video.description,
    };
}

export default async function Page({ params }: VideoPageProps) {
    const { video_id } = params;

    // Check if the video exists in the database
    let video = await db
        .select()
        .from(videos)
        .where(eq(videos.videoId, video_id))
        .then((rows) => rows[0]);

    if (!video) {
        try {
            video = await getVideoData(video_id);
        } catch (error) {
            console.error(error);
            notFound();
        }
    }

    // Fetch segment chunks associated with the video
    const videoChunks = await db
        .select()
        .from(segmentChunks)
        .where(eq(segmentChunks.videoId, video_id));

    return <VideoPage video={video} segments={videoChunks} />;
}
