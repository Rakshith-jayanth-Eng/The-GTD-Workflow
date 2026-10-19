import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Volume2,
  Radio,
  FileAudio
} from 'lucide-react';
import { speakText } from '../utils/audioEngine';

export interface GTDTask {
  id: string;
  raw_input: string;
  title: string;
  next_physical_action: string;
  context_tag: '@Phone' | '@Computer' | '@Errands' | '@Office' | '@Home' | '@Anywhere';
  is_under_two_minutes: boolean;
  duration_minutes: number;
  energy_level: 'low' | 'medium' | 'high';
  item_type: 'next_action' | 'project' | 'waiting_for' | 'someday_maybe';
  clarification_reason?: string;
  completed?: boolean;
}

interface OmnipresentInboxSectionProps {
  onTasksParsed: (tasks: GTDTask[]) => void;
  currentTasksCount: number;
}

const PRESET_DUMPS = [
  {
    label: "Everyday Chores & Work",
    text: "Need to call plumber Bob about the kitchen sink leak, buy 0W-20 motor oil at AutoZone, finish taxes before Tuesday, draft Q3 marketing deck, email Sarah quick confirmation for lunch, clean the dusty garage workbench."
  },
  {
    label: "Errands & Calls",
    text: "Drop off package at UPS store, text Dave about server migration downtime, renew passport online, pick up organic coffee beans, write blog post on GTD productivity, call dentist to reschedule 2pm checkup."
  },
  {
    label: "Executive Blitz",
    text: "Review wireframes for client app, send 1-line approval to accounting for cloud invoice, buy anniversary flowers, prepare investor board slides, research visionOS development tutorials for someday."
  }
];

