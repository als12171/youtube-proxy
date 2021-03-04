const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ytwrappers = require('./youtube_wrappers.js');

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";

async function fetch_target_id(req, res) {
    let id = req.params.id;
    let url = YOUTUBE_URL_PREFIX + id;

    console.log("video info for: " + url);
    let info = await ytwrappers.get_video_details(id);
    console.log("video info: " + info);
    console.log("found desired video, going to download");
    download_video_sync(id, res, info);
}

function fetch_target_id_sync(req, res) {
    let id = req.params.id;
    let url = YOUTUBE_URL_PREFIX + id;

    console.log("video info for: " + url);
    let info = ytwrappers.get_video_details_sync(id);
    console.log("video info: " + info);
    console.log("found desired video, going to download");
    download_video_sync(id, res, info);
}

async function download_video(videoId, res, info) {
    download_video_sync(videoId, res, info);
}

function download_video_sync(videoId, res, info) {
    let url = YOUTUBE_URL_PREFIX + videoId;

    let output_file = path.join(__dirname, '..', 'public', 'site', videoId + '.mp4');
    console.log("output_file: " + output_file);

    let writer = fs.createWriteStream(output_file);
    writer.on('finish', function () {
        res.status(200).json({
            state: 'success',
            link: '/site/' + videoId + '.mp4',
            info: {
                id: videoId,
                title: info.title
            }
        });
    });

    console.log("starting video download");
    ytdl(url).pipe(writer);
    console.log("finished video download");
}

module.exports = function (app) {
    //app.get('/target/:id', fetch_target_id_sync);
    app.get('/target/:id', async function (req, res) {
        await fetch_target_id(req, res);
    });

    app.get('/search/:query', async function (req, res) {
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
    });
}
