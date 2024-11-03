import {doublePrecision, index, serial, text, timestamp, vector} from "drizzle-orm/pg-core";
import {pgTable} from "drizzle-orm/pg-core/table";

export const videos = pgTable('videos', {
    videoId: text('video_id').primaryKey(),
    title: text('title'),
    description: text('description'),
    publishedAt: timestamp('published_at'),
});

export const segments = pgTable(
    'segments',
    {
        segmentId: serial('segment_id').primaryKey(),
        videoId: text('video_id').references(() => videos.videoId),
        start: doublePrecision('start'),
        duration: doublePrecision('duration'),
        text: text('text'),
        embedding: vector('embedding', { dimensions: 1536 }),
        transcriptId: serial('transcript_id'),
    },
    (table) => ({
        embeddingIndex: index('embedding_index')
            .using('hnsw', table.embedding.op('vector_cosine_ops')),
    })
);
