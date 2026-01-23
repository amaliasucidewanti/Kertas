
import React, { useMemo } from 'react';
import { dataService } from '../services/dataService';
import { UserPlus, Clock, Search, ClipboardCheck, Info } from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const IdleEmployees: React.FC = () => {
  const employees = dataService.getPegawai();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const idleList = useMemo(() => {
    return employees.map(e => ({
      ...e,
      idleDays: dataService.getIdleDays(e.nip)
    })).filter(e => e.idleDays > 0)
       .filter(e => e.nama.toLowerCase().includes(searchTerm.toLowerCase()) || e.nip.includes(searchTerm))
       .sort((a, b) => b.idleDays - a.idleDays);
  }, [employees, searchTerm]);

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto">
      <div className="bg-amber-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Clock size={240} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
               <Info size={14} /> Kesiapan Operasional
            </div>
            <h1 className="text-4xl font-black tracking-tighter leading-tight italic mb-4 uppercase">
               Personel Siaga<br/>(Ready to Deploy)
            </h1>
            <p className="text-amber-100/60 font-medium text-sm leading-relaxed">
               Daftar pegawai yang saat ini tidak memiliki surat tugas aktif. Monitoring durasi standby diperlukan untuk memastikan pemerataan beban kerja antar tim.
            </p>
         </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-10 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tighter">Manajemen Ketersediaan</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{idleList.length} Pegawai Tersedia Hari Ini</p>
           </div>
           <div className="relative min-w-[300px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Cari NIP atau Nama..." 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <th className="px-10 py-6">Pegawai / Personel</th>
                <th className="px-10 py-6">Unit Kerja & Jabatan</th>
                <th className="px-10 py-6">Durasi Siaga</th>
                <th className="px-10 py-6 text-right">Aksi Penugasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {idleList.length > 0 ? idleList.map(emp => (
                <tr key={emp.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{emp.nama}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">NIP: {emp.nip}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="font-bold text-slate-700">{emp.unitKerja}</p>
                    <p className="text-[10px] text-slate-400 font-bold italic mt-1 uppercase">{emp.jabatan}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="inline-flex items-center gap-3 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest border border-amber-100">
                      <Clock size={16} />
                      {emp.idleDays} Hari
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => navigate('/surat-tugas/baru', { state: { employee: emp } })}
                      className="inline-flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
                    >
                      <UserPlus size={16} /> Terbitkan ST
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6">
                         <div className="p-8 bg-slate-50 rounded-[3rem]">
                            <ClipboardCheck size={64} className="text-slate-200" />
                         </div>
                         <div>
                            <p className="text-xl font-black text-slate-300 uppercase tracking-tighter">Seluruh Pegawai Sedang Bertugas</p>
                            <p className="text-xs text-slate-400 font-bold mt-2 uppercase italic tracking-widest">Kapasitas operasional instansi 100%</p>
                         </div>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IdleEmployees;
