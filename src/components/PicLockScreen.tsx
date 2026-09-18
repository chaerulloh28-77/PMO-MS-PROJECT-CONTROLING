import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  UserCheck,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  HardHat,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface PicLockScreenProps {
  isLocked: boolean;
  onUnlock: (picName: string, role?: string) => void;
  initialPicName?: string;
  initialRole?: string;
}

export const PicLockScreen: React.FC<PicLockScreenProps> = ({
  isLocked,
  onUnlock,
  initialPicName = '',
  initialRole = 'Project Manager',
}) => {
  // If initial name is a placeholder, start empty so the user explicitly types it
  const cleanInitial =
    initialPicName && !/^user-\d+/i.test(initialPicName) && initialPicName !== 'PIC Input'
      ? initialPicName
      : '';

  const [picName, setPicName] = useState<string>(cleanInitial);
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>(() => {
    if (['Project Manager', 'Section Head', 'Admin'].includes(initialRole)) {
      return initialRole;
    }
    return 'Project Manager';
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Clear sensitive input whenever lock state is triggered
  React.useEffect(() => {
    if (isLocked) {
      setPassword('');
      setErrorMessage(null);
      setIsSuccess(false);
      if (initialPicName && !/^user-\d+/i.test(initialPicName) && initialPicName !== 'PIC Input') {
        setPicName(initialPicName);
      }
      if (['Project Manager', 'Section Head', 'Admin'].includes(initialRole)) {
        setRole(initialRole);
      }
    }
  }, [isLocked, initialPicName, initialRole]);

  if (!isLocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedPic = picName.trim();
    const trimmedPass = password.trim().toLowerCase();

    // 1. Mandatory PIC Name validation
    if (!trimmedPic) {
      setErrorMessage('Wajib input Nama PIC! Aplikasi terkunci dan tidak dapat dioperasikan tanpa nama PIC.');
      return;
    }

    if (trimmedPic.length < 2) {
      setErrorMessage('Nama PIC terlalu pendek (minimal 2 karakter).');
      return;
    }

    // 2. Password validation: "paul inside"
    if (trimmedPass !== 'paul inside') {
      setErrorMessage('Password salah! Silakan periksa dan masukkan password otorisasi yang benar.');
      return;
    }

    // Success
    setIsSuccess(true);
    setTimeout(() => {
      onUnlock(trimmedPic, role);
      setIsSuccess(false);
    }, 450);
  };

  return (
    <div
      id="pic-lock-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white text-center relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border border-blue-400/30 mb-3">
              <HardHat className="w-7 h-7" />
            </div>

            <div className="flex items-center space-x-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Aplikasi Terkunci</span>
            </div>

            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              PMO MS Project monitoring
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Wajib input nama PIC penanggung jawab dan password otorisasi sebelum mengoperasikan sistem.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="leading-relaxed font-semibold">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Input 1: Mandatory PIC Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama PIC Input <span className="text-rose-500">*</span></span>
              </span>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Wajib Diisi
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={picName}
                onChange={(e) => {
                  setPicName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Ketik Nama Lengkap / Panggilan PIC Anda..."
                className="w-full pl-3.5 pr-3.5 py-3 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nama ini akan dicatat ke log audit dan identitas setiap kali Anda menginput atau merubah project.
            </p>
          </div>

          {/* Input 2: Mandatory Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Password Otorisasi <span className="text-rose-500">*</span></span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Masukkan password otorisasi..."
                className="w-full pl-3.5 pr-10 py-3 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition shadow-2xs placeholder:font-sans placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Peran / Jabatan Lapangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Peran / Jabatan Lapangan</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 text-slate-800 cursor-pointer"
            >
              <option value="Project Manager">Project Manager</option>
              <option value="Section Head">Section Head</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSuccess}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 hover:shadow-blue-500/25 active:scale-98'
              }`}
            >
              {isSuccess ? (
                <>
                  <Unlock className="w-4 h-4 animate-bounce" />
                  <span>Akses Terbuka... Masuk ke Sistem</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Buka Kunci Aplikasi (Unlock)</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Footer Notice */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Sistem Keamanan Akses PMO Lapangan • <span className="font-semibold text-slate-600">© Copyright PAUL</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
