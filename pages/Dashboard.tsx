
import React, { useMemo, useState, useEffect } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { 
  Users, 
  TrendingUp, 
  Clock,
  X,
  FileText,
  Briefcase,
  ArrowRight,
  UserCheck,
  MapPin,
  Sparkles,
  AlertCircle,
  ClipboardCheck,
  Activity
} from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC<{ user: Pegawai }> = ({ user }) => {
  const navigate = useNavigate();
  const [closedNotifs, setClosedNotifs] = useState<string[]>([]);
  
  const isPegawai = user.role === Role.PEGAWAI;
  const currentNip = dataService.standardizeNip(user.nip);
  
  const unitFilter = user.role === Role.ADMIN_TIM ? user.unitKerja : undefined;
  const employees = dataService.getPegawai(unitFilter);
  const tasksWithStatus = dataService.getPenugasanWithStatus(unitFilter);
  
  // Deteksi pengingat laporan berdasarkan NIP login
  const reminders = useMemo(() => dataService.getReportReminders(currentNip), [currentNip, tasksWithStatus]);
  
  const userDiscipline = dataService.getKedisiplinan(currentNip);
  const userIdleDays = dataService.getIdleDays(currentNip);
  const isUserBertugas = dataService.isBertugas(currentNip);

  // List Pegawai yang sedang MEMEGANG Surat Tugas (Aktif)
  const activePersonnel = useMemo(() => {
    const today = dataService.getTodayWIT();
    const activeTasks = tasksWithStatus.filter(t => today >= t.tanggalMulai && today <= t.tanggalSelesai);
    
    // Group by NIP untuk mendapatkan list orang unik
    const uniqueNips = Array.from(new Set(activeTasks.map(t => t.nip)));
    return uniqueNips.map(nip => {
      const personTasks = activeTasks.filter(t => t.nip === nip);
      const emp = employees.find(e => dataService.standardizeNip(e.nip) === nip);
      return {
        nama: emp?.nama || personTasks[0].namaPegawai,
        nip: nip,
        unit: emp?.unitKerja || 'Unit Luar',
        taskCount: personTasks.length,
        lastLocation: personTasks[personTasks.length - 1].lokasi
      };
    });
  }, [tasksWithStatus, employees]);

  const globalTasksOnDuty = tasksWithStatus.filter(t => t.calculatedStatus === 'Bertugas' || t.calculatedStatus === 'Akan Selesai');

  const stats = useMemo(() => {
    if (isPegawai) {
      const activeCount = reminders.active.length;
      return {
        card1: isUserBertugas ? 'Bertugas' : 'Standby',
        card2: `${userIdleDays} Hari`,
        card3: activeCount,
        card4: `${userDiscipline?.nilaiAkhir || 0}%`,
      };
    }

    const active = employees.filter(e => dataService.isBertugas(e.nip)).length;
    const idle = employees.length - active;
    const stAktifCount = tasksWithStatus.filter(t => t.calculatedStatus !== 'Selesai').length;
    const averageDiscipline = dataService.getAverageDiscipline(unitFilter);

    return {
      card1: active,
      card2: idle,
      card3: stAktifCount,
      card4: `${averageDiscipline}%`,
    };
  }, [employees, tasksWithStatus, user, isPegawai, reminders, userIdleDays, isUserBertugas, userDiscipline]);

  const formatDateShort = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${s.getDate()} – ${e.getDate()} ${months[e.getMonth()]} 2026`;
  };

  const goToReport = (taskId: string) => {
    navigate('/isi-laporan', { state: { autoOpenTaskId: taskId } });
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto animate-fade-in">
      {/* PUSAT NOTIFIKASI */}
      {isPegawai && (
        <div className="space-y-4">
           {reminders.missing.map(t => !closedNotifs.includes(t.id) && (
             <div key={t.id} className="bg-rose-600 rounded-[2rem] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between border-2 border-rose-400 animate-pulse-slow">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                   <div className="p-4 bg-white/20 rounded-2xl animate-bounce"><AlertCircle size={28}/></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">Kewajiban Laporan!</p>
                      <h4 className="font-black text-sm uppercase italic leading-tight">Penugasan "{t.namaKegiatan}" telah selesai. Segera lapor.</h4>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={() => goToReport(t.id)} className="bg-white text-rose-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-lg active:scale-95">Lapor Sekarang</button>
                   <button onClick={() => setClosedNotifs([...closedNotifs, t.id])} className="p-2 opacity-50 hover:opacity-100 transition-opacity"><X size={20}/></button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative border border-white/5">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="relative z-10 flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tighter leading-tight mb-4 italic uppercase">
               HALO, {user.nama.split(' ')[0]}!<br/>{isPegawai ? 'MONITOR KERJA TUNTAS ANDA.' : 'REKAPITULASI HARI INI.'}
            </h1>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
               Sistem menyinkronkan data <span className="text-indigo-400 font-black">SURAT_TUGAS</span> secara real-time untuk memastikan akuntabilitas BPMP.
            </p>
         </div>
         <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[220px] shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">
               Skor Disiplin Real-Time
            </p>
            <p className="text-5xl font-black tracking-tighter">{stats.card4}</p>
            <div className="mt-4 flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
               <TrendingUp size={12}/> Akumulasi Kinerja
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Widget: Siapa saja yang memegang ST hari ini */}
         <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="text-sm font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-2">
                  <Activity size={18} className="text-rose-500" /> Pelaksana Tugas Aktif
               </h3>
               <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{activePersonnel.length} Orang</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3 custom-scrollbar">
               {activePersonnel.length > 0 ? activePersonnel.map((p, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                    <div>
                       <p className="text-xs font-black text-slate-800 leading-none group-hover:text-indigo-600">{p.nama}</p>
                       <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{p.unit} • {p.taskCount} ST</p>
                    </div>
                    <div className="text-right">
                       <MapPin size={14} className="text-slate-300 ml-auto mb-1" />
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{p.lastLocation}</p>
                    </div>
                 </div>
               )) : (
                 <div className="py-20 text-center opacity-30 italic text-[10px] font-bold uppercase tracking-widest">Tidak ada personil bertugas</div>
               )}
            </div>
            <div className="p-4 bg-slate-50 border-t text-center">
               <button onClick={() => navigate('/kalender')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Lihat Kalender Lengkap</button>
            </div>
         </div>

         {/* Rekap ST Terbaru */}
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center">
               <h3 className="text-sm font-black text-slate-800 tracking-tighter flex items-center gap-3 uppercase italic">
                  <Briefcase className="text-indigo-600" size={18} /> 
                  Agenda Surat Tugas Terkini
               </h3>
               <button onClick={() => navigate('/laporan')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">Semua ST <ArrowRight size={14}/></button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                        <th className="px-8 py-4">Nomor & Kegiatan</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Periode</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {globalTasksOnDuty.slice(0, 6).map((t) => (
                        <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-5">
                              <p className="text-[9px] font-black text-indigo-400 leading-none mb-1 uppercase tracking-widest">{t.nomorSurat}</p>
                              <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{t.namaKegiatan}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-${t.calculatedColor}-50 text-${t.calculatedColor}-600 border border-${t.calculatedColor}-100`}>
                                 {t.calculatedStatus}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-right font-black text-[9px] text-slate-400 uppercase">
                              {formatDateShort(t.tanggalMulai, t.tanggalSelesai)}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
