import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Hourglass,
  AlertCircle,
  ArrowRight,
  HardHat,
  Calendar,
  Cable,
  Search,
  Filter,
} from 'lucide-react';
import { Project, ProjectStatus, TabType, ProjectArea, PROJECT_AREAS } from '../types';
import { STATUS_COLORS, AREA_COLORS } from '../data/initialProjects';
import { calculateProjectCompletion, calculatePullingFOMetrics } from '../utils/projectMetrics';
import { MapPin } from 'lucide-react';

interface PipelineTabProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onSelectTab: (tab: TabType) => void;
  onUpdateProject: (updated: Project) => void;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({
  projects,
  onSelectProject,
  onSelectTab,
  onUpdateProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');

  const columns: { status: ProjectStatus; title: string; icon: React.ReactNode; headerBg: string; badgeColor: string }[] = [
    {
      status: 'Done',
      title: 'Done / Selesai',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      headerBg: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      status: 'In Progress',
      title: 'In Progress',
      icon: <Clock className="w-4 h-4 text-blue-600" />,
      headerBg: 'border-blue-200 bg-blue-50/70 text-blue-900',
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      status: 'Not Yet',
      title: 'Not Yet / Persiapan',
      icon: <Hourglass className="w-4 h-4 text-slate-500" />,
      headerBg: 'border-slate-200 bg-slate-100/70 text-slate-800',
      badgeColor: 'bg-slate-600 text-white',
    },
    {
      status: 'Pending/Cancel/Hold',
      title: 'Pending / Hold',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      headerBg: 'border-rose-200 bg-rose-50/70 text-rose-900',
      badgeColor: 'bg-rose-600 text-white',
    },
  ];

  const handleStatusChange = (project: Project, newStatus: ProjectStatus) => {
    onUpdateProject({
      ...project,
      status: newStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const filteredProjects = projects.filter((p) => {
    const matchesArea = areaFilter === 'ALL' || (p.area || 'Jabo 1') === areaFilter;
    if (!matchesArea) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      (p.area && p.area.toLowerCase().includes(term)) ||
      (p.nomorSuratDinas && p.nomorSuratDinas.toLowerCase().includes(term)) ||
      (p.remarks && p.remarks.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Tracking Pipeline</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Papan Kanban tahapan konstruksi, kendala teknis lapangan, dan timeline delivery project
          </p>
        </div>

        {/* Search & Area Filters inside pipeline */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Area Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 px-2 uppercase tracking-wider flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span>Area:</span>
            </span>
            {['ALL', ...PROJECT_AREAS].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAreaFilter(a)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  areaFilter === a
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {a === 'ALL' ? 'Semua' : a}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari di pipeline..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 shrink-0 font-mono">
            {filteredProjects.length} Project
          </span>
        </div>
      </div>

      {/* Symmetrical 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colProjects = filteredProjects.filter((p) => p.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200 flex flex-col min-h-[560px] shadow-2xs"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between p-3 rounded-xl border mb-3 ${col.headerBg}`}>
                <div className="flex items-center space-x-2">
                  {col.icon}
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    {col.title}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${col.badgeColor}`}>
                  {colProjects.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colProjects.length === 0 ? (
                  <div className="text-center py-14 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                    Tidak ada project
                  </div>
                ) : (
                  colProjects.map((p) => {
                    const foMetrics = calculatePullingFOMetrics(p.construction.pullingFO);
                    const completion = calculateProjectCompletion(p);

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition group"
                      >
                        {/* Card Header: ID, Area Badge & Status Selector */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {p.id}
                            </span>
                            {p.area && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${AREA_COLORS[p.area]?.badge || 'bg-slate-100 text-slate-700'}`}>
                                {p.area}
                              </span>
                            )}
                          </div>
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p, e.target.value as ProjectStatus)}
                            className="text-[10px] font-bold rounded-lg border-slate-300 bg-slate-50 text-slate-700 py-1 px-2 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                          >
                            <option value="Not Yet">Not Yet</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                            <option value="Pending/Cancel/Hold">Hold</option>
                          </select>
                        </div>

                        {/* Project Name */}
                        <h4
                          onClick={() => {
                            onSelectProject(p.id);
                            onSelectTab('construction');
                          }}
                          className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition cursor-pointer line-clamp-2 leading-snug"
                        >
                          {p.name || '(Project Tanpa Nama)'}
                        </h4>

                        {/* Surat Dinas Badge */}
                        {p.tanggalSuratDinas && (
                          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                            <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">Surat Dinas: {p.tanggalSuratDinas}</span>
                          </div>
                        )}

                        {/* Remarks if any */}
                        {p.remarks && (
                          <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-slate-600 line-clamp-2">
                            <span className={p.status === 'Pending/Cancel/Hold' ? 'text-rose-600 font-semibold' : 'italic'}>
                              {p.remarks}
                            </span>
                          </div>
                        )}

                        {/* Completion Bar */}
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                            <span>Kelengkapan Data</span>
                            <span className="font-mono text-slate-800 font-bold">{completion.score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${completion.progressColor}`}
                              style={{ width: `${completion.score}%` }}
                            />
                          </div>
                        </div>

                        {/* Key Specs */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <div className="flex items-center space-x-1">
                            <Cable className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="font-mono font-bold text-slate-800">
                              {foMetrics.formattedMeters} m
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.pmo.civilWork.deadline ? `DL: ${p.pmo.civilWork.deadline.slice(5)}` : 'No DL'}
                          </div>
                        </div>

                        {/* Quick Action Links */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProject(p.id);
                              onSelectTab('construction');
                            }}
                            className="text-amber-700 hover:text-amber-900 font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <HardHat className="w-3 h-3" />
                            <span>Input Fisik</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProject(p.id);
                              onSelectTab('pmo');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Laporan PMO</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
