const fs = require('fs');
const path = require('path');

// const inputDir = './data/content';
// const outputDir = './data/sources';

const inputDir = './data/sources';
const outputDir = './data/content-2';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdir(inputDir, (err, files) => {

  if (err) {
    console.error('Error reading input directory:', err);
    return;
  }

  files.forEach(file => {
    const filePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, file);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      let modifiedData = data;

      modifiedData = modifiedData.replace(/^> info \*\*(.*)\*\* (.*)$/gm, ':::info **$1**\n$2\n:::');
      modifiedData = modifiedData.replace(/^> warning \*\*(.*)\*\* (.*)$/gm, ':::warning **$1**\n$2\n:::');
      modifiedData = modifiedData.replace(/^> \*\*Warning\*\* (.*)$/gm, ':::danger **Warning**\n$1\n:::');

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
