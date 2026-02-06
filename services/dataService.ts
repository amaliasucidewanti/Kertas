
import { Role, Pegawai, Penugasan, Kedisiplinan, ProgramKegiatan } from '../types';

const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';
const PROGRAM_2026_ID = '1BYzuh5PnniaafkV25HkBE7QCcdMvfjC9'; // ID Spreadsheet Program 2026
const PROGRAM_2026_GID = '1637860300'; // GID Sheet Program 2026

const LOCAL_STORAGE_KEY = 'si-kertas-local-db-v1';

const SYSTEM_USERS: Pegawai[] = [
  { id: 'sys-admin', nama: 'Administrator Utama', nip: '000000', jabatan: 'Super Admin', unitKerja: 'Pusat Data', role: Role.SUPER_ADMIN, username: 'Admin', passwordChangeRequired: false, jenisTugas: 'Luring', sumberBiaya: 'BPMP' },
];

let MOCK_PEGAWAI: Pegawai[] = [];
let MOCK_PENUGASAN: Penugasan[] = [];
let MOCK_KEDISIPLINAN: Kedisiplinan[] = [];
let MOCK_PROGRAM_KEGIATAN: ProgramKegiatan[] = [];
let LAST_SYNC_PROGRAM: string | null = null;

const parseCSV = (csvText: string) => {
  const rows = [];
  const lines = csvText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = [];
    let inQuotes = false;
    let current = '';
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else current += char;
    }
    values.push(current.trim());
    rows.push(values.map(v => v.replace(/^"|"$/g, '').trim()));
  }
  return rows;
};

const persistData = () => {
  try {
    const dataToSave = {
      penugasan: MOCK_PENUGASAN,
      pegawai: MOCK_PEGAWAI,
      programKegiatan: MOCK_PROGRAM_KEGIATAN,
      lastSyncProgram: LAST_SYNC_PROGRAM,
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("LocalStorage Full:", e);
    alert("Penyimpanan browser penuh. Mohon hapus beberapa laporan lama atau ekspor backup.");
  }
};

const loadLocalData = () => {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    const parsed = JSON.parse(local);
    MOCK_PENUGASAN = parsed.penugasan || [];
    MOCK_PROGRAM_KEGIATAN = parsed.programKegiatan || [];
    LAST_SYNC_PROGRAM = parsed.lastSyncProgram || null;
    if (parsed.pegawai && parsed.pegawai.length > 0) {
        MOCK_PEGAWAI = parsed.pegawai;
    }
  }
};

