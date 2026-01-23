
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  FileSearch,
  Filter,
  Download,
  Landmark,
  X
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Role } from '../types';

const Reports: React.FC = () => {
  // Reset filter bulan ke bulan berjalan (Bukan lagi Mei '05')
  const currentMonthStr = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [filterMonth, setFilterMonth] = useState(currentMonthStr);
  const [filterUnit, setFilterUnit] = useState('Seluruh Unit');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [problemOnly, setProblemOnly] = useState(false);
  
  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";
  const allTasks = dataService.getPenugasanWithStatus();
  const allEmployees = dataService.getPegawai();

  const filteredData = useMemo(() => {
    return allTasks.filter(task => {
      const monthMatches = filterMonth ? task.tanggalMulai.includes(`-${filterMonth}-`) : true;
      const emp = allEmployees.find(e => e.nip === task.nip);
      const unitMatches = filterUnit === 'Seluruh Unit' || emp?.unitKerja === filterUnit;
      const searchMatches = 
        task.namaPegawai.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isProblem = task.calculatedStatus === 'Terlambat' || task.calculatedStatus === 'Akan Selesai';
      const statusMatches = problemOnly ? isProblem : true;

      return monthMatches && unitMatches && searchMatches && statusMatches;
    });
  }, [allTasks, filterUnit, filterMonth, searchTerm, allEmployees, problemOnly]);

  const summary = useMemo(() => {
    return {
      total: filteredData.length,
      aktif: filteredData.filter(d => d.calculatedStatus === 'Bertugas').length,
      selesai: filteredData.filter(d => d.calculatedStatus === 'Selesai').length,
      belumLaporan: filteredData.filter(d => d.laporanStatus === 'Belum Upload').length,
      terlambat: filteredData.filter(d => d.calculatedStatus === 'Terlambat').length,
    };
  }, [filteredData]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto animate-fade-in">
      {/* 1. HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">REKAP SURAT TUGAS PEGAWAI</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 italic opacity-70">Monitoring penugasan dan pelaporan pegawai BPMP secara real-time</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="flex-1 md:w-72 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Cari NIP, Nama, atau Kegiatan..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
           </div>
           <button 
            onClick={handlePrint}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
           >
             <Printer size={20} />
           </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex flex-wrap gap-4 no-print items-center">
         <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
         </div>
         <select 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
         >
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
         </select>

         <select 
            value={filterUnit} 
            onChange={e => setFilterUnit(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
         >
            <option>Seluruh Unit</option>
            {Array.from(new Set(allEmployees.map(e => e.unitKerja))).map(u => <option key={u}>{u}</option>)}
         </select>

         <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>

         <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setProblemOnly(false)}
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!problemOnly ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Semua ST
            </button>
            <button 
              onClick={() => setProblemOnly(true)}
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${problemOnly ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              ST Bermasalah
            </button>
         </div>

         <div className="ml-auto">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all">
               <Download size={14} /> Ekspor PDF
            </button>
         </div>
      </div>

      {/* 2. SUMMARY STRIP */}
      <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center no-print divide-x divide-slate-100 overflow-hidden">
         {[
           { label: 'Total ST', val: summary.total, color: 'slate' },
           { label: 'ST Aktif', val: summary.aktif, color: 'emerald' },
           { label: 'ST Selesai', val: summary.selesai, color: 'blue' },
           { label: 'Belum Laporan', val: summary.belumLaporan, color: 'amber' },
           { label: 'Terlambat', val: summary.terlambat, color: 'rose' },
         ].map((s, i) => (
           <div key={i} className="flex-1 py-6 px-10 text-center group hover:bg-slate-50 transition-colors">
              <p className={`text-2xl font-black text-${s.color}-600 tracking-tighter leading-none`}>{s.val}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">{s.label}</p>
           </div>
         ))}
      </div>

      {/* 3. DAFTAR REKAP SURAT TUGAS */}
      <div className="space-y-4 no-print">
         {filteredData.length > 0 ? filteredData.map((task) => {
            const isExpanded = expandedId === task.id;
            const emp = allEmployees.find(e => e.nip === task.nip);
            
            return (
               <div 
                key={task.id} 
                className={`bg-white rounded-[3rem] border transition-all duration-300 overflow-hidden cursor-pointer group ${isExpanded ? 'border-indigo-200 shadow-2xl scale-[1.01]' : 'border-slate-100 shadow-sm hover:border-indigo-100'}`}
                onClick={() => setExpandedId(isExpanded ? null : task.id)}
               >
                  <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-10">
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`w-2 h-2 rounded-full bg-${task.calculatedColor}-500`}></span>
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{task.nomorSurat}</p>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                           {task.namaKegiatan}
                        </h3>
                     </div>

                     <div className="flex-[1.2] flex items-center gap-12 text-left">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl">
                              <User size={20} />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-sm leading-none uppercase tracking-tight">{task.namaPegawai}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1.5">{emp?.unitKerja}</p>
                           </div>
                        </div>
                        <div className="hidden xl:block">
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                              <Clock size={12} className="text-indigo-500" /> {task.tanggalMulai} s.d {task.tanggalSelesai}
                           </div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic mt-1">Periode Tugas</p>
                        </div>
                     </div>

                     <div className="flex-1 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-8">
                        <div className="text-right">
                           <p className="text-sm font-black text-slate-900 tracking-tighter leading-none">Rp {task.biaya.toLocaleString('id-ID')}</p>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1 inline-block ${task.jenisPenugasan === 'Luring' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                              {task.jenisPenugasan}
                           </span>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-${task.calculatedColor}-50 text-${task.calculatedColor}-600 border border-${task.calculatedColor}-100 shadow-sm`}>
                              {task.calculatedStatus === 'Terlambat' && <AlertTriangle size={12} />}
                              {task.calculatedStatus === 'Selesai' && <CheckCircle size={12} />}
                              {task.calculatedStatus}
                           </div>
                           <p className={`text-[8px] font-black mt-1.5 uppercase italic text-${task.calculatedColor}-400 flex items-center gap-1`}>
                              {task.calculatedContext}
                           </p>
                        </div>
                     </div>
                  </div>

                  {isExpanded && (
                     <div className="bg-slate-50/50 p-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-16 animate-slide-down">
                        <div className="space-y-8">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3">Informasi Pelaksanaan</h4>
                           <div className="space-y-6">
                              <div className="flex items-start gap-4">
                                 <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><MapPin size={16} /></div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Lokasi Kegiatan</p>
                                    <p className="text-sm font-bold text-slate-700">{task.lokasi || 'Kab/Kota di Maluku Utara'}</p>
                                 </div>
                              </div>
                              <div className="flex items-start gap-4">
                                 <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><User size={16} /></div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Penandatangan ST</p>
                                    <p className="text-sm font-bold text-slate-700">{task.penandatangan || 'Kepala BPMP Maluku Utara'}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3">Status Administrasi</h4>
                           <div className="space-y-6">
                              <div>
                                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Sumber Pembiayaan</p>
                                 <div className="flex items-center gap-2">
                                    <Landmark size={14} className="text-slate-400" />
                                    <p className="text-sm font-bold text-slate-700 uppercase">{task.sumberBiaya} TA 2026</p>
                                 </div>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Dokumen Laporan</p>
                                 <p className={`text-xs font-bold ${task.laporanStatus === 'Sudah Upload' ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-2`}>
                                    {task.laporanStatus === 'Sudah Upload' ? <CheckCircle size={14}/> : <X size={14}/>}
                                    {task.laporanStatus === 'Sudah Upload' ? 'Dokumen Terverifikasi Digital' : 'Belum Ada Unggahan Laporan'}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col justify-end gap-3">
                           <button className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
                              <Eye size={18} /> Lihat Surat Tugas
                           </button>
                           <button className={`flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${task.laporanStatus === 'Sudah Upload' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                              <FileSearch size={18} /> Lihat Laporan Hasil
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            );
         }) : (
            <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
               <div className="p-12 bg-slate-50 rounded-[3rem] mb-8">
                  <FileSearch size={80} className="text-slate-200" />
               </div>
               <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Tidak ada data penugasan</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3 italic text-center">Silakan ubah parameter filter atau pencarian Anda</p>
            </div>
         )}
      </div>

      {/* 4. PRATINJAU CETAK */}
      <div className="hidden print:block bg-white p-[20mm] font-serif text-slate-900">
          <div className="flex items-center border-b-[5px] border-double border-slate-900 pb-4 mb-10 text-center">
            <img src={brandingLogo} alt="Logo" className="w-24 h-24 object-contain mr-8 grayscale brightness-0" />
            <div className="flex-1">
              <h2 className="text-[12pt] font-bold uppercase tracking-tight leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
              <h3 className="text-[16pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
              <p className="text-[10pt] font-sans italic opacity-90">Rekapitulasi Surat Tugas Pegawai • Tahun Anggaran 2026</p>
            </div>
          </div>
          <h4 className="text-center text-[14pt] font-bold uppercase underline decoration-2 underline-offset-8 mb-10">LAPORAN REKAPITULASI PENUGASAN</h4>
          <table className="w-full border-collapse border-[1.5px] border-slate-900 text-[9pt] font-sans">
            <thead>
              <tr className="bg-slate-100 uppercase font-bold">
                <th className="border border-slate-900 p-2">No</th>
                <th className="border border-slate-900 p-2">Nomor ST</th>
                <th className="border border-slate-900 p-2">Nama Pegawai</th>
                <th className="border border-slate-900 p-2">Kegiatan</th>
                <th className="border border-slate-900 p-2">Periode</th>
                <th className="border border-slate-900 p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((t, i) => (
                <tr key={t.id}>
                  <td className="border border-slate-900 p-2 text-center">{i + 1}</td>
                  <td className="border border-slate-900 p-2 font-mono">{t.nomorSurat}</td>
                  <td className="border border-slate-900 p-2 font-bold uppercase">{t.namaPegawai}</td>
                  <td className="border border-slate-900 p-2 text-[8pt]">{t.namaKegiatan}</td>
                  <td className="border border-slate-900 p-2 whitespace-nowrap">{t.tanggalMulai} - {t.tanggalSelesai}</td>
                  <td className="border border-slate-900 p-2 text-center uppercase font-bold">{t.calculatedStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-24 flex justify-end">
             <div className="text-center w-80 space-y-24">
                <p>Mengesahkan,<br/><span className="font-bold">Kasubbag Umum BPMP Malut</span></p>
                <div className="space-y-1">
                   <p className="font-black underline uppercase">Samsul Arifin, M.Pd.</p>
                   <p className="text-[9pt]">NIP. 19750101XXXXXXXXXX</p>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Reports;
