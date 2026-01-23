
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pegawai, Penugasan } from '../types';
import { Eye, Save, ChevronLeft, Printer, FileText, AlertTriangle, ShieldCheck, Landmark } from 'lucide-react';
import { dataService } from '../services/dataService';

const SuratTugasForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedEmp = location.state?.employee as Pegawai;

  const [formData, setFormData] = useState({
    namaPegawai: selectedEmp?.nama || '',
    nip: selectedEmp?.nip || '',
    jabatan: selectedEmp?.jabatan || '',
    nomorSurat: '',
    namaKegiatan: '',
    uraianTugas: '',
    lokasi: '',
    tanggalMulai: '2026-05-01',
    tanggalSelesai: '2026-05-03',
    jenisPenugasan: 'Luring' as 'Luring' | 'Daring',
    sumberBiaya: 'BPMP' as 'BPMP' | 'Penyelenggara',
    penandatangan: '',
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
      setConflictError(result.conflict ? result.message || 'Bentrok Jadwal!' : null);
      return result.conflict;
    }
    return false;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
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
    alert('Surat Tugas Berhasil Diterbitkan dan Tersimpan di Database Pusat TA 2026!');
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

        {/* OFFICIAL DOKUMEN VIEW (A4 SIMULATION) */}
        <div className="bg-white p-[25mm] shadow-2xl relative border border-slate-100 print-container mx-auto overflow-hidden text-slate-900 font-serif leading-relaxed" style={{ width: '210mm', minHeight: '297mm' }}>
           {/* DIGITAL WATERMARK */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none rotate-[-45deg] z-0">
              <span className="text-[140px] font-black tracking-tighter whitespace-nowrap">BPMP MALUT</span>
           </div>
           
           <div className="relative z-10">
             <div className="border-b-[4px] border-slate-900 pb-4 mb-10 flex items-center text-center">
                <img src="https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k" className="w-24 h-24 mr-8 grayscale brightness-0" />
                <div className="flex-1">
                  <h2 className="text-[14pt] font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
                  <h3 className="text-[16pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
                  <p className="text-[10pt] font-sans italic opacity-90">
                    Jl. Pendidikan No. 123, Kompleks Perkantoran Pemerintah, Ternate<br/>
                    Laman: bpmp.kemdikbud.go.id | Pos Elektronik: bpmp@kemdikbud.go.id
                  </p>
                </div>
             </div>

             <div className="text-center mb-12 space-y-1">
                <h4 className="text-[14pt] font-black underline underline-offset-4 tracking-[0.2em] uppercase">SURAT TUGAS</h4>
                <p className="text-[11pt] font-sans font-bold">Nomor: {formData.nomorSurat}</p>
             </div>

             <div className="space-y-6 text-[12pt] text-justify font-serif">
                <p>Kepala Balai Penjaminan Mutu Pendidikan Maluku Utara dengan ini memberikan tugas kepada:</p>
                <div className="pl-12 space-y-2 font-sans">
                   <div className="grid grid-cols-4 gap-4">
                      <div className="font-semibold uppercase text-xs text-slate-400">Nama</div>
                      <div className="col-span-3 font-black">: {formData.namaPegawai}</div>
                   </div>
                   <div className="grid grid-cols-4 gap-4">
                      <div className="font-semibold uppercase text-xs text-slate-400">NIP</div>
                      <div className="col-span-3">: {formData.nip}</div>
                   </div>
                   <div className="grid grid-cols-4 gap-4">
                      <div className="font-semibold uppercase text-xs text-slate-400">Jabatan</div>
                      <div className="col-span-3">: {formData.jabatan}</div>
                   </div>
                </div>

                <div className="mt-8 space-y-4">
                  <p>Untuk melaksanakan tugas dalam rangka kegiatan <span className="font-bold">"{formData.namaKegiatan}"</span> yang akan dilaksanakan secara <span className="font-bold uppercase tracking-widest">{formData.jenisPenugasan}</span> dengan uraian sebagai berikut:</p>
                  <p className="italic border-l-4 border-slate-100 pl-4 py-2 bg-slate-50/30 text-[11pt]">"{formData.uraianTugas}"</p>
                  <p>Kegiatan tersebut dilaksanakan di <span className="font-bold underline decoration-1">{formData.lokasi}</span> selama {Math.ceil((new Date(formData.tanggalSelesai).getTime() - new Date(formData.tanggalMulai).getTime()) / (1000 * 3600 * 24)) + 1} hari kerja, mulai tanggal <span className="font-bold">{formData.tanggalMulai}</span> s.d. <span className="font-bold">{formData.tanggalSelesai}</span>.</p>
                  <p>Segala biaya yang timbul akibat diterbitkannya surat tugas ini dibebankan pada DIPA BPMP Tahun Anggaran 2026 ({formData.sumberBiaya}).</p>
                  <p>Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
                </div>
             </div>

             <div className="mt-24 flex justify-end font-sans">
                <div className="text-center w-80 space-y-20">
                   <div>
                      <p className="mb-1">Ditetapkan di Ternate,</p>
                      <p>Pada tanggal {new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jayapura', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="font-black underline underline-offset-4 uppercase text-[12pt]">{formData.penandatangan || 'KEPALA BALAI'}</p>
                      <p className="text-[10pt] font-bold">NIP. 19750101XXXXXXXXX</p>
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-20 flex justify-between items-end opacity-20 no-print grayscale">
                <div className="text-[8pt] font-sans">
                   <p className="font-black italic">Dokumen ini merupakan draf digital sistem SI-KERTAS TA 2026</p>
                   <p>Verifikasi dokumen dapat dilakukan melalui portal internal BPMP.</p>
                </div>
                <div className="w-20 h-20 border-2 border-slate-900 flex items-center justify-center font-bold text-[8pt] text-center p-2 rotate-6">
                   ARSIP QR
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Penerbitan Penugasan Baru (TA 2026)</h1>
          <p className="text-slate-500 font-medium">Input parameter penugasan dengan validasi pencegahan bentrok otomatis.</p>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Landmark size={240} />
        </div>
        
        <form onSubmit={handlePreview} className="space-y-12 relative z-10">
          {/* Header Identitas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-indigo-500"/>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Pelaksana Tugas</h3>
               </div>
               <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Pegawai</label>
                    <input readOnly value={formData.namaPegawai} className="w-full bg-white px-4 py-3 rounded-xl text-sm font-black text-slate-800 shadow-sm outline-none border border-transparent" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP (Identitas)</label>
                    <input readOnly value={formData.nip} className="w-full bg-white px-4 py-3 rounded-xl text-sm text-slate-500 font-bold shadow-sm outline-none border border-transparent" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <Landmark size={18} className="text-amber-500"/>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Konfigurasi Biaya & Jenis</h3>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Penugasan</label>
                    <select 
                      value={formData.jenisPenugasan} 
                      onChange={e => setFormData({...formData, jenisPenugasan: e.target.value as any})}
                      className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm font-black text-indigo-700 outline-none border border-slate-200 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="Luring">Luring (Tatap Muka)</option>
                      <option value="Daring">Daring (Virtual/Online)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sumber Pembiayaan</label>
                    <select 
                      value={formData.sumberBiaya} 
                      onChange={e => setFormData({...formData, sumberBiaya: e.target.value as any})}
                      className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm font-black text-slate-600 outline-none border border-slate-200 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="BPMP">DIPA BPMP Malut</option>
                      <option value="Penyelenggara">Instansi Penyelenggara</option>
                      <option value="Lainnya">Sumber Lainnya</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>

          {/* Form Utama */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Nomor Surat Dinas *</label>
                <input required type="text" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 1234/C7.4/ST/2026" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Lokasi Tujuan *</label>
                <input required type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Kabupaten Halmahera Barat" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Nama Kegiatan Utama *</label>
              <input required type="text" value={formData.namaKegiatan} onChange={e => setFormData({...formData, namaKegiatan: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="Judul Workshop / Rapat / Koordinasi" />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Uraian Tugas Spesifik *</label>
              <textarea required value={formData.uraianTugas} onChange={e => setFormData({...formData, uraianTugas: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-medium h-28 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="Deskripsikan rincian pekerjaan yang akan dilakukan di lapangan..."></textarea>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Tanggal Mulai *</label>
                  <input required type="date" value={formData.tanggalMulai} onChange={e => setFormData({...formData, tanggalMulai: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Tanggal Selesai *</label>
                  <input required type="date" value={formData.tanggalSelesai} onChange={e => setFormData({...formData, tanggalSelesai: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Pejabat Penandatangan *</label>
                  <input required type="text" value={formData.penandatangan} onChange={e => setFormData({...formData, penandatangan: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10" placeholder="Nama & Gelar Pimpinan" />
               </div>
            </div>
          </div>

          {conflictError && (
            <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] text-rose-600 flex items-center gap-6 animate-shake shadow-lg shadow-rose-100/50">
               <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg">
                  <AlertTriangle size={28}/>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">SMART CONFLICT DETECTION</p>
                  <p className="text-sm font-bold italic leading-relaxed">"{conflictError}"</p>
                  <p className="text-[10px] text-rose-400 mt-2 font-medium">Sistem memblokir penugasan Luring ganda untuk efisiensi SDM.</p>
               </div>
            </div>
          )}

          <div className="pt-10 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              className={`bg-indigo-600 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 group hover:scale-105 ${conflictError ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              disabled={!!conflictError}
            >
              <Eye size={22} className="group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-[10px]">Lihat Pratinjau Dokumen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuratTugasForm;
