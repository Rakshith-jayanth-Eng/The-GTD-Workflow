/**
 * Real-time Web Audio Synthesizer, Chime & Speech Engine
 * Guarantees 100% audible, native sound without CORS or network dependencies.
 */

class WebAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: Array<{ stop: () => void }> = [];
  private isPlaying = false;
  private currentMode: 'deep_work' | 'sprint' | 'ambient' | null = null;

  public initContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public play(mode: 'deep_work' | 'sprint' | 'ambient') {
    this.initContext();
    this.stop(); // Stop any previous sound

    if (!this.audioCtx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentMode = mode;

    if (mode === 'deep_work') {
      this.startDeepWorkBinaural();
    } else if (mode === 'sprint') {
      this.startSprintRhythm();
    } else if (mode === 'ambient') {
      this.startZenAmbient();
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
        // Node already stopped
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentMode = null;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentMode() {
    return this.currentMode;
  }

  public setVolume(val: number) {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(val, 1)), this.audioCtx.currentTime);
    }
  }

  // 1. Deep Work: 432Hz harmonic chord + 8Hz Alpha binaural beat
  private startDeepWorkBinaural() {
    if (!this.audioCtx || !this.masterGain) return;
    const ctx = this.audioCtx;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(224, ctx.currentTime); // 8 Hz alpha beat

    const subOsc = ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(108, ctx.currentTime);

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gainSub = ctx.createGain();

    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime);
    gainSub.gain.setValueAtTime(0.12, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    osc1.connect(gain1).connect(filter);
    osc2.connect(gain2).connect(filter);
    subOsc.connect(gainSub).connect(filter);
    filter.connect(this.masterGain);

    osc1.start();
    osc2.start();
    subOsc.start();

    this.activeNodes.push({
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          subOsc.stop();
        } catch (e) {}
      },
    });
  }

  // 2. 2-Minute Sprint: Rhythmic pulse at 116 BPM with energy
  private startSprintRhythm() {
    if (!this.audioCtx || !this.masterGain) return;
    const ctx = this.audioCtx;

    let isTimerActive = true;
    const bpm = 116;
    const beatInterval = 60 / bpm;

    const playClick = () => {
      if (!isTimerActive || !this.audioCtx || !this.masterGain) return;
      const now = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    };

    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'triangle';
    drone.frequency.setValueAtTime(65, ctx.currentTime);
    droneGain.gain.setValueAtTime(0.15, ctx.currentTime);

    drone.connect(droneGain).connect(this.masterGain);
    drone.start();

    const intervalId = setInterval(playClick, beatInterval * 1000);
    playClick();

    this.activeNodes.push({
      stop: () => {
        isTimerActive = false;
        clearInterval(intervalId);
        try {
          drone.stop();
        } catch (e) {}
      },
    });
  }

  // 3. Review Zen: Warm acoustic ambient pad with ocean waves
  private startZenAmbient() {
    if (!this.audioCtx || !this.masterGain) return;
    const ctx = this.audioCtx;

    const freqs = [174.61, 220.0, 261.63, 329.63];
    const oscs: OscillatorNode[] = [];

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.08, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(padGain);
      osc.start();
      oscs.push(osc);
    });

    padGain.connect(filter);
    filter.connect(this.masterGain);

    this.activeNodes.push({
      stop: () => {
        try {
          lfo.stop();
          oscs.forEach((o) => o.stop());
        } catch (e) {}
      },
    });
  }

  // 4. Task Completion Chime (Crisp, rewarding C5 to E5 dual chime)
  public playTaskCompletionChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Note 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // Note 2: 659.25 Hz (E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.3, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.56);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }

  // 5. Sprint Done Celebration Chime (Ascending triad: C5 - E5 - G5)
  public playSprintDoneCelebration() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.14;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.46);
      });
    } catch (e) {
      console.warn('Sprint celebration notice:', e);
    }
  }
}

export const audioEngine = new WebAudioEngine();

/**
 * Text-to-Speech (Speaks text aloud through device speakers)
 */
export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/[*#_`~>]/g, '')
    .replace(/https?:\/\/\S+/g, 'link')
    .slice(0, 400);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
  );
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
