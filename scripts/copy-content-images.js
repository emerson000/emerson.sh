import fs from 'fs';
import path from 'path';
import { watch } from 'fs/promises';

const readdir = fs.promises.readdir;
const mkdir = fs.promises.mkdir;
const copyFile = fs.promises.copyFile;

async function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
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
      // Only copy image files
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
        await copyFile(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
  }
}

async function watchDir(src, dest) {
  console.log(`Watching for image changes in ${src}...`);
  
  try {
    const watcher = watch(src, { recursive: true });
    
    for await (const event of watcher) {
      if (event.filename) {
        const srcPath = path.join(src, event.filename);
        const destPath = path.join(dest, event.filename);
        
        // Check if it's an image file
        if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(event.filename)) {
          try {
            // Check if source file exists (for rename/delete events)
            await fs.promises.access(srcPath);
            
            // Ensure destination directory exists
            await mkdir(path.dirname(destPath), { recursive: true });
            
            // Copy the file
            await copyFile(srcPath, destPath);
            console.log(`Updated: ${srcPath} -> ${destPath}`);
          } catch (err) {
            // File might have been deleted
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
    // First do an initial copy
    await copyDir(contentDir, publicDir);
    console.log('Content images copied successfully!');
    
    // Check if we're in watch mode (dev)
    const isDev = process.argv.includes('--watch');
    
    if (isDev) {
      // Watch for changes
      await watchDir(contentDir, publicDir);
    }
  } catch (err) {
    console.error('Error copying content images:', err);
    process.exit(1);
  }
}

main(); 