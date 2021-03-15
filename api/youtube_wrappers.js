var fs = require('fs');
var path = require('path');
var ytdl = require('ytdl-core');
var yts = require('yt-search');
var ytlist = require("yt-list");

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

async function search_many_ytSearch(query) {
    console.log("query: " + query);
    let results = await yts(query);

    let videos = results.videos;
    console.log("videos: " + videos);

    if (!videos || !videos.length) {
        return null;
    }

    let videos_result = new Array();
    for (var i = 0; i < videos.length; i++) {
        console.log("video id: " + videos[i].videoId);
        videos_result[i] = {
            id: videos[i].videoId,
            url: videos[i].url,
            title: videos[i].title
        };
    }

    console.log("videos added: " + videos_result.length);
    return videos_result;
}

async function search_many_ytList(query, nextPageToken, amount) {
    console.log("query: " + query);
    let results = await ytlist.searchVideos(query, nextPageToken, amount);

    console.log("videos count: " + results.totalResults);
    console.log("videos nextPageToken: " + results.nextPageToken);
    console.log("videos items: " + results.items);
    console.log("videos items: " + results.items.length);

    if (!results || !results.items.length) {
        return null;
    }

    return results;
}

async function search_many_ytList_v2(query, amount) {
    console.log("query: " + query);
    let results = await ytlist.searchVideos(query, null, amount);

    console.log("videos count: " + results.totalResults);
    console.log("videos items: " + results.items);
    console.log("videos items: " + results.items.length);

    if (!results || !results.items.length) {
        return null;
    }

    let videos_result = new Array();
    for (var i = 0; i < results.items.length; i++) {
        console.log("video id: " + results.items[i].videoId);
        console.log("video url: " + YOUTUBE_URL_PREFIX + results.items[i].videoId, );
        console.log("video title: " + results.items[i].snippet.title);

        videos_result[i] = {
            id: results.items[i].videoId,
            url: YOUTUBE_URL_PREFIX + results.items[i].videoId,
            title: results.items[i].snippet.title
        };
    }

    console.log("videos added: " + videos_result.length);
    return videos_result;
}

async function get_video_details_ytSearch(id) {
    console.log("get video details for video: " + id);
    let videoInfo = await yts({
        'videoId': id
    });

    console.log("video data: " + videoInfo);

    if (!videoInfo) {
        return null;
    }

    return {
        id: videoInfo.videoId,
        link: videoInfo.url,
        title: videoInfo.title
    };
}

async function get_video_details_ytList(id) {
    console.log("get video details for video: " + id);
    let videoInfo = await ytlist.listVideoDetails(id);

    console.log("video data: " + videoInfo);

    if (!videoInfo) {
        return null;
    }

    return videoInfo;
}

module.exports = {
    search_one,
    search_many_ytSearch,
    search_many_ytList,
    get_video_details_ytSearch,
    get_video_details_ytList
}
