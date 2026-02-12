// Haptic & Sound Feedback Utility
// Provides subtle, premium haptic and audio feedback for key interactions

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
};

// Haptic feedback via Vibration API
const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Play a subtle tone
const playTone = (frequency: number, duration: number, volume: number = 0.08, type: OscillatorType = 'sine') => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Resume context if suspended (autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};

// --- Public API ---

/** Soft tap for button presses */
export const tapFeedback = () => {
  vibrate(10);
  playTone(600, 0.06, 0.05);
};

/** Success chime — upload complete, save, etc. */
export const successFeedback = () => {
  vibrate([10, 30, 10]);
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  // Two-note ascending chime
  setTimeout(() => playTone(523, 0.12, 0.06), 0);      // C5
  setTimeout(() => playTone(784, 0.18, 0.06), 100);     // G5
};

/** Error buzz */
export const errorFeedback = () => {
  vibrate([30, 20, 30]);
  playTone(200, 0.15, 0.06, 'triangle');
};

/** Navigation / page transition — very subtle whoosh */
export const navFeedback = () => {
  vibrate(6);
  playTone(440, 0.04, 0.03);
};

/** Toggle switch sound */
export const toggleFeedback = () => {
  vibrate(8);
  playTone(880, 0.04, 0.04);
};
