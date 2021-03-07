const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ytwrappers = require('./youtube_wrappers.js');

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";

async function fetch_target_id(req, res) {
    try {
        let id = req.params.id;
        let url = YOUTUBE_URL_PREFIX + id;

        console.log("video info for: " + url);
        let info = await ytwrappers.get_video_details(id);
        console.log("video info: " + info);
        console.log("found desired video, going to download");
        await download_video(id, res, info);
    } catch (ex) {
        console.log(ex.message);
        res.status(500).json({
            error: ex.message
        });
    }
}

async function download_video(videoId, res, info) {
    let url = YOUTUBE_URL_PREFIX + videoId;

    let output_file = path.join(__dirname, '..', 'public', 'site', videoId + '.mp4');
    console.log("output_file: " + output_file);
    let videoTitle = info == null ? "missing title" : info.title;
    let videoUrl = info == null ? "missing URL" : info.link;

    let writer = fs.createWriteStream(output_file);
    writer.on('finish', function () {
        res.status(200).json({
            state: 'success',
            link: '/site/' + videoId + '.mp4',
            info: {
                id: videoId,
                title: videoTitle,
                link: videoUrl
            }
        });
    });

    console.log("starting video download");
    await ytdl(url).pipe(writer);
    console.log("finished video download");
}

async function fetch_details_id(req, res) {
    try {
        let id = req.params.id;
        let url = YOUTUBE_URL_PREFIX + id;

        console.log("video info for: " + url);
        let info = await ytwrappers.get_video_details(id);
        res.status(200).send({
            state: 'success',
            info: info
        });
    } catch (ex) {
        console.log(ex.message);
        res.status(500).json({
            error: ex.message
        });
    }
}

async function search_handler(req, res) {
    try {
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
    } catch (ex) {
        console.log(ex.message);
        res.status(500).json({
            error: ex.message
        });
    }
}

module.exports = function (app) {
    app.get('/target/:id', async function (req, res) {
        await fetch_target_id(req, res);
    });

    app.get('/details/:id', async function (req, res) {
        await fetch_details_id(req, res);
    });

    app.get('/search/:query', async function (req, res) {
        await search_handler(req, res);
    });
}
