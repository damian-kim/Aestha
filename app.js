import { DEFAULTS, clamp, readPreferences, readSession, freshSession, milliseconds, nextAlarm, toggleSession, advanceSession, formatDuration, phaseName } from './time.js';

const $ = id => document.getElementById(id);
const PREFS_KEY = 'rubato.preferences.v1', SESSION_KEY = 'rubato.session.v1';
function load(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function save(key, value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { $('storage-note').textContent='Preferences are temporary; browser storage is unavailable.'; } }
// Read the original keys once so the rename preserves existing preferences and timers.
const savedPreferences = load(PREFS_KEY);
let prefs = readPreferences(savedPreferences ?? load('aestha.preferences.v1'));
let session = readSession(savedPreferences ? load(SESSION_KEY) : load('aestha.session.v1'),prefs);
let pendingMode = prefs.mode;
let drag = null, noticeTimeout, settingsTimeout;
const fonts = { serif:"Georgia, 'Times New Roman', serif", sans:"'DM Sans', sans-serif", mono:"'DM Mono', monospace", light:"Manrope, sans-serif" };
const names = {stopwatch:'Stopwatch',timer:'Timer',pomodoro:'Pomodoro',alarm:'Alarm',clock:'Clock'};
const themes = {alpine:'Alpine',forest:'Forest',stars:'Stars',dunes:'Dunes',paper:'Paper'};
const themeImage = id => id === 'paper' ? '/assets/paper.svg' : `/assets/${id}-photo.webp`;
const themeThumbnail = id => id === 'paper' ? '/assets/paper.svg' : `/assets/${id}-thumb.webp`;
const box = $('timer-box');
const canvas = document.createElement('canvas');
const measure = canvas.getContext('2d');

function persist() { save(PREFS_KEY,prefs); save(SESSION_KEY,session); }
function notify(message, duration=5000) {
  clearTimeout(noticeTimeout); $('notification-text').textContent=message; $('notification').hidden=false;
  if (duration) noticeTimeout=setTimeout(()=>$('notification').hidden=true,duration);
}
function applyPreferences() {
  $('landscape').style.backgroundImage=`url('${themeImage(prefs.theme)}')`;
  document.documentElement.style.setProperty('--timer-font',fonts[prefs.font]);
  document.documentElement.dataset.tone=prefs.tone;
  $('text-tone').value=prefs.tone;
  $('font').value=prefs.font; $('font-size').value=prefs.fontSize; $('size-label').textContent=`${prefs.fontSize} px`;
  document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===prefs.theme)));
  applyFrame(); render();
}
function applyFrame() {
  const w = Math.min(prefs.frame.width,innerWidth-32), h = Math.min(prefs.frame.height,innerHeight-48);
  const left = clamp(prefs.frame.x*innerWidth-w/2,16,innerWidth-w-16);
  const top = clamp(prefs.frame.y*innerHeight-h/2,24,innerHeight-h-24);
  Object.assign(box.style,{width:`${w}px`,height:`${h}px`,left:`${left}px`,top:`${top}px`});
}
function fitText() {
  const size=prefs.fontSize;
  measure.font=`${size}px ${fonts[prefs.font]}`;
  const width=measure.measureText($('time').textContent).width;
  const actual=Math.min(size,size*(box.clientWidth-40)/Math.max(width,1),(box.clientHeight-105)*.9);
  $('time').style.fontSize=`${Math.max(16,actual)}px`;
  $('time').style.fontWeight=prefs.font==='light'?'200':'400';
}
function clockString(now, alarm=false) {
  if (alarm) {
    const [h,m]=prefs.alarm.split(':').map(Number);
    return prefs.clock24 ? prefs.alarm : `${String(h%12||12).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  return new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit',...(prefs.seconds?{second:'2-digit'}:{}),hour12:!prefs.clock24}).format(now).replace(/\s?[AP]M$/,'');
}
function render(now=Date.now()) {
  let text, phase='';
  if (prefs.mode==='clock') {
    text=clockString(now); phase=prefs.clock24?'':new Date(now).getHours()<12?'AM':'PM';
  } else if (prefs.mode==='alarm') {
    text=clockString(now,true);
    const suffix=prefs.clock24?'':Number(prefs.alarm.slice(0,2))<12?' AM':' PM';
    phase=session.running?`Set for ${new Date(session.deadline).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}${suffix}`:session.finished?'Alarm reached':`Not set${suffix}`;
  } else {
    text=formatDuration(milliseconds(session,now),prefs.mode!=='stopwatch');
    if (prefs.mode==='pomodoro') phase=`${phaseName(session.phase)}${session.finished?' · complete':''}`;
    else if (session.finished) phase='Time is yours.';
  }
  if ($('time').textContent!==text) {$('time').textContent=text; fitText();}
  $('mode-label').textContent=names[prefs.mode]; $('phase').textContent=phase;
  box.dataset.finished=String(session.finished);
  $('timer-actions').hidden=prefs.mode==='clock';
  const label=prefs.mode==='alarm'?(session.running?'Cancel alarm':session.finished?'Set again':'Set alarm'):session.running?'Pause':session.finished?(prefs.mode==='pomodoro'?'Next session':'Start again'):(session.elapsed>0 || (prefs.mode==='timer' && session.remaining<prefs.duration*1000))?'Resume':'Start';
  $('toggle').querySelector('span').textContent=label;
  $('toggle').querySelector('path').setAttribute('d',session.running?'M5 3v10M11 3v10':'m5 3 8 5-8 5Z');
  $('toggle').setAttribute('aria-label',`${label} ${prefs.mode}`);
  $('restart').setAttribute('aria-label',`Reset ${prefs.mode}`);
  $('restart').hidden=prefs.mode==='alarm';
  document.querySelector('.action-divider').hidden=prefs.mode==='alarm';
  document.title=session.running?`${prefs.mode==='alarm'?formatDuration(milliseconds(session,now),true):text} · ${names[prefs.mode]} — rubato`:'rubato — a little space for your time';
}
function tick() {
  const now=Date.now();
  const advanced=advanceSession(session,prefs,now);
  if (advanced.completed) {
    session=advanced.session; save(SESSION_KEY,session);
    notify(prefs.mode==='alarm'?'Your alarm time has arrived.':prefs.mode==='pomodoro'?(prefs.autoAdvance?`${phaseName(session.phase)} has begun.`:'Session complete. Take a moment.'):'Your timer is complete.',0);
  }
  render(now);
}
$('toggle').addEventListener('click',()=>{tick(); session=toggleSession(session,prefs,Date.now()); $('notification').hidden=true; persist(); render();});
$('restart').addEventListener('click',()=>{session=freshSession(prefs); $('notification').hidden=true; persist(); render();});

function showMode() {
  pendingMode=prefs.mode; $('mode-menu').hidden=false; $('mode-trigger').setAttribute('aria-expanded','true');
  renderModeFields(); closeSettings();
  $('mode-menu').querySelector(`[data-mode="${pendingMode}"]`).focus();
}
function closeMode() { $('mode-menu').hidden=true; $('mode-trigger').setAttribute('aria-expanded','false'); }
$('mode-trigger').addEventListener('click',()=>$('mode-menu').hidden?showMode():closeMode());
$('close-mode').addEventListener('click',()=>{closeMode();$('mode-trigger').focus();});
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{pendingMode=button.dataset.mode;renderModeFields();}));
const numberField=(label,id,value,max,min=0)=>`<label>${label}<input id="${id}" name="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" step="1" required value="${value}"></label>`;
function renderModeFields() {
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===pendingMode)));
  $('mode-error').textContent='';
  let html='';
  if(pendingMode==='stopwatch') html='<p class="mode-description">Every moment, at your pace.<small>Count up from zero. Pause whenever you need.</small></p>';
  if(pendingMode==='timer') html=`<p class="mode-description">A little time, set aside.</p><div class="field-grid">${numberField('Hours','hours',Math.floor(prefs.duration/3600),99)}${numberField('Minutes','minutes',Math.floor(prefs.duration/60)%60,59)}${numberField('Seconds','seconds',prefs.duration%60,59)}</div>`;
  if(pendingMode==='pomodoro') html=`<p class="mode-description">A rhythm for your day.</p><div class="field-grid">${numberField('Focus · min','focus',prefs.focus,180,1)}${numberField('Break · min','short-break',prefs.shortBreak,60,1)}${numberField('Long break · min','long-break',prefs.longBreak,120,1)}</div><label class="check-row"><input id="auto-advance" type="checkbox" ${prefs.autoAdvance?'checked':''}> Start the next session automatically</label><p class="intro-hint">A long break follows every fourth focus session.</p>`;
  if(pendingMode==='alarm') html=`<p class="mode-description">A moment to come back to.</p><label class="alarm-field">Local alarm time<input id="alarm-time" type="time" required value="${prefs.alarm}"></label><p class="intro-hint" id="alarm-preview"></p><p class="intro-hint">A silent visual reminder. Keep this page open; sleeping devices and closed tabs cannot display an alarm.</p>`;
  if(pendingMode==='clock') html=`<p class="mode-description">Be here, now.<small>Your local time, with room to breathe.</small></p><label class="check-row"><input id="clock24" type="checkbox" ${prefs.clock24?'checked':''}> Use 24-hour time</label><label class="check-row"><input id="clock-seconds" type="checkbox" ${prefs.seconds?'checked':''}> Show seconds</label>`;
  $('mode-fields').innerHTML=html;
  $('apply-mode').innerHTML=`${pendingMode==='alarm'?'Set alarm':pendingMode==='timer'?'Set timer':pendingMode==='pomodoro'?'Set Pomodoro':`Use ${pendingMode}`} <span>↗</span>`;
  if(pendingMode==='alarm') { const preview=()=>{if($('alarm-time').value) $('alarm-preview').textContent=`Next: ${new Date(nextAlarm($('alarm-time').value,Date.now())).toLocaleString(undefined,{weekday:'long',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;}; $('alarm-time').addEventListener('input',preview); preview(); }
}
$('mode-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(pendingMode==='timer') {
    const duration=Number($('hours').value)*3600+Number($('minutes').value)*60+Number($('seconds').value);
    if(duration<=0) { $('mode-error').textContent='Choose a duration longer than zero.'; return; }
    prefs.duration=duration;
  }
  if(pendingMode==='pomodoro') { prefs.focus=Number($('focus').value);prefs.shortBreak=Number($('short-break').value);prefs.longBreak=Number($('long-break').value);prefs.autoAdvance=$('auto-advance').checked; }
  if(pendingMode==='alarm') prefs.alarm=$('alarm-time').value;
  if(pendingMode==='clock') {prefs.clock24=$('clock24').checked;prefs.seconds=$('clock-seconds').checked;}
  // Applying a new configuration intentionally starts a fresh session.
  prefs.mode=pendingMode;session=freshSession(prefs);
  if(pendingMode==='alarm') session=toggleSession(session,prefs,Date.now());
  persist();closeMode();render();fitText();$('mode-trigger').focus();
});
document.addEventListener('pointerdown',event=>{
  if(!$('mode-menu').hidden&&!$('mode-menu').contains(event.target)&&!$('mode-trigger').contains(event.target))closeMode();
});

