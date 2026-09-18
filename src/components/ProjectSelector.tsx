import React from 'react';
import { ChevronLeft, ChevronRight, FolderKanban, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';
import { STATUS_COLORS, AREA_COLORS } from '../data/initialProjects';
import { calculateProjectCompletion } from '../utils/projectMetrics';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  sectionTitle: string;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  sectionTitle,
}) => {
  const currentIndex = projects.findIndex((p) => p.id === selectedProjectId);
  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const completion = activeProject ? calculateProjectCompletion(activeProject) : null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectProject(projects[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < projects.length - 1) {
      onSelectProject(projects[currentIndex + 1].id);
    }
  };

  return (
    <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Dropdown with label */}
        <div className="flex-1 max-w-2xl">
          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            <span>Pilih Project Aktif ({sectionTitle})</span>
            <span className="text-[11px] font-normal text-slate-400 capitalize">
              {projects.length > 0 ? `(${currentIndex + 1} dari ${projects.length} Project)` : '(0 Project)'}
            </span>
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-3.5 py-2.5 shadow-xs transition cursor-pointer"
            >
              <option value="" disabled>-- {projects.length === 0 ? 'Belum Ada Project Terdaftar' : 'Pilih Project'} --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || '(Tanpa Nama)'} • [{p.area || 'Jabo 1'}] • [{p.status}]
                </option>
              ))}
            </select>

            {/* Prev / Next buttons */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs active:scale-95 cursor-pointer"
                title="Project Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= projects.length - 1 || currentIndex === -1}
                className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs active:scale-95 cursor-pointer"
                title="Project Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Project Status Badge & Completion Score */}
        {activeProject ? (
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            {/* Area Badge */}
            {activeProject.area && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Area</span>
                <span className={`inline-block font-bold px-2.5 py-0.5 rounded-md text-xs border mt-0.5 ${AREA_COLORS[activeProject.area]?.badge || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {activeProject.area}
                </span>
              </div>
            )}

            {/* Status */}
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status Pipeline</span>
              <span className={`inline-block font-bold px-2.5 py-0.5 rounded-md text-xs border mt-0.5 ${STATUS_COLORS[activeProject.status]?.badge || 'bg-slate-100 text-slate-800'}`}>
                {activeProject.status}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Completion Score */}
            {completion && (
              <div className="min-w-[170px]">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    <span>Kelengkapan Data</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{completion.score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completion.progressColor}`}
                    style={{ width: `${completion.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center text-xs text-amber-700 bg-amber-50 px-3.5 py-2.5 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>Pilih project terlebih dahulu untuk melihat dan mengisi data.</span>
          </div>
        )}
      </div>
    </div>
  );
};
