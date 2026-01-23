
import React, { useState, useMemo } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { Search, Eye, Calendar, FileText, Activity } from 'lucide-react';

const EmployeeList: React.FC<{ user: Pegawai }> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('Semua');

  const employees = dataService.getPegawai();
  const tasks = dataService.getPenugasan();
  const units = ['Semua', ...Array.from(new Set(employees.map(e => e.unitKerja)))];

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.nama.toLowerCase().includes(search.toLowerCase()) || e.nip.includes(search);
      const matchesUnit = unitFilter === 'Semua' || e.unitKerja === unitFilter;
      return matchesSearch && matchesUnit;
    }).map(e => {
      // Hitung jumlah ST per pegawai
      const employeeTasks = tasks.filter(t => dataService.standardizeNip(t.nip) === dataService.standardizeNip(e.nip));
      const activeST = employeeTasks.filter(t => t.laporanStatus === 'Belum Upload').length;
      return { ...e, totalST: employeeTasks.length, activeST };
    });
  }, [employees, tasks, search, unitFilter]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Master Data Pegawai</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Menyinkronkan {employees.length} Profil dengan Database Penugasan</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <div className="relative">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
             <input 
              type="text" 
              placeholder="Cari NIP atau Nama..." 
              className="pl-12 pr-6 py-3 border border-slate-100 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <select 
            className="border border-slate-100 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
           >
             {units.map(u => <option key={u} value={u}>{u}</option>)}
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Profil Pegawai</th>
                <th className="px-8 py-6">Unit Kerja</th>
                <th className="px-8 py-6 text-center">Rekap ST</th>
                <th className="px-8 py-6">Status Kerja</th>
                <th className="px-8 py-6 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map(emp => {
                const isBertugas = dataService.isBertugas(emp.nip);
                return (
                  <tr key={emp.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{emp.nama}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">NIP: {emp.nip}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                         {emp.unitKerja}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col items-center">
                          <div className="flex gap-1">
                             <span className="text-sm font-black text-slate-800">{emp.totalST}</span>
                             <FileText size={14} className="text-slate-300" />
                          </div>
                          {emp.activeST > 0 && (
                             <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter mt-1">{emp.activeST} ST Belum Lapor</span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        isBertugas ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {isBertugas && <Activity size={10} className="animate-pulse" />}
                        {isBertugas ? 'Sedang Bertugas' : 'Tersedia'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100" title="Detail Kinerja">
                          <Eye size={18} />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100" title="Lihat Jadwal">
                          <Calendar size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
