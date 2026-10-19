import React, { useState } from 'react';
import {
  Image,
  Video,
  Sparkles,
  Play,
  Upload,
  RefreshCw,
  Film,
  Compass,
  ArrowRight,
  X
} from 'lucide-react';

interface VisualProjectVisionModalProps {
  goalTitle: string;
  onClose: () => void;
}

export const VisualProjectVisionModal: React.FC<VisualProjectVisionModalProps> = ({
  goalTitle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'animate'>('image');
  const [imagePrompt, setImagePrompt] = useState(
    `Photorealistic modern depiction of successfully completing: "${goalTitle}". Cinematic lighting, elegant design, 8k resolution.`
  );
  const [videoPrompt, setVideoPrompt] = useState(
    `Smooth cinematic 4K video showing the celebratory outcome and serene completion of: "${goalTitle}".`
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
  );
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  // Generate Image with gemini-3.1-flash-image
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, goalTitle }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.warn('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Video with veo-3.1-fast-generate-preview
  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt, aspectRatio }),
      });
      const data = await response.json();
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
      }
    } catch (err) {
      console.warn('Video generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Animate photo into video
  const handleAnimateUploadedPhoto = async () => {
    if (!uploadedPhotoUrl) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Animate this project sketch into dynamic living motion: ${goalTitle}`,
          aspectRatio,
        }),
      });
      const data = await response.json();
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
      }
    } catch (err) {
      console.warn('Photo animation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Natural Planning Model
              </span>
              <h3 className="text-base font-bold text-white">Project Vision &amp; Outcome Studio</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-lg">
              Goal: "{goalTitle}"
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'image'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Generate Vision Image (Gemini 3.1)</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'video'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Text to Video (Veo 3)</span>
          </button>

          <button
            onClick={() => setActiveTab('animate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'animate'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Animate Photo into Video (Veo 3)</span>
          </button>
        </div>

        {/* Tab 1: Image Generation */}
        {activeTab === 'image' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Visual Milestone Prompt (gemini-3.1-flash-image):
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono resize-none"
              />
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Vision Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Milestone Visual Anchor</span>
                </>
              )}
            </button>

            {generatedImageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                <img
                  src={generatedImageUrl}
                  alt="Milestone Vision"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <span className="text-[10px] text-slate-500 block text-center mt-2 font-mono">
                  Vision Anchor: Keep this image in mind to pull actions forward
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Text to Video */}
        {activeTab === 'video' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Outcome Celebration Video Prompt (veo-3.1-fast-generate-preview):
              </label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Aspect Ratio:</span>
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2.5 py-1 rounded-lg border font-mono ${
                    aspectRatio === '16:9'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  16:9 Landscape
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2.5 py-1 rounded-lg border font-mono ${
                    aspectRatio === '9:16'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  9:16 Portrait
                </button>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow ml-auto"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering Veo Video...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    <span>Generate Outcome Video</span>
                  </>
                )}
              </button>
            </div>

            {generatedVideoUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Animate Uploaded Photo into Video */}
        {activeTab === 'animate' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/60 text-center">
              {uploadedPhotoUrl ? (
                <div className="space-y-3">
                  <img
                    src={uploadedPhotoUrl}
                    alt="Uploaded Sketch"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <label className="text-xs text-indigo-400 hover:underline cursor-pointer block">
                    Choose a different photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block py-6">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-300 font-semibold block">
                    Upload a photo, sketch, or whiteboard diagram
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Veo 3 will animate it into an inspirational video clip
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {uploadedPhotoUrl && (
              <button
                onClick={handleAnimateUploadedPhoto}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Animating Photo into Video...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-3.5 h-3.5" />
                    <span>Animate into Outcome Video (Veo 3)</span>
                  </>
                )}
              </button>
            )}

            {generatedVideoUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
