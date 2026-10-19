import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, Sparkles, RefreshCw, X, Radio, VolumeX } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface FocusMusicPlayerProps {
  currentContext?: string;
}

export const FocusMusicPlayer: React.FC<FocusMusicPlayerProps> = ({ currentContext }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusType, setFocusType] = useState<'deep_work' | 'sprint' | 'ambient'>('deep_work');
  const [volume, setVolume] = useState<number>(0.3);
  const [isExpanded, setIsExpanded] = useState(false);

  const modeTitles = {
    deep_work: 'Deep Work (432Hz Alpha Binaural)',
    sprint: '⚡ 2-Minute Sprint (116 BPM Energy)',
    ambient: 'Review Zen (Calm Chords & Breath)',
  };

  const handleTogglePlay = (type?: 'deep_work' | 'sprint' | 'ambient') => {
    const targetType = type || focusType;
    if (isPlaying && targetType === focusType && !type) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      setFocusType(targetType);
      audioEngine.play(targetType);
      audioEngine.setVolume(volume);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white border shadow-2xl backdrop-blur-md transition-all group ${
            isPlaying
              ? 'bg-indigo-600/90 border-indigo-400 shadow-indigo-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 border-indigo-500/40'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
            {isPlaying ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            ) : (
              <Music className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-xs font-semibold text-slate-200">
            {isPlaying ? `Playing: ${focusType === 'sprint' ? 'Sprint Pulse' : 'Binaural Focus'}` : 'Focus Audio'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono">
            {isPlaying ? 'ACTIVE' : 'AUDIO'}
          </span>
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-84 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                Focus Sound Synthesizer
              </h4>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="font-semibold truncate pr-2">{modeTitles[focusType]}</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {isPlaying ? '● LIVE SOUND' : 'READY'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Live native synthesized audio to eliminate mental chatter and ground your focus.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-1.5 mt-3">
              <button
                onClick={() => handleTogglePlay('deep_work')}
                className={`px-2 py-2 rounded-xl text-[11px] font-medium border transition ${
                  focusType === 'deep_work' && isPlaying
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Deep Work
              </button>
              <button
                onClick={() => handleTogglePlay('sprint')}
                className={`px-2 py-2 rounded-xl text-[11px] font-medium border transition ${
                  focusType === 'sprint' && isPlaying
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ⚡ 2m Sprint
              </button>
              <button
                onClick={() => handleTogglePlay('ambient')}
                className={`px-2 py-2 rounded-xl text-[11px] font-medium border transition ${
                  focusType === 'ambient' && isPlaying
                    ? 'bg-purple-600 text-white border-purple-400 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Review Zen
              </button>
            </div>

            {/* Volume slider */}
            <div className="mt-3.5 flex items-center gap-2 px-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => handleTogglePlay()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Mute Sound</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Audio Now</span>
                  </>
                )}
              </button>

              <span className="text-[10px] text-slate-500 font-mono">Web Audio Synth</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
