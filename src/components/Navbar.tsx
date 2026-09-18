import React from 'react';
import { Download, PlusCircle, CheckCircle2, HardHat, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface NavbarProps {
  projects: Project[];
  onAddNewProject: () => void;
  onExportExcel: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  onAddNewProject,
  onExportExcel,
  isSaving = false,
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur-md text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white border border-blue-400/30">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  PMO MS Project monitoring
                </span>
                <span className="hidden sm:inline text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Telecom Civil Works
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Monitoring Relokasi Fiber Optik & Controling PMO Lapangan • <span className="text-slate-300 font-medium">© Copyright PAUL</span>
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Auto-save status */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-2xs">
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  isSaving ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                }`}
              />
              <span className="font-medium">{isSaving ? 'Menyimpan...' : 'Auto-save Aktif'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono font-semibold">{projects.length} Project</span>
            </div>

            {/* Quick Add Project */}
            <button
              type="button"
              onClick={onAddNewProject}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-xs transition cursor-pointer active:scale-95"
              title="Tambah Project Baru"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Project Baru</span>
            </button>

            {/* Export to Excel */}
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xs transition cursor-pointer active:scale-95"
              title="Download Excel Workbook"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
              <Download className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