for(const [id,label] of Object.entries(themes)) {
  const button=document.createElement('button'); button.className='theme-option';button.dataset.theme=id;button.setAttribute('aria-label',`${label} background`);
  button.innerHTML=`<span class="swatch" style="background-image:url('${themeThumbnail(id)}')"></span><span class="theme-label">${label}</span>`;
  button.addEventListener('click',()=>{prefs.theme=id;applyPreferences();save(PREFS_KEY,prefs);});$('theme-grid').append(button);
}
function openSettings() {clearTimeout(settingsTimeout);$('settings-zone').classList.add('open');$('settings-panel').inert=false;$('edge-access').setAttribute('aria-expanded','true');}
function closeSettings() {clearTimeout(settingsTimeout);$('settings-zone').classList.remove('open');$('settings-panel').inert=true;$('edge-access').setAttribute('aria-expanded','false');}
$('settings-zone').addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&!drag)openSettings();});
$('settings-zone').addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')settingsTimeout=setTimeout(closeSettings,220);});
$('edge-access').addEventListener('focus',openSettings);
$('edge-access').addEventListener('click',openSettings);
$('settings-zone').addEventListener('focusout',()=>setTimeout(()=>{if(!$('settings-zone').contains(document.activeElement)&&!$('settings-zone').matches(':hover'))closeSettings();},0));
$('close-settings').addEventListener('click',()=>{document.activeElement.blur();closeSettings();});
$('font').addEventListener('change',()=>{prefs.font=$('font').value;applyPreferences();fitText();save(PREFS_KEY,prefs);});
$('text-tone').addEventListener('change',()=>{prefs.tone=$('text-tone').value;applyPreferences();save(PREFS_KEY,prefs);});
$('font-size').addEventListener('input',()=>{prefs.fontSize=Number($('font-size').value);$('size-label').textContent=`${prefs.fontSize} px`;fitText();save(PREFS_KEY,prefs);});
$('recenter').addEventListener('click',()=>{prefs.frame=structuredClone(DEFAULTS.frame);applyFrame();fitText();save(PREFS_KEY,prefs);});
$('reset-settings').addEventListener('click',()=>{
  const previous=structuredClone(prefs), previousSession={...session};
  prefs=structuredClone(DEFAULTS);prefs.welcomed=true;session=freshSession(prefs);applyPreferences();fitText();persist();
  notify('Settings restored.');
  const undo=document.createElement('button');undo.className='quiet-button';undo.textContent='Undo';
  undo.addEventListener('click',()=>{prefs=previous;session=previousSession;persist();applyPreferences();fitText();$('notification').hidden=true;});
  $('notification-text').append(' ',undo);
});