export const OmnipresentInboxSection: React.FC<OmnipresentInboxSectionProps> = ({
  onTasksParsed,
}) => {
  const [inputText, setInputText] = useState(PRESET_DUMPS[0].text);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastParsedTasks, setLastParsedTasks] = useState<GTDTask[]>([]);
  const [engineSource, setEngineSource] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speakingTaskId, setSpeakingTaskId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition & Mic Visualizer
  const startLiveListening = async () => {
    setErrorMsg(null);
    setLiveTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Check if Web Speech API is supported
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let accumulatedFinal = '';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += (accumulatedFinal ? ' ' : '') + transcript;
            } else {
              interim += transcript;
            }
          }
          const currentText = accumulatedFinal + (interim ? ' ' + interim : '');
          setLiveTranscript(currentText);
          setInputText(currentText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMsg(
              'Microphone permission blocked. Please click the lock/settings icon in your browser URL bar to allow microphone access.'
            );
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          stopMicStream();
        };

        recognition.start();

        // Also start visual audio meter
        startMicVisualizer();
      } catch (err: any) {
        console.warn('Speech recognition startup error:', err);
        setErrorMsg('Microphone error: ' + (err.message || 'Could not start mic'));
      }
    } else {
      // Browser does not support webkitSpeechRecognition
      // Fallback: Use MediaRecorder with AudioContext
      startMediaRecorderFallback();
    }
  };

  const stopLiveListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    stopMicStream();

    // If there is text, automatically parse it
    if (liveTranscript.trim() || inputText.trim()) {
      handleParseText(liveTranscript || inputText);
    }
  };

  // Mic audio level visualizer
  const startMicVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (e) {
      console.warn('Mic visualizer notice:', e);
    }
  };

  const stopMicStream = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setIsListening(true);
      startMicVisualizer();

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stopMicStream();
        setIsListening(false);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const res = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64, mimeType: 'audio/webm' }),
          });
          const data = await res.json();
          if (data.transcript) {
            setInputText(data.transcript);
            handleParseText(data.transcript);
          }
        };
      };

      mediaRecorder.start();
      recognitionRef.current = mediaRecorder;
    } catch (err: any) {
      setErrorMsg('Microphone permission denied: ' + err.message);
    }
  };

  const handleParseText = async (textToParse?: string) => {
    const text = (textToParse || inputText).trim();
    if (!text) {
      setErrorMsg('Please enter your thoughts or brain dump before parsing.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/parse-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const tasks: GTDTask[] = data.tasks || [];
      setLastParsedTasks(tasks);
      setEngineSource(data.source || 'gemini-3.8-flash');
      onTasksParsed(tasks);
    } catch (err: any) {
      console.error('Inbox parsing error:', err);
      setErrorMsg(err.message || 'Failed to parse inbox');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakTaskAction = (task: GTDTask) => {
    if (speakingTaskId === task.id) {
      setSpeakingTaskId(null);
      return;
    }
    setSpeakingTaskId(task.id);
    speakText(`Next action for ${task.title}: ${task.next_physical_action}. Context is ${task.context_tag}.`, () => {
      setSpeakingTaskId(null);
    });
  };

  useEffect(() => {
    return () => {
      stopMicStream();
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
              FEATURE 1 &amp; 10
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Omnipresent Voice &amp; Text Brain Dump
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real live microphone listening. Speak naturally — your actual words appear in real-time, transcribed by Gemini and triaged into physical actions.
          </p>
        </div>

        {/* Real Live Mic Button */}
        <button
          onClick={isListening ? stopLiveListening : startLiveListening}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
          }`}
          title="Click to start live speech recognition"
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 text-white" />
              <span>Stop Listening &amp; Triage</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-white" />
              <span>Live Mic Dictation</span>
            </>
          )}
        </button>
      </div>

      {/* Live Audio Visualizer Bar when listening */}
      {isListening && (
        <div className="mt-4 p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wide">
              Microphone Active — Listening to you now:
            </span>
            <span className="text-xs text-slate-200 italic truncate max-w-sm">
              "{liveTranscript || 'Start speaking your thoughts out loud...'}"
            </span>
          </div>

          {/* Audio level meter bars */}
          <div className="flex items-center gap-1 h-5 shrink-0">
            {[20, 40, 60, 80, 100].map((threshold, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  audioLevel >= threshold
                    ? 'bg-emerald-400 h-5'
                    : audioLevel >= threshold - 15
                    ? 'bg-emerald-600 h-3'
                    : 'bg-slate-700 h-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preset pills for quick testing */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Or Test with Presets:</span>
        {PRESET_DUMPS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(preset.text)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="mt-3 relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          placeholder="Speak with microphone or type messy thoughts, unfiled tasks, voice transcripts, or meeting fragments..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-sans"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Parsed into physical next actions, 2-minute flags &amp; context tags</span>
          </div>

          <button
            onClick={() => handleParseText()}
            disabled={isLoading || isListening || !inputText.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Triaging into Tasks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Triage Brain Dump</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results preview banner */}
      {lastParsedTasks.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Extracted {lastParsedTasks.length} Actionable GTD Items
            </h3>
            {engineSource && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Engine: {engineSource}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lastParsedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        task.context_tag === '@Phone'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : task.context_tag === '@Errands'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : task.context_tag === '@Computer'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : task.context_tag === '@Office'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : task.context_tag === '@Home'
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {task.context_tag}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {task.duration_minutes}m
                      </span>
                      {task.is_under_two_minutes && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                          2-Min
                        </span>
                      )}
                      <button
                        onClick={() => handleSpeakTaskAction(task)}
                        className={`p-1 rounded transition ${
                          speakingTaskId === task.id
                            ? 'text-emerald-400 bg-emerald-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Listen to this task action aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-sm text-slate-100">{task.title}</h4>

                  <div className="mt-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-900/40 rounded-lg p-2 flex items-start gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-400 block text-[10px] uppercase tracking-wider">
                        Next Physical Action:
                      </span>
                      <span className="italic">{task.next_physical_action}</span>
                    </div>
                  </div>
                </div>

                {task.clarification_reason && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    💡 {task.clarification_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
