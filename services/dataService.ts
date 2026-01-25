
import { Role, Pegawai, Penugasan, Kedisiplinan } from '../types';

const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';
const LOCAL_STORAGE_KEY = 'si-kertas-local-db-v1';

const SYSTEM_USERS: Pegawai[] = [
  { id: 'sys-admin', nama: 'Administrator Utama', nip: '000000', jabatan: 'Super Admin', unitKerja: 'Pusat Data', role: Role.SUPER_ADMIN, username: 'Admin', passwordChangeRequired: false, jenisTugas: 'Luring', sumberBiaya: 'BPMP' },
  { id: 'sys-umum', nama: 'Admin Subbag Umum', nip: '111111', jabatan: 'Kepala Subbag Umum', unitKerja: 'Subbag Umum', role: Role.ADMIN_TIM, username: 'umum', passwordChangeRequired: false, jenisTugas: 'Luring', sumberBiaya: 'BPMP' },
  { id: 'sys-tk1', nama: 'Admin Tim Kerja 1', nip: '222222', jabatan: 'Ketua Tim Kerja 1', unitKerja: 'Tim Kerja 1', role: Role.ADMIN_TIM, username: 'tk1', passwordChangeRequired: false, jenisTugas: 'Luring', sumberBiaya: 'BPMP' },
];

let MOCK_PEGAWAI: Pegawai[] = [];
let MOCK_PENUGASAN: Penugasan[] = [];
let MOCK_KEDISIPLINAN: Kedisiplinan[] = [];

