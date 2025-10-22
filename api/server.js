import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { dataBuffer, flushToDB, sendControlCommand } from "../mqttHandler.js";
import { generatePDFReport } from "../pdfGenerator.js";


const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🧩 Get current in-memory data
app.get("/api/data", (req, res) => {
  res.json({ data: dataBuffer });
  flushToDB();
});

// 💾 Manually flush to DB
app.post("/api/flush", (req, res) => {
  flushToDB();
  res.json({ message: "Data flushed to DB" });
});

// Send control command (start/stop)
app.post("/api/control", (req, res) => {
  const { command } = req.body;
  sendControlCommand(command);
  res.json({ message: `Sent command: ${command}` });
});

app.get("/api/report", async (req, res) => {
  try {
    const filePath = await generatePDFReport();
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.listen(4000, () => console.log("🚀 Backend running on port 3000"));
