import { Project, ConstructionData } from '../types';

export interface CompletionMetrics {
  score: number;
  completedCount: number;
  totalCount: number;
  label: string;
  badgeClass: string;
  progressColor: string;
}

/**
 * Calculates data completeness percentage to gamify and encourage users to input data
 */
export function calculateProjectCompletion(project: Project): CompletionMetrics {
  const checks: boolean[] = [
    // 1. Basic & Administrative
    Boolean(project.name && project.name.trim().length > 0),
    Boolean(project.tanggalSuratDinas && project.tanggalSuratDinas.trim().length > 0),
    Boolean(project.nomorSuratDinas && project.nomorSuratDinas.trim().length > 0),
    Boolean(project.remarks && project.remarks.trim().length > 0),

    // 2. Construction - Boring
    Object.values(project.construction?.boring || {}).some(v => Boolean(v && v.trim() !== '' && v !== '0')),

    // 3. Construction - Pulling FO
    Object.values(project.construction?.pullingFO || {}).some(v => (Number(v) || 0) > 0),

    // 4. Construction - Underground Structures
    (
      Object.values(project.construction?.hh || {}).some(v => (Number(v) || 0) > 0) ||
      Object.values(project.construction?.hb || {}).some(v => (Number(v) || 0) > 0) ||
      Object.values(project.construction?.mh || {}).some(v => (Number(v) || 0) > 0)
    ),

    // 5. Construction - Galvanis Pipe
    Boolean((Number(project.construction?.galvanis?.['2']) || 0) > 0 || (Number(project.construction?.galvanis?.['4']) || 0) > 0),

    // 6. PMO - As Plan Drawing & Survey
    Boolean(project.pmo?.asPlan?.request || project.pmo?.asPlan?.release),
    Boolean(project.pmo?.survey),

    // 7. PMO - CW Schedule
    Boolean(project.pmo?.civilWork?.start && project.pmo?.civilWork?.end),

    // 8. PMO - Pulling Schedule
    Boolean(project.pmo?.pulling?.start || project.pmo?.pulling?.end),

    // 9. PMO - Workflow Approval (Material or Labour)
    Boolean(project.pmo?.material?.approval || project.pmo?.labour?.approval),

    // 10. PMO - RCF & Cutover
    Boolean(project.pmo?.rcf?.request || project.pmo?.cutOver?.date),

    // 11. PMO - Closing & TECO SAP
    Boolean(project.pmo?.closing?.tecoStart || project.pmo?.closing?.tecoEnd || project.pmo?.closing?.docEnd),
  ];

  const completedCount = checks.filter(Boolean).length;
  const totalCount = checks.length;
  const score = Math.round((completedCount / totalCount) * 100);

  let label = 'Data Awal';
  let badgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
  let progressColor = 'bg-slate-400';

  if (score >= 90) {
    label = 'Data Lengkap (Siap BAST)';
    badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200';
    progressColor = 'bg-emerald-500';
  } else if (score >= 65) {
    label = 'Tahap Lanjutan PMO';
    badgeClass = 'bg-blue-50 text-blue-700 border-blue-300';
    progressColor = 'bg-blue-500';
  } else if (score >= 40) {
    label = 'Konstruksi Berjalan';
    badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-300';
    progressColor = 'bg-indigo-500';
  } else if (score >= 20) {
    label = 'Progres Menengah';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
    progressColor = 'bg-amber-500';
  }

  return {
    score,
    completedCount,
    totalCount,
    label,
    badgeClass,
    progressColor,
  };
}

/**
 * Calculates Civil Work duration and SLA (90 days threshold)
 */
export function calculateCivilWorkDuration(start?: string, end?: string): {
  days: number;
  isExceeded: boolean;
  label: string;
  badgeClass: string;
} {
  if (!start || !end) {
    return {
      days: 0,
      isExceeded: false,
      label: 'SLA: 90 Hari',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  }

  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e.getTime() - s.getTime();
  const days = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isExceeded = days > 90;

  if (days === 0) {
    return {
      days: 0,
      isExceeded: false,
      label: 'Tanggal Tidak Sesuai',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  if (isExceeded) {
    return {
      days,
      isExceeded: true,
      label: `Lewat SLA (+${days - 90} Hari)`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold',
    };
  }

  return {
    days,
    isExceeded: false,
    label: `On-Track (${days}/90 Hari)`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
  };
}

/**
 * Total meter and KM pulling FO
 */
export function calculatePullingFOMetrics(pullingFO: Record<string, number> = {} as any) {
  const totalMeters = Object.values(pullingFO).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const totalKm = totalMeters / 1000;
  return {
    totalMeters,
    totalKm,
    formattedMeters: totalMeters.toLocaleString('id-ID'),
    formattedKm: totalKm.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  };
}

/**
 * Total underground structures
 */
export function calculateStructuresMetrics(construction?: ConstructionData) {
  if (!construction) {
    return { totalHH: 0, totalHB: 0, totalMH: 0, totalAll: 0, totalGalvanis: 0 };
  }
  const totalHH = Object.values(construction.hh || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const totalHB = Object.values(construction.hb || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const totalMH = Object.values(construction.mh || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const totalGalvanis = (Number(construction.galvanis?.['2']) || 0) + (Number(construction.galvanis?.['4']) || 0);

  return {
    totalHH,
    totalHB,
    totalMH,
    totalAll: totalHH + totalHB + totalMH,
    totalGalvanis,
  };
}
