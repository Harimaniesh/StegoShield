import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { compareImagesApi } from '../services/api';
import { ComparisonResponse } from '../types/stego';
import { GitCompare, Eye, AlertTriangle, Layers } from 'lucide-react';

interface ComparisonPageProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ onNotify }) => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ComparisonResponse | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalFile || !stegoFile) {
      onNotify('Please select both original and stego images.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await compareImagesApi(originalFile, stegoFile);
      setResult(data);
      onNotify('Forensic image comparison complete.', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Image comparison failed.';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <form onSubmit={handleCompare} className="glass-panel p-6 rounded-xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <span>Forensic Image Comparison</span>
          </h2>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
            PSNR • MAE • Pixel Difference Map
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Dropzone
            label="1. Original Clean Image"
            selectedFile={originalFile}
            onFileSelect={setOriginalFile}
            helperText="Original cover image before embedding"
          />

          <Dropzone
            label="2. Modified Stego Image"
            selectedFile={stegoFile}
            onFileSelect={setStegoFile}
            helperText="Stego image containing embedded payload"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !originalFile || !stegoFile}
          className="w-full py-3 rounded-xl cyber-button text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Computing Pixel Map & PSNR...</span>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Compare Original vs Stego Image</span>
            </>
          )}
        </button>
      </form>

      {/* Comparison Results Card */}
      {result && (
        <div className="space-y-6">
          {/* Comparative Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">PSNR (NOISE RATIO)</span>
              <span className="text-cyan-400 font-bold text-sm">{result.peak_signal_noise_ratio} dB</span>
              <span className="text-slate-400 block text-[10px]">High PSNR indicates high fidelity</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">MEAN ABSOLUTE ERROR</span>
              <span className="text-cyan-400 font-bold text-sm">{result.mean_absolute_error}</span>
              <span className="text-slate-400 block text-[10px]">Average RGB intensity diff</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">CHANGED PIXEL COUNT</span>
              <span className="text-emerald-400 font-bold text-sm">{result.changed_pixels_count.toLocaleString()}</span>
              <span className="text-slate-400 block text-[10px]">Pixels modified</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">CHANGED PIXEL %</span>
              <span className="text-emerald-400 font-bold text-sm">{result.changed_pixels_percentage}%</span>
              <span className="text-slate-400 block text-[10px]">Ratio of total image</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">DIMENSIONS MATCH</span>
              <span className={`font-bold text-sm ${result.dimensions_match ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.dimensions_match ? 'Matched' : 'Mismatch'}
              </span>
              <span className="text-slate-400 block text-[10px]">{result.original_dimensions}</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">FILE SIZE DIFFERENCE</span>
              <span className="text-cyan-400 font-bold text-sm">{result.file_size_diff_bytes} Bytes</span>
              <span className="text-slate-400 block text-[10px]">Stego size delta</span>
            </div>
          </div>

          {/* Visual Difference Heatmap Card */}
          <div className="glass-panel-glow p-6 rounded-xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Visual Difference Heatmap Map</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400">Amplified 25x LSB Contrast</span>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              The heatmap amplifies pixel-level LSB modifications. Blue/cyan areas represent unchanged pixels, while glowing red/magenta regions highlight modified pixel coordinates.
            </p>

            <div className="flex justify-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <img
                src={result.diff_map_url}
                alt="Visual Difference Heatmap"
                className="max-h-[400px] object-contain rounded-lg border border-slate-700 shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
