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

export interface AuditUser {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: AuditUser;
  type: 'open_link' | 'create_project' | 'update_project' | 'delete_project' | 'clear_all' | 'view_project';
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
}

export interface Project {
  id: string;
  name: string;
  vendorPelaksana?: string;
  area?: ProjectArea;
  tanggalSuratDinas?: string;
  nomorSuratDinas?: string;
  status: ProjectStatus;
  remarks: string;
  construction: ConstructionData;
  pmo: PmoData;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id?: string;
    name: string;
    role?: string;
    color?: string;
    at: string;
  };
  lastModifiedBy?: {
    id?: string;
    name: string;
    role?: string;
    color?: string;
    at: string;
    fieldChanged?: string;
  };
  viewCount?: number;
  lastViewedBy?: {
    name: string;
    at: string;
  };
}

export type TabType = 'overview' | 'projectList' | 'construction' | 'pipeline' | 'pmo' | 'activities';
