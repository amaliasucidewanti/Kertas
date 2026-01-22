
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
}

export interface Penugasan {
  id: string;
  namaPegawai: string;
  namaKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jenisPenugasan: string;
  biaya: number;
  statusTugas: 'Draft' | 'Aktif' | 'Selesai' | 'Perlu Perbaikan';
  nomorSurat?: string;
  dasarPenugasan?: string;
  lokasi?: string;
  penandatangan?: string;
}

export interface Kedisiplinan {
  nip: string;
  kehadiran: number; // 25%
  apel: number;      // 15%
  logHarian: number; // 20%
  pelaporan: number; // 40%
  nilaiAkhir: number;
}

export interface AuthState {
  user: Pegawai | null;
  isLoggedIn: boolean;
}
