const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ytwrappers = require('./youtube_wrappers.js');

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";

function fetch_target_id(req, res) {
    (async() => await getInfoAndDownload(req, res))();
}

async function getInfoAndDownload(req, res) {
    let id = req.params.id;
    let url = YOUTUBE_URL_PREFIX + id;

    // console.log("ytdl getinfo for: " + url);
    // let info = await ytdl.getInfo(id);
    // let format = ytdl.chooseFormat(info.formats, {
        // quality: '134'
    // });
    // console.log('Format found!', format);
    // console.log("found desired video, going to download");
    // download_video(id, res, info);

    console.log("ytdl getinfo for: " + url);
    await ytdl.getInfo(url, function (err, info) {
        if (err) {
            res.status(500).json({
                state: 'error',
                message: err.message
            });
        } else {
            console.log("found desired video, going to download");
            download_video(id, res, info);
        }
    });
}

function download_video(videoId, res, info) {
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

    //let starttime = 0;
    //
    //let video = ytdl(url, {
    //    quality: "lowestvideo"
    //}).pipe(writer);
    //
    //video.once("response", () => {
    //    starttime = Date.now();
    //});
    //
    //video.on("progress", (chunkLength, downloaded, total) => {
    //    const percent = downloaded / total;
    //    const downloadedSeconds = (Date.now() - starttime) / 1000;
    //
    //    const friedlyPercentage = Number((percent * 100).toFixed(2));
    //    const downloadedMbs = Number((downloaded / 1024 / 1024).toFixed(2));
    //    const totalInMbs = Number((total / 1024 / 1024).toFixed(2));
    //    const estimatedLeft = parseInt(downloadedSeconds / percent - downloadedSeconds, 10);
    //
    //    const percentStr = `${friedlyPercentage}%`;
    //    const downloadedMbStr = `${downloadedMbs}MB(s) of ${totalInMbs}MB(s)`;
    //    const estimatedLeftStr = `${estimatedLeft} second(s)`;
    //
    //    if (downloaded !== total) {
    //        console.log(`> ${percentStr} downloaded - ${downloadedMbStr} - estimated time left: ${estimatedLeftStr}`);
    //    } else {
    //        console.log(`✅ Video downloaded. It took: ${downloadedSeconds}second(s) for download process.`);
    //    }
    //
    //});
}

module.exports = function (app) {
    app.get('/target/:id', fetch_target_id);

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
