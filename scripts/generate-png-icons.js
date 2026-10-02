import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, color) {
  // Color RGBA
  const [r, g, b, a] = color;
  
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6 = RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // IDAT chunk (raw pixel data)
  const rowSize = width * 4 + 1; // 1 byte for filter type 0
  const rawData = Buffer.alloc(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      // Add gradient or accent center box
      const isCenter = (x > width * 0.25 && x < width * 0.75 && y > height * 0.25 && y < height * 0.75);
      if (isCenter) {
        rawData[idx] = 255;     // R
        rawData[idx + 1] = 255; // G
        rawData[idx + 2] = 255; // B
        rawData[idx + 3] = 255; // A
      } else {
        rawData[idx] = r;
        rawData[idx + 1] = g;
        rawData[idx + 2] = b;
        rawData[idx + 3] = a;
      }
    }
  }
  
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  
  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('./public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Brand indigo color [79, 70, 229, 255]
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, [79, 70, 229, 255]));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, [79, 70, 229, 255]));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, [79, 70, 229, 255]));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, [79, 70, 229, 255]));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32, [79, 70, 229, 255]));

console.log('PWA icons successfully generated in public/');
