
import React, { useState, useMemo, useRef } from 'react';
import { Pegawai, Penugasan, Role } from '../types';
import { dataService } from '../services/dataService';
import { 
  FileText, 
  Camera, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  X, 
  Image as ImageIcon,
  Save,
  AlertTriangle,
  Info,
  Trash2,
  Search,
  ArrowRight,
  UploadCloud,
  Eye,
  User,
  Download,
  // Added missing RefreshCw icon
  RefreshCw
} from 'lucide-react';

interface LaporanTugasProps {
  user: Pegawai;
}

const LaporanTugas: React.FC<LaporanTugasProps> = ({ user }) => {
  const [activeTask, setActiveTask] = useState<Penugasan | null>(null);
  const [step, setStep] = useState<'list' | 'form' | 'preview'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formLaporan, setFormLaporan] = useState({
    pendahuluan: '',
    pelaksanaan: '',
    hasilKerja: '',
    penutup: 'Demikian laporan ini dibuat untuk dipergunakan sebagaimana mestinya.',
    fotos: [] as string[],
  });

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";

  const filteredTasks = useMemo(() => {
    const all = dataService.getPenugasanWithStatus();
    return all.filter(t => {
      const searchMatches = 
        t.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.nomorSurat.includes(searchTerm) ||
        t.namaPegawai.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatches;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [searchTerm]);

  const handleAction = (task: Penugasan) => {
    const isOwner = task.nip.replace(/\D/g, '') === user.nip.replace(/\D/g, '');
    const isUploaded = task.laporanStatus === 'Sudah Upload';

    setActiveTask(task);
    
    // Sinkronisasi data awal
    setFormLaporan({
      pendahuluan: 'Sesuai dengan Surat Tugas terlampir, kegiatan dilaksanakan dalam rangka mendukung peningkatan mutu pendidikan melalui pendampingan intensif.',
      pelaksanaan: task.uraianTugas || '',
      hasilKerja: task.hasilKerja || '',
      penutup: 'Demikian laporan ini dibuat untuk dipergunakan sebagaimana mestinya.',
      fotos: task.dokumentasiFotos || [],
    });

    if (isOwner) {
      setStep('form');
    } else if (isUploaded) {
      setStep('preview');
    } else {
      alert('Informasi: Laporan ini belum diisi oleh pelaksana tugas.');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (formLaporan.fotos.length >= 6) {
        alert('Maksimal 6 foto diperbolehkan.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormLaporan(prev => ({
          ...prev,
          fotos: [...prev.fotos, base64String]
        }));
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Added removePhoto function to handle photo deletion
  const removePhoto = (index: number) => {
    setFormLaporan(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const handleSaveLaporan = () => {
    if (formLaporan.pelaksanaan.length < 50) {
      alert('Narasi Uraian Pelaksanaan minimal 50 karakter agar laporan akuntabel.');
      return;
    }
    if (formLaporan.fotos.length < 3) {
      alert('Wajib mengunggah minimal 3 foto sebagai bukti fisik pelaksanaan tugas.');
      return;
    }

    setIsSaving(true);
    // Simulasi Delay untuk Efek Interaktif
    setTimeout(() => {
      dataService.saveLaporan(activeTask!.id, {
        uraianTugas: formLaporan.pelaksanaan,
        hasilKerja: formLaporan.hasilKerja,
        dokumentasiFotos: formLaporan.fotos
      });
      setIsSaving(false);
      setStep('preview');
    }, 1000);
  };

  const confirmFinish = () => {
    alert('Sukses! Laporan berhasil diselesaikan dan diarsipkan.');
    setStep('list');
    setActiveTask(null);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('Hapus laporan? Status akan kembali ke "Belum Upload".')) {
      dataService.deleteLaporan(taskId);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />

      {/* 1. LIST VIEW */}
      {step === 'list' && (
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><FileText size={240}/></div>
             <div className="relative z-10">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Pusat Laporan Kerja Tuntas</h1>
                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mt-4 italic opacity-80">Sinkronisasi Real-time dengan Database Surat Tugas TA 2026</p>
             </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
             <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
                <div className="relative w-full md:w-96">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input 
                    type="text" placeholder="Cari Nama Pegawai atau No. ST..." 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Info size={14} className="text-indigo-500"/>
                   User: {user.nama} ({user.nip})
                </div>
             </div>

             <div className="space-y-4">
                {filteredTasks.length > 0 ? filteredTasks.map(task => {
                  const isOwner = task.nip.replace(/\D/g, '') === user.nip.replace(/\D/g, '');
                  const isUploaded = task.laporanStatus === 'Sudah Upload';

                  return (
                    <div key={task.id} className={`p-8 rounded-[2.5rem] border transition-all bg-white group hover:shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 ${isOwner ? 'border-indigo-200 ring-2 ring-indigo-50/50' : 'border-slate-100'}`}>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isUploaded ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {isUploaded ? 'Laporan Tuntas' : 'Belum Lapor'}
                             </span>
                             {isOwner && <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Tugas Saya</span>}
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.nomorSurat}</p>
                          </div>
                          <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase italic">{task.namaKegiatan}</h3>
                          <div className="flex gap-4 mt-4 text-[10px] font-bold text-slate-400 uppercase italic">
                             <span className="flex items-center gap-2"><User size={12} className="text-indigo-400"/> {task.namaPegawai}</span>
                             <span className="flex items-center gap-2"><ImageIcon size={12} className="text-indigo-400"/> {isUploaded ? `${task.dokumentasiFotos?.length || 0} Foto` : 'Belum Ada Dokumentasi'}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          {isOwner && isUploaded && (
                             <button onClick={() => handleDelete(task.id)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                                <Trash2 size={20}/>
                             </button>
                          )}
                          <button 
                            onClick={() => handleAction(task)}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all ${
                              isOwner 
                                ? 'bg-slate-900 text-white hover:bg-black' 
                                : isUploaded 
                                  ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white' 
                                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                            disabled={!isOwner && !isUploaded}
                          >
                             {isOwner 
                               ? (isUploaded ? 'Edit Laporan Saya' : 'Lengkapi Laporan') 
                               : (isUploaded ? 'Lihat Laporan Rekan' : 'Belum Tersedia')}
                             {isOwner ? <ArrowRight size={16}/> : isUploaded ? <Eye size={16}/> : null}
                          </button>
                       </div>
                    </div>
                  );
                }) : (
                  <div className="py-20 text-center text-slate-300 font-black italic uppercase tracking-widest">Data Tidak Ditemukan.</div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* 2. FORM VIEW (Hanya Pemilik) */}
      {step === 'form' && activeTask && (
        <div className="space-y-8 animate-slide-right">
           <div className="flex items-center justify-between">
              <button onClick={() => setStep('list')} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                 <ChevronLeft size={20}/> Batal & Kembali
              </button>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Pengisian Output Laporan</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="space-y-8">
                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 mb-6">
                       <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-2">Data Penugasan Dasar</h4>
                       <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"Berdasarkan ST Nomor {activeTask.nomorSurat}, kegiatan ini dilaksanakan di {activeTask.lokasi} dari tanggal {activeTask.tanggalMulai}."</p>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">B. Uraian Pelaksanaan Kegiatan * (Min. 50 Karakter)</label>
                       <textarea required value={formLaporan.pelaksanaan} onChange={e => setFormLaporan({...formLaporan, pelaksanaan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl text-sm font-medium h-48 focus:border-indigo-500 outline-none shadow-inner" placeholder="Jelaskan detail apa yang Anda lakukan, kendala, dan prosesnya..."></textarea>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">C. Hasil yang Dicapai * (Min. 50 Karakter)</label>
                       <textarea required value={formLaporan.hasilKerja} onChange={e => setFormLaporan({...formLaporan, hasilKerja: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl text-sm font-medium h-48 focus:border-indigo-500 outline-none shadow-inner" placeholder="Sebutkan output konkrit, data, atau dokumen yang dihasilkan..."></textarea>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={handleSaveLaporan} 
                      disabled={isSaving}
                      className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                       {isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>}
                       {isSaving ? 'Menyinkronkan...' : 'Simpan & Lihat Pratinjau'}
                    </button>
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Camera size={100}/></div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8">Lampiran Foto (Wajib Minimal 3)</h3>
                    <div className="grid grid-cols-2 gap-4">
                       {formLaporan.fotos.map((f, i) => (
                         <div key={i} className="relative aspect-square bg-white/10 rounded-2xl overflow-hidden group border border-white/10">
                            <img src={f} className="w-full h-full object-cover" />
                            <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 p-1.5 bg-rose-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                         </div>
                       ))}
                       {formLaporan.fotos.length < 6 && (
                         <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/40 hover:text-white hover:border-white/50 transition-all bg-white/5">
                            <UploadCloud size={32} /><span className="text-[8px] font-black uppercase mt-2">Pilih File</span>
                         </button>
                       )}
                    </div>
                    <div className="mt-6 flex items-center justify-between text-[10px] font-bold">
                       <span className="text-slate-400 uppercase">Jumlah Terunggah:</span>
                       <span className={`px-3 py-1 rounded-lg ${formLaporan.fotos.length >= 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {formLaporan.fotos.length} / 3 Foto
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 3. PREVIEW VIEW (Publik) */}
      {step === 'preview' && activeTask && (
        <div className="space-y-8 animate-fade-in">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-6 no-print bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] sticky top-4 z-30 shadow-xl border border-white">
              <button onClick={() => setStep('list')} className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-indigo-600 transition-colors">
                <ChevronLeft size={20}/> Kembali ke Daftar
              </button>
              <div className="flex gap-4">
                <button onClick={() => window.print()} className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-black transition-all">
                  <Printer size={18}/> Cetak Laporan PDF
                </button>
                {activeTask.nip.replace(/\D/g, '') === user.nip.replace(/\D/g, '') && (
                  <button onClick={confirmFinish} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl hover:bg-indigo-700 transition-all">
                    <Save size={18}/> Finalisasi & Selesai
                  </button>
                )}
              </div>
           </div>

           {/* DOKUMEN LAPORAN RESMI */}
           <div className="bg-white p-[25mm] shadow-2xl relative border border-slate-100 print-container mx-auto overflow-hidden text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
              <div className="relative z-10">
                <div className="border-b-[4px] border-slate-900 pb-4 mb-10 flex items-center text-center">
                   <img src={brandingLogo} className="w-24 h-24 mr-8 grayscale brightness-0" />
                   <div className="flex-1">
                     <h2 className="text-[14pt] font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
                     <h3 className="text-[16pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
                     <p className="text-[10pt] font-sans italic opacity-90 leading-tight text-center">
                       Kompleks Perkantoran Pemerintah, Ternate, Maluku Utara<br/>
                       Laman: bpmp.kemdikbud.go.id | Email: bpmp.malut@kemdikbud.go.id
                     </p>
                   </div>
                </div>

                <div className="text-center mb-10 space-y-1">
                   <h4 className="text-[14pt] font-black underline underline-offset-4 tracking-[0.1em] uppercase leading-none">LAPORAN HASIL KEGIATAN</h4>
                   <p className="text-[11pt] font-sans font-bold">NOMOR ST: {activeTask.nomorSurat}</p>
                </div>

                <div className="space-y-8 text-[11pt] font-serif text-justify">
                   <div>
                      <p className="font-bold mb-2">I. DASAR</p>
                      <p className="pl-6">Surat Tugas Kepala BPMP Maluku Utara Nomor: {activeTask.nomorSurat} perihal {activeTask.namaKegiatan}.</p>
                   </div>
                   <div>
                      <p className="font-bold mb-2">II. PENDAHULUAN</p>
                      <p className="pl-6">{formLaporan.pendahuluan}</p>
                   </div>
                   <div>
                      <p className="font-bold mb-2">III. PELAKSANAAN KEGIATAN</p>
                      <div className="pl-6 space-y-4">
                         <div className="grid grid-cols-4 gap-2">
                            <div className="font-bold">Waktu</div>
                            <div className="col-span-3">: {new Date(activeTask.tanggalMulai).toLocaleDateString('id-ID', { dateStyle: 'long' })} s.d. {new Date(activeTask.tanggalSelesai).toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                            <div className="font-bold">Tempat</div>
                            <div className="col-span-3">: {activeTask.lokasi}</div>
                            <div className="font-bold">Uraian</div>
                            <div className="col-span-3">: {formLaporan.pelaksanaan}</div>
                         </div>
                      </div>
                   </div>
                   <div>
                      <p className="font-bold mb-2">IV. HASIL YANG DICAPAI</p>
                      <p className="pl-6">{formLaporan.hasilKerja}</p>
                   </div>
                   <div>
                      <p className="font-bold mb-2">V. PENUTUP</p>
                      <p className="pl-6">{formLaporan.penutup}</p>
                   </div>
                </div>

                <div className="mt-20 flex justify-end font-sans">
                   <div className="text-center w-80 space-y-24">
                      <p>Ternate, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Pelaksana Tugas,</p>
                      <div className="space-y-1">
                         <p className="font-black underline underline-offset-4 uppercase text-[11pt]">{activeTask.namaPegawai}</p>
                         <p className="text-[10pt] font-bold">NIP. {activeTask.nip}</p>
                      </div>
                   </div>
                </div>

                <div className="page-break-before mt-40">
                   <div className="border-b-2 border-slate-200 pb-4 mb-10">
                      <h4 className="text-[12pt] font-black uppercase text-center">LAMPIRAN DOKUMENTASI KEGIATAN</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      {formLaporan.fotos.map((f, i) => (
                        <div key={i} className="space-y-3">
                           <div className="aspect-video bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                              <img src={f} className="w-full h-full object-cover grayscale" />
                           </div>
                           <p className="text-[9pt] font-sans italic text-center text-slate-500">Gbr {i + 1}: Dokumentasi {activeTask.namaKegiatan}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LaporanTugas;
