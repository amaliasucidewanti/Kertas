
export interface SimpleTask {
  id_tugas: string;
  nama_pegawai: string;
  tugas: string;
  status: string;
  tanggal: string;
}

const GAS_URL = (import.meta as any).env.VITE_GAS_API_URL;

export const taskSheetService = {
  // Mengambil data (GET)
  fetchTasks: async (): Promise<SimpleTask[]> => {
    if (!GAS_URL) return [];
    try {
      const res = await fetch(GAS_URL);
      if (!res.ok) throw new Error("Gagal mengambil data");
      return await res.json();
    } catch (e) {
      console.error("Fetch Error:", e);
      return [];
    }
  },

  // Mengirim data (POST)
  addTask: async (task: Omit<SimpleTask, 'id_tugas' | 'tanggal' | 'status'>): Promise<boolean> => {
    if (!GAS_URL) return false;
    try {
      const payload = {
        ...task,
        id_tugas: `TGS-${Date.now()}`,
        tanggal: new Date().toISOString(),
        status: 'Aktif'
      };

      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Gunakan text/plain untuk menghindari CORS preflight di GAS
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.error("Post Error:", e);
      return false;
    }
  }
};
