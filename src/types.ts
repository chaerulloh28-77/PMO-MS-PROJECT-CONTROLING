export type ProjectStatus = 'Done' | 'In Progress' | 'Not Yet' | 'Pending/Cancel/Hold';

export interface BoringDetails {
  alur: string;
  jalan: string;
  akses: string;
  jembatan: string;
  sungai: string;
}

export type FOCableKey = '288 GL' | '288' | '144 GL' | '144' | '96 GL' | '96' | '48' | '24' | '12';

export type DimensionKey = '60x60' | '70x70' | '80x80' | '100x100' | '110x110' | '120x120';

export interface ConstructionData {
  boring: BoringDetails;
  pullingFO: Record<FOCableKey, number>;
  pullingCoax: number;
  hh: Record<DimensionKey, number>;
  hb: Record<DimensionKey, number>;
  mh: Record<DimensionKey, number>;
  galvanis: {
    '2': number;
    '4': number;
  };
}

export interface WorkflowTracking {
  date: string;
  submit: boolean;
  review: boolean;
  approval: boolean;
  releaseMR: string;
}

export interface PmoData {
  asPlan: {
    request: string;
    release: string;
    mr?: string;
    projectId?: string;
  };
  survey: string;
  material: WorkflowTracking;
  labour: WorkflowTracking;
  civilWork: {
    start: string;
    end: string;
    deadline: string;
  };
  pulling: {
    matOnSite: string;
    start: string;
    end: string;
  };
  rcf: {
    request: string;
    release: string;
  };
  cutOver: {
    date: string;
    phase: string;
  };
  closing: {
    docStart: string;
    docEnd: string;
    tecoStart: string;
    tecoEnd: string;
  };
}

export type ProjectArea = 'Jabo 1' | 'Jabo 2' | 'Jabo 3';

export const PROJECT_AREAS: ProjectArea[] = ['Jabo 1', 'Jabo 2', 'Jabo 3'];

export interface Project {
  id: string;
  name: string;
  area?: ProjectArea;
  tanggalSuratDinas?: string;
  nomorSuratDinas?: string;
  status: ProjectStatus;
  remarks: string;
  construction: ConstructionData;
  pmo: PmoData;
  createdAt?: string;
  updatedAt?: string;
}

export type TabType = 'overview' | 'projectList' | 'construction' | 'pipeline' | 'pmo';
