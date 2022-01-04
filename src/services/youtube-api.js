import axios from 'axios';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const baseUrl = `https://www.googleapis.com/youtube/v3/`;
const API_KEY = process.env.REACT_APP_YOUTUBE_DATA_API_KEY;

export const getPlaylistVideosData = async (playlistId) => {
  let res = { videos: [], error: null };
  let nextPageToken = '';
  while (true) {
    let playlistRes;
    try {
      playlistRes = await axios({
        method: 'get',
        url: `${baseUrl}playlistItems`,
        params: {
          part: 'contentDetails',
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken,
          key: API_KEY,
        },
        timeout: 3000,
      });
    } catch (err) {
      res.error = err.message;
      break;
    }

    const videoIds = playlistRes.data.items.map(
      (item) => item.contentDetails.videoId
    );

    let vidRes;
    try {
      vidRes = await axios({
        method: 'get',
        url: `${baseUrl}videos`,
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: API_KEY,
        },
        timeout: 3000,
      });
    } catch (err) {
      res.error = err.message;
      break;
    }

    vidRes.data.items.forEach((item) => {
      res.videos.push({
        id: item.id,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        duration: dayjs.duration(item.contentDetails.duration).asSeconds(),
        views: item.statistics.viewCount,
        likes: item.statistics.likeCount,
        comments: item.statistics.commentCount,
      });
    });

    nextPageToken = playlistRes.data.nextPageToken;
    if (!nextPageToken) break;
  }
  return res;
};
