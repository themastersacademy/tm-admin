import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Reads an Excel file buffer and returns JSON data.
 * Mimics XLSX.utils.sheet_to_json(worksheet, { defval: "" })
 * @param {ArrayBuffer} buffer - The file buffer
 * @returns {Promise<Array<Object>>} - Array of objects representing rows
 */
export const readExcel = async (buffer, fileName) => {
  if (fileName && fileName.toLowerCase().endsWith(".csv")) {
    const text = new TextDecoder("utf-8").decode(buffer);
    return parseCSV(text);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0]; // Read first sheet

  if (!worksheet) return [];

  const data = [];
  const headers = {};

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Map column numbers to header names
      row.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value ? cell.value.toString().trim() : "";
      });
    } else {
      const rowData = {};
      let hasData = false;

      // Iterate through all columns identified in the header
      Object.keys(headers).forEach((key) => {
        const colNumber = parseInt(key);
        const headerName = headers[colNumber];
        const cell = row.getCell(colNumber);

        // internalValue or value? value is safer for read.
        let cellValue = cell.value;

        // Handle rich text or formulas (get result)
        if (cellValue && typeof cellValue === "object") {
          if (cellValue.text) {
            cellValue = cellValue.text;
          } else if (cellValue.result !== undefined) {
            cellValue = cellValue.result;
          }
        }

        if (cellValue === null || cellValue === undefined) {
          cellValue = "";
        }

        if (cellValue !== "") hasData = true;

        rowData[headerName] = cellValue;
      });

      if (hasData) {
        data.push(rowData);
      }
    }
  });

  return data;
};

// Helper: Simple CSV Parser handling quotes
const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseCSVLine(lines[i]);
    if (rowValues.length === 0) continue;

    const rowData = {};
    let hasData = false;

    headers.forEach((header, index) => {
      let val = rowValues[index] || "";
      if (val) hasData = true;
      rowData[header] = val;
    });

    if (hasData) data.push(rowData);
  }

  return data;
};

const parseCSVLine = (line) => {
  const values = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          currentVal += '"';
          i++;
        } else {
          // End quote
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        values.push(currentVal.trim());
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
  }
  values.push(currentVal.trim());
  return values;
};

/**
 * Writes data to an Excel file and triggers download.
 * @param {Array<Object>} data - Data to write
 * @param {string} fileName - Name of the file to save
 * @param {string} sheetName - Name of the sheet
 * @param {Array<string>} headers - Optional ordered list of headers
 */
export const writeExcel = async (
  data,
  fileName,
  sheetName = "Sheet1",
  headers = null,
  validations = null
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Determine columns
  let columns = [];
  if (headers && headers.length > 0) {
    columns = headers.map((h) => ({ header: h, key: h, width: 20 }));
  } else if (data && data.length > 0) {
    columns = Object.keys(data[0]).map((k) => ({
      header: k,
      key: k,
      width: 20,
    }));
  }

  worksheet.columns = columns;

  if (data && data.length > 0) {
    worksheet.addRows(data);
  }

  // Apply Validations
  if (validations) {
    // Find column index by header/key
    worksheet.columns.forEach((col) => {
      const colKey = col.key;
      if (validations[colKey]) {
        // Apply validation to all cells in this column (excluding header)
        // Or just some sensible range, e.g., until row 1000
        for (let i = 2; i <= 1000; i++) {
          worksheet.getCell(i, col.number).dataValidation = validations[colKey];
        }
      }
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, fileName);
};
