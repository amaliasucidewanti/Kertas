
import React from 'react';
import { Pegawai, Role, Kedisiplinan } from '../types';
import { dataService } from '../services/dataService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, Shield, Award } from 'lucide-react';

const DisciplineView: React.FC<{ user: Pegawai }> = ({ user }) => {
  const discipline = dataService.getKedisiplinan(user.nip) as Kedisiplinan | undefined;
  
  const scoreData = discipline ? [
    { name: 'Kehadiran (25%)', value: discipline.kehadiran * 0.25, full: 25, color: '#6366f1' },
    { name: 'Apel (15%)', value: discipline.apel * 0.15, full: 15, color: '#f59e0b' },
    { name: 'Log Harian (20%)', value: discipline.logHarian * 0.20, full: 20, color: '#10b981' },
    { name: 'Pelaporan (40%)', value: discipline.pelaporan * 0.40, full: 40, color: '#ec4899' },
  ] : [];

  if (!discipline) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
        <Shield size={48} className="mb-4 opacity-20" />
        <p>Data kedisiplinan Anda belum tersedia bulan ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Award size={100} className="text-indigo-50 opacity-10 transform translate-x-1/4 -translate-y-1/4" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-widest text-slate-400">Rangkuman Kinerja</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
               <p className="text-sm text-slate-500 mb-1">Nilai Akhir</p>
               <p className="text-5xl font-bold text-indigo-600">{discipline.nilaiAkhir}<span className="text-sm text-slate-400 font-normal">/100</span></p>
               <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                 <CheckCircle size={14} /> Kategori: Sangat Baik
               </div>
            </div>
            <div className="flex items-center justify-center">
               <div className="w-32 h-32">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={scoreData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5}>
                       {scoreData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
           <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-widest text-slate-400">Rincian Komponen</h2>
           <div className="space-y-6">
             {scoreData.map((item, idx) => (
               <div key={idx}>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="font-bold text-slate-700">{item.name}</span>
                   <span className="text-slate-500 font-medium">{item.value.toFixed(1)} / {item.full}</span>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(item.value / item.full) * 100}%`, backgroundColor: item.color }}
                   ></div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
        <h4 className="text-indigo-800 font-bold mb-2">Pesan Pimpinan</h4>
        <p className="text-sm text-indigo-600/80 italic leading-relaxed">"Pertahankan kinerja Anda. Disiplin adalah kunci ketuntasan kerja. Laporan log harian yang diisi tepat waktu akan sangat membantu proses administrasi penjaminan mutu pendidikan kita."</p>
      </div>
    </div>
  );
};

export default DisciplineView;
