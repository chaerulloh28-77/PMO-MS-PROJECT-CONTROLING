import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Project, ProjectStatus, TabType, ProjectArea } from './types';
import { INITIAL_PROJECTS, createNewProject } from './data/initialProjects';
import { exportProjectsToExcel } from './utils/excelExport';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { ProjectListTab } from './components/ProjectListTab';
import { ConstructionTab } from './components/ConstructionTab';
import { PipelineTab } from './components/PipelineTab';
import { PmoReportTab } from './components/PmoReportTab';
import { NewProjectModal } from './components/NewProjectModal';
import { CheckCircle, Download } from 'lucide-react';

const STORAGE_KEY = 'monitoringProjectsData';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading projects from localStorage', e);
    }
    return INITIAL_PROJECTS;
  });

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projects.length > 0 ? projects[0].id : '';
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync to localStorage with debounce to prevent input lag
  const saveProjects = useCallback((updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    setIsSaving(true);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      } catch (e) {
        console.error('Error saving to localStorage', e);
      }
      setIsSaving(false);
    }, 200);
  }, []);

  const handleOpenNewProjectModal = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleCreateProject = (data: {
    name: string;
    area: ProjectArea;
    tanggalSuratDinas: string;
    nomorSuratDinas: string;
    status: ProjectStatus;
    remarks: string;
  }) => {
    const newProj = createNewProject(
      data.name,
      data.status,
      data.tanggalSuratDinas,
      data.nomorSuratDinas,
      data.remarks,
      data.area
    );
    const updated = [newProj, ...projects];
    saveProjects(updated);
    setSelectedProjectId(newProj.id);
    setActiveTab('projectList');
    showToast(`Project "${newProj.name}" berhasil dibuat`);
  };

  const handleAddNewProject = (customName?: string) => {
    handleOpenNewProjectModal();
  };

  const handleUpdateProject = (updated: Project) => {
    const next = projects.map((p) => (p.id === updated.id ? updated : p));
    saveProjects(next);
  };

  const handleDeleteProject = (id: string) => {
    const next = projects.filter((p) => p.id !== id);
    saveProjects(next);
    if (selectedProjectId === id) {
      setSelectedProjectId(next.length > 0 ? next[0].id : '');
    }
    showToast('Project berhasil dihapus');
  };

  const handleExportExcel = () => {
    exportProjectsToExcel(projects);
    showToast('File Excel laporan PMO berhasil di-download');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        projects={projects}
        onAddNewProject={() => handleAddNewProject()}
        onExportExcel={handleExportExcel}
        isSaving={isSaving}
      />

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            projects={projects}
          />

          {/* Tab Content Box */}
          <main className="flex-1 w-full bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-5 sm:p-7 min-h-[84vh] overflow-hidden">
            {activeTab === 'overview' && (
              <OverviewTab
                projects={projects}
                onSelectTab={setActiveTab}
                onSelectProject={setSelectedProjectId}
              />
            )}

            {activeTab === 'projectList' && (
              <ProjectListTab
                projects={projects}
                onAddNewProject={() => handleAddNewProject()}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onSelectProject={setSelectedProjectId}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === 'construction' && (
              <ConstructionTab
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onUpdateProject={handleUpdateProject}
                onBack={() => setActiveTab('projectList')}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'pipeline' && (
              <PipelineTab
                projects={projects}
                onSelectProject={setSelectedProjectId}
                onSelectTab={setActiveTab}
                onUpdateProject={handleUpdateProject}
              />
            )}

            {activeTab === 'pmo' && (
              <PmoReportTab
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onUpdateProject={handleUpdateProject}
                onBack={() => setActiveTab('projectList')}
                onShowToast={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white/80 backdrop-blur-xs py-4 px-4 sm:px-8 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">PMO MS Project monitoring</span>
            <span>•</span>
            <span>Telecommunication Civil Works & Fiber Optic Pipeline</span>
          </div>
          <div className="font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            © Copyright PAUL. All rights reserved.
          </div>
        </div>
      </footer>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
        defaultProjectNumber={projects.length + 1}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-slate-950/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold border border-slate-800 animate-in fade-in slide-in-from-bottom-3">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
