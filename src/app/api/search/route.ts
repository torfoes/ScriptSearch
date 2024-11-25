import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { getEmbedding } from '@/lib/embeddings';

const searchSchema = z.object({
    query: z.string(),
    videoId: z.string(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, videoId } = searchSchema.parse(body);

        // Get the embedding for the query
        const queryEmbedding = await getEmbedding(query);

        // Ensure the embedding is valid
        if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            throw new Error('Invalid query embedding.');
        }

        // Serialize the embedding into a vector literal safely
        const vectorString = `[${queryEmbedding.join(',')}]`;

        // Perform similarity computation in the database using parameterized queries
        const results = await db.execute(
            sql`
                SELECT
                    *,
                    (embedding <=> ${sql.param(vectorString)}::vector) AS distance
                FROM
                    segment_chunks
                WHERE
                    video_id = ${sql.param(videoId)}
                ORDER BY
                    chunk_id ASC
            `
        );

        // Return all segments with their similarity scores
        return NextResponse.json({
            segments: results.rows,
        });
    } catch (error) {
        console.error('Error during search:', error);
        return NextResponse.json(
            { error: 'An error occurred during the search.' },
            { status: 500 }
        );
    }
}
