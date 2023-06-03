const fs = require('fs');
const path = require('path');

const tempDir = './downloads/';

function deleteExpiredFiles() {
  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temporary directory:', err);
      return;
    }

    const now = new Date();
    const minAge = 10 * 60 * 1000; // Minimum age of files: 10 minutes

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error reading file stats for ${file}:`, err);
          return;
        }
        

        const createTime = new Date(stats.ctime);
        const age = now - createTime;

        if (age > minAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${file}:`, err);
              return;
            }

            console.log(`Deleted file: ${file}`);
          });
        }
      });
    });
  });
}

module.exports = deleteExpiredFiles;
