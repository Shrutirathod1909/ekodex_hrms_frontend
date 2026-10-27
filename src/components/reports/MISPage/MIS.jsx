// import React, { useRef } from "react";
// import {
//   Button,
//   Card,
//   Table,
// } from "react-bootstrap";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import "./MIS.css";

// const MIS = ({
//   data,
//   loading,
//   billData,
// }) => {
//   const printRef = useRef();

//   // ================= COMPANY =================

//   const companyDetail =
//     billData?.company_detail?.[0] || {};

//   // ================= MONTH NAME =================

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   // ================= API DATA =================

//   const bill =
//     data?.billInfo?.[0] || {};

//   const monthName =
//     monthNames[
//       Number(bill?.invoice_month) - 1
//     ] || bill?.invoice_month || "Month";

//   const invoiceYear =
//     bill?.invoice_year || "";

//   // ================= LOADING =================

//   if (loading) {
//     return (
//       <h5 className="text-center my-4">
//         Loading...
//       </h5>
//     );
//   }

//   // ================= NO DATA =================

//   if (
//     !data ||
//     !data.particulars
//   ) {
//     return (
//       <h5 className="text-center my-4">
//         No MIS Data Found
//       </h5>
//     );
//   }

//   // ================= FORMAT AMOUNT =================

//   const formatAmount = (value) => {
//     return Number(value || 0).toLocaleString(
//       "en-IN",
//       {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }
//     );
//   };

//   // ================= PRINT =================

//   const handlePrint = () => {
//     const printArea =
//       printRef.current;

//     if (!printArea) {
//       console.error(
//         "MIS print area not found."
//       );
//       return;
//     }

//     const printWindow = window.open(
//       "",
//       "_blank",
//       "width=1200,height=900"
//     );

//     if (!printWindow) {
//       alert(
//         "Please allow popup window to print MIS report."
//       );
//       return;
//     }

//     // Clone complete report
//     const clonedContent =
//       printArea.cloneNode(true);

//     // Remove print-disabled elements
//     clonedContent
//       .querySelectorAll(
//         ".no-print, .noprint"
//       )
//       .forEach((element) => {
//         element.remove();
//       });

//     printWindow.document.open();

//     printWindow.document.write(`
//       <!DOCTYPE html>

//       <html>

//         <head>

//           <meta charset="UTF-8" />

//           <title>
//             MIS_Report_${monthName}_${invoiceYear}
//           </title>

//           <style>

//             /* ================= PAGE ================= */

//             @page {
//               size: A4 portrait;
//               margin: 10mm;
//             }

//             * {
//               box-sizing: border-box;
//             }

//             html,
//             body {
//               width: 100%;
//               min-width: 0;
//               max-width: 100%;

//               margin: 0;
//               padding: 0;

//               background: #ffffff;

//               font-family:
//                 Arial,
//                 Helvetica,
//                 sans-serif;
//             }

//             body {
//               -webkit-print-color-adjust: exact;
//               print-color-adjust: exact;
//             }

//             /* ================= MAIN REPORT ================= */

//             .print-area {
//               width: 100%;
//               max-width: 100%;

//               margin: 0;
//               padding: 0;

//               background: #ffffff;

//               box-shadow: none !important;
//               border-radius: 0 !important;
//             }

//             /* ================= HEADER ================= */

//             .print-page-header {
//               width: 100%;

//               text-align: center;

//               margin: 0 0 12px 0;

//               padding: 0 0 9px 0;

//               border-bottom: 2px solid #000;
//             }

//             .print-page-header h3 {
//               margin: 0 0 3px 0;

//               padding: 0;

//               font-size: 20px;

//               line-height: 24px;

//               font-weight: 700;

//               color: #000 !important;
//             }

//             .print-page-header h5 {
//               margin: 0 0 3px 0;

//               padding: 0;

//               font-size: 15px;

//               line-height: 18px;

//               font-weight: 700;

//               color: #000 !important;
//             }

//             .print-page-header p {
//               margin: 0;

//               padding: 0;

//               font-size: 11px;

//               line-height: 15px;

//               color: #000 !important;
//             }

//             .print-page-header strong {
//               color: #000 !important;

//               font-weight: 700;
//             }

//             /* ================= REPORT TITLE ================= */

//             .print-report-title {
//               display: none;
//             }

//             /* ================= AMOUNT ROW ================= */

//             .row {
//               display: flex !important;

//               width: 100%;

//               margin: 0 0 12px 0 !important;

//               padding: 0;
//             }

//             .col-md-6 {
//               width: 50% !important;

//               padding-left: 4px !important;
//               padding-right: 4px !important;
//             }

//             .col-md-6:first-child {
//               padding-left: 0 !important;
//             }

//             .col-md-6:last-child {
//               padding-right: 0 !important;
//             }

//             /* ================= AMOUNT CARD ================= */

//             .amount-card {
//               width: 100%;

//               margin: 0 !important;

//               padding: 0;

//               background: #ffffff !important;

//               border:
//                 1px solid #000 !important;

//               border-radius: 4px !important;

//               box-shadow: none !important;
//             }

//             .amount-card .card-body {
//               padding: 8px !important;

//               text-align: center;
//             }

//             .amount-card h6 {
//               margin: 0 0 3px 0 !important;

//               padding: 0;

//               font-size: 10px !important;

//               line-height: 13px;

//               font-weight: 700 !important;

//               color: #000 !important;
//             }

//             .amount-card h4 {
//               margin: 0 !important;

//               padding: 0;

//               font-size: 15px !important;

//               line-height: 19px;

//               font-weight: 700 !important;

//               color: #000 !important;
//             }

//             /* ================= MIS TABLE ================= */

//             .mis-table {
//               width: 100% !important;

//               max-width: 100% !important;

//               margin: 0 !important;

//               padding: 0;

//               table-layout: fixed !important;

//               border-collapse: collapse !important;

//               border-spacing: 0 !important;

//               box-shadow: none !important;
//             }

//             .mis-table thead {
//               display: table-header-group;
//             }

//             .mis-table tbody {
//               display: table-row-group;
//             }

//             .mis-table tr {
//               page-break-inside: avoid !important;

//               break-inside: avoid !important;
//             }

//             .mis-table th,
//             .mis-table td {
//               border:
//                 1px solid #000 !important;

//               vertical-align: middle !important;
//             }

//             .mis-table th {
//               background: #000 !important;

//               color: #fff !important;

//               padding: 7px 6px !important;

//               font-size: 11px !important;

//               line-height: 14px !important;

//               font-weight: 700 !important;

//               text-align: center !important;
//             }

//             .mis-table td {
//               background: #fff !important;

//               color: #000 !important;

//               padding: 6px !important;

//               font-size: 11px !important;

//               line-height: 14px !important;

//               font-weight: 600 !important;
//             }

//             /* ================= COLUMN WIDTH ================= */

//             .mis-table th:nth-child(1),
//             .mis-table td:nth-child(1) {
//               width: 70px !important;

//               text-align: center !important;
//             }

//             .mis-table th:nth-child(2),
//             .mis-table td:nth-child(2) {
//               width: auto !important;

//               text-align: left !important;

//               word-break: break-word;
//             }

//             .mis-table th:nth-child(3),
//             .mis-table td:nth-child(3) {
//               width: 150px !important;

//               text-align: right !important;
//             }

//             /* ================= PRINT ================= */

//             @media print {

//               .no-print,
//               .noprint {
//                 display: none !important;
//               }

//             }

//           </style>

//         </head>

//         <body>

//           ${clonedContent.outerHTML}

//         </body>

//       </html>
//     `);

//     printWindow.document.close();

//     /*
//      * Give popup enough time to render
//      * before opening print dialog.
//      */
//     setTimeout(() => {
//       printWindow.focus();

//       printWindow.print();

//       /*
//        * Close popup after print dialog.
//        */
//       setTimeout(() => {
//         printWindow.close();
//       }, 1000);
//     }, 600);
//   };

//   // ================= EXCEL DOWNLOAD =================

//   const handleDownloadExcel = () => {
//     const excelData =
//       data?.particulars?.map(
//         (item) => ({
//           "SL.NO":
//             item.sr_no,

//           PARTICULARS:
//             item.particulars,

//           AMOUNT:
//             item.amount,
//         })
//       ) || [];

//     // ================= BASE AMOUNT =================

//     excelData.unshift({
//       "SL.NO": "",

//       PARTICULARS:
//         "BASE AMOUNT",

//       AMOUNT:
//         data?.base_amount,
//     });

//     // ================= GST AMOUNT =================

//     excelData.unshift({
//       "SL.NO": "",

//       PARTICULARS:
//         "GST AMOUNT",

//       AMOUNT:
//         data?.gst_amount,
//     });

//     // ================= WORKSHEET =================

//     const worksheet =
//       XLSX.utils.json_to_sheet(
//         excelData
//       );

//     // ================= WORKBOOK =================

//     const workbook =
//       XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(
//       workbook,
//       worksheet,
//       "MIS Report"
//     );

//     // ================= EXCEL BUFFER =================

//     const excelBuffer =
//       XLSX.write(
//         workbook,
//         {
//           bookType: "xlsx",
//           type: "array",
//         }
//       );

//     // ================= FILE =================

//     const fileData =
//       new Blob(
//         [excelBuffer],
//         {
//           type:
//             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
//         }
//       );

//     // ================= DOWNLOAD =================

//     saveAs(
//       fileData,
//       `MIS_Report_${monthName}_${invoiceYear}.xlsx`
//     );
//   };

//   // ================= UI =================

//   return (
//     <div className="mis-container">

//       {/* =====================================================
//           SCREEN HEADER
//       ===================================================== */}

//       <Card.Header
//         className="
//           page-header
//           d-flex
//           justify-content-between
//           align-items-center
//           flex-wrap
//         "
//       >
//         <div>
//           <h3 className="mb-1">
//             {
//               companyDetail?.company_name ||
//               "EKODEX TECHNOLOGIES PVT LTD"
//             }
//           </h3>

//           <h5 className="mb-1">
//             MIS REPORT
//           </h5>

//           <p className="mb-0">
//             Month :{" "}
//             <strong>
//               {monthName}
//               {" / "}
//               {invoiceYear}
//             </strong>
//           </p>
//         </div>

//         {/* ================= ACTION BUTTONS ================= */}

//         <div className="d-flex gap-2 no-print">

//           <Button
//             variant="dark"
//             className="mis-print-btn"
//             onClick={handlePrint}
//           >
//             Print
//           </Button>

//           <Button
//             variant="success"
//             className="mis-excel-btn"
//             onClick={
//               handleDownloadExcel
//             }
//           >
//             Excel Download
//           </Button>

//         </div>
//       </Card.Header>

//       {/* =====================================================
//           COMPLETE REPORT / PRINT AREA
//       ===================================================== */}

//       <div
//         ref={printRef}
//         className="print-area"
//       >

//         {/* =================================================
//             PRINT HEADER
//         ================================================= */}

//         <div className="print-page-header">

//           <h3>
//             {
//               companyDetail?.company_name ||
//               "EKODEX TECHNOLOGIES PVT LTD"
//             }
//           </h3>

//           <h5>
//             MIS REPORT
//           </h5>

//           <p>
//             Month :{" "}
//             <strong>
//               {monthName}
//               {" / "}
//               {invoiceYear}
//             </strong>
//           </p>

//         </div>

//         {/* =================================================
//             PRINT TITLE
//         ================================================= */}

//         <div className="print-report-title">
//           MIS REPORT
//         </div>

//         {/* =================================================
//             BASE / GST
//         ================================================= */}

//         <div className="row amount-row">

//           {/* ================= BASE ================= */}

//           <div className="col-md-6">

//             <Card className="amount-card">

//               <Card.Body>

//                 <h6>
//                   BASE AMOUNT
//                 </h6>

//                 <h4>
//                   ₹{" "}
//                   {
//                     formatAmount(
//                       data?.base_amount
//                     )
//                   }
//                 </h4>

//               </Card.Body>

//             </Card>

//           </div>

//           {/* ================= GST ================= */}

//           <div className="col-md-6">

//             <Card className="amount-card">

//               <Card.Body>

//                 <h6>
//                   GST AMOUNT
//                 </h6>

//                 <h4>
//                   ₹{" "}
//                   {
//                     formatAmount(
//                       data?.gst_amount
//                     )
//                   }
//                 </h4>

//               </Card.Body>

//             </Card>

//           </div>

//         </div>

//         {/* =================================================
//             PARTICULARS TABLE
//         ================================================= */}

//         <Table
//           bordered
//           className="mis-table"
//         >

//           <thead>

//             <tr>

//               <th>
//                 SL.NO.
//               </th>

//               <th>
//                 PARTICULARS
//               </th>

//               <th>
//                 AMOUNT
//               </th>

//             </tr>

//           </thead>

//           <tbody>

//             {
//               data?.particulars?.map(
//                 (item, index) => (

//                   <tr
//                     key={
//                       item?.sr_no ??
//                       index
//                     }
//                   >

