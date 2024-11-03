// app/api/search/route.ts

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

        // Serialize the embedding into a vector literal
        const vectorString = `[${queryEmbedding.join(',')}]`;

        // Perform similarity computation in the database without reordering the segments
        const results = await db.execute(
            sql`
        SELECT
          *,
          (embedding <=> ${sql.raw(`'${vectorString}'::vector`)}) AS distance
        FROM
          segments
        WHERE
          video_id = ${videoId}
        ORDER BY
          segment_id ASC
      `
        );

        // Return all segments with their similarity scores
        return NextResponse.json({
            segments: results.rows,
            queryEmbedding,
        });
    } catch (error) {
        console.error('Error during search:', error);
        return NextResponse.json(
            { error: 'An error occurred during the search.' },
            { status: 500 }
        );
    }
}
