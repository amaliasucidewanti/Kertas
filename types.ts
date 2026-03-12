
export enum Role {
  SUPER_ADMIN = 'Super Admin',
  ADMIN_TIM = 'Admin Tim Kerja',
  PEGAWAI = 'Pegawai'
}

export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  role: Role;
  username: string;
  passwordChangeRequired: boolean;
  lastPasswordResetBy?: string;
  lastPasswordResetAt?: string;
  // Atribut Baru untuk Monitoring
  jenisTugas?: 'Luring' | 'Daring';
  sumberBiaya?: 'BPMP' | 'Penyelenggara' | 'Tanpa Biaya';
}

export interface Penugasan {
  id: string;
  nomorSurat: string;
  namaPegawai: string;
  nip: string;
  jabatan?: string;
  namaKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jenisPenugasan: 'Luring' | 'Daring';
  sumberBiaya: 'BPMP' | 'Penyelenggara' | 'Tanpa Biaya';
  biaya: number;
  statusTugas: 'Draft' | 'Aktif' | 'Selesai' | 'Perlu Perbaikan';
  laporanStatus: 'Sudah Upload' | 'Belum Upload';
  lokasi?: string;
  latarBelakang?: string;
  maksudTujuan?: string;
  ruangLingkup?: string;
  dasarLaporan?: string;
  uraianTugas?: string;
  hasilKerja?: string;
  simpulanSaran?: string;
  penutupLaporan?: string;
  dokumentasiFotos?: string[];
  penandatangan?: string;
  createdAt: string;
}

export interface ProgramKegiatan {
  id: string;
  namaKegiatan: string;
  bulan: string; // "01" - "12"
  mingguKe: number; // 1 - 5
  timKerja: 'PAUD' | 'SD' | 'SMP' | 'SMA' | 'Kasubbag Umum' | 'Lainnya';
  status: 'Belum Dilaksanakan' | 'Sudah Dilaksanakan';
  laporanFileLink?: string;
  laporanTimestamp?: string;
  pelaksana?: string; // NIP pelaksana
  deskripsiLaporan?: string;
  updatedAt: string;
}

export interface Kedisiplinan {
  nip: string;
  kehadiran: number;
  apel: number;
  logHarian: number;
  pelaporan: number;
  nilaiAkhir: number;
}

export interface AuthState {
  user: Pegawai | null;
  isLoggedIn: boolean;
}
