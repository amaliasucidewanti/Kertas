
import React, { useState } from 'react';
import { Pegawai, Role } from '../types';
import { dataService } from '../services/dataService';
import { RefreshCw, Search, ShieldCheck, History, AlertCircle, UserPlus, X, Save } from 'lucide-react';

const ManageAccounts: React.FC<{ user: Pegawai }> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState(dataService.getPegawai());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPegawai, setNewPegawai] = useState({
    nama: '',
    nip: '',
    jabatan: '',
    unitKerja: user.role === Role.ADMIN_TIM ? user.unitKerja : '',
    role: Role.PEGAWAI
  });

  const handleReset = (emp: Pegawai) => {
    if (user.role === Role.ADMIN_TIM && emp.unitKerja !== user.unitKerja) {
      alert('Anda tidak memiliki izin mereset password di luar unit kerja Anda.');
      return;
    }

    if (window.confirm(`Reset password untuk ${emp.nama} (NIP: ${emp.nip}) menjadi "12345"?`)) {
      dataService.resetPassword(emp.id, user.nama);
      setEmployees([...dataService.getPegawai()]);
      alert('Password berhasil direset ke 12345.');
    }
  };

  const handleAddPegawai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPegawai.nama || !newPegawai.nip || !newPegawai.jabatan || !newPegawai.unitKerja) {
      alert('Mohon lengkapi semua data.');
      return;
    }
    dataService.addPegawai(newPegawai);
    setEmployees([...dataService.getPegawai()]);
    setShowAddModal(false);
    setNewPegawai({
      nama: '',
      nip: '',
      jabatan: '',
      unitKerja: user.role === Role.ADMIN_TIM ? user.unitKerja : '',
      role: Role.PEGAWAI
    });
    alert('Akun Pegawai baru berhasil dibuat!');
  };

  const filtered = employees.filter(e => {
    const matchesSearch = e.nama.toLowerCase().includes(search.toLowerCase()) || e.nip.includes(search);
    let matchesAuth = true;
    if (user.role === Role.ADMIN_TIM) {
      matchesAuth = e.unitKerja === user.unitKerja;
    }
    return matchesSearch && matchesAuth;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Keamanan & Akses Akun</h1>
          <p className="text-slate-500 font-medium text-sm italic">
            {user.role === Role.SUPER_ADMIN 
              ? "Kendali penuh seluruh akun pegawai BPMP Maluku Utara." 
              : `Manajemen akun khusus anggota Tim Kerja: ${user.unitKerja}.`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <UserPlus size={18} /> Tambah Akun Pegawai
          </button>
          <div className="relative flex-1 sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Cari NIP atau Nama..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <th className="px-10 py-6">Pegawai & Jabatan</th>
                <th className="px-10 py-6">Unit Kerja</th>
                <th className="px-10 py-6">Status Akun</th>
                <th className="px-10 py-6">Riwayat Reset Terakhir</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.length > 0 ? filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{emp.nama}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">NIP: {emp.nip} • {emp.jabatan}</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{emp.unitKerja}</span>
                  </td>
                  <td className="px-10 py-6">
                    {emp.passwordChangeRequired ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100">
                        <AlertCircle size={12} /> Wajib Ganti
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck size={12} /> Terverifikasi
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    {emp.lastPasswordResetBy ? (
                      <div className="flex items-start gap-2 text-[10px] text-slate-500 font-bold">
                        <History size={14} className="mt-0.5 text-slate-300" />
                        <div>
                          <p className="uppercase tracking-tighter">Oleh: {emp.lastPasswordResetBy}</p>
                          <p className="text-[8px] italic opacity-60">{emp.lastPasswordResetAt}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic text-[10px] uppercase tracking-widest font-black">Murni (User)</span>
                    )}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleReset(emp)}
                      className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95"
                    >
                      <RefreshCw size={14} /> Reset Password
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} className="px-10 py-32 text-center text-slate-300 font-black italic uppercase tracking-[0.2em] text-xs">Data akun tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH PEGAWAI */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Buat Akun Pegawai Baru</h3>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Input data personel BPMP MALUT</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>

            <form onSubmit={handleAddPegawai} className="p-10 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                    <input 
                      required type="text" placeholder="Contoh: Budi Santoso, M.Pd"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      value={newPegawai.nama} onChange={e => setNewPegawai({...newPegawai, nama: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP (Username)</label>
                    <input 
                      required type="text" placeholder="Masukkan NIP"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      value={newPegawai.nip} onChange={e => setNewPegawai({...newPegawai, nip: e.target.value})}
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan Struktural/Fungsional</label>
                    <input 
                      required type="text" placeholder="Contoh: PTP Ahli Muda"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      value={newPegawai.jabatan} onChange={e => setNewPegawai({...newPegawai, jabatan: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Kerja / Tim Kerja</label>
                    {user.role === Role.ADMIN_TIM ? (
                      <input readOnly value={user.unitKerja} className="w-full px-5 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-sm font-bold text-slate-500" />
                    ) : (
                      <select 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        value={newPegawai.unitKerja} onChange={e => setNewPegawai({...newPegawai, unitKerja: e.target.value})}
                      >
                         <option value="">Pilih Unit...</option>
                         <option value="Subbag Umum">Subbag Umum</option>
                         <option value="Tim Kerja 1">Tim Kerja 1</option>
                         <option value="Tim Kerja 2">Tim Kerja 2</option>
                         <option value="Tim Kerja 3">Tim Kerja 3</option>
                         <option value="Pusat Data">Pusat Data</option>
                      </select>
                    )}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hak Akses Sistem</label>
                  <div className="flex gap-4">
                     <button 
                      type="button" onClick={() => setNewPegawai({...newPegawai, role: Role.PEGAWAI})}
                      className={`flex-1 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${newPegawai.role === Role.PEGAWAI ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}
                     >
                       Pegawai (Biasa)
                     </button>
                     <button 
                      type="button" onClick={() => setNewPegawai({...newPegawai, role: Role.ADMIN_TIM})}
                      className={`flex-1 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${newPegawai.role === Role.ADMIN_TIM ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}
                     >
                       Admin Tim Kerja
                     </button>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-slate-900 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center gap-3"
                  >
                    <Save size={18} /> Simpan Akun Baru
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAccounts;
