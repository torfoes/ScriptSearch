CREATE TABLE IF NOT EXISTS "segments" (
	"segment_id" serial PRIMARY KEY NOT NULL,
	"video_id" text,
	"start" double precision,
	"duration" double precision,
	"text" text,
	"embedding" vector(1536),
	"transcript_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"video_id" text PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"published_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "segments" ADD CONSTRAINT "segments_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding_index" ON "segments" USING hnsw ("embedding" vector_cosine_ops);