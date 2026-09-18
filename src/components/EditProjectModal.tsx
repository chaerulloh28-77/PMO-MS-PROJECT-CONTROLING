import React, { useState, useEffect } from 'react';
import {
  X,
  FileEdit,
  Calendar,
  AlertCircle,
  Tag,
  Hash,
  Clock,
  ArrowLeft,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Project) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [tanggalSuratDinas, setTanggalSuratDinas] = useState('');
  const [nomorSuratDinas, setNomorSuratDinas] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Not Yet');
  const [remarks, setRemarks] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setTanggalSuratDinas(project.tanggalSuratDinas || '');
      setNomorSuratDinas(project.nomorSuratDinas || '');
      setStatus(project.status || 'Not Yet');
      setRemarks(project.remarks || '');
      setIsSavedRecently(false);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Project = {
      ...project,
      name: name.trim(),
      tanggalSuratDinas: tanggalSuratDinas.trim(),
      nomorSuratDinas: nomorSuratDinas.trim(),
      status,
      remarks: remarks.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onSave(updated);
    setIsSavedRecently(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleSetToday = () => {
    setTanggalSuratDinas(new Date().toISOString().slice(0, 10));
  };

  return (
    <div
      id="edit-project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="edit-project-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Edit Data Project
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {project.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Perbarui identitas, status pipeline, surat dinas, dan catatan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Project <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama proyek relokasi fiber optic..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs font-medium"
            />
          </div>

          {/* Tanggal Surat Dinas */}
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
                Set Hari Ini
              </button>
            </div>
            <input
              type="date"
              value={tanggalSuratDinas}
              onChange={(e) => setTanggalSuratDinas(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-mono shadow-2xs cursor-pointer"
            />
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs font-medium cursor-pointer"
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
              <span>Remarks (Catatan)</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Catatan progres, izin utilitas, atau dinas terkait..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs"
            />
          </div>

          {/* Action Buttons with prominent Kembali & Simpan */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
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
              className={`inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-xl text-white shadow-sm transition active:scale-[0.98] cursor-pointer ${
                isSavedRecently
                  ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSavedRecently ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
