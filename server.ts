import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const gasUrl = process.env.GAS_WEBAPP_URL;

  const callGas = async (params: any) => {
    if (!gasUrl) {
      throw new Error('GAS_WEBAPP_URL not configured');
    }

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`GAS call failed: ${response.statusText}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  };

  // API Routes
  app.get('/api/data', async (req: Request, res: Response) => {
    try {
      if (!gasUrl) throw new Error('GAS_WEBAPP_URL not configured');
      const response = await fetch(`${gasUrl}?action=read`);
      const data = await response.json();
      
      res.json({
        pegawai: data.DATA_PEGAWAI || [],
        kedisiplinan: data.DISIPLIN_PEGAWAI || [],
        penugasan: data.DATA_PENUGASAN || [],
        programKegiatan: data.PROGRAM_KEGIATAN || [],
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/penugasan', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'add',
        sheet: 'DATA_PENUGASAN',
        data: req.body
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/penugasan/:id', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'update',
        sheet: 'DATA_PENUGASAN',
        idField: 'id',
        idValue: req.params.id,
        data: req.body
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/penugasan/:id', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'delete',
        sheet: 'DATA_PENUGASAN',
        idField: 'id',
        idValue: req.params.id
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/pegawai', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'add',
        sheet: 'DATA_PEGAWAI',
        data: req.body
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/pegawai/:nip', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'update',
        sheet: 'DATA_PEGAWAI',
        idField: 'nip',
        idValue: req.params.nip,
        data: req.body
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/program-kegiatan', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'add',
        sheet: 'PROGRAM_KEGIATAN',
        data: req.body
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/program-kegiatan/:id', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'update',
        sheet: 'PROGRAM_KEGIATAN',
        idField: 'id',
        idValue: req.params.id,
        data: req.body
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/program-kegiatan/:id', async (req: Request, res: Response) => {
    try {
      await callGas({
        action: 'delete',
        sheet: 'PROGRAM_KEGIATAN',
        idField: 'id',
        idValue: req.params.id
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
