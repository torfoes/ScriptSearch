CREATE TABLE IF NOT EXISTS "segment_chunks" (
	"chunk_id" serial PRIMARY KEY NOT NULL,
	"video_id" text,
	"start" double precision,
	"end" double precision,
	"text" text,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "segments" DROP CONSTRAINT "segments_video_id_videos_video_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "embedding_index";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "segment_chunks" ADD CONSTRAINT "segment_chunks_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding_index" ON "segment_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "segments" ADD CONSTRAINT "segments_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "segments" DROP COLUMN IF EXISTS "embedding";