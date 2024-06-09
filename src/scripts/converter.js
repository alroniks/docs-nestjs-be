const fs = require('fs');
const path = require('path');

const inputDir = './data/content';
const outputDir = './data/sources';

function handleFilesInDirectory(inputDir, outputDir) {

  console.log("Processing directory: ", inputDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.readdir(inputDir, { withFileTypes: true }, (err, files) => {

    if (err) {
      console.error('Error reading input directory:', err);
      return;
    }

    files
      .filter(dirent => !dirent.isDirectory() && path.extname(dirent.name) == '.md')
      .map(dirent => dirent.name)
      .forEach(file => {
        const filePath = path.join(inputDir, file);
        const outputFilePath = path.join(outputDir, file);

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${file}:`, err);
            return;
          }

          let modifiedData = data;

          modifiedData = modifiedData.replace(/<img\s+[^>]*[^\/]>/gm, '<img $1 />');

          modifiedData = modifiedData.replace(/^> info \*\*(.*)\*\* (.*)$/gm, ':::info **$1**\n\n$2\n\n:::');
          modifiedData = modifiedData.replace(/^> warning \*\*(.*)\*\* (.*)$/gm, ':::warning **$1**\n\n$2\n\n:::');
          modifiedData = modifiedData.replace(/^> \*\*Warning\*\* (.*)$/gm, ':::danger **Warning**\n\n$1\n\n:::');

          modifiedData = modifiedData.replace(/^###\s/gm, `# `);
          modifiedData = modifiedData.replace(/^####\s/gm, `## `);

          fs.writeFile(outputFilePath, modifiedData, 'utf8', err => {
            if (err) {
              console.error(`Error writing file ${file}:`, err);
              return;
            }

            console.log(`File ${file} processed successfully.`);
          });
        });
    });
  });
}

handleFilesInDirectory(inputDir, outputDir);

fs.readdir(inputDir, { withFileTypes: true }, (err, files) => {
  files.filter(e => e.isDirectory()).forEach(file => {
    handleFilesInDirectory(
      path.join(inputDir, file.name),
      path.join(outputDir, file.name)
    );
  });
});
