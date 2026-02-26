
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
      id: 'akses',
      title: 'Cara Mengakses Sistem',
      icon: ShieldCheck,
      color: 'indigo',
      content: [
        {
          q: 'Bagaimana cara Login?',
          a: 'Gunakan NIP Anda sebagai Username. Password default untuk pengguna baru adalah "12345". Anda akan diminta mengganti password saat pertama kali masuk.'
        },
        {
          q: 'Lupa Password?',
          a: 'Jika Anda lupa password, silakan hubungi Admin Tim atau Super Admin untuk melakukan reset password ke pengaturan default.'
        },
        {
          q: 'Perangkat yang didukung?',
          a: 'SI-KERTAS dapat diakses melalui browser di Komputer (PC/Laptop) maupun Smartphone untuk kemudahan pengisian laporan di lapangan.'
        }
      ]
    },
    {
      id: 'alur',
      title: 'Alur Kerja SI-KERTAS',
      icon: RefreshCw,
      color: 'emerald',
      content: [
        {
          q: 'Bagaimana proses penugasan?',
          a: 'Admin akan menerbitkan Surat Tugas (ST). Anda dapat melihat daftar tugas aktif Anda di Dashboard atau melalui menu Kalender Tugas.'
        },
        {
          q: 'Apa yang harus dilakukan setelah tugas selesai?',
          a: 'Segera akses menu "Isi Laporan Tugas", pilih tugas yang bersangkutan, lampirkan foto dokumentasi, dan simpan laporan Anda.'
        },
        {
          q: 'Bagaimana sistem memantau kinerja?',
          a: 'Sistem secara otomatis mencatat ketepatan waktu pelaporan Anda. Laporan yang tuntas akan mengubah status tugas menjadi "Selesai" dan menjaga skor kedisiplinan Anda tetap optimal.'
        }
      ]
    },
    {
      id: 'kalender',
      title: 'Peta Kendali (Kalender Tugas)',
      icon: Calendar,
      color: 'blue',
      content: [
        {
          q: 'Apa fungsi Kalender Tugas?',
          a: 'Kalender berfungsi untuk memantau distribusi tugas seluruh pegawai. Anda bisa melihat siapa saja yang sedang bertugas di luar kantor dan siapa yang standby.'
        },
        {
          q: 'Arti indikator di Kalender?',
          a: 'Ikon Briefcase menunjukkan adanya penugasan pada tanggal tersebut. Klik tanggal untuk melihat rincian personel yang bertugas.'
        }
      ]
    },
    {
      id: 'disiplin',
      title: 'Skor Kedisiplinan',
      icon: Clock,
      color: 'rose',
      content: [
        {
          q: 'Bagaimana skor dihitung?',
          a: 'Skor Anda dipengaruhi oleh 4 indikator: Kehadiran (25%), Apel Pagi (15%), Log Harian (20%), dan Pelaporan Tugas (40%).'
        },
        {
          q: 'Mengapa skor saya turun?',
          a: 'Penyebab utama penurunan skor adalah keterlambatan pengunggahan laporan tugas. Sistem memotong poin secara otomatis untuk setiap hari keterlambatan.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto animate-fade-in">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><BookOpen size={240}/></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
            Panduan Pengguna v1.0
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Panduan Penggunaan SI-KERTAS</h1>
          <p className="text-indigo-300 font-bold text-sm mt-4 italic opacity-80">Instruksi lengkap bagi Pegawai BPMP untuk mengelola penugasan dan pelaporan secara mandiri.</p>
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
