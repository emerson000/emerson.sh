import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icon (32x32)
function createIcon(size = 32) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.75}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size/2, size/2);
  
  return canvas.toBuffer('image/png');
}

// Create apple icon (180x180)
function createAppleIcon(size = 180) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background with rounded corners
  ctx.fillStyle = 'black';
  const radius = size * 0.22; // 22% border radius
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.fill();
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.67}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size/2, size/2);
  
  return canvas.toBuffer('image/png');
}

// Ensure public directory exists
const publicDir = path.join(path.dirname(__dirname), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate and save icons
fs.writeFileSync(path.join(publicDir, 'icon.png'), createIcon(32));
fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), createAppleIcon(180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createIcon(32));

console.log('Icons generated successfully!'); 