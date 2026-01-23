
import { Role, Pegawai, Penugasan, Kedisiplinan } from '../types';

const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';

const SYSTEM_USERS: Pegawai[] = [
  { id: 'sys-admin', nama: 'Administrator Utama', nip: '000000', jabatan: 'Super Admin', unitKerja: 'Pusat Data', role: Role.SUPER_ADMIN, username: 'Admin', passwordChangeRequired: false },
  { id: 'sys-umum', nama: 'Admin Subbag Umum', nip: '111111', jabatan: 'Kepala Subbag Umum', unitKerja: 'Subbag Umum', role: Role.ADMIN_TIM, username: 'umum', passwordChangeRequired: false },
  { id: 'sys-tk1', nama: 'Admin Tim Kerja 1', nip: '222222', jabatan: 'Ketua Tim Kerja 1', unitKerja: 'Tim Kerja 1', role: Role.ADMIN_TIM, username: 'tk1', passwordChangeRequired: false },
];

let MOCK_PEGAWAI: Pegawai[] = [];
let MOCK_PENUGASAN: Penugasan[] = [];
let MOCK_KEDISIPLINAN: Kedisiplinan[] = [];

const normalizeDate = (dateStr: string) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split(/[/-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return dateStr;
};

const parseCSV = (csvText: string) => {
  const rows = [];
  const lines = csvText.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = [];
    let current = '';
    let inQuotes = false;
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

export const dataService = {
  syncAll: async () => {
    try {
      const [pegRes, stRes, disRes] = await Promise.all([
        fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=DATA_PEGAWAI`),
        fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=SURAT_TUGAS`),
        fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=DISIPLIN_PEGAWAI`)
      ]);

      const [pegCsv, stCsv, disCsv] = await Promise.all([pegRes.text(), stRes.text(), disRes.text()]);
      
      const pegRows = parseCSV(pegCsv);
      MOCK_PEGAWAI = pegRows.map((row, idx) => ({
        id: `p-${idx}`,
        nama: row[1] || 'Tanpa Nama',
        nip: (row[0] || '').replace(/\D/g, ''),
        jabatan: row[2] || '-',
        unitKerja: row[3] || '-',
        role: (row[4] as Role) || Role.PEGAWAI,
        username: (row[0] || '').replace(/\D/g, ''),
        passwordChangeRequired: false
      }));

      const stRows = parseCSV(stCsv);
      MOCK_PENUGASAN = stRows.map((row, idx) => ({
        id: `st-${idx}`,
        nomorSurat: row[0] || '',
        namaPegawai: row[1] || '',
        nip: (row[2] || '').replace(/\D/g, ''),
        namaKegiatan: row[3] || '',
        tanggalMulai: normalizeDate(row[4] || ''),
        tanggalSelesai: normalizeDate(row[5] || ''),
        jenisPenugasan: (row[6] as any) || 'Luring',
        sumberBiaya: (row[7] as any) || 'BPMP',
        biaya: parseInt(row[8]) || 0,
        statusTugas: (row[9] as any) || 'Aktif',
        laporanStatus: (row[10] as any) || 'Belum Upload',
        lokasi: row[11] || '',
        uraianTugas: row[12] || '', // Kolom M
        hasilKerja: row[13] || '',  // Kolom N
        dokumentasiFotos: row[14] ? row[14].split('|') : [], // Kolom O
        penandatangan: row[15] || 'Kepala BPMP',
        createdAt: new Date().toISOString()
      }));

      return true;
    } catch (e) {
      console.error("Gagal sinkronisasi data:", e);
      return false;
    }
  },

  getPegawai: (unitKerja?: string) => unitKerja ? MOCK_PEGAWAI.filter(p => p.unitKerja === unitKerja) : MOCK_PEGAWAI,
  
  getPenugasan: () => MOCK_PENUGASAN,

  getPenugasanWithStatus: (unitKerja?: string) => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jayapura' });
    const todayObj = new Date(today);

    let baseST = MOCK_PENUGASAN;
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

      return {
        ...st,
        calculatedStatus: statusLabel,
        calculatedColor: statusColor,
        calculatedContext: statusContext,
        priority
      };
    });
  },

  saveLaporan: (taskId: string, reportData: Partial<Penugasan>) => {
    MOCK_PENUGASAN = MOCK_PENUGASAN.map(t => t.id === taskId ? {
      ...t,
      ...reportData,
      laporanStatus: 'Sudah Upload',
      statusTugas: 'Selesai'
    } : t);
    // In real app: POST to Google Apps Script here
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
    return true;
  },

  getReportReminders: (nip: string) => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jayapura' });
    const cleanNip = nip.replace(/\D/g, '');
    const tasks = dataService.getPenugasanWithStatus().filter(t => t.nip === cleanNip);
    
    return {
      active: tasks.filter(t => today >= t.tanggalMulai && today <= t.tanggalSelesai),
      missing: tasks.filter(t => today > t.tanggalSelesai && t.laporanStatus === 'Belum Upload')
    };
  },

  getKedisiplinan: (nip: string) => MOCK_KEDISIPLINAN.find(k => k.nip === (nip.replace(/\D/g, ''))),
  getAllKedisiplinan: () => MOCK_KEDISIPLINAN,
  getAllUsers: () => [...SYSTEM_USERS, ...MOCK_PEGAWAI],
  isBertugas: (nip: string) => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jayapura' });
    const cleanNip = nip.replace(/\D/g, '');
    return MOCK_PENUGASAN.some(p => p.nip === cleanNip && today >= p.tanggalMulai && today <= p.tanggalSelesai);
  },

  getIdleDays: (nip: string) => {
    const cleanNip = nip.replace(/\D/g, '');
    if (dataService.isBertugas(cleanNip)) return 0;
    const completed = MOCK_PENUGASAN.filter(p => p.nip === cleanNip).sort((a,b) => b.tanggalSelesai.localeCompare(a.tanggalSelesai));
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

  addPenugasanBatch: (baseTask: Partial<Penugasan>, selectedPegawai: Pegawai[]) => {
    const newTasks: Penugasan[] = selectedPegawai.map(p => ({
      ...baseTask as Penugasan,
      id: `st-${Date.now()}-${p.nip}`,
      namaPegawai: p.nama,
      nip: p.nip.replace(/\D/g, ''),
      jabatan: p.jabatan,
      statusTugas: 'Aktif',
      laporanStatus: 'Belum Upload',
      createdAt: new Date().toISOString()
    }));
    MOCK_PENUGASAN = [...newTasks, ...MOCK_PENUGASAN];
    return true;
  },

  addPenugasan: (task: Penugasan) => {
    MOCK_PENUGASAN = [task, ...MOCK_PENUGASAN];
    return true;
  },

  addPegawai: (newPegawai: Partial<Pegawai>) => {
    const p: Pegawai = {
      id: `p-manual-${Date.now()}`,
      nama: newPegawai.nama || 'Anonim',
      nip: (newPegawai.nip || '').replace(/\D/g, ''),
      jabatan: newPegawai.jabatan || '-',
      unitKerja: newPegawai.unitKerja || 'Umum',
      role: newPegawai.role || Role.PEGAWAI,
      username: (newPegawai.nip || '').replace(/\D/g, ''),
      passwordChangeRequired: false
    };
    MOCK_PEGAWAI = [p, ...MOCK_PEGAWAI];
    return p;
  },

  resetPassword: (empId: string, resetBy: string) => {
    MOCK_PEGAWAI = MOCK_PEGAWAI.map(e => e.id === empId ? { ...e, passwordChangeRequired: true } : e);
    return true;
  },

  checkConflict: (nip: string, start: string, end: string, type: string) => {
    if (type === 'Daring') return { conflict: false };
    const cleanNip = nip.replace(/\D/g, '');
    const overlapping = MOCK_PENUGASAN.find(t => t.nip === cleanNip && t.jenisPenugasan === 'Luring' && (start <= t.tanggalSelesai && end >= t.tanggalMulai));
    return overlapping ? { conflict: true, message: `BENTROK: Pegawai bertugas di ${overlapping.lokasi}` } : { conflict: false };
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
