import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  ExternalLink,
  HardHat,
  FileText,
  AlertCircle,
  Calendar,
  Save,
  FileEdit,
  CheckCircle2,
  Check,
  FolderKanban,
  SlidersHorizontal,
} from 'lucide-react';
import { Project, ProjectStatus, TabType } from '../types';
import { STATUS_COLORS } from '../data/initialProjects';
import { EditProjectModal } from './EditProjectModal';
import { calculateProjectCompletion, calculatePullingFOMetrics } from '../utils/projectMetrics';

interface ProjectListTabProps {
  projects: Project[];
  onAddNewProject: () => void;
  onUpdateProject: (updated: Project) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (id: string) => void;
  onSelectTab: (tab: TabType) => void;
}

export const ProjectListTab: React.FC<ProjectListTabProps> = ({
  projects,
  onAddNewProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProject,
  onSelectTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [savedRowId, setSavedRowId] = useState<string | null>(null);

  const filterCounts = {
    ALL: projects.length,
    'In Progress': projects.filter((p) => p.status === 'In Progress').length,
    Done: projects.filter((p) => p.status === 'Done').length,
    'Not Yet': projects.filter((p) => p.status === 'Not Yet').length,
    'Pending/Cancel/Hold': projects.filter((p) => p.status === 'Pending/Cancel/Hold').length,
  };

  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.remarks.toLowerCase().includes(term) ||
      (p.tanggalSuratDinas && p.tanggalSuratDinas.toLowerCase().includes(term)) ||
      (p.nomorSuratDinas && p.nomorSuratDinas.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleNameChange = (project: Project, name: string) => {
    onUpdateProject({
      ...project,
      name,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleTanggalSuratDinasChange = (project: Project, tanggalSuratDinas: string) => {
    onUpdateProject({
      ...project,
      tanggalSuratDinas,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleNomorSuratDinasChange = (project: Project, nomorSuratDinas: string) => {
    onUpdateProject({
      ...project,
      nomorSuratDinas,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleStatusChange = (project: Project, status: ProjectStatus) => {
    onUpdateProject({
      ...project,
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleRemarksChange = (project: Project, remarks: string) => {
    onUpdateProject({
      ...project,
      remarks,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleSaveRow = (project: Project) => {
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSavedRowId(project.id);
    setTimeout(() => {
      setSavedRowId((prev) => (prev === project.id ? null : prev));
    }, 2000);
  };

  const confirmDelete = (id: string) => {
    onDeleteProject(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & New Project Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project List Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar master seluruh proyek fiber optic, nomor surat dinas, status pipeline, dan catatan operasional
          </p>
        </div>

        <button
          type="button"
          onClick={onAddNewProject}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Proyek Baru</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Status Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          {[
            { key: 'ALL', label: 'Semua', count: filterCounts.ALL },
            { key: 'In Progress', label: 'In Progress', count: filterCounts['In Progress'] },
            { key: 'Done', label: 'Done', count: filterCounts.Done },
            { key: 'Not Yet', label: 'Not Yet', count: filterCounts['Not Yet'] },
            { key: 'Pending/Cancel/Hold', label: 'Pending/Hold', count: filterCounts['Pending/Cancel/Hold'] },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === tab.key ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/70 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama project, ID, tgl surat, remark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Master Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <th className="py-3.5 px-4 w-72">Nama Project & ID</th>
              <th className="py-3.5 px-3 w-56">Surat Dinas (Tgl & No)</th>
              <th className="py-3.5 px-3 w-40">Status Pipeline</th>
              <th className="py-3.5 px-3 w-44">Kelengkapan Data</th>
              <th className="py-3.5 px-3">Remarks</th>
              <th className="py-3.5 px-4 text-right w-44">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400 text-xs">
                  Tidak ada data project yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => {
                const completion = calculateProjectCompletion(p);
                const foMetrics = calculatePullingFOMetrics(p.construction?.pullingFO);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    {/* Name & ID */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleNameChange(p, e.target.value)}
                          placeholder="Ketik nama project..."
                          className="w-full font-bold text-slate-900 border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-lg px-2 py-1 bg-transparent text-xs transition"
                        />
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 px-2">
                          <span className="font-mono font-semibold text-slate-600">{p.id}</span>
                          <span>•</span>
                          <span>FO: {foMetrics.formattedMeters}m</span>
                        </div>
                      </div>
                    </td>

                    {/* Surat Dinas (Tanggal & Nomor) */}
                    <td className="py-3.5 px-3 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <input
                            type="date"
                            value={p.tanggalSuratDinas || ''}
                            onChange={(e) => handleTanggalSuratDinasChange(p, e.target.value)}
                            title="Tanggal Surat Dinas"
                            className="w-full text-xs font-mono bg-slate-50 hover:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2 py-1 text-slate-800 transition"
                          />
                        </div>
                        <input
                          type="text"
                          value={p.nomorSuratDinas || ''}
                          onChange={(e) => handleNomorSuratDinasChange(p, e.target.value)}
                          placeholder="No. Surat Dinas..."
                          className="w-full text-[11px] font-mono bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2 py-0.5 text-slate-600 placeholder:text-slate-400 transition"
                        />
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-3 align-top">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p, e.target.value as ProjectStatus)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border shadow-2xs focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          p.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : p.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : p.status === 'Pending/Cancel/Hold'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-50 text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="Not Yet">Not Yet</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Pending/Cancel/Hold">Pending/Cancel/Hold</option>
                      </select>
                    </td>

                    {/* Kelengkapan Data Progress */}
                    <td className="py-3.5 px-3 align-top">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span className="truncate">{completion.label}</span>
                          <span className="font-mono font-bold text-slate-800">{completion.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${completion.progressColor}`}
                            style={{ width: `${completion.score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3.5 px-3 align-top">
                      <input
                        type="text"
                        value={p.remarks}
                        onChange={(e) => handleRemarksChange(p, e.target.value)}
                        placeholder="Isi catatan kendala/lapangan..."
                        className="w-full text-xs text-slate-700 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2.5 py-1.5 shadow-2xs"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Simpan Row Button */}
                        <button
                          type="button"
                          onClick={() => handleSaveRow(p)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer active:scale-95 ${
                            savedRowId === p.id
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                              : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200'
                          }`}
                          title={savedRowId === p.id ? 'Tersimpan!' : 'Simpan Baris Ini'}
                        >
                          {savedRowId === p.id ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit Modal Button */}
                        <button
                          type="button"
                          onClick={() => setEditingProject(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition cursor-pointer"
                          title="Edit Detail Form Modal"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>

                        {/* Input Fisik Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(p.id);
                            onSelectTab('construction');
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 transition cursor-pointer"
                          title="Input Progres Fisik Konstruksi"
                        >
                          <HardHat className="w-4 h-4" />
                        </button>

                        {/* PMO Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(p.id);
                            onSelectTab('pmo');
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 border border-slate-200 transition cursor-pointer"
                          title="Input Laporan PMO & Timeline"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSave={(updated) => {
          onUpdateProject(updated);
          setEditingProject(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hapus Project Permanen?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tindakan ini akan menghapus seluruh data proyek, volume fisik konstruksi, dan riwayat timeline PMO.
            </p>
            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
