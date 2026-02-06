
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pegawai, Penugasan } from '../types';
import { Eye, Save, ChevronLeft, Printer, FileText, AlertTriangle, ShieldCheck, Landmark, ShieldAlert } from 'lucide-react';
import { dataService } from '../services/dataService';

const SuratTugasForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedEmp = location.state?.employee as Pegawai;

  // Gatekeeper Validation for selected individual
  const { bottom5 } = useMemo(() => dataService.getEligibleEmployees(), []);
  const isExcluded = useMemo(() => {
    if (!selectedEmp || !bottom5) return false;
    return bottom5.some(p => p.nip === selectedEmp.nip);
  }, [selectedEmp, bottom5]);

  const [formData, setFormData] = useState({
    namaPegawai: selectedEmp?.nama || '',
    nip: selectedEmp?.nip || '',
    jabatan: selectedEmp?.jabatan || '',
    nomorSurat: '',
    namaKegiatan: '',
    uraianTugas: '',
    lokasi: '',
    tanggalMulai: dataService.getTodayWIT(),
    tanggalSelesai: dataService.getTodayWIT(),
    jenisPenugasan: (selectedEmp?.jenisTugas || 'Luring') as 'Luring' | 'Daring',
    sumberBiaya: (selectedEmp?.sumberBiaya || 'BPMP') as 'BPMP' | 'Penyelenggara' | 'Tanpa Biaya',
    penandatangan: 'Santoso, S.Pd., M.Si.',
    biaya: 0,
  });

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const checkConflict = () => {
    if (formData.nip && formData.tanggalMulai && formData.tanggalSelesai) {
      const result = dataService.checkConflict(
        formData.nip, 
        formData.tanggalMulai, 
        formData.tanggalSelesai, 
        formData.jenisPenugasan
      );
      if (result.conflict) {
        setConflictError(result.message || 'Bentrok Jadwal!');
        return true;
      }
      setConflictError(null);
      return false;
    }
    return false;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExcluded) {
      alert("Pegawai ini masuk dalam daftar pengecualian (Gatekeeper) karena skor disiplin terendah. Tidak dapat menerbitkan ST.");
      return;
    }
    if (checkConflict()) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }
    setIsPreview(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSave = () => {
    const newTask: Penugasan = {
      ...formData,
      id: 'ST-' + Date.now(),
      statusTugas: 'Aktif',
      laporanStatus: 'Belum Upload',
      createdAt: new Date().toISOString()
    };
    dataService.addPenugasan(newTask);
    alert('Surat Tugas Berhasil Diterbitkan!');
    navigate('/');
  };

  if (isPreview) {
    return (
      <div className="max-w-5xl mx-auto pb-32 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 no-print bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] sticky top-4 z-30 shadow-xl border border-white">
           <button onClick={() => setIsPreview(false)} className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-indigo-600 transition-colors">
             <ChevronLeft size={20}/> Kembali ke Pengeditan
           </button>
           <div className="flex gap-4">
             <button onClick={() => window.print()} className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-black transition-all">
               <Printer size={18}/> Cetak Dokumen
             </button>
             <button onClick={handleFinalSave} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
               <Save size={18}/> Terbitkan & Simpan
             </button>
           </div>
        </div>

        <div className="bg-white p-[25mm] shadow-2xl relative border border-slate-100 print-container mx-auto overflow-hidden text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
           <div className="relative z-10">
             <div className="border-b-[4px] border-slate-900 pb-4 mb-10 flex items-center text-center">
                <img src="https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k" className="w-20 h-20 mr-8 grayscale brightness-0" />
                <div className="flex-1">
                  <h2 className="text-[12pt] font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
                  <h3 className="text-[14pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
                  <h3 className="text-[14pt] font-black uppercase leading-tight mb-2">Provinsi Maluku Utara</h3>
                  <p className="text-[9pt] font-sans italic opacity-90">
                    Jl. Perkantoran Pemerintah, Sofifi, Maluku Utara<br/>
                    Laman: bpmpmalut.kemdikbud.go.id | Pos Elektronik: bpmp.malut@kemdikbud.go.id
                  </p>
                </div>
             </div>

             <div className="text-center mb-10 space-y-1">
                <h4 className="text-[14pt] font-black underline underline-offset-4 tracking-[0.1em] uppercase">SURAT TUGAS</h4>
                <p className="text-[11pt] font-sans font-bold">Nomor: {formData.nomorSurat}</p>
             </div>

             <div className="space-y-6 text-[11pt] text-justify font-serif">
                <p>Kepala Balai Penjaminan Mutu Pendidikan Provinsi Maluku Utara dengan ini memberikan tugas kepada:</p>
                <div className="pl-12 space-y-1">
                   <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-1">Nama</div>
                      <div className="col-span-5 font-bold">: {formData.namaPegawai}</div>
                   </div>
                   <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-1">NIP</div>
                      <div className="col-span-5">: {formData.nip}</div>
                   </div>
                   <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-1">Jabatan</div>
                      <div className="col-span-5">: {formData.jabatan}</div>
                   </div>
                </div>

                <div className="mt-8 space-y-4">
                  <p>Untuk melaksanakan tugas dalam rangka <span className="font-bold">{formData.namaKegiatan}</span> yang akan dilaksanakan di <span className="font-bold">{formData.lokasi}</span> mulai tanggal {new Date(formData.tanggalMulai).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} s.d. {new Date(formData.tanggalSelesai).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}.</p>
                  <p>Segala biaya yang timbul akibat diterbitkannya surat tugas ini dibebankan pada DIPA BPMP Provinsi Maluku Utara Tahun Anggaran 2026 ({formData.sumberBiaya}).</p>
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
          <FileText size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Penerbitan ST (Individu)</h1>
          <p className="text-slate-500 font-medium italic">Data ini akan menjadi sumber utama tabel monitoring & statistik pegawai</p>
        </div>
      </div>

      {isExcluded && (
        <div className="mb-8 p-6 bg-rose-50 border-2 border-rose-200 rounded-[2rem] flex items-center gap-4 text-rose-600">
           <ShieldAlert size={32} className="animate-pulse" />
           <div>
              <p className="text-sm font-black uppercase tracking-widest">Akses Penugasan Dibatasi (Gatekeeper)</p>
              <p className="text-xs font-bold mt-1 opacity-70">Pegawai ini memiliki skor disiplin terendah. Diperlukan pembinaan internal sebelum penugasan baru diterbitkan.</p>
           </div>
        </div>
      )}

      <div className={`bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden ${isExcluded ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <form onSubmit={handlePreview} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-indigo-500"/>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Data Pelaksana</h3>
               </div>
               <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Pegawai</label>
                    <input readOnly value={formData.namaPegawai} className="w-full bg-white px-4 py-3 rounded-xl text-sm font-black text-slate-800 shadow-sm outline-none border border-transparent" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP</label>
                    <input readOnly value={formData.nip} className="w-full bg-white px-4 py-3 rounded-xl text-sm text-slate-500 font-bold shadow-sm outline-none border border-transparent" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <Landmark size={18} className="text-amber-500"/>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Parameter Penugasan</h3>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Jenis Tugas (Mandatory) *</label>
                    <select 
                      required
                      value={formData.jenisPenugasan} 
                      onChange={e => setFormData({...formData, jenisPenugasan: e.target.value as any})}
                      className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm font-black text-indigo-700 outline-none border-2 border-indigo-100 focus:border-indigo-500 transition-all"
                    >
                      <option value="Luring">Luring (Luar Kantor)</option>
                      <option value="Daring">Daring (Dalam Jaringan)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Sumber Biaya ST (Mandatory) *</label>
                    <select 
                      required
                      value={formData.sumberBiaya} 
                      onChange={e => setFormData({...formData, sumberBiaya: e.target.value as any})}
                      className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm font-black text-amber-700 outline-none border-2 border-amber-100 focus:border-amber-500 transition-all"
                    >
                      <option value="BPMP">DIPA BPMP (Internal)</option>
                      <option value="Penyelenggara">Penyelenggara (Eksternal)</option>
                      <option value="Tanpa Biaya">Tanpa Biaya (Mandiri/Zonasi)</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Nomor Surat *</label>
                <input required type="text" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none shadow-inner" placeholder="e.g. 1234/C7.4/ST/2026" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Lokasi Kegiatan *</label>
                <input required type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none shadow-inner" placeholder="e.g. Kota Ternate" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Nama Kegiatan *</label>
              <input required type="text" value={formData.namaKegiatan} onChange={e => setFormData({...formData, namaKegiatan: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none shadow-inner" placeholder="Sebutkan Judul Kegiatan Secara Jelas" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Tanggal Mulai *</label>
                  <input required type="date" value={formData.tanggalMulai} onChange={e => setFormData({...formData, tanggalMulai: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-black outline-none shadow-inner" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Tanggal Selesai *</label>
                  <input required type="date" value={formData.tanggalSelesai} onChange={e => setFormData({...formData, tanggalSelesai: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-black outline-none shadow-inner" />
               </div>
            </div>
          </div>

          <div className="pt-10 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl flex items-center gap-4 hover:bg-indigo-700 transition-all group">
              <Eye size={22} className="group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-[10px]">Pratinjau & Validasi Data</span>
            </button>
          </div>
        </form>
      </div>
      
      {conflictError && (
        <div className="mt-8 p-6 bg-rose-50 border-2 border-rose-200 rounded-[2rem] flex items-center gap-4 text-rose-600 animate-bounce">
           <AlertTriangle size={24} />
           <p className="text-sm font-black uppercase tracking-widest">{conflictError}</p>
        </div>
      )}
    </div>
  );
};

export default SuratTugasForm;
