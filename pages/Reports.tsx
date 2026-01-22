
import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { dataService } from '../services/dataService';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('Laporan Bulanan Pegawai Bertugas');
  const [filterMonth, setFilterMonth] = useState('05');
  const [filterUnit, setFilterUnit] = useState('Seluruh Unit');
  
  const allTasks = dataService.getPenugasan();
  const allEmployees = dataService.getPegawai();

  const filteredData = useMemo(() => {
    return allTasks.filter(task => {
      const taskDate = task.tanggalMulai; // Format: YYYY-MM-DD
      const monthMatches = taskDate.includes(`-05-`); // Hardcoded for demo, normally dynamic
      
      const emp = allEmployees.find(e => e.nama === task.namaPegawai);
      const unitMatches = filterUnit === 'Seluruh Unit' || emp?.unitKerja === filterUnit;
      
      return unitMatches; // Simplified filtering for preview
    });
  }, [allTasks, filterUnit, allEmployees]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pusat Laporan & Rekapitulasi</h1>
          <p className="text-slate-500">Hasil cetak disesuaikan dengan standar pelaporan instansi pemerintah.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handlePrint}
            className="bg-white border p-3 rounded-xl text-slate-600 hover:text-indigo-600 shadow-sm transition-all"
           >
             <Printer size={20} />
           </button>
           <button className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
             <Download size={18} /> Ekspor PDF
           </button>
        </div>
      </div>

      {/* Filter Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm no-print">
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pilih Laporan</label>
          <select 
            value={reportType} 
            onChange={e => setReportType(e.target.value)}
            className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option>Laporan Bulanan Pegawai Bertugas</option>
            <option>Rekap Surat Tugas Tahunan</option>
            <option>Rekap Kedisiplinan Unit</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bulan Pelaporan</label>
          <select 
            className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="04">April 2024</option>
            <option value="05">Mei 2024</option>
            <option value="06">Juni 2024</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Unit Kerja</label>
          <select 
            className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
          >
            <option>Seluruh Unit</option>
            <option>Tim Kerja 1</option>
            <option>Tim Kerja 2</option>
            <option>Tim Kerja 3</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full bg-slate-800 text-white p-3 rounded-xl text-sm font-bold shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
            <Filter size={16} /> Update Pratinjau
          </button>
        </div>
      </div>

      {/* Pratinjau Kertas A4 */}
      <div className="bg-slate-500/10 p-4 md:p-12 rounded-3xl overflow-x-auto print-container">
        <div className="bg-white max-w-4xl mx-auto p-12 shadow-2xl rounded-sm text-slate-900 font-sans border border-slate-300 print:shadow-none print:border-none" style={{ minHeight: '297mm' }}>
          {/* Kop Instansi */}
          <div className="flex items-center border-b-4 border-double border-slate-800 pb-4 mb-8 text-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Logo_Kemdikbud.png" alt="Logo" className="w-20 h-20 object-contain mr-6 grayscale" />
            <div className="flex-1">
              <h2 className="text-sm font-bold uppercase tracking-tight">Kementerian Pendidikan, Kebudayaan, Riset, Dan Teknologi</h2>
              <h3 className="text-lg font-extrabold uppercase leading-tight">Balai Penjaminan Mutu Pendidikan (BPMP)</h3>
              <p className="text-[10px] italic">Sistem Kerja Tuntas (Si-Kertas) - Laporan Akuntabilitas Pegawai</p>
            </div>
          </div>

          <div className="text-center mb-10 space-y-2">
            <h4 className="text-md font-bold uppercase underline decoration-2 underline-offset-4">{reportType.toUpperCase()}</h4>
            <p className="text-xs font-semibold text-slate-600 italic">Periode Pelaporan: Mei 2024</p>
            <p className="text-xs text-slate-500">Unit Kerja: {filterUnit}</p>
          </div>

          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead>
              <tr className="bg-slate-100 uppercase">
                <th className="border border-slate-800 p-2 w-8">No</th>
                <th className="border border-slate-800 p-2 text-left">Nama Pegawai / NIP</th>
                <th className="border border-slate-800 p-2 text-left">Deskripsi Penugasan</th>
                <th className="border border-slate-800 p-2 w-24">Jenis</th>
                <th className="border border-slate-800 p-2 text-right w-24">Biaya (Rp)</th>
                <th className="border border-slate-800 p-2 w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((task, idx) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="border border-slate-800 p-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-800 p-2">
                    <span className="font-bold">{task.namaPegawai}</span><br/>
                    <span className="text-[9px] text-slate-500 italic">NIP: 19850101XXXXXX</span>
                  </td>
                  <td className="border border-slate-800 p-2 text-justify italic">{task.namaKegiatan}</td>
                  <td className="border border-slate-800 p-2 text-center text-[10px]">{task.jenisPenugasan}</td>
                  <td className="border border-slate-800 p-2 text-right font-mono tracking-tighter">
                    {task.biaya.toLocaleString('id-ID')}
                  </td>
                  <td className="border border-slate-800 p-2 text-center text-[10px] font-bold text-emerald-700 uppercase">
                    {task.statusTugas}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="border border-slate-800 p-8 text-center text-slate-400 italic">Tidak ada data penugasan yang sesuai dengan kriteria filter.</td>
                </tr>
              )}
              {filteredData.length > 0 && (
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="border border-slate-800 p-3 text-right text-xs">REKAPITULASI TOTAL BIAYA PENUGASAN</td>
                  <td className="border border-slate-800 p-3 text-right font-mono text-xs">
                    Rp {filteredData.reduce((acc, curr) => acc + curr.biaya, 0).toLocaleString('id-ID')}
                  </td>
                  <td className="border border-slate-800 p-3"></td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-16 flex justify-between items-end text-[10px] px-2">
             <div className="space-y-1">
                <p className="font-bold italic">Dokumen ini dihasilkan secara otomatis oleh Si-Kertas BPMP</p>
                <p>Waktu Cetak: {new Date().toLocaleString('id-ID')}</p>
                <div className="mt-4 w-20 h-20 border-2 border-slate-200 flex items-center justify-center text-[8px] text-slate-300 uppercase font-bold transform -rotate-12">
                   QR Code Arsip
                </div>
             </div>
             <div className="text-center w-64 space-y-20">
                <p className="font-semibold underline underline-offset-2 uppercase">Mengetahui, Pimpinan Unit</p>
                <div className="space-y-0.5">
                  <p className="font-bold underline decoration-1 uppercase">....................................................</p>
                  <p>NIP. ........................................</p>
                </div>
             </div>
          </div>
          
          <div className="mt-8 text-center text-[9px] text-slate-400 font-sans no-print border-t pt-4">
             --- Batas Akhir Halaman Pratinjau Laporan ---
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
