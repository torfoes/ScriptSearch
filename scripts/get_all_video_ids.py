import os
from dotenv import load_dotenv
import googleapiclient.discovery
import googleapiclient.errors


def get_youtube_service(api_key):
    """
    Build and return the YouTube service object.
    """
    api_service_name = "youtube"
    api_version = "v3"

    return googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=api_key)


def get_channel_uploads_playlist_id(youtube, channel_id):
    """
    Retrieve the uploads playlist ID for a given channel.
    """
    request = youtube.channels().list(
        part="contentDetails",
        id=channel_id
    )
    response = request.execute()

    if not response["items"]:
        raise ValueError("Channel not found.")

    # The uploads playlist ID is where all uploaded videos are listed
    uploads_playlist_id = response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    return uploads_playlist_id


def get_all_video_ids(youtube, playlist_id):
    """
    Retrieve all video IDs from the specified playlist.
    """
    video_ids = []
    next_page_token = None

    while True:
        request = youtube.playlistItems().list(
            part="contentDetails",
            playlistId=playlist_id,
            maxResults=50,  # Maximum allowed per request
            pageToken=next_page_token
        )
        response = request.execute()

        for item in response["items"]:
            video_id = item["contentDetails"]["videoId"]
            video_ids.append(video_id)

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break  # No more pages

    return video_ids


def main():
    load_dotenv()

    API_KEY = os.getenv("API_KEY")
    CHANNEL_ID = os.getenv("CHANNEL_ID")

    if not API_KEY:
        raise ValueError("API_KEY not found in the environment variables.")

    if not CHANNEL_ID:
        raise ValueError("CHANNEL_ID not found in the environment variables.")

    # initialize the YouTube service
    youtube = get_youtube_service(API_KEY)

    try:
        # get the uploads playlist ID
        uploads_playlist_id = get_channel_uploads_playlist_id(youtube, CHANNEL_ID)
        print(f"Uploads Playlist ID: {uploads_playlist_id}")

        # get all video IDs from the uploads playlist
        video_ids = get_all_video_ids(youtube, uploads_playlist_id)
        print(f"Total videos found: {len(video_ids)}")

        # save the video IDs to a file
        with open("video_ids.txt", "w") as f:
            for vid in video_ids:
                f.write(f"{vid}\n")
        print("Video IDs have been saved to video_ids.txt")

    except googleapiclient.errors.HttpError as e:
        print(f"An HTTP error {e.resp.status} occurred:\n{e.content}")
    except Exception as ex:
        print(f"An error occurred: {ex}")


if __name__ == "__main__":
    main()
