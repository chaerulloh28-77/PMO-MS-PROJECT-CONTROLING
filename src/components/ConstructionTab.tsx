import React, { useState } from 'react';
import {
  Cable,
  Drill,
  Boxes,
  Pipette,
  CheckCircle2,
  FolderOpen,
  ArrowLeft,
  Save,
  Check,
  ShieldAlert,
  Layers,
  Sparkles,
  Milestone,
} from 'lucide-react';
import { Project, FOCableKey, DimensionKey } from '../types';
import { FO_TYPES, DIMENSIONS, BORING_LABELS } from '../data/initialProjects';
import { ProjectSelector } from './ProjectSelector';
import { calculatePullingFOMetrics, calculateStructuresMetrics } from '../utils/projectMetrics';

interface ConstructionTabProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProject: (updated: Project) => void;
  onBack?: () => void;
  onShowToast?: (msg: string) => void;
}

export const ConstructionTab: React.FC<ConstructionTabProps> = ({
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
      onShowToast(`Progres konstruksi "${activeProject.name}" berhasil disimpan!`);
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
          sectionTitle="Progress Construction"
        />
        <div className="text-center py-20 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200">
          <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Pilih Project Terlebih Dahulu</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Gunakan selector di atas untuk memilih project fiber optic yang ingin diupdate progres konstruksinya.
          </p>
        </div>
      </div>
    );
  }

  // Update handlers
  const handleBoringChange = (key: keyof typeof activeProject.construction.boring, value: string) => {
    onUpdateProject({
      ...activeProject,
      construction: {
        ...activeProject.construction,
        boring: {
          ...activeProject.construction.boring,
          [key]: value,
        },
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handlePullingFOChange = (type: FOCableKey, value: number) => {
    onUpdateProject({
      ...activeProject,
      construction: {
        ...activeProject.construction,
        pullingFO: {
          ...activeProject.construction.pullingFO,
          [type]: Math.max(0, value),
        },
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handlePullingCoaxChange = (value: number) => {
    onUpdateProject({
      ...activeProject,
      construction: {
        ...activeProject.construction,
        pullingCoax: Math.max(0, value),
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleStructureChange = (
    structureType: 'hh' | 'hb' | 'mh',
    dim: DimensionKey,
    value: number
  ) => {
    onUpdateProject({
      ...activeProject,
      construction: {
        ...activeProject.construction,
        [structureType]: {
          ...activeProject.construction[structureType],
          [dim]: Math.max(0, value),
        },
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleGalvanisChange = (size: '2' | '4', value: number) => {
    onUpdateProject({
      ...activeProject,
      construction: {
        ...activeProject.construction,
        galvanis: {
          ...activeProject.construction.galvanis,
          [size]: Math.max(0, value),
        },
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  // Metrics calculations
  const foMetrics = calculatePullingFOMetrics(activeProject.construction.pullingFO);
  const structures = calculateStructuresMetrics(activeProject.construction);

  // Total boring calculation
  const totalBoringMeters = Object.values(activeProject.construction.boring).reduce((acc, val) => {
    const num = parseFloat(val) || 0;
    return acc + num;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Kembali & Simpan) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3 sm:px-4 sm:py-3 rounded-2xl shadow-md border border-slate-800">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer active:scale-95 shadow-2xs"
          title="Kembali ke Daftar Proyek"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300" />
          <span>Kembali ke Daftar</span>
        </button>

        <div className="flex items-center space-x-2.5 text-xs">
          <span className="hidden md:inline text-slate-400">Progres Konstruksi:</span>
          <span className="font-bold text-slate-100 max-w-xs truncate">{activeProject.name}</span>
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
            title="Simpan Data Progres Konstruksi"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Konstruksi</span>
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
        sectionTitle="Progress Construction"
      />

      {/* Symmetrical KPI Summary Cards (4 Balanced Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: FO Pulling */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pulling FO</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cable className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {foMetrics.formattedMeters} <span className="text-xs font-normal text-slate-500">m</span>
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
              Setara {foMetrics.formattedKm} km kabel optik
            </div>
          </div>
        </div>

        {/* Card 2: Underground Structures */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Struktur Sipil</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {structures.totalAll} <span className="text-xs font-normal text-slate-500">pcs</span>
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
              HH: {structures.totalHH} • HB: {structures.totalHB} • MH: {structures.totalMH}
            </div>
          </div>
        </div>

        {/* Card 3: Boring Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Galian Boring</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Drill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {totalBoringMeters.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">m</span>
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              Akumulasi 5 metode crossing
            </div>
          </div>
        </div>

        {/* Card 4: Galvanis & Protection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipa Galvanis</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Pipette className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {structures.totalGalvanis.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">m</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Galv 2": {activeProject.construction.galvanis['2'] || 0}m • Galv 4": {activeProject.construction.galvanis['4'] || 0}m
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: METODE BORING & KONSTRUKSI (5 Symmetric Columns) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Drill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Metode Boring & Galian Terarah (Meter)</h3>
              <p className="text-xs text-slate-500">Pekerjaan galian boring terarah (HDD) dan crossing utilitas bawah tanah</p>
            </div>
          </div>
          <div className="text-xs font-bold text-blue-700 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-200/80 self-start sm:self-auto font-mono">
            Total Boring: {totalBoringMeters.toLocaleString('id-ID')} m
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {Object.entries(BORING_LABELS).map(([key, label]) => {
            const bKey = key as keyof typeof activeProject.construction.boring;
            return (
              <div
                key={key}
                className="bg-slate-50/80 hover:bg-white p-3.5 rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Metode
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      HDD
                    </span>
                  </div>
                  <label className="block text-xs font-bold text-slate-800 mb-2 truncate" title={label}>
                    {label}
                  </label>
                </div>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={activeProject.construction.boring[bKey] || ''}
                    onChange={(e) => handleBoringChange(bKey, e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-lg text-sm px-3 py-2 pr-7 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs font-mono font-bold text-slate-900 text-right"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                    m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PULLING FO CABLE & COAX (Symmetric Bento Grid) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Pulling Kabel Fiber Optik & Coax (Meter)</h3>
              <p className="text-xs text-slate-500">Panjang penarikan kabel optik per tipe core dan kabel koaksial</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 font-mono">
              Total FO: {foMetrics.formattedMeters} m ({foMetrics.formattedKm} km)
            </span>
          </div>
        </div>

        {/* 3 Balanced Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Group A: High Core Backbone (288, 144) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>High-Capacity Feeder</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">288 & 144 Core</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(['288 GL', '288', '144 GL', '144'] as FOCableKey[]).map((type) => (
                  <div key={type} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="block text-[11px] font-bold text-slate-700 mb-1">
                      FO {type}
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={activeProject.construction.pullingFO[type] || 0}
                        onChange={(e) => handlePullingFOChange(type, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50/60 focus:bg-white border border-slate-300 rounded-md text-xs px-2 py-1.5 pr-6 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Group B: Distribution FO (96, 48) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Distribution Cable</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">96 & 48 Core</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(['96 GL', '96', '48'] as FOCableKey[]).map((type) => (
                  <div key={type} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="block text-[11px] font-bold text-slate-700 mb-1">
                      FO {type}
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={activeProject.construction.pullingFO[type] || 0}
                        onChange={(e) => handlePullingFOChange(type, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50/60 focus:bg-white border border-slate-300 rounded-md text-xs px-2 py-1.5 pr-6 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">m</span>
                    </div>
                  </div>
                ))}
                <div className="bg-slate-100/60 p-2.5 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-medium">Standard Metro Trase</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group C: Drop Cable & Coaxial */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Drop FO & Coaxial</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">Last-Mile Access</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(['24', '12'] as FOCableKey[]).map((type) => (
                  <div key={type} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="block text-[11px] font-bold text-slate-700 mb-1">
                      FO {type}
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={activeProject.construction.pullingFO[type] || 0}
                        onChange={(e) => handlePullingFOChange(type, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50/60 focus:bg-white border border-slate-300 rounded-md text-xs px-2 py-1.5 pr-6 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">m</span>
                    </div>
                  </div>
                ))}

                {/* Coaxial Cable Input */}
                <div className="col-span-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700">Kabel Coax (Meter)</span>
                    <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">RF Coaxial</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={activeProject.construction.pullingCoax || 0}
                      onChange={(e) => handlePullingCoaxChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50/60 focus:bg-white border border-slate-300 rounded-md text-xs px-2.5 py-1.5 pr-7 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-purple-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">meter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: STRUKTUR BAWAH TANAH (3 SYMMETRIC IDENTICAL COLUMNS - TIDAK TINGGI SEBELAH) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Instalasi Struktur Sipil (Handhole, HB, Manhole)</h3>
              <p className="text-xs text-slate-500">Pemasangan bak kontrol bawah tanah beton precast per dimensi standar</p>
            </div>
          </div>
          <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 font-mono">
            Total Struktur: {structures.totalAll} pcs
          </div>
        </div>

        {/* 3 Perfectly Symmetrical Columns with Exactly Same 6 Dimensions and Heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Handhole (HH) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Handhole (HH)</h4>
                  <span className="text-[11px] text-slate-500">Bak kontrol standar trase</span>
                </div>
                <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-mono">
                  {structures.totalHH} pcs
                </span>
              </div>
              <div className="space-y-2">
                {DIMENSIONS.map((dim) => (
                  <div
                    key={dim}
                    className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-slate-700 font-semibold font-mono">{dim} cm</span>
                    <input
                      type="number"
                      min="0"
                      value={activeProject.construction.hh[dim] || 0}
                      onChange={(e) => handleStructureChange('hh', dim, parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-50 border border-slate-300 rounded-md text-xs px-2 py-1 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Handhole Bak (HB) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Handhole Bak (HB)</h4>
                  <span className="text-[11px] text-slate-500">Bak pembagi & crossing</span>
                </div>
                <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-mono">
                  {structures.totalHB} pcs
                </span>
              </div>
              <div className="space-y-2">
                {DIMENSIONS.map((dim) => (
                  <div
                    key={dim}
                    className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-slate-700 font-semibold font-mono">{dim} cm</span>
                    <input
                      type="number"
                      min="0"
                      value={activeProject.construction.hb[dim] || 0}
                      onChange={(e) => handleStructureChange('hb', dim, parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-50 border border-slate-300 rounded-md text-xs px-2 py-1 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Manhole (MH) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Manhole (MH)</h4>
                  <span className="text-[11px] text-slate-500">Chamber utama kabel & jointer</span>
                </div>
                <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-mono">
                  {structures.totalMH} pcs
                </span>
              </div>
              <div className="space-y-2">
                {DIMENSIONS.map((dim) => (
                  <div
                    key={dim}
                    className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-slate-700 font-semibold font-mono">{dim} cm</span>
                    <input
                      type="number"
                      min="0"
                      value={activeProject.construction.mh[dim] || 0}
                      onChange={(e) => handleStructureChange('mh', dim, parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-50 border border-slate-300 rounded-md text-xs px-2 py-1 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PIPA GALVANIS & PELINDUNG TRASE (BALANCED DEDICATED SECTION) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Pipette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">4. Pipa Pelindung Galvanis & Trase Crossing (Meter)</h3>
              <p className="text-xs text-slate-500">Pipa pelindung baja galvanis untuk jembatan, crossing jalan, dan open trench</p>
            </div>
          </div>
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-mono">
            Total Galvanis: {structures.totalGalvanis} m
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Galvanis 2 Inch */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                Diameter 2"
              </span>
              <h4 className="text-sm font-bold text-slate-800 mt-1">Pipa Galvanis 2 Inch</h4>
              <p className="text-xs text-slate-500">Pelindung kabel distribusi & crossing saluran</p>
            </div>
            <div className="relative w-36">
              <input
                type="number"
                min="0"
                value={activeProject.construction.galvanis['2'] || 0}
                onChange={(e) => handleGalvanisChange('2', parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg text-sm px-3 py-2 pr-7 text-right font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">m</span>
            </div>
          </div>

          {/* Galvanis 4 Inch */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                Diameter 4"
              </span>
              <h4 className="text-sm font-bold text-slate-800 mt-1">Pipa Galvanis 4 Inch</h4>
              <p className="text-xs text-slate-500">Pelindung utama kabel feeder & multi-subduct</p>
            </div>
            <div className="relative w-36">
              <input
                type="number"
                min="0"
                value={activeProject.construction.galvanis['4'] || 0}
                onChange={(e) => handleGalvanisChange('4', parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg text-sm px-3 py-2 pr-7 text-right font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">m</span>
            </div>
          </div>
        </div>
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
            <span>Kembali ke Daftar Proyek</span>
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
                <span>Data Berhasil Disimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Data Konstruksi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
