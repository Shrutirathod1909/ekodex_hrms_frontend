import React from "react";
import { Button, Card, Table } from "react-bootstrap";
import "./banktrf.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BankTrfSheet = ({ bankTrfData }) => {
  // ================= SAFE DATA =================

  const employees = bankTrfData?.empWages || [];

  const siteDetail = bankTrfData?.siteDetail || {};

  const month = bankTrfData?.month || "";

  const year = bankTrfData?.year || "";

  // ================= TOTAL =================

  const totalAmount = employees.reduce(
    (sum, emp) => sum + Number(emp.gross_salary || 0),
    0,
  );

  // ================= MONTH NAMES =================

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // ================= MONTH NAME =================

  const monthName = monthNames[Number(month) - 1] || month;

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = () => {
    const printArea = document.querySelector(".print-area");

    if (!printArea) {
      console.error("Print area not found");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      alert("Please allow popups to print the Bank Transfer Sheet.");
      return;
    }

    const printContent = printArea.cloneNode(true);

    // Remove buttons
    printContent
      .querySelectorAll(".no-print")
      .forEach((element) => element.remove());

    printWindow.document.open();

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <title>Bank Transfer Sheet</title>

        <style>

          /* =====================================================
             PAGE
          ===================================================== */

          @page {
            size: landscape;
            margin: 8mm;
          }

          * {
            box-sizing: border-box;
          }

          html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;

            width: 100% !important;
            min-width: 0 !important;

            background: #ffffff !important;

            font-family: Arial, Helvetica, sans-serif;

            overflow: visible !important;

            writing-mode: horizontal-tb !important;
          }


          /* =====================================================
             PRINT AREA
          ===================================================== */

          .print-area {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;

            margin: 0 !important;
            padding: 0 !important;

            display: block !important;

            position: static !important;

            transform: none !important;
            rotate: none !important;

            writing-mode: horizontal-tb !important;
          }


          /* =====================================================
             HEADER
          ===================================================== */

          .page-header {
            width: 100% !important;

            margin: 0 0 6px 0 !important;
            padding: 0 !important;

            display: flex !important;
            flex-direction: row !important;

            justify-content: space-between !important;
            align-items: center !important;

            position: static !important;

            transform: none !important;
            rotate: none !important;
          }

          .header-details {
            display: flex !important;
            flex-direction: row !important;

            align-items: center !important;

            gap: 20px !important;

            white-space: nowrap !important;
          }

          .header-details h4 {
            margin: 0 !important;
            padding: 0 !important;

            font-size: 16px !important;
            font-weight: 700 !important;

            white-space: nowrap !important;
          }

          .header-info {
            display: flex !important;
            flex-direction: row !important;

            align-items: center !important;

            gap: 15px !important;

            font-size: 11px !important;

            white-space: nowrap !important;
          }


          /* =====================================================
             TABLE WRAPPER
          ===================================================== */

          .bank-table-wrapper {
            width: 100% !important;

            margin: 0 !important;
            padding: 0 !important;

            display: block !important;

            overflow: visible !important;

            position: static !important;
          }


          /* =====================================================
             TABLE
          ===================================================== */

          table {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;

            margin: 0 !important;
            padding: 0 !important;

            border-collapse: collapse !important;
            border-spacing: 0 !important;

            table-layout: auto !important;

            display: table !important;

            position: static !important;

            transform: none !important;
            rotate: none !important;

            writing-mode: horizontal-tb !important;
            direction: ltr !important;
          }


          /* =====================================================
             TABLE ROWS
          ===================================================== */

          thead {
            display: table-header-group !important;
          }

          tbody {
            display: table-row-group !important;
          }

          tr {
            display: table-row !important;

            page-break-inside: avoid !important;
            break-inside: avoid !important;

            transform: none !important;
            rotate: none !important;
          }


          /* =====================================================
             TABLE CELLS
          ===================================================== */

          th,
          td {
            display: table-cell !important;

            border: 1px solid #000 !important;

            padding: 4px 6px !important;

            font-size: 10px !important;
            line-height: 1.2 !important;

            color: #000 !important;

            text-align: center !important;
            vertical-align: middle !important;

            white-space: nowrap !important;

            writing-mode: horizontal-tb !important;
            direction: ltr !important;

            transform: none !important;
            rotate: none !important;
          }

          th {
            font-weight: 700 !important;
          }


          /* =====================================================
             TABLE HEADER
          ===================================================== */

          .table-dark {
            background-color: #343a40 !important;
            color: #ffffff !important;

            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }


          /* =====================================================
             TOTAL
          ===================================================== */

          .table-warning {
            background-color: #ffeeba !important;
            color: #000000 !important;

            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }


          /* =====================================================
             HIDE
          ===================================================== */

          .no-print,
          button,
          .btn {
            display: none !important;
          }

        </style>
      </head>

      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  };

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const handleDownloadExcel = () => {
    if (employees.length === 0) {
      return;
    }

    // ================= EXCEL DATA =================

    const excelData = employees.map((emp, index) => ({
      "Sr No": index + 1,

      "Employee Name": emp.emp_full_name || "-",

      "Beneficiary Name": Array.isArray(emp.ac_holder_name)
        ? emp.ac_holder_name[1] || "-"
        : emp.ac_holder_name || "-",

      "Bank Name": Array.isArray(emp.bank_name)
        ? emp.bank_name[1] || "-"
        : emp.bank_name || "-",

      "Account Number": emp.account_no || emp.card_no || "-",

      "IFSC Code": emp.bank_ifsc || "-",

      Amount: Number(emp.gross_salary || 0),
    }));

    // ================= TOTAL ROW =================

    excelData.push({
      "Sr No": "",

      "Employee Name": "",

      "Beneficiary Name": "",

      "Bank Name": "",

      "Account Number": "",

      "IFSC Code": "Total",

      Amount: totalAmount,
    });

    // ================= CREATE WORKSHEET =================

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // ================= EXCEL COLUMN WIDTH =================

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 28 },
      { wch: 22 },
      { wch: 20 },
      { wch: 18 },
      { wch: 15 },
    ];

    // ================= CREATE WORKBOOK =================

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Transfer Sheet");

    // ================= GENERATE BUFFER =================

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // ================= SAVE FILE =================

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, `Bank_Transfer_Sheet_${monthName}_${year}.xlsx`);
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="container-fluid">
      <div className="print-area">
        {/* =================================================
            HEADER
        ================================================= */}

        <Card.Header className="page-header">
          {/* ================= LEFT ================= */}

          <div className="header-details">
            <h4 className="fw-bold">Bank Transfer Sheet</h4>

            <div className="header-info">
              <span>
                <strong>Site:</strong> {siteDetail?.site_name || "-"}
              </span>

              <span>
                <strong>Month:</strong> {monthName} / {year}
              </span>
            </div>
          </div>

          {/* ================= RIGHT ================= */}

          <div className="header-actions no-print">
            <Button
              variant="danger"
              className="compact-btn"
              onClick={handlePrint}
            >
              Print
            </Button>

            <Button
              variant="success"
              className="compact-btn"
              onClick={handleDownloadExcel}
            >
              Download
            </Button>
          </div>
        </Card.Header>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="bank-table-wrapper">
          <Table
            bordered
            hover
            className="bank-trf-table text-center align-middle"
          >
            <thead className="table-dark">
              <tr>
                <th>Sr No</th>

                <th>Employee Name</th>

                <th>Beneficiary Name</th>

                <th>Bank Name</th>

                <th>Account Number</th>

                <th>IFSC Code</th>

                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((emp, index) => (
                  <tr key={index}>
                    {/* ================= SR NO ================= */}

                    <td>{index + 1}</td>

                    {/* ================= EMPLOYEE NAME ================= */}

                    <td>{emp.emp_full_name || "-"}</td>

                    {/* ================= BENEFICIARY ================= */}

                    <td>
                      {Array.isArray(emp.ac_holder_name)
                        ? emp.ac_holder_name[1] || "-"
                        : emp.ac_holder_name || "-"}
                    </td>

                    {/* ================= BANK NAME ================= */}

                    <td>
                      {Array.isArray(emp.bank_name)
                        ? emp.bank_name[1] || "-"
                        : emp.bank_name || "-"}
                    </td>

                    {/* ================= ACCOUNT NUMBER ================= */}

                    <td>{emp.account_no || emp.card_no || "-"}</td>

                    {/* ================= IFSC ================= */}

                    <td>{emp.bank_ifsc || "-"}</td>

                    {/* ================= AMOUNT ================= */}

                    <td>₹{Number(emp.gross_salary || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center fw-bold text-danger">
                    No Data Found
                  </td>
                </tr>
              )}

              {/* ================= TOTAL ================= */}

              {employees.length > 0 && (
                <tr className="table-warning fw-bold">
                  <td colSpan={6} className="text-end">
                    Total Amount
                  </td>

                  <td>₹{totalAmount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BankTrfSheet;
