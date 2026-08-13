import React, { useState, useEffect } from 'react';
import { Dropzone } from '../components/Dropzone';
import { CapacityMeter } from '../components/CapacityMeter';
import { checkCapacityApi, embedPayloadApi } from '../services/api';
import { ImageCapacityResponse, EmbedResponse } from '../types/stego';
import { Lock, Download, FileText, Upload, ShieldCheck, Key, Hash, Sparkles } from 'lucide-react';

interface EmbedPageProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export const EmbedPage: React.FC<EmbedPageProps> = ({ onNotify }) => {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<ImageCapacityResponse | null>(null);

  const [payloadTab, setPayloadTab] = useState<'text' | 'file'>('text');
  const [secretText, setSecretText] = useState<string>('');
  const [secretFile, setSecretFile] = useState<File | null>(null);

  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [embedResult, setEmbedResult] = useState<EmbedResponse | null>(null);

  // Update image preview and capacity when cover file changes
  useEffect(() => {
    if (coverImage) {
      const url = URL.createObjectURL(coverImage);
      setPreviewUrl(url);
      
      // Query backend for capacity details
      checkCapacityApi(coverImage)
        .then((cap) => setCapacity(cap))
        .catch((err) => {
          console.error('Failed to compute capacity', err);
          onNotify('Failed to analyze cover image capacity', 'error');
        });

      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
      setCapacity(null);
    }
  }, [coverImage]);

  // Compute live payload byte size
  const payloadSizeBytes = payloadTab === 'text'
    ? new Blob([secretText]).size
    : (secretFile?.size || 0);

  const handleEmbed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      onNotify('Please select a cover PNG or JPEG image.', 'warning');
      return;
    }
    if (!password) {
      onNotify('Please specify an encryption password.', 'warning');
      return;
    }
    if (payloadTab === 'text' && !secretText.trim()) {
      onNotify('Please enter a secret text message to embed.', 'warning');
      return;
    }
    if (payloadTab === 'file' && !secretFile) {
      onNotify('Please upload a secret file to embed.', 'warning');
      return;
    }
    if (capacity && payloadSizeBytes > capacity.max_payload_bytes) {
      onNotify('Payload size exceeds image LSB capacity.', 'error');
      return;
    }

    setLoading(true);
    setEmbedResult(null);

    try {
      const result = await embedPayloadApi(
        coverImage,
        password,
        payloadTab === 'text' ? secretText : undefined,
        payloadTab === 'file' ? secretFile || undefined : undefined
      );
      setEmbedResult(result);
      onNotify('Payload encrypted with AES-256-GCM and embedded successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Embedding failed. Please check inputs.';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form Panel */}
        <form onSubmit={handleEmbed} className="glass-panel p-6 rounded-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>Embed Settings</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              AES-256-GCM
            </span>
          </div>

          {/* Cover Image Upload */}
          <Dropzone
            label="1. Select Cover Image (PNG / JPEG / BMP)"
            selectedFile={coverImage}
            onFileSelect={setCoverImage}
            previewUrl={previewUrl}
          />

          {/* Payload Specification */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              2. Secret Payload
            </label>

            {/* Sub-tabs */}
            <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setPayloadTab('text')}
                className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  payloadTab === 'text'
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Message</span>
              </button>
              <button
                type="button"
                onClick={() => setPayloadTab('file')}
                className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  payloadTab === 'file'
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Secret File</span>
              </button>
            </div>

            {payloadTab === 'text' ? (
              <textarea
                rows={4}
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                placeholder="Enter sensitive message to encrypt and embed..."
                className="w-full rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
              />
            ) : (
              <Dropzone
                label="Secret File Upload"
                acceptTypes="*/*"
                selectedFile={secretFile}
                onFileSelect={setSecretFile}
                helperText="Small binary or text document"
              />
            )}
          </div>

          {/* Encryption Password */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. Encryption Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter strong password for AES-256 PBKDF2 key..."
              className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
            />
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading || !coverImage}
            className="w-full py-3 rounded-xl cyber-button text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Encrypting & Embedding LSB...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Encrypt & Embed Payload</span>
              </>
            )}
          </button>
        </form>

        {/* Right Info & Results Panel */}
        <div className="space-y-6">
          {/* Capacity Gauge */}
          <CapacityMeter
            maxCapacityBytes={capacity?.max_payload_bytes || 0}
            payloadSizeBytes={payloadSizeBytes}
            dimensions={capacity?.dimensions || 'N/A'}
            format={capacity?.format || 'PNG'}
          />

          {/* Embedded Output Card */}
          {embedResult && (
            <div className="glass-panel-glow p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Stego Image Generated</span>
                </div>
                <span className="text-xs font-mono text-cyan-400">PNG Lossless Format</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ORIGINAL DIMENSIONS</span>
                  <span className="text-slate-200 font-semibold">{embedResult.original_dimensions}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">PAYLOAD SIZE</span>
                  <span className="text-cyan-400 font-semibold">{embedResult.payload_size_bytes} Bytes</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[10px]">ENCRYPTION STATUS</span>
                  <span className="text-emerald-400 font-semibold">{embedResult.encryption_status}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                    <Hash className="w-3 h-3 text-cyan-400" />
                    <span>STEGO IMAGE SHA-256 HASH</span>
                  </span>
                  <span className="text-slate-300 font-mono text-[11px] truncate block" title={embedResult.sha256_hash}>
                    {embedResult.sha256_hash}
                  </span>
                </div>
              </div>

              <a
                href={embedResult.stego_image_url}
                download={embedResult.stego_filename}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Download className="w-4 h-4" />
                <span>Download Stego PNG Image</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
