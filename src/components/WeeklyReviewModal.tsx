import React, { useState } from 'react';
import {
  ShieldAlert,
  Inbox,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Archive,
  Star,
  Check,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { GTDTask } from './OmnipresentInboxSection';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  inboxTasks: GTDTask[];
  onTasksCleared: () => void;
  onPromoteItem?: (title: string) => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  onClose,
  inboxTasks,
  onTasksCleared,
  onPromoteItem,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Items to purge to zero
  const [purgeList, setPurgeList] = useState<string[]>([
    "Voicemail note from Tuesday: client feedback on UX architecture",
    "Digital receipt for flight to SF developer conference",
    "Unsorted Slack snippet: investigate database backup snapshot frequency",
    "Jotted reminder: verify automobile registration status"
  ]);

  // Step 2: Projects to audit
  const [projectsList, setProjectsList] = useState([
    { id: 1, name: "Launch GTD Micro-SaaS MVP", status: "In Progress", actionsDone: 14, hasNextAction: true },
    { id: 2, name: "Annual 2025 Tax Documentation", status: "Ready to Archive", actionsDone: 6, hasNextAction: false },
    { id: 3, name: "Home Office Ergonomic Overhaul", status: "Completed", actionsDone: 4, hasNextAction: false },
    { id: 4, name: "Quarterly Marketing Campaign", status: "In Progress", actionsDone: 9, hasNextAction: true },
  ]);

  // Step 3: Someday / Maybe incubator list
  const [somedayList, setSomedayList] = useState([
    { id: 1, title: "Learn Swift UI and Metal for visionOS spatial apps", status: "incubating" },
    { id: 2, title: "Build custom cedar wood standing desk for home office", status: "incubating" },
    { id: 3, title: "Plan 14-day trekking trip through Hokkaido Japan", status: "incubating" },
    { id: 4, title: "Publish GTD systems architecture whitepaper on Substack", status: "incubating" },
  ]);

  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      // Complete review
      onTasksCleared();
      onClose();
    }
  };

  const handleArchiveProject = (id: number) => {
    setProjectsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Archived", hasNextAction: false } : p))
    );
  };

  const handlePromoteSomeday = (id: number, title: string) => {
    setSomedayList((prev) => prev.filter((item) => item.id !== id));
    onPromoteItem?.(title);
    setAuditMessage(`Promoted "${title}" to Active Projects with Next Action!`);
    setTimeout(() => setAuditMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto">
      {/* Top Banner (Forced Lockout HUD) */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                DASHBOARD LOCKED
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                The System Purge: Weekly Maintenance Protocol
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              GTD Requirement: Forced weekly maintenance cycle to ensure 100% system trust and zero mental residue.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Lockout</span>
        </button>
      </div>

      {/* Main Wizard Content Area */}
      <div className="max-w-4xl mx-auto w-full p-6 flex-1 flex flex-col justify-center">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Phase {currentStep} of 3
            </span>
            <span className="text-xs text-slate-400">
              {currentStep === 1
                ? 'Phase 1: Get Clear (Empty the Inbox)'
                : currentStep === 2
                ? 'Phase 2: Get Current (Project Audit)'
                : 'Phase 3: Get Creative (Someday/Maybe)'}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-indigo-500 transition-all duration-300 h-full"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div
              className={`p-2.5 rounded-xl border text-xs font-medium transition ${
                currentStep === 1
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              1. Empty Inbox to Zero
            </div>
            <div
              className={`p-2.5 rounded-xl border text-xs font-medium transition ${
                currentStep === 2
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              2. Check Completed Projects
            </div>
            <div
              className={`p-2.5 rounded-xl border text-xs font-medium transition ${
                currentStep === 3
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              3. Review Someday / Maybe
            </div>
          </div>
        </div>

        {/* Step 1: Empty the Inbox */}
        {currentStep === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <Inbox className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Step 1: Empty the Inbox to Zero</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Review every raw note, voice memo, and physical receipt. Process each item: do it, delegate it, defer it, or discard it. The inbox must reach zero.
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {purgeList.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">Inbox Zero Achieved!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    No unprocessed items remain in mental RAM. You are ready for Phase 2.
                  </p>
                </div>
              ) : (
                purgeList.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-200">{item}</span>
                    </div>

                    <button
                      onClick={() => setPurgeList((prev) => prev.filter((_, i) => i !== index))}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Clarified & Filed</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Check Off Completed Projects */}
        {currentStep === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Step 2: Check Off & Archive Projects</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Audit active projects. Celebrate achievements, archive finished outcomes, and verify that EVERY active project has at least ONE defined Next Physical Action.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {projectsList.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          proj.status === 'Completed' || proj.status === 'Archived'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : proj.status === 'Ready to Archive'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>{proj.actionsDone} actions executed</span>
                      <span>•</span>
                      {proj.hasNextAction ? (
                        <span className="text-emerald-400">✓ Has active next action</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Needs next action or archive
                        </span>
                      )}
                    </div>
                  </div>

                  {proj.status === 'Ready to Archive' || proj.status === 'Completed' ? (
                    <button
                      onClick={() => handleArchiveProject(proj.id)}
                      className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition self-start sm:self-auto"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive Project</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review Someday/Maybe List */}
        {currentStep === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2 text-purple-400">
              <Star className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Step 3: Review Someday / Maybe & Tickler List</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Review dormant ideas, long-term dreams, and future incubations. Promote items whose time has arrived into active projects, or prune stale ideas.
            </p>

            {auditMessage && (
              <div className="mb-4 p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-xs text-indigo-300 flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{auditMessage}</span>
              </div>
            )}

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {somedayList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-sm text-slate-200">{item.title}</span>
                  </div>

                  <button
                    onClick={() => handlePromoteSomeday(item.id, item.title)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Promote to Active Project</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNextStep}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <span>
              {currentStep === 3 ? 'Complete Weekly Purge & Unlock Dashboard' : 'Next Maintenance Step'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
