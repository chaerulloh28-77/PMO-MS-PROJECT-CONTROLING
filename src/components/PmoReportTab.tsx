import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  CheckSquare,
  Clock,
  CheckCircle2,
  FolderOpen,
  Truck,
  ShieldCheck,
  Send,
  Milestone,
  ArrowLeft,
  Save,
  Check,
  AlertTriangle,
  FileCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Project, WorkflowTracking, ProjectStatus } from '../types';
import { STATUS_COLORS } from '../data/initialProjects';
import { ProjectSelector } from './ProjectSelector';
import { calculateCivilWorkDuration } from '../utils/projectMetrics';

interface PmoReportTabProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: Project) => void;
  onBack?: () => void;
  onShowToast?: (msg: string) => void;
}

export const PmoReportTab: React.FC<PmoReportTabProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onUpdateProject,
  onBack,
  onShowToast,
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const handleExplicitSave = () => {
    if (!activeProject) return;
    onUpdateProject({
      ...activeProject,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setIsSaved(true);
    if (onShowToast) {
      onShowToast(`Laporan PMO "${activeProject.name}" berhasil disimpan!`);
    }
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (!activeProject) {
    return (
      <div className="space-y-6">
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          sectionTitle="Laporan PMO"
        />
        <div className="text-center py-20 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200">
          <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Pilih Project Terlebih Dahulu</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Gunakan selector di atas untuk memilih project yang ingin Anda kelola laporan PMO dan timeline-nya.
          </p>
        </div>
      </div>
    );
  }

  // Update helper functions
  const updateProjectField = (fields: Partial<Project>) => {
    onUpdateProject({
      ...activeProject,
      ...fields,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const updatePMO = (partialPmo: Partial<Project['pmo']>) => {
    onUpdateProject({
      ...activeProject,
      pmo: {
        ...activeProject.pmo,
        ...partialPmo,
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleWorkflowChange = (
    category: 'material' | 'labour',
    field: keyof WorkflowTracking,
    value: any
  ) => {
    onUpdateProject({
      ...activeProject,
      pmo: {
        ...activeProject.pmo,
        [category]: {
          ...activeProject.pmo[category],
          [field]: value,
        },
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  // SLA Calculation
  const slaInfo = calculateCivilWorkDuration(
    activeProject.pmo.civilWork.start,
    activeProject.pmo.civilWork.end
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Kembali & Simpan) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3 sm:px-4 sm:py-3 rounded-2xl shadow-md border border-slate-800">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer active:scale-95 shadow-2xs"
          title="Kembali ke Daftar Project"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300" />
          <span>Kembali ke Daftar</span>
        </button>

        <div className="flex items-center space-x-2.5 text-xs">
          <span className="hidden md:inline text-slate-400">Laporan PMO:</span>
          <span className="font-bold text-slate-100 max-w-xs truncate">{activeProject.name}</span>
          {activeProject.area && (
            <span className="font-bold text-[11px] text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-800">
              {activeProject.area}
            </span>
          )}
          <span className="hidden sm:inline font-mono text-[11px] text-blue-400 bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-800">
            {activeProject.id}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExplicitSave}
            className={`inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
            }`}
            title="Simpan Laporan PMO Project"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan PMO</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Project Selector Header */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={onSelectProject}
        sectionTitle="Laporan PMO"
      />

      {/* MILESTONE STEPPER OVERVIEW */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
            <Milestone className="w-4 h-4 text-blue-600" />
            <span>Alur Milestone Project (End-to-End PMO Flow)</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Status Terkini: <strong className="text-slate-800">{activeProject.status}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
          {[
            { step: '1', title: 'Survey & Plan', done: Boolean(activeProject.pmo.survey || activeProject.pmo.asPlan.release) },
            { step: '2', title: 'Surat Dinas', done: Boolean(activeProject.nomorSuratDinas) },
            { step: '3', title: 'Approval Material', done: Boolean(activeProject.pmo.material.approval) },
            { step: '4', title: 'Civil Works', done: Boolean(activeProject.pmo.civilWork.end) },
            { step: '5', title: 'Pulling & Cutover', done: Boolean(activeProject.pmo.pulling.end || activeProject.pmo.cutOver.date) },
            { step: '6', title: 'TECO & Closing', done: Boolean(activeProject.pmo.closing.tecoEnd) },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-2.5 rounded-xl border text-xs transition ${
                item.done
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 mb-1">
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                )}
              </div>
              <span className="font-bold block text-[11px] truncate">{item.title}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
                {item.done ? 'Terpenuhi' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PHASE 1: AS PLAN DRAWING & SURAT DINAS (2 SYMMETRICAL BALANCED COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: As Plan Drawing & Survey */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">As Plan Drawing & Trase Survey</h3>
                <p className="text-xs text-slate-500">Perencanaan trase jalur optik dan validasi lapangan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Request Drawing</label>
                <input
                  type="date"
                  value={activeProject.pmo.asPlan.request}
                  onChange={(e) =>
                    updatePMO({
                      asPlan: { ...activeProject.pmo.asPlan, request: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Release Drawing</label>
                <input
                  type="date"
                  value={activeProject.pmo.asPlan.release}
                  onChange={(e) =>
                    updatePMO({
                      asPlan: { ...activeProject.pmo.asPlan, release: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Ditambahkan setelah Release: MR & Project ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Nomor MR (Material Request)</span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Setelah Release</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: MR-2026-JKT-0891"
                  value={activeProject.pmo.asPlan.mr || ''}
                  onChange={(e) =>
                    updatePMO({
                      asPlan: { ...activeProject.pmo.asPlan, mr: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Project ID</span>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">Setelah Release</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PRJ-WBS-902144"
                  value={activeProject.pmo.asPlan.projectId || ''}
                  onChange={(e) =>
                    updatePMO({
                      asPlan: { ...activeProject.pmo.asPlan, projectId: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Trase Survey Lapangan</label>
                <input
                  type="date"
                  value={activeProject.pmo.survey}
                  onChange={(e) => updatePMO({ survey: e.target.value })}
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Surat Dinas & Perizinan Wilayah (Matching Height & Layout) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Surat Dinas & Perizinan Pemda/PU</h3>
                <p className="text-xs text-slate-500">Legalitas izin trase, AMDAL lalin, dan sosialisasi wilayah</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Surat Dinas / Izin Trase</label>
                <input
                  type="text"
                  value={activeProject.nomorSuratDinas || ''}
                  onChange={(e) => updateProjectField({ nomorSuratDinas: e.target.value })}
                  placeholder="Contoh: 503/PU-TR/JKT/2025"
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 shadow-2xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Surat Dinas</label>
                <input
                  type="date"
                  value={activeProject.tanggalSuratDinas || ''}
                  onChange={(e) => updateProjectField({ tanggalSuratDinas: e.target.value })}
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Pipeline</label>
                <select
                  value={activeProject.status}
                  onChange={(e) => updateProjectField({ status: e.target.value as ProjectStatus })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Not Yet">Not Yet / Persiapan</option>
                  <option value="In Progress">In Progress / Pelaksanaan</option>
                  <option value="Done">Done / Selesai</option>
                  <option value="Pending/Cancel/Hold">Pending / Cancel / Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 2: JADWAL CIVIL WORK & PULLING CABLE (2 SYMMETRICAL BALANCED COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Civil Work Timeline & 90-Day SLA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Jadwal Civil Work & 90-Day SLA</h3>
                  <p className="text-xs text-slate-500">Pekerjaan sipil galian, boring, dan struktur bawah tanah</p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${slaInfo.badgeClass}`}>
                {slaInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Civil Work (Start)</label>
                <input
                  type="date"
                  value={activeProject.pmo.civilWork.start}
                  onChange={(e) =>
                    updatePMO({
                      civilWork: { ...activeProject.pmo.civilWork, start: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Civil Work (End)</label>
                <input
                  type="date"
                  value={activeProject.pmo.civilWork.end}
                  onChange={(e) =>
                    updatePMO({
                      civilWork: { ...activeProject.pmo.civilWork, end: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Deadline Kontraktual 90 Hari</label>
                <input
                  type="date"
                  value={activeProject.pmo.civilWork.deadline}
                  onChange={(e) =>
                    updatePMO({
                      civilWork: { ...activeProject.pmo.civilWork, deadline: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pulling Cable Timeline (Matching Height & Layout) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jadwal Penarikan Kabel (Pulling FO)</h3>
                <p className="text-xs text-slate-500">Mobilisasi drum kabel ke lokasi hingga penarikan tuntas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Material On-Site (Kabel Tiba di Lokasi)</label>
                <input
                  type="date"
                  value={activeProject.pmo.pulling.matOnSite}
                  onChange={(e) =>
                    updatePMO({
                      pulling: { ...activeProject.pmo.pulling, matOnSite: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pulling Cable (Start)</label>
                <input
                  type="date"
                  value={activeProject.pmo.pulling.start}
                  onChange={(e) =>
                    updatePMO({
                      pulling: { ...activeProject.pmo.pulling, start: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pulling Cable (End)</label>
                <input
                  type="date"
                  value={activeProject.pmo.pulling.end}
                  onChange={(e) =>
                    updatePMO({
                      pulling: { ...activeProject.pmo.pulling, end: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 3: WORKFLOW APPROVAL (MATERIAL & LABOUR - 2 BALANCED CARDS) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Alur Persetujuan & Material Request (MR)</h3>
              <p className="text-xs text-slate-500">Tahapan submit, review, dan approval pengadaan material & tenaga kerja</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Workflow 1: Material Tracking */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Tracking Pengadaan Material</span>
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeProject.pmo.material.approval
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {activeProject.pmo.material.approval ? 'APPROVED' : 'IN REVIEW'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Tanggal Pengajuan</label>
                <input
                  type="date"
                  value={activeProject.pmo.material.date}
                  onChange={(e) => handleWorkflowChange('material', 'date', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nomor Release MR</label>
                <input
                  type="text"
                  value={activeProject.pmo.material.releaseMR}
                  onChange={(e) => handleWorkflowChange('material', 'releaseMR', e.target.value)}
                  placeholder="MR-2025-001"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                />
              </div>
            </div>

            {/* Stepper Checkboxes */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={activeProject.pmo.material.submit}
                  onChange={(e) => handleWorkflowChange('material', 'submit', e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">1. Submit</span>
              </label>

              <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={activeProject.pmo.material.review}
                  onChange={(e) => handleWorkflowChange('material', 'review', e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">2. Review</span>
              </label>

              <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={activeProject.pmo.material.approval}
                  onChange={(e) => handleWorkflowChange('material', 'approval', e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">3. Approved</span>
              </label>
            </div>
          </div>

          {/* Workflow 2: Labour Tracking (Matching Height & Layout) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Tracking Tenaga Kerja (Labour/Vendor)</span>
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeProject.pmo.labour.approval
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {activeProject.pmo.labour.approval ? 'APPROVED' : 'IN REVIEW'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Tanggal Pengajuan</label>
                <input
                  type="date"
                  value={activeProject.pmo.labour.date}
                  onChange={(e) => handleWorkflowChange('labour', 'date', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nomor SPK / Release LR</label>
                <input
                  type="text"
                  value={activeProject.pmo.labour.releaseMR}
                  onChange={(e) => handleWorkflowChange('labour', 'releaseMR', e.target.value)}
                  placeholder="LR-2025-001"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                />
              </div>
            </div>

            {/* Stepper Checkboxes */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={activeProject.pmo.labour.submit}
                  onChange={(e) => handleWorkflowChange('labour', 'submit', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">1. Submit</span>
              </label>

              <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={activeProject.pmo.labour.review}
                  onChange={(e) => handleWorkflowChange('labour', 'review', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">2. Review</span>
              </label>

              <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={activeProject.pmo.labour.approval}
                  onChange={(e) => handleWorkflowChange('labour', 'approval', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">3. Approved</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 4: COMMISSIONING, CUT OVER & PROJECT CLOSING (4 SYMMETRICAL COLUMNS) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cut Over, As Built Drawing & Closing TECO SAP</h3>
              <p className="text-xs text-slate-500">Tahap akhir migrasi trafik kabel dan administrasi penutupan project di SAP</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card A: RCF */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                Change Notice
              </span>
              <h4 className="text-xs font-bold text-slate-800 mt-1.5 mb-3">Request For Change (RCF)</h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">RCF Request</label>
                  <input
                    type="date"
                    value={activeProject.pmo.rcf.request}
                    onChange={(e) => updatePMO({ rcf: { ...activeProject.pmo.rcf, request: e.target.value } })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">RCF Release</label>
                  <input
                    type="date"
                    value={activeProject.pmo.rcf.release}
                    onChange={(e) => updatePMO({ rcf: { ...activeProject.pmo.rcf, release: e.target.value } })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Cut Over */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                Migration
              </span>
              <h4 className="text-xs font-bold text-slate-800 mt-1.5 mb-3">Cut Over & Migrasi Trafik</h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Tanggal Cut Over</label>
                  <input
                    type="date"
                    value={activeProject.pmo.cutOver.date}
                    onChange={(e) => updatePMO({ cutOver: { ...activeProject.pmo.cutOver, date: e.target.value } })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Fase / Keterangan</label>
                  <input
                    type="text"
                    value={activeProject.pmo.cutOver.phase}
                    onChange={(e) => updatePMO({ cutOver: { ...activeProject.pmo.cutOver, phase: e.target.value } })}
                    placeholder="Phase 1 - Core 1-96"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card C: As Built Drawing */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                Dokumentasi
              </span>
              <h4 className="text-xs font-bold text-slate-800 mt-1.5 mb-3">Dokumen As-Built (ABD)</h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Dokumen Start</label>
                  <input
                    type="date"
                    value={activeProject.pmo.closing.docStart}
                    onChange={(e) => updatePMO({ closing: { ...activeProject.pmo.closing, docStart: e.target.value } })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Dokumen End / BAST</label>
                  <input
                    type="date"
                    value={activeProject.pmo.closing.docEnd}
                    onChange={(e) => updatePMO({ closing: { ...activeProject.pmo.closing, docEnd: e.target.value } })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card D: TECO SAP */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                SAP ERP
              </span>
              <h4 className="text-xs font-bold text-slate-800 mt-1.5 mb-3">Status TECO SAP</h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">TECO Start</label>
                  <input
                    type="date"
                    value={activeProject.pmo.closing.tecoStart}
                    onChange={(e) => updatePMO({ closing: { ...activeProject.pmo.closing, tecoStart: e.target.value } })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">TECO End (Tuntas)</label>
                  <input
                    type="date"
                    value={activeProject.pmo.closing.tecoEnd}
                    onChange={(e) => updatePMO({ closing: { ...activeProject.pmo.closing, tecoEnd: e.target.value } })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks / Catatan Project */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <label className="block text-xs font-bold text-slate-800 mb-2">Catatan Khusus / Remarks PMO</label>
        <textarea
          rows={3}
          value={activeProject.remarks}
          onChange={(e) => updateProjectField({ remarks: e.target.value })}
          placeholder="Tuliskan kendala izin wilayah, hambatan galian, koordinasi pihak ketiga, atau catatan teknis..."
          className="w-full bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Project</span>
          </button>
          <span className="hidden sm:inline text-xs text-slate-500">
            Terakhir diupdate: <span className="font-semibold text-slate-700">{activeProject.updatedAt || 'Hari ini'}</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExplicitSave}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md transition cursor-pointer active:scale-95 ${
              isSaved
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Laporan Berhasil Disimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Laporan PMO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
