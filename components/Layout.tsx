
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pegawai, Role } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  ClipboardList, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  KeyRound
} from 'lucide-react';

interface LayoutProps {
  user: Pegawai;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Data Pegawai', path: '/pegawai', icon: Users, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Kalender Tugas', path: '/kalender', icon: Calendar, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Kedisiplinan', path: '/discipline', icon: Clock, roles: [Role.PEGAWAI, Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Pegawai Idle', path: '/idle', icon: ClipboardList, roles: [Role.ADMIN_TIM, Role.SUPER_ADMIN] },
    { name: 'Laporan', path: '/laporan', icon: FileText, roles: [Role.ADMIN_TIM, Role.SUPER_ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-xl transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-4 border-b flex items-center justify-between bg-indigo-50/50">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
              <span className="font-bold text-slate-800 tracking-tight">SI-KERTAS</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto">K</div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white rounded-md">
            {isSidebarOpen ? <X size={20} className="text-slate-500" /> : <Menu size={20} className="text-slate-500" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <item.icon size={22} className={`${isActive ? 'text-white' : 'text-indigo-400'}`} />
                {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t bg-slate-50 space-y-1">
          <Link
            to="/change-password"
            className={`flex items-center p-3 rounded-xl transition-colors ${
              location.pathname === '/change-password'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-indigo-50'
            }`}
          >
            <KeyRound size={22} className={location.pathname === '/change-password' ? 'text-white' : 'text-indigo-400'} />
            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Ganti Password</span>}
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
          <h2 className="text-slate-800 font-semibold truncate">
            {navItems.find(i => i.path === location.pathname)?.name || location.pathname.substring(1).replace('-', ' ') || 'Si-Kertas'}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.nama}</p>
                <p className="text-xs text-slate-500 mt-1">{user.role}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                <UserCircle size={24} />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
