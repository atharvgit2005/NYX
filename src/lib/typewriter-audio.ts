/**
 * High-fidelity organic mechanical typewriter audio sample generator.
 * Produces crisp 16-bit PCM WAV base64 samples that model actual physical mechanical
 * typewriter key clicks, carriage ratchet wheels, and metal spring impulses.
 */

function generateWavBase64(
  sampleRate: number,
  durationSec: number,
  synthFn: (t: number, sampleRate: number) => number
): string {
  const numSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    samples[i] = synthFn(t, sampleRate);
  }

  // Node & browser compatible base64 WAV generator
  const headerSize = 44;
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, Math.floor(val), true);
    offset += 2;
  }

  // Convert ArrayBuffer to Base64 string
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  return 'data:audio/wav;base64,' + base64;
}

// Convert base64 Data URI to ArrayBuffer reliably without fetch()
export function base64ToArrayBuffer(base64DataUri: string): ArrayBuffer {
  const base64Str = base64DataUri.replace(/^data:audio\/\w+;base64,/, '');
  const binaryStr = typeof window !== 'undefined' && window.atob ? window.atob(base64Str) : Buffer.from(base64Str, 'base64').toString('binary');
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes.buffer;
}

// 1. Real Typewriter Mechanical Key Click (Sharp metal lever snap + keybed bottom-out + spring ping)
export const TYPEWRITER_CLICK_WAV = generateWavBase64(44100, 0.042, (t) => {
  // Sharp initial metallic key-strike impulse (0-1.5ms)
  const strikeEnv = Math.exp(-t * 1400);
  const clickNoise = (Math.random() * 2 - 1) * strikeEnv * 0.7;
  const metalSnap = Math.sin(2 * Math.PI * 3600 * t) * strikeEnv * 0.85;

  // Key-lever bottoming out (8ms - 18ms) - classic typewriter "clack"
  const t2 = t - 0.008;
  let bottomOut = 0;
  if (t2 > 0) {
    const bottomEnv = Math.exp(-t2 * 380);
    const bottomNoise = (Math.random() * 2 - 1) * bottomEnv * 0.3;
    const bottomTone = Math.sin(2 * Math.PI * 1400 * t2) * bottomEnv * 0.9;
    bottomOut = bottomNoise + bottomTone;
  }

  // Typewriter metal body & ribbon lever resonance
  const bodyEnv = Math.exp(-t * 220);
  const bodyResonance = Math.sin(2 * Math.PI * 480 * t) * bodyEnv * 0.35;

  // Metallic spring ping
  const pingEnv = Math.exp(-t * 160);
  const springPing = Math.sin(2 * Math.PI * 5200 * t) * pingEnv * 0.18;

  return Math.max(-1, Math.min(1, clickNoise + metalSnap + bottomOut + bodyResonance + springPing));
});

// 2. Typewriter Carriage Ratchet Wheel (Dual-notch platen wheel turn)
export const TYPEWRITER_RATCHET_WAV = generateWavBase64(44100, 0.038, (t) => {
  // Tooth 1 snap
  const env1 = Math.exp(-t * 1200);
  const noise1 = (Math.random() * 2 - 1) * env1 * 0.4;
  const tone1 = Math.sin(2 * Math.PI * 2800 * t) * env1 * 0.7;

  // Tooth 2 ratchet release (6.5ms delay)
  const t2 = t - 0.0065;
  let tooth2 = 0;
  if (t2 > 0) {
    const env2 = Math.exp(-t2 * 450);
    const tone2 = Math.sin(2 * Math.PI * 1850 * t2) * env2 * 0.8;
    tooth2 = tone2;
  }

  // Platen drum warmth
  const body = Math.sin(2 * Math.PI * 340 * t) * Math.exp(-t * 250) * 0.3;

  return Math.max(-1, Math.min(1, noise1 + tone1 + tooth2 + body));
});

// 3. Crisp Buckling Spring / Mechanical Keyboard Click
export const CLICKY_SWITCH_WAV = generateWavBase64(44100, 0.035, (t) => {
  const env = Math.exp(-t * 1600);
  const snap = (Math.random() * 2 - 1) * env * 0.8;
  const springTone = Math.sin(2 * Math.PI * 4100 * t) * env * 0.9;
  const subThud = Math.sin(2 * Math.PI * 850 * t) * Math.exp(-t * 400) * 0.4;

  return Math.max(-1, Math.min(1, snap + springTone + subThud));
});
