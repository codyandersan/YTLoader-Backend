const express = require("express");
const ytdl = require("ytdl-core");
const ytsr = require('ytsr');
const cors = require('cors');
const axios = require('axios');

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

app.get('/download', async (req, res) => {
    try {
      const videoUrl = "https://rr8---sn-gwpa-a3vs.googlevideo.com/videoplayback?expire=1685629156&ei=hFR4ZOznHoWYvcAP-K29yAM&ip=65.2.121.204&id=o-ADd2IQ4xeLjjlP_EJwzdB3j9ObM-kk9dDqlkuXUbAA0_&itag=251&source=youtube&requiressl=yes&vprv=1&svpuc=1&mime=audio%2Fwebm&ns=1W_wdLjyXw0JRs4PN5npepkN&gir=yes&clen=3802466&dur=219.061&lmt=1680123433533186&keepalive=yes&fexp=24007246,24350017,24363393,51000014&beids=24350017&c=WEB&txp=4532434&n=VzwA4JUeYX1gzg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Csvpuc%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRAIgV3ZskxKmh2fk2WMTyiH2_4w2Q2S2GCRFVv39WYRooZsCIGh_1hw1sHMsuM--JtFNqb_qlxpOpEn7xohdXuaGR13e&redirect_counter=1&rm=sn-cvhzr7s&req_id=c781176e6e7a3ee&cms_redirect=yes&cmsv=e&ipbypass=yes&mh=eX&mip=47.9.75.160&mm=31&mn=sn-gwpa-a3vs&ms=au&mt=1685607183&mv=m&mvi=8&pcm2cms=yes&pl=19&lsparams=ipbypass,mh,mip,mm,mn,ms,mv,mvi,pcm2cms,pl&lsig=AG3C_xAwRQIhAK155HFfA1zye0hieCpGt1qYZfvoFO4PnJBcKBsOPABJAiA6rQv_MdUGM6r3x1pBnpHyNi0E8jeY8ui6VW506KpC4g%3D%3D"; // Replace with the actual URL of the video
      const response = await axios.get(videoUrl, { responseType: 'stream' });
      const fileSize = response.headers['content-length'];

      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      res.setHeader('Content-Type', response.headers['content-type']);
      res.setHeader('Content-Length', fileSize);

      response.data.pipe(res);
    } catch (error) {
      console.error('Error occurred while downloading the video:', error);
      res.status(500).send('Failed to download the video');
    }
  });

  
const port = parseInt(process.env.PORT) || 8080;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});