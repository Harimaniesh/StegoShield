import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, X, CheckCircle2, FileText } from 'lucide-react';

interface DropzoneProps {
  label: string;
  acceptTypes?: string;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  helperText?: string;
  previewUrl?: string | null;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  label,
  acceptTypes = 'image/png, image/jpeg, image/bmp',
  selectedFile,
  onFileSelect,
  helperText = 'PNG, JPEG, or BMP up to 15MB',
  previewUrl
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
        {label}
      </label>

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 glass-panel ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : 'border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            className="hidden"
            onChange={handleChange}
          />
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <UploadCloud className="w-6 h-6 animate-bounce" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            Click to upload or drag & drop file
          </p>
          <p className="text-xs text-slate-400 mt-1 font-mono">{helperText}</p>
        </div>
      ) : (
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-14 h-14 object-cover rounded-lg border border-slate-700 bg-slate-900"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileImage className="w-6 h-6" />
              </div>
            )}

            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-100 truncate">
                  {selectedFile.name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Binary file'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
