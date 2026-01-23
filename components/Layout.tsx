
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link, useLocation } from 'react-router-dom';
import { Pegawai, Role } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock as ClockIcon, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  ClipboardCheck
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface LayoutProps {
  user: Pegawai;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatWIT = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jayapura',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await dataService.syncAll();
    setIsSyncing(false);
    window.location.reload();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Isi Laporan Tugas', path: '/isi-laporan', icon: ClipboardCheck, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Data Pegawai', path: '/pegawai', icon: Users, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Kalender Tugas', path: '/kalender', icon: Calendar, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Kedisiplinan', path: '/discipline', icon: ClockIcon, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Buat Penugasan', path: '/surat-tugas/baru', icon: PlusCircle, roles: [Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Laporan Rekap', path: '/laporan', icon: FileText, roles: [Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Kelola Akun', path: '/accounts', icon: ShieldCheck, roles: [Role.ADMIN_TIM, Role.SUPER_ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-24'
        } bg-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-20 border-r border-slate-100`}
      >
        <div className="p-6 border-b flex items-center justify-between bg-white">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-3">
              <img src={brandingLogo} alt="Logo" className="w-10 h-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-black text-slate-800 tracking-tighter text-lg leading-none">SI-KERTAS</span>
                <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest mt-1">BPMP Internal</span>
              </div>
            </div>
          ) : (
            <img src={brandingLogo} alt="Logo" className="w-10 h-10 object-contain mx-auto" />
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-4 rounded-[1.5rem] transition-all duration-300 group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <item.icon size={22} className={`${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-600'} transition-colors`} />
                {isSidebarOpen && <span className="ml-4 font-bold text-sm tracking-tight">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t bg-slate-50/50 space-y-4">
          {isSidebarOpen && (
            <div className="bg-white p-4 rounded-3xl border border-slate-100 mb-2 flex items-center gap-3">
               <img src={brandingLogo} alt="Badge" className="w-8 h-8 object-contain opacity-50 grayscale" />
               <p className="text-[9px] font-black text-slate-400 uppercase leading-tight tracking-widest">Aplikasi Resmi<br/>Kinerja BPMP</p>
            </div>
          )}
          
          <Link
            to="/change-password"
            className={`flex items-center p-3 rounded-2xl transition-colors ${
              location.pathname === '/change-password'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-indigo-50'
            }`}
          >
            <KeyRound size={20} className={location.pathname === '/change-password' ? 'text-white' : 'text-indigo-400'} />
            {isSidebarOpen && <span className="ml-3 font-bold text-xs">Ganti Password</span>}
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 font-bold text-xs">Keluar Sistem</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-6">
             <h2 className="text-slate-800 text-xl font-black tracking-tight">
               {navItems.find(i => i.path === location.pathname)?.name || location.pathname.substring(1).replace('-', ' ') || 'Dashboard'}
             </h2>
             <div className="flex items-center gap-3">
               <button 
                onClick={handleRefresh}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all ${isSyncing ? 'opacity-50' : ''}`}
               >
                 <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                 {isSyncing ? 'Sinkronisasi...' : 'Refresh Data'}
               </button>
               <div className="px-4 py-2 bg-slate-900 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-slate-200">
                  <ClockIcon size={14} className="text-indigo-400" />
                  <span className="text-xs font-black tracking-widest">{formatWIT(currentTime)} WIT</span>
               </div>
             </div>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">{user.nama}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter italic">{user.jabatan}</p>
                <p className="text-[10px] text-indigo-500 font-black mt-0.5 uppercase tracking-widest">{user.role}</p>
             </div>
             <div className="w-12 h-12 rounded-3xl bg-slate-900 flex items-center justify-center text-white border-4 border-slate-100 shadow-xl">
                <UserCircle size={28} />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
           <img src={brandingLogo} alt="Watermark" className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] object-contain opacity-[0.03] pointer-events-none" />
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
