import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ClipboardList,
  HardHat,
  Kanban,
  FileText,
  Activity,
  Sparkles,
  ChevronRight,
  Zap,
  History,
  Users,
} from 'lucide-react';
import { TabType, Project, AuditUser } from '../types';
import { calculateProjectCompletion } from '../utils/projectMetrics';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  projects: Project[];
  activitiesCount?: number;
  onlineUsersCount?: number;
  currentUser?: AuditUser;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  projects,
  activitiesCount = 0,
  currentUser,
}) => {
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const inProgressCount = useMemo(() => projects.filter((p) => p.status === 'In Progress').length, [projects]);
  const pendingCount = useMemo(() => projects.filter((p) => p.status === 'Pending/Cancel/Hold').length, [projects]);
  const doneCount = useMemo(() => projects.filter((p) => p.status === 'Done').length, [projects]);

  // Compute average completeness score across all projects
  const avgCompleteness = useMemo(() => {
    return projects.length > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + calculateProjectCompletion(p).score, 0) /
            projects.length
        )
      : 0;
  }, [projects]);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>, id: TabType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = `${id}-${Date.now()}-${Math.random()}`;

    setRipples((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), { id: rippleId, x, y }],
    }));

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [id]: (prev[id] || []).filter((r) => r.id !== rippleId),
      }));
    }, 600);

    onSelectTab(id);
  };

  const navItems: {
    id: TabType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    activeBg: string;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Ringkasan eksekutif & agregat',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-blue-600',
      activeBg: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'projectList',
      label: 'Daftar Project',
      description: 'Master list & surat dinas',
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'text-indigo-600',
      activeBg: 'from-indigo-600 to-violet-600',
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
      icon: <HardHat className="w-5 h-5" />,
      color: 'text-amber-600',
      activeBg: 'from-amber-600 to-orange-600',
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
      icon: <Kanban className="w-5 h-5" />,
      color: 'text-purple-600',
      activeBg: 'from-purple-600 to-pink-600',
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
      icon: <FileText className="w-5 h-5" />,
      color: 'text-emerald-600',
      activeBg: 'from-emerald-600 to-teal-600',
    },
    ...((() => {
      const isAuthorized = Boolean(currentUser?.name || currentUser?.role);
      if (!isAuthorized) return [];
      return [
        {
          id: 'activities' as TabType,
          label: 'Audit & Log Trafik',
          description: 'Riwayat data & monitoring link',
          icon: <History className="w-4 h-4" />,
          color: 'text-rose-600',
          activeBg: 'from-rose-600 to-pink-600',
        },
      ];
    })()),
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 select-none flex flex-col min-h-0">
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-3 space-y-3 lg:overflow-y-auto min-h-0">
        {/* Navigation Group Header */}
        <div>
          <div className="flex items-center justify-between px-2 pt-0.5 pb-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Zap className="w-3 h-3 text-blue-600" />
              <span>Navigasi Menu</span>
            </p>
            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Interactive
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isHovered = hoveredTab === item.id;
              const itemRipples = ripples[item.id] || [];

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setHoveredTab(item.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  onClick={(e) => handleMenuClick(e, item.id)}
                  className={`group relative w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ease-out text-left overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-950 font-bold border border-blue-300 shadow-sm translate-x-1 ring-2 ring-blue-100/80'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50/90 hover:translate-x-1.5 hover:shadow-xs border border-transparent hover:border-slate-200'
                  } active:scale-[0.97] active:bg-blue-100/70`}
                >
                  {/* Left Interactive Accent Indicator Bar */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full transition-all duration-300 ease-out ${
                      isActive
                        ? 'h-8 bg-blue-600 shadow-xs shadow-blue-500/50'
                        : isHovered
                        ? 'h-5 bg-blue-400'
                        : 'h-0 bg-transparent'
                    }`}
                  />

                  {/* Click Ripple Waves */}
                  {itemRipples.map((ripple) => (
                    <span
                      key={ripple.id}
                      className="absolute rounded-full pointer-events-none bg-blue-500/25 animate-menu-ripple w-12 h-12"
                      style={{
                        left: `${ripple.x}px`,
                        top: `${ripple.y}px`,
                      }}
                    />
                  ))}

                  {/* Left Content (Icon + Title & Description) */}
                  <div className="flex items-center space-x-3 z-10 pl-1">
                    <div
                      className={`p-2 rounded-xl transition-all duration-300 ease-out flex items-center justify-center ${
                        isActive
                          ? `bg-gradient-to-tr ${item.activeBg} text-white shadow-sm shadow-blue-500/30 scale-105`
                          : isHovered
                          ? 'bg-blue-50 text-blue-700 shadow-2xs scale-110 rotate-3'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <span
                        className={`text-xs block leading-tight transition-colors duration-150 ${
                          isActive
                            ? 'font-black text-blue-950'
                            : 'font-bold text-slate-800 group-hover:text-blue-600'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium leading-tight mt-0.5 group-hover:text-slate-600 transition-colors">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {/* Right Trailing Area (Badge & Interactive Arrow) */}
                  <div className="flex items-center space-x-1.5 z-10">
                    {item.badge}
                    <ChevronRight
                      className={`w-4 h-4 transition-all duration-200 ease-out ${
                        isActive
                          ? 'text-blue-600 opacity-100 translate-x-0'
                          : isHovered
                          ? 'text-blue-500 opacity-100 translate-x-0'
                          : 'text-slate-300 opacity-0 -translate-x-2'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Interactive Data Input Completeness Card */}
        <div className="pt-3 border-t border-slate-100 px-1 pb-1">
          <div
            onClick={() => onSelectTab('projectList')}
            className="group relative bg-gradient-to-b from-slate-50 to-blue-50/30 hover:to-blue-50/60 p-3 rounded-xl border border-slate-200/80 hover:border-blue-200 space-y-2 cursor-pointer transition-all duration-200 hover:shadow-2xs active:scale-[0.98]"
            title="Klik untuk melihat kelengkapan project"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 transition-colors flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                <span>Kesiapan Data</span>
              </span>
              <span className="font-mono text-xs font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded-md border border-blue-100 shadow-2xs">
                {avgCompleteness}%
              </span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                style={{ width: `${avgCompleteness}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="group-hover:text-slate-700 transition-colors">Target 100% BAST</span>
              <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Detail &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Pipeline Delivery Summary Cards */}
        <div className="pt-2 border-t border-slate-100 px-1 pb-1 text-xs text-slate-500">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-2 text-[11px] uppercase tracking-wider px-1">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Ringkasan Delivery</span>
            </span>
            <span className="text-[9px] text-slate-400 font-normal">Klik untuk filter</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-bold font-mono">
            {/* Done Card */}
            <button
              type="button"
              onClick={() => onSelectTab('pipeline')}
              className="bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 rounded-xl p-2 border border-emerald-200/90 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs group"
              title="Lihat status Done pada Pipeline"
            >
              <span className="block text-[9px] text-emerald-600 uppercase font-sans group-hover:font-black">Done</span>
              <span className="text-xs font-black">{doneCount}</span>
            </button>

            {/* Active Card */}
            <button
              type="button"
              onClick={() => onSelectTab('pipeline')}
              className="bg-blue-50 hover:bg-blue-100/90 text-blue-800 rounded-xl p-2 border border-blue-200/90 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs group"
              title="Lihat status Active pada Pipeline"
            >
              <span className="block text-[9px] text-blue-600 uppercase font-sans group-hover:font-black">Active</span>
              <span className="text-xs font-black">{inProgressCount}</span>
            </button>

            {/* Hold Card */}
            <button
              type="button"
              onClick={() => onSelectTab('pipeline')}
              className="bg-rose-50 hover:bg-rose-100/90 text-rose-800 rounded-xl p-2 border border-rose-200/90 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs group"
              title="Lihat status Hold pada Pipeline"
            >
              <span className="block text-[9px] text-rose-600 uppercase font-sans group-hover:font-black">Hold</span>
              <span className="text-xs font-black">{pendingCount}</span>
            </button>
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
