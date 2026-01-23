
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
  sumberBiaya: 'BPMP' | 'Penyelenggara' | 'Lainnya';
  biaya: number;
  statusTugas: 'Draft' | 'Aktif' | 'Selesai' | 'Perlu Perbaikan';
  laporanStatus: 'Sudah Upload' | 'Belum Upload';
  lokasi?: string;
  uraianTugas?: string;
  hasilKerja?: string;
  dokumentasiFotos?: string[]; // Minimal 3 photos requirement
  penandatangan?: string;
  createdAt: string;
}

export interface Kedisiplinan {
  nip: string;
  kehadiran: number;   // Bobot 25%
  apel: number;        // Bobot 15%
  logHarian: number;   // Bobot 20%
  pelaporan: number;   // Bobot 40%
  nilaiAkhir: number;
}

export interface AuthState {
  user: Pegawai | null;
  isLoggedIn: boolean;
}
