// Short, locally synthesized signals. No downloaded audio or third-party requests.
let context;
let repeat;

export async function prepareSound() {
  if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
  if (context.state === 'suspended') await context.resume();
}

function note(frequency, start, length, shape, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = shape;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + length + 0.02);
}

function phrase(sound) {
  const t = context.currentTime + 0.02;
  if (sound === 'chime') {
    note(523.25,t,0.7,'sine',0.17);
    note(659.25,t+0.18,0.7,'sine',0.15);
    note(783.99,t+0.36,1.05,'sine',0.15);
  } else if (sound === 'bell') {
    for (const offset of [0,0.66]) {
      note(880,t+offset,1.15,'sine',0.17);
      note(1320,t+offset,0.9,'sine',0.055);
    }
  } else if (sound === 'gentle') {
    note(392,t,0.8,'sine',0.12);
    note(493.88,t+0.36,0.8,'sine',0.12);
    note(587.33,t+0.72,1.3,'sine',0.11);
  } else if (sound === 'digital') {
    for (const offset of [0,0.24,0.48]) note(740,t+offset,0.14,'square',0.045);
  }
}

export function stopSound() {
  clearInterval(repeat);
  repeat = undefined;
}

export async function playSound(sound, loop = false) {
  stopSound();
  if (sound === 'off') return;
  try {
    await prepareSound();
    phrase(sound);
    if (loop) repeat = setInterval(() => phrase(sound), sound === 'digital' ? 1800 : 2600);
  } catch {
    // Browsers can block sound until the page receives a user gesture.
  }
}
