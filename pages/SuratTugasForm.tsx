
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pegawai } from '../types';
import { Eye, Save, ChevronLeft, Printer, FileText, Download } from 'lucide-react';

const SuratTugasForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedEmp = location.state?.employee as Pegawai;

  const [formData, setFormData] = useState({
    namaPegawai: selectedEmp?.nama || '',
    nip: selectedEmp?.nip || '',
    jabatan: selectedEmp?.jabatan || '',
    nomorSurat: '',
    dasarPenugasan: '',
    uraianTugas: '',
    lokasi: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    penandatangan: '',
    biaya: 0,
    jenisPenugasan: 'Perjalanan Dinas'
  });

  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (selectedEmp) {
      setFormData(prev => ({
        ...prev,
        namaPegawai: selectedEmp.nama,
        nip: selectedEmp.nip,
        jabatan: selectedEmp.jabatan
      }));
    }
  }, [selectedEmp]);

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi sederhana sebelum preview
    if (!formData.nomorSurat || !formData.uraianTugas) {
      alert('Mohon lengkapi Nomor Surat dan Uraian Tugas terlebih dahulu.');
      return;
    }
    setIsPreview(true);
    window.scrollTo(0, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinalSave = () => {
    alert('Surat Tugas Berhasil Disimpan & Notifikasi Terkirim ke Pegawai!');
    navigate('/');
  };

  if (isPreview) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-4 no-print bg-slate-50/90 backdrop-blur-sm sticky top-0 py-4 z-10 border-b">
          <button 
            onClick={() => setIsPreview(false)} 
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold transition-colors"
          >
            <ChevronLeft size={20} /> Kembali ke Pengeditan
          </button>
          <div className="flex gap-3">
             <button 
               onClick={handlePrint}
               className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border shadow-sm hover:bg-slate-50"
             >
               <Printer size={16} /> Cetak Sekarang
             </button>
             <button 
               onClick={handleFinalSave} 
               className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700"
             >
               <Save size={16} /> Simpan & Selesai
             </button>
          </div>
        </div>

        {/* OFFICIAL PDF VIEW (A4 SIMULATION) */}
        <div className="bg-white p-16 shadow-2xl rounded-sm border border-slate-200 min-h-[1123px] text-slate-900 font-serif mx-auto print-container" style={{ width: '210mm' }}>
          {/* Header (KOP) */}
          <div className="flex items-start border-b-[3px] border-slate-900 pb-2 mb-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Logo_Kemdikbud.png" alt="Kemdikbud" className="w-24 h-24 object-contain mr-6" />
            <div className="text-center flex-1">
              <h2 className="text-lg font-bold uppercase leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
              <h3 className="text-xl font-extrabold uppercase leading-none mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
              <p className="text-[10px] leading-tight font-sans italic opacity-80">
                Jl. Pendidikan No. 123, Kompleks Perkantoran Pemerintah, Kota Bahagia 12345<br/>
                Laman: bpmp.kemdikbud.go.id | Pos Elektronik: bpmp@kemdikbud.go.id
              </p>
            </div>
          </div>

          <div className="text-center space-y-1 mb-10">
            <h4 className="text-lg font-bold underline tracking-widest">SURAT TUGAS</h4>
            <p className="text-sm font-sans">Nomor: {formData.nomorSurat}</p>
          </div>

          <div className="space-y-6 text-[15px] leading-relaxed text-justify px-4">
            <div className="flex">
              <span className="font-bold w-24 flex-shrink-0">Dasar :</span>
              <div className="flex-1 space-y-1">
                <p>1. {formData.dasarPenugasan || 'Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor ... Tahun ...'}</p>
                <p>2. Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Penjaminan Mutu Pendidikan Tahun Anggaran 2024.</p>
              </div>
            </div>
            
            <p className="text-center font-bold tracking-[0.2em] my-10 font-sans uppercase">MEMERINTAHKAN:</p>

            <div className="pl-12 space-y-3">
              <div className="flex"><span className="w-28 flex-shrink-0">Kepada</span><span className="mr-3">:</span></div>
              <div className="flex ml-8 font-bold"><span className="w-24 flex-shrink-0">Nama</span>: {formData.namaPegawai}</div>
              <div className="flex ml-8"><span className="w-24 flex-shrink-0">NIP</span>: {formData.nip}</div>
              <div className="flex ml-8"><span className="w-24 flex-shrink-0">Jabatan</span>: {formData.jabatan}</div>
            </div>

            <div className="flex mt-8 pt-4 border-t border-slate-100">
              <span className="font-bold w-24 flex-shrink-0">Untuk :</span>
              <div className="flex-1 space-y-4">
                <p>{formData.uraianTugas}</p>
                <p>Kegiatan ini akan dilaksanakan di <span className="font-bold">{formData.lokasi}</span> mulai tanggal <span className="font-bold">{formData.tanggalMulai}</span> sampai dengan <span className="font-bold">{formData.tanggalSelesai}</span>.</p>
                <p>Biaya yang timbul dibebankan pada anggaran DIPA BPMP Tahun 2024 sesuai dengan ketentuan perundang-undangan yang berlaku.</p>
                <p>Setelah melaksanakan tugas, wajib menyampaikan laporan pelaksanaan tugas secara tertulis paling lambat 5 (lima) hari kerja setelah masa penugasan berakhir.</p>
              </div>
            </div>
          </div>

          <div className="mt-28 flex justify-end px-4">
            <div className="text-center w-80">
              <p className="mb-1">Ditetapkan di Bahagia</p>
              <p className="mb-20">pada tanggal {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              
              <p className="font-bold underline leading-none uppercase text-md">{formData.penandatangan || 'KEPALA BALAI'}</p>
              <p className="text-xs font-sans mt-1">NIP. 197501011998011001</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 no-print">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <FileText size={20} />
          </div>
          Penerbitan Surat Tugas
        </h1>
        <p className="text-slate-500 mt-1">Input data penugasan untuk menghasilkan dokumen resmi Si-Kertas.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
        <form onSubmit={handlePreview} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Identitas Pegawai Terpilih
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap</label>
                <input readOnly value={formData.namaPegawai} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">NIP / Identitas</label>
                <input readOnly value={formData.nip} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jabatan Struktural</label>
                <input readOnly value={formData.jabatan} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-500 outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Nomor Surat</label>
            <input required type="text" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Contoh: 0451/C7.4/ST/2024" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Kategori Tugas</label>
            <select value={formData.jenisPenugasan} onChange={e => setFormData({...formData, jenisPenugasan: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Perjalanan Dinas</option>
              <option>Diklat / Workshop</option>
              <option>Rapat Koordinasi</option>
              <option>Monitoring & Evaluasi</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Dasar Penugasan</label>
            <textarea value={formData.dasarPenugasan} onChange={e => setFormData({...formData, dasarPenugasan: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm h-20 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Sebutkan dasar hukum atau surat permintaan tugas..."></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Maksud / Uraian Tugas</label>
            <textarea required value={formData.uraianTugas} onChange={e => setFormData({...formData, uraianTugas: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm h-28 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tuliskan secara detail apa yang harus dikerjakan..."></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Lokasi Tujuan</label>
            <input required type="text" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Kabupaten Maros" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Alokasi Biaya (Rp)</label>
            <input required type="number" value={formData.biaya} onChange={e => setFormData({...formData, biaya: parseInt(e.target.value) || 0})} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Mulai</label>
              <input required type="date" value={formData.tanggalMulai} onChange={e => setFormData({...formData, tanggalMulai: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Selesai</label>
              <input required type="date" value={formData.tanggalSelesai} onChange={e => setFormData({...formData, tanggalSelesai: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Penandatangan</label>
            <input required type="text" value={formData.penandatangan} onChange={e => setFormData({...formData, penandatangan: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nama Lengkap & Gelar Pejabat" />
          </div>

          <div className="md:col-span-2 pt-6">
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              <Eye size={20} /> Lihat Pratinjau Dokumen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuratTugasForm;
