import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  Filter,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  Store,
  Home,
  Navigation,
  Globe,
  Music,
  ExternalLink,
  Plus,
  ChevronDown,
  ChevronUp,
  Volume2,
  Undo2,
  Trash2
} from 'lucide-react';
import { GTDTask } from './OmnipresentInboxSection';
import { TaskEnrichmentModal } from './TaskEnrichmentModal';
import { audioEngine, speakText } from '../utils/audioEngine';

interface DynamicTaskSurfacingSimulatorProps {
  tasks: GTDTask[];
  onToggleComplete: (taskId: string) => void;
  onAddTask: (task: GTDTask) => void;
  onDeleteTask?: (taskId: string) => void;
}

export type GeofenceZone = 'commercial' | 'office' | 'home' | 'transit';

export const DynamicTaskSurfacingSimulator: React.FC<DynamicTaskSurfacingSimulatorProps> = ({
  tasks,
  onToggleComplete,
  onAddTask,
  onDeleteTask,
}) => {
  // Sensor simulation states
  const [minutesUntilMeeting, setMinutesUntilMeeting] = useState<number>(12);
  const [meetingTitle, setMeetingTitle] = useState<string>('Q3 Strategy & Budget Sync');
  const [geofence, setGeofence] = useState<GeofenceZone>('commercial');
  const [activeContextFilter, setActiveContextFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  // Quick Add Action State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAction, setQuickAction] = useState('');
  const [quickContext, setQuickContext] = useState<GTDTask['context_tag']>('@Computer');
  const [quickDuration, setQuickDuration] = useState(15);

  // Task Enrichment Modal state (Google Search & Maps Grounding)
  const [enrichmentTask, setEnrichmentTask] = useState<GTDTask | null>(null);
  const [enrichmentMode, setEnrichmentMode] = useState<'search' | 'maps'>('search');

  // 2-minute rule active execution modal/runner
  const [activeTwoMinuteTask, setActiveTwoMinuteTask] = useState<GTDTask | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [speakingTaskId, setSpeakingTaskId] = useState<string | null>(null);

  // 2-minute countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setIsTimerRunning(false);
      audioEngine.playSprintDoneCelebration();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const startTwoMinuteSprint = (task: GTDTask) => {
    setActiveTwoMinuteTask(task);
    setTimerSecondsLeft(120);
    setIsTimerRunning(true);
    // Play sprint sound
    audioEngine.play('sprint');
  };

  const completeTwoMinuteSprint = () => {
    if (activeTwoMinuteTask) {
      audioEngine.stop();
      audioEngine.playSprintDoneCelebration();
      onToggleComplete(activeTwoMinuteTask.id);
      setActiveTwoMinuteTask(null);
      setIsTimerRunning(false);
    }
  };

  const handleTaskCheck = (taskId: string) => {
    audioEngine.playTaskCompletionChime();
    onToggleComplete(taskId);
  };

  const openEnrichment = (task: GTDTask, initialMode: 'search' | 'maps') => {
    setEnrichmentTask(task);
    setEnrichmentMode(initialMode);
  };

  const handleSpeakTask = (task: GTDTask) => {
    if (speakingTaskId === task.id) {
      setSpeakingTaskId(null);
    } else {
      setSpeakingTaskId(task.id);
      speakText(`${task.title}. Next physical action: ${task.next_physical_action}. Context: ${task.context_tag}.`, () => {
        setSpeakingTaskId(null);
      });
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: GTDTask = {
      id: `task-manual-${Date.now()}`,
      raw_input: quickTitle,
      title: quickTitle.trim(),
      next_physical_action: quickAction.trim() || quickTitle.trim(),
      context_tag: quickContext,
      is_under_two_minutes: quickDuration <= 2,
      duration_minutes: quickDuration,
      energy_level: quickDuration > 30 ? 'high' : quickDuration <= 5 ? 'low' : 'medium',
      item_type: 'next_action',
      clarification_reason: 'User manual quick entry',
      completed: false
    };

    onAddTask(newTask);
    setQuickTitle('');
    setQuickAction('');
    setIsQuickAddOpen(false);
    audioEngine.playTaskCompletionChime();
  };

  // Surfacing algorithm
  const isTimeRestricted = minutesUntilMeeting <= 15;

  const activeTasksList = tasks.filter((t) => !t.completed);
  const completedTasksList = tasks.filter((t) => t.completed);

  const filteredAndRankedTasks = React.useMemo(() => {
    let list = activeTasksList;

    if (isTimeRestricted) {
      list = list.filter((t) => t.duration_minutes <= 10);
    }

    if (activeContextFilter !== 'all') {
      list = list.filter((t) => t.context_tag === activeContextFilter);
    }

    return [...list].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (geofence === 'commercial') {
        if (a.context_tag === '@Errands') scoreA += 100;
        if (b.context_tag === '@Errands') scoreB += 100;
      } else if (geofence === 'office') {
        if (a.context_tag === '@Office') scoreA += 80;
        if (a.context_tag === '@Computer') scoreA += 60;
        if (b.context_tag === '@Office') scoreB += 80;
        if (b.context_tag === '@Computer') scoreB += 60;
      } else if (geofence === 'home') {
        if (a.context_tag === '@Home') scoreA += 80;
        if (b.context_tag === '@Home') scoreB += 80;
      } else if (geofence === 'transit') {
        if (a.context_tag === '@Phone') scoreA += 90;
        if (b.context_tag === '@Phone') scoreB += 90;
      }

      if (isTimeRestricted) {
        if (a.is_under_two_minutes) scoreA += 50;
        if (b.is_under_two_minutes) scoreB += 50;
      }

      scoreA += 60 - Math.min(a.duration_minutes, 60);
      scoreB += 60 - Math.min(b.duration_minutes, 60);

      return scoreB - scoreA;
    });
  }, [activeTasksList, minutesUntilMeeting, geofence, activeContextFilter, isTimeRestricted]);

  const contextsList = ['@Phone', '@Computer', '@Errands', '@Office', '@Home', '@Anywhere'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              FEATURE 3, 5, 6 &amp; 7
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Dynamic Task Surfacing (Calendar &amp; Location Aware)
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Tasks are automatically organized by what you can do right now. Irrelevant tasks stay hidden. Enrich any task with live Google Search info or Google Maps routes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isTimeRestricted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Crunch Window: ≤ 10m actions only</span>
            </div>
          )}

          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add Action</span>
          </button>
        </div>
      </div>

      {/* Quick Add Form Drawer */}
      {isQuickAddOpen && (
        <form
          onSubmit={handleQuickAddSubmit}
          className="mt-4 p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Add New Physical Next Action
            </span>
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Task headline (e.g. Call dentist to book cleaning)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Concrete physical action (e.g. Dial 555-0199 and request morning slot)"
              value={quickAction}
              onChange={(e) => setQuickAction(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Context:</span>
              <select
                value={quickContext}
                onChange={(e) => setQuickContext(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                {contextsList.map((ctx) => (
                  <option key={ctx} value={ctx}>
                    {ctx}
                  </option>
                ))}
              </select>

              <span className="text-[11px] text-slate-400 ml-2">Duration:</span>
              <select
                value={quickDuration}
                onChange={(e) => setQuickDuration(parseInt(e.target.value, 10))}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                <option value={2}>2 min (Quick Win)</option>
                <option value={5}>5 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
            >
              Save Action
            </button>
          </div>
        </form>
      )}

      {/* Sensor Control Center */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
        {/* Calendar Sensor Simulator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Device Calendar: Minutes to Next Event
            </label>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                minutesUntilMeeting <= 15
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {minutesUntilMeeting} min left
            </span>
          </div>

          <input
            type="range"
            min="3"
            max="90"
            step="1"
            value={minutesUntilMeeting}
            onChange={(e) => setMinutesUntilMeeting(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
            <span>3m (Crunch)</span>
            <span className="text-slate-300 truncate max-w-[160px]">
              "{meetingTitle}"
            </span>
            <span>90m (Free)</span>
          </div>
        </div>

        {/* GPS Geofence Sensor Simulator */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            GPS Geofence (Your Current Location)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              onClick={() => setGeofence('commercial')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                geofence === 'commercial'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Commercial</span>
            </button>

            <button
              onClick={() => setGeofence('office')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                geofence === 'office'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Office HQ</span>
            </button>

            <button
              onClick={() => setGeofence('home')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                geofence === 'home'
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setGeofence('transit')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                geofence === 'transit'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Transit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Context Filter Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          <button
            onClick={() => setActiveContextFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
              activeContextFilter === 'all'
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            All Contexts
          </button>
          {contextsList.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveContextFilter(tag)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                activeContextFilter === tag
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {completedTasksList.length > 0 && (
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>{showCompleted ? 'Hide' : 'Show'} Completed ({completedTasksList.length})</span>
            {showCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Task Surfacing List */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Surfaced Actions ({filteredAndRankedTasks.length})
            {geofence === 'commercial' && (
              <span className="text-[10px] text-amber-400 normal-case font-normal">
                (@Errands elevated for commercial district)
              </span>
            )}
            {geofence === 'office' && (
              <span className="text-[10px] text-purple-400 normal-case font-normal">
                (@Office &amp; @Computer elevated)
              </span>
            )}
          </h3>

          <span className="text-[11px] text-slate-400">
            GTD Rule: "Clear next action verbs only"
          </span>
        </div>

        {filteredAndRankedTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-200">
              No tasks match current sensor constraints
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {isTimeRestricted
                ? `You have a calendar meeting in ${minutesUntilMeeting} minutes. Long tasks are hidden to prevent anxiety!`
                : 'All actions in this category are completed or filtered.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndRankedTasks.map((task, index) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  index === 0
                    ? 'bg-slate-950 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {index === 0 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                        Next Recommended Action
                      </span>
                    )}

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
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
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {task.context_tag}
                    </span>

                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.duration_minutes} min
                    </span>

                    {task.is_under_two_minutes && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                        2-Min Win
                      </span>
                    )}

                    <button
                      onClick={() => handleSpeakTask(task)}
                      className={`p-1 rounded transition ${
                        speakingTaskId === task.id
                          ? 'text-emerald-400 bg-emerald-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Read task aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-semibold text-sm text-slate-100">{task.title}</h4>

                  <div className="mt-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-start gap-1.5">
                    <span className="font-bold text-indigo-400 text-[11px] uppercase tracking-wide shrink-0">
                      Physical Action:
                    </span>
                    <span className="italic text-slate-200">{task.next_physical_action}</span>
                  </div>

                  {/* Grounding Enrichment Buttons */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => openEnrichment(task, 'search')}
                      className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 transition"
                      title="Ground task with live Google Search info"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Google Search Facts</span>
                    </button>

                    <button
                      onClick={() => openEnrichment(task, 'maps')}
                      className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition"
                      title="Find verified physical locations with Google Maps tool"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Google Maps Location</span>
                    </button>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                  {task.is_under_two_minutes && (
                    <button
                      onClick={() => startTwoMinuteSprint(task)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                    >
                      <Zap className="w-3 h-3 fill-white" />
                      <span>Do Now (120s)</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleTaskCheck(task.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks Accordion */}
      {showCompleted && completedTasksList.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Completed Tasks ({completedTasksList.length})
          </h4>

          <div className="space-y-2">
            {completedTasksList.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400 line-through"
              >
                <div>
                  <span className="font-semibold text-slate-300">{task.title}</span>
                  <span className="text-[10px] text-slate-500 ml-2">({task.context_tag})</span>
                </div>

                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                  title="Restore task"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Minute Sprint Execution Modal */}
      {activeTwoMinuteTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-5 h-5 fill-emerald-400" />
                <h3 className="font-bold text-base">2-Minute Rule Sprint</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Instant Win
              </span>
            </div>

            <div className="mt-5 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-950/60 border-2 border-emerald-500/40 text-emerald-400 text-3xl font-mono font-bold my-2 shadow-inner">
                {Math.floor(timerSecondsLeft / 60)}:
                {String(timerSecondsLeft % 60).padStart(2, '0')}
              </div>

              <h4 className="text-base font-bold mt-2 text-slate-100">
                {activeTwoMinuteTask.title}
              </h4>

              <div className="mt-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Physical Action to Execute Right Now:
                </span>
                <span className="text-emerald-300 italic font-medium">
                  {activeTwoMinuteTask.next_physical_action}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3">
                Do not file or schedule this. If it takes &lt; 2 minutes, do it right now!
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  audioEngine.stop();
                  setActiveTwoMinuteTask(null);
                }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Cancel / Defer
              </button>

              <button
                onClick={completeTwoMinuteSprint}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finished! Mark Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Context Grounding Modal */}
      {enrichmentTask && (
        <TaskEnrichmentModal
          task={enrichmentTask}
          initialMode={enrichmentMode}
          onClose={() => setEnrichmentTask(null)}
        />
      )}
    </div>
  );
};
