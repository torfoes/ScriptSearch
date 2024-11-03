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
    text: string;
    embedding: number[];
    distance?: number;
}
