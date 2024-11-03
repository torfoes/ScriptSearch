import { youtube_v3 } from '@googleapis/youtube';

export const youtube = new youtube_v3.Youtube({
    auth: process.env.YOUTUBE_API_KEY,
});
