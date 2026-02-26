
import React, { useState, useMemo } from 'react';
import { Pegawai, Role, Kedisiplinan } from '../types';
import { dataService } from '../services/dataService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { CheckCircle, Shield, Award, TrendingUp, Info, Zap, AlertCircle, ChevronRight, User, Search, Filter, ArrowLeft } from 'lucide-react';

const DisciplineView: React.FC<{ user: Pegawai }> = ({ user }) => {
  const [selectedNip, setSelectedNip] = useState<string | null>(user.role === Role.PEGAWAI ? user.nip : null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('Semua');

  const allEmployees = dataService.getPegawai().filter(e => {
    if (e.nama.toLowerCase().includes('santoso')) {
      const viewerName = user.nama.toLowerCase();
      return viewerName.includes('santoso') || viewerName.includes('adin');
    }
    return true;
  });

  const discipline = selectedNip ? dataService.getKedisiplinan(selectedNip) : null;
  const empInfo = selectedNip ? allEmployees.find(e => e.nip === selectedNip) : null;

  const getScoreColorClass = (score: number) => {
    if (score > 90) return 'text-emerald-500';
    if (score >= 76) return 'text-indigo-500';
    return 'text-rose-500';
  };

  const getScoreBgClass = (score: number) => {
    if (score > 90) return 'bg-emerald-500';
    if (score >= 76) return 'bg-indigo-500';
    return 'bg-rose-500';
  };

  const getScoreBadgeClass = (score: number) => {
    if (score > 90) return 'bg-emerald-50 text-emerald-600';
    if (score >= 76) return 'bg-indigo-50 text-indigo-600';
    return 'bg-rose-50 text-rose-600';
  };

  const scoreData = useMemo(() => {
    if (!discipline) return [];
    return [
      { category: 'Kehadiran', val: discipline.kehadiran, weight: '25%', color: '#6366f1' },
      { category: 'Apel Pagi', val: discipline.apel, weight: '15%', color: '#f59e0b' },
      { category: 'Log Harian', val: discipline.logHarian, weight: '20%', color: '#ec4899' },
      { category: 'Pelaporan', val: discipline.pelaporan, weight: '40%', color: '#1e293b' },
    ];
  }, [discipline]);

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(e => {
      const disc = dataService.getKedisiplinan(e.nip);
      if (!disc) return false;
      const matchesSearch = e.nama.toLowerCase().includes(searchTerm.toLowerCase()) || e.nip.includes(searchTerm);
      const matchesUnit = filterUnit === 'Semua' || e.unitKerja === filterUnit;
      return matchesSearch && matchesUnit;
    });
  }, [allEmployees, searchTerm, filterUnit]);

  // View: Admin List
  if ((user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN_TIM) && !selectedNip) {
    return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        <div className="bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><Shield size={240}/></div>
           <div className="relative z-10">
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Audit Kinerja Kolektif</h1>
              <p className="text-indigo-300 font-black text-[10px] uppercase tracking-[0.3em] mt-4 italic opacity-70">Instrumen Akuntabilitas Kinerja Staf BPMP MALUT</p>
           </div>
        </div>

        <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
           <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
              <div className="relative w-full md:w-96">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                  type="text" placeholder="Cari Pegawai..." 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <select 
                  className="flex-1 md:w-64 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold text-sm focus:border-indigo-500 outline-none transition-all"
                  value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
                 >
                    <option value="Semua">Seluruh Unit</option>
                    {Array.from(new Set(allEmployees.map(e => e.unitKerja))).map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                       <th className="px-8 py-6">Pegawai</th>
                       <th className="px-8 py-6">Unit Kerja</th>
                       <th className="px-8 py-6">Indikator Kinerja (Berbobot)</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6 text-right">Detail</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredEmployees.map(emp => {
                       const disc = dataService.getKedisiplinan(emp.nip);
                       const score = disc?.nilaiAkhir || 0;
                       return (
                          <tr key={emp.nip} className="hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => setSelectedNip(emp.nip)}>
                             <td className="px-8 py-6">
                                <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{emp.nama}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{emp.nip}</p>
                             </td>
                             <td className="px-8 py-6">
                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">{emp.unitKerja}</span>
                             </td>
                             <td className="px-8 py-6 w-80">
                                <div className="flex items-center gap-4">
                                   <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full ${getScoreBgClass(score)} transition-all duration-700`} style={{ width: `${score}%` }}></div>
                                   </div>
                                   <span className={`text-sm font-black w-10 text-right ${getScoreColorClass(score)}`}>{score}%</span>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getScoreBadgeClass(score)}`}>
                                   {score > 90 ? 'Sangat Baik' : score >= 76 ? 'Standar' : 'Perlu Perbaikan'}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 group-hover:text-indigo-600 group-hover:shadow-xl transition-all inline-block">
                                   <ChevronRight size={18}/>
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
  }

  // View: Single User Detail
  if (!discipline) return <div className="p-20 text-center font-black text-slate-300 italic uppercase">Pilih pegawai untuk melihat detail disiplin.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in">
      {user.role !== Role.PEGAWAI && (
        <button onClick={() => setSelectedNip(null)} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-all mb-4">
           <ArrowLeft size={16}/> Kembali ke Daftar Audit
        </button>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><Award size={240} /></div>
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-3 bg-white/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
            <Zap size={16} className="text-amber-400" /> Profil Akuntabilitas Pegawai
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">{empInfo?.nama}</h1>
          <p className="text-slate-400 font-bold text-xs mt-4 uppercase tracking-widest opacity-60">NIP. {empInfo?.nip} • {empInfo?.jabatan}</p>
          <div className="mt-8 flex gap-3">
             <span className="bg-indigo-600/30 border border-indigo-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{empInfo?.unitKerja}</span>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-white/20 text-center relative z-10 min-w-[240px] shadow-2xl mt-8 md:mt-0">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Skor Kinerja Gabungan</p>
           <p className={`text-7xl font-black tracking-tighter ${getScoreColorClass(discipline.nilaiAkhir)}`}>{discipline.nilaiAkhir}%</p>
           <div className={`mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${getScoreColorClass(discipline.nilaiAkhir)}`}>
              <CheckCircle size={14}/> Kategori: {discipline.nilaiAkhir > 90 ? 'Sangat Baik' : discipline.nilaiAkhir >= 76 ? 'Standar' : 'Perlu Perbaikan'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Analisis Bobot Kategori</h3>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest">
                 <TrendingUp size={16}/> Audit Real-Time WIT
              </div>
           </div>

           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={scoreData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <ReTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="val" radius={[12, 12, 12, 12]} barSize={60}>
                       {scoreData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {scoreData.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                   <p className="text-2xl font-black text-slate-800 tracking-tighter">{item.val}%</p>
                   <div className="h-1 w-8 bg-slate-200 mx-auto mt-3 rounded-full"></div>
                   <p className="text-[8px] font-black text-slate-400 mt-2 uppercase italic">Bobot: {item.weight}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform"><AlertCircle size={160} /></div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Radar Keseimbangan</h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreData.map(d => ({ subject: d.category, A: d.val }))}>
                       <PolarGrid stroke="#f1f5f9" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900 }} />
                       <Radar name="Skor" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-amber-50 p-10 rounded-[3.5rem] border border-amber-100 shadow-sm relative overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-6 flex items-center gap-2"><Info size={14} /> Ringkasan Analitik</h4>
              <div className="space-y-4">
                 <div className="bg-white/60 p-4 rounded-2xl border border-amber-200">
                    <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1">Poin Lemah</p>
                    <p className="text-sm font-bold text-slate-700 italic">"{scoreData.reduce((prev, curr) => prev.val < curr.val ? prev : curr).category}" adalah kategori terendah. Diperlukan konsistensi lebih lanjut.</p>
                 </div>
                 <div className="bg-white/60 p-4 rounded-2xl border border-emerald-200">
                    <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">Poin Kuat</p>
                    <p className="text-sm font-bold text-slate-700 italic">"{scoreData.reduce((prev, curr) => prev.val > curr.val ? prev : curr).category}" menunjukkan profesionalisme tinggi.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineView;
