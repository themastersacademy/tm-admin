import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Reads an Excel file buffer and returns JSON data.
 * Mimics XLSX.utils.sheet_to_json(worksheet, { defval: "" })
 * @param {ArrayBuffer} buffer - The file buffer
 * @returns {Promise<Array<Object>>} - Array of objects representing rows
 */
export const readExcel = async (buffer) => {
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
  headers = null
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

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, fileName);
};
