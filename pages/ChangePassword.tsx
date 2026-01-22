
import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

interface ChangePasswordProps {
  onPasswordChanged: () => void;
  forced: boolean;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onPasswordChanged, forced }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword === '12345') {
      setError('Password baru tidak boleh sama dengan password default.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    // Simulate success
    onPasswordChanged();
  };

  return (
    <div className={`flex items-center justify-center ${forced ? 'min-h-screen bg-slate-100 p-4' : ''}`}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Ubah Password</h2>
          {forced && (
            <div className="mt-2 p-3 bg-amber-50 text-amber-700 rounded-xl text-xs flex items-center gap-2 border border-amber-100">
              <ShieldAlert size={16} />
              <span>Ini adalah login pertama Anda. Silakan ubah password bawaan (12345).</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ulangi password baru"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> Simpan Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
