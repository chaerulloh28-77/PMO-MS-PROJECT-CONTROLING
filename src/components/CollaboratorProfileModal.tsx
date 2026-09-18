import React, { useState } from 'react';
import { X, User, Check, ShieldCheck, Palette } from 'lucide-react';
import { AuditUser } from '../types';

interface CollaboratorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuditUser;
  onSave: (updated: AuditUser) => void;
  defaultRoles: string[];
  avatarColors: string[];
}

export const CollaboratorProfileModal: React.FC<CollaboratorProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
  defaultRoles,
  avatarColors,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [color, setColor] = useState(currentUser.color);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...currentUser,
      name: name.trim(),
      role: role.trim() || 'Team Member',
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
              style={{ backgroundColor: color }}
            >
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Identitas Kolaborator</h3>
              <p className="text-[11px] text-slate-500">Nama Anda tercatat pada setiap input & perubahan data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap / Panggilan
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo, Siti Rahma, dll"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Rekan tim lain yang membuka link dapat melihat siapa yang sedang aktif & mengedit data.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Peran / Jabatan Lapangan</span>
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
                >
                  {defaultRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>Pilih Warna Avatar Badge</span>
              </label>
              <div className="flex items-center space-x-2 pt-1">
                {avatarColors.map((c) => {
                  const isSelected = color === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        isSelected ? 'scale-115 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="shrink-0 p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-xs transition cursor-pointer"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
