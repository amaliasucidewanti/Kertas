
import React, { useState, useMemo } from 'react';
import { Role, Pegawai, ProgramKegiatan } from '../types';
import { dataService } from '../services/dataService';
import { 
  Plus, 
  Search, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Save, 
  Trash2, 
  Edit, 
  Link as LinkIcon, 
  Map as MapIcon,
  Info,
  RefreshCw,
  Database
} from 'lucide-react';

const ProgramKegiatan2026: React.FC<{ user: Pegawai }> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<ProgramKegiatan | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(dataService.getLastSyncProgram());

  const allPrograms = dataService.getProgramKegiatan();

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const success = await dataService.syncProgram2026();
      if (success) {
        setLastSync(dataService.getLastSyncProgram());
        alert("Sinkronisasi Program 2026 Berhasil!");
      }
    } catch (e) {
      alert("Gagal sinkronisasi: " + (e instanceof Error ? e.message : "Cek koneksi Spreadsheet"));
    } finally {
      setIsSyncing(false);
    }
  };

  const canUpload = (program: ProgramKegiatan) => {
    if (isSuperAdmin) return true;
    if (user.role === Role.ADMIN_TIM && user.unitKerja === program.timKerja) return true;
    return user.nip === program.pelaksana;
  };

  const filtered = useMemo(() => {
    return allPrograms.filter(p => {
      const matchesSearch = p.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = filterTeam === 'Semua' || p.timKerja === filterTeam;
      const matchesStatus = filterStatus === 'Semua' || p.status === filterStatus;
      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [allPrograms, searchTerm, filterTeam, filterStatus]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newProgram = {
      namaKegiatan: target.namaKegiatan.value,
      timKerja: target.timKerja.value,
      pelaksana: target.pelaksana.value
    };
    dataService.addProgramKegiatan(newProgram);
    setShowAddModal(false);
    alert('Program Kegiatan Berhasil Ditambahkan!');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProgram) {
      dataService.updateProgramKegiatan(editingProgram.id, editingProgram);
      setEditingProgram(null);
      alert('Program Kegiatan Berhasil Diperbarui!');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus program kegiatan ini?')) {
      dataService.deleteProgramKegiatan(id);
      alert('Program Kegiatan Terhapus.');
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (showUploadModal) {
      const target = e.target as any;
      dataService.uploadProgramReport(showUploadModal, target.fileLink.value, target.description.value);
      setShowUploadModal(null);
      alert('Laporan Berhasil Diunggah!');
    }
  };

  const teams = ['PAUD', 'SD', 'SMP', 'SMA', 'Kasubbag Umum', 'Lainnya'];

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto animate-fade-in">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><MapIcon size={240}/></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
                Roadmap Strategis TA 2026
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Roadmap Program 2026</h1>
              <p className="text-indigo-300 font-bold text-sm mt-4 italic opacity-80">Data real-time sinkron dengan Spreadsheet Master BPMP.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-4 text-center">
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 ${isSyncing ? 'opacity-50' : ''}`}
                >
                  <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Sinkronisasi...' : 'Sinkron Program 2026'}
                </button>
                {lastSync && (
                  <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <Database size={10} /> Sync Terakhir: {new Date(lastSync).toLocaleString('id-ID')}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 no-print">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Program</p>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">{allPrograms.length}</p>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Sudah Lapor</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{allPrograms.filter(p => p.status === 'Sudah Dilaksanakan').length}</p>
        </div>
        <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">Menunggu Laporan</p>
          <p className="text-4xl font-black text-rose-600 tracking-tighter">{allPrograms.filter(p => p.status === 'Belum Dilaksanakan').length}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-center text-white flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-black transition-all" onClick={() => isSuperAdmin ? setShowAddModal(true) : alert('Manual input hanya untuk Super Admin')}>
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500 text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-widest">Input Manual</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 no-print">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" placeholder="Cari Nama Kegiatan..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="bg-slate-50 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-transparent outline-none">
          <option value="Semua">Semua Tim</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-transparent outline-none">
          <option value="Semua">Semua Status</option>
          <option value="Belum Dilaksanakan">Belum Lapor</option>
          <option value="Sudah Dilaksanakan">Sudah Lapor</option>
        </select>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                <th className="px-10 py-6">Nama Kegiatan</th>
                <th className="px-10 py-6 text-center">Penanggung Jawab</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.length > 0 ? filtered.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-800 uppercase tracking-tight mb-1">{p.namaKegiatan}</p>
                    <div className="flex items-center gap-3">
                      {p.id.startsWith('SYNC-') && (
                        <span className="bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Auto Sync</span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {p.timKerja}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.status === 'Sudah Dilaksanakan' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {p.status === 'Sudah Dilaksanakan' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {p.status === 'Sudah Dilaksanakan' ? 'Sudah Lapor' : 'Belum Lapor'}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      {p.status === 'Sudah Dilaksanakan' && (
                        <a href={p.laporanFileLink} target="_blank" rel="noopener noreferrer" className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm">
                          <LinkIcon size={18} />
                        </a>
                      )}
                      {canUpload(p) && (
                        <button onClick={() => setShowUploadModal(p.id)} className={`p-3 rounded-2xl transition-all shadow-sm ${
                          p.status === 'Sudah Dilaksanakan' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-indigo-600 text-white hover:bg-slate-900'
                        }`}>
                          <UploadCloud size={18} />
                        </button>
                      )}
                      {isSuperAdmin && (
                        <>
                          <button onClick={() => setEditingProgram(p)} className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-2xl transition-all shadow-sm">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-3 text-rose-400 hover:text-rose-600 bg-rose-50 rounded-2xl transition-all shadow-sm">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center opacity-30">
                    <div className="flex flex-col items-center gap-4">
                      <MapIcon size={64} />
                      <p className="text-[10px] font-black uppercase tracking-widest italic">Belum ada program yang tersinkronasi</p>
                      <button onClick={handleSync} className="text-[9px] font-black text-indigo-600 uppercase underline">Sinkron Sekarang</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Input Manual Program</h3>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 italic">Tahun Anggaran 2026</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleAdd} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan *</label>
                <input name="namaKegiatan" required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:border-indigo-600" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tim Kerja / PJ</label>
                  <select name="timKerja" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border border-slate-100 outline-none">
                    {teams.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP Pelaksana (Opsional)</label>
                  <input name="pelaksana" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border border-slate-100 outline-none" />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button type="submit" className="bg-indigo-600 text-white px-12 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                  <Save size={18} /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-10 bg-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Unggah Laporan Program</h3>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 italic">Roadmap Akuntabilitas</p>
              </div>
              <button onClick={() => setShowUploadModal(null)} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpload} className="p-10 space-y-6">
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                <Info size={20} className="text-amber-500 shrink-0 mt-1" />
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight italic">
                  Status program akan otomatis berubah menjadi "Sudah Lapor" setelah link laporan disematkan.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Laporan (Drive/PDF) *</label>
                <input name="fileLink" required type="url" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border border-slate-100 outline-none" placeholder="https://drive.google.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Singkat</label>
                <textarea name="description" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-medium h-24 border border-slate-100 outline-none" placeholder="Uraian singkat realisasi..."></textarea>
              </div>
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="submit" className="bg-emerald-600 text-white px-12 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                  <UploadCloud size={18} /> Sematkan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramKegiatan2026;
