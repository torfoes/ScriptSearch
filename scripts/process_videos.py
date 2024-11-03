# process_videos.py

import os
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    NoTranscriptAvailable,
)
import googleapiclient.discovery
import googleapiclient.errors

def get_youtube_service(api_key):
    api_service_name = "youtube"
    api_version = "v3"
    return googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=api_key)

def get_video_metadata(youtube, video_id):
    try:
        request = youtube.videos().list(
            part="snippet",
            id=video_id
        )
        response = request.execute()
        if not response["items"]:
            print(f"No metadata found for video {video_id}.")
            return None
        item = response["items"][0]
        video_info = {
            'video_id': item['id'],
            'title': item['snippet']['title'],
            'description': item['snippet']['description'],
            'published_at': item['snippet']['publishedAt']
        }
        return video_info
    except googleapiclient.errors.HttpError as e:
        print(f"An HTTP error {e.resp.status} occurred for video {video_id}:\n{e.content}")
        return None

def get_youtube_transcript(video_id, language='en'):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = transcript_list.find_transcript([language])
        transcript_data = transcript.fetch()
        return transcript_data  # List of dictionaries with 'text', 'start', 'duration'
    except (TranscriptsDisabled, NoTranscriptFound, NoTranscriptAvailable):
        print(f"No transcript available for video {video_id}.")
    except Exception as e:
        print(f"An error occurred for video {video_id}: {e}")
    return None

def insert_video(conn, video):
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO videos (video_id, title, description, published_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (video_id) DO NOTHING;
        """, (video['video_id'], video['title'], video['description'], video['published_at']))
    conn.commit()

def insert_segments(conn, video_id, segments_data):
    with conn.cursor() as cursor:
        execute_values(cursor, """
            INSERT INTO segments (video_id, start, duration, text)
            VALUES %s;
        """, segments_data)
    conn.commit()

def process_video(video_id, youtube, conn):
    print(f"Processing video {video_id}...")

    # Get video metadata
    video_info = get_video_metadata(youtube, video_id)
    if not video_info:
        return

    # Insert video metadata into the database
    insert_video(conn, video_info)

    # Get transcript data
    transcript_data = get_youtube_transcript(video_id)
    if not transcript_data:
        return  # Skip if no transcript is available

    print(f"Transcript has {len(transcript_data)} segments.")

    # Prepare data for insertion
    segments_data = []
    for segment in transcript_data:
        segments_data.append((
            video_id,
            segment['start'],
            segment['duration'],
            segment['text']
        ))

    # Insert segments into the database
    insert_segments(conn, video_id, segments_data)
    print(f"Inserted {len(segments_data)} segments for video {video_id}.")

def main():
    # Load environment variables
    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not API_KEY:
        raise ValueError("API_KEY not found in environment variables.")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL not found in environment variables.")

    # Connect to the database
    conn = psycopg2.connect(DATABASE_URL)

    # Initialize the YouTube service
    youtube = get_youtube_service(API_KEY)

    # Read video IDs from video_ids.txt
    if not os.path.exists("video_ids.txt"):
        print("video_ids.txt not found.")
        return

    with open("video_ids.txt", "r") as f:
        video_ids = [line.strip() for line in f if line.strip()]

    print(f"Total videos to process: {len(video_ids)}")

    try:
        for idx, video_id in enumerate(video_ids, start=1):
            print(f"\nProcessing video {idx}/{len(video_ids)}: {video_id}")
            process_video(video_id, youtube, conn)
    except Exception as e:
        print(f"An error occurred during processing: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
