
import React, { useState } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { Search, Eye, Calendar, Filter } from 'lucide-react';

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
              className="pl-10 pr-4 py-2 border rounded-xl text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-indigo-500"
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Unit Kerja</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map(emp => {
                const isBertugas = dataService.isBertugas(emp.nama);
                return (
                  <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{emp.nama}</p>
                      <p className="text-xs text-slate-500">{emp.nip}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{emp.jabatan}</td>
                    <td className="px-6 py-4 text-slate-600">{emp.unitKerja}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isBertugas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isBertugas ? 'Bertugas' : 'Tersedia'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all" title="Detail">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all" title="Kalender">
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
