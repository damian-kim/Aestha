// Usage: node scripts/prepare-backgrounds.mjs path/to/generated-pngs
// Input files: alpine-photo.png, forest-photo.png, dunes-photo.png, stars-photo.png.
// Encodes web assets at native resolution; it does not upscale generated images.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { THEME_IDS } from '../themes.js';
const imageArg = process.argv.indexOf('--image');
if (imageArg !== -1) {
  const input = process.argv[imageArg + 1];
  const theme = process.argv[process.argv.indexOf('--theme') + 1];
  if (!THEME_IDS.includes(theme) || theme === 'paper') throw new Error('Unknown generated theme.');
  await mkdir('assets', { recursive:true });
  await sharp(input).webp({ quality:93, effort:6 }).toFile(`assets/${theme}-photo.webp`);
  await sharp(input).resize({ width:240 }).webp({ quality:82 }).toFile(`assets/${theme}-thumb.webp`);
  const {width,height} = await sharp(input).metadata();
  console.log(`${theme}: ${width} × ${height}`);
  process.exit(0);
}
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
