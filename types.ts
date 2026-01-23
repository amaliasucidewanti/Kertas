
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
  // Format Laporan Baru
  latarBelakang?: string;
  maksudTujuan?: string;
  ruangLingkup?: string;
  dasarLaporan?: string;
  uraianTugas?: string; // Bagian B: Kegiatan
  hasilKerja?: string;   // Bagian C: Hasil
  simpulanSaran?: string; // Bagian D: Simpulan
  penutupLaporan?: string; // Bagian E: Penutup
  dokumentasiFotos?: string[]; // Minimal 3 photos requirement
  penandatangan?: string;
  createdAt: string;
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
