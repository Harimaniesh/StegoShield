import React, { useState } from 'react';
import { Dropzone } from '../components/Dropzone';
import { extractPayloadApi } from '../services/api';
import { ExtractResponse } from '../types/stego';
import { Unlock, Key, ShieldCheck, Download, FileText, FileCheck, Hash, AlertTriangle } from 'lucide-react';

interface ExtractPageProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export const ExtractPage: React.FC<ExtractPageProps> = ({ onNotify }) => {
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [extractResult, setExtractResult] = useState<ExtractResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stegoImage) {
      onNotify('Please upload a stego image.', 'warning');
      return;
    }
    if (!password) {
      onNotify('Please enter the decryption password.', 'warning');
      return;
    }

    setLoading(true);
    setExtractResult(null);
    setErrorMsg(null);

    try {
      const result = await extractPayloadApi(stegoImage, password);
      setExtractResult(result);
      onNotify('Payload extracted and decrypted successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Decryption failed. Invalid key or non-stego image.';
      setErrorMsg(msg);
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
            <Unlock className="w-5 h-5 text-cyan-400" />
            <span>Extract & Decrypt Payload</span>
          </h2>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
            PBKDF2 Key Derivation
          </span>
        </div>

        <form onSubmit={handleExtract} className="space-y-5">
          {/* Stego Image Dropzone */}
          <Dropzone
            label="Upload Stego Image (PNG)"
            selectedFile={stegoImage}
            onFileSelect={setStegoImage}
            helperText="Lossless PNG containing hidden AES-256-GCM payload"
          />

          {/* Decryption Password */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Decryption Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password used during embedding..."
              className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !stegoImage}
            className="w-full py-3 rounded-xl cyber-button text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Extracting & Decrypting...</span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Extract Payload</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error state alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-mono flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <strong className="block font-bold">Extraction Failed</strong>
            <span className="text-xs text-rose-300/90">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Extraction Success Card */}
      {extractResult && (
        <div className="glass-panel-glow p-6 rounded-xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>Payload Decrypted Successfully</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 uppercase">
              Payload: {extractResult.payload_type}
            </span>
          </div>

          {/* Recovered Text Display */}
          {extractResult.payload_type === 'text' && extractResult.recovered_text && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Recovered Secret Message:</span>
              </label>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-cyan-300 font-mono text-sm whitespace-pre-wrap break-all shadow-inner">
                {extractResult.recovered_text}
              </div>
            </div>
          )}

          {/* Recovered File Download */}
          {extractResult.file_download_url && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <span className="text-sm font-bold text-slate-100 font-mono block">
                    {extractResult.filename || 'recovered_file'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Size: {extractResult.payload_size_bytes} Bytes
                  </span>
                </div>
              </div>

              <a
                href={extractResult.file_download_url}
                download
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Extracted File</span>
              </a>
            </div>
          )}

          {/* SHA-256 Checksum */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block text-[10px] flex items-center gap-1">
              <Hash className="w-3 h-3 text-cyan-400" />
              <span>RECOVERED PAYLOAD SHA-256 HASH</span>
            </span>
            <span className="text-slate-300 font-mono truncate block mt-0.5" title={extractResult.sha256_hash}>
              {extractResult.sha256_hash}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
