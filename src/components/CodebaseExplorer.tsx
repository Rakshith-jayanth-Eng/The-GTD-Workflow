import React, { useState } from 'react';
import {
  Code,
  FolderTree,
  FileCode,
  Sparkles,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Layers
} from 'lucide-react';
import {
  FLUTTER_DIRECTORY_TREE,
  PYTHON_FASTAPI_DIRECTORY_TREE,
  GEMINI_PROMPTS_AND_SCHEMAS,
  BACKEND_FASTAPI_CODE,
  FRONTEND_FLUTTER_SURFACING_CODE,
  FRONTEND_FLUTTER_WEEKLY_REVIEW_CODE
} from '../data/codebaseDeliverables';

export const CodebaseExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'trees' | 'prompts' | 'fastapi' | 'flutter_surfacing' | 'flutter_review'
  >('fastapi');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
              PRODUCTION DELIVERABLES
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Production Code & Architecture Repository
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Zero-placeholder, production-grade source code, Gemini system instructions, Pydantic v2 schemas, and Flutter widgets.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Stack: Flutter + FastAPI + Gemini 2.5/Flash
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="mt-5 flex flex-wrap gap-2 pb-3 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('fastapi')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'fastapi'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>FastAPI: /parse-inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('flutter_surfacing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'flutter_surfacing'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Flutter: Dynamic Task Surfacing</span>
        </button>

        <button
          onClick={() => setActiveTab('flutter_review')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'flutter_review'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Flutter: Weekly Review Lockout</span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'prompts'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Prompts & JSON Schemas</span>
        </button>

        <button
          onClick={() => setActiveTab('trees')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'trees'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Project Directory Trees</span>
        </button>
      </div>

      {/* Tab 1: FastAPI Backend */}
      {activeTab === 'fastapi' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                app/api/endpoints/inbox.py
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete Python FastAPI endpoint for Omnipresent Inbox NLP parsing, 2-minute rule triage, and context bucketing using Google GenAI SDK.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(BACKEND_FASTAPI_CODE, 'fastapi')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copiedKey === 'fastapi' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload('inbox.py', BACKEND_FASTAPI_CODE)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{BACKEND_FASTAPI_CODE}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Flutter Dynamic Surfacing */}
      {activeTab === 'flutter_surfacing' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                lib/features/dynamic_surfacing/presentation/dynamic_task_surfacing_widget.dart
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete Flutter widget for reading native Calendar gaps and GPS Geofences. Filters tasks &gt; 10m when meeting is &lt; 15m away; elevates @Errands in commercial zones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(FRONTEND_FLUTTER_SURFACING_CODE, 'flutter_surfacing')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copiedKey === 'flutter_surfacing' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload('dynamic_task_surfacing_widget.dart', FRONTEND_FLUTTER_SURFACING_CODE)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .dart</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{FRONTEND_FLUTTER_SURFACING_CODE}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Flutter Weekly Review */}
      {activeTab === 'flutter_review' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                lib/features/weekly_review/presentation/weekly_review_lockout_modal.dart
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete Flutter modal that locks out the main dashboard and walks the user sequentially through: 1) Empty Inbox, 2) Check Completed Projects, 3) Review Someday/Maybe.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(FRONTEND_FLUTTER_WEEKLY_REVIEW_CODE, 'flutter_review')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copiedKey === 'flutter_review' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload('weekly_review_lockout_modal.dart', FRONTEND_FLUTTER_WEEKLY_REVIEW_CODE)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .dart</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{FRONTEND_FLUTTER_WEEKLY_REVIEW_CODE}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Gemini Prompts & Schemas */}
      {activeTab === 'prompts' && (
        <div className="mt-5 space-y-6">
          {/* Inbox Parser */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {GEMINI_PROMPTS_AND_SCHEMAS.inboxParser.title}
              </h3>
              <button
                onClick={() => handleCopy(GEMINI_PROMPTS_AND_SCHEMAS.inboxParser.systemInstruction, 'inbox_prompt')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
              >
                {copiedKey === 'inbox_prompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Prompt</span>
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                System Instruction:
              </span>
              <pre className="bg-slate-900/80 p-3.5 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap border border-slate-800">
                {GEMINI_PROMPTS_AND_SCHEMAS.inboxParser.systemInstruction}
              </pre>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Pydantic v2 / Google GenAI Response Schema:
              </span>
              <pre className="bg-slate-900/80 p-3.5 rounded-lg text-xs font-mono text-emerald-300 whitespace-pre-wrap border border-slate-800 overflow-x-auto">
                {GEMINI_PROMPTS_AND_SCHEMAS.inboxParser.pythonSchema}
              </pre>
            </div>
          </div>

          {/* Project Co-Pilot */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {GEMINI_PROMPTS_AND_SCHEMAS.projectCopilot.title}
              </h3>
              <button
                onClick={() => handleCopy(GEMINI_PROMPTS_AND_SCHEMAS.projectCopilot.systemInstruction, 'copilot_prompt')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
              >
                {copiedKey === 'copilot_prompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Prompt</span>
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                System Instruction:
              </span>
              <pre className="bg-slate-900/80 p-3.5 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap border border-slate-800">
                {GEMINI_PROMPTS_AND_SCHEMAS.projectCopilot.systemInstruction}
              </pre>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Pydantic v2 / Google GenAI Response Schema:
              </span>
              <pre className="bg-slate-900/80 p-3.5 rounded-lg text-xs font-mono text-emerald-300 whitespace-pre-wrap border border-slate-800 overflow-x-auto">
                {GEMINI_PROMPTS_AND_SCHEMAS.projectCopilot.pythonSchema}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Directory Trees */}
      {activeTab === 'trees' && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flutter Directory Tree */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <FolderTree className="w-4 h-4" />
                Flutter Frontend Architecture Tree
              </h3>
              <button
                onClick={() => handleCopy(FLUTTER_DIRECTORY_TREE, 'flutter_tree')}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                {copiedKey === 'flutter_tree' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
              {FLUTTER_DIRECTORY_TREE}
            </pre>
          </div>

          {/* FastAPI Directory Tree */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <FolderTree className="w-4 h-4" />
                Python FastAPI Backend Architecture Tree
              </h3>
              <button
                onClick={() => handleCopy(PYTHON_FASTAPI_DIRECTORY_TREE, 'fastapi_tree')}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                {copiedKey === 'fastapi_tree' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
              {PYTHON_FASTAPI_DIRECTORY_TREE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
