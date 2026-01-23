
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
    tanggalMulai: dataService.getTodayWIT(),
    tanggalSelesai: dataService.getTodayWIT(),
    jenisPenugasan: 'Luring' as 'Luring' | 'Daring',
    sumberBiaya: 'BPMP' as 'BPMP' | 'Penyelenggara' | 'Lainnya',
    biaya: 0,
    penandatangan: 'Santoso, S.Pd., M.Si.',
  });

  const [conflictResults, setConflictResults] = useState<{nip: string, message: string}[]>([]);

  const standbyEmployees = useMemo(() => {
    const all = dataService.getPegawai();
    return all.filter(e => {
      const isIdle = dataService.getIdleDays(e.nip) > 0;
      const matchesSearch = e.nama.toLowerCase().includes(searchTerm.toLowerCase()) || e.nip.includes(searchTerm);
      return isIdle && matchesSearch;
    });
  }, [searchTerm, step]);

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
    alert('Penugasan Berhasil Diterbitkan!');
    navigate('/');
  };

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";
  const isSmallGroup = selectedPegawai.length <= 2;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* 1. PROGRESS TRACKER */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between no-print">
         {[
           { id: 1, label: 'Seleksi Personel', desc: 'Pegawai Standby' },
           { id: 2, label: 'Administrasi', desc: 'Detail Surat Tugas' },
           { id: 3, label: 'Verifikasi & Cetak', desc: 'Format Santoso, S.Pd., M.Si.' },
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

      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none"><Users size={240}/></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                   <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Siapkan Tim Tugas</h1>
                   <p className="text-indigo-300 font-bold text-sm mt-4 italic opacity-80">Sistem akan otomatis beralih ke format Lampiran jika personel ≥ 3 orang.</p>
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
                  <button onClick={() => setStep(2)} className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    Input Administrasi <ChevronRight size={18} />
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
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                             {isSelected ? <CheckCircle2 size={24}/> : <Briefcase size={24}/>}
                          </div>
                          <div>
                             <p className="font-black text-slate-800 leading-none uppercase tracking-tight">{emp.nama}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase italic tracking-tighter">NIP: {emp.nip}</p>
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
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Detail Administrasi ST</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor Surat Dinas *</label>
                          <input required type="text" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="e.g. 1234/C7.4/ST/2026" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lokasi Tujuan *</label>
                          <input required type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="e.g. Ternate" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Kegiatan *</label>
                       <input required type="text" value={formData.namaKegiatan} onChange={e => setFormData({...formData, namaKegiatan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="Judul Kegiatan" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tgl Mulai *</label>
                          <input required type="date" value={formData.tanggalMulai} onChange={e => setFormData({...formData, tanggalMulai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tgl Selesai *</label>
                          <input required type="date" value={formData.tanggalSelesai} onChange={e => setFormData({...formData, tanggalSelesai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none shadow-inner" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pejabat Penandatangan</label>
                       <input readOnly value={formData.penandatangan} className="w-full bg-slate-100 border border-slate-100 p-4 rounded-2xl text-sm font-black text-slate-500" />
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-100 flex justify-end">
                    <button onClick={handleValidation} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3">
                       Lanjutkan Ke Pratinjau <ChevronRight size={18}/>
                    </button>
                 </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-xl relative overflow-hidden">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8">Personel Terpilih ({selectedPegawai.length})</h3>
                 <div className="space-y-3">
                    {selectedPegawai.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                         <div>
                            <p className="font-bold text-sm text-white">{p.nama}</p>
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-1">{p.nip}</p>
                         </div>
                         <button onClick={() => togglePegawai(p)} className="p-2 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl"><X size={14}/></button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-fade-in">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-6 no-print bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] sticky top-4 z-30 shadow-xl border border-white">
              <button onClick={() => setStep(2)} className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-indigo-600 transition-colors">
                <ChevronLeft size={20}/> Kembali Ke Edit
              </button>
              <div className="flex gap-4">
                <button onClick={() => window.print()} className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <Printer size={18}/> Cetak Dokumen
                </button>
                <button onClick={handleFinalSubmit} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <Save size={18}/> Terbitkan ST
                </button>
              </div>
           </div>

           {/* HALAMAN 1: SURAT TUGAS */}
           <div className="bg-white p-[25mm] shadow-2xl relative border border-slate-100 print-container mx-auto overflow-hidden text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
              <div className="relative z-10">
                <div className="border-b-[4px] border-slate-900 pb-4 mb-10 flex items-center text-center">
                   <img src={brandingLogo} className="w-20 h-20 mr-8 grayscale brightness-0" />
                   <div className="flex-1">
                     <h2 className="text-[12pt] font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
                     <h3 className="text-[14pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
                     <h3 className="text-[14pt] font-black uppercase leading-tight mb-2">Provinsi Maluku Utara</h3>
                     <p className="text-[9pt] font-sans italic opacity-90 leading-tight">
                       Jl. Perkantoran Pemerintah, Sofifi, Maluku Utara<br/>
                       Laman: bpmpmalut.kemdikbud.go.id | Email: bpmp.malut@kemdikbud.go.id
                     </p>
                   </div>
                </div>

                <div className="text-center mb-10 space-y-1">
                   <h4 className="text-[14pt] font-black underline underline-offset-4 tracking-[0.1em] uppercase">SURAT TUGAS</h4>
                   <p className="text-[11pt] font-sans font-bold">Nomor: {formData.nomorSurat}</p>
                </div>

                <div className="space-y-6 text-[11pt] text-justify font-serif">
                   <p>Kepala Balai Penjaminan Mutu Pendidikan Provinsi Maluku Utara dengan ini memberikan tugas kepada:</p>
                   
                   {isSmallGroup ? (
                     <div className="pl-6 space-y-3">
                        {selectedPegawai.map((p, i) => (
                          <div key={p.id} className="grid grid-cols-6 gap-2">
                             <div className="col-span-1">Nama</div>
                             <div className="col-span-5 font-bold">: {p.nama}</div>
                             <div className="col-span-1">NIP</div>
                             <div className="col-span-5">: {p.nip}</div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="pl-6 italic font-bold">
                        (Daftar Nama Terlampir)
                     </div>
                   )}

                   <div className="mt-8 space-y-4">
                     <p>Untuk melaksanakan tugas dalam rangka kegiatan <span className="font-bold">"{formData.namaKegiatan}"</span> yang akan dilaksanakan di <span className="font-bold underline">{formData.lokasi}</span> selama {Math.ceil((new Date(formData.tanggalSelesai).getTime() - new Date(formData.tanggalMulai).getTime()) / (1000 * 3600 * 24)) + 1} hari kerja, mulai tanggal <span className="font-bold">{new Date(formData.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span> s.d. <span className="font-bold">{new Date(formData.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.</p>
                     <p>Segala biaya yang timbul akibat diterbitkannya surat tugas ini dibebankan pada DIPA BPMP Provinsi Maluku Utara Tahun Anggaran 2026.</p>
                     <p>Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
                   </div>
                </div>

                <div className="mt-24 flex justify-end font-sans">
                   <div className="text-center w-80 space-y-20">
                      <div>
                         <p className="mb-1">Ternate, {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
                         <p>Kepala,</p>
                      </div>
                      <div className="space-y-1">
                         <p className="font-black underline underline-offset-4 uppercase text-[11pt]">{formData.penandatangan}</p>
                         <p className="text-[10pt] font-bold">NIP. 197110141997031003</p>
                      </div>
                   </div>
                </div>
              </div>
           </div>

           {/* HALAMAN 2: LAMPIRAN (HANYA JIKA >= 3 ORANG) */}
           {!isSmallGroup && (
             <div className="bg-white p-[25mm] shadow-2xl relative border border-slate-100 print-container mx-auto mt-10 overflow-hidden text-slate-900 font-serif" style={{ width: '210mm', minHeight: '297mm' }}>
                <div className="mb-10 text-[10pt] font-bold">
                   <p>LAMPIRAN SURAT TUGAS</p>
                   <p>NOMOR : {formData.nomorSurat}</p>
                   <p>TANGGAL : {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
                </div>

                <h4 className="text-center font-bold uppercase underline mb-8">DAFTAR PERSONEL PENUGASAN</h4>

                <table className="w-full border-collapse border border-slate-900 text-[10pt]">
                   <thead>
                      <tr className="bg-slate-100">
                         <th className="border border-slate-900 p-2 text-center w-12">No</th>
                         <th className="border border-slate-900 p-2 text-left">Nama Lengkap</th>
                         <th className="border border-slate-900 p-2 text-left">NIP</th>
                         <th className="border border-slate-900 p-2 text-left">Jabatan / Unit</th>
                      </tr>
                   </thead>
                   <tbody>
                      {selectedPegawai.map((p, i) => (
                        <tr key={p.id}>
                           <td className="border border-slate-900 p-2 text-center">{i + 1}</td>
                           <td className="border border-slate-900 p-2 font-bold">{p.nama}</td>
                           <td className="border border-slate-900 p-2">{p.nip}</td>
                           <td className="border border-slate-900 p-2">{p.jabatan}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>

                <div className="mt-20 flex justify-end font-sans">
                   <div className="text-center w-80 space-y-20">
                      <div>
                         <p>Kepala,</p>
                      </div>
                      <div className="space-y-1">
                         <p className="font-black underline underline-offset-4 uppercase text-[11pt]">{formData.penandatangan}</p>
                         <p className="text-[10pt] font-bold">NIP. 197110141997031003</p>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AssignmentWizard;
