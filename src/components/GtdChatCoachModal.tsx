import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Radio,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Zap,
  Brain,
  HelpCircle,
  X
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/audioEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export const GtdChatCoachModal: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'model',
      content:
        "Hello! I am your GTD Executive Coach, here to help you achieve Mind Like Water.\n\nWhether you're feeling overwhelmed, procrastinating on a vague project, or clarifying messy notes into next physical actions, what's on your mind right now?",
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelTier, setModelTier] = useState<'fast' | 'general' | 'deep'>('general');
  const [isLiveVoiceActive, setIsLiveVoiceActive] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Text or Voice Chat Submission
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLiveTranscript('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          modelTier,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || "Let's translate that into your very next physical action.";
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed:
          data.model ||
          (modelTier === 'deep'
            ? 'gemini-3.1-pro-preview'
            : modelTier === 'fast'
            ? 'gemini-3.1-flash-lite'
            : 'gemini-3.5-flash'),
      };

      setMessages((prev) => [...prev, modelMsg]);

      // If Live Voice mode is active, speak the answer aloud automatically!
      if (isLiveVoiceActive) {
        setSpeakingMessageId(modelMsg.id);
        speakText(replyText, () => setSpeakingMessageId(null));
      }
    } catch (err) {
      console.warn('Chat coach error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real Web Speech API listener for the Chat Coach input
  const startSpeechInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechNotice("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your message below.");
      setTimeout(() => setSpeechNotice(null), 5000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
        setLiveTranscript(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
        if (inputMessage.trim()) {
          handleSendMessage(inputMessage);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Mic start error:', e);
      setIsListeningMic(false);
    }
  };

  const stopSpeechInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListeningMic(false);
  };

  // Read message aloud
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msgId);
      speakText(text, () => setSpeakingMessageId(null));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white flex flex-col h-[650px] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              David Allen GTD AI Coach
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                Online &amp; Speaking
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Voice-enabled mentor for clarifying overwhelm into physical actions
            </p>
          </div>
        </div>

        {/* Model Tier Selector & Audio Auto-Speak Toggle */}
        <div className="flex items-center gap-2">
          {/* Tier buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px]">
            <button
              onClick={() => setModelTier('fast')}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                modelTier === 'fast'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fast: gemini-3.1-flash-lite"
            >
              Fast (Lite)
            </button>
            <button
              onClick={() => setModelTier('general')}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                modelTier === 'general'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="General: gemini-3.5-flash"
            >
              General
            </button>
            <button
              onClick={() => setModelTier('deep')}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                modelTier === 'deep'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Deep Reasoning: gemini-3.1-pro-preview"
            >
              Deep (Pro)
            </button>
          </div>

          {/* Voice Auto-Speak Toggle */}
          <button
            onClick={() => setIsLiveVoiceActive(!isLiveVoiceActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isLiveVoiceActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Automatically speak coach responses out loud through device speakers"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isLiveVoiceActive ? 'text-white' : 'text-purple-400'}`} />
            <span>{isLiveVoiceActive ? 'Auto-Voice ON' : 'Auto-Voice'}</span>
          </button>
        </div>
      </div>

      {/* Voice Mode Banner */}
      {isLiveVoiceActive && (
        <div className="bg-purple-950/40 border-b border-purple-800/40 px-4 py-2 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Coach will speak all advice out loud through your speakers.</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400">Audio Synthesis Active</span>
        </div>
      )}

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>

              <div
                className={`flex items-center gap-2 mt-1 text-[10px] text-slate-500 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.modelUsed && (
                  <span className="font-mono text-indigo-400/80">
                    • {msg.modelUsed}
                  </span>
                )}
                {msg.role === 'model' && (
                  <button
                    onClick={() => handleToggleSpeak(msg.id, msg.content)}
                    className={`p-1 rounded transition ml-1 flex items-center gap-1 ${
                      speakingMessageId === msg.id
                        ? 'text-purple-400 bg-purple-500/20 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Read this response aloud"
                  >
                    {speakingMessageId === msg.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-purple-400" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-2xl max-w-xs border border-slate-800">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span>Consulting GTD coaching principles...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Starters */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
          Quick Ask:
        </span>
        {[
          "I'm procrastinating on a big project",
          "Help me do a 2-minute triage",
          "How do I clean my Someday/Maybe list?",
          "Convert 'taxes' into next actions",
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 whitespace-nowrap transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {speechNotice && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <span>{speechNotice}</span>
          <button
            onClick={() => setSpeechNotice(null)}
            className="text-amber-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Field with Mic Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <button
          onClick={isListeningMic ? stopSpeechInput : startSpeechInput}
          className={`p-2.5 rounded-xl transition ${
            isListeningMic
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Speak your question out loud with your microphone"
        >
          {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-purple-400" />}
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={
            isListeningMic
              ? 'Listening to your voice right now...'
              : 'Ask anything, or click the mic to speak out loud...'
          }
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputMessage.trim()}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
