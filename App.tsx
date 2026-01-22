
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, Pegawai, Role } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AssignmentCalendar from './pages/Calendar';
import IdleEmployees from './pages/IdleEmployees';
import SuratTugasForm from './pages/SuratTugasForm';
import DisciplineView from './pages/Discipline';
import Reports from './pages/Reports';
import ChangePassword from './pages/ChangePassword';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isLoggedIn: false
  });

  useEffect(() => {
    const stored = localStorage.getItem('si-kertas-auth');
    if (stored) {
      setAuth(JSON.parse(stored));
    }
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

  if (!auth.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Mandatory redirect for first login
  if (auth.user?.passwordChangeRequired) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/change-password" element={<ChangePassword onPasswordChanged={handlePasswordChanged} forced={true} />} />
          <Route path="*" element={<Navigate to="/change-password" />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Layout user={auth.user!} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={auth.user!} />} />
          <Route path="/pegawai" element={<EmployeeList user={auth.user!} />} />
          <Route path="/kalender" element={<AssignmentCalendar />} />
          <Route path="/discipline" element={<DisciplineView user={auth.user!} />} />
          <Route path="/change-password" element={<ChangePassword onPasswordChanged={handlePasswordChanged} forced={false} />} />
          
          {(auth.user?.role === Role.ADMIN_TIM || auth.user?.role === Role.SUPER_ADMIN) && (
            <>
              <Route path="/idle" element={<IdleEmployees />} />
              <Route path="/surat-tugas/baru" element={<SuratTugasForm />} />
              <Route path="/laporan" element={<Reports />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
