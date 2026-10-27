import React from "react";
import { Button, Card, Table } from "react-bootstrap";
import * as XLSX from "xlsx";
import "./CsvForPf.css";

const CsvForPf = ({ data, loading }) => {
  if (loading) {
    return <h5 className="text-center">Loading...</h5>;
  }

  const rows =
    Array.isArray(data)
      ? data
      : data?.data && Array.isArray(data.data)
      ? data.data
      : data?.result && Array.isArray(data.result)
      ? data.result
      : [];

  if (rows.length === 0) {
    return <h5 className="text-center">No Data Found</h5>;
  }

  // 📥 EXCEL DOWNLOAD
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PF_Report");
    XLSX.writeFile(workbook, "PF_Report.xlsx");
  };

  // 🖨️ PRINT FIX (NO BLANK PAGE)
  const handlePrint = () => {
    const content = document.getElementById("pfPrintArea").innerHTML;

    const printWindow = window.open("", "", "width=900,height=650");

    printWindow.document.write(`
      <html>
        <head>
          <title>PF Report</title>
          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }
            h2 {
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 6px;
              text-align: center;
            }
            th {
              background: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h2>PF REPORT</h2>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div>
      <Card className="mb-3">
        <Card.Header
  className="d-flex justify-content-between align-items-center px-2 py-1"
  style={{
    borderRadius: "3px",
  }}
>
  <h6 className="mb-0">PF Report</h6>

  <div className="d-flex gap-1">
    <Button
      variant="primary"
      size="sm"
      onClick={handlePrint}
    >
      Print
    </Button>

    <Button
      variant="success"
      size="sm"
      onClick={handleDownloadExcel}
    >
      Download Excel
    </Button>
  </div>
</Card.Header>

        <Card.Body>
          {/* 👇 IMPORTANT PRINT AREA */}
          <div id="pfPrintArea">
            <Table bordered striped responsive>
              <thead>
                <tr>
                  <th>UAN</th>
                  <th>NAME</th>
                  <th>GROSS</th>
                  <th>EPS</th>
                  <th>ESIC</th>
                  <th>EE</th>
                  <th>ER</th>
                  <th>ER EDLI</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.uan_no || "-"}</td>
                    <td>{row.emp_full_name || "-"}</td>
                    <td>{row.gross_wages || 0}</td>
                    <td>{row.eps_wages || 0}</td>
                    <td>{row.esic_wages || 0}</td>
                    <td>{row.ee || 0}</td>
                    <td>{row.er || 0}</td>
                    <td>{row.er_edli || 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CsvForPf;