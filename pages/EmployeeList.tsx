
import React, { useState } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { Search, Eye, Calendar } from 'lucide-react';

const EmployeeList: React.FC<{ user: Pegawai }> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('Semua');

  const employees = dataService.getPegawai();
  const units = ['Semua', ...Array.from(new Set(employees.map(e => e.unitKerja)))];

  const filtered = employees.filter(e => {
    const matchesSearch = e.nama.toLowerCase().includes(search.toLowerCase()) || e.nip.includes(search);
    const matchesUnit = unitFilter === 'Semua' || e.unitKerja === unitFilter;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Master Data Pegawai</h1>
        <div className="flex flex-wrap gap-2">
           <div className="relative">
             <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
             <input 
              type="text" 
              placeholder="Cari NIP atau Nama..." 
              className="pl-10 pr-4 py-2 border rounded-xl text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <select 
            className="border rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
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
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-6">Pegawai</th>
                <th className="px-8 py-6">Jabatan</th>
                <th className="px-8 py-6">Unit Kerja</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map(emp => {
                const isBertugas = dataService.isBertugas(emp.nip);
                return (
                  <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800">{emp.nama}</p>
                      <p className="text-xs text-slate-400 font-bold">NIP: {emp.nip}</p>
                    </td>
                    <td className="px-8 py-6 text-slate-600 font-medium">{emp.jabatan}</td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">
                         {emp.unitKerja}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        isBertugas ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isBertugas ? 'Bertugas' : 'Tersedia'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100" title="Detail">
                          <Eye size={18} />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100" title="Kalender">
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
