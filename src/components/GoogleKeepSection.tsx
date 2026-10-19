import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Download,
  Upload,
  CheckSquare,
  Share2
} from 'lucide-react';
import { GTDTask } from './OmnipresentInboxSection';
import { audioEngine } from '../utils/audioEngine';

interface GoogleKeepSectionProps {
  tasks: GTDTask[];
  onImportKeepNotes: (tasks: GTDTask[]) => void;
}

export const GoogleKeepSection: React.FC<GoogleKeepSectionProps> = ({
  tasks,
  onImportKeepNotes,
}) => {
  const [pastedKeepText, setPastedKeepText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Format active tasks into Google Keep Checklist format
  const generateKeepChecklistText = () => {
    const activeTasks = tasks.filter((t) => !t.completed);
    if (activeTasks.length === 0) return 'No pending GTD actions.';

    let text = 'GTD Next Physical Actions:\n';
    activeTasks.forEach((t) => {
      text += `[ ] ${t.title} -> ${t.next_physical_action} (${t.context_tag}, ${t.duration_minutes}m)\n`;
    });
    return text;
  };

  const handleCopyForKeep = () => {
    const content = generateKeepChecklistText();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopiedStatus('checklist');
    audioEngine.playTaskCompletionChime();
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleImportKeepNotes = async () => {
    if (!pastedKeepText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/parse-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedKeepText }),
      });
      const data = await res.json();
      const extracted: GTDTask[] = data.tasks || [];
      if (extracted.length > 0) {
        onImportKeepNotes(extracted);
        audioEngine.playTaskCompletionChime();
        setExportNotice(`Successfully converted ${extracted.length} Keep note(s) into GTD next actions!`);
        setPastedKeepText('');
        setTimeout(() => setExportNotice(null), 4000);
      }
    } catch (e: any) {
      console.warn('Keep import notice:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
              WORKSPACE INTEGRATION
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Google Keep Sync &amp; Checklist Exporter
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Turn your chaotic Google Keep notes and checklists into GTD physical next actions, or export your surfaced tasks directly to Google Keep.
          </p>
        </div>

        <a
          href="https://keep.google.com/u/0/#home"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCopyForKeep}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-md cursor-pointer inline-flex"
          title="Copies formatted checklist and opens Google Keep in new tab"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Copy &amp; Open Google Keep</span>
        </a>
      </div>

      {exportNotice && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Import from Google Keep */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <Upload className="w-4 h-4" />
              <span>Import from Google Keep</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Copy any note, list, or voice memo from your Keep app and paste it below. Gemini will parse every line into atomic GTD items.
            </p>

            <textarea
              rows={4}
              value={pastedKeepText}
              onChange={(e) => setPastedKeepText(e.target.value)}
              placeholder="Paste Keep note here... (e.g. '• Call Bob about car, • buy lightbulbs at Home Depot, • check 2025 tax forms')"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-sans"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Deconstructs compound lines</span>
            <button
              onClick={handleImportKeepNotes}
              disabled={isProcessing || !pastedKeepText.trim()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Triaging...' : 'Convert to GTD Actions'}</span>
            </button>
          </div>
        </div>

        {/* Right: Export to Google Keep */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckSquare className="w-4 h-4" />
                <span>Export Surfaced Tasks to Google Keep</span>
              </div>
              <button
                onClick={handleCopyForKeep}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
              >
                {copiedStatus === 'checklist' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Formatted with native Keep checklist bracket syntax <code className="text-slate-300">[ ]</code>. Ready to paste directly into a new Keep note.
            </p>

            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36 leading-relaxed">
              {generateKeepChecklistText()}
            </pre>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-500">Checklist Ready</span>
            <a
              href="https://keep.google.com/u/0/#home"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCopyForKeep}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Google Keep</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
