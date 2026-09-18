import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  HardHat,
  FileText,
  AlertCircle,
  Calendar,
  FileEdit,
  MapPin,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Project, ProjectStatus, TabType, ProjectArea, PROJECT_AREAS } from '../types';
import { STATUS_COLORS, AREA_COLORS } from '../data/initialProjects';
import { EditProjectModal } from './EditProjectModal';
import { calculateProjectCompletion, calculatePullingFOMetrics } from '../utils/projectMetrics';

interface ProjectListTabProps {
  projects: Project[];
  onAddNewProject: () => void;
  onUpdateProject: (updated: Project) => void;
  onDeleteProject: (id: string) => void;
  onClearAllProjects?: () => void;
  onSelectProject: (id: string) => void;
  onSelectTab: (tab: TabType) => void;
}

export const ProjectListTab: React.FC<ProjectListTabProps> = ({
  projects,
  onAddNewProject,
  onUpdateProject,
  onDeleteProject,
  onClearAllProjects,
  onSelectProject,
  onSelectTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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
      (p.remarks && p.remarks.toLowerCase().includes(term)) ||
      (p.area && p.area.toLowerCase().includes(term)) ||
      (p.tanggalSuratDinas && p.tanggalSuratDinas.toLowerCase().includes(term)) ||
      (p.nomorSuratDinas && p.nomorSuratDinas.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesArea = areaFilter === 'ALL' || (p.area || 'Jabo 1') === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  const confirmDelete = (id: string) => {
    onDeleteProject(id);
    setDeleteConfirmId(null);
  };

  const confirmClearAll = () => {
    if (onClearAllProjects) {
      onClearAllProjects();
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Daftar Project</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen master project relokasi fiber optik, surat dinas, kelengkapan data & timeline PMO
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {projects.length > 0 && onClearAllProjects && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-xs font-bold border border-slate-200 hover:border-rose-200 transition cursor-pointer"
              title="Kosongkan semua data project"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kosongkan Data</span>
            </button>
          )}

          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel Ramping"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu (Fit Layar)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onAddNewProject}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Project</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pill Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {[
              { key: 'ALL', label: 'Semua', count: filterCounts.ALL },
              { key: 'In Progress', label: 'In Progress', count: filterCounts['In Progress'] },
              { key: 'Done', label: 'Done', count: filterCounts.Done },
              { key: 'Not Yet', label: 'Not Yet', count: filterCounts['Not Yet'] },
              { key: 'Pending/Cancel/Hold', label: 'Hold', count: filterCounts['Pending/Cancel/Hold'] },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
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

          {/* Area Filters */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase tracking-wider flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="hidden sm:inline">Area:</span>
            </span>
            {['ALL', ...PROJECT_AREAS].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAreaFilter(a)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  areaFilter === a
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {a === 'ALL' ? 'Semua' : a}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama, ID, surat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium text-slate-800"
          />
        </div>
      </div>

      {/* EMPTY STATE IF NO PROJECTS REGISTERED */}
      {projects.length === 0 ? (
        <div className="py-16 px-4 text-center bg-slate-50/60 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs border border-blue-100">
            <HardHat className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Data Project Saat Ini Kosong</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            Tidak ada project yang tersimpan di sistem. Buat project baru untuk mulai memonitor progres pekerjaan fisik, surat dinas, dan milestone PMO lapangan.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={onAddNewProject}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Project Baru Sekarang</span>
            </button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Tidak ada data project yang sesuai dengan kata kunci atau filter yang dipilih.
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW: GUARANTEED ZERO HORIZONTAL SCROLL */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const completion = calculateProjectCompletion(p);
            const foMetrics = calculatePullingFOMetrics(p.construction?.pullingFO);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          AREA_COLORS[p.area || 'Jabo 1']?.badge || 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.area || 'Jabo 1'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 font-semibold">{p.id}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      STATUS_COLORS[p.status]?.badge || 'bg-slate-100 text-slate-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Surat Dinas & FO Info */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Surat Dinas:</span>
                      <span className="font-mono text-[11px] text-slate-700 font-medium truncate block">
                        {p.nomorSuratDinas || 'Belum ada'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.tanggalSuratDinas || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Tarikan FO:</span>
                      <span className="font-mono text-[11px] text-blue-700 font-bold block">
                        {foMetrics.formattedMeters} m
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {foMetrics.formattedKm} km
                      </span>
                    </div>
                  </div>

                  {/* Kelengkapan Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                      <span className="text-slate-500">{completion.label}</span>
                      <span className="font-mono font-bold text-slate-800">{completion.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${completion.progressColor}`}
                        style={{ width: `${completion.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(p.id);
                        onSelectTab('construction');
                      }}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="Buka Form Fisik"
                    >
                      <HardHat className="w-3.5 h-3.5" />
                      <span>Fisik</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(p.id);
                        onSelectTab('pmo');
                      }}
                      className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="Buka Laporan PMO"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PMO</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setEditingProject(p)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Edit Info Project"
                    >
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT TABLE: FIT 100% CONTAINER WIDTH (NO HORIZONTAL SCROLL) */
        <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-3.5">Nama & ID Project</th>
                <th className="py-3 px-2.5">Area</th>
                <th className="py-3 px-2.5 hidden md:table-cell">Surat Dinas</th>
                <th className="py-3 px-2.5">Status</th>
                <th className="py-3 px-2.5">Progress</th>
                <th className="py-3 px-3 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => {
                const completion = calculateProjectCompletion(p);
                const foMetrics = calculatePullingFOMetrics(p.construction?.pullingFO);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    {/* Name & ID */}
                    <td className="py-3 px-3.5 align-middle">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => setEditingProject(p)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left transition cursor-pointer line-clamp-1 block text-xs"
                          title="Klik untuk melihat/mengubah detail project"
                        >
                          {p.name}
                        </button>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span className="font-mono font-semibold text-slate-500">{p.id}</span>
                          <span>•</span>
                          <span>FO: {foMetrics.formattedMeters}m</span>
                        </div>
                      </div>
                    </td>

                    {/* Area Badge */}
                    <td className="py-3 px-2.5 align-middle">
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        AREA_COLORS[p.area || 'Jabo 1']?.badge || 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.area || 'Jabo 1'}
                      </span>
                    </td>

                    {/* Surat Dinas */}
                    <td className="py-3 px-2.5 align-middle hidden md:table-cell">
                      <div className="font-mono text-[11px] text-slate-700 truncate max-w-[180px]">
                        {p.nomorSuratDinas || '-'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.tanggalSuratDinas || 'Belum ada'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2.5 align-middle">
                      <select
                        value={p.status}
                        onChange={(e) =>
                          onUpdateProject({
                            ...p,
                            status: e.target.value as ProjectStatus,
                            updatedAt: new Date().toISOString().slice(0, 10),
                          })
                        }
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border shadow-2xs cursor-pointer ${
                          STATUS_COLORS[p.status]?.badge || 'bg-slate-50 text-slate-800'
                        }`}
                      >
                        <option value="Not Yet">Not Yet</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Pending/Cancel/Hold">Hold</option>
                      </select>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-2.5 align-middle">
                      <div className="w-24 sm:w-28">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-0.5">
                          <span className="font-mono font-bold text-slate-800">{completion.score}%</span>
                          <span className="text-[9px] text-slate-400 truncate ml-1">{completion.label}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full ${completion.progressColor}`}
                            style={{ width: `${completion.score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions: Compact Icons & Buttons */}
                    <td className="py-3 px-3 align-middle text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(p.id);
                            onSelectTab('construction');
                          }}
                          className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 transition cursor-pointer"
                          title="Input Progres Fisik Konstruksi"
                        >
                          <HardHat className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(p.id);
                            onSelectTab('pmo');
                          }}
                          className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 border border-purple-200 transition cursor-pointer"
                          title="Input Laporan PMO & Timeline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingProject(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                          title="Edit Info Project"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                          title="Hapus Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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

      {/* Delete Single Project Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hapus Project?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tindakan ini akan menghapus data project beserta seluruh progres fisik konstruksi dan timeline PMO-nya.
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

      {/* Clear All Projects Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Kosongkan Semua Data Project?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Semua data project yang ada saat ini akan dihapus bersih dari sistem penyimpanan. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
