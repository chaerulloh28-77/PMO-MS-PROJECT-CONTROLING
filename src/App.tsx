import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, TabType, ProjectArea } from './types';
import { createNewProject } from './data/initialProjects';
import { exportProjectsToExcel } from './utils/excelExport';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { ProjectListTab } from './components/ProjectListTab';
import { ConstructionTab } from './components/ConstructionTab';
import { PipelineTab } from './components/PipelineTab';
import { PmoReportTab } from './components/PmoReportTab';
import { ActivitiesTab } from './components/ActivitiesTab';
import { NewProjectModal } from './components/NewProjectModal';
import { CollaboratorProfileModal } from './components/CollaboratorProfileModal';
import { PicLockScreen } from './components/PicLockScreen';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useRealtimeCollaboration } from './hooks/useRealtimeCollaboration';

export default function App() {
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const {
    currentUser,
    saveCurrentUser,
    setPicName,
    projects,
    activities,
    clearActivities,
    onlineUsers,
    isConnected,
    isWsConnected,
    createProject,
    updateProject,
    deleteProject,
    clearAllProjects,
    viewProject,
    defaultRoles,
    avatarColors,
  } = useRealtimeCollaboration(showToast);

  // Initialize lock state based on active session storage
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    try {
      const savedAuth = sessionStorage.getItem('pmo_app_pic_auth_v1');
      return !savedAuth;
    } catch (_) {
      return true;
    }
  });

  // Automatically secure session on page unload/close
  useEffect(() => {
    const handlePageHide = () => {
      try {
        sessionStorage.removeItem('pmo_app_pic_auth_v1');
      } catch (_) {}
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Unlock handler - called from PicLockScreen
  const handleUnlockApp = (picName: string, role?: string) => {
    const selectedRole = role || currentUser.role || 'Project Manager';
    try {
      sessionStorage.setItem(
        'pmo_app_pic_auth_v1',
        JSON.stringify({ picName, role: selectedRole, unlockedAt: Date.now() })
      );
    } catch (err) {
      console.error('Failed saving session auth', err);
    }

    saveCurrentUser({
      ...currentUser,
      name: picName,
      role: selectedRole,
    });
    setIsAppLocked(false);
    showToast(`Akses terbuka. Selamat bertugas, ${picName} (${selectedRole})!`, 'success');
  };

  // Lock handler - called from Navbar lock button
  const handleLockApp = () => {
    try {
      sessionStorage.removeItem('pmo_app_pic_auth_v1');
    } catch (err) {
      console.error('Failed removing session auth', err);
    }
    setIsAppLocked(true);
    showToast('Aplikasi telah dikunci.', 'alert');
  };

  // Sync selectedProjectId when projects list updates
  useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    } else if (projects.length === 0) {
      setSelectedProjectId('');
    }
  }, [projects, selectedProjectId]);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    viewProject(id);
  };

  const handleOpenNewProjectModal = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleCreateProject = (data: {
    name: string;
    vendorPelaksana?: string;
    picName: string;
    area: ProjectArea;
    tanggalSuratDinas: string;
    nomorSuratDinas: string;
    status: ProjectStatus;
    remarks: string;
  }) => {
    if (data.picName && data.picName.trim() && data.picName !== currentUser.name) {
      setPicName(data.picName.trim());
      try {
        sessionStorage.setItem(
          'pmo_app_pic_auth_v1',
          JSON.stringify({ picName: data.picName.trim(), role: currentUser.role, unlockedAt: Date.now() })
        );
      } catch (e) {}
    }

    const newProj = createNewProject(
      data.name,
      data.status,
      data.tanggalSuratDinas,
      data.nomorSuratDinas,
      data.remarks,
      data.area,
      data.vendorPelaksana || ''
    );
    newProj.createdBy = {
      id: currentUser.id,
      name: data.picName.trim() || currentUser.name,
      role: currentUser.role,
      color: currentUser.color,
      at: new Date().toISOString(),
    };
    createProject(newProj);
    setSelectedProjectId(newProj.id);
    setActiveTab('projectList');
    showToast(`Project "${newProj.name}" berhasil dibuat & tersinkronkan`);
  };

  const handleUpdateProject = (updated: Project, fieldChanged?: string) => {
    updateProject(updated, fieldChanged || 'Data project');
  };

  const handleDeleteProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    deleteProject(id, target?.name);
    showToast('Project berhasil dihapus', 'alert');
  };

  const handleClearAllProjects = () => {
    clearAllProjects();
    setSelectedProjectId('');
    showToast('Semua data project telah dikosongkan', 'alert');
  };

  const handleExportExcel = () => {
    exportProjectsToExcel(projects);
    showToast('File Excel laporan PMO berhasil di-download', 'info');
  };

  return (
    <div className="min-h-screen lg:h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col antialiased w-full overflow-x-hidden lg:overflow-hidden">
      {/* Top Navbar with live presence and collaborator identity */}
      <Navbar
        projects={projects}
        currentUser={currentUser}
        onlineUsers={onlineUsers}
        isConnected={isConnected}
        isWsConnected={isWsConnected}
        onAddNewProject={handleOpenNewProjectModal}
        onExportExcel={handleExportExcel}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onUpdatePicName={(name) => {
          setPicName(name);
          try {
            sessionStorage.setItem(
              'pmo_app_pic_auth_v1',
              JSON.stringify({ picName: name, role: currentUser.role, unlockedAt: Date.now() })
            );
          } catch (e) {}
        }}
        onLockApp={handleLockApp}
        onViewActivities={() => setActiveTab('activities')}
        isSaving={false}
      />

      {/* Main Proportional & Symmetrical Container */}
      <div className="max-w-[1680px] mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-3.5 w-full flex-1 min-h-0 min-w-0 flex flex-col">
        <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 items-stretch w-full flex-1 min-h-0 min-w-0">
          {/* Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            projects={projects}
            activitiesCount={activities.length}
            onlineUsersCount={onlineUsers.length}
            currentUser={currentUser}
          />

          {/* Tab Content Box - Symmetrical, Clean Internal Scrolling */}
          <main className="flex-1 w-full min-w-0 bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-3.5 sm:p-5 flex flex-col min-h-0 lg:overflow-y-auto">
            {activeTab === 'overview' && (
              <OverviewTab
                projects={projects}
                onSelectTab={setActiveTab}
                onSelectProject={handleSelectProject}
                onAddNewProject={handleOpenNewProjectModal}
              />
            )}

            {activeTab === 'projectList' && (
              <ProjectListTab
                projects={projects}
                onAddNewProject={handleOpenNewProjectModal}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onClearAllProjects={handleClearAllProjects}
                onSelectProject={handleSelectProject}
                onSelectTab={setActiveTab}
                currentPicName={currentUser.name}
              />
            )}

            {activeTab === 'construction' && (
              <ConstructionTab
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={handleSelectProject}
                onUpdateProject={(updated) => handleUpdateProject(updated, 'Progres fisik konstruksi')}
                onBack={() => setActiveTab('projectList')}
                onShowToast={(msg) => showToast(msg, 'success')}
              />
            )}

            {activeTab === 'pipeline' && (
              <PipelineTab
                projects={projects}
                onSelectProject={handleSelectProject}
                onSelectTab={setActiveTab}
                onUpdateProject={(updated) => handleUpdateProject(updated, 'Status pipeline delivery')}
              />
            )}

            {activeTab === 'pmo' && (
              <PmoReportTab
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={handleSelectProject}
                onUpdateProject={(updated) => handleUpdateProject(updated, 'Laporan & SLA PMO')}
                onBack={() => setActiveTab('projectList')}
                onShowToast={(msg) => showToast(msg, 'success')}
              />
            )}

            {activeTab === 'activities' && (
              <ActivitiesTab
                activities={activities}
                onlineUsers={onlineUsers}
                currentUser={currentUser}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onSelectProjectTab={setActiveTab}
                onClearActivities={clearActivities}
                isConnected={isConnected}
                isWsConnected={isWsConnected}
              />
            )}
          </main>
        </div>
      </div>

      {/* Symmetrical & Compact Docked Footer */}
      <footer className="w-full border-t border-slate-200/90 bg-white/90 backdrop-blur-xs py-2 px-4 sm:px-6 shrink-0">
        <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">PMO MS Project monitoring</span>
            <span>•</span>
            <span className="hidden sm:inline">Telecommunication Civil Works & Fiber Optic Pipeline</span>
          </div>
          <div className="font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-[10px]">
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
        currentPicName={currentUser.name}
      />

      {/* Collaborator Profile Modal */}
      <CollaboratorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSave={saveCurrentUser}
        defaultRoles={defaultRoles}
        avatarColors={avatarColors}
      />

      {/* Mandatory PIC Lock Screen Gatekeeper */}
      <PicLockScreen
        isLocked={isAppLocked}
        onUnlock={handleUnlockApp}
        initialPicName={currentUser.name}
        initialRole={currentUser.role || 'Project Manager'}
      />

      {/* Real-time Collaborative Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-slate-950/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold border border-slate-800 animate-in fade-in slide-in-from-bottom-3">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
              toast.type === 'alert'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : toast.type === 'info'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {toast.type === 'alert' ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
          </div>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
