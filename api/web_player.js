const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ytwrappers = require('./youtube_wrappers.js');

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";

async function fetch_video_handler(req, res) {
    let id = req.params.id;
    let url = YOUTUBE_URL_PREFIX + id;

    console.log("video info for: " + url);
    let info = await ytwrappers.get_video_details(id);
    console.log("video info: " + info);
    console.log("found desired video, going to download");
    await download_video(id, res, info);
}

async function download_video(videoId, res, info) {
    let url = YOUTUBE_URL_PREFIX + videoId;

    let output_file = path.join(__dirname, '..', 'public', 'site', videoId + '.mp4');
    console.log("output_file: " + output_file);
    let videoTitle = info == null ? "missing title" : info.title;

    let writer = fs.createWriteStream(output_file);
    writer.on('finish', function () {
        res.status(200).json({
            state: 'success',
            link: '/site/' + videoId + '.mp4',
            info: {
                id: videoId,
                title: videoTitle
            }
        });
    });

    console.log("starting video download");
    ytdl(url).pipe(writer);
    console.log("finished video download");
}

async function search_handler(req, res) {
    let query = req.params.query;
    let result = await ytwrappers.search_one(query);

    console.log("search result: " + result);
    if (result == null) {
        res.status(200).send({
            state: 'error',
            message: 'No results found'
        });
    } else {
        console.log(result);
        req.params.id = result.id;
        fetch_target_id(req, res);
    }
}

module.exports = function (app) {
    app.get('/target/:id', async function (req, res) {
        await fetch_video_handler(req, res);
    });

    app.get('/search/:query', async function (req, res) {
        await search_handler(req, res);
    });
}
