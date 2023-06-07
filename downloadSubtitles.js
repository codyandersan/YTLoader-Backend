const fs = require('fs');
const path = require('path');
const https = require('https');
const ytdl = require('./ytdl-core/index');
// const ffmpeg = require('ffmpeg-static');
// const { spawn } = require('child_process');

const downloadSubtitles = (url, callback, onError) => {
    // returns the filename to callback

    const lang = 'en';

    // Can be xml, ttml, vtt, srv1, srv2, srv3
    const format = 'xml';

    ytdl.getInfo(url).then(info => {
        if (!info.player_response.captions) {
            onError('No captions found for this video');
            return
        }
        const tracks = info
            .player_response.captions
            .playerCaptionsTracklistRenderer.captionTracks;
        if (tracks && tracks.length) {
            console.log('Found captions for',
                tracks.map(t => t.name.simpleText).join(', '));
            const track = tracks.find(t => t.languageCode === lang);
            if (track) {
                console.log('Retrieving captions:', track.name.simpleText);
                console.log('URL', track.baseUrl);

                const output = `${info.videoDetails.title.substring(0, 15)} - YTLoader (${track.languageCode}).${format}`;

                const fileStream = fs.createWriteStream(path.join("/tmp", output));

                https.get(`${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`, res => {
                    res.pipe(fileStream);
                });
                fileStream.on('finish', () => {
                    console.log('Subtitle saved');
                    callback(output); // Execute the callback once the subtitle is saved
                    return
                });
            } else {
                onError('Could not find captions for', lang);
                return
            }
        } else {
            onError('No captions found for this video');
            return
        }
    });
}

// const addSubtitles = (filename, url) => {

//     downloadSubtitles(url, (output) => {

//         const originalPath = `/tmp/${filename}.mkv`
//         const subtitlesFilePath = `/tmp/${output}`
//         const tempPath = `/tmp/${filename} - temp.mkv`;

//         fs.renameSync(originalPath, tempPath)

//         const ffmpegArgs = [
//             '-i', tempPath,
//             '-i', subtitlesFilePath,
//             '-c', 'copy',
//             originalPath
//         ];

//         const ffmpegProcess = spawn(ffmpeg, ffmpegArgs);

//         ffmpegProcess.stdout.on('data', (data) => {
//             console.log(`stdout: ${data}`);
//         });

//         ffmpegProcess.stderr.on('data', (data) => {
//             console.error(`stderr: ${data}`);
//         });

//         ffmpegProcess.on('close', (code) => {
//             console.log(`ffmpeg process exited with code ${code}`);
//         });
//     })
// }

// addSubtitles("Phir Aur Kya Chahiye - YTLoader (251160)", "https://www.youtube.com/watch?v=8sLS2knUa6Y")

module.exports = downloadSubtitles