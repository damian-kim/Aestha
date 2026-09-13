// Usage: node scripts/prepare-backgrounds.mjs path/to/generated-pngs
// Input files: alpine-photo.png, forest-photo.png, dunes-photo.png, stars-photo.png.
// Encodes web assets at native resolution; it does not upscale generated images.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Provide the directory containing generated PNG backgrounds.');
await mkdir('assets', { recursive:true });
for (const theme of ['alpine','forest','dunes','stars']) {
  const input = path.join(source,`${theme}-photo.png`);
  await sharp(input).webp({ quality:93, effort:6 }).toFile(`assets/${theme}-photo.webp`);
  await sharp(input).resize({ width:240 }).webp({ quality:82 }).toFile(`assets/${theme}-thumb.webp`);
  const {width,height} = await sharp(input).metadata();
  console.log(`${theme}: ${width} × ${height}`);
}
