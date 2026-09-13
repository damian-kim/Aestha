export const MODES = ['stopwatch', 'timer', 'pomodoro', 'alarm', 'clock'];
export const DEFAULTS = {
  theme: 'alpine', font: 'serif', fontSize: 112, mode: 'stopwatch',
  frame: { x: .5, y: .5, width: 510, height: 248 },
  duration: 300, focus: 25, shortBreak: 5, longBreak: 15, autoAdvance: false,
  alarm: '07:00', clock24: false, seconds: true, welcomed: false,
};
export function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
export function readPreferences(raw) {
  const p = structuredClone(DEFAULTS);
  if (!raw || typeof raw !== 'object') return p;
  for (const [key, values] of Object.entries({ theme: ['alpine','forest','stars','dunes','paper'], font: ['serif','sans','mono','light'], mode: MODES })) if (values.includes(raw[key])) p[key] = raw[key];
  for (const [key, min, max] of [['fontSize',36,180],['duration',1,359999],['focus',1,180],['shortBreak',1,60],['longBreak',1,120]]) if (Number.isFinite(raw[key])) p[key] = clamp(raw[key], min, max);
  for (const key of ['autoAdvance','clock24','seconds','welcomed']) if (typeof raw[key] === 'boolean') p[key] = raw[key];
  if (typeof raw.alarm === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.alarm)) p.alarm = raw.alarm;
  if (raw.frame && typeof raw.frame === 'object') for (const [key,min,max] of [['x',0,1],['y',0,1],['width',260,3000],['height',180,2000]]) if (Number.isFinite(raw.frame[key])) p.frame[key] = clamp(raw.frame[key],min,max);
  return p;
}
export function phaseDuration(index, prefs) { return (index % 2 === 0 ? prefs.focus : index === 7 ? prefs.longBreak : prefs.shortBreak) * 60000; }
export function phaseName(index) { return index % 2 === 0 ? `Session ${Math.floor(index / 2) + 1} of 4` : index === 7 ? 'Long break' : 'Short break'; }
export function freshSession(prefs) {
  return { mode: prefs.mode, running: false, anchor: 0, elapsed: 0, remaining: prefs.mode === 'pomodoro' ? phaseDuration(0,prefs) : prefs.duration*1000, phase: 0, finished: false, deadline: 0 };
}
export function readSession(raw, prefs) {
  if (!raw || raw.mode !== prefs.mode || typeof raw.running !== 'boolean' || typeof raw.finished !== 'boolean') return freshSession(prefs);
  for (const key of ['anchor','elapsed','remaining','deadline']) if (!Number.isFinite(raw[key]) || raw[key] < 0 || raw[key] > Number.MAX_SAFE_INTEGER) return freshSession(prefs);
  if (!Number.isInteger(raw.phase) || raw.phase < 0 || raw.phase > 7) return freshSession(prefs);
  return { mode: raw.mode, running: raw.running, anchor: raw.anchor, elapsed: raw.elapsed, remaining: raw.remaining, phase: raw.phase, finished: raw.finished, deadline: raw.deadline };
}
export function milliseconds(session, now) {
  if (session.mode === 'stopwatch') return session.elapsed + (session.running ? Math.max(0,now-session.anchor) : 0);
  if (session.mode === 'alarm') return session.running ? Math.max(0,session.deadline-now) : 0;
  return session.running ? Math.max(0,session.deadline-now) : session.remaining;
}
export function nextAlarm(value, now) {
  const date = new Date(now);
  const [hours, minutes] = value.split(':').map(Number);
  date.setHours(hours,minutes,0,0);
  if (date.getTime() <= now) date.setDate(date.getDate()+1);
  return date.getTime();
}
export function toggleSession(session, prefs, now) {
  const s = {...session};
  if (s.running) {
    s.elapsed = s.mode === 'stopwatch' ? milliseconds(s,now) : s.elapsed;
    s.remaining = milliseconds(s,now); s.running = false; return s;
  }
  if (s.mode === 'pomodoro' && s.finished) { s.phase = (s.phase+1)%8; s.remaining = phaseDuration(s.phase,prefs); }
  else if (s.finished && s.mode === 'timer') s.remaining = prefs.duration*1000;
  s.finished = false; s.running = true; s.anchor = now;
  s.deadline = s.mode === 'alarm' ? nextAlarm(prefs.alarm,now) : now+s.remaining;
  return s;
}
export function advanceSession(session, prefs, now) {
  if (!session.running || ['stopwatch','clock'].includes(session.mode) || now < session.deadline) return {session, completed:false};
  const s = {...session};
  if (s.mode === 'pomodoro' && prefs.autoAdvance) {
    const cycle = Array.from({length:8},(_,i)=>phaseDuration(i,prefs)).reduce((a,b)=>a+b,0);
    s.deadline += Math.floor((now-s.deadline)/cycle)*cycle;
    do { s.phase=(s.phase+1)%8; s.remaining=phaseDuration(s.phase,prefs); s.deadline+=s.remaining; } while (s.deadline<=now);
  } else { s.remaining=0; s.running=false; s.finished=true; }
  return {session:s, completed:true};
}
export function formatDuration(ms, ceil=false) {
  const seconds = Math.max(0, (ceil ? Math.ceil : Math.floor)(ms/1000));
  const h = Math.floor(seconds/3600), m = Math.floor(seconds/60)%60, s = seconds%60;
  const pad = n=>String(n).padStart(2,'0');
  return h ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
