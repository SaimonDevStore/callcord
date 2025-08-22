let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  return audioContext;
}

function playTone({
  frequency = 440,
  durationMs = 120,
  type = "sine",
  gain = 0.06,
  rampDownMs = 40,
}: {
  frequency?: number;
  durationMs?: number;
  type?: OscillatorType;
  gain?: number;
  rampDownMs?: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gainNode.gain.value = gain;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;
  oscillator.start(now);

  // Ramp down to avoid click/pop
  const endTime = now + durationMs / 1000;
  gainNode.gain.setValueAtTime(gain, endTime - rampDownMs / 1000);
  gainNode.gain.linearRampToValueAtTime(0.0001, endTime);

  oscillator.stop(endTime);
}

export function playMessageSound() {
  // short pleasant blip
  playTone({ frequency: 740, durationMs: 110, type: "sine" });
}

export function playCallJoinSound() {
  // quick up-chirp
  playTone({ frequency: 520, durationMs: 70, type: "sine" });
  setTimeout(() => playTone({ frequency: 720, durationMs: 80, type: "sine" }), 60);
}

export function playIncomingCallSound() {
  if (typeof window === "undefined") return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(950, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.frequency.setValueAtTime(750, ctx.currentTime);
    }, 120);
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      o.stop(ctx.currentTime + 0.08);
    }, 300);
  } catch {}
}

export function playCallLeaveSound() {
  // quick down-chirp
  playTone({ frequency: 620, durationMs: 80, type: "sine" });
  setTimeout(() => playTone({ frequency: 420, durationMs: 90, type: "sine" }), 50);
}

export function playMuteSound() {
  // subtle tick
  playTone({ frequency: 380, durationMs: 70, type: "triangle" });
}

export function playUnmuteSound() {
  // subtle tock
  playTone({ frequency: 560, durationMs: 70, type: "triangle" });
}



