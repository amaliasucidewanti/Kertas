
import React from 'react';
import { dataService } from '../services/dataService';
import { UserPlus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IdleEmployees: React.FC = () => {
  const employees = dataService.getPegawai();
  const navigate = useNavigate();

  const idleList = employees.map(e => ({
    ...e,
    idleDays: dataService.getIdleDays(e.nama)
  })).filter(e => e.idleDays > 0)
     .sort((a, b) => b.idleDays - a.idleDays);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Pegawai Tidak Bertugas</h1>
        <p className="text-slate-600 max-w-2xl">Daftar pegawai yang saat ini tidak memiliki surat tugas aktif. Segera berikan penugasan untuk optimalisasi kinerja tim.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Lama Idle</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {idleList.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{emp.nama}</td>
                  <td className="px-6 py-4 text-slate-600">{emp.jabatan}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-amber-600 font-bold">
                      <Clock size={16} />
                      {emp.idleDays} Hari
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate('/surat-tugas/baru', { state: { employee: emp } })}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      <UserPlus size={14} /> Buat Surat Tugas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IdleEmployees;
