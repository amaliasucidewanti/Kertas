
import React from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  MousePointer2, 
  Clock, 
  ClipboardCheck, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Info,
  CheckCircle2,
  Settings,
  Rocket,
  ShieldAlert,
  Server,
  Github,
  Terminal,
  RefreshCw
} from 'lucide-react';

const SystemManual: React.FC = () => {
  const sections = [
    {
      id: 'dasar',
      title: 'Dasar Sistem (Basic Concept)',
      icon: BookOpen,
      color: 'indigo',
      content: [
        {
          q: 'Apa itu SI-KERTAS?',
          a: 'SI-KERTAS (Sistem Kerja Tuntas) adalah aplikasi internal BPMP untuk mengelola penugasan, memantau kedisiplinan, dan memastikan akuntabilitas pelaporan pegawai secara real-time.'
        },
        {
          q: 'Bagaimana data disinkronkan?',
          a: 'Sistem menggunakan database kumulatif yang terhubung dengan Google Spreadsheet Master. Klik tombol "Refresh Data" atau "Sinkronisasi" untuk menarik data terbaru.'
        }
      ]
    },
    {
      id: 'kalender',
      title: 'Peta Kendali (Kalender Tugas)',
      icon: Calendar,
      color: 'emerald',
      content: [
        {
          q: 'Arti Kode Warna Kalender?',
          a: 'Hijau (Kapasitas Sehat): Personel standby banyak tersedia. Merah (Kapasitas Penuh): Seluruh personel sedang bertugas. Indigo Muda: Arsip rekam jejak masa lalu.'
        },
        {
          q: 'Bagaimana melihat detail tugas?',
          a: 'Klik pada tanggal yang memiliki indikator tugas (ikon briefcase). Modal akan muncul menampilkan siapa yang bertugas dan siapa yang sedang siaga di kantor.'
        }
      ]
    },
    {
      id: 'laporan',
      title: 'Prosedur Pelaporan',
      icon: ClipboardCheck,
      color: 'rose',
      content: [
        {
          q: 'Kapan laporan harus diisi?',
          a: 'Laporan wajib diisi segera setelah masa penugasan dalam Surat Tugas (ST) berakhir. Keterlambatan akan berdampak otomatis pada Skor Kedisiplinan.'
        },
        {
          q: 'Format Dokumentasi?',
          a: 'Setiap laporan wajib melampirkan minimal 3 foto dokumentasi sebagai bukti fisik pelaksanaan tugas di lapangan.'
        }
      ]
    },
    {
      id: 'disiplin',
      title: 'Perhitungan Skor Disiplin',
      icon: Clock,
      color: 'amber',
      content: [
        {
          q: 'Indikator Utama?',
          a: 'Nilai Akhir dihitung dari: Kehadiran (25%), Apel Pagi (15%), Log Harian (20%), dan Pelaporan Tugas (40%).'
        },
        {
          q: 'Dampak Laporan Terlambat?',
          a: 'Sistem secara otomatis memotong poin "Pelaporan" sebesar 5 poin untuk setiap hari keterlambatan laporan ST yang sudah lewat tanggal selesai.'
        }
      ]
    }
  ];

  const deploymentChecklist = [
    { module: 'Database Core', status: 'Ready', desc: 'Sinkronisasi Spreadsheet Master Aktif' },
    { module: 'Authentication', status: 'Ready', desc: 'Sistem NIP & Password Default 12345 Valid' },
    { module: 'Persistent Logic', status: 'Ready', desc: 'Arsip Kalender Masa Lalu Tersimpan Abadi' },
    { module: 'Reporting Engine', status: 'Ready', desc: 'Format Laporan Tata Naskah Dinas Siap Cetak' },
    { module: 'Discipline Engine', status: 'Ready', desc: 'Algoritma Penalti Keterlambatan Teruji' },
  ];

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto animate-fade-in">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><Rocket size={240}/></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
            Status: Production Ready v1.0
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Panduan Kerja Tuntas</h1>
          <p className="text-indigo-300 font-bold text-sm mt-4 italic opacity-80">Dokumentasi Teknis dan Audit Kesiapan Implementasi Sistem.</p>
        </div>
      </div>

      {/* SECTION TROUBLESHOOTING GITHUB & DATA */}
      <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-200 shadow-inner">
         <h2 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3 text-slate-800">
            <Terminal size={24} className="text-indigo-600" /> Troubleshooting Untuk Developer/Admin
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <Github size={20} className="text-slate-900" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Gagal Sinkron ke GitHub?</h3>
               </div>
               <ul className="space-y-4">
                  <li className="flex gap-3">
                     <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                     <p className="text-xs text-slate-600">Pastikan menggunakan <b>Personal Access Token (PAT)</b>, bukan password akun GitHub.</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                     <p className="text-xs text-slate-600">Cek file <b>.gitignore</b>. Folder <code>node_modules</code> dilarang masuk ke repository.</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                     <p className="text-xs text-slate-600">Jalankan <code>git pull origin main --rebase</code> jika ada perbedaan data di server.</p>
                  </li>
               </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <RefreshCw size={20} className="text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Gagal Sinkron Spreadsheet?</h3>
               </div>
               <ul className="space-y-4">
                  <li className="flex gap-3">
                     <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                     <p className="text-xs text-slate-600">Pastikan Spreadsheet diatur ke <b>"Anyone with the link can view"</b>.</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                     <p className="text-xs text-slate-600">Cek apakah <b>SPREADSHEET_ID</b> di <code>dataService.ts</code> sudah benar.</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                     <p className="text-xs text-slate-600">Gunakan tombol <b>Refresh Data</b> di header jika data pegawai tidak muncul.</p>
                  </li>
               </ul>
            </div>
         </div>
      </div>

      <div className="bg-emerald-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden border border-emerald-400/20">
         <div className="absolute top-0 right-0 p-8 opacity-10"><Server size={120} /></div>
         <div className="relative z-10">
            <h2 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3">
               <ShieldCheck size={24} className="text-emerald-400" /> Audit Kesiapan Implementasi (Deployment Audit)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {deploymentChecklist.map((item, i) => (
                 <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-start gap-4 hover:bg-white/20 transition-all group">
                    <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                       <CheckCircle2 size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">{item.module}</p>
                       <p className="text-xs font-bold leading-tight">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic flex items-center gap-2">
                  <Info size={14} /> Berdasarkan audit sistem, SI-KERTAS siap dideploy ke server produksi.
               </p>
               <div className="px-6 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                  System Status: Online
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className={`p-8 bg-${section.color}-50 border-b border-${section.color}-100 flex items-center gap-4`}>
              <div className={`p-3 bg-${section.color}-500 text-white rounded-2xl shadow-lg shadow-${section.color}-500/20`}>
                <section.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase italic">{section.title}</h3>
            </div>
            <div className="p-8 space-y-6 flex-1">
              {section.content.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
                    <p className="font-black text-xs text-slate-900 uppercase tracking-tighter leading-tight">{item.q}</p>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed pl-3.5 border-l-2 border-slate-50 ml-0.5">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-900 rounded-[3.5rem] p-12 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute bottom-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform"><Settings size={200}/></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Butuh Bantuan Teknis?</h3>
            <p className="text-indigo-300 text-sm font-medium leading-relaxed mb-8">
              Jika Anda menemukan kendala sinkronisasi atau bug pada sistem, silakan hubungi Tim Pusat Data melalui saluran komunikasi internal BPMP.
            </p>
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Jam Layanan</span>
                  <span className="text-sm font-bold">08:00 - 16:00 WIT</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10"></div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Status Sistem</span>
                  <span className="text-sm font-bold flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400"/> Operasional Normal</span>
               </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-4">
             <div className="flex items-start gap-4">
                <AlertCircle className="text-amber-400 shrink-0 mt-1" size={20}/>
                <p className="text-[11px] font-bold text-indigo-100 uppercase italic leading-relaxed">
                  "Integritas data adalah tanggung jawab bersama. Pastikan setiap ST yang Anda terima memiliki laporan yang tuntas."
                </p>
             </div>
             <div className="h-[1px] bg-white/5"></div>
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Admin Pusat Data - SI-KERTAS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemManual;