export const dataService = {
  standardizeNip: (nip: string) => {
    if (!nip) return '';
    return nip.toString().replace(/\D/g, '').trim();
  },

  getTodayWIT: () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Jayapura', 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    }).format(now);
  },

  syncAll: async () => {
    loadLocalData();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [pegRes, disRes] = await Promise.all([
        fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=DATA_PEGAWAI`, { signal: controller.signal }),
        fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=DISIPLIN_PEGAWAI`, { signal: controller.signal })
      ]);
      
      clearTimeout(timeoutId);

      const [pegCsv, disCsv] = await Promise.all([pegRes.text(), disRes.text()]);
      
      const pegRows = parseCSV(pegCsv).slice(1); // Skip header
      const spreadsheetPegawai = pegRows.map((row, idx) => {
        const nip = dataService.standardizeNip(row[0] || '');
        return {
          id: `p-${idx}`,
          nama: row[1] || 'Tanpa Nama',
          nip: nip,
          jabatan: row[2] || '-',
          unitKerja: row[3] || '-',
          role: (row[4] as Role) || Role.PEGAWAI,
          username: nip,
          passwordChangeRequired: false,
          jenisTugas: (row[5] as any) || 'Luring',
          sumberBiaya: (row[6] as any) || 'BPMP'
        };
      });

      spreadsheetPegawai.forEach(sp => {
          const existingIdx = MOCK_PEGAWAI.findIndex(p => p.nip === sp.nip);
          if (existingIdx === -1) {
              MOCK_PEGAWAI.push(sp);
          } else {
              MOCK_PEGAWAI[existingIdx] = {
                ...MOCK_PEGAWAI[existingIdx],
                nama: sp.nama,
                jabatan: sp.jabatan,
                unitKerja: sp.unitKerja,
                role: sp.role
              };
          }
      });

      const disRows = parseCSV(disCsv).slice(1); // Skip header
      MOCK_KEDISIPLINAN = disRows.map((row) => ({
        nip: dataService.standardizeNip(row[0] || ''),
        kehadiran: parseFloat(row[1]) || 0,
        apel: parseFloat(row[2]) || 0,
        logHarian: parseFloat(row[3]) || 0,
        pelaporan: parseFloat(row[4]) || 0,
        nilaiAkhir: parseFloat(row[5]) || 0
      }));

      // Auto Sync Program 2026
      await dataService.syncProgram2026();

      persistData();
      return true;
    } catch (e) {
      console.warn("Sinkronisasi gagal, menggunakan data lokal:", e);
      return MOCK_PEGAWAI.length > 0;
    }
  },

  /**
   * Mengambil data Program 2026 dari Google Spreadsheet
   */
  syncProgram2026: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Menggunakan export CSV agar tidak perlu API Key (Read-Only Public/Shared link)
      const res = await fetch(`https://docs.google.com/spreadsheets/d/${PROGRAM_2026_ID}/export?format=csv&gid=${PROGRAM_2026_GID}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Gagal mengakses Spreadsheet Program 2026");

      const csvText = await res.text();
      const rows = parseCSV(csvText);
      if (rows.length < 2) return false;

      const headers = rows[0].map(h => h.toLowerCase().trim());
      
      // Dynamic Mapping
      const idxProgram = headers.findIndex(h => h.includes('program 2026'));
      const idxJadwal = headers.findIndex(h => h.includes('jadwal'));
      const idxPJ = headers.findIndex(h => h.includes('penanggung jawab'));

      if (idxProgram === -1) throw new Error("Format kolom 'Program 2026' tidak ditemukan");

      const rawData = rows.slice(1);
      const syncedPrograms: ProgramKegiatan[] = [];

      rawData.forEach((row, i) => {
        const nama = row[idxProgram]?.trim();
        if (!nama) return; // Skip nama kosong

        const jadwal = idxJadwal !== -1 ? row[idxJadwal] : "01";
        const pj = idxPJ !== -1 ? row[idxPJ] : "Lainnya";

        // Parsing Bulan Sederhana (Jika formatnya e.g. "Januari")
        const monthMap: Record<string, string> = {
          'januari': '01', 'februari': '02', 'maret': '03', 'april': '04', 'mei': '05', 'juni': '06',
          'juli': '07', 'agustus': '08', 'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
        };
        const detectedMonth = Object.keys(monthMap).find(m => jadwal.toLowerCase().includes(m));
        const bulan = detectedMonth ? monthMap[detectedMonth] : "01";

        // Cek duplikasi di data lokal berdasarkan nama kegiatan
        const existing = MOCK_PROGRAM_KEGIATAN.find(p => p.namaKegiatan.toLowerCase() === nama.toLowerCase());

        if (existing) {
          // Update data PJ dan Jadwal jika berubah, tapi jangan ganggu status lapor lokal
          existing.timKerja = pj as any;
          existing.updatedAt = new Date().toISOString();
        } else {
          syncedPrograms.push({
            id: `SYNC-${Date.now()}-${i}`,
            namaKegiatan: nama,
            bulan: bulan,
            mingguKe: 1,
            timKerja: pj as any,
            status: 'Belum Dilaksanakan',
            updatedAt: new Date().toISOString()
          });
        }
      });

      MOCK_PROGRAM_KEGIATAN = [...MOCK_PROGRAM_KEGIATAN, ...syncedPrograms];
      LAST_SYNC_PROGRAM = new Date().toISOString();
      persistData();
      return true;
    } catch (e) {
      console.error("Sync Program 2026 Error:", e);
      throw e;
    }
  },

  getPegawai: (unitKerja?: string) => {
    let list = [...MOCK_PEGAWAI];
    if (unitKerja) list = list.filter(p => p.unitKerja === unitKerja);
    return list.sort((a,b) => a.nama.localeCompare(b.nama));
  },

  addPegawai: (data: any) => {
    const newP: Pegawai = {
      ...data,
      id: `p-${Date.now()}`,
      username: data.nip,
      passwordChangeRequired: true,
    };
    MOCK_PEGAWAI.push(newP);
    persistData();
    return true;
  },
  
  updatePegawai: (nip: string, data: Partial<Pegawai>) => {
    MOCK_PEGAWAI = MOCK_PEGAWAI.map(p => p.nip === nip ? { ...p, ...data } : p);
    persistData();
    return true;
  },

  resetPassword: (id: string, adminName: string) => {
    MOCK_PEGAWAI = MOCK_PEGAWAI.map(p => p.id === id ? { 
      ...p, 
      passwordChangeRequired: true, 
      lastPasswordResetBy: adminName,
      lastPasswordResetAt: new Date().toLocaleString()
    } : p);
    persistData();
    return true;
  },

  getPenugasan: () => MOCK_PENUGASAN,
  getPenugasanById: (id: string) => MOCK_PENUGASAN.find(p => p.id === id),

  getPenugasanWithStatus: (unitKerja?: string) => {
    const today = dataService.getTodayWIT();
    const todayObj = new Date(today);
    let baseST = [...MOCK_PENUGASAN];
    
    if (unitKerja) {
      const nips = new Set(MOCK_PEGAWAI.filter(p => p.unitKerja === unitKerja).map(p => p.nip));
      baseST = baseST.filter(st => nips.has(st.nip));
    }

    return baseST.map(st => {
      const endDateObj = new Date(st.tanggalSelesai);
      const diffTime = endDateObj.getTime() - todayObj.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      
      let statusLabel = 'Bertugas';
      let statusColor = 'emerald';
      let statusContext = 'Sedang berjalan';
      let priority = 3;

      if (st.laporanStatus === 'Sudah Upload') {
        statusLabel = 'Selesai';
        statusColor = 'blue';
        statusContext = 'Selesai & dilaporkan';
        priority = 4;
      } else if (today > st.tanggalSelesai) {
        statusLabel = 'Terlambat';
        statusColor = 'rose';
        const delay = Math.abs(diffDays);
        statusContext = `Laporan Terlambat ${delay} hari`;
        priority = 1;
      } else if (diffDays >= 0 && diffDays <= 2) {
        statusLabel = 'Akan Selesai';
        statusColor = 'amber';
        statusContext = diffDays === 0 ? 'Berakhir hari ini' : `Sisa ${diffDays} hari`;
        priority = 2;
      }
      return { ...st, calculatedStatus: statusLabel, calculatedColor: statusColor, calculatedContext: statusContext, priority };
    }).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  deletePenugasan: (id: string) => {
    MOCK_PENUGASAN = MOCK_PENUGASAN.filter(p => p.id !== id);
    persistData();
    return true;
  },

  updatePenugasan: (id: string, data: Partial<Penugasan>) => {
    MOCK_PENUGASAN = MOCK_PENUGASAN.map(p => p.id === id ? { ...p, ...data } : p);
    persistData();
    return true;
  },

  saveLaporan: (taskId: string, reportData: Partial<Penugasan>) => {
    MOCK_PENUGASAN = MOCK_PENUGASAN.map(t => t.id === taskId ? {
      ...t,
      ...reportData,
      laporanStatus: 'Sudah Upload',
      statusTugas: 'Selesai'
    } : t);
    persistData();
    return true;
  },

  addPenugasan: (task: Penugasan) => {
    if (MOCK_PENUGASAN.some(p => p.nomorSurat === task.nomorSurat && p.nip === task.nip)) {
      alert("Pegawai ini sudah memiliki ST dengan nomor yang sama.");
      return false;
    }
    MOCK_PENUGASAN.push(task);
    persistData();
    return true;
  },

  addPenugasanBatch: (formData: any, employees: Pegawai[]) => {
    const tasks: Penugasan[] = employees.map(emp => ({
      ...formData,
      id: `ST-${Date.now()}-${emp.nip}`,
      namaPegawai: emp.nama,
      nip: dataService.standardizeNip(emp.nip),
      jabatan: emp.jabatan,
      statusTugas: 'Aktif',
      laporanStatus: 'Belum Upload',
      createdAt: new Date().toISOString()
    }));
    MOCK_PENUGASAN.push(...tasks);
    persistData();
    return true;
  },

  getReportReminders: (nip: string) => {
    const cNip = dataService.standardizeNip(nip);
    const today = dataService.getTodayWIT();
    const all = MOCK_PENUGASAN.filter(t => dataService.standardizeNip(t.nip) === cNip);
    return {
      active: all.filter(t => t.laporanStatus === 'Belum Upload' && today <= t.tanggalSelesai),
      missing: all.filter(t => t.laporanStatus === 'Belum Upload' && today > t.tanggalSelesai)
    };
  },

  isBertugas: (nip: string) => {
    const cNip = dataService.standardizeNip(nip);
    const today = dataService.getTodayWIT();
    return MOCK_PENUGASAN.some(t => 
      dataService.standardizeNip(t.nip) === cNip && 
      today >= t.tanggalMulai && 
      today <= t.tanggalSelesai
    );
  },

  getIdleDays: (nip: string) => {
    const cNip = dataService.standardizeNip(nip);
    const today = dataService.getTodayWIT();
    const isBertugas = dataService.isBertugas(cNip);
    if (isBertugas) return 0;

    const myTasks = MOCK_PENUGASAN.filter(t => dataService.standardizeNip(t.nip) === cNip);
    if (myTasks.length === 0) return 365;

    const lastTask = [...myTasks].sort((a, b) => b.tanggalSelesai.localeCompare(a.tanggalSelesai))[0];
    const diff = new Date(today).getTime() - new Date(lastTask.tanggalSelesai).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  },

  getProgramKegiatan: () => [...MOCK_PROGRAM_KEGIATAN].sort((a,b) => (a.bulan + a.mingguKe).localeCompare(b.bulan + b.mingguKe)),
  getLastSyncProgram: () => LAST_SYNC_PROGRAM,
  
  addProgramKegiatan: (data: any) => {
    const newPK: ProgramKegiatan = {
      ...data,
      id: `PK-${Date.now()}`,
      status: 'Belum Dilaksanakan',
      updatedAt: new Date().toISOString()
    };
    MOCK_PROGRAM_KEGIATAN.push(newPK);
    persistData();
    return true;
  },

  updateProgramKegiatan: (id: string, data: Partial<ProgramKegiatan>) => {
    MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    persistData();
    return true;
  },

  deleteProgramKegiatan: (id: string) => {
    MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.filter(p => p.id !== id);
    persistData();
    return true;
  },

  uploadProgramReport: (id: string, link: string, desc: string) => {
    MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.map(p => p.id === id ? {
      ...p,
      laporanFileLink: link,
      deskripsiLaporan: desc,
      status: 'Sudah Dilaksanakan',
      laporanTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : p);
    persistData();
    return true;
  },

  deleteProgramReport: (id: string) => {
    MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.map(p => p.id === id ? {
      ...p,
      laporanFileLink: undefined,
      deskripsiLaporan: undefined,
      status: 'Belum Dilaksanakan',
      laporanTimestamp: undefined,
      updatedAt: new Date().toISOString()
    } : p);
    persistData();
    return true;
  },

  checkConflict: (nip: string, start: string, end: string, jenis: string) => {
    const cNip = dataService.standardizeNip(nip);
    if (start > end) return { conflict: true, message: "Tanggal mulai tidak boleh melewati tanggal selesai." };
    const existingAtSameTime = MOCK_PENUGASAN.filter(p => 
      dataService.standardizeNip(p.nip) === cNip && 
      ((start >= p.tanggalMulai && start <= p.tanggalSelesai) ||
       (end >= p.tanggalMulai && end <= p.tanggalSelesai) ||
       (p.tanggalMulai >= start && p.tanggalMulai <= end))
    );
    const luringConflict = existingAtSameTime.some(p => p.jenisPenugasan === 'Luring' && jenis === 'Luring');
    if (luringConflict) return { conflict: true, message: `Pegawai memiliki penugasan LURING lain pada periode tsb.` };
    const sameTypeConflict = existingAtSameTime.some(p => p.jenisPenugasan === jenis);
    if (sameTypeConflict) return { conflict: false, warning: `Pegawai sudah memiliki tugas berjenis ${jenis} di hari tsb.` };
    return { conflict: false };
  },

  getKedisiplinan: (nip: string) => {
    const cNip = dataService.standardizeNip(nip);
    const base = MOCK_KEDISIPLINAN.find(k => k.nip === cNip);
    if (!base) return undefined;
    const lateReports = MOCK_PENUGASAN.filter(t => dataService.standardizeNip(t.nip) === cNip && t.laporanStatus === 'Belum Upload' && dataService.getTodayWIT() > t.tanggalSelesai).length;
    const penalty = lateReports * 5;
    const newPelaporan = Math.max(0, base.pelaporan - penalty);
    const newNilaiAkhir = Math.round((base.kehadiran * 0.25) + (base.apel * 0.15) + (base.logHarian * 0.20) + (newPelaporan * 0.40));
    return { ...base, pelaporan: newPelaporan, nilaiAkhir: newNilaiAkhir };
  },

  getAverageDiscipline: (unitKerja?: string) => {
    let list = dataService.getPegawai(unitKerja);
    if (list.length === 0) return 0;
    const total = list.reduce((sum, p) => sum + (dataService.getKedisiplinan(p.nip)?.nilaiAkhir || 0), 0);
    return Math.round(total / list.length);
  },

  getEligibleEmployees: (unitKerja?: string) => {
    const all = dataService.getPegawai(unitKerja);
    if (all.length <= 5) return { employees: all, warning: "Jumlah pegawai terbatas, aturan Gatekeeper non-aktif." };
    const withScores = all.map(p => ({ p, score: dataService.getKedisiplinan(p.nip)?.nilaiAkhir || 0 }));
    withScores.sort((a, b) => a.score - b.score);
    const bottom5Nips = new Set(withScores.slice(0, 5).map(x => x.p.nip));
    return { employees: all.filter(p => !bottom5Nips.has(p.nip)), bottom5: withScores.slice(0, 5).map(x => x.p) };
  },

  getEmployeeAssignmentSummary: (nip: string) => {
    const cNip = dataService.standardizeNip(nip);
    const myTasks = MOCK_PENUGASAN.filter(t => dataService.standardizeNip(t.nip) === cNip);
    return {
      total: myTasks.length,
      typeCounts: {
        luring: myTasks.filter(t => t.jenisPenugasan === 'Luring').length,
        daring: myTasks.filter(t => t.jenisPenugasan === 'Daring').length,
      },
      costCounts: {
        bpmp: myTasks.filter(t => t.sumberBiaya === 'BPMP').length,
        penyelenggara: myTasks.filter(t => t.sumberBiaya === 'Penyelenggara').length,
        tanpaBiaya: myTasks.filter(t => t.sumberBiaya === 'Tanpa Biaya').length,
      }
    };
  },

  getDailyStatus: (dateStr: string) => {
    const bertugas = MOCK_PENUGASAN.filter(t => dateStr >= t.tanggalMulai && dateStr <= t.tanggalSelesai);
    const bertugasNips = new Set(bertugas.map(t => dataService.standardizeNip(t.nip)));
    const standby = MOCK_PEGAWAI.filter(p => !bertugasNips.has(dataService.standardizeNip(p.nip)));
    return { bertugas, standby };
  },

  getAllUsers: () => [...SYSTEM_USERS, ...MOCK_PEGAWAI],

  exportDatabase: () => {
    const data = {
      penugasan: MOCK_PENUGASAN,
      pegawai: MOCK_PEGAWAI,
      programKegiatan: MOCK_PROGRAM_KEGIATAN,
      exportAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SI-KERTAS_BACKUP_${new Date().getTime()}.json`;
    link.click();
  },

  clearDatabase: () => {
    if (confirm('PERINGATAN: Semua data penugasan akan dihapus. Aplikasi akan melakukan ekspor backup otomatis sebelum menghapus. Lanjutkan?')) {
      dataService.exportDatabase();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  }
};
