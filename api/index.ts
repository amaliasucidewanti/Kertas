import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Move data file to root so it's outside the api folder
const DATA_FILE = path.join(__dirname, "..", "data.json");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// API Routes
app.get("/api/data", (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      res.json(JSON.parse(data));
    } else {
      res.json({
        penugasan: [],
        pegawai: [],
        programKegiatan: [],
        lastSyncProgram: null,
        lastUpdate: new Date(0).toISOString()
      });
    }
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "Failed to read data" });
  }
});

app.post("/api/data", (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Failed to save data" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  try {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } catch (e) {
    console.error("Failed to start Vite dev server:", e);
  }
}

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
