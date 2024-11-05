This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, create and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Setting up Environmental Values

Create a `.env` or `.env.local` file and add the following variables:

```txt
POSTGRES_DATABASE=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_PRISMA_URL=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_URL_NO_SSL=
POSTGRES_USER=

OPENAI_API_KEY=
YOUTUBE_API_KEY=
```

Due to utilizing OpenAI's embedding features to generate semantic-based vectors for both the transcript and query, an OpenAI API key is required
to run the following web app. A database is also required to store the vector embeddings returned by the OpenAI API. 

Without the API key and a database to store these embeddings, similarity calculations cannot be done.

## Core Algorithm Explanation

From the database, vector-based euclidean distance calculations can be made
utilizing the following pSQL command: 

```psql
SELECT
    *,
    (embedding <=> ${sql.raw(`'${vectorString}'::vector`)}) AS distance
FROM
    segment_chunks
WHERE
    video_id = ${videoId}
ORDER BY
    chunk_id ASC
```
Where `embedding` and `vectorString` are the transcript and query embeddings respectively.

The following command returns the euclidean distances between the query embedding and the transcript embedding chunks.
To convert them into a similarity score, simply apply the distance to following formula:
```
similarity score = 1 / (1 + distance)
```