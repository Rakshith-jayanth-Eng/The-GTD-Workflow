import React from 'react';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Smartphone,
  Server,
  Cpu,
  Clock,
  MapPin,
  Lock,
  CheckCircle,
  GitBranch,
  Database
} from 'lucide-react';

export const ArchitectureDiagrams: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-8">
      {/* Header */}
      <div className="pb-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
            SYSTEM TOPOLOGY
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            GTD Micro-SaaS Architectural Workflows
          </h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          End-to-end data pipelines connecting Flutter cross-platform clients, Python FastAPI microservices, and Google Gemini API models.
        </p>
      </div>

      {/* Workflow 1: Omnipresent Inbox & Triage Pipeline */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            1. Omnipresent Inbox & Triage Pipeline (Features 1, 2 & 3)
          </h3>
          <span className="text-xs font-mono text-slate-500">POST /api/v1/parse-inbox</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>FLUTTER CLIENT</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Capture Brain Dump</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                User dictates audio via speech-to-text or types unstructured notes into sticky bottom sheet.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-blue-300 bg-blue-950/40 p-1.5 rounded">
              Payload: {`{ text: "raw brain dump" }`}
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <Server className="w-3.5 h-3.5" />
                <span>FASTAPI BACKEND</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Triage Gateway</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Validates Pydantic schema, verifies API token, and prepares structured Gemini instructions.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-emerald-300 bg-emerald-950/40 p-1.5 rounded">
              google-genai Client + types.GenerateContentConfig
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>GEMINI 2.5 / FLASH</span>
              </div>
              <h4 className="text-xs font-semibold text-white">GTD Reasoner</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Extracts atomic tasks, invents physical next action verbs, flags 2-min rule, and classifies contexts.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-purple-300 bg-purple-950/40 p-1.5 rounded">
              Strict JSON response_schema enforcement
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>GTD INVENTORY</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Bucket Distribution</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Tasks routed to Next Actions (@Contexts), Projects list, Waiting For, or Someday/Maybe.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-amber-300 bg-amber-950/40 p-1.5 rounded">
              @Phone, @Computer, @Errands, @Office
            </div>
          </div>
        </div>
      </div>

      {/* Workflow 2: Dynamic Task Surfacing Sensor Loop */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            2. Dynamic Task Surfacing Real-Time Sensor Loop (Feature 5)
          </h3>
          <span className="text-xs font-mono text-slate-500">Native Sensor Reactivity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>SENSOR 1: DEVICE CALENDAR</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Time Window Hard Filter</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              If the native calendar plugin detects a scheduled commitment starting in <strong>&lt; 15 minutes</strong>, the widget applies an immediate strict filter:
            </p>
            <div className="mt-2 p-2 rounded bg-slate-950 text-[11px] text-amber-300 font-mono">
              tasks.where((t) =&gt; t.durationMinutes &lt;= 10)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>SENSOR 2: GPS GEOFENCING</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Context Score Elevation</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              When device GPS coordinates intersect commercial/retail coordinates:
            </p>
            <div className="mt-2 p-2 rounded bg-slate-950 text-[11px] text-emerald-300 font-mono">
              score += 100 for @Errands; Office coordinates boost @Office &amp; @Computer
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>STREAM PROVIDER</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Instant-Win Prioritization</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              During crunch windows, tasks tagged <strong>is_under_two_minutes</strong> receive priority surfacing with 1-click sprint execution.
            </p>
            <div className="mt-2 p-2 rounded bg-slate-950 text-[11px] text-purple-300 font-mono">
              Zero cognitive load: "Do this 90s action now"
            </div>
          </div>
        </div>
      </div>

      {/* Workflow 3: The System Purge Weekly Review */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            3. The System Purge (Weekly Review Lockout Wizard) (Feature 4)
          </h3>
          <span className="text-xs font-mono text-slate-500">Full Dashboard Lockout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-bold text-amber-400 mb-1">PHASE 1: GET CLEAR</div>
            <h4 className="text-xs font-semibold text-white">Empty Inbox to Zero</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Processes all unprocessed papers, notes, emails, and voice memos. The wizard strictly prevents proceeding until the inbox count is 0.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-bold text-blue-400 mb-1">PHASE 2: GET CURRENT</div>
            <h4 className="text-xs font-semibold text-white">Project Inventory Audit</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Every single active project is inspected. Archive completed goals; enforce that every active project has at least 1 next physical action.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-bold text-purple-400 mb-1">PHASE 3: GET CREATIVE</div>
            <h4 className="text-xs font-semibold text-white">Someday / Maybe Incubator</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Review aspirational dreams. Promote newly relevant items into active projects; purge obsolete ideas to maintain a lean mental inventory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
