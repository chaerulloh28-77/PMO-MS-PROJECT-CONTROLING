import React from 'react';
import {
  BarChart3,
  ClipboardList,
  HardHat,
  Kanban,
  FileText,
  Activity,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { TabType, Project } from '../types';
import { calculateProjectCompletion } from '../utils/projectMetrics';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  projects: Project[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  projects,
}) => {
  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length;
  const pendingCount = projects.filter((p) => p.status === 'Pending/Cancel/Hold').length;
  const doneCount = projects.filter((p) => p.status === 'Done').length;

  // Compute average completeness score across all projects
  const avgCompleteness =
    projects.length > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + calculateProjectCompletion(p).score, 0) /
            projects.length
        )
      : 0;

  const navItems: {
    id: TabType;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Ringkasan eksekutif & agregat',
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'projectList',
      label: 'Daftar Project',
      description: 'Master list & surat dinas',
      icon: <ClipboardList className="w-5 h-5 text-indigo-600" />,
      badge: (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 font-mono">
          {projects.length}
        </span>
      ),
    },
    {
      id: 'construction',
      label: 'Progres Konstruksi',
      description: 'Input boring, FO & struktur sipil',
      icon: <HardHat className="w-5 h-5 text-amber-600" />,
      badge: inProgressCount > 0 ? (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 font-mono">
          {inProgressCount} aktif
        </span>
      ) : undefined,
    },
    {
      id: 'pipeline',
      label: 'Tracking Pipeline',
      description: 'Papan kanban delivery',
      icon: <Kanban className="w-5 h-5 text-purple-600" />,
      badge: pendingCount > 0 ? (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 font-mono">
          {pendingCount} hold
        </span>
      ) : undefined,
    },
    {
      id: 'pmo',
      label: 'Laporan PMO',
      description: 'SLA civil work & closing TECO',
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
    },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-3.5 lg:sticky lg:top-24 space-y-4">
        <div>
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigasi Utama
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-900 font-bold shadow-2xs border border-blue-200/80 ring-1 ring-blue-100'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1.5 rounded-lg transition ${
                        isActive ? 'bg-white shadow-2xs' : 'bg-slate-100/70'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block font-normal leading-tight mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {item.badge}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Data Input Completeness Card */}
        <div className="pt-3 border-t border-slate-100 px-3 pb-2">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Kesiapan Data</span>
              </span>
              <span className="font-mono text-xs font-bold text-blue-600">{avgCompleteness}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgCompleteness}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Lengkapi data konstruksi & PMO untuk mencapai 100% kesiapan BAST.
            </p>
          </div>
        </div>

        {/* Pipeline Quick Status Pills */}
        <div className="pt-2 border-t border-slate-100 px-3 pb-1 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 text-slate-700 font-bold mb-2 text-[11px] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Ringkasan Delivery</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-bold font-mono">
            <div className="bg-emerald-50 text-emerald-800 rounded-lg p-1.5 border border-emerald-200">
              <span className="block text-[9px] text-emerald-600 uppercase font-sans">Done</span>
              {doneCount}
            </div>
            <div className="bg-blue-50 text-blue-800 rounded-lg p-1.5 border border-blue-200">
              <span className="block text-[9px] text-blue-600 uppercase font-sans">Active</span>
              {inProgressCount}
            </div>
            <div className="bg-rose-50 text-rose-800 rounded-lg p-1.5 border border-rose-200">
              <span className="block text-[9px] text-rose-600 uppercase font-sans">Hold</span>
              {pendingCount}
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[10px] font-semibold text-slate-400">
            © Copyright PAUL
          </p>
        </div>
      </div>
    </aside>
  );
};
