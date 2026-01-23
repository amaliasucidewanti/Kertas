
import React, { useMemo, useState } from 'react';
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
  ClipboardCheck
} from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC<{ user: Pegawai }> = ({ user }) => {
  const navigate = useNavigate();
  const [closedNotifs, setClosedNotifs] = useState<string[]>([]);
  
  const isPegawai = user.role === Role.PEGAWAI;
  
  const unitFilter = user.role === Role.ADMIN_TIM ? user.unitKerja : undefined;
  const employees = dataService.getPegawai(unitFilter);
  const tasksWithStatus = dataService.getPenugasanWithStatus(unitFilter);
  
  const reminders = dataService.getReportReminders(user.nip);
  const userDiscipline = dataService.getKedisiplinan(user.nip);
  const userIdleDays = dataService.getIdleDays(user.nip);
  const isUserBertugas = dataService.isBertugas(user.nip);

  const globalTasksOnDuty = dataService.getPenugasanWithStatus().filter(t => t.calculatedStatus === 'Bertugas' || t.calculatedStatus === 'Akan Selesai');

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
  }, [employees, tasksWithStatus, user, isPegawai, reminders]);

  const formatDateShort = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${s.getDate()} – ${e.getDate()} ${months[e.getMonth()]} 2026`;
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto animate-fade-in">
      {/* PUSAT NOTIFIKASI DINAMIS */}
      {isPegawai && (
        <div className="space-y-4">
           {/* NOTIFIKASI MERAH: LAPORAN TERTUNDA */}
           {reminders.missing.map(t => !closedNotifs.includes(t.id) && (
             <div key={t.id} className="bg-rose-600 rounded-[2rem] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between border-2 border-rose-400 animate-pulse-slow">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                   <div className="p-4 bg-white/20 rounded-2xl animate-bounce"><AlertCircle size={28}/></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">Laporan Mendesak!</p>
                      <h4 className="font-black text-sm uppercase italic leading-tight">Penugasan "{t.namaKegiatan}" telah selesai. Unggah laporan segera untuk menghindari pengurangan nilai disiplin.</h4>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={() => navigate('/isi-laporan')} className="bg-white text-rose-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-lg active:scale-95">Lengkapi Sekarang</button>
                   <button onClick={() => setClosedNotifs([...closedNotifs, t.id])} className="p-2 opacity-50 hover:opacity-100 transition-opacity"><X size={20}/></button>
                </div>
             </div>
           ))}

           {/* NOTIFIKASI BIRU: SEDANG BERTUGAS */}
           {reminders.active.map(t => !closedNotifs.includes(t.id) && (
             <div key={t.id} className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between border-2 border-indigo-400">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                   <div className="p-4 bg-white/20 rounded-2xl"><Sparkles size={28}/></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Informasi Tugas Aktif</p>
                      <h4 className="font-black text-sm uppercase italic leading-tight">Anda saat ini sedang bertugas di {t.lokasi}. Jangan lupa kumpulkan dokumentasi foto kegiatan.</h4>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-black uppercase text-indigo-200">Masa Penugasan</p>
                      <p className="text-[10px] font-bold">{formatDateShort(t.tanggalMulai, t.tanggalSelesai)}</p>
                   </div>
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
               HALO, {user.nama.split(' ')[0]}!<br/>{isPegawai ? 'PANTU KERJA TUNTAS ANDA.' : 'MONITORING OPERASIONAL HARI INI.'}
            </h1>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
               Sistem SI-KERTAS memastikan setiap penugasan terdokumentasi secara akuntabel dan transparan untuk kemajuan BPMP Maluku Utara.
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: isPegawai ? 'Status Kerja' : 'Pegawai Bertugas', val: stats.card1, icon: isPegawai ? UserCheck : Users, color: 'emerald' },
          { label: isPegawai ? 'Durasi Siaga' : 'Pegawai Standby', val: stats.card2, icon: Clock, color: 'blue' },
          { label: isPegawai ? 'Tugas Berjalan' : 'Surat Tugas Aktif', val: stats.card3, icon: ClipboardCheck, color: 'indigo' },
          { label: isPegawai ? 'Indeks Disiplin' : 'Rata-rata Disiplin', val: stats.card4, icon: TrendingUp, color: 'rose' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
             <div className={`p-4 bg-${s.color}-50 text-${s.color}-600 rounded-2xl w-fit mb-4 group-hover:rotate-12 transition-transform shadow-sm`}><s.icon size={24}/></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
             <p className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">{s.val}</p>
          </div>
        ))}
      </div>

      {/* REKAP SURAT TUGAS TERBARU */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-3 uppercase italic">
              <Briefcase className="text-indigo-600" size={24} /> 
              Agenda Penugasan Pegawai
            </h3>
            <button onClick={() => navigate('/kalender')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">Lihat Kalender <ArrowRight size={14}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                <th className="px-10 py-6">Pegawai</th>
                <th className="px-10 py-6">Kegiatan</th>
                <th className="px-10 py-6">Periode</th>
                <th className="px-10 py-6 text-right">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {globalTasksOnDuty.slice(0, 5).map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-800 text-sm leading-none">{t.namaPegawai}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">NIP: {t.nip}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-bold text-slate-600 max-w-xs truncate">{t.namaKegiatan}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase">{formatDateShort(t.tanggalMulai, t.tanggalSelesai)}</p>
                  </td>
                  <td className="px-10 py-6 text-right font-bold text-[10px] text-slate-400 uppercase">
                    {t.lokasi}
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

export default Dashboard;
