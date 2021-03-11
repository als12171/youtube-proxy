const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ytwrappers = require('./youtube_wrappers.js');

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";

module.exports = function (app, cache, log) {
    app.get('/alexa/v3/search/:query', async function (req, res) {
        let query = new Buffer(req.params.query, 'base64').toString();

        let log_function = log.get("search-v3");
        let log_header = req.connection.remoteAddress + ': ';
        log_function.info(log_header + "Query is '" + query + "'");

        let metadata = await ytwrappers.search_one(query);
        if (metadata == null) {
            log_function.info(log_header + 'No results found');
            res.status(200).send({
                state: 'error',
                message: 'No results found'
            });
            return;
        }
        let id = metadata.id;
        let title = metadata.title;
        let url = YOUTUBE_URL_PREFIX + id;

        log_function.info(log_header + "Search result is '" + title + "' @ " + url);
        res.status(200).json({
            state: 'success',
            message: 'Found video result',
            video: {
                id: id,
                title: title,
                link: url
            }
        });
    });

    app.get('/alexa/v3/searchmany-ytsearch/:query', async function (req, res) {
        let log_function = log.get("searchmany-ytsearch-v3");
        let log_header = req.connection.remoteAddress + ': ';

        try {
            let query = req.params.query;

            log_function.info(log_header + "Query is '" + query + "'");

            let metadata = await ytwrappers.search_many_ytSearch(query);
            if (metadata == null) {
                log_function.info(log_header + 'No results found');
                res.status(200).send({
                    state: 'error',
                    message: 'No results found'
                });
                return;
            }

            log_function.info(log_header + "Found " + metadata.length + " videos");
            res.status(200).json({
                state: 'success',
                message: 'Found videos result',
                videos: metadata
            });
        } catch (e) {
            log_function.error(e);
            res.status(500).send({
                state: 'error',
                message: 'An error ocurred'
            });
        }
    });

    app.get('/alexa/v3/searchmany-ytlist/:query/:amount:nextPageToken?', async function (req, res) {
        let log_function = log.get("searchmany-ytlist-v3");
        let log_header = req.connection.remoteAddress + ': ';

        try {
            let query = req.params.query;
            let nextPageToken = req.params.nextPageToken;
            let amount = req.params.amount;

            log_function.info(log_header + "query is: " + query);
            log_function.info(log_header + "amount is: " + amount);
            if (nextPageToken) {
                log_function.info(log_header + "nextPageToken is: " + nextPageToken);
            } else {
                log_function.info(log_header + "nextPageToken not used.");
                nextPageToken = null;
            }

            log_function.info(log_header + "Query is '" + query + "'");

            let metadata = await ytwrappers.search_many_ytList(query, nextPageToken, amount);
            if (metadata == null) {
                log_function.info(log_header + 'No results found');
                res.status(200).send({
                    state: 'error',
                    message: 'No results found'
                });
                return;
            }

            log_function.info(log_header + "Found " + metadata.length + " videos");
            res.status(200).json(metadata);
        } catch (e) {
            log_function.error(e);
            res.status(500).send({
                state: 'error',
                message: 'An error ocurred'
            });
        }
    });

    app.get('/alexa/v3/details-ytsearch/:id', async function (req, res) {
        let log_function = log.get("details-ytsearch-v3");
        let log_header = req.connection.remoteAddress + ': ';

        try {
            let id = req.params.id;

            log_function.info(log_header + "getting video details for video with ID '" + id + "'");

            let metadata = await ytwrappers.get_video_details_ytSearch(id);
            if (metadata == null) {
                log_function.info(log_header + 'No results found');
                res.status(200).send({
                    state: 'error',
                    message: 'No results found'
                });
                return;
            }

            let videoId = metadata.id;
            let title = metadata.title;
            let url = YOUTUBE_URL_PREFIX + id;

            log_function.info(log_header + "Video details is '" + title + "' @ " + url);
            res.status(200).json({
                state: 'success',
                message: 'Video details found',
                video: {
                    id: videoId,
                    title: title,
                    link: url
                }
            });
        } catch (e) {
            log_function.error(e);
            res.status(500).send({
                state: 'error',
                message: 'An error ocurred'
            });
        }
    });

    app.get('/alexa/v3/details-ytlist/:id', async function (req, res) {
        let log_function = log.get("details-ytlist-v3");
        let log_header = req.connection.remoteAddress + ': ';

        try {
            let id = req.params.id;

            log_function.info(log_header + "getting video details for video with ID '" + id + "'");

            let metadata = await ytwrappers.get_video_details_ytList(id);
            if (metadata == null) {
                log_function.info(log_header + 'No results found');
                res.status(200).send({
                    state: 'error',
                    message: 'No results found'
                });
                return;
            }

            log_function.info(log_header + "Video details is '" + metadata.snippet.title + "'");
            res.status(200).json(metadata);
        } catch (e) {
            log_function.error(e);
            res.status(500).send({
                state: 'error',
                message: 'An error ocurred'
            });
        }
    });

    app.get('/alexa/v3/download/:id', function (req, res) {
        let id = req.params.id;
        let url = YOUTUBE_URL_PREFIX + id;

        let log_function = log.get("download-v3");
        let log_header = req.connection.remoteAddress + ': ';
        log_function.info(log_header + "Download requested for video with ID '" + id + "'");

        if (id in cache) {
            log_function.info(log_header + "Cache hit.");
        } else {
            log_function.info(log_header + "Cache miss. Starting download ...");
            cache[id] = {
                downloaded: false
            };
            let output_file = path.join(__dirname, '..', 'public', 'site', id + '.m4a');
            let writer = fs.createWriteStream(output_file);
            ytdl(url, {
                filter: 'audioonly',
                quality: '140'
            }).pipe(writer);
            writer.on('finish', function () {
                log_function.info(log_header + "Finished download of video " + id + ".");
                cache[id]['downloaded'] = true;
            });
        }

        res.status(200).json({
            state: 'success',
            message: 'Beginning download process.',
            link: '/site/' + id + '.m4a'
        });
    });

    app.get('/alexa/v3/cache/:id', function (req, res) {
        let id = req.params.id;
        if (id in cache) {
            if (cache[id]['downloaded']) {
                res.status(200).send({
                    state: 'success',
                    message: 'Downloaded',
                    downloaded: true
                });
            } else {
                res.status(200).send({
                    state: 'success',
                    message: 'Download in progress',
                    downloaded: false
                });
            }
        } else {
            res.status(200).send({
                state: 'success',
                message: 'Not in cache'
            });
        }
    });
}
