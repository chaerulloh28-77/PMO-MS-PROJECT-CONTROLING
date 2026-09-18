import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Cable,
  Boxes,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileText,
  HardHat,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Project, TabType } from '../types';
import { STATUS_COLORS, AREA_COLORS } from '../data/initialProjects';
import { calculateProjectCompletion, calculatePullingFOMetrics, calculateStructuresMetrics } from '../utils/projectMetrics';

interface OverviewTabProps {
  projects: Project[];
  onSelectTab: (tab: TabType) => void;
  onSelectProject: (id: string) => void;
  onAddNewProject?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  projects,
  onSelectTab,
  onSelectProject,
  onAddNewProject,
}) => {
  // Status breakdown
  const statusCounts = {
    Done: projects.filter((p) => p.status === 'Done').length,
    'In Progress': projects.filter((p) => p.status === 'In Progress').length,
    'Not Yet': projects.filter((p) => p.status === 'Not Yet').length,
    'Pending/Cancel/Hold': projects.filter((p) => p.status === 'Pending/Cancel/Hold').length,
  };

  const statusPieData = [
    { name: 'Done', value: statusCounts['Done'], color: STATUS_COLORS['Done'].hex },
    { name: 'In Progress', value: statusCounts['In Progress'], color: STATUS_COLORS['In Progress'].hex },
    { name: 'Not Yet', value: statusCounts['Not Yet'], color: STATUS_COLORS['Not Yet'].hex },
    { name: 'Pending/Hold', value: statusCounts['Pending/Cancel/Hold'], color: STATUS_COLORS['Pending/Cancel/Hold'].hex },
  ].filter((d) => d.value > 0);

  // Bar Chart Data
  const pipelineBarData = [
    { name: 'Done (Selesai)', count: statusCounts['Done'], fill: '#10b981' },
    { name: 'In Progress', count: statusCounts['In Progress'], fill: '#3b82f6' },
    { name: 'Not Yet', count: statusCounts['Not Yet'], fill: '#94a3b8' },
    { name: 'Pending/Hold', count: statusCounts['Pending/Cancel/Hold'], fill: '#ef4444' },
  ];

  // FO Cable aggregation
  const foAggregates: Record<string, number> = {
    '288 GL': 0,
    '288': 0,
    '144 GL': 0,
    '144': 0,
    '96 GL': 0,
    '96': 0,
    '48': 0,
    '24': 0,
    '12': 0,
  };

  let grandTotalFOmeter = 0;
  let totalHHcount = 0;
  let totalHBcount = 0;
  let totalMHcount = 0;
  let totalGalvanisMeter = 0;
  let totalCompletionSum = 0;

  projects.forEach((p) => {
    Object.entries(p.construction.pullingFO || {}).forEach(([type, m]) => {
      const val = Number(m) || 0;
      if (foAggregates[type] !== undefined) {
        foAggregates[type] += val;
      }
      grandTotalFOmeter += val;
    });

    const s = calculateStructuresMetrics(p.construction);
    totalHHcount += s.totalHH;
    totalHBcount += s.totalHB;
    totalMHcount += s.totalMH;
    totalGalvanisMeter += s.totalGalvanis;

    const comp = calculateProjectCompletion(p);
    totalCompletionSum += comp.score;
  });

  const avgCompletion = projects.length > 0 ? Math.round(totalCompletionSum / projects.length) : 0;

  const foDonutData = Object.entries(foAggregates)
    .filter(([_, val]) => val > 0)
    .map(([type, val], index) => {
      const colors = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#4f46e5', '#0d9488', '#475569'];
      return {
        name: `FO ${type}`,
        meters: val,
        color: colors[index % colors.length],
      };
    });

  return (
    <div className="space-y-6">
      {/* Header with Title & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring komprehensif progres konstruksi fiber optic, milestone PMO, dan agregasi infrastruktur sipil
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onSelectTab('projectList')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <span>Daftar Project</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('construction')}
            className="text-xs font-bold text-white flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer active:scale-95"
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Input Konstruksi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: 4 Symmetrical Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Project</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{projects.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Terdata aktif di PMO</div>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-blue-600 font-mono tracking-tight">{statusCounts['In Progress']}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Konstruksi & penarikan FO</div>
          </div>
        </div>

        {/* Card 3: Done */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Done / Selesai</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">{statusCounts['Done']}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">BAST & TECO tuntas</div>
          </div>
        </div>

        {/* Card 4: Pending / Hold */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending / Hold</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-600 font-mono tracking-tight">{statusCounts['Pending/Cancel/Hold']}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">Perlu eskalasi izin/kendala</div>
          </div>
        </div>
      </div>

      {/* 3 Symmetrical Aggregate Bento Cards (Matching Heights) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bento 1: Cable Infrastructure */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs text-blue-300 font-bold uppercase tracking-wide">
                <Cable className="w-4 h-4" />
                <span>Pulling Kabel FO</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                {(grandTotalFOmeter / 1000).toFixed(2)} km
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {grandTotalFOmeter.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">meter</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Akumulasi seluruh tipe kabel feeder, distribution, dan drop</p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>High Density FO:</span>
            <span className="font-mono text-slate-200 font-bold">
              {((foAggregates['288 GL'] + foAggregates['288'] + foAggregates['144 GL'] + foAggregates['144']) || 0).toLocaleString('id-ID')} m
            </span>
          </div>
        </div>

        {/* Bento 2: Underground Structures */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs text-amber-300 font-bold uppercase tracking-wide">
                <Boxes className="w-4 h-4" />
                <span>Struktur Sipil Bawah Tanah</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {totalHHcount + totalHBcount + totalMHcount} pcs
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {totalHHcount + totalHBcount + totalMHcount} <span className="text-xs font-normal text-slate-400">unit</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">HH: {totalHHcount} pcs • HB: {totalHBcount} pcs • MH: {totalMHcount} pcs</p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Pipa Galvanis:</span>
            <span className="font-mono text-slate-200 font-bold">{totalGalvanisMeter.toLocaleString('id-ID')} m</span>
          </div>
        </div>

        {/* Bento 3: Data Readiness Score */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs text-emerald-300 font-bold uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" />
                <span>Rata-Rata Kelengkapan Data</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {avgCompletion}%
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {avgCompletion}% <span className="text-xs font-normal text-slate-400">terisi</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${avgCompletion}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Kesiapan data administratif, surat dinas & closing BAST</p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Status Data:</span>
            <span className="text-emerald-400 font-bold">
              {avgCompletion >= 75 ? 'Optimal' : 'Perlu Pengisian'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Visual Charts (2 Symmetrical Containers - Same Height h-72) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Status Pipeline Project</h3>
              <p className="text-xs text-slate-500">Proporsi tahapan pekerjaan seluruh project aktif</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {projects.length} Total
            </span>
          </div>

          <div className="h-64">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val || 0)} Project`, 'Jumlah']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', padding: '8px 12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Belum ada data project
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: FO Cable Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Pulling FO per Tipe Core</h3>
              <p className="text-xs text-slate-500">Proporsi meter kabel optik berdasarkan kapasitas core</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {foDonutData.length} Tipe Kabel
            </span>
          </div>

          <div className="h-64">
            {foDonutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={foDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="meters"
                  >
                    {foDonutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString('id-ID')} meter`, 'Panjang']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', padding: '8px 12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Belum ada data penarikan FO
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Bar Chart: Pipeline Stages */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Volume Project Berdasarkan Status Pekerjaan</h3>
            <p className="text-xs text-slate-500">Perbandingan kuantitas project pada masing-masing fase delivery</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('pipeline')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Buka Kanban Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${Number(val || 0)} Project`, 'Jumlah']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {pipelineBarData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Access Project Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daftar Project & Kelengkapan Data</h3>
            <p className="text-xs text-slate-500">Klik tombol cepat untuk melengkapi progres konstruksi atau laporan PMO</p>
          </div>
          <div className="flex items-center space-x-2">
            {onAddNewProject && (
              <button
                type="button"
                onClick={onAddNewProject}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                + Tambah Project
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectTab('projectList')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
            >
              Lihat Semua ({projects.length})
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
              <FolderKanban className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Belum Ada Data Project</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Database project saat ini kosong. Tambahkan project baru untuk mulai memonitor progres pekerjaan fisik dan PMO.
            </p>
            {onAddNewProject && (
              <button
                type="button"
                onClick={onAddNewProject}
                className="mt-3.5 inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buat Project Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full text-left text-xs border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-3.5">Nama Project</th>
                  <th className="py-3 px-2.5 hidden sm:table-cell">Surat Dinas</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-2.5">Progress</th>
                  <th className="py-3 px-3 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 6).map((p) => {
                  const completion = calculateProjectCompletion(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{p.name}</span>
                          {p.area && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${AREA_COLORS[p.area]?.badge || 'bg-slate-100 text-slate-700'}`}>
                              {p.area}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">{p.id}</div>
                      </td>
                      <td className="py-3 px-2.5 hidden sm:table-cell">
                        <div className="font-mono text-slate-700 truncate max-w-[160px]">{p.nomorSuratDinas || '-'}</div>
                        <div className="text-[10px] text-slate-400">{p.tanggalSuratDinas || 'Belum ada'}</div>
                      </td>
                      <td className="py-3 px-2.5">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded-md text-[11px] border ${STATUS_COLORS[p.status]?.badge || 'bg-slate-100 text-slate-800'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="w-24 sm:w-28">
                          <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                            <span className="font-mono text-slate-800 font-bold">{completion.score}%</span>
                            <span className="text-slate-400 text-[9px] truncate ml-1">{completion.label}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${completion.progressColor}`}
                              style={{ width: `${completion.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProject(p.id);
                              onSelectTab('construction');
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Fisik
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProject(p.id);
                              onSelectTab('pmo');
                            }}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            PMO
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
      </div>
    </div>
  );
};
