const fs = require('fs');
const path = require('path');


const fileTypeMapping = {
  Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
  Documents: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'],
  Videos: ['.mp4', '.mkv', '.avi', '.mov', '.wmv'],
  Others: []
};


async function organizeFiles(dirPath) {
  try {
   
    if (!fs.existsSync(dirPath)) {
      console.error(`The directory "${dirPath}" does not exist.`);
      return;
    }

    console.log(`Organizing files in directory: ${dirPath}`);
    const files = await fs.promises.readdir(dirPath);
    const summary = [];

    if (files.length === 0) {
      console.warn('No files found in the directory to organize.');
      return;
    }

    for (const file of files) {
      const filePath = path.join(dirPath, file);

      
      const stats = await fs.promises.stat(filePath);
      if (!stats.isFile()) continue;

      
      const ext = path.extname(file).toLowerCase();
      let folderName = 'Others';

      
      for (const [key, extensions] of Object.entries(fileTypeMapping)) {
        if (extensions.includes(ext)) {
          folderName = key;
          break;
        }
      }

      
      const folderPath = path.join(dirPath, folderName);
      if (!fs.existsSync(folderPath)) {
        console.log(`Creating folder: ${folderPath}`);
        await fs.promises.mkdir(folderPath);
      }

      
      const destination = path.join(folderPath, file);
      console.log(`Moving: ${file} -> ${folderName}`);
      await fs.promises.rename(filePath, destination);

      summary.push(`Moved: ${file} -> ${folderName}`);
    }

   
    const summaryPath = path.join(dirPath, 'summary.txt');
    if (summary.length > 0) {
      console.log('Writing summary file...');
      await fs.promises.writeFile(summaryPath, summary.join('\n'), 'utf8');
      console.log(`Summary saved to: ${summaryPath}`);
    } else {
      console.log('No files were moved; summary file will not be created.');
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}


const userDirPath = process.argv[2]; 
if (!userDirPath) {
  console.error('Please provide a directory path.');
  process.exit(1);
}

organizeFiles(userDirPath);
