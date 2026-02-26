
import React, { useState } from 'react';
import { dataService } from '../services/dataService';
// Added missing 'Shield' import
import { Pegawai } from '../types';
import { ChevronLeft, ChevronRight, User, Users, MapPin, Briefcase, X, Info, CheckCircle2, AlertCircle, History, Shield } from 'lucide-react';

const AssignmentCalendar: React.FC<{ user: Pegawai }> = ({ user }) => {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const tasks = dataService.getPenugasan().filter(t => {
    if (t.namaPegawai.toLowerCase().includes('santoso')) {
      const viewerName = user.nama.toLowerCase();
      return viewerName.includes('santoso') || viewerName.includes('adin');
    }
    return true;
  });
  const allEmployees = dataService.getPegawai().filter(e => {
    if (e.nama.toLowerCase().includes('santoso')) {
      const viewerName = user.nama.toLowerCase();
      return viewerName.includes('santoso') || viewerName.includes('adin');
    }
    return true;
  });

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jayapura' });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getFilteredDailyStatus = (dateStr: string) => {
    const status = dataService.getDailyStatus(dateStr);
    return {
      bertugas: status.bertugas.filter(t => {
        if (t.namaPegawai.toLowerCase().includes('santoso')) {
          const v = user.nama.toLowerCase();
          return v.includes('santoso') || v.includes('adin');
        }
        return true;
      }),
      standby: status.standby.filter(p => {
        if (p.nama.toLowerCase().includes('santoso')) {
          const v = user.nama.toLowerCase();
          return v.includes('santoso') || v.includes('adin');
        }
        return true;
      })
    };
  };

  const getCellData = (day: number | null) => {
    if (!day) return null;
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;
    const dailyStatus = getFilteredDailyStatus(dateStr);
    return { dateStr, isPast, isToday, ...dailyStatus };
  };

  const selectedData = selectedDate ? getFilteredDailyStatus(selectedDate) : null;
  const isSelectedDatePast = selectedDate ? selectedDate < todayStr : false;

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-7xl mx-auto">
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Users size={160}/></div>
         <div className="relative z-10">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Peta Kendali Operasional</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl font-medium uppercase tracking-widest italic opacity-70">Monitor & Rekam Jejak Penugasan TA {currentDate.getFullYear()}</p>
         </div>
         <div className="flex gap-4 no-print relative z-10">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"><ChevronLeft size={24}/></button>
            <div className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg min-w-[200px] text-center shadow-xl">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"><ChevronRight size={24}/></button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Kapasitas Sehat', color: 'bg-emerald-500', icon: CheckCircle2, desc: 'Personil standby tersedia.' },
           { label: 'Kapasitas Penuh', color: 'bg-rose-500', icon: AlertCircle, desc: 'Seluruh personil bertugas.' },
           { label: 'Penugasan Aktif', color: 'bg-indigo-500', icon: Briefcase, desc: 'Tugas sedang berjalan.' },
           { label: 'Audit Historis', color: 'bg-indigo-400', icon: History, desc: 'Data tersimpan selamanya.' },
         ].map((item, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`p-4 ${item.color} text-white rounded-2xl shadow-lg`}><item.icon size={20}/></div>
              <div>
                 <p className="font-black text-slate-800 text-[10px] leading-none uppercase tracking-tight">{item.label}</p>
                 <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase italic tracking-tighter">{item.desc}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b">
          {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => (
            <div key={d} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const cellData = getCellData(day);
            if (!day) return <div key={idx} className="min-h-[160px] bg-slate-50/20 border-r border-b last:border-r-0"></div>;
            
            const isFull = cellData?.standby.length === 0;
            const hasTasks = cellData?.bertugas && cellData.bertugas.length > 0;
            const isPast = cellData?.isPast;
            const isToday = cellData?.isToday;
            
            let cellBg = 'bg-white';
            if (isToday) {
               cellBg = 'bg-indigo-50/30 ring-2 ring-inset ring-indigo-500/20';
            } else if (hasTasks) {
               if (isPast) {
                  // Warna lebih indigo untuk masa lalu agar "terlihat" (tidak pudar)
                  cellBg = 'bg-indigo-50/40 border-indigo-100'; 
               } else {
                  cellBg = isFull ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100';
               }
            } else if (isPast) {
               cellBg = 'bg-slate-50/40';
            }

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDate(cellData?.dateStr || null)}
                className={`min-h-[160px] p-4 border-r border-b last:border-r-0 hover:z-10 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden ${cellBg} border-slate-50`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className={`text-xl font-black ${isToday ? 'text-indigo-600' : isPast ? 'text-slate-400' : 'text-slate-300'} group-hover:text-slate-900 transition-colors`}>{day}</span>
                    {isToday && <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Hari Ini</span>}
                    {isPast && !isToday && <span className="text-[8px] font-black text-slate-500/50 uppercase tracking-widest mt-0.5">Arsip</span>}
                  </div>
                  {hasTasks && (
                    <div className={`p-1.5 rounded-lg ${isPast ? 'bg-indigo-400' : isFull ? 'bg-rose-500' : 'bg-emerald-500'} text-white shadow-lg ${!isPast && 'animate-pulse'}`}>
                       {isPast ? <History size={12}/> : <Users size={12}/>}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {cellData?.bertugas && cellData.bertugas.slice(0, 2).map((t, tid) => (
                    <div key={tid} className={`text-[9px] bg-white/80 backdrop-blur-sm border border-slate-100 p-2 rounded-xl font-black text-slate-700 truncate shadow-sm flex items-center gap-1.5 uppercase tracking-tighter ${isPast && 'opacity-80'}`}>
                       <User size={10} className={isPast ? 'text-indigo-400' : 'text-indigo-600'}/> {t.namaPegawai}
                    </div>
                  ))}
                  {cellData?.bertugas && cellData.bertugas.length > 2 && (
                    <p className="text-[8px] font-black text-indigo-400/50 text-center uppercase tracking-widest mt-2">+{cellData.bertugas.length - 2} Dokumen</p>
                  )}
                </div>

                {hasTasks && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[8px] font-black uppercase text-indigo-500">{isPast ? 'Lihat Arsip' : 'Detail Tugas'}</span>
                     <Info size={12} className="text-indigo-400"/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in no-print">
           <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className={`p-10 ${isSelectedDatePast ? 'bg-indigo-900' : 'bg-slate-900'} text-white flex justify-between items-center transition-colors`}>
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       {isSelectedDatePast && <Shield size={20} className="text-amber-400" />}
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{isSelectedDatePast ? 'Audit Rekam Jejak Kinerja' : 'Log Kendali Penugasan'}</p>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic">{new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</h3>
                 </div>
                 <button onClick={() => setSelectedDate(null)} className="p-4 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"><X size={32}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                       <h4 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                          <Briefcase className={isSelectedDatePast ? 'text-indigo-500' : 'text-rose-500'} size={24}/> {isSelectedDatePast ? 'Riwayat Penugasan' : 'Sedang Bertugas'} ({selectedData?.bertugas.length})
                       </h4>
                    </div>
                    <div className="space-y-4">
                       {selectedData?.bertugas && selectedData.bertugas.length > 0 ? selectedData.bertugas.map((t, idx) => (
                         <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><MapPin size={48}/></div>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">{t.nip}</p>
                            <p className="text-lg font-black text-slate-900 mb-4">{t.namaPegawai}</p>
                            <div className="space-y-2">
                               <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase italic">
                                  <Briefcase size={14} className="text-slate-400"/> {t.namaKegiatan}
                               </div>
                               <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase italic">
                                  <MapPin size={14} className="text-slate-400"/> {t.lokasi}
                               </div>
                               {t.laporanStatus === 'Sudah Upload' && (
                                  <div className="flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase italic mt-2">
                                     <CheckCircle2 size={14}/> Laporan Tuntas & Terarsip
                                  </div>
                               )}
                            </div>
                         </div>
                       )) : (
                         <div className="py-20 text-center text-slate-300 font-black italic uppercase tracking-widest">Tidak ada record penugasan di tanggal ini.</div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                       <h4 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                          <CheckCircle2 className="text-emerald-500" size={24}/> {isSelectedDatePast ? 'Personel Standby (Histori)' : 'Pegawai Standby'} ({selectedData?.standby.length})
                       </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                       {selectedData?.standby && selectedData.standby.map((p, idx) => (
                         <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-emerald-50 transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all font-black text-xs">{idx+1}</div>
                               <div>
                                  <p className="font-black text-slate-800 leading-none group-hover:text-emerald-700">{p.nama}</p>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{p.unitKerja} • {p.jabatan}</p>
                               </div>
                            </div>
                            <span className="text-[8px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">{isSelectedDatePast ? 'Bebas Tugas' : 'Siaga'}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Aplikasi Si-Kertas menjamin integritas data historis untuk audit kinerja.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCalendar;
