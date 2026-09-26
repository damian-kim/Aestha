import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { THEMES, THEME_IDS, CATEGORIES, themeImage, themeThumbnail } from '../themes.js';
import { readPreferences } from '../time.js';

test('collection contains 53 distinct choices including NYC variants',()=>{
  assert.equal(THEMES.length,53);assert.equal(new Set(THEME_IDS).size,53);
  for(const id of ['outer-space','stars','beach','fireplace','window-desk','lofi-girl','mount-fuji','nyc-morning','nyc-autumn','nyc-winter']) assert.ok(THEME_IDS.includes(id),id);
  for(const theme of THEMES) {assert.ok(CATEGORIES.includes(theme.category));assert.equal(readPreferences({theme:theme.id}).theme,theme.id);}
});
test('every gallery entry has a real full-resolution image and lightweight thumbnail',async()=>{
  const hashes=new Set();
  for(const theme of THEMES) {
    const full=await readFile(`.${themeImage(theme.id)}`);
    const thumb=await readFile(`.${themeThumbnail(theme.id)}`);
    const hash=createHash('sha256').update(full).digest('hex');
    assert.ok(!hashes.has(hash),`Duplicate image: ${theme.id}`);hashes.add(hash);
    const dimensions=await sharp(full).metadata();
    assert.ok(dimensions.width>=1600,`${theme.id} must have a high-resolution image`);
    if(theme.id!=='paper') {
      assert.equal(dimensions.format,'webp');
      const preview=await sharp(thumb).metadata();assert.equal(preview.width,240);
      assert.ok(thumb.byteLength<50000,`${theme.id} thumbnail too large`);
    }
  }
});
