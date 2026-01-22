
import React, { useMemo, useState } from 'react';
import { Pegawai, Role, Penugasan } from '../types';
import { dataService } from '../services/dataService';
import { 
  Users, 
  AlertCircle, 
  FileCheck, 
  TrendingUp, 
  Search,
  Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: Pegawai;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [filterMonth, setFilterMonth] = useState('05');
  const [filterYear, setFilterYear] = useState('2024');
  const [searchQuery, setSearchQuery] = useState('');

  const employees = dataService.getPegawai();
  const tasks = dataService.getPenugasan();
  const discipline = dataService.getKedisiplinan() as any[];

  const summary = useMemo(() => {
    const bertugasCount = employees.filter(e => dataService.isBertugas(e.nama)).length;
    const idleCount = employees.length - bertugasCount;
    const activeST = tasks.filter(t => t.statusTugas === 'Aktif').length;
    const avgDiscipline = discipline.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / discipline.length;

    return {
      bertugas: bertugasCount,
      idle: idleCount,
      activeST: activeST,
      avgDiscipline: avgDiscipline.toFixed(1)
    };
  }, [employees, tasks, discipline]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.namaPegawai.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = t.tanggalMulai.includes(`${filterYear}-${filterMonth}`);
      return matchesSearch && matchesDate;
    });
  }, [tasks, searchQuery, filterMonth, filterYear]);

  const chartData = [
    { name: 'Bertugas', value: summary.bertugas, color: '#E0F2FE' },
    { name: 'Idle', value: summary.idle, color: '#FEE2E2' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 focus:ring-indigo-500 outline-none"
          >
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            {/* ... other months */}
          </select>
          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 focus:ring-indigo-500 outline-none"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Cari Pegawai..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pegawai Bertugas</p>
            <p className="text-2xl font-bold text-slate-800">{summary.bertugas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tidak Bertugas</p>
            <p className="text-2xl font-bold text-rose-600">{summary.idle}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><FileCheck size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ST Aktif</p>
            <p className="text-2xl font-bold text-slate-800">{summary.activeST}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata Kedisiplinan</p>
            <p className="text-2xl font-bold text-slate-800">{summary.avgDiscipline}%</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Notifications & Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Bell size={20} className="text-indigo-500" /> Notifikasi
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
                <p className="text-sm font-bold text-slate-800">Surat Tugas Baru</p>
                <p className="text-xs text-slate-500">Workshop Penulisan dimulai 10 Mei 2024</p>
              </div>
              <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg">
                <p className="text-sm font-bold text-slate-800">Laporan Belum Diisi</p>
                <p className="text-xs text-slate-500">Koordinasi Wilayah A sudah berakhir</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-64">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Status Beban Kerja</h3>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" hide />
                 <YAxis type="category" dataKey="name" />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#f43f5e'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Task Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-slate-800">Rekap Pelaksanaan Tugas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Pegawai</th>
                  <th className="px-6 py-4">Nama Kegiatan</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{task.namaPegawai}</td>
                    <td className="px-6 py-4 text-slate-600">{task.namaKegiatan}</td>
                    <td className="px-6 py-4 text-slate-500">{task.tanggalMulai} s/d {task.tanggalSelesai}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        task.statusTugas === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {task.statusTugas}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Tidak ada data penugasan bulan ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
