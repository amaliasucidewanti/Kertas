
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, Pegawai, Role } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AssignmentCalendar from './pages/Calendar';
import SuratTugasForm from './pages/SuratTugasForm';
import AssignmentWizard from './pages/AssignmentWizard';
import LaporanTugas from './pages/LaporanTugas';
import DisciplineView from './pages/Discipline';
import Reports from './pages/Reports';
import ChangePassword from './pages/ChangePassword';
import ManageAccounts from './pages/ManageAccounts';
import ProgramKegiatan2026 from './pages/ProgramKegiatan2026';
import Layout from './components/Layout';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isLoggedIn: false
  });
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await dataService.syncAll();
      setIsDataReady(true);

      const stored = localStorage.getItem('si-kertas-auth');
      if (stored) {
        setAuth(JSON.parse(stored));
      }
    };
    initApp();
  }, []);

  const handleLogin = (user: Pegawai) => {
    const newState = { user, isLoggedIn: true };
    setAuth(newState);
    localStorage.setItem('si-kertas-auth', JSON.stringify(newState));
  };

  const handleLogout = () => {
    setAuth({ user: null, isLoggedIn: false });
    localStorage.removeItem('si-kertas-auth');
  };

  const handlePasswordChanged = () => {
    if (auth.user) {
      const updatedUser = { ...auth.user, passwordChangeRequired: false };
      const newState = { ...auth, user: updatedUser };
      setAuth(newState);
      localStorage.setItem('si-kertas-auth', JSON.stringify(newState));
    }
  };

  if (!isDataReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Sinkronisasi SI-KERTAS</p>
          <p className="text-xs text-slate-400 font-bold mt-2 italic">Menyinkronkan data dengan Spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (!auth.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      {auth.user?.passwordChangeRequired ? (
        <Routes>
          <Route path="/change-password" element={<ChangePassword onPasswordChanged={handlePasswordChanged} forced={true} />} />
          <Route path="*" element={<Navigate to="/change-password" />} />
        </Routes>
      ) : (
        <Layout user={auth.user!} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard user={auth.user!} />} />
            <Route path="/pegawai" element={<EmployeeList user={auth.user!} />} />
            <Route path="/kalender" element={<AssignmentCalendar />} />
            <Route path="/discipline" element={<DisciplineView user={auth.user!} />} />
            <Route path="/program-2026" element={<ProgramKegiatan2026 user={auth.user!} />} />
            <Route path="/change-password" element={<ChangePassword onPasswordChanged={handlePasswordChanged} forced={false} />} />
            <Route path="/isi-laporan" element={<LaporanTugas user={auth.user!} />} />
            
            {(auth.user?.role === Role.ADMIN_TIM || auth.user?.role === Role.SUPER_ADMIN) && (
              <>
                <Route path="/surat-tugas/baru" element={<AssignmentWizard />} />
                <Route path="/surat-tugas/edit" element={<SuratTugasForm />} />
                <Route path="/laporan" element={<Reports />} />
                <Route path="/accounts" element={<ManageAccounts user={auth.user!} />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;