function dismissWelcome() {prefs.welcomed=true;$('welcome').hidden=true;document.body.classList.remove('welcoming');save(PREFS_KEY,prefs);}
async function fullscreen() {
  try {
    if(document.fullscreenElement) await document.exitFullscreen();
    else if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else {notify('Fullscreen is not supported in this browser.');return;}
    dismissWelcome();closeSettings();
  } catch {notify('Fullscreen could not open. Try the fullscreen control again.');}
}
$('welcome-fullscreen').addEventListener('click',fullscreen);$('fullscreen').addEventListener('click',fullscreen);
$('dismiss-welcome').addEventListener('click',dismissWelcome);
document.addEventListener('fullscreenchange',()=>{$('fullscreen').firstChild.textContent=document.fullscreenElement?'Exit fullscreen ':'Fullscreen ';applyFrame();fitText();});
$('dismiss-notification').addEventListener('click',()=>$('notification').hidden=true);

box.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('button'))return;
  closeMode();
  const rect=box.getBoundingClientRect();
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height,corner:event.target.dataset.corner};
  box.setPointerCapture(event.pointerId);box.classList.add('dragging');
});
box.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  let {left,top,width,height}=drag;
  if(drag.corner) {
    const right=left+width,bottom=top+height,minW=Math.min(260,innerWidth-32),minH=Math.min(180,innerHeight-48);
    if(drag.corner.includes('w')){left=clamp(left+dx,16,right-minW);width=right-left;}else width=clamp(width+dx,minW,innerWidth-left-16);
    if(drag.corner.includes('n')){top=clamp(top+dy,24,bottom-minH);height=bottom-top;}else height=clamp(height+dy,minH,innerHeight-top-24);
  }else {left=clamp(left+dx,16,innerWidth-width-16);top=clamp(top+dy,24,innerHeight-height-24);}
  prefs.frame={x:(left+width/2)/innerWidth,y:(top+height/2)/innerHeight,width,height};applyFrame();fitText();
});
function endDrag() {if(!drag)return;drag=null;box.classList.remove('dragging');save(PREFS_KEY,prefs);}
box.addEventListener('pointerup',endDrag);box.addEventListener('pointercancel',endDrag);box.addEventListener('lostpointercapture',endDrag);
window.addEventListener('resize',()=>{applyFrame();fitText();});
document.addEventListener('visibilitychange',tick);
window.addEventListener('pageshow',tick);
// Synchronize preferences and timing when another tab changes this app.
window.addEventListener('storage',event=>{
  if(event.key===PREFS_KEY||event.key===SESSION_KEY) {prefs=readPreferences(load(PREFS_KEY));session=readSession(load(SESSION_KEY),prefs);closeMode();applyPreferences();fitText();tick();}
});
applyPreferences(); fitText(); tick();
if(!prefs.welcomed){$('welcome').hidden=false;document.body.classList.add('welcoming');}
persist();
document.fonts.ready.then(fitText);
setInterval(tick,100);