const parseCSV = (csvText: string) => {
  const rows = [];
  const lines = csvText.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
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
  const dataToSave = {
    penugasan: MOCK_PENUGASAN,
    pegawai: MOCK_PEGAWAI,
    lastUpdate: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
};

const loadLocalData = () => {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    const parsed = JSON.parse(local);
    MOCK_PENUGASAN = parsed.penugasan || [];
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
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Jayapura', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    return `${year}-${month}-${day}`;
  },

  syncAll: async () => {
    loadLocalData();
    try {
      const [pegRes, disRes] = await Promise.all([
        fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=DATA_PEGAWAI`),
        fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=DISIPLIN_PEGAWAI`)
      ]);

      const [pegCsv, disCsv] = await Promise.all([pegRes.text(), disRes.text()]);
      
      const pegRows = parseCSV(pegCsv);
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
              // Update metadata but keep custom fields if they exist
              MOCK_PEGAWAI[existingIdx] = {
                ...MOCK_PEGAWAI[existingIdx],
                nama: sp.nama,
                jabatan: sp.jabatan,
                unitKerja: sp.unitKerja,
                role: sp.role
              };
          }
      });

      const disRows = parseCSV(disCsv);
      MOCK_KEDISIPLINAN = disRows.map((row) => ({
        nip: dataService.standardizeNip(row[0] || ''),
        kehadiran: parseFloat(row[1]) || 0,
        apel: parseFloat(row[2]) || 0,
        logHarian: parseFloat(row[3]) || 0,
        pelaporan: parseFloat(row[4]) || 0,
        nilaiAkhir: parseFloat(row[5]) || 0
      }));

      persistData();
      return true;
    } catch (e) {
      console.error("Gagal sinkronisasi metadata:", e);
      return MOCK_PEGAWAI.length > 0;
    }
  },

  getPegawai: (unitKerja?: string) => unitKerja ? MOCK_PEGAWAI.filter(p => p.unitKerja === unitKerja) : MOCK_PEGAWAI,
  
  updatePegawai: (nip: string, data: Partial<Pegawai>) => {
    MOCK_PEGAWAI = MOCK_PEGAWAI.map(p => p.nip === nip ? { ...p, ...data } : p);
    persistData();
    return true;
  },

  getPenugasan: () => MOCK_PENUGASAN,
  getPenugasanById: (id: string) => MOCK_PENUGASAN.find(p => p.id === id),

  getReportReminders: (nip: string) => {
    const today = dataService.getTodayWIT();
    const userTasks = MOCK_PENUGASAN.filter(t => dataService.standardizeNip(t.nip) === dataService.standardizeNip(nip));
    return {
      active: userTasks.filter(t => t.laporanStatus === 'Belum Upload'),
      missing: userTasks.filter(t => t.laporanStatus === 'Belum Upload' && today > t.tanggalSelesai)
    };
  },

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
    });
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

  deleteLaporan: (taskId: string) => {
    MOCK_PENUGASAN = MOCK_PENUGASAN.map(t => t.id === taskId ? {
      ...t,
      laporanStatus: 'Belum Upload',
      statusTugas: 'Aktif',
      uraianTugas: '',
      hasilKerja: '',
      dokumentasiFotos: []
    } : t);
    persistData();
    return true;
  },

  updatePenugasan: (taskId: string, updatedData: Partial<Penugasan>) => {
    MOCK_PENUGASAN = MOCK_PENUGASAN.map(t => t.id === taskId ? {
      ...t,
      ...updatedData
    } : t);
    persistData();
    return true;
  },

  deletePenugasan: (taskId: string) => {
    MOCK_PENUGASAN = MOCK_PENUGASAN.filter(t => t.id !== taskId);
    persistData();
    return true;
  },

  addPenugasan: (task: Penugasan) => {
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

  resetPassword: (id: string, resetBy: string) => {
    MOCK_PEGAWAI = MOCK_PEGAWAI.map(p => p.id === id ? {
      ...p,
      passwordChangeRequired: true,
      lastPasswordResetBy: resetBy,
      lastPasswordResetAt: new Date().toLocaleString('id-ID')
    } : p);
    persistData();
    return true;
  },

  addPegawai: (data: Partial<Pegawai>) => {
    const newP: Pegawai = {
      id: `p-new-${Date.now()}`,
      nama: data.nama || '',
      nip: dataService.standardizeNip(data.nip || ''),
      jabatan: data.jabatan || '',
      unitKerja: data.unitKerja || '',
      role: data.role || Role.PEGAWAI,
      username: dataService.standardizeNip(data.nip || ''),
      passwordChangeRequired: true,
      jenisTugas: data.jenisTugas || 'Luring',
      sumberBiaya: data.sumberBiaya || 'BPMP'
    };
    MOCK_PEGAWAI.push(newP);
    persistData();
    return true;
  },

  exportDatabase: () => {
    const data = {
      penugasan: MOCK_PENUGASAN,
      pegawai: MOCK_PEGAWAI,
      exportAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SI-KERTAS_BACKUP_MANUAL_${new Date().getTime()}.json`;
    link.click();
  },

  clearDatabase: () => {
    if (confirm('PERINGATAN: Semua data laporan dan penugasan yang Anda input manual akan DIHAPUS PERMANEN. Lanjutkan?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  },

  checkConflict: (nip: string, start: string, end: string, jenis: string) => {
    if (jenis === 'Daring') return { conflict: false };
    const cNip = dataService.standardizeNip(nip);
    const hasLuring = MOCK_PENUGASAN.some(p => 
      dataService.standardizeNip(p.nip) === cNip && 
      p.jenisPenugasan === 'Luring' &&
      ((start >= p.tanggalMulai && start <= p.tanggalSelesai) ||
       (end >= p.tanggalMulai && end <= p.tanggalSelesai) ||
       (p.tanggalMulai >= start && p.tanggalMulai <= end))
    );
    return { conflict: hasLuring, message: hasLuring ? `Pegawai terdeteksi memiliki penugasan LURING lain pada periode tsb.` : undefined };
  },

  getKedisiplinan: (nip: string) => MOCK_KEDISIPLINAN.find(k => k.nip === dataService.standardizeNip(nip)),
  getAllUsers: () => [...SYSTEM_USERS, ...MOCK_PEGAWAI],
  getAllKedisiplinan: () => MOCK_KEDISIPLINAN,
  isBertugas: (nip: string) => {
    const today = dataService.getTodayWIT();
    const cNip = dataService.standardizeNip(nip);
    return MOCK_PENUGASAN.some(p => p.nip === cNip && today >= p.tanggalMulai && today <= p.tanggalSelesai);
  },
  getIdleDays: (nip: string) => {
    const cNip = dataService.standardizeNip(nip);
    if (dataService.isBertugas(cNip)) return 0;
    const completed = MOCK_PENUGASAN.filter(p => p.nip === cNip).sort((a,b) => b.tanggalSelesai.localeCompare(a.tanggalSelesai));
    if (completed.length === 0) return 30;
    const lastDate = new Date(completed[0].tanggalSelesai);
    const today = new Date();
    return Math.max(0, Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)));
  },
  getAverageDiscipline: (unitKerja?: string) => {
    let targetNips = MOCK_PEGAWAI;
    if (unitKerja) targetNips = targetNips.filter(p => p.unitKerja === unitKerja);
    const relevantScores = MOCK_KEDISIPLINAN.filter(k => targetNips.some(p => p.nip === k.nip));
    if (relevantScores.length === 0) return 0;
    const sum = relevantScores.reduce((acc, curr) => acc + curr.nilaiAkhir, 0);
    return Math.round(sum / relevantScores.length);
  },
  getDailyStatus: (dateStr: string, unitKerja?: string) => {
    let employees = MOCK_PEGAWAI;
    let tasks = MOCK_PENUGASAN;
    if (unitKerja) {
      employees = employees.filter(p => p.unitKerja === unitKerja);
      const nips = new Set(employees.map(p => p.nip));
      tasks = tasks.filter(t => nips.has(t.nip));
    }
    const bertugas = tasks.filter(t => dateStr >= t.tanggalMulai && dateStr <= t.tanggalSelesai);
    const nipsBertugas = new Set(bertugas.map(t => t.nip));
    const standby = employees.filter(p => !nipsBertugas.has(p.nip));
    return { bertugas, standby };
  }
};
