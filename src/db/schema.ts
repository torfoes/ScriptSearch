import { doublePrecision, index, serial, text, timestamp, vector } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";

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
        videoId: text('video_id')
            .references(() => videos.videoId, { onDelete: 'cascade' }),
        start: doublePrecision('start'),
        duration: doublePrecision('duration'),
        text: text('text'),
        transcriptId: serial('transcript_id'),
    }
);

export const segmentChunks = pgTable(
    'segment_chunks',
    {
        chunkId: serial('chunk_id').primaryKey(),
        videoId: text('video_id')
            .references(() => videos.videoId, { onDelete: 'cascade' }),
        start: doublePrecision('start'),
        end: doublePrecision('end'),
        text: text('text'),
        embedding: vector('embedding', { dimensions: 1536 }),
    },
    (table) => ({
        embeddingIndex: index('embedding_index')
            .using('hnsw', table.embedding.op('vector_cosine_ops')),
    })
);