//                     <td>
//                       {
//                         item?.sr_no
//                       }
//                     </td>

//                     <td>
//                       {
//                         item?.particulars
//                       }
//                     </td>

//                     <td>
//                       ₹{" "}
//                       {
//                         formatAmount(
//                           item?.amount
//                         )
//                       }
//                     </td>

//                   </tr>

//                 )
//               )
//             }

//           </tbody>

//         </Table>

//       </div>

//     </div>
//   );
// };

// export default MIS;

import React, { useRef } from "react";
import {
  Button,
  Card,
  Table,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./MIS.css";

const MIS = ({
  data,
  loading,
  billData,
}) => {
  const printRef = useRef();

  const companyDetail =
    billData?.company_detail?.[0] || {};

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

  const bill =
    data?.billInfo?.[0] || {};

  const monthName =
    monthNames[
      Number(bill?.invoice_month) - 1
    ] ||
    bill?.invoice_month ||
    "Month";

  const invoiceYear =
    bill?.invoice_year || "";

  if (loading) {
    return (
      <h5 className="text-center my-4">
        Loading...
      </h5>
    );
  }

  if (
    !data ||
    !Array.isArray(data?.particulars)
  ) {
    return (
      <h5 className="text-center my-4">
        No MIS Data Found
      </h5>
    );
  }

  const formatAmount = (value) => {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "0.00";
    }

    return amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const handlePrint = () => {
    const printArea =
      printRef.current;

    if (!printArea) {
      console.error(
        "MIS print area not found."
      );
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=900"
    );

    if (!printWindow) {
      alert(
        "Please allow popup window to print MIS report."
      );
      return;
    }

    const clonedContent =
      printArea.cloneNode(true);

    clonedContent
      .querySelectorAll(
        ".no-print, .noprint"
      )
      .forEach((element) => {
        element.remove();
      });

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <title>
            MIS_Report_${monthName}_${invoiceYear}
          </title>

          <style>

            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 100%;
              min-width: 0;
              max-width: 100%;
              margin: 0;
              padding: 0;
              background: #ffffff;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .print-area {
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              background: #ffffff;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            .print-page-header {
              width: 100%;
              text-align: center;
              margin: 0 0 12px 0;
              padding: 0 0 8px 0;
              border-bottom: 2px solid #000;
            }

            .print-page-header h3 {
              margin: 0 0 2px 0;
              padding: 0;
              font-size: 18px;
              line-height: 22px;
              font-weight: 700;
              color: #000 !important;
            }

            .print-page-header h5 {
              margin: 0 0 2px 0;
              padding: 0;
              font-size: 14px;
              line-height: 17px;
              font-weight: 700;
              color: #000 !important;
            }

            .print-page-header p {
              margin: 0;
              padding: 0;
              font-size: 10px;
              line-height: 13px;
              color: #000 !important;
            }

            .print-page-header strong {
              color: #000 !important;
              font-weight: 700;
            }

            .print-report-title {
              display: none;
            }

            .row {
              display: flex !important;
              width: 100%;
              margin: 0 0 10px 0 !important;
              padding: 0;
            }

            .col-md-6 {
              width: 50% !important;
              padding-left: 3px !important;
              padding-right: 3px !important;
            }

            .col-md-6:first-child {
              padding-left: 0 !important;
            }

            .col-md-6:last-child {
              padding-right: 0 !important;
            }

            .amount-card {
              width: 100%;
              margin: 0 !important;
              padding: 0;
              background: #ffffff !important;
              border: 1px solid #000 !important;
              border-radius: 3px !important;
              box-shadow: none !important;
            }

            .amount-card .card-body {
              padding: 6px !important;
              text-align: center;
            }

            .amount-card h6 {
              margin: 0 0 2px 0 !important;
              padding: 0;
              font-size: 9px !important;
              line-height: 12px;
              font-weight: 700 !important;
              color: #000 !important;
            }

            .amount-card h4 {
              margin: 0 !important;
              padding: 0;
              font-size: 13px !important;
              line-height: 16px;
              font-weight: 700 !important;
              color: #000 !important;
            }

            .mis-table {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0;
              table-layout: fixed !important;
              border-collapse: collapse !important;
              border-spacing: 0 !important;
              box-shadow: none !important;
            }

            .mis-table thead {
              display: table-header-group;
            }

            .mis-table tbody {
              display: table-row-group;
            }

            .mis-table tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .mis-table th,
            .mis-table td {
              border: 1px solid #000 !important;
              vertical-align: middle !important;
            }

            .mis-table th {
              background: #000 !important;
              color: #fff !important;
              padding: 6px !important;
              font-size: 10px !important;
              line-height: 13px !important;
              font-weight: 700 !important;
              text-align: center !important;
            }

            .mis-table td {
              background: #fff !important;
              color: #000 !important;
              padding: 5px !important;
              font-size: 10px !important;
              line-height: 13px !important;
              font-weight: 600 !important;
            }

            .mis-table th:nth-child(1),
            .mis-table td:nth-child(1) {
              width: 60px !important;
              text-align: center !important;
            }

            .mis-table th:nth-child(2),
            .mis-table td:nth-child(2) {
              width: auto !important;
              text-align: left !important;
              word-break: break-word;
            }

            .mis-table th:nth-child(3),
            .mis-table td:nth-child(3) {
              width: 140px !important;
              text-align: right !important;
            }

            .no-print,
            .noprint {
              display: none !important;
            }

          </style>
        </head>

        <body>
          ${clonedContent.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 600);
  };

  const handleDownloadExcel = () => {
    const excelData =
      data?.particulars?.map(
        (item) => ({
          "SL.NO":
            item?.sr_no ?? "",

          PARTICULARS:
            item?.particulars ?? "",

          AMOUNT:
            Number(item?.amount || 0),
        })
      ) || [];

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 35 },
      { wch: 18 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "MIS Report"
    );

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

    const fileData =
      new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }
      );

    saveAs(
      fileData,
      `MIS_Report_${monthName}_${invoiceYear}.xlsx`
    );
  };

  return (
    <div className="mis-container">

      <Card.Header
        className="
          page-header
          d-flex
          justify-content-between
          align-items-center
          flex-wrap
        "
      >
        <div>
          <h3>
            {
              companyDetail?.company_name ||
              "EKODEX TECHNOLOGIES PVT LTD"
            }
          </h3>

          <h5>
            MIS REPORT
          </h5>

          <p>
            Month :{" "}
            <strong>
              {monthName} / {invoiceYear}
            </strong>
          </p>
        </div>

        <div className="d-flex gap-1 no-print">

          <Button
            variant="dark"
            size="sm"
            className="mis-print-btn"
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            variant="success"
            size="sm"
            className="mis-excel-btn"
            onClick={
              handleDownloadExcel
            }
          >
            Excel Download
          </Button>

        </div>
      </Card.Header>

      <div
        ref={printRef}
        className="print-area"
      >

        <div className="print-page-header">

          <h3>
            {
              companyDetail?.company_name ||
              "EKODEX TECHNOLOGIES PVT LTD"
            }
          </h3>

          <h5>
            MIS REPORT
          </h5>

          <p>
            Month :{" "}
            <strong>
              {monthName} / {invoiceYear}
            </strong>
          </p>

        </div>

        <div className="row amount-row">

          <div className="col-md-6">

            <Card className="amount-card">

              <Card.Body>

                <h6>
                  BASE AMOUNT
                </h6>

                <h4>
                  ₹{" "}
                  {
                    formatAmount(
                      data?.base_amount
                    )
                  }
                </h4>

              </Card.Body>

            </Card>

          </div>

          <div className="col-md-6">

            <Card className="amount-card">

              <Card.Body>

                <h6>
                  GST AMOUNT
                </h6>

                <h4>
                  ₹{" "}
                  {
                    formatAmount(
                      data?.gst_amount
                    )
                  }
                </h4>

              </Card.Body>

            </Card>

          </div>

        </div>

        <Table
          bordered
          className="mis-table"
        >

          <thead>

            <tr>

              <th>
                SL.NO.
              </th>

              <th>
                PARTICULARS
              </th>

              <th>
                AMOUNT
              </th>

            </tr>

          </thead>

          <tbody>

            {
              data?.particulars?.map(
                (item, index) => (
                  <tr
                    key={
                      item?.sr_no ??
                      index
                    }
                  >

                    <td>
                      {
                        item?.sr_no
                      }
                    </td>

                    <td>
                      {
                        item?.particulars
                      }
                    </td>

                    <td>
                      ₹{" "}
                      {
                        formatAmount(
                          item?.amount
                        )
                      }
                    </td>

                  </tr>
                )
              )
            }

          </tbody>

        </Table>

      </div>

    </div>
  );
};

export default MIS;