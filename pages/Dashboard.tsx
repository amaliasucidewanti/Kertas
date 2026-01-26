
import React, { useMemo, useState } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { 
  TrendingUp, 
  X,
  Briefcase,
  ArrowRight,
  MapPin,
  AlertCircle,
  Activity,
  FileText,
  PieChart as PieIcon,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC<{ user: Pegawai }> = ({ user }) => {
  const navigate = useNavigate();
  const [closedNotifs, setClosedNotifs] = useState<string[]>([]);
  // Mengatur default filter ke bulan berjalan
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  
  const currentNip = dataService.standardizeNip(user.nip);
  const unitFilter = user.role === Role.ADMIN_TIM ? user.unitKerja : undefined;
  const employees = dataService.getPegawai(unitFilter);
  const allTasksWithStatus = dataService.getPenugasanWithStatus(unitFilter);
  
  // Filter tugas berdasarkan bulan terpilih untuk Analisis Kinerja
  const filteredTasks = useMemo(() => {
    return allTasksWithStatus.filter(t => t.tanggalMulai.includes(`-${selectedMonth}-`));
  }, [allTasksWithStatus, selectedMonth]);

  const reminders = useMemo(() => dataService.getReportReminders(currentNip), [currentNip, allTasksWithStatus]);
  const userDiscipline = dataService.getKedisiplinan(currentNip);
  const userIdleDays = dataService.getIdleDays(currentNip);
  const isUserBertugas = dataService.isBertugas(currentNip);

  const activePersonnel = useMemo(() => {
    const today = dataService.getTodayWIT();
    const activeTasks = allTasksWithStatus.filter(t => today >= t.tanggalMulai && today <= t.tanggalSelesai);
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
  }, [allTasksWithStatus, employees]);

  // ST yang sedang berjalan atau akan segera berakhir (Agenda Terkini)
  const recentAgendas = allTasksWithStatus.filter(t => t.calculatedStatus === 'Bertugas' || t.calculatedStatus === 'Akan Selesai').slice(0, 5);

  const reportStats = useMemo(() => {
    const reported = filteredTasks.filter(t => t.laporanStatus === 'Sudah Upload').length;
    const unreported = filteredTasks.length - reported;
    return [
      { name: 'Sudah Dilaporkan', value: reported, color: '#10b981' }, 
      { name: 'Belum Dilaporkan', value: unreported, color: '#f43f5e' }  
    ];
  }, [filteredTasks]);

  const stats = useMemo(() => {
    const isPegawai = user.role === Role.PEGAWAI;
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
    const stAktifCount = allTasksWithStatus.filter(t => t.calculatedStatus !== 'Selesai').length;
    const averageDiscipline = dataService.getAverageDiscipline(unitFilter);

    return {
      card1: active,
      card2: idle,
      card3: stAktifCount,
      card4: `${averageDiscipline}%`,
    };
  }, [employees, allTasksWithStatus, user, reminders, userIdleDays, isUserBertugas, userDiscipline, unitFilter]);

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
      {user.role === Role.PEGAWAI && (
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
               HALO, {user.nama.split(' ')[0]}!<br/>{user.role === Role.PEGAWAI ? 'PROGRES KERJA ANDA.' : 'MONITORING OPERASIONAL.'}
            </h1>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
               Database sinkron secara <span className="text-indigo-400 font-black">KUMULATIF</span>. Setiap penerbitan ST baru akan otomatis teragregasi ke dalam statistik profil pegawai.
            </p>
         </div>
         <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[220px] shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">
               Skor Disiplin Rata-Rata
            </p>
            <p className="text-5xl font-black tracking-tighter">{stats.card4}</p>
            <div className="mt-4 flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
               <TrendingUp size={12}/> Trend Positif
            </div>
         </div>
      </div>

      {/* FILTER BAR DASHBOARD */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 no-print">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-indigo-600" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Periode Analisis Kinerja:</h3>
        </div>
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-slate-50 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 focus:border-indigo-500 outline-none"
        >
          {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
            <option key={m} value={m}>{new Date(2026, parseInt(m)-1).toLocaleString('id-ID', {month: 'long'})}</option>
          ))}
        </select>
        <div className="ml-auto text-[9px] font-bold text-slate-400 italic">Statistik akan mencakup seluruh riwayat penugasan yang terekam.</div>
      </div>

      {/* NEW SECTION: MONITORING PELAKSANAAN TUGAS (ST-BASED) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monitoring Table - Menampilkan Baris per ST */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> Tabel Pelaksanaan Tugas (Kumulatif)
            </h3>
            <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">Total {allTasksWithStatus.length} ST</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                  <th className="px-8 py-4">Nomor & Pelaksana</th>
                  <th className="px-8 py-4 text-center">Tipe & Biaya</th>
                  <th className="px-8 py-4 text-right">Status Laporan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {allTasksWithStatus.length > 0 ? allTasksWithStatus.slice(0, 10).map((t) => (
                    <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-[9px] font-black text-indigo-400 leading-none mb-1 uppercase tracking-widest">{t.nomorSurat}</p>
                        <p className="font-black text-slate-800">{t.namaPegawai}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter italic truncate max-w-[250px]">{t.namaKegiatan}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                             t.jenisPenugasan === 'Luring' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                           }`}>
                             {t.jenisPenugasan}
                           </span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             {t.sumberBiaya}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${t.laporanStatus === 'Sudah Upload' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {t.laporanStatus === 'Sudah Upload' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          {t.laporanStatus === 'Sudah Upload' ? 'Sudah Dilaporkan' : 'Belum Dilaporkan'}
                        </span>
                      </td>
                    </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-32 text-center opacity-30">
                      <div className="flex flex-col items-center gap-4">
                        <FileText size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Database penugasan masih kosong</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t text-center">
             <button onClick={() => navigate('/laporan')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Kelola Seluruh Laporan Tugas</button>
          </div>
        </div>

        {/* Report Chart (Pie Chart) */}
        <div className="lg:col-span-4 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-2">
              <PieIcon size={18} className="text-indigo-600" /> Rasio Akuntabilitas
            </h3>
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              {reportStats.map((stat, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.name}</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">
                    {filteredTasks.length > 0 ? Math.round((stat.value / filteredTasks.length) * 100) : 0}%
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase italic tracking-tighter">{stat.value} Record</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Personnel Strip */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-2">
                <Activity size={18} className="text-rose-500" /> Personel Bertugas (WIT)
             </h3>
             <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{activePersonnel.length} Orang</span>
          </div>
          <div className="flex flex-wrap p-6 gap-4">
             {activePersonnel.length > 0 ? activePersonnel.map((p, i) => (
               <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg">
                    {p.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-800 leading-none">{p.nama}</p>
                    <div className="flex items-center gap-2 mt-1 text-[8px] font-bold text-slate-400 uppercase italic">
                      <MapPin size={10} /> {p.lastLocation}
                    </div>
                  </div>
               </div>
             )) : (
               <div className="w-full py-10 text-center text-[10px] font-black text-slate-300 uppercase italic tracking-[0.2em]">Sistem mencatat seluruh personel sedang standby</div>
             )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
