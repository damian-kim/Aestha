import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { THEMES, themeThumbnail } from '../themes.js';
const width=1200, tileWidth=240, tileHeight=164;
const layers=[];
for(const [index,theme] of THEMES.entries()) {
  const left=(index%5)*tileWidth, top=Math.floor(index/5)*tileHeight;
  layers.push({input:await sharp(`.${themeThumbnail(theme.id)}`).resize(240,135,{fit:'cover'}).toBuffer(),left,top});
  const name=theme.name.replaceAll('&','&amp;').replaceAll('<','&lt;');
  const label=Buffer.from(`<svg width="240" height="29"><rect width="240" height="29" fill="#f6f4eb"/><text x="10" y="19" font-family="Segoe UI,sans-serif" font-size="11" fill="#242b24">${String(index+1).padStart(2,'0')} · ${name}</text></svg>`);
  layers.push({input:label,left,top:top+135});
}
await mkdir('design',{recursive:true});
await sharp({create:{width,height:Math.ceil(THEMES.length/5)*tileHeight,channels:3,background:'#f6f4eb'}}).composite(layers).webp({quality:90}).toFile('design/background-contact-sheet.webp');
console.log('Saved design/background-contact-sheet.webp');
