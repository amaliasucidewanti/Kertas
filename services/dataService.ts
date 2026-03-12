
import { Role, Pegawai, Penugasan, Kedisiplinan, ProgramKegiatan } from '../types';

const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';
const PROGRAM_2026_ID = '1BYzuh5PnniaafkV25HkBE7QCcdMvfjC9'; 
const PROGRAM_2026_GID = '1637860300'; 

const LOCAL_STORAGE_KEY = 'si-kertas-local-db-v1';
const GITHUB_CONFIG_KEY = 'si-kertas-github-cfg';

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
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Gagal mengambil data dari server');
      const data = await res.json();
      
      MOCK_PEGAWAI = data.pegawai.map((p: any) => ({
        ...p,
        passwordChangeRequired: p.passwordChangeRequired === 'true' || p.passwordChangeRequired === true
      }));
      MOCK_KEDISIPLINAN = data.kedisiplinan.map((k: any) => ({
        nip: k.nip,
        kehadiran: parseFloat(k.kehadiran) || 0,
        apel: parseFloat(k.apel) || 0,
        logHarian: parseFloat(k.logHarian) || 0,
        pelaporan: parseFloat(k.pelaporan) || 0,
        nilaiAkhir: parseFloat(k.nilaiAkhir) || 0
      }));
      MOCK_PENUGASAN = data.penugasan.map((p: any) => ({
        ...p,
        biaya: parseFloat(p.biaya) || 0
      }));
      MOCK_PROGRAM_KEGIATAN = data.programKegiatan.map((p: any) => ({
        ...p,
        mingguKe: parseInt(p.mingguKe) || 1
      }));

      return true;
    } catch (e) {
      console.warn("Sinkronisasi gagal, menggunakan data lokal:", e);
      loadLocalData();
      return MOCK_PEGAWAI.length > 0;
    }
  },

  syncProgram2026: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`https://docs.google.com/spreadsheets/d/${PROGRAM_2026_ID}/export?format=csv&gid=${PROGRAM_2026_GID}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Gagal mengakses Spreadsheet Program 2026");

      const csvText = await res.text();
      const rows = parseCSV(csvText);
      if (rows.length < 2) return false;

      const headers = rows[0].map(h => h.toLowerCase().trim());
      
      const idxProgram = headers.findIndex(h => h.includes('program 2026'));
      const idxPJ = headers.findIndex(h => h.includes('penanggung jawab'));

      if (idxProgram === -1) throw new Error("Format kolom 'Program 2026' tidak ditemukan");

      const rawData = rows.slice(1);
      const syncedPrograms: ProgramKegiatan[] = [];

      rawData.forEach((row, i) => {
        const nama = row[idxProgram]?.trim();
        if (!nama) return; 

        const pj = idxPJ !== -1 ? row[idxPJ] : "Lainnya";

        const existing = MOCK_PROGRAM_KEGIATAN.find(p => p.namaKegiatan.toLowerCase() === nama.toLowerCase());

        if (existing) {
          existing.timKerja = pj as any;
          existing.updatedAt = new Date().toISOString();
        } else {
          syncedPrograms.push({
            id: `SYNC-${Date.now()}-${i}`,
            namaKegiatan: nama,
            bulan: "01",
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

  // GITHUB AUTO-SYNC LOGIC
  getGithubConfig: () => {
    const cfg = localStorage.getItem(GITHUB_CONFIG_KEY);
    return cfg ? JSON.parse(cfg) : { token: '', repo: '', path: 'backup_sikertas.json' };
  },

  saveGithubConfig: (cfg: { token: string, repo: string, path: string }) => {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(cfg));
  },

  pushToGithub: async () => {
    const config = dataService.getGithubConfig();
    if (!config.token || !config.repo) {
      throw new Error("GitHub Integration belum dikonfigurasi.");
    }

    const dataToSave = {
      penugasan: MOCK_PENUGASAN,
      pegawai: MOCK_PEGAWAI,
      programKegiatan: MOCK_PROGRAM_KEGIATAN,
      lastUpdate: new Date().toISOString()
    };

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(dataToSave, null, 2))));
    const url = `https://api.github.com/repos/${config.repo}/contents/${config.path}`;

    try {
      // 1. Get existing file to get SHA (mandatory for GitHub API update)
      const getRes = await fetch(url, {
        headers: { 'Authorization': `token ${config.token}` }
      });

      let sha = null;
      if (getRes.ok) {
        const existingData = await getRes.json();
        sha = existingData.sha;
      }

      // 2. Put new content
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `SI-KERTAS Auto-Sync: ${new Date().toLocaleString()}`,
          content: content,
          sha: sha // Include SHA if file exists
        })
      });

      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message || "Gagal Push ke GitHub");
      }

      return true;
    } catch (e) {
      console.error("GitHub Sync Error:", e);
      throw e;
    }
  },

  getPegawai: (unitKerja?: string) => {
    let list = [...MOCK_PEGAWAI];
    if (unitKerja) list = list.filter(p => p.unitKerja === unitKerja);
    return list.sort((a,b) => a.nama.localeCompare(b.nama));
  },

  addPegawai: async (data: any) => {
    const newP: Pegawai = {
      ...data,
      id: `p-${Date.now()}`,
      username: data.nip,
      passwordChangeRequired: true,
    };
    try {
      await fetch('/api/pegawai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
      MOCK_PEGAWAI.push(newP);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  
  updatePegawai: async (nip: string, data: Partial<Pegawai>) => {
    try {
      await fetch(`/api/pegawai/${nip}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      MOCK_PEGAWAI = MOCK_PEGAWAI.map(p => p.nip === nip ? { ...p, ...data } : p);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  resetPassword: async (id: string, adminName: string) => {
    const p = MOCK_PEGAWAI.find(p => p.id === id);
    if (!p) return false;
    const update = { 
      passwordChangeRequired: true, 
      lastPasswordResetBy: adminName,
      lastPasswordResetAt: new Date().toLocaleString()
    };
    try {
      await fetch(`/api/pegawai/${p.nip}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      MOCK_PEGAWAI = MOCK_PEGAWAI.map(p => p.id === id ? { ...p, ...update } : p);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  getPenugasan: () => [...MOCK_PENUGASAN],
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

  deletePenugasan: async (id: string) => {
    try {
      await fetch(`/api/penugasan/${id}`, { method: 'DELETE' });
      MOCK_PENUGASAN = MOCK_PENUGASAN.filter(p => p.id !== id);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  updatePenugasan: async (id: string, data: Partial<Penugasan>) => {
    try {
      await fetch(`/api/penugasan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      MOCK_PENUGASAN = MOCK_PENUGASAN.map(p => p.id === id ? { ...p, ...data } : p);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  saveLaporan: async (taskId: string, reportData: Partial<Penugasan>) => {
    const update = {
      ...reportData,
      laporanStatus: 'Sudah Upload',
      statusTugas: 'Selesai'
    };
    try {
      await fetch(`/api/penugasan/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      MOCK_PENUGASAN = MOCK_PENUGASAN.map(t => t.id === taskId ? {
        ...t,
        ...update
      } as Penugasan : t);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  addPenugasan: async (task: Penugasan) => {
    if (MOCK_PENUGASAN.some(p => p.nomorSurat === task.nomorSurat && p.nip === task.nip)) {
      alert("Pegawai ini sudah memiliki ST dengan nomor yang sama.");
      return false;
    }
    try {
      await fetch('/api/penugasan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      MOCK_PENUGASAN.push(task);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  addPenugasanBatch: async (formData: any, employees: Pegawai[]) => {
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
    
    try {
      // For batch, we'll just send them one by one or implement a batch endpoint
      // Let's do them sequentially for now to keep it simple
      for (const task of tasks) {
        await fetch('/api/penugasan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
      }
      MOCK_PENUGASAN.push(...tasks);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
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
    if (dataService.isBertugas(cNip)) return 0;

    const myTasks = MOCK_PENUGASAN.filter(t => dataService.standardizeNip(t.nip) === cNip);
    if (myTasks.length === 0) return 365;

    const lastTask = [...myTasks].sort((a, b) => b.tanggalSelesai.localeCompare(a.tanggalSelesai))[0];
    const diff = new Date(today).getTime() - new Date(lastTask.tanggalSelesai).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  },

  getProgramKegiatan: () => [...MOCK_PROGRAM_KEGIATAN],
  getLastSyncProgram: () => LAST_SYNC_PROGRAM,
  
  addProgramKegiatan: async (data: any) => {
    const newPK: ProgramKegiatan = {
      ...data,
      id: `PK-${Date.now()}`,
      bulan: "01",
      mingguKe: 1,
      status: 'Belum Dilaksanakan',
      updatedAt: new Date().toISOString()
    };
    try {
      await fetch('/api/program-kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPK)
      });
      MOCK_PROGRAM_KEGIATAN.push(newPK);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  updateProgramKegiatan: async (id: string, data: Partial<ProgramKegiatan>) => {
    try {
      await fetch(`/api/program-kegiatan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  deleteProgramKegiatan: async (id: string) => {
    try {
      await fetch(`/api/program-kegiatan/${id}`, { method: 'DELETE' });
      MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.filter(p => p.id !== id);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  uploadProgramReport: async (id: string, link: string, desc: string) => {
    const update = {
      laporanFileLink: link,
      deskripsiLaporan: desc,
      status: 'Sudah Dilaksanakan',
      laporanTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await fetch(`/api/program-kegiatan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.map(p => p.id === id ? {
        ...p,
        ...update
      } as ProgramKegiatan : p);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  deleteProgramReport: async (id: string) => {
    const update = {
      laporanFileLink: undefined,
      deskripsiLaporan: undefined,
      status: 'Belum Dilaksanakan',
      laporanTimestamp: undefined,
      updatedAt: new Date().toISOString()
    };
    try {
      await fetch(`/api/program-kegiatan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      MOCK_PROGRAM_KEGIATAN = MOCK_PROGRAM_KEGIATAN.map(p => p.id === id ? {
        ...p,
        ...update
      } as ProgramKegiatan : p);
      persistData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
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
    if (all.length <= 5) return { employees: all, warning: "Jumlah pegawai terbatas." };
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
    if (confirm('PERINGATAN: Semua data penugasan akan dihapus.')) {
      dataService.exportDatabase();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  }
};
