import React, { useState } from 'react';
import {
  GitMerge,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Zap,
  RefreshCw,
  Plus,
  CheckCircle2,
  Network,
  Image,
  Video,
  Film
} from 'lucide-react';
import { GTDTask } from './OmnipresentInboxSection';
import { VisualProjectVisionModal } from './VisualProjectVisionModal';

interface ProjectCopilotSectionProps {
  onAddTasks: (tasks: GTDTask[]) => void;
}

export const ProjectCopilotSection: React.FC<ProjectCopilotSectionProps> = ({ onAddTasks }) => {
  const [goal, setGoal] = useState('Plan 3-Day Company Marketing & Product Strategy Retreat');
  const [contextNotes, setContextNotes] = useState('Location: Lake Tahoe cabin, 12 team members, budget $15,000, target date next month');
  const [isLoading, setIsLoading] = useState(false);
  const [projectResult, setProjectResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVisionStudioOpen, setIsVisionStudioOpen] = useState(false);

  const PRESET_GOALS = [
    {
      goal: "Plan 3-Day Company Marketing & Product Strategy Retreat",
      context: "12 attendees, Lake Tahoe, $15k budget, focus on 2027 roadmap"
    },
    {
      goal: "Migrate Monolithic PostgreSQL Database to Multi-Region Cloud SQL",
      context: "Zero downtime target, 500GB dataset, write downtime under 60 seconds"
    },
    {
      goal: "Launch GTD Micro-SaaS on Product Hunt & Hacker News",
      context: "Vite + Flutter web, video demo, founder comment, early-bird lifetime deal"
    }
  ];

  const handleBrainstorm = async () => {
    if (!goal.trim()) {
      setErrorMsg('Please enter a project outcome or goal before generating.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/brainstorm-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, context: contextNotes }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setProjectResult(data.project);
    } catch (err: any) {
      console.error('Project brainstorming error:', err);
      setErrorMsg(err.message || 'Brainstorming failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdoptTier1Actions = () => {
    if (!projectResult || !projectResult.tier_1_actions) return;

    const newTasks: GTDTask[] = projectResult.tier_1_actions.map((act: any, idx: number) => ({
      id: `copilot-act-${Date.now()}-${idx}`,
      raw_input: `${goal}: ${act.title}`,
      title: act.title,
      next_physical_action: act.next_physical_action,
      context_tag: act.context_tag || '@Computer',
      is_under_two_minutes: act.is_under_two_minutes ?? false,
      duration_minutes: act.duration_minutes || 15,
      energy_level: 'medium',
      item_type: 'next_action',
      clarification_reason: `Kickoff tier-1 action for project: ${goal}`,
    }));

    onAddTasks(newTasks);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
              FEATURE 6, 8 &amp; 9
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              Project Co-Pilot &amp; Visual Outcome Studio
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Break down complex outcomes with David Allen's Natural Planning Model. Create visual milestone anchors (<code className="text-purple-300">Gemini 3.1 Flash Image</code>) and outcome celebration videos (<code className="text-purple-300">Veo 3</code>).
          </p>
        </div>

        <button
          onClick={() => setIsVisionStudioOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition"
          title="Open AI Vision & Video Studio"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Visual Vision Studio (Image &amp; Veo 3)</span>
        </button>
      </div>

      {/* Preset Goals */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Presets:</span>
        {PRESET_GOALS.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setGoal(p.goal);
              setContextNotes(p.context);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          >
            {p.goal.split(' ')[0]} {p.goal.split(' ')[1]}...
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Project Goal or Desired Outcome:
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
            placeholder="e.g. Plan Company Marketing Retreat in Lake Tahoe"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Constraints &amp; Context:
          </label>
          <input
            type="text"
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
            placeholder="e.g. 12 team members, $15k budget"
          />
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={handleBrainstorm}
          disabled={isLoading || !goal.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-purple-600/25 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Decomposing &amp; Mapping...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Brainstorm Project Blueprint</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Generated Project Mind-Map & Tier-1 Next Actions */}
      {projectResult && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-6">
          {/* Vision Card */}
          <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-1">
                Natural Planning Model • Wild Success Vision:
              </span>
              <p className="text-sm text-purple-200 font-medium italic">
                "{projectResult.wild_success_vision}"
              </p>
            </div>

            <button
              onClick={() => setIsVisionStudioOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 shadow"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Visualize with AI Images &amp; Video</span>
            </button>
          </div>

          {/* Dependency Mind-Map Graph Nodes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-purple-400" />
                Structural Dependency Mind-Map
              </h3>
              <span className="text-xs text-slate-400">
                Pillars, Milestones &amp; Components
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {projectResult.mind_map_nodes?.map((node: any) => (
                <div
                  key={node.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        node.category === 'pillar'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : node.category === 'milestone'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {node.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">#{node.id}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{node.label}</h4>
                  {node.parent_id && (
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      ↳ Depends on: #{node.parent_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tier-1 Actions with Direct Adoption */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Tier-1 Kickoff Physical Actions ({projectResult.tier_1_actions?.length || 0})
                </h3>
                <p className="text-xs text-slate-400">
                  Concrete initial moves with GTD physical contexts.
                </p>
              </div>

              <button
                onClick={handleAdoptTier1Actions}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adopt All into Surfacing Dashboard</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {projectResult.tier_1_actions?.map((act: any) => (
                <div
                  key={act.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {act.context_tag}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.duration_minutes}m
                      </span>
                      {act.is_under_two_minutes && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                          2-Min
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-sm text-slate-100">{act.title}</h4>
                    <p className="text-xs text-indigo-300 italic mt-0.5">
                      → Next Physical Action: {act.next_physical_action}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 self-start sm:self-auto">
                    Node: #{act.dependency_node_id || 'root'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Project Vision Modal */}
      {isVisionStudioOpen && (
        <VisualProjectVisionModal
          goalTitle={goal}
          onClose={() => setIsVisionStudioOpen(false)}
        />
      )}
    </div>
  );
};
