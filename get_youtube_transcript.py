from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    NoTranscriptAvailable,
)


def get_youtube_transcript(video_id, language='en'):
    """
    Fetches the transcript for a given YouTube video ID.

    Args:
        video_id (str): The unique identifier for the YouTube video.
        language (str): The language code for the transcript (default is English).

    Returns:
        str: The transcript text.
    """
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        transcript = transcript_list.find_transcript([language])

        transcript_data = transcript.fetch()

        formatter = TextFormatter()
        text_formatted = formatter.format_transcript(transcript_data)

        return text_formatted

    except TranscriptsDisabled:
        print("Transcripts are disabled for this video.")
    except NoTranscriptFound:
        print("No transcript found for this video.")
    except NoTranscriptAvailable:
        print("Transcript is not available in the desired language.")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    video_id = "dQw4w9WgXcQ"

    transcript = get_youtube_transcript(video_id)

    if transcript:
        print("Transcript:")
        print(transcript)
