
import React, { useState, useMemo } from 'react';
import { Pegawai, Role, Penugasan } from '../types';
import { dataService } from '../services/dataService';
import { Search, Eye, Calendar, FileText, Activity, Edit, X, Save, ShieldCheck, TrendingUp, Info } from 'lucide-react';

const EmployeeList: React.FC<{ user: Pegawai }> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('Semua');
  const [editingEmployee, setEditingEmployee] = useState<Pegawai | null>(null);

  const employees = dataService.getPegawai();
  const tasks = dataService.getPenugasan();
  const units = ['Semua', ...Array.from(new Set(employees.map(e => e.unitKerja)))];

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.nama.toLowerCase().includes(search.toLowerCase()) || e.nip.includes(search);
      const matchesUnit = unitFilter === 'Semua' || e.unitKerja === unitFilter;
      return matchesSearch && matchesUnit;
    }).map(e => {
      const summary = dataService.getEmployeeAssignmentSummary(e.nip);
      const isBertugas = dataService.isBertugas(e.nip);
      const activeST = tasks.filter(t => dataService.standardizeNip(t.nip) === dataService.standardizeNip(e.nip) && t.laporanStatus === 'Belum Upload').length;
      return { ...e, ...summary, activeST, isBertugas };
    });
  }, [employees, tasks, search, unitFilter]);

  const handleUpdatePreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      dataService.updatePegawai(editingEmployee.nip, {
        jenisTugas: editingEmployee.jenisTugas,
        sumberBiaya: editingEmployee.sumberBiaya
      });
      setEditingEmployee(null);
      alert('Preferensi penugasan pegawai berhasil diperbarui!');
    }
  };

  const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN_TIM;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Master Data Pegawai</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Agregasi Frekuensi Kinerja dari {tasks.length} Surat Tugas</p>
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

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Profil Pegawai</th>
                <th className="px-8 py-6">Unit Kerja</th>
                <th className="px-8 py-6">Ringkasan Jenis Tugas</th>
                <th className="px-8 py-6">Distribusi Biaya ST</th>
                <th className="px-8 py-6 text-center">Status Kerja</th>
                <th className="px-8 py-6 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map(emp => {
                return (
                  <tr key={emp.id} className="hover:bg-indigo-50/10 transition-colors group">
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
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span className="text-[10px] font-black text-slate-600 uppercase">Luring: {emp.typeCounts.luring} Kali</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            <span className="text-[10px] font-black text-slate-600 uppercase">Daring: {emp.typeCounts.daring} Kali</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-2">
                          <div className="flex flex-col gap-0.5">
                             <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                <span className="text-slate-400">BPMP:</span>
                                <span className="text-slate-700">{emp.costCounts.bpmp} kali</span>
                             </div>
                             <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                <span className="text-slate-400">Penyelenggara:</span>
                                <span className="text-slate-700">{emp.costCounts.penyelenggara} kali</span>
                             </div>
                             <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                <span className="text-slate-400">Tanpa Biaya:</span>
                                <span className="text-slate-700">{emp.costCounts.tanpaBiaya} kali</span>
                             </div>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                             <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(emp.costCounts.bpmp / (emp.total || 1)) * 100}%` }}></div>
                             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(emp.costCounts.penyelenggara / (emp.total || 1)) * 100}%` }}></div>
                             <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${(emp.costCounts.tanpaBiaya / (emp.total || 1)) * 100}%` }}></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          emp.isBertugas ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          {emp.isBertugas && <Activity size={10} className="animate-pulse" />}
                          {emp.isBertugas ? 'Sedang Bertugas' : 'Tersedia'}
                        </span>
                        {emp.activeST > 0 && (
                          <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 uppercase tracking-tighter">
                            {emp.activeST} ST Belum Lapor
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        {isAdmin && (
                          <button 
                            onClick={() => setEditingEmployee(emp)}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100" 
                            title="Edit Preferensi Tugas"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        <button className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100" title="Detail Kinerja">
                          <Eye size={18} />
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

      {/* MODAL EDIT PREFERENSI TUGAS */}
      {editingEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="p-10 bg-indigo-900 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Edit Profil Pegawai</h3>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{editingEmployee.nama}</p>
                 </div>
                 <button onClick={() => setEditingEmployee(null)} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
              </div>

              <form onSubmit={handleUpdatePreference} className="p-10 space-y-8">
                 <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                    <div className="mt-1">
                      <Info size={20} className="text-amber-500 shrink-0" />
                    </div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight italic">
                       Pengaturan di bawah ini adalah preferensi default saat pembuatan Surat Tugas baru. Statistik kumulatif akan dihitung otomatis dari riwayat ST.
                    </p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Tugas Default</label>
                    <div className="grid grid-cols-2 gap-4">
                       {['Luring', 'Daring'].map(val => (
                          <button 
                            key={val} type="button" 
                            onClick={() => setEditingEmployee({...editingEmployee, jenisTugas: val as any})}
                            className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${editingEmployee.jenisTugas === val ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}
                          >
                            {val}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sumber Biaya Default</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      value={editingEmployee.sumberBiaya}
                      onChange={e => setEditingEmployee({...editingEmployee, sumberBiaya: e.target.value as any})}
                    >
                       <option value="BPMP">BPMP (DIPA Internal)</option>
                       <option value="Penyelenggara">Penyelenggara (Eksternal)</option>
                       <option value="Tanpa Biaya">Tanpa Biaya</option>
                    </select>
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                       <Save size={18} /> Simpan Perubahan
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
