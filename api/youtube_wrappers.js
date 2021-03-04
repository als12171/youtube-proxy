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

async function get_video_details(id) {
    console.log("get video details for video: " + id);
    let videoInfo = await yts({
        'videoId': id
    });

    console.log("video data: " + videoInfo);

    if (!videoInfo ) {
        return null;
    }

    return {
        id: videoInfo.videoId,
        link: videoInfo.url,
        title: videoInfo.title
    };
}

module.exports = {
    search_one,
    get_video_details
}
