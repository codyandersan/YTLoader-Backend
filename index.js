const express = require("express");
const ytdl = require("./ytdl-core/index");
const ytsr = require('ytsr');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const downloadVideo = require('./downloadVideo');
const deleteExpiredFiles = require('./cleanup');
const downloadAudio = require("./downloadAudio");


const app = express();

app.use(cors());

app.get("/", (req, res) => {
    res.status(200).send("Visit any endpoint!")
})
//No need, can diretly scrap the url with get_details
app.get("/get_audio", async (req, res) => {
    // Takes the Youtube video URL and the audio bitrate, returns the url
    // Eg: /get_audio?url=https://www.youtube.com/watch?v=g6fnFALEseI&bitrate=160


    // Get the YouTube video URL from the request body.
    const videoUrl = req.query.url

    const info = await ytdl.getInfo(videoUrl);
    const url = info.formats.find(format => format.hasAudio && format.audioBitrate === Number.parseInt(req.query.bitrate)).url;
    res.status(200).send({ success: true, url: url });

})

app.get("/get_details", async (req, res) => {
    // Takes the Youtube video URL and returns details
    // Eg: /get_details?url=https://www.youtube.com/watch?v=g6fnFALEseI


    // Get the YouTube video URL from the request body.
    const videoUrl = req.query.url

    const info = await ytdl.getInfo(videoUrl);
    res.status(200).send({
        success: true,
        details: {
            title: info.videoDetails.title,
            channel: info.videoDetails.author.name,
            embed_url: info.videoDetails.embed.iframeUrl,
            formats: info.formats
        }
    });

})

app.get("/search", async (req, res) => {
    // Takes the search query and returns the search results
    // Eg: /search?query=hello


    // Get the search query from the request body.
    const query = req.query.query
    if (!query) {
        res.status(400).send({
            success: false,
            message: "Please provide a search query"
        });
    }
    const results = await ytsr(query, { pages: 1, limit: 15 });
    res.status(200).send({
        success: true,
        results: results.items
    });
})

app.get("/download_video", (req, res) => {

    // Eg: /download_video?videoUrl=https://www.youtube.com/watch?v=8sLS2knUa6Y&videoItag=160&audioItag=251&filename=Phir%20Aur%20Kya%20Chahiye%20-%20YTLoader

    const videoUrl = req.query.videoUrl
    const audioItag = Number.parseInt(req.query.audioItag)
    const videoItag = Number.parseInt(req.query.videoItag)
    const filename = `${req.query.filename} (${audioItag}${videoItag})`
    //filename must not contain any extension
    downloadVideo(videoUrl, videoItag, audioItag, filename, () => {
        // The file was successfully created and merged
        console.log("Merge Successful")
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.mkv`);
        res.status(200).sendFile(path.join("/tmp", `${filename}.mkv`))
    }, (err) => {
        res.status(500).send({
            error: err
        })
    });



})

app.get("/download_audio", async (req, res) => {


    // Eg: `/download_audio?audioUrl=https://www.youtube.com/watch?v=8sLS2knUa6Y&audioItag=251&filename=Phir%20Aur%20Kya%20Chahiye%20-%20YTLoader`

    const audioUrl = req.query.audioUrl
    const audioItag = Number.parseInt(req.query.audioItag)
    const filename = `${req.query.filename} (${audioItag})`
    //filename must not contain any extension
    downloadAudio(audioUrl, audioItag, filename, () => {
        // The file was successfully created
        console.log("Download Successful")
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.m4a`);
        res.status(200).sendFile(path.join("/tmp", `${filename}.m4a`))
    }, (err) => {
        res.status(500).send({
            error: err
        })
    });
})


cron.schedule('0 * * * *', deleteExpiredFiles);
// * * * * * - every min
// 0 * * * * - every hour

const port = parseInt(process.env.PORT) || 8080;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
