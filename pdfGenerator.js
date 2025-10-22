import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import db from "./db.js";

export async function generatePDFReport() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const filePath = path.join("data", `report_${Date.now()}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("🏋️ Fitness Data Report", { align: "center" });
    doc.moveDown();

    db.all(
      "SELECT * FROM fitness_data ORDER BY id DESC LIMIT 1000",
      [],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        doc.fontSize(12);
        doc.text("Showing last 1000 records\n\n");
        doc.text("Reps | Weight | Battery | Timestamp");
        doc.moveDown(0.5);

        rows.forEach((r) => {
          doc.text(`${r.reps} | ${r.weight} | ${r.battery} | ${r.timestamp}`);
        });

        doc.end();

        stream.on("finish", () => resolve(filePath));
      }
    );
  });
}
