import { test, expect } from '@playwright/test';
const enter=async page=>{await page.goto('/');await page.getByRole('button',{name:'Stay here'}).click();};
const settings=async page=>{await page.mouse.move(400,719);await expect(page.locator('#settings-zone')).toHaveClass(/open/);};
test.use({ viewport:{width:1280,height:720} });
test('first visit has fullscreen, then a centered frame and hidden settings',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
  await expect(page.getByRole('button',{name:'Enter fullscreen'})).toBeVisible();
  await page.screenshot({path:'test-results/welcome-desktop.png'});
  await page.getByRole('button',{name:'Stay here'}).click();
  const b=await page.locator('#timer-box').boundingBox();expect(b.x+b.width/2).toBe(640);expect(b.y+b.height/2).toBe(360);
  await expect(page.locator('#settings-panel')).toHaveCSS('opacity','0');await page.reload();await expect(page.locator('#welcome')).toBeHidden();expect(errors).toEqual([]);
});
test('settings reveal on hover, save changes and disappear after interaction',async({page})=>{
  await enter(page);await settings(page);await page.getByRole('button',{name:'Dunes background'}).click();await page.locator('#font').selectOption('mono');
  await page.screenshot({path:'test-results/settings-desktop.png'});
  await page.mouse.move(10,10);await expect(page.locator('#settings-panel')).toHaveCSS('opacity','0');
  await page.reload();await expect(page.locator('#landscape')).toHaveCSS('background-image',/dunes/);await expect(page.locator('#font')).toHaveValue('mono');
});
test('stopwatch runs, pauses and survives reload',async({page})=>{
  await page.clock.install();await enter(page);await page.locator('#timer-box').hover();await page.locator('#toggle').click();await page.clock.fastForward(65000);
  await expect(page.locator('#time')).toHaveText('01:05');await page.locator('#toggle').click();await page.clock.fastForward(10000);await expect(page.locator('#time')).toHaveText('01:05');
  await page.reload();await expect(page.locator('#time')).toHaveText('01:05');
});
test('countdown validates zero and completes silently',async({page})=>{
  await page.clock.install();await enter(page);await page.locator('#mode-trigger').click();await page.locator('[data-mode="timer"]').click();await page.locator('#minutes').fill('0');await page.locator('#apply-mode').click();await expect(page.locator('#mode-error')).toContainText('longer than zero');
  await page.locator('#seconds').fill('3');await page.locator('#apply-mode').click();await page.locator('#timer-box').hover();await page.locator('#toggle').click();await page.clock.fastForward(4000);
  await expect(page.locator('#time')).toHaveText('00:00');await expect(page.locator('#notification')).toContainText('timer is complete');
});
test('modes configure Pomodoro, alarm and clock',async({page})=>{
  await enter(page);await page.locator('#mode-trigger').click();await page.locator('[data-mode="pomodoro"]').click();await page.locator('#focus').fill('30');await page.locator('#apply-mode').click();await expect(page.locator('#time')).toHaveText('30:00');
  await page.locator('#mode-trigger').click();await page.locator('[data-mode="alarm"]').click();await page.locator('#alarm-time').fill('16:15');await expect(page.locator('#alarm-preview')).toContainText('Next:');await page.locator('#apply-mode').click();await expect(page.locator('#phase')).toContainText('Set for');
  await page.locator('#mode-trigger').click();await page.locator('[data-mode="clock"]').click();await page.locator('#clock24').check();await page.locator('#clock-seconds').uncheck();await page.locator('#apply-mode').click();await expect(page.locator('#timer-actions')).toBeHidden();await expect(page.locator('#time')).toHaveText(/^\d{2}:\d{2}$/);
});
test('frame drags, resizes, persists and resets',async({page})=>{
  await enter(page);const before=await page.locator('#timer-box').boundingBox();
  await page.mouse.move(before.x+20,before.y+20);await page.mouse.down();await page.mouse.move(before.x+100,before.y+50);await page.mouse.up();
  const moved=await page.locator('#timer-box').boundingBox();expect(moved.x).toBe(before.x+80);
  await page.mouse.move(moved.x+moved.width,moved.y+moved.height);await page.mouse.down();await page.mouse.move(moved.x+moved.width+70,moved.y+moved.height+40);await page.mouse.up();
  const resized=await page.locator('#timer-box').boundingBox();expect(resized.width).toBe(before.width+70);await page.reload();expect((await page.locator('#timer-box').boundingBox()).width).toBe(resized.width);
  await settings(page);await page.getByRole('button',{name:'Reset settings'}).click();expect((await page.locator('#timer-box').boundingBox()).width).toBe(510);await page.getByRole('button',{name:'Undo',exact:true}).click();expect((await page.locator('#timer-box').boundingBox()).width).toBe(resized.width);
});
test('fullscreen enters and exits',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Enter fullscreen'}).click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);await expect(page.locator('#welcome')).toBeHidden();
  await page.evaluate(()=>document.exitFullscreen());await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(false);
});
test('mobile fits the viewport and supports touch settings',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await page.screenshot({path:'test-results/welcome-mobile.png'});await page.getByRole('button',{name:'Stay here'}).click();
  const b=await page.locator('#timer-box').boundingBox();expect(b.x).toBeGreaterThanOrEqual(16);expect(b.x+b.width).toBeLessThanOrEqual(374);
  await page.locator('#edge-access').click();await page.getByRole('button',{name:'Stars background'}).click();await page.screenshot({path:'test-results/settings-mobile.png'});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});
test('unavailable or corrupt storage does not stop the app',async({page})=>{
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('Unavailable');};});await page.goto('/');await page.getByRole('button',{name:'Stay here'}).click();await settings(page);await expect(page.locator('#storage-note')).toContainText('temporary');
});
