const fs = require('fs');
const readline = require('readline');
const ytdl = require('./ytdl-core/index');

const downloadAudio = (audioUrl, audioItag, filename, callback, onError) => {
  //Kill process if it takes more than 10min to return
  const timeout = setTimeout(() => {
    onError("Process took longer than expected")
    return
  }, 600000)
  const tempFilePath = `/tmp/${filename}.temp`;
  const outputFile = `/tmp/${filename}.m4a`;

  if (fs.existsSync(outputFile)) {
    // Same file of same quality already exists,
    // so return it instead of downloading a new one.
    clearTimeout(timeout)
    callback();
    return;
  }

  const audio = ytdl(audioUrl, { filter: (format) => format.itag === audioItag })
    .on("error", (error) => {
      clearTimeout(timeout);
      onError(`Error downloading audio: ${error.message}`);
      return
    })
  let downloaded = 0;

  audio.on('data', (chunk) => {
    downloaded += chunk.length;
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Downloading... ${(downloaded / 1024 / 1024).toFixed(2)}MB`);
  });

  audio.pipe(fs.createWriteStream(tempFilePath));

  audio.on('end', () => {
    process.stdout.write('\n\n');
    fs.renameSync(tempFilePath, outputFile);
    console.log('Download completed successfully.');
    clearTimeout(timeout)
    callback();
    return
  });

  audio.on('error', (error) => {
    fs.unlinkSync(tempFilePath); // Remove the temporary file
    clearTimeout(timeout)
    onError(error);
    return
  });
};

module.exports = downloadAudio;