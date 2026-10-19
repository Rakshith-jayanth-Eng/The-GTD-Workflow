import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true,
});
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).localStorage = dom.window.localStorage;

// Mock AudioContext
(dom.window as any).AudioContext = class {
  state = 'running';
  currentTime = 0;
  destination = {};
  createGain() {
    return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} };
  }
  createOscillator() {
    return { type: 'sine', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} };
  }
  createBiquadFilter() {
    return { type: 'lowpass', frequency: { setValueAtTime: () => {} }, connect: () => {} };
  }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
};
(global as any).AudioContext = (dom.window as any).AudioContext;

// Mock SpeechSynthesis
(dom.window as any).speechSynthesis = {
  cancel: () => {},
  speak: () => {},
  getVoices: () => [],
};
(dom.window as any).SpeechSynthesisUtterance = class {
  constructor(public text: string) {}
};
(global as any).speechSynthesis = (dom.window as any).speechSynthesis;
(global as any).SpeechSynthesisUtterance = (dom.window as any).SpeechSynthesisUtterance;
