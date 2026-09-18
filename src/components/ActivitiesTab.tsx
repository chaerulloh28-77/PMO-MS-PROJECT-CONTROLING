import React, { useState } from 'react';
import {
  Activity,
  User,
  Clock,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  FolderKanban,
  Trash2,
  PlusCircle,
  Eye,
  Globe,
} from 'lucide-react';
import { ActivityLog, AuditUser, TabType } from '../types';

interface ActivitiesTabProps {
  activities: ActivityLog[];
  onlineUsers: AuditUser[];
  currentUser: AuditUser;
  onOpenProfile: () => void;
  onSelectProjectTab: (tab: TabType) => void;
  onClearActivities?: () => void;
}

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  activities,
  onlineUsers,
  currentUser,
  onOpenProfile,
  onSelectProjectTab,
  onClearActivities,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isPaul =
    currentUser?.name?.toLowerCase().trim() === 'paul' ||
    currentUser?.name?.toLowerCase().includes('paul') ||
    currentUser?.role?.toLowerCase() === 'admin';

  if (!isPaul) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Akses Terbatas</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Halaman ini hanya dapat diakses melalui otorisasi sistem.
        </p>
        <button
          type="button"
          onClick={() => onSelectProjectTab('overview')}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Kembali ke Overview
        </button>
      </div>
    );
  }

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const getTimeAgo = (ts: string) => {
    try {
      const diffMs = Date.now() - new Date(ts).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 45) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} mnt lalu`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} jam lalu`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays} hari lalu`;
    } catch {
      return '';
    }
  };

  const filtered = activities.filter((act) => {
    if (filterType !== 'all') {
      if (filterType === 'updates' && act.type !== 'update_project') return false;
      if (filterType === 'creates' && act.type !== 'create_project') return false;
      if (filterType === 'links' && act.type !== 'open_link') return false;
      if (filterType === 'deletes' && act.type !== 'delete_project') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = act.user?.name?.toLowerCase().includes(q) || act.user?.role?.toLowerCase().includes(q);
      const matchDesc = act.description?.toLowerCase().includes(q);
      const matchTitle = act.title?.toLowerCase().includes(q);
      const matchProj = act.projectName?.toLowerCase().includes(q);
      return matchUser || matchDesc || matchTitle || matchProj;
    }
    return true;
  });

  const getActionBadge = (type: ActivityLog['type']) => {
    switch (type) {
      case 'create_project':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3 h-3" />
            <span>Project Baru</span>
          </span>
        );
      case 'update_project':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Activity className="w-3 h-3" />
            <span>Perubahan Data</span>
          </span>
        );
      case 'open_link':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Globe className="w-3 h-3" />
            <span>Membuka Link</span>
          </span>
        );
      case 'delete_project':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-3 h-3" />
            <span>Hapus Data</span>
          </span>
        );
      case 'clear_all':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Trash2 className="w-3 h-3" />
            <span>Kosongkan DB</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Eye className="w-3 h-3" />
            <span>Aktivitas</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Audit & Traffic Log */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Audit & Monitoring Log Trafik
              </h1>
            </div>
          </div>
        </div>

        {/* PIC Profile Badge & Clear Button */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {onClearActivities && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Hapus seluruh riwayat Audit & Monitoring Log Trafik?')) {
                  onClearActivities();
                }
              }}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition cursor-pointer"
              title="Hapus seluruh history log aktivitas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus History</span>
            </button>
          )}

          <div className="flex items-center space-x-3 bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
              style={{ backgroundColor: currentUser.color || '#2563eb' }}
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white block">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 block">{currentUser.role}</span>
            </div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-[11px] font-bold px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer"
            >
              Profil
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            Semua ({activities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('updates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'updates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            Perubahan Data
          </button>
          <button
            type="button"
            onClick={() => setFilterType('creates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'creates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            Project Baru
          </button>
          <button
            type="button"
            onClick={() => setFilterType('links')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'links'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            Akses Link
          </button>
          <button
            type="button"
            onClick={() => setFilterType('deletes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'deletes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            Penghapusan
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, project, dll..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Audit Trail & Riwayat Input Data ({filtered.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Diurutkan dari yang paling baru
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">Belum ada catatan aktivitas yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">
              Aktivitas baru akan otomatis muncul saat ada yang menginput atau merubah data.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((act) => (
              <div
                key={act.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-xl transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {/* User Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-extrabold text-xs shadow-xs"
                    style={{ backgroundColor: act.user?.color || '#2563eb' }}
                  >
                    {act.user?.name ? act.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {act.user?.name || 'Anonim'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {act.user?.role || 'Kolaborator'}
                      </span>
                      {getActionBadge(act.type)}
                      <span className="text-[11px] text-blue-600 font-bold bg-blue-50/70 px-2 py-0.5 rounded-md">
                        {getTimeAgo(act.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      {act.description}
                    </p>

                    {act.projectName && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
                        <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                        <span>Project: <strong className="text-slate-800">{act.projectName}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Timestamp */}
                <div className="sm:text-right flex-shrink-0 pl-12 sm:pl-0">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    {formatTimestamp(act.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
