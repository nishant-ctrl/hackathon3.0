import xlsx from "xlsx";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DB_PATH = process.env.MONGO_URI;
const namasteSchema = new mongoose.Schema({
  id: Number,
  NAMC_CODE: String,
  NAMC_TERM: String,
  short_definition: String,
  long_definition: String,
});

const namasteSchema1 = new mongoose.Schema({
  id: Number,
  NAMC_CODE: String,
  NAMC_TERM: String,
  NAMC_term_diacritical: String,
  short_definition: String,
  long_definition: String,
});
mongoose.connect(DB_PATH);
//const NamasteCode = mongoose.model("NamasteCode", namasteSchema);
const AyurvedaModel = mongoose.model("AyurvedaCode", namasteSchema1);
const SiddhaModel = mongoose.model("SiddhaCode", namasteSchema);
const UnaniModel = mongoose.model("UnaniCode", namasteSchema);

async function importExcelToCollection(filePath, Model) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const formattedData = sheetData.map((row) => ({
    id: row.NAMC_ID,
    NAMC_CODE: row.NAMC_CODE,
    NAMC_TERM: row.NAMC_TERM,
    short_definition: row.Short_definition || undefined,
    long_definition: row.Long_definition || undefined,
    NAMC_term_diacritical: row.NAMC_term_diacritical || undefined,
  }));
  await Model.insertMany(formattedData);
  console.log(`✅ Imported ${filePath} into ${Model.collection.name}`);
}

await importExcelToCollection(
  "D:/SIH2025/Database/Nam_ayurveda.xls",
  AyurvedaModel
);
await importExcelToCollection("D:/SIH2025/Database/shidda.xlsx", SiddhaModel);
await importExcelToCollection("D:/SIH2025/Database/Nam_unani.xls", UnaniModel);
