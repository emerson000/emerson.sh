import fs from 'fs';
import path from 'path';
import { watch } from 'fs/promises';

const readdir = fs.promises.readdir;
const mkdir = fs.promises.mkdir;
const copyFile = fs.promises.copyFile;
const fileTypeRegex = /\.(jpg|jpeg|png|gif|webp|svg|json)$/i;

async function copyDir(src, dest) {
  try {
    await mkdir(dest, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      if (fileTypeRegex.test(entry.name)) {
        await copyFile(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
  }
}

async function watchDir(src, dest) {
  console.log(`Watching for content changes in ${src}...`);
  
  try {
    const watcher = watch(src, { recursive: true });
    
    for await (const event of watcher) {
      if (event.filename) {
        const srcPath = path.join(src, event.filename);
        const destPath = path.join(dest, event.filename);
        
        if (fileTypeRegex.test(event.filename)) {
          try {
            await fs.promises.access(srcPath);
            await mkdir(path.dirname(destPath), { recursive: true });
            await copyFile(srcPath, destPath);
            console.log(`Updated: ${srcPath} -> ${destPath}`);
          } catch (err) {
            if (err.code !== 'ENOENT') {
              console.error(`Error processing ${srcPath}:`, err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error watching directory:', err);
  }
}

async function main() {
  const contentDir = path.resolve(process.cwd(), 'content');
  const publicDir = path.resolve(process.cwd(), 'public');

  try {
    await copyDir(contentDir, publicDir);
    console.log('Content copied successfully!');
    
    const isDev = process.argv.includes('--watch');
    
    if (isDev) {
      await watchDir(contentDir, publicDir);
    }
  } catch (err) {
    console.error('Error copying content:', err);
    process.exit(1);
  }
}

main(); 