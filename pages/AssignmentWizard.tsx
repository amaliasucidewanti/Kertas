
import React, { useState, useMemo } from 'react';
import { Pegawai, Penugasan, Role } from '../types';
import { dataService } from '../services/dataService';
import { 
  Users, Search, ChevronRight, ChevronLeft, CheckCircle2, Save, X, Info, ShieldAlert, RefreshCw
} from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const AssignmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
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
    sumberBiaya: 'BPMP' as 'BPMP' | 'Penyelenggara' | 'Tanpa Biaya',
    biaya: 0,
    penandatangan: 'Santoso, S.Pd., M.Si.',
  });

  const [conflictResults, setConflictResults] = useState<{nip: string, message: string}[]>([]);

  const { employees: eligibleEmployees, warning: gatekeeperWarning } = useMemo(() => {
    return dataService.getEligibleEmployees();
  }, []);

  const standbyEmployees = useMemo(() => {
    return eligibleEmployees.filter(e => {
      const isIdle = dataService.getIdleDays(e.nip) > 0;
      const matchesSearch = e.nama.toLowerCase().includes(searchTerm.toLowerCase()) || e.nip.includes(searchTerm);
      return isIdle && matchesSearch;
    });
  }, [eligibleEmployees, searchTerm]);

  const togglePegawai = (pegawai: Pegawai) => {
    const isSelected = selectedPegawai.find(p => p.id === pegawai.id);
    if (isSelected) {
      setSelectedPegawai(selectedPegawai.filter(p => p.id !== pegawai.id));
    } else {
      setSelectedPegawai([...selectedPegawai, pegawai]);
    }
  };

  const handleValidation = () => {
    if (!formData.nomorSurat || !formData.namaKegiatan || !formData.lokasi) {
      alert("Mohon lengkapi seluruh field administrasi yang bertanda bintang (*)");
      return;
    }

    setIsValidating(true);
    
    // Simulate complex validation delay for better UX feel
    setTimeout(() => {
      const conflicts = selectedPegawai.map(p => {
        const check = dataService.checkConflict(p.nip, formData.tanggalMulai, formData.tanggalSelesai, formData.jenisPenugasan);
        return check.conflict ? { nip: p.nip, message: check.message || 'Bentrok Luring' } : null;
      }).filter(c => c !== null) as {nip: string, message: string}[];

      setConflictResults(conflicts);
      setIsValidating(false);

      if (conflicts.length === 0) {
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(`Terdeteksi ${conflicts.length} bentrok jadwal kritikal.`);
      }
    }, 500);
  };

  const handleFinalSubmit = () => {
    setIsValidating(true);
    setTimeout(() => {
      dataService.addPenugasanBatch(formData, selectedPegawai);
      setIsValidating(false);
      alert('Penugasan Kolektif Berhasil Diterbitkan!');
      navigate('/');
    }, 800);
  };

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";
  const isSmallGroup = selectedPegawai.length <= 2;

  if (isValidating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Memproses Data...</p>
          <p className="text-xs text-slate-400 font-bold mt-2 italic">Memvalidasi jadwal & integritas sistem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* PROGRESS TRACKER */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between no-print overflow-x-auto gap-4">
         {[
           { id: 1, label: 'Seleksi', desc: 'Pegawai Standby' },
           { id: 2, label: 'Admin', desc: 'Parameter Tugas' },
           { id: 3, label: 'Cetak', desc: 'Verifikasi ST' },
         ].map((s, i) => (
           <React.Fragment key={s.id}>
             <div className="flex items-center gap-4 flex-1 justify-center min-w-[120px]">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>
                   {step > s.id ? <CheckCircle2 size={20}/> : s.id}
                </div>
                <div>
                   <p className={`text-[9px] font-black uppercase tracking-widest leading-none ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</p>
                </div>
             </div>
             {i < 2 && <div className="h-[1px] w-12 bg-slate-100"></div>}
           </React.Fragment>
         ))}
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><Users size={240}/></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                   <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Penerbitan Kolektif</h1>
                   <p className="text-indigo-300 font-bold text-sm mt-4 italic opacity-80">Pilih personel siaga untuk penugasan tim.</p>
                   {gatekeeperWarning && (
                     <div className="mt-4 flex items-center gap-3 bg-amber-500/20 border border-amber-500/30 p-3 rounded-xl text-amber-200 text-[10px] font-black uppercase">
                        <ShieldAlert size={14}/> {gatekeeperWarning}
                     </div>
                   )}
                </div>
                <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center min-w-[150px]">
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
                    type="text" placeholder="Cari Nama/NIP..." 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
                {selectedPegawai.length > 0 && (
                  <button onClick={() => setStep(2)} className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 group">
                    Lanjut Ke Form ST <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standbyEmployees.map(emp => {
                  const isSelected = selectedPegawai.find(p => p.id === emp.id);
                  const disc = dataService.getKedisiplinan(emp.nip);
                  return (
                    <div 
                      key={emp.id} 
                      onClick={() => togglePegawai(emp)}
                      className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all relative group overflow-hidden ${isSelected ? 'bg-indigo-50 border-indigo-600 shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                    >
                       <div className="flex items-center gap-5 relative z-10">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                             {isSelected ? <CheckCircle2 size={24}/> : <Users size={24}/>}
                          </div>
                          <div>
                             <p className="font-black text-slate-800 leading-none uppercase tracking-tight">{emp.nama}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase italic tracking-tighter">NIP: {emp.nip}</p>
                             <div className="mt-2">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                                  (disc?.nilaiAkhir || 0) > 90 ? 'bg-emerald-50 text-emerald-600' : (disc?.nilaiAkhir || 0) > 75 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                                }`}>Skor: {disc?.nilaiAkhir || 0}%</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  );
                })}
                {standbyEmployees.length === 0 && (
                   <div className="col-span-full py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">
                      Pencarian tidak ditemukan atau pegawai tidak siaga
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-slide-right">
           <div className="flex items-center gap-4 no-print">
              <button onClick={() => setStep(1)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><ChevronLeft size={20}/></button>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Parameter Penugasan Tim</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Jenis Tugas *</label>
                          <select 
                            required value={formData.jenisPenugasan} 
                            onChange={e => setFormData({...formData, jenisPenugasan: e.target.value as any})}
                            className="w-full bg-slate-50 px-5 py-4 rounded-2xl text-sm font-black text-indigo-700 outline-none border-2 border-indigo-100 focus:border-indigo-600 transition-all"
                          >
                            <option value="Luring">Luring (Luar Kantor)</option>
                            <option value="Daring">Daring (Online/Zoom)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Sumber Biaya *</label>
                          <select 
                            required value={formData.sumberBiaya} 
                            onChange={e => setFormData({...formData, sumberBiaya: e.target.value as any})}
                            className="w-full bg-slate-50 px-5 py-4 rounded-2xl text-sm font-black text-amber-700 outline-none border-2 border-amber-100 focus:border-amber-600 transition-all"
                          >
                            <option value="BPMP">DIPA BPMP Malut</option>
                            <option value="Penyelenggara">Penyelenggara</option>
                            <option value="Tanpa Biaya">Tanpa Biaya</option>
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor ST *</label>
                          <input required type="text" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 1234/C7.4/ST/2026" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi *</label>
                          <input required type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Kabupaten Morotai" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Kegiatan *</label>
                       <input required type="text" value={formData.namaKegiatan} onChange={e => setFormData({...formData, namaKegiatan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mulai *</label>
                          <input required type="date" value={formData.tanggalMulai} onChange={e => setFormData({...formData, tanggalMulai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selesai *</label>
                          <input required type="date" value={formData.tanggalSelesai} onChange={e => setFormData({...formData, tanggalSelesai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-100 flex justify-end">
                    <button onClick={handleValidation} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3">
                       Verifikasi Jadwal & Pratinjau <ChevronRight size={18}/>
                    </button>
                 </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-xl flex flex-col">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8 flex items-center gap-2">
                    <Users size={14} /> Anggota Tim ({selectedPegawai.length})
                 </h3>
                 <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {selectedPegawai.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                         <div>
                            <p className="font-bold text-sm text-white">{p.nama}</p>
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-1">{p.nip}</p>
                         </div>
                         <button onClick={() => togglePegawai(p)} className="p-2 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"><X size={14}/></button>
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
              <button onClick={() => setStep(2)} className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 transition-colors">
                <ChevronLeft size={20}/> Ubah Data
              </button>
              <div className="flex gap-4">
                <button onClick={handleFinalSubmit} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-indigo-700 transition-all">
                  <Save size={18}/> Simpan & Terbitkan ST
                </button>
              </div>
           </div>

           <div className="bg-white p-[25mm] shadow-2xl relative border border-slate-100 print-container mx-auto overflow-hidden text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
              <div className="relative z-10">
                <div className="border-b-[4px] border-slate-900 pb-4 mb-10 flex items-center text-center">
                   <img src={brandingLogo} className="w-16 h-16 mr-6 grayscale brightness-0" />
                   <div className="flex-1">
                     <h2 className="text-[11pt] font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
                     <h3 className="text-[13pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
                     <h3 className="text-[13pt] font-black uppercase leading-tight mb-2">Provinsi Maluku Utara</h3>
                   </div>
                </div>

                <div className="text-center mb-10 space-y-1">
                   <h4 className="text-[14pt] font-black underline underline-offset-4 tracking-[0.1em] uppercase">SURAT TUGAS</h4>
                   <p className="text-[11pt] font-sans font-bold">Nomor: {formData.nomorSurat}</p>
                </div>

                <div className="space-y-6 text-[11pt] text-justify font-serif">
                   <p>Kepala Balai Penjaminan Mutu Pendidikan Provinsi Maluku Utara dengan ini memberikan tugas kepada:</p>
                   
                   {isSmallGroup ? (
                     <div className="pl-6 space-y-4">
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
                        (Daftar Nama Terlampir Pada Halaman Berikut)
                     </div>
                   )}

                   <div className="mt-8 space-y-4">
                     <p>Untuk melaksanakan tugas dalam rangka kegiatan <span className="font-bold">"{formData.namaKegiatan}"</span> yang akan dilaksanakan di <span className="font-bold underline">{formData.lokasi}</span> selama {Math.ceil((new Date(formData.tanggalSelesai).getTime() - new Date(formData.tanggalMulai).getTime()) / (1000 * 3600 * 24)) + 1} hari kerja.</p>
                     <p>Biaya dibebankan pada DIPA BPMP Provinsi Maluku Utara Tahun Anggaran 2026 ({formData.sumberBiaya}).</p>
                   </div>
                </div>

                <div className="mt-20 flex justify-end font-sans">
                   <div className="text-center w-80 space-y-16">
                      <div>
                         <p className="mb-1">Ternate, {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
                         <p>Kepala,</p>
                      </div>
                      <div className="space-y-1">
                         <p className="font-black underline uppercase text-[11pt]">{formData.penandatangan}</p>
                         <p className="text-[10pt] font-bold">NIP. 197110141997031003</p>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentWizard;
