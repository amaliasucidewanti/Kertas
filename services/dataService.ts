
import { Role, Pegawai, Penugasan, Kedisiplinan } from '../types';

// Initial Mock Data reflecting the requested spreadsheet structures
const MOCK_PEGAWAI: Pegawai[] = [
  { id: '1', nama: 'Budi Santoso', nip: '198501012010011001', jabatan: 'Analis Kebijakan', unitKerja: 'Tim Kerja 1', role: Role.SUPER_ADMIN, username: 'budi', passwordChangeRequired: false },
  { id: '2', nama: 'Siti Aminah', nip: '199005122015022001', jabatan: 'Pengelola Data', unitKerja: 'Tim Kerja 2', role: Role.ADMIN_TIM, username: 'siti', passwordChangeRequired: false },
  { id: '3', nama: 'Iwan Fals', nip: '197509092005011002', jabatan: 'Pranata Komputer', unitKerja: 'Tim Kerja 1', role: Role.PEGAWAI, username: 'iwan', passwordChangeRequired: false },
  { id: '4', nama: 'Ani Yudhoyono', nip: '198001012008012003', jabatan: 'Arsiparis', unitKerja: 'Tim Kerja 3', role: Role.PEGAWAI, username: 'ani', passwordChangeRequired: false },
];

const MOCK_PENUGASAN: Penugasan[] = [
  { 
    id: 'T1', 
    namaPegawai: 'Budi Santoso', 
    namaKegiatan: 'Koordinasi Wilayah A', 
    tanggalMulai: '2024-05-01', 
    tanggalSelesai: '2024-05-05', 
    jenisPenugasan: 'Perjalanan Dinas', 
    biaya: 2500000, 
    statusTugas: 'Aktif',
    nomorSurat: 'ST/001/BPMP/2024'
  },
  { 
    id: 'T2', 
    namaPegawai: 'Siti Aminah', 
    namaKegiatan: 'Workshop Penulisan', 
    tanggalMulai: '2024-05-10', 
    tanggalSelesai: '2024-05-12', 
    jenisPenugasan: 'Diklat', 
    biaya: 1000000, 
    statusTugas: 'Aktif',
    nomorSurat: 'ST/002/BPMP/2024'
  }
];

const MOCK_KEDISIPLINAN: Kedisiplinan[] = [
  { nip: '198501012010011001', kehadiran: 95, apel: 100, logHarian: 90, pelaporan: 85, nilaiAkhir: 91.25 },
  { nip: '199005122015022001', kehadiran: 80, apel: 80, logHarian: 85, pelaporan: 90, nilaiAkhir: 84.75 },
];

export const dataService = {
  getPegawai: () => MOCK_PEGAWAI,
  getPenugasan: () => MOCK_PENUGASAN,
  getKedisiplinan: (nip?: string) => nip ? MOCK_KEDISIPLINAN.find(k => k.nip === nip) : MOCK_KEDISIPLINAN,
  
  isBertugas: (namaPegawai: string, date: string = new Date().toISOString().split('T')[0]) => {
    return MOCK_PENUGASAN.some(p => 
      p.namaPegawai === namaPegawai && 
      date >= p.tanggalMulai && 
      date <= p.tanggalSelesai &&
      p.statusTugas === 'Aktif'
    );
  },

  getIdleDays: (namaPegawai: string) => {
    const activeTasks = MOCK_PENUGASAN.filter(p => p.namaPegawai === namaPegawai && p.statusTugas === 'Aktif');
    if (activeTasks.length > 0) return 0;
    
    // Simplified logic: how many days since the last finished task
    const finishedTasks = MOCK_PENUGASAN.filter(p => p.namaPegawai === namaPegawai && p.statusTugas === 'Selesai')
      .sort((a, b) => b.tanggalSelesai.localeCompare(a.tanggalSelesai));
    
    if (finishedTasks.length === 0) return 30; // Random high number if never worked
    const lastDate = new Date(finishedTasks[0].tanggalSelesai);
    const diff = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }
};
