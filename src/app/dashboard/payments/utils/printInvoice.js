import { invoiceConfig } from "./invoiceConfig";

export const printInvoice = (selectedUser) => {
  if (!selectedUser) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const totalAmount = selectedUser.amount || 0;
  const baseAmount = (totalAmount / 1.18).toFixed(2);
  const cgst = ((totalAmount - baseAmount) / 2).toFixed(2);
  const sgst = ((totalAmount - baseAmount) / 2).toFixed(2);

  // Format invoice number with leading zeros
  const invoiceNo = selectedUser.order?.id || selectedUser.orderId || "N/A";
  const formattedInvoiceNo = `052/2025-${String(invoiceNo).padStart(4, "0")}`;

  // Format date
  const invoiceDate = selectedUser.createdAt
    ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

  // Get course/subscription name
  const courseName =
    selectedUser.courseName ||
    selectedUser.subscriptionName ||
    "Complete Course on General Aptitude for All Competitive Exams and Campus Placements";

  const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Tax Invoice - ${formattedInvoiceNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              color: #000; 
              background: #fff; 
              line-height: 1.4; 
            }
            .invoice-container { 
              max-width: 210mm; 
              margin: 0 auto; 
              padding: 15px;
              border: 1px solid #000;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .company-info { 
              flex: 1; 
            }
            .company-name { 
              font-size: 32px; 
              font-weight: bold; 
              color: #5BA4CF; 
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            .company-tagline {
              font-size: 11px;
              color: #5BA4CF;
              font-weight: bold;
              margin-bottom: 10px;
              letter-spacing: 0.5px;
            }
            .company-details {
              font-size: 11px;
              line-height: 1.6;
              color: #333;
            }
            .company-logo {
              width: 120px;
              height: auto;
            }
            .invoice-title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 15px 0;
              color: #000;
            }
            .customer-section {
              border: 1px solid #000;
              padding: 10px;
              margin-bottom: 10px;
            }
            .customer-label {
              font-weight: bold;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .customer-details {
              font-size: 11px;
              line-height: 1.6;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              border-left: 1px solid #000;
              border-right: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 8px 10px;
              font-size: 11px;
            }
            .invoice-no {
              color: #d9534f;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              border: 1px solid #000;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              text-align: center;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .note {
              font-size: 10px;
              font-style: italic;
              margin: 10px 0;
            }
            .validity-section {
              font-size: 10px;
              margin: 10px 0;
              padding: 8px;
              background-color: #f9f9f9;
              border-left: 3px solid #5BA4CF;
            }
            .footer-section {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
            }
            .footer-title {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #333;
            }
            .footer-text {
              font-size: 9px;
              line-height: 1.5;
              color: #666;
            }
            .computer-generated {
              text-align: center;
              font-size: 10px;
              font-style: italic;
              margin-top: 20px;
              color: #999;
            }
            @media print { 
              body { padding: 0; } 
              .invoice-container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <div class="company-name">${invoiceConfig.companyName}</div>
                <div class="company-tagline">${
                  invoiceConfig.companyTagline
                }</div>
                <div class="company-details">
                  ${invoiceConfig.companyAddress.join("<br>")}<br>
                  GSTIN: ${invoiceConfig.gstin}
                </div>
              </div>
              <div>
                <img src="${
                  invoiceConfig.logoUrl
                }" alt="Masters Academy Logo" class="company-logo" onerror="this.style.display='none'">
                <div style="font-size: 10px; margin-top: 5px; text-align: right;">
                  ${invoiceConfig.contactInfo.join("<br>")}
                </div>
              </div>
            </div>

            <!-- Invoice Title -->
            <div class="invoice-title">Tax Invoice</div>

            <!-- Customer Section -->
            <div class="customer-section">
              <div class="customer-label">To</div>
              <div class="customer-details">
                ${selectedUser.userMeta?.name || "Customer"}<br>
                Email: ${selectedUser.userMeta?.email || "N/A"}<br>
                ${
                  selectedUser.userMeta?.billingInfo?.city
                    ? selectedUser.userMeta.billingInfo.city + ", "
                    : ""
                }
                ${selectedUser.userMeta?.billingInfo?.state || ""}<br>
                Mobile: ${
                  selectedUser.userMeta?.billingInfo?.phone ||
                  selectedUser.userMeta?.phone ||
                  "N/A"
                }
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
              <div>Invoice No.: <span class="invoice-no">${formattedInvoiceNo}</span></div>
              <div>Dated: ${invoiceDate}</div>
            </div>

            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 8%;">S.No.</th>
                  <th style="width: 52%;">Particulars</th>
                  <th style="width: 15%;">HSN/SAC</th>
                  <th style="width: 25%;">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center">1</td>
                  <td>${courseName}</td>
                  <td class="text-center">9992</td>
                  <td class="text-right">${parseFloat(baseAmount).toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">CGST (9%)</td>
                  <td class="text-right">${cgst}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">SGST (9%)</td>
                  <td class="text-right">${sgst}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="text-center">Total Amount</td>
                  <td class="text-right">${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Validity Note -->
            <div class="validity-section">
              <strong>Course Validity:</strong> ${
                selectedUser.validity ||
                selectedUser.courseDuration ||
                "6 months"
              } from the date of purchase
            </div>

            <!-- Refund Policy -->
            <div class="footer-section">
              <div class="footer-title">Refund Policy:</div>
              <div class="footer-text">
                ${invoiceConfig.refundPolicy.join("<br>")}
              </div>
            </div>

            <!-- Terms & Conditions -->
            <div class="footer-section">
              <div class="footer-title">Terms & Conditions:</div>
              <div class="footer-text">
                ${invoiceConfig.termsAndConditions.join("<br>")}
              </div>
            </div>

            <!-- Computer Generated Notice -->
            <div class="computer-generated">
              This is a computer-generated invoice. No signature required.<br>
              Generated on: ${new Date().toLocaleString("en-IN")}
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};
