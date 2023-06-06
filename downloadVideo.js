// const cp = require('child_process');
// const readline = require('readline');
// const fs = require('fs');
// const ytdl = require('./ytdl-core/index');
// const ffmpeg = require('ffmpeg-static');

// const downloadVideo = (videoUrl, videoItag, audioItag, filename, callback, onError) => {
//     const tempFilePath = `./${filename}.temp`;
//     const outputFilePath = `./${filename}.mkv`;

//     if (fs.existsSync(outputFilePath)) {
//         // Same file of same quality already exists,
//         // so return it instead of downloading a new one.
//         callback();
//         return;
//     }

//     const audio = ytdl(videoUrl, { filter: (format) => format.itag === audioItag });
//     const video = ytdl(videoUrl, { filter: (format) => format.itag === videoItag });

//     const tracker = {
//         start: Date.now(),
//         audio: { downloaded: 0, total: Infinity },
//         video: { downloaded: 0, total: Infinity },
//         merged: { frame: 0, speed: '0x', fps: 0 },
//     };

//     let progressbarHandle = null;
//     const progressbarInterval = 1000;
//     const showProgress = () => {
//         readline.cursorTo(process.stdout, 0);
//         const toMB = (i) => (i / 1024 / 1024).toFixed(2);

//         process.stdout.write(`Audio  | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
//         process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

//         process.stdout.write(`Video  | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
//         process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

//         process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
//         process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

//         process.stdout.write(`Running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
//         readline.moveCursor(process.stdout, 0, -3);
//     };

//     const ffmpegArgs = [
//         '-loglevel', '8', '-hide_banner',
//         '-progress', 'pipe:3',
//         '-i', 'pipe:4',
//         '-i', 'pipe:5',
//         '-map', '0:a',
//         '-map', '1:v',
//         '-c:v', 'copy',
//         tempFilePath,
//     ];

//     const ffmpegProcess = cp.spawn(ffmpeg, ffmpegArgs, {
//         windowsHide: true,
//         stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe'],
//     });

//     ffmpegProcess.on('close', (code) => {
//         if (code === 0) {
//             fs.renameSync(tempFilePath, outputFilePath);
//             console.log('File created and merged successfully.');
//             process.stdout.write('\n\n\n\n');
//             clearInterval(progressbarHandle);
//             callback();
//         } else {
//             console.log('Error creating or merging the file.');
//             process.stdout.write('\n\n\n\n');
//             clearInterval(progressbarHandle);
//             onError('Error creating or merging the file.');
//         }
//     });

//     ffmpegProcess.on('error', (error) => {
//         console.log('FFmpeg process error:', error);
//         fs.unlinkSync(tempFilePath); // Removing the temporary file
//         onError(error);
//     });

//     ffmpegProcess.stdio[3].on('data', (chunk) => {
//         if (!progressbarHandle) progressbarHandle = setInterval(showProgress, progressbarInterval);
//         const lines = chunk.toString().trim().split('\n');
//         const args = {};
//         for (const line of lines) {
//             const [key, value] = line.split('=');
//             args[key.trim()] = value.trim();
//         }
//         tracker.merged = args;
//     });

//     audio.pipe(ffmpegProcess.stdio[4]);
//     video.pipe(ffmpegProcess.stdio[5]);
// };

// module.exports = downloadVideo;

const cp = require('child_process');
const readline = require('readline');
const fs = require('fs');
const ytdl = require('./ytdl-core/index');
const ffmpeg = require('ffmpeg-static');

const downloadVideo = (videoUrl, videoItag, audioItag, filename, callback, onError) => {
    // Check if the file already exists
    try {

        const tempFilePath = `./${filename}.temp`;

        if (fs.existsSync(`./${filename}.mkv`)) {
            // Same file of same quality already exists,
            // so return it instead of downloading a new one.
            callback();
            return;
        }

        // Get audio and video streams
        const audio = ytdl(videoUrl, { filter: (format) => format.itag === audioItag });
        const video = ytdl(videoUrl, { filter: (format) => format.itag === videoItag });

        const tracker = {
            start: Date.now(),
            audio: { downloaded: 0, total: Infinity },
            video: { downloaded: 0, total: Infinity },
            merged: { frame: 0, speed: '0x', fps: 0 },
        };

        let progressbarHandle = null;
        const progressbarInterval = 1000;
        const showProgress = () => {
            readline.cursorTo(process.stdout, 0);
            const toMB = (i) => (i / 1024 / 1024).toFixed(2);

            process.stdout.write(
                `Audio  | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `
            );
            process.stdout.write(
                `(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`
            );

            process.stdout.write(
                `Video  | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `
            );
            process.stdout.write(
                `(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`
            );

            process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
            process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

            process.stdout.write(`Running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
            readline.moveCursor(process.stdout, 0, -3);
        };

        const ffmpegProcess = cp.spawn(ffmpeg, [
            '-loglevel', '8', '-hide_banner',
            '-progress', 'pipe:3',
            '-i', 'pipe:4',
            '-i', 'pipe:5',
            '-map', '0:a',
            '-map', '1:v',
            '-c:v', 'copy',
            tempFilePath
        ], {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe', 'pipe',
            ],
        });

        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                fs.renameSync(tempFilePath, `./${filename}.mkv`);
                console.log('File created and merged successfully.');
                process.stdout.write('\n\n\n\n');
                clearInterval(progressbarHandle);
                callback();
                return

            } else {
                console.log('Error creating or merging the file.');
                process.stdout.write('\n\n\n\n');
                clearInterval(progressbarHandle);
                onError('Error creating or merging the file.');
                return
            }
        });

        ffmpegProcess.on('error', (error) => {
            console.log('FFmpeg process error:', error);
            fs.unlinkSync(tempFilePath); // Removing the temporary file
            onError(error);
            return
        });

        ffmpegProcess.stdio[3].on('data', (chunk) => {
            if (!progressbarHandle) progressbarHandle = setInterval(showProgress, progressbarInterval);
            const lines = chunk.toString().trim().split('\n');
            const args = {};
            for (const l of lines) {
                const [key, value] = l.split('=');
                args[key.trim()] = value.trim();
            }
            tracker.merged = args;
        });

        audio.pipe(ffmpegProcess.stdio[4]);
        video.pipe(ffmpegProcess.stdio[5]);

    } catch (error) {
        onError(error)
        return
    }
};

module.exports = downloadVideo