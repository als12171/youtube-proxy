var fs = require('fs');
var path = require('path');
var ytdl = require('ytdl-core');
var yts = require('yt-search');

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";

async function search_one(query) {
  console.log("query: " + query);
  let results = await yts(query);

  let videos = results.videos;
  console.log("videos: " + videos);

  if (!videos || !videos.length) {
    return null;
  }

  let video = videos[0];
  console.log("video id: " + video.videoId);
  return {
    id: video.videoId,
    link: video.url,
    title: video.title
  };
}

module.exports = {
  search_one
}
