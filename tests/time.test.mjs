import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, readPreferences, readSession, freshSession, milliseconds, toggleSession, advanceSession, nextAlarm, formatDuration } from '../time.js';
const prefs = mode=>({...structuredClone(DEFAULTS),mode});
test('stopwatch uses timestamps and resumes without counting the pause',()=>{
  const p=prefs('stopwatch');let s=toggleSession(freshSession(p),p,1000);
  assert.equal(milliseconds(s,91000),90000);
  s=toggleSession(s,p,91000);assert.equal(milliseconds(s,999999),90000);
  s=toggleSession(s,p,120000);assert.equal(milliseconds(s,123000),93000);
});
test('countdown completes correctly after a throttled or sleeping tab',()=>{
  const p=prefs('timer');const s=toggleSession(freshSession(p),p,1000);
  const result=advanceSession(s,p,999999);
  assert.equal(result.completed,true);assert.equal(result.session.running,false);assert.equal(result.session.remaining,0);
  assert.equal(advanceSession(result.session,p,1000000).completed,false);
});
test('countdown pause and resume preserve remaining duration',()=>{
  const p=prefs('timer');let s=toggleSession(freshSession(p),p,1000);
  s=toggleSession(s,p,61000);assert.equal(s.remaining,240000);
  s=toggleSession(s,p,120000);assert.equal(s.deadline,360000);
});
test('restoring a saved active session retains its original deadline',()=>{
  const p=prefs('timer');const s=toggleSession(freshSession(p),p,1000);
  const restored=readSession(JSON.parse(JSON.stringify(s)),p);
  assert.equal(milliseconds(restored,121000),180000);
});
test('manual Pomodoro waits after completion, then moves to a break',()=>{
  const p=prefs('pomodoro');let s=toggleSession(freshSession(p),p,1000);
  s=advanceSession(s,p,1501000).session;
  assert.equal(s.finished,true);assert.equal(s.phase,0);
  s=toggleSession(s,p,1600000);assert.equal(s.phase,1);assert.equal(s.remaining,300000);
});
test('automatic Pomodoro advances across days without timer drift',()=>{
  const p={...prefs('pomodoro'),autoAdvance:true};let s=toggleSession(freshSession(p),p,1000);
  s=advanceSession(s,p,1501000).session;assert.equal(s.phase,1);assert.equal(s.deadline,1801000);
  const cycle=(25*4+5*3+15)*60000;
  s=advanceSession(s,p,1000+cycle*500+1500000+1000).session;
  assert.equal(s.phase,1);assert.equal(s.deadline,1000+cycle*500+1800000);
});
test('fourth Pomodoro session leads to a long break',()=>{
  const p={...prefs('pomodoro'),autoAdvance:true};let s=toggleSession(freshSession(p),p,1000);
  s=advanceSession(s,p,1000+(25*4+5*3)*60000).session;
  assert.equal(s.phase,7);assert.equal(s.remaining,15*60000);
});
test('alarm selects tomorrow when the requested time has passed',()=>{
  const now=new Date(2026,8,12,15,30).getTime();const next=new Date(nextAlarm('07:00',now));
  assert.equal(next.getDate(),13);assert.equal(next.getHours(),7);assert.equal(next.getMinutes(),0);
});
test('alarm completes after its target time, including refresh recovery',()=>{
  const p={...prefs('alarm'),alarm:'16:00'};const now=new Date(2026,8,12,15,30).getTime();
  const s=toggleSession(freshSession(p),p,now);assert.equal(milliseconds(s,now),1800000);
  assert.equal(advanceSession(readSession(s,p),p,now+1800001).session.finished,true);
});
test('preferences sanitize malformed storage and keep defaults isolated',()=>{
  const p=readPreferences({theme:'bad',fontSize:999,frame:{x:NaN,width:-3},alarm:'99:00'});
  assert.equal(p.theme,'alpine');assert.equal(p.fontSize,180);assert.equal(p.frame.x,.5);assert.equal(p.frame.width,260);assert.equal(p.alarm,'07:00');
  p.frame.x=0;assert.equal(DEFAULTS.frame.x,.5);
  assert.deepEqual(readSession({mode:'timer',running:true},prefs('timer')),freshSession(prefs('timer')));
});
test('formatting uses full hours and rounds countdowns up',()=>{
  assert.equal(formatDuration(3661000),'01:01:01');assert.equal(formatDuration(999,true),'00:01');assert.equal(formatDuration(999),'00:00');assert.equal(formatDuration(-1000),'00:00');
});
