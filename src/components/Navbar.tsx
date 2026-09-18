import React, { useState, useEffect } from 'react';
import {
  Download,
  PlusCircle,
  HardHat,
  FileSpreadsheet,
  Users,
  User,
  History,
  Wifi,
  WifiOff,
  UserCheck,
  Check,
  Edit2,
  Lock,
} from 'lucide-react';
import { Project, AuditUser } from '../types';

interface NavbarProps {
  projects: Project[];
  currentUser?: AuditUser;
  onlineUsers?: AuditUser[];
  isConnected?: boolean;
  isWsConnected?: boolean;
  onAddNewProject: () => void;
  onExportExcel: () => void;
  onOpenProfile?: () => void;
  onUpdatePicName?: (name: string) => void;
  onViewActivities?: () => void;
  onLockApp?: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  currentUser,
  onlineUsers = [],
  isConnected = true,
  isWsConnected = false,
  onAddNewProject,
  onExportExcel,
  onOpenProfile,
  onUpdatePicName,
  onViewActivities,
  onLockApp,
  isSaving = false,
}) => {
  const [picInput, setPicInput] = useState<string>('');
  const [isSavedFlash, setIsSavedFlash] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.name) {
      setPicInput(currentUser.name);
    }
  }, [currentUser?.name]);

  const handleSavePic = () => {
    const trimmed = picInput.trim();
    if (trimmed && onUpdatePicName && trimmed !== currentUser?.name) {
      onUpdatePicName(trimmed);
      setIsSavedFlash(true);
      setTimeout(() => setIsSavedFlash(false), 2000);
    }
  };

  return (
    <header className="bg-slate-950/95 backdrop-blur-md text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3 group cursor-pointer transition-transform duration-200 hover:translate-x-0.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white border border-blue-400/30 group-hover:scale-105 group-hover:shadow-blue-500/40 group-hover:rotate-1 transition-all duration-200">
              <HardHat className="w-5 h-5 group-hover:animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  PMO MS Project monitoring
                </span>
                <span className="hidden sm:inline text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider group-hover:bg-blue-500/30 transition-colors">
                  Telecom Civil Works
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Monitoring Relokasi Fiber Optik & Controling PMO Lapangan • <span className="text-slate-300 font-medium">© Copyright PAUL</span>
              </p>
            </div>
          </div>

          {/* Right Action Buttons, Manual PIC Input & Presence */}
          <div className="flex items-center space-x-2">
            {/* Direct Manual PIC Input Box */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xs hover:border-blue-500/60 transition group">
              <button
                type="button"
                onClick={onOpenProfile}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-xs transition hover:opacity-85 cursor-pointer shrink-0"
                style={{ backgroundColor: currentUser?.color || '#2563eb' }}
                title="Klik untuk memilih warna avatar atau jabatan"
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
              </button>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                    PIC:
                  </span>
                  <input
                    type="text"
                    value={picInput}
                    onChange={(e) => setPicInput(e.target.value)}
                    onBlur={handleSavePic}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                        handleSavePic();
                      }
                    }}
                    placeholder="Nama PIC..."
                    className="bg-transparent text-white font-bold text-xs w-24 sm:w-36 focus:outline-none focus:text-blue-300 transition placeholder:text-slate-500"
                    title="Ketik nama PIC manual di sini (tekan Enter untuk menyimpan)"
                  />
                  {isSavedFlash ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center animate-in fade-in">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSavePic}
                      className="text-slate-500 hover:text-blue-400 transition cursor-pointer p-0.5"
                      title="Simpan nama PIC"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  {onLockApp && (
                    <button
                      type="button"
                      onClick={onLockApp}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5 ml-1 border-l border-slate-800 pl-1"
                      title="Kunci Aplikasi / Ganti PIC"
                    >
                      <Lock className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] font-medium text-slate-400 tracking-tight truncate max-w-[120px] sm:max-w-[160px]">
                    {currentUser?.role || 'Project Manager'}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Status indicator */}
            <div
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono shadow-2xs bg-slate-900/90 border-slate-800 text-slate-300"
              title={isWsConnected ? 'Terhubung real-time WebSocket ke server' : 'Sistem Aktif (Sinkronisasi Otomatis Lokal & Antar Tab)'}
            >
              {isWsConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline text-emerald-400 font-sans font-semibold">Live Sync</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="hidden xl:inline text-emerald-400 font-sans font-medium">Aktif</span>
                </>
              )}
            </div>

            {/* Quick Add Project */}
            <button
              type="button"
              onClick={onAddNewProject}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-xs hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5"
              title="Tambah Project Baru"
            >
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline">Project Baru</span>
            </button>

            {/* Export to Excel */}
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xs hover:shadow-md hover:shadow-emerald-500/25 transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5"
              title="Download Excel Workbook"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
              <Download className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
