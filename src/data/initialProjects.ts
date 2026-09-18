import { Project, FOCableKey, DimensionKey, ProjectArea } from '../types';

export const FO_TYPES: FOCableKey[] = [
  '288 GL',
  '288',
  '144 GL',
  '144',
  '96 GL',
  '96',
  '48',
  '24',
  '12',
];

export const DIMENSIONS: DimensionKey[] = [
  '60x60',
  '70x70',
  '80x80',
  '100x100',
  '110x110',
  '120x120',
];

export const BORING_LABELS = {
  alur: 'Boring Alur (m)',
  jalan: 'Boring Cross Jalan/Tol (m)',
  akses: 'Boring Cross Akses (m)',
  jembatan: 'Boring Cross Jembatan ATB (m)',
  sungai: 'Boring Cross Sungai/Kali (m)',
};

export const AREA_COLORS: Record<string, { badge: string; border: string; bg: string; text: string }> = {
  'Jabo 1': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  'Jabo 2': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  'Jabo 3': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
};

export const STATUS_COLORS: Record<string, { badge: string; border: string; bg: string; text: string; hex: string }> = {
  'Done': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    hex: '#10b981',
  },
  'In Progress': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    hex: '#3b82f6',
  },
  'Not Yet': {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    border: 'border-slate-400',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    hex: '#94a3b8',
  },
  'Pending/Cancel/Hold': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    border: 'border-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    hex: '#ef4444',
  },
};

export function createNewProject(
  name = '',
  status: Project['status'] = 'Not Yet',
  tanggalSuratDinas = '',
  nomorSuratDinas = '',
  remarks = '',
  area: ProjectArea = 'Jabo 1'
): Project {
  const emptyPullingFO: Record<FOCableKey, number> = {
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

  const emptyDimensions: Record<DimensionKey, number> = {
    '60x60': 0,
    '70x70': 0,
    '80x80': 0,
    '100x100': 0,
    '110x110': 0,
    '120x120': 0,
  };

  return {
    id: 'PRJ-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000),
    name,
    area,
    tanggalSuratDinas,
    nomorSuratDinas,
    status,
    remarks,
    construction: {
      boring: {
        alur: '',
        jalan: '',
        akses: '',
        jembatan: '',
        sungai: '',
      },
      pullingFO: { ...emptyPullingFO },
      pullingCoax: 0,
      hh: { ...emptyDimensions },
      hb: { ...emptyDimensions },
      mh: { ...emptyDimensions },
      galvanis: {
        '2': 0,
        '4': 0,
      },
    },
    pmo: {
      asPlan: { request: '', release: '', mr: '', projectId: '' },
      survey: '',
      material: { date: '', submit: false, review: false, approval: false, releaseMR: '' },
      labour: { date: '', submit: false, review: false, approval: false, releaseMR: '' },
      civilWork: { start: '', end: '', deadline: '' },
      pulling: { matOnSite: '', start: '', end: '' },
      rcf: { request: '', release: '' },
      cutOver: { date: '', phase: '' },
      closing: { docStart: '', docEnd: '', tecoStart: '', tecoEnd: '' },
    },
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

// Data awal dikosongkan sesuai permintaan pengguna
export const INITIAL_PROJECTS: Project[] = [];
