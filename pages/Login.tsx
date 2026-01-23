
import React, { useState, useEffect } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { Lock, User, ChevronRight, AlertCircle, Database, Search, X, ListFilter } from 'lucide-react';

interface LoginProps {
  onLogin: (user: Pegawai) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showNipList, setShowNipList] = useState(false);
  const [searchNip, setSearchNip] = useState('');

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";

  useEffect(() => {
    const checkData = async () => {
      const users = dataService.getAllUsers();
      if (users.length > 2) {
        setDbStatus('ready');
      } else {
        const synced = await dataService.syncAll();
        setDbStatus(synced ? 'ready' : 'error');
      }
    };
    checkData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dbStatus !== 'ready') {
      setError('Database belum siap. Tunggu sinkronisasi...');
      return;
    }
    
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const allUsers = dataService.getAllUsers();
      const rawInput = username.trim();
      const inputLower = rawInput.toLowerCase();
      const inputNumbers = rawInput.replace(/\D/g, '');

      const user = allUsers.find(p => {
        if (p.username.toLowerCase() === inputLower) return true;
        const cleanUserNip = p.nip.replace(/\D/g, '');
        if (cleanUserNip === inputNumbers && inputNumbers.length > 5) return true;
        return false;
      });

      if (user) {
        if (password === '12345') {
          onLogin(user);
        } else {
          setError('Password salah. Gunakan default: 12345');
          setIsLoading(false);
        }
      } else {
        setError('NIP/Username tidak ditemukan. Cek daftar NIP di bawah.');
        setIsLoading(false);
      }
    }, 600);
  };

  const filteredUsers = dataService.getAllUsers().filter(u => 
    u.nama.toLowerCase().includes(searchNip.toLowerCase()) || 
    u.nip.includes(searchNip)
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 selection:bg-indigo-100 overflow-hidden relative font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-50 rounded-full blur-[150px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-50 rounded-full blur-[120px] opacity-40"></div>

      <div className="max-w-md w-full relative z-10 space-y-10">
        <div className="text-center group">
          <div className="w-24 h-24 bg-white rounded-[2rem] mx-auto shadow-2xl p-5 flex items-center justify-center mb-8 border border-white/50 group-hover:rotate-6 transition-transform duration-700 ease-out">
             <img src={brandingLogo} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">SI-KERTAS</h1>
          <p className="text-slate-500 font-black tracking-[0.3em] text-[9px] uppercase mt-3 opacity-80 italic">Sistem Kerja Tuntas • BPMP Internal</p>
          
          <div className="mt-6 flex justify-center">
            <div className={`flex items-center gap-2 px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
              dbStatus === 'ready' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
              dbStatus === 'loading' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 
              'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              <Database size={10} />
              {dbStatus === 'ready' ? 'Database Terhubung' : 
               dbStatus === 'loading' ? 'Menghubungkan...' : 
               'Koneksi Gagal'}
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-10 border border-white relative overflow-hidden ring-1 ring-slate-100">
          <h2 className="text-xl font-black text-slate-900 mb-1">Login Internal</h2>
          <p className="text-[10px] font-bold text-slate-400 mb-8 leading-relaxed uppercase tracking-widest italic">Masukkan NIP untuk akses sistem</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">NIP / Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-300">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-slate-800 text-sm"
                  placeholder="NIP Pegawai"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-300">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-slate-800 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} /> <span className="uppercase tracking-widest">{error}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowNipList(true)}
                  className="text-indigo-600 hover:underline text-left ml-6 uppercase"
                >
                  Klik di sini untuk cek daftar NIP valid
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || dbStatus !== 'ready'}
              className={`w-full bg-slate-900 hover:bg-black text-white font-black py-4 px-8 rounded-[1.5rem] shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${isLoading || dbStatus !== 'ready' ? 'opacity-50' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Masuk Sistem</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
             <button 
                onClick={() => setShowNipList(true)}
                className="flex items-center justify-center gap-2 mx-auto text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
             >
                <ListFilter size={14} /> Cek Daftar NIP/Username Terdaftar
             </button>
          </div>
        </div>
      </div>

      {/* MODAL CEK NIP */}
      {showNipList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Daftar Akun Terdeteksi</h3>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Total: {dataService.getAllUsers().length} Akun</p>
              </div>
              <button onClick={() => setShowNipList(false)} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            
            <div className="p-6 bg-slate-50 border-b border-slate-100">
               <div className="relative">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                  type="text" 
                  placeholder="Cari Nama atau NIP..." 
                  className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                  value={searchNip}
                  onChange={(e) => setSearchNip(e.target.value)}
                 />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-1 gap-2">
                {filteredUsers.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-indigo-50 transition-all group">
                    <div>
                      <p className="font-black text-slate-800 text-sm">{u.nama}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">NIP: {u.nip}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setUsername(u.username);
                        setShowNipList(false);
                      }}
                      className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl transition-all"
                    >
                      Gunakan
                    </button>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Data tidak ditemukan.</div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Data ini ditarik secara dinamis dari sheet DATA_PEGAWAI</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
