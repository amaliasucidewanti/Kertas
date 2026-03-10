
import React, { useEffect, useState } from 'react';
import { taskSheetService, SimpleTask } from '../services/taskSheetService';
import { RefreshCw, Plus, User, ClipboardList, Calendar, CheckCircle2 } from 'lucide-react';

export const SimpleTaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Form State
  const [nama, setNama] = useState('');
  const [tugas, setTugas] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    const data = await taskSheetService.fetchTasks();
    setTasks(data);
    
    setLoading(false);
    setIsRefreshing(false);
  };

  // Mekanisme Auto Refresh 10 Detik
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !tugas) return;

    const success = await taskSheetService.addTask({ nama_pegawai: nama, tugas });
    if (success) {
      setNama('');
      setTugas('');
      loadData(true);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Form Admin */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          Buat Tugas Baru (Admin)
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nama Pegawai"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="relative">
            <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Deskripsi Tugas"
              value={tugas}
              onChange={(e) => setTugas(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            Kirim ke Spreadsheet
          </button>
        </form>
      </div>

      {/* Tabel Tugas */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-bottom border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Daftar Tugas Pegawai (Sinkronisasi Otomatis)
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin" />}
            Auto-refresh setiap 10 detik
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Pegawai</th>
                <th className="px-6 py-4 font-medium">Tugas</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Memuat data dari Google Sheets...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Belum ada tugas di Spreadsheet.
                  </td>
                </tr>
              ) : (
                tasks.map((task, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{task.id_tugas}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{task.nama_pegawai}</td>
                    <td className="px-6 py-4 text-slate-600">{task.tugas}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(task.tanggal).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
