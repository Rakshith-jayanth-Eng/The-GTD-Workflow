import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Sparkles,
  ExternalLink,
  Clock,
  Navigation,
  X,
  RefreshCw,
  Search
} from 'lucide-react';
import { GTDTask } from './OmnipresentInboxSection';

interface TaskEnrichmentModalProps {
  task: GTDTask | null;
  onClose: () => void;
  initialMode?: 'search' | 'maps';
}

export const TaskEnrichmentModal: React.FC<TaskEnrichmentModalProps> = ({
  task,
  onClose,
  initialMode = 'search',
}) => {
  const [mode, setMode] = useState<'search' | 'maps'>(
    task?.context_tag === '@Errands' ? 'maps' : initialMode
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [mapsResult, setMapsResult] = useState<any>(null);

  if (!task) return null;

  const handleFetchSearchGrounding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${task.title} ${task.next_physical_action}`,
          taskTitle: task.title,
        }),
      });
      const data = await response.json();
      setSearchResult(data);
    } catch (err) {
      console.warn('Search grounding fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchMapsGrounding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationQuery: task.next_physical_action || task.title,
          errandType: task.title,
        }),
      });
      const data = await response.json();
      setMapsResult(data);
    } catch (err) {
      console.warn('Maps grounding fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch if not already fetched
  React.useEffect(() => {
    if (mode === 'search' && !searchResult) {
      handleFetchSearchGrounding();
    } else if (mode === 'maps' && !mapsResult) {
      handleFetchMapsGrounding();
    }
  }, [mode, task]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Task Context Grounding
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-md">
              {task.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 mt-4 pb-2">
          <button
            onClick={() => setMode('search')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'search'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google Search Facts</span>
          </button>

          <button
            onClick={() => setMode('maps')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'maps'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google Maps Locations</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-4 min-h-[180px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
              <span>
                {mode === 'search'
                  ? 'Grounding with live Google Search data (gemini-3.5-flash)...'
                  : 'Retrieving nearby locations with Google Maps tool...'}
              </span>
            </div>
          ) : mode === 'search' ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Live Web Grounding Summary:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {searchResult?.answer || 'No search information retrieved yet.'}
                </p>
              </div>

              {searchResult?.sources?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Verified Grounded Web Sources:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.sources.map((source: any, idx: number) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs flex items-center justify-between group transition"
                      >
                        <span className="truncate text-slate-300 group-hover:text-blue-300">
                          {source.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 ml-1 group-hover:text-blue-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Google Maps Errands Guidance:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {mapsResult?.recommendation || 'No maps recommendations retrieved.'}
                </p>
              </div>

              {mapsResult?.places?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Recommended Stops &amp; Venues:
                  </span>
                  <div className="space-y-2">
                    {mapsResult.places.map((place: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {place.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">{place.address}</p>
                          <span className="text-[10px] text-emerald-300 font-mono mt-1 block">
                            {place.details}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Powered by Gemini 3.5 Flash Tool Grounding
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
