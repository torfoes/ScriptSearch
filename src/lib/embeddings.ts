import { openai } from '@/lib/openai';

export async function getEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
    });

    return response.data[0].embedding;
}
