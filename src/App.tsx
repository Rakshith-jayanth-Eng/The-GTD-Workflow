import React, { useState, useEffect } from 'react';
import {
  Compass,
  Inbox,
  Sparkles,
  FileCode,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Network,
  Terminal,
  Zap,
  RotateCcw,
  Plus,
  MessageSquare,
  Music,
  Check,
  Headphones,
  CheckSquare,
  Mail,
  FileText
} from 'lucide-react';
import { OmnipresentInboxSection, GTDTask } from './components/OmnipresentInboxSection';
import { DynamicTaskSurfacingSimulator } from './components/DynamicTaskSurfacingSimulator';
import { WeeklyReviewModal } from './components/WeeklyReviewModal';
import { ProjectCopilotSection } from './components/ProjectCopilotSection';
import { CodebaseExplorer } from './components/CodebaseExplorer';
import { ArchitectureDiagrams } from './components/ArchitectureDiagrams';
import { GtdChatCoachModal } from './components/GtdChatCoachModal';
import { FocusMusicPlayer } from './components/FocusMusicPlayer';
import { GmailInboxSection } from './components/GmailInboxSection';
import { GoogleKeepSection } from './components/GoogleKeepSection';
import { audioEngine } from './utils/audioEngine';

// Initial realistic GTD seed tasks
const INITIAL_GTD_TASKS: GTDTask[] = [
  {
    id: 'seed-task-1',
    raw_input: 'call accountant Bob about W-2',
    title: 'Verify 2025 W-2 Form with CPA',
    next_physical_action: 'Dial accountant Bob at 555-0142 to confirm receipt of Form 1099 and W-2',
    context_tag: '@Phone',
    is_under_two_minutes: true,
    duration_minutes: 2,
    energy_level: 'low',
    item_type: 'next_action',
    clarification_reason: '2-minute rule quick phone confirmation.'
  },
  {
    id: 'seed-task-2',
    raw_input: 'buy 0W-20 motor oil at AutoZone',
    title: 'Purchase Motor Oil for Subaru',
    next_physical_action: 'Drive to AutoZone on 4th Street and buy 5-quart jug of Mobil 1 0W-20',
    context_tag: '@Errands',
    is_under_two_minutes: false,
    duration_minutes: 25,
    energy_level: 'medium',
    item_type: 'next_action',
    clarification_reason: 'Requires driving to commercial retail store.'
  },
  {
    id: 'seed-task-3',
    raw_input: 'quick approval email to Dave for server migration',
    title: 'Approve Cloud Migration Window',
    next_physical_action: 'Reply to Dave\'s Slack thread with "Approved for Sunday 2 AM UTC maintenance"',
    context_tag: '@Computer',
    is_under_two_minutes: true,
    duration_minutes: 2,
    energy_level: 'low',
    item_type: 'next_action',
    clarification_reason: 'One-line message taking under 60 seconds.'
  },
  {
    id: 'seed-task-4',
    raw_input: 'pick up dry cleaning ticket 8841',
    title: 'Pick Up Wool Overcoat from Cleaner',
    next_physical_action: 'Hand ticket #8841 to clerk at Classic Cleaners and pay $24 balance',
    context_tag: '@Errands',
    is_under_two_minutes: false,
    duration_minutes: 15,
    energy_level: 'low',
    item_type: 'next_action',
    clarification_reason: 'Physical errand in commercial retail zone.'
  },
  {
    id: 'seed-task-5',
    raw_input: 'draft Q4 investor update presentation',
    title: 'Draft Q4 Investor Update Deck',
    next_physical_action: 'Open Google Slides template and write executive bullet summary of Q4 revenue',
    context_tag: '@Computer',
    is_under_two_minutes: false,
    duration_minutes: 45,
    energy_level: 'high',
    item_type: 'next_action',
    clarification_reason: 'Deep cognitive work requiring laptop screen and concentrated focus.'
  },
  {
    id: 'seed-task-6',
    raw_input: 'wipe down garage workbench',
    title: 'Clean & Organize Garage Workbench',
    next_physical_action: 'Put hand tools back in pegboard and vacuum sawdust off workbench surface',
    context_tag: '@Home',
    is_under_two_minutes: false,
    duration_minutes: 15,
    energy_level: 'medium',
    item_type: 'next_action',
    clarification_reason: 'Domestic maintenance task located at home residence.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'actions' | 'inbox' | 'gmail' | 'keep' | 'projects' | 'coach' | 'codebase'
  >('actions');

  // Load from localStorage or fallback to seed
  const [tasks, setTasks] = useState<GTDTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('flowstate_gtd_tasks_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('LocalStorage load notice:', e);
      }
    }
    return INITIAL_GTD_TASKS;
  });

  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [lastReviewDate, setLastReviewDate] = useState<string | null>(() => {
    return localStorage.getItem('flowstate_last_review_date') || null;
  });

  // Sync tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flowstate_gtd_tasks_v2', JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }, [tasks]);

  const handleTasksParsed = (newTasks: GTDTask[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
    setActiveTab('actions');
  };

  const handleAddTasks = (newTasks: GTDTask[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
    setActiveTab('actions');
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleResetTasks = () => {
    setTasks(INITIAL_GTD_TASKS);
    audioEngine.playTaskCompletionChime();
  };

  const handleWeeklyReviewCleared = () => {
    const todayStr = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setLastReviewDate(todayStr);
    localStorage.setItem('flowstate_last_review_date', todayStr);
    audioEngine.playSprintDoneCelebration();
  };

  const activeCount = tasks.filter((t) => !t.completed).length;
  const twoMinCount = tasks.filter((t) => !t.completed && t.is_under_two_minutes).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Friendly Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  FlowState GTD
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  Mind Like Water
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Intuitive GTD with Applied Gemini AI, Gmail &amp; Google Keep
              </p>
            </div>
          </div>

          {/* Quick Stats & Action Buttons */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 font-mono">
              <span className="text-slate-400">Ready:</span>
              <span className="text-emerald-400 font-bold">{activeCount} actions</span>
              {twoMinCount > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400 font-bold">⚡ {twoMinCount} quick wins</span>
                </>
              )}
            </div>

            <button
              onClick={() => setIsWeeklyReviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer shadow-sm"
              title="Lock out main dashboard for mandatory 3-step Weekly Maintenance"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Weekly Review</span>
              {lastReviewDate && (
                <span className="hidden md:inline text-[10px] text-amber-400/80 font-normal">
                  ({lastReviewDate})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* User-Friendly Main Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 border-t border-slate-800/60 py-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'actions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>My Actions ({activeCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'inbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Brain Dump</span>
          </button>

          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'gmail'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail Triage</span>
          </button>

          <button
            onClick={() => setActiveTab('keep')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'keep'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Google Keep</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Projects &amp; Vision</span>
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'coach'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>GTD Coach</span>
          </button>

          <button
            onClick={() => setActiveTab('codebase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ml-auto ${
              activeTab === 'codebase'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Architecture &amp; Code</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* TAB 1: My Actions (Daily Dashboard) */}
        {activeTab === 'actions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Friendly Greeting Card */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  What can you accomplish right now?
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Tasks are automatically prioritized based on your location and upcoming calendar schedule. Quick 2-minute wins appear first so you build effortless momentum.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Brain Dump</span>
                </button>
                <button
                  onClick={handleResetTasks}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Reset initial tasks"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dynamic Task Surfacing Simulator */}
            <DynamicTaskSurfacingSimulator
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onAddTask={(task) => setTasks((prev) => [task, ...prev])}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )}

        {/* TAB 2: Brain Dump (Omnipresent Inbox with Mic Audio Transcription) */}
        {activeTab === 'inbox' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <OmnipresentInboxSection
              onTasksParsed={handleTasksParsed}
              currentTasksCount={tasks.length}
            />
          </div>
        )}

        {/* TAB 3: Gmail Triage (Workspace Integration) */}
        {activeTab === 'gmail' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GmailInboxSection onAddTasks={handleAddTasks} />
          </div>
        )}

        {/* TAB 4: Google Keep (Workspace Integration) */}
        {activeTab === 'keep' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GoogleKeepSection
              tasks={tasks}
              onImportKeepNotes={(importedTasks) => handleAddTasks(importedTasks)}
            />
          </div>
        )}

        {/* TAB 5: Goals & Visual Projects (Natural Planning Model & Vision Studio) */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ProjectCopilotSection onAddTasks={handleAddTasks} />
          </div>
        )}

        {/* TAB 6: GTD AI Coach (Chatbot & Live Voice) */}
        {activeTab === 'coach' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GtdChatCoachModal />
          </div>
        )}

        {/* TAB 7: Production Code & Architecture Explorer */}
        {activeTab === 'codebase' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <CodebaseExplorer />
            <ArchitectureDiagrams />
          </div>
        )}
      </main>

      {/* Floating Focus Music Player (Lyria 3 Audio Generator) */}
      <FocusMusicPlayer currentContext="@Computer" />

      {/* Feature 4: The System Purge (Weekly Review Lockout Modal) */}
      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        onClose={() => setIsWeeklyReviewOpen(false)}
        inboxTasks={tasks}
        onTasksCleared={handleWeeklyReviewCleared}
        onPromoteItem={(title) => {
          const promotedTask: GTDTask = {
            id: `promoted-${Date.now()}`,
            raw_input: title,
            title: `Project: ${title}`,
            next_physical_action: `Define 1-page outcome and schedule kickoff for "${title}"`,
            context_tag: '@Computer',
            is_under_two_minutes: false,
            duration_minutes: 20,
            energy_level: 'medium',
            item_type: 'project',
            clarification_reason: 'Promoted from Someday/Maybe incubator during Weekly Review',
            completed: false,
          };
          setTasks((prev) => [promotedTask, ...prev]);
        }}
      />

      {/* Clean Zen Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <p>
          FlowState GTD • Seamless Getting Things Done with Google Workspace
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Integrated with Gmail API, Google Keep Sync, Gemini 2.5 / 3.8 Flash, Lyria 3 Focus Music, and Veo 3 Video.
        </p>
      </footer>
    </div>
  );
}
