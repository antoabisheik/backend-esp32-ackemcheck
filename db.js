import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "data", "fitness.db");

sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS fitness_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reps INTEGER,
      weight INTEGER,
      battery FLOAT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export default db;
