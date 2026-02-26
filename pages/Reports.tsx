
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
  X,
  FileSpreadsheet,
  Edit,
  Trash2,
  Save,
  ShieldAlert
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Role, Penugasan } from '../types';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  // Mendapatkan info user login dari localStorage
  const auth = JSON.parse(localStorage.getItem('si-kertas-auth') || '{}');
  const user = auth.user;
  const isAdmin = user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN_TIM;

  const currentMonthStr = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [filterMonth, setFilterMonth] = useState(currentMonthStr);
  const [filterUnit, setFilterUnit] = useState('Seluruh Unit');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [problemOnly, setProblemOnly] = useState(false);

  // State untuk Editing
  const [editingTask, setEditingTask] = useState<Penugasan | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Penugasan>>({});

  const brandingLogo = "https://lh3.googleusercontent.com/d/17vRGmP8EH8YSyeQn4GBxoszYRsYVLE3k";
  const allTasks = dataService.getPenugasanWithStatus().filter(t => {
    if (t.namaPegawai.toLowerCase().includes('santoso')) {
      const viewerName = user?.nama?.toLowerCase() || '';
      return viewerName.includes('santoso') || viewerName.includes('adin');
    }
    return true;
  });
  const allEmployees = dataService.getPegawai().filter(e => {
    if (e.nama.toLowerCase().includes('santoso')) {
      const viewerName = user?.nama?.toLowerCase() || '';
      return viewerName.includes('santoso') || viewerName.includes('adin');
    }
    return true;
  });

  const filteredData = useMemo(() => {
    return allTasks.filter(task => {
      const monthMatches = filterMonth ? task.tanggalMulai.includes(`-${filterMonth}-`) : true;
      const emp = allEmployees.find(e => e.nip === task.nip);
      
      // Izin akses Admin Tim: hanya bisa melihat/kelola unit sendiri jika bukan Super Admin
      let authMatches = true;
      if (user?.role === Role.ADMIN_TIM) {
         authMatches = emp?.unitKerja === user.unitKerja;
      }

      const unitMatches = filterUnit === 'Seluruh Unit' || emp?.unitKerja === filterUnit;
      const searchMatches = 
        task.namaPegawai.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isProblem = task.calculatedStatus === 'Terlambat' || task.calculatedStatus === 'Akan Selesai';
      const statusMatches = problemOnly ? isProblem : true;

      return monthMatches && authMatches && unitMatches && searchMatches && statusMatches;
    });
  }, [allTasks, filterUnit, filterMonth, searchTerm, allEmployees, problemOnly, user]);

  const summary = useMemo(() => {
    return {
      total: filteredData.length,
      aktif: filteredData.filter(d => d.calculatedStatus === 'Bertugas').length,
      selesai: filteredData.filter(d => d.calculatedStatus === 'Selesai').length,
      belumLaporan: filteredData.filter(d => d.laporanStatus === 'Belum Upload').length,
      terlambat: filteredData.filter(d => d.calculatedStatus === 'Terlambat').length,
    };
  }, [filteredData]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const headers = ["Nomor Surat", "Nama Pegawai", "NIP", "Kegiatan", "Lokasi", "Mulai", "Selesai", "Status", "Biaya"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(t => [
        `"${t.nomorSurat}"`,
        `"${t.namaPegawai}"`,
        `'${t.nip}`, 
        `"${t.namaKegiatan}"`,
        `"${t.lokasi}"`,
        t.tanggalMulai,
        t.tanggalSelesai,
        t.calculatedStatus,
        t.biaya
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `REKAP_ST_BPMP_${filterMonth}_${filterUnit.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDetailedReport = (taskId: string) => {
    navigate('/isi-laporan', { state: { autoOpenTaskId: taskId } });
  };

  const handleDeleteTask = (taskId: string, nomorSurat: string) => {
     if (window.confirm(`PERINGATAN: Anda akan menghapus Surat Tugas Nomor ${nomorSurat}. Data laporan terkait juga akan hilang. Lanjutkan?`)) {
        dataService.deletePenugasan(taskId);
        alert('Penugasan berhasil dihapus dari sistem.');
     }
  };

  const openEditModal = (task: Penugasan) => {
     setEditingTask(task);
     setEditFormData({ ...task });
  };

  const handleUpdateTask = (e: React.FormEvent) => {
     e.preventDefault();
     if (editingTask && editFormData) {
        dataService.updatePenugasan(editingTask.id, editFormData);
        setEditingTask(null);
        alert('Data penugasan berhasil diperbarui.');
     }
  };

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
            onClick={() => window.print()}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
           >
             <Printer size={20} /> Cetak
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

         <div className="ml-auto flex gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all"
            >
               <FileSpreadsheet size={14} /> Download Excel (CSV)
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all"
            >
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
                     <div className="flex-1 min-0">
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
                     <div className="bg-slate-50/50 p-12 border-t border-slate-100 space-y-12 animate-slide-down">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
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
                              <button 
                                 onClick={(e) => { e.stopPropagation(); handleViewDetailedReport(task.id); }}
                                 className={`flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${task.laporanStatus === 'Sudah Upload' ? 'bg-indigo-600 text-white hover:bg-black shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                 disabled={task.laporanStatus !== 'Sudah Upload'}
                              >
                                 <FileSearch size={18} /> {task.laporanStatus === 'Sudah Upload' ? 'Lihat Laporan Lengkap' : 'Laporan Belum Ada'}
                              </button>
                           </div>
                        </div>

                        {/* ADMIN ACTIONS AREA */}
                        {isAdmin && (
                           <div className="pt-10 border-t border-slate-200">
                              <div className="flex items-center gap-3 mb-6">
                                 <ShieldAlert size={16} className="text-rose-500" />
                                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Panel Manajemen Admin</h4>
                              </div>
                              <div className="flex flex-wrap gap-4">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                    className="flex items-center gap-3 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                 >
                                    <Edit size={14} /> Edit Detail ST
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id, task.nomorSurat); }}
                                    className="flex items-center gap-3 bg-rose-50 text-rose-600 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                                 >
                                    <Trash2 size={14} /> Hapus Penugasan
                                 </button>
                              </div>
                           </div>
                        )}
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

      {/* EDIT MODAL */}
      {editingTask && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-tighter italic">Edit Parameter Penugasan</h3>
                     <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">ID: {editingTask.id}</p>
                  </div>
                  <button onClick={() => setEditingTask(null)} className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"><X size={24}/></button>
               </div>

               <form onSubmit={handleUpdateTask} className="p-10 overflow-y-auto space-y-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Surat Dinas</label>
                        <input required type="text" value={editFormData.nomorSurat} onChange={e => setEditFormData({...editFormData, nomorSurat: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi Kegiatan</label>
                        <input required type="text" value={editFormData.lokasi} onChange={e => setEditFormData({...editFormData, lokasi: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Kegiatan Utama</label>
                     <input required type="text" value={editFormData.namaKegiatan} onChange={e => setEditFormData({...editFormData, namaKegiatan: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-inner" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Mulai</label>
                        <input required type="date" value={editFormData.tanggalMulai} onChange={e => setEditFormData({...editFormData, tanggalMulai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Selesai</label>
                        <input required type="date" value={editFormData.tanggalSelesai} onChange={e => setEditFormData({...editFormData, tanggalSelesai: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nominal Biaya</label>
                        <input required type="number" value={editFormData.biaya} onChange={e => setEditFormData({...editFormData, biaya: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none shadow-inner" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Uraian Tugas Lapangan</label>
                     <textarea value={editFormData.uraianTugas} onChange={e => setEditFormData({...editFormData, uraianTugas: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium h-24 focus:border-indigo-500 outline-none transition-all shadow-inner"></textarea>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                     <button type="button" onClick={() => setEditingTask(null)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Batal</button>
                     <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3">
                        <Save size={18} /> Simpan Perubahan
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* 4. PRATINJAU CETAK (HANYA MUNCUL SAAT PRINT) */}
      <div className="hidden print:block bg-white p-[20mm] font-serif text-slate-900">
          <div className="flex items-center border-b-[5px] border-double border-slate-900 pb-4 mb-10 text-center">
            <img src={brandingLogo} alt="Logo" className="w-24 h-24 object-contain mr-8 grayscale brightness-0" />
            <div className="flex-1">
              <h2 className="text-[12pt] font-bold uppercase tracking-tight leading-tight mb-1">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
              <h3 className="text-[16pt] font-black uppercase leading-tight mb-2">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
              <p className="text-[10pt] font-sans italic opacity-90 text-center">Rekapitulasi Surat Tugas Pegawai • Tahun Anggaran 2026</p>
            </div>
          </div>
          <h4 className="text-center text-[14pt] font-bold uppercase underline decoration-2 underline-offset-8 mb-10">LAPORAN REKAPITULASI PENUGASAN</h4>
          
          <div className="mb-6 flex justify-between text-[10pt] font-sans">
             <div>
                <p>Filter Unit: <span className="font-bold">{filterUnit}</span></p>
                <p>Periode: <span className="font-bold">Bulan ke-{filterMonth}</span></p>
             </div>
             <div className="text-right">
                <p>Total ST: <span className="font-bold">{filteredData.length} Dokumen</span></p>
                <p>Dicetak pada: <span className="font-bold">{new Date().toLocaleString('id-ID')}</span></p>
             </div>
          </div>

          <table className="w-full border-collapse border-[1.5px] border-slate-900 text-[9pt] font-sans">
            <thead>
              <tr className="bg-slate-100 uppercase font-bold">
                <th className="border border-slate-900 p-2 text-center">No</th>
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
                <p>Mengesahkan,<br/><span className="font-bold">Kasubbag Umum BPMP Maluku Utara</span></p>
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
