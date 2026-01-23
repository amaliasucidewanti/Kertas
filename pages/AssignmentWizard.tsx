
import React, { useState, useMemo } from 'react';
import { Pegawai, Penugasan, Role } from '../types';
import { dataService } from '../services/dataService';
import { 
  Users, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Landmark, 
  Printer, 
  Save, 
  X,
  Info,
  Calendar,
  Briefcase,
  FileDown
} from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const AssignmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nomorSurat: '',
    namaKegiatan: '',
    uraianTugas: '',
    lokasi: '',
    tanggalMulai: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jayapura' }),
    tanggalSelesai: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jayapura' }),
    jenisPenugasan: 'Luring' as 'Luring' | 'Daring',
    sumberBiaya: 'BPMP' as 'BPMP' | 'Penyelenggara' | 'Lainnya',
    biaya: 0,
    penandatangan: 'Samsul Arifin, M.Pd.',
  });

  const [conflictResults, setConflictResults] = useState<{nip: string, message: string}[]>([]);

  const standbyEmployees = useMemo(() => {
    const all = dataService.getPegawai();
    return all.filter(e => {
      const isIdle = dataService.getIdleDays(e.nip) > 0;
      const matchesSearch = e.nama.toLowerCase().includes(searchTerm.toLowerCase()) || e.nip.includes(searchTerm);
      return isIdle && matchesSearch;
    });
  }, [searchTerm]);

  const togglePegawai = (pegawai: Pegawai) => {
    const isSelected = selectedPegawai.find(p => p.id === pegawai.id);
    if (isSelected) {
      setSelectedPegawai(selectedPegawai.filter(p => p.id !== pegawai.id));
    } else {
      setSelectedPegawai([...selectedPegawai, pegawai]);
    }
  };

  const handleValidation = () => {
    const conflicts = selectedPegawai.map(p => {
      const check = dataService.checkConflict(p.nip, formData.tanggalMulai, formData.tanggalSelesai, formData.jenisPenugasan);
      return check.conflict ? { nip: p.nip, message: check.message || 'Bentrok Luring' } : null;
    }).filter(c => c !== null) as {nip: string, message: string}[];

    setConflictResults(conflicts);
    if (conflicts.length === 0) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalSubmit = () => {
    dataService.addPenugasanBatch(formData, selectedPegawai);
    alert('Penugasan Berhasil Diterbitkan dan Terintegrasi ke Database Pusat BPMP!');
    navigate('/');
  };

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* 1. PROGRESS TRACKER */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between no-print">
         {[
           { id: 1, label: 'Seleksi Personel', desc: 'Pegawai Standby' },
           { id: 2, label: 'Administrasi', desc: 'Detail Surat Tugas' },
           { id: 3, label: 'Verifikasi & Cetak', desc: 'Validasi Akhir' },
         ].map((s, i) => (
           <React.Fragment key={s.id}>
             <div className="flex items-center gap-4 flex-1 justify-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>
                   {step > s.id ? <CheckCircle2 size={24}/> : s.id}
                </div>
                <div className="hidden lg:block">
                   <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</p>
                   <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">{s.desc}</p>
                </div>
             </div>
             {i < 2 && <div className="h-[1px] w-20 bg-slate-100 hidden md:block"></div>}
           </React.Fragment>
         ))}
      </div>

      {/* 2. CONTENT AREA */}
      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none"><Users size={240}/></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                   <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Seleksi Personel Standby</h1>
                   <p className="text-indigo-300 font-bold text-sm mt-4 italic opacity-80">Sistem memfilter otomatis pegawai yang tidak memiliki tugas aktif hari ini.</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-5xl font-black tracking-tighter">{selectedPegawai.length}</div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Pegawai Terpilih</p>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
             <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
                <div className="relative w-full md:w-96">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input 
                    type="text" placeholder="Cari Pegawai Siaga..." 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
                {selectedPegawai.length > 0 && (
                  <button onClick={() => setStep(2)} className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 group animate-bounce-short">
                    Lanjutkan ke Form Administrasi <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standbyEmployees.map(emp => {
                  const isSelected = selectedPegawai.find(p => p.id === emp.id);
                  return (
                    <div 
                      key={emp.id} 
                      onClick={() => togglePegawai(emp)}
                      className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all relative group overflow-hidden ${isSelected ? 'bg-indigo-50 border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                    >
                       <div className="flex items-center gap-5 relative z-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                             {isSelected ? <CheckCircle2 size={24}/> : <Briefcase size={24}/>}
                          </div>
                          <div>
                             <p className="font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{emp.nama}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase italic tracking-tighter">NIP: {emp.nip}</p>
                             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">{emp.unitKerja}</p>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-slide-right">
           <div className="flex items-center gap-4 no-print">
              <button onClick={() => setStep(1)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><ChevronLeft size={20}/></button>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Administrasi Penugasan</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <FileText size={20} className="text-indigo-600"/>
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Data Utama Surat Tugas</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor Surat Dinas *</label>
                          <input required type="text" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="e.g. 1234/C7.4/ST/2026" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lokasi Tujuan *</label>
                          <input required type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="e.g. Ternate / Halmahera" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Kegiatan *</label>
                       <input required type="text" value={formData.namaKegiatan} onChange={e => setFormData({...formData, namaKegiatan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="Judul Workshop / Rapat / Koordinasi" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Uraian Tugas Spesifik *</label>
                       <textarea required value={formData.uraianTugas} onChange={e => setFormData({...formData, uraianTugas: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="Deskripsikan rincian pekerjaan..."></textarea>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Calendar size={20} className="text-amber-600"/>
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Waktu & Penandatangan</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tgl Mulai *</label>
                          <input required type="date" value={formData.tanggalMulai} onChange={e => setFormData({...formData, tanggalMulai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tgl Selesai *</label>
                          <input required type="date" value={formData.tanggalSelesai} onChange={e => setFormData({...formData, tanggalSelesai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Penandatangan *</label>
                          <input required type="text" value={formData.penandatangan} onChange={e => setFormData({...formData, penandatangan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 shadow-inner" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-100 flex justify-end">
                    <button onClick={handleValidation} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3">
                       Simpan & Cek Konflik <ChevronRight size={18}/>
                    </button>
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Users size={120}/></div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8">Pelaksana Terpilih ({selectedPegawai.length})</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {selectedPegawai.map(p => (
                         <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm group hover:bg-white/10 transition-all">
                            <div>
                               <p className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">{p.nama}</p>
                               <p className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-1">{p.nip} • {p.unitKerja}</p>
                            </div>
                            <button onClick={() => togglePegawai(p)} className="p-2 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"><X size={14}/></button>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-amber-50 p-8 rounded-[3.5rem] border border-amber-100 shadow-sm relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 p-4 opacity-5"><Info size={80}/></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4">Informasi Tambahan</h4>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Tugas</label>
                          <select value={formData.jenisPenugasan} onChange={e => setFormData({...formData, jenisPenugasan: e.target.value as any})} className="w-full bg-white px-4 py-3 rounded-xl text-[10px] font-black text-indigo-700 outline-none border border-amber-100 shadow-sm">
                             <option value="Luring">Luring (Fisik)</option>
                             <option value="Daring">Daring (Virtual)</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sumber Biaya</label>
                          <select value={formData.sumberBiaya} onChange={e => setFormData({...formData, sumberBiaya: e.target.value as any})} className="w-full bg-white px-4 py-3 rounded-xl text-[10px] font-black text-slate-600 outline-none border border-amber-100 shadow-sm">
                             <option value="BPMP">DIPA BPMP Malut</option>
                             <option value="Penyelenggara">Biaya Penyelenggara</option>
                             <option value="Lainnya">Lainnya</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-fade-in">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-6 no-print bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] sticky top-4 z-30 shadow-xl border border-white">
              <button onClick={() => setStep(2)} className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-indigo-600 transition-colors">
                <ChevronLeft size={20}/> Kembali ke Pengeditan
              </button>
              <div className="flex gap-4">
                <button onClick={() => window.print()} className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-black transition-all">
                  <FileDown size={18}/> Download PDF / Cetak
                </button>
                <button onClick={handleFinalSubmit} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all animate-pulse">
                  <Save size={18}/> Simpan & Terbitkan ST
                </button>
              </div>
           </div>

           {/* DOKUMEN PRATINJAU */}
           <div className="bg-white p-[25mm] shadow-2xl relative border border-slate-100 print-container mx-auto overflow-hidden text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none rotate-[-45deg] z-0">
                 <span className="text-[140px] font-black tracking-tighter whitespace-nowrap">BPMP MALUT</span>
              </div>
              
              <div className="relative z-10">
                <div className="border-b-[4px] border-slate-900 pb-4 mb-10 flex items-center text-center">
                   <img src={brandingLogo} className="w-24 h-24 mr-8 grayscale brightness-0" />
                   <div className="flex-1">
                     <h2 className="text-[14pt] font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
                     <h3 className="text-[16pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
                     <p className="text-[10pt] font-sans italic opacity-90 leading-tight">
                       Kompleks Perkantoran Pemerintah, Ternate, Maluku Utara<br/>
                       Laman: bpmp.kemdikbud.go.id | Email: bpmp.malut@kemdikbud.go.id
                     </p>
                   </div>
                </div>

                <div className="text-center mb-12 space-y-1">
                   <h4 className="text-[14pt] font-black underline underline-offset-4 tracking-[0.2em] uppercase">SURAT TUGAS</h4>
                   <p className="text-[11pt] font-sans font-bold">Nomor: {formData.nomorSurat}</p>
                </div>

                <div className="space-y-6 text-[12pt] text-justify font-serif">
                   <p>Kepala Balai Penjaminan Mutu Pendidikan Maluku Utara dengan ini memberikan tugas kepada:</p>
                   
                   <div className="pl-6 space-y-4">
                      {selectedPegawai.map((p, i) => (
                        <div key={p.id} className="grid grid-cols-6 gap-2 font-sans text-[11pt]">
                           <div className="col-span-1">{i + 1}. Nama</div>
                           <div className="col-span-5 font-black uppercase">: {p.nama}</div>
                           <div className="col-span-1"></div>
                           <div className="col-span-5">: NIP. {p.nip} / {p.jabatan}</div>
                        </div>
                      ))}
                   </div>

                   <div className="mt-8 space-y-4">
                     <p>Untuk melaksanakan tugas dalam rangka kegiatan <span className="font-bold">"{formData.namaKegiatan}"</span> yang akan dilaksanakan secara <span className="font-bold uppercase tracking-widest">{formData.jenisPenugasan}</span> dengan uraian tugas:</p>
                     <p className="italic border-l-4 border-slate-100 pl-4 py-2 bg-slate-50/30 text-[11pt]">"{formData.uraianTugas}"</p>
                     <p>Kegiatan tersebut dilaksanakan di <span className="font-bold underline decoration-1">{formData.lokasi}</span> selama {Math.ceil((new Date(formData.tanggalSelesai).getTime() - new Date(formData.tanggalMulai).getTime()) / (1000 * 3600 * 24)) + 1} hari kerja, mulai tanggal <span className="font-bold">{new Date(formData.tanggalMulai).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span> s.d. <span className="font-bold">{new Date(formData.tanggalSelesai).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>.</p>
                     <p>Segala biaya yang timbul akibat diterbitkannya surat tugas ini dibebankan pada DIPA BPMP Tahun Anggaran 2026.</p>
                     <p>Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
                   </div>
                </div>

                <div className="mt-24 flex justify-end font-sans">
                   <div className="text-center w-80 space-y-20">
                      <div>
                         <p className="mb-1">Ditetapkan di Ternate,</p>
                         <p>Pada tanggal {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="font-black underline underline-offset-4 uppercase text-[12pt]">{formData.penandatangan}</p>
                         <p className="text-[10pt] font-bold">NIP. 19750101XXXXXXXXX</p>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL CONFLICT DETECTED */}
      {conflictResults.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="p-8 bg-rose-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <AlertTriangle size={32} />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Deteksi Konflik Penugasan</h3>
                 </div>
                 <button onClick={() => setConflictResults([])} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-6">
                 <p className="text-sm font-bold text-slate-500 leading-relaxed">Sistem menemukan pegawai terpilih yang sudah memiliki tugas <span className="text-rose-600 font-black">LURING</span> pada rentang waktu yang sama:</p>
                 <div className="space-y-3">
                    {conflictResults.map((c, i) => (
                      <div key={i} className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Pegawai NIP: {c.nip}</p>
                            <p className="font-bold text-slate-800 italic text-sm mt-1">"{c.message}"</p>
                         </div>
                         <ShieldCheck className="text-rose-400" size={24}/>
                      </div>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                    <p className="text-[10px] text-slate-400 font-medium italic text-center uppercase tracking-widest">Mohon hapus pegawai yang bentrok atau ubah rentang tanggal/jenis tugas.</p>
                    <button onClick={() => setConflictResults([])} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                       SAYA MENGERTI
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentWizard;
