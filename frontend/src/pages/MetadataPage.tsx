import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { extractMetadataApi } from '../services/api';
import { MetadataResponse } from '../types/stego';
import { FileSearch, Camera, Cpu, Calendar, Image as ImageIcon, Info, CheckCircle2, XCircle } from 'lucide-react';

interface MetadataPageProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export const MetadataPage: React.FC<MetadataPageProps> = ({ onNotify }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      onNotify('Please select an image to inspect.', 'warning');
      return;
    }

    setLoading(true);
    setMetadata(null);

    try {
      const data = await extractMetadataApi(imageFile);
      setMetadata(data);
      onNotify('Image metadata parsed successfully.', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to extract metadata.';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <form onSubmit={handleInspect} className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-cyan-400" />
            <span>EXIF & Image Header Analysis</span>
          </h2>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
            Camera Hardware • Timestamps
          </span>
        </div>

        <Dropzone
          label="Upload Target Image"
          selectedFile={imageFile}
          onFileSelect={setImageFile}
          helperText="PNG, JPEG, or BMP image"
        />

        <button
          type="submit"
          disabled={loading || !imageFile}
          className="w-full py-3 rounded-xl cyber-button text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Extracting Header Tags...</span>
          ) : (
            <>
              <FileSearch className="w-4 h-4" />
              <span>Extract Metadata Tags</span>
            </>
          )}
        </button>
      </form>

      {/* Metadata Breakdown Card */}
      {metadata && (
        <div className="space-y-6">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>DIMENSIONS & MODE</span>
              </span>
              <span className="text-slate-100 font-bold text-sm">{metadata.dimensions}</span>
              <span className="text-slate-400 block text-[10px]">Mode: {metadata.mode} • Format: {metadata.format}</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>CAMERA HARDWARE</span>
              </span>
              <span className="text-slate-100 font-bold text-sm">{metadata.camera_model || 'Not Detected'}</span>
              <span className="text-slate-400 block text-[10px]">Make: {metadata.camera_make || 'N/A'}</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>SOFTWARE ENCODER</span>
              </span>
              <span className="text-slate-100 font-bold text-sm truncate block" title={metadata.software || 'None'}>
                {metadata.software || 'Standard / None'}
              </span>
              <span className="text-slate-400 block text-[10px]">{metadata.color_profile}</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>TIMESTAMP DATA</span>
              </span>
              <span className="text-slate-100 font-bold text-sm truncate block">{metadata.date_time || 'No Tag'}</span>
              <span className="text-slate-400 block text-[10px]">EXIF Timestamp</span>
            </div>
          </div>

          {/* Detailed EXIF Table */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono">Full EXIF Header Dump</h3>
              <div className="flex items-center gap-2 text-xs font-mono">
                {metadata.has_exif ? (
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>EXIF Present</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>No EXIF Tags (Stripped / Clean)</span>
                  </span>
                )}
              </div>
            </div>

            {!metadata.has_exif || Object.keys(metadata.exif_data).length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
                <Info className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-400">
                  No EXIF metadata found. Digital images created or processed by steganography tools frequently strip metadata headers to sanitize file overhead.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3">EXIF Tag</th>
                      <th className="p-3">Decoded Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {Object.entries(metadata.exif_data).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-cyan-400">{key}</td>
                        <td className="p-3 text-slate-200 truncate max-w-md" title={String(val)}>
                          {String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
