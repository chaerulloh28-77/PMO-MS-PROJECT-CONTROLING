import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  Plus,
  AlertCircle,
  Tag,
  Hash,
  Clock,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { ProjectStatus } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: {
    name: string;
    tanggalSuratDinas: string;
    nomorSuratDinas: string;
    status: ProjectStatus;
    remarks: string;
  }) => void;
  defaultProjectNumber?: number;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  defaultProjectNumber = 1,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState('');
  const [tanggalSuratDinas, setTanggalSuratDinas] = useState(todayStr);
  const [nomorSuratDinas, setNomorSuratDinas] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Not Yet');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Project FO Baru ${defaultProjectNumber}`;

    onCreateProject({
      name: finalName,
      tanggalSuratDinas: tanggalSuratDinas.trim(),
      nomorSuratDinas: nomorSuratDinas.trim(),
      status,
      remarks: remarks.trim(),
    });

    // Reset
    setName('');
    setTanggalSuratDinas(todayStr);
    setNomorSuratDinas('');
    setStatus('Not Yet');
    setRemarks('');
    setError(null);
    onClose();
  };

  const handleSetToday = () => {
    setTanggalSuratDinas(todayStr);
  };

  return (
    <div
      id="new-project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="new-project-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Tambah Project Baru
              </h3>
              <p className="text-xs text-slate-400">
                Input identitas proyek, tanggal surat dinas, dan status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Project <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Contoh: Relokasi FO Jalan Sudirman KM 5`}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs font-medium"
            />
          </div>

          {/* Tanggal Surat Dinas & Quick Today Button */}
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal Surat Dinas</span>
              </label>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Set Hari Ini ({todayStr})
              </button>
            </div>
            <input
              type="date"
              value={tanggalSuratDinas}
              onChange={(e) => setTanggalSuratDinas(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-mono shadow-2xs"
            />
            <p className="text-[11px] text-blue-700/80">
              Tanggal terbitnya surat dinas instruksi / rekomendasi teknis relokasi FO dari instansi terkait.
            </p>
          </div>

          {/* Nomor Surat Dinas & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Hash className="w-3 h-3 text-slate-400" />
                <span>Nomor Surat Dinas</span>
              </label>
              <input
                type="text"
                value={nomorSuratDinas}
                onChange={(e) => setNomorSuratDinas(e.target.value)}
                placeholder="Contoh: 005/124/DISPU/2026"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Status Pipeline</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs font-medium"
              >
                <option value="Not Yet">Not Yet (Persiapan)</option>
                <option value="In Progress">In Progress (Berjalan)</option>
                <option value="Done">Done (Selesai)</option>
                <option value="Pending/Cancel/Hold">Pending / Cancel / Hold</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Remarks (Catatan Awal)</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Catatan kendala, izin rute, atau PIC dinas terkait..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
