
import React, { useState } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { Lock, User, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: Pegawai) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock Login Logic
    const employees = dataService.getPegawai();
    const user = employees.find(p => p.username === username);

    if (user && password === '12345') {
      onLogin(user);
    } else {
      setError('Username atau password salah (Gunakan password awal 12345)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 p-4">
      <div className="max-w-md w-full">
        {/* Government Branding */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full mx-auto shadow-sm p-4 flex items-center justify-center mb-4 border border-slate-100">
            <img src="https://picsum.photos/100/100" alt="BPMP Logo" className="w-16 h-16 object-contain grayscale opacity-80" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SI-KERTAS</h1>
          <p className="text-slate-500 mt-2 font-medium">Sistem Kerja Tuntas - BPMP</p>
          <div className="h-1 w-12 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Masuk</h2>
          <p className="text-sm text-slate-500 mb-6 italic">Setiap Pegawai Jelas Tugasnya</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="NIP atau Username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100 flex items-center gap-2">
                <ShieldCheck size={14} /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
            >
              Masuk ke Aplikasi
            </button>
          </form>

          <p className="text-center mt-8 text-xs text-slate-400">
            © 2024 BPMP - Pengembangan Aplikasi Internal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
