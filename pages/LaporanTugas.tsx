
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Pegawai, Penugasan, Role } from '../types';
import { dataService } from '../services/dataService';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { 
  FileText, 
  Camera, 
  ChevronLeft, 
  Printer, 
  X, 
  Save, 
  Search, 
  ArrowRight, 
  UploadCloud, 
  User, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  History, 
  AlertCircle 
} from 'lucide-react';

interface LaporanTugasProps {
  user: Pegawai;
}

const LaporanTugas: React.FC<LaporanTugasProps> = ({ user }) => {
  const location = useLocation();
  const [activeTask, setActiveTask] = useState<Penugasan | null>(null);
  const [step, setStep] = useState<'list' | 'form' | 'preview'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false); // Default changed to false for global visibility
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // State Laporan Sesuai Format Baru
  const [formLaporan, setFormLaporan] = useState({
    latarBelakang: '',
    maksudTujuan: '',
    ruangLingkup: '',
    dasarLaporan: '',
    kegiatan: '',
    hasil: '',
    simpulan: '',
    penutup: 'Demikian laporan ini dibuat untuk dipergunakan sebagaimana mestinya.',
    fotos: [] as string[],
  });

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";
  const currentUserNip = dataService.standardizeNip(user.nip);

  useEffect(() => {
    if (location.state?.autoOpenTaskId) {
      const task = dataService.getPenugasanById(location.state.autoOpenTaskId);
      if (task) handleAction(task);
    }
  }, [location.state]);

  const filteredTasks = useMemo(() => {
    const all = dataService.getPenugasanWithStatus();
    return all.filter(t => {
      // Privacy filter for Santoso
      if (t.namaPegawai.toLowerCase().includes('santoso')) {
        const viewerName = user.nama.toLowerCase();
        if (!(viewerName.includes('santoso') || viewerName.includes('adin'))) {
          return false;
        }
      }

      const isOwner = dataService.standardizeNip(t.nip) === currentUserNip;
      
      // Feature 2: All users can view all reports regardless of submission status or owner.
      // But we still allow filtering to see "Only My Tasks" for productivity.
      if (onlyMyTasks && !isOwner) return false;
      
      const searchMatches = t.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.namaPegawai.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatches;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [searchTerm, onlyMyTasks, currentUserNip, user.nama]);

  const handleAction = (task: Penugasan) => {
    const isOwner = dataService.standardizeNip(task.nip) === currentUserNip;
    const isUploaded = task.laporanStatus === 'Sudah Upload';
    setActiveTask(task);
    setFormLaporan({
      latarBelakang: task.latarBelakang || `Dalam rangka pelaksanaan program peningkatan mutu pendidikan, dipandang perlu untuk melaksanakan ${task.namaKegiatan} guna memastikan tercapainya target kinerja unit kerja.`,
      maksudTujuan: task.maksudTujuan || `Maksud dari penugasan ini adalah untuk melakukan koordinasi dan fasilitasi teknis terkait ${task.namaKegiatan} dengan tujuan tercapainya efektivitas implementasi kebijakan di daerah.`,
      ruangLingkup: task.ruangLingkup || `Ruang lingkup laporan ini meliputi persiapan, pelaksanaan, hingga evaluasi hasil kegiatan ${task.namaKegiatan} di ${task.lokasi}.`,
      dasarLaporan: task.dasarLaporan || `Surat Tugas Nomor ${task.nomorSurat} tanggal ${task.tanggalMulai}.`,
      kegiatan: task.uraianTugas || '',
      hasil: task.hasilKerja || '',
      simpulan: task.simpulanSaran || '',
      penutup: task.penutupLaporan || 'Demikian laporan ini dibuat untuk dipergunakan sebagaimana mestinya.',
      fotos: task.dokumentasiFotos || [],
    });

    // Owners can always edit (form), others can only preview if uploaded.
    if (isOwner) setStep('form');
    else if (isUploaded) setStep('preview');
    else {
      // If not owner and not uploaded, we show a read-only form state or just stay on list with a notice.
      // For now, let's allow "preview" but it will be empty except for header.
      setStep('preview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fix: Explicitly type the files array as File[] to ensure each 'file' is recognized as a 'File' (which extends 'Blob')
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const filesArray: File[] = Array.from(files);
    filesArray.forEach(file => {
      if (formLaporan.fotos.length >= 6) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormLaporan(prev => ({ ...prev, fotos: [...prev.fotos, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveLaporan = () => {
    const { latarBelakang, kegiatan, hasil, simpulan, fotos } = formLaporan;
    if (!latarBelakang || !kegiatan || !hasil || !simpulan) {
      alert('Mohon lengkapi seluruh bagian laporan (A s.d D).');
      return;
    }
    if (fotos.length < 3) {
      alert('Wajib mengunggah minimal 3 foto dokumentasi sebagai bukti fisik.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      dataService.saveLaporan(activeTask!.id, {
        latarBelakang: formLaporan.latarBelakang,
        maksudTujuan: formLaporan.maksudTujuan,
        ruangLingkup: formLaporan.ruangLingkup,
        dasarLaporan: formLaporan.dasarLaporan,
        uraianTugas: formLaporan.kegiatan,
        hasilKerja: formLaporan.hasil,
        simpulanSaran: formLaporan.simpulan,
        penutupLaporan: formLaporan.penutup,
        dokumentasiFotos: formLaporan.fotos
      });
      setIsSaving(false);
      setStep('preview');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />

      {step === 'list' && (
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><FileText size={240}/></div>
             <div className="relative z-10">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Arsip Laporan Dinas</h1>
                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mt-4 italic opacity-80">Format Laporan Resmi Sesuai Tata Naskah Dinas BPMP</p>
             </div>
          </div>
          <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
             <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <div className="relative flex-1 md:w-96">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                       type="text" placeholder="Cari No. ST atau Kegiatan..." 
                       className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm shadow-inner transition-all"
                       value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      />
                   </div>
                   <button onClick={() => setOnlyMyTasks(!onlyMyTasks)} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${onlyMyTasks ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>
                     <Filter size={16} /> {onlyMyTasks ? 'Hanya Tugas Saya' : 'Lihat Semua Laporan'}
                   </button>
                </div>
             </div>
             <div className="space-y-4">
                {filteredTasks.map(task => {
                  const isOwner = dataService.standardizeNip(task.nip) === currentUserNip;
                  const isUploaded = task.laporanStatus === 'Sudah Upload';
                  return (
                    <div key={task.id} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col lg:flex-row items-center justify-between gap-8 ${isOwner ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-100 bg-white'}`}>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isUploaded ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{isUploaded ? 'Sudah Dilaporkan' : 'Belum Dilaporkan'}</span>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.nomorSurat}</p>
                          </div>
                          <h3 className="text-lg font-black text-slate-800 uppercase italic truncate">{task.namaKegiatan}</h3>
                          <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase italic">
                             <span className="flex items-center gap-2"><User size={12}/> {task.namaPegawai}</span>
                             <span className="flex items-center gap-2"><History size={12}/> {task.tanggalMulai}</span>
                          </div>
                       </div>
                       <button onClick={() => handleAction(task)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 ${isOwner ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          {isOwner ? (isUploaded ? 'Revisi Laporan' : 'Lapor Sekarang') : 'Lihat Laporan'}
                          <ArrowRight size={16}/>
                       </button>
                    </div>
                  )
                })}
             </div>
          </div>
        </div>
      )}

      {step === 'form' && activeTask && (
        <div className="space-y-8 animate-slide-right max-w-5xl mx-auto">
           <div className="flex items-center justify-between">
              <button onClick={() => setStep('list')} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"><ChevronLeft size={20}/> Kembali</button>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">Penyusunan Laporan Penugasan</h2>
           </div>

           <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b pb-4"><CheckCircle2 className="text-indigo-600"/><h3 className="text-xs font-black uppercase tracking-widest">A. Pendahuluan</h3></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Latar Belakang</label>
                       <textarea value={formLaporan.latarBelakang} onChange={e => setFormLaporan({...formLaporan, latarBelakang: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm h-32 focus:border-indigo-500 outline-none"></textarea>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Maksud dan Tujuan</label>
                       <textarea value={formLaporan.maksudTujuan} onChange={e => setFormLaporan({...formLaporan, maksudTujuan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm h-32 focus:border-indigo-500 outline-none"></textarea>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Ruang Lingkup</label>
                       <textarea value={formLaporan.ruangLingkup} onChange={e => setFormLaporan({...formLaporan, ruangLingkup: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm h-32 focus:border-indigo-500 outline-none"></textarea>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">4. Dasar</label>
                       <textarea value={formLaporan.dasarLaporan} onChange={e => setFormLaporan({...formLaporan, dasarLaporan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm h-32 focus:border-indigo-500 outline-none"></textarea>
                    </div>
                 </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b pb-4"><CheckCircle2 className="text-indigo-600"/><h3 className="text-xs font-black uppercase tracking-widest">B. Kegiatan yang Dilaksanakan</h3></div>
                 <textarea value={formLaporan.kegiatan} onChange={e => setFormLaporan({...formLaporan, kegiatan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl text-sm h-48 focus:border-indigo-500 outline-none shadow-inner" placeholder="Uraikan jalannya pelaksanaan tugas secara kronologis..."></textarea>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b pb-4"><CheckCircle2 className="text-indigo-600"/><h3 className="text-xs font-black uppercase tracking-widest">C. Hasil yang Dicapai</h3></div>
                 <textarea value={formLaporan.hasil} onChange={e => setFormLaporan({...formLaporan, hasil: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl text-sm h-48 focus:border-indigo-500 outline-none shadow-inner" placeholder="Sebutkan output konkrit dan data dukung yang dihasilkan..."></textarea>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b pb-4"><CheckCircle2 className="text-indigo-600"/><h3 className="text-xs font-black uppercase tracking-widest">D. Simpulan dan Saran</h3></div>
                 <textarea value={formLaporan.simpulan} onChange={e => setFormLaporan({...formLaporan, simpulan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl text-sm h-48 focus:border-indigo-500 outline-none shadow-inner" placeholder="Tuliskan kesimpulan kegiatan dan saran tindak lanjut..."></textarea>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b pb-4"><Camera className="text-indigo-600"/><h3 className="text-xs font-black uppercase tracking-widest">Dokumentasi Foto (Wajib Min. 3 Foto)</h3></div>
                 <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {formLaporan.fotos.map((f, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                        <img src={f} className="w-full h-full object-cover" />
                        <button onClick={() => setFormLaporan(p => ({...p, fotos: p.fotos.filter((_, idx) => idx !== i)}))} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full"><X size={12}/></button>
                      </div>
                    ))}
                    {formLaporan.fotos.length < 6 && (
                      <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:text-indigo-500 hover:border-indigo-500 transition-all"><UploadCloud size={32}/><span className="text-[8px] font-black uppercase mt-1">Upload</span></button>
                    )}
                 </div>
              </section>

              <div className="pt-10 flex justify-end">
                 <button onClick={handleSaveLaporan} disabled={isSaving} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 disabled:opacity-30">
                    {isSaving ? <RefreshCw className="animate-spin"/> : <Save/>} {isSaving ? 'Menyimpan...' : 'Finalisasi Laporan'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {step === 'preview' && activeTask && (
        <div className="space-y-8 animate-fade-in no-print">
           <div className="flex justify-between bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] sticky top-4 z-30 shadow-xl border border-white">
              <button onClick={() => setStep('list')} className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-widest"><ChevronLeft size={20}/> Kembali</button>
              <div className="flex gap-4">
                <button onClick={() => window.print()} className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3"><Printer size={18}/> Cetak PDF</button>
                {dataService.standardizeNip(activeTask.nip) === currentUserNip && <button onClick={() => setStep('form')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3"><Save size={18}/> Revisi Data</button>}
              </div>
           </div>

           <div className="bg-white p-[25mm] shadow-2xl mx-auto overflow-hidden text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
              {activeTask.laporanStatus === 'Belum Upload' && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
                  <p className="text-[80pt] font-black uppercase rotate-45 border-8 border-rose-600 p-10 text-rose-600">BELUM LAPOR</p>
                </div>
              )}
              <div className="border-b-[4px] border-slate-900 pb-4 mb-10 flex items-center text-center">
                 <img src={brandingLogo} className="w-20 h-20 mr-8 grayscale brightness-0" />
                 <div className="flex-1">
                   <h2 className="text-[12pt] font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
                   <h3 className="text-[14pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
                   <p className="text-[9pt] font-sans italic opacity-80 leading-tight">Kompleks Perkantoran Pemerintah, Ternate, Maluku Utara</p>
                 </div>
              </div>

              <div className="text-center mb-10">
                 <h4 className="text-[14pt] font-black uppercase leading-none">LAPORAN TENTANG</h4>
                 <p className="text-[13pt] font-bold uppercase mt-2">{activeTask.namaKegiatan}</p>
                 <div className="h-[1px] bg-slate-900 w-3/4 mx-auto mt-4"></div>
              </div>

              <div className="space-y-8 text-[11pt] text-justify leading-[1.8]">
                 <div>
                    <p className="font-bold">A. Pendahuluan</p>
                    <div className="pl-8 space-y-4">
                       <p><span className="font-bold">1. Latar Belakang:</span> {formLaporan.latarBelakang || '...'}</p>
                       <p><span className="font-bold">2. Maksud dan Tujuan:</span> {formLaporan.maksudTujuan || '...'}</p>
                       <p><span className="font-bold">3. Ruang Lingkup:</span> {formLaporan.ruangLingkup || '...'}</p>
                       <p><span className="font-bold">4. Dasar:</span> {formLaporan.dasarLaporan || '...'}</p>
                    </div>
                 </div>
                 <div>
                    <p className="font-bold">B. Kegiatan yang Dilaksanakan</p>
                    <p className="pl-8">{formLaporan.kegiatan || '...'}</p>
                 </div>
                 <div>
                    <p className="font-bold">C. Hasil yang Dicapai</p>
                    <p className="pl-8">{formLaporan.hasil || '...'}</p>
                 </div>
                 <div>
                    <p className="font-bold">D. Simpulan dan Saran</p>
                    <p className="pl-8">{formLaporan.simpulan || '...'}</p>
                 </div>
                 <div>
                    <p className="font-bold">E. Penutup</p>
                    <p className="pl-8">{formLaporan.penutup || '...'}</p>
                 </div>
              </div>

              <div className="mt-20 flex justify-end font-sans">
                 <div className="text-center w-80 space-y-24">
                    <p>Dibuat di Ternate,<br/>Tanggal {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                    <div className="space-y-1">
                       <p className="font-black underline uppercase text-[11pt]">{activeTask.namaPegawai}</p>
                       <p className="text-[10px] font-bold">NIP. {activeTask.nip}</p>
                    </div>
                 </div>
              </div>

              {formLaporan.fotos.length > 0 && (
                <div className="page-break-before mt-40">
                  <div className="border-b-2 border-slate-900 pb-2 mb-10"><h4 className="text-[11pt] font-black uppercase text-center">LAMPIRAN DOKUMENTASI VISUAL</h4></div>
                  <div className="grid grid-cols-2 gap-8">
                      {formLaporan.fotos.map((f, i) => (
                        <div key={i} className="space-y-2">
                          <div className="aspect-video bg-slate-100 border border-slate-300 rounded overflow-hidden">
                              <img src={f} className="w-full h-full object-cover grayscale" />
                          </div>
                          <p className="text-[8pt] font-sans italic text-center opacity-60">Dokumentasi {i + 1}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default LaporanTugas;
