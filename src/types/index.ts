export interface Video {
    videoId: string;
    title: string;
    description: string;
    publishedAt: Date;
}

export interface Segment {
    segmentId: number;
    videoId: string;
    start: number;
    duration: number;
    text: string;t
    embedding?: number[];
    distance?: number;
}

export interface SegmentChunk {
    chunkId: number;
    videoId: string;
    start: number;
    end: number;
    text: string;
    embedding?: number[];
    distance?: number;
}
