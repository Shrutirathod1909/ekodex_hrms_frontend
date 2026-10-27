import React, { useRef } from "react";
import { Button, Card, Table, Badge } from "react-bootstrap";

import { FaDownload, FaPrint, FaFileExcel } from "react-icons/fa";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const CsvForEsic = ({ data = [], loading, billData }) => {
  const printRef = useRef();

  if (loading) {
    return <h5 className="text-center my-4">Loading...</h5>;
  }

  // ================= COMPANY NAME =================

  const companyName =
    billData?.company_detail?.[0]?.company_name ||
    billData?.company_detail?.[0]?.title ||
    "Company Name";

  // ================= TOTAL =================

  const totalGross = data.reduce(
    (sum, item) => sum + Number(item.GROSS || 0),
    0,
  );

  const totalContribution = data.reduce(
    (sum, item) => sum + Number(item["EE CONTRIBUTION"] || 0),
    0,
  );

  // ================= PRINT =================

  const handlePrint = () => {
    const content = printRef.current.innerHTML;

    const printWindow = window.open("", "", "width=1200,height=900");

    printWindow.document.write(`
      <html>

        <head>

          <title>
            ESIC REPORT
          </title>

          <style>

            body{
              font-family:Arial;
              padding:25px;
              color:#222;
            }

            .header{
              text-align:center;
              margin-bottom:25px;
            }

            .header h1{
              margin:0;
              font-size:28px;
            }

            .header h3{
              margin:5px 0;
              color:#444;
            }

            .header p{
              margin:2px;
              font-size:15px;
            }

            table{
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            }

            th{
              background:#343a40;
              color:white;
              padding:12px;
              border:1px solid #000;
              font-size:14px;
            }

            td{
              padding:10px;
              border:1px solid #000;
              text-align:center;
              font-size:13px;
            }

            tr:nth-child(even){
              background:#f8f9fa;
            }

            .footer{
              margin-top:20px;
              text-align:right;
              font-size:15px;
              font-weight:bold;
            }

          </style>

        </head>

        <body>

          <div class="header">

            <h1>
              ESIC REPORT
            </h1>

            <h3>
              ${companyName}
            </h3>

            <p>
              Total Employees :
              ${data.length}
            </p>

          </div>

          ${content}

          <div class="footer">

            <p>
              Total Gross :
              ₹ ${totalGross.toFixed(2)}
            </p>

            <p>
              Total Contribution :
              ₹ ${totalContribution.toFixed(2)}
            </p>

          </div>

        </body>

      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ================= PDF =================

  // const handleDownloadPDF = async () => {

  //   const element =
  //     printRef.current;

  //   const canvas =
  //     await html2canvas(element, {
  //       scale: 2,
  //       useCORS: true,
  //       backgroundColor: "#ffffff",
  //     });

  //   const imgData =
  //     canvas.toDataURL("image/png");

  //   const pdf =
  //     new jsPDF("p", "mm", "a4");

  //   const pdfWidth =
  //     pdf.internal.pageSize.getWidth();

  //   const pdfHeight =
  //     (canvas.height * pdfWidth) /
  //     canvas.width;

  //   pdf.addImage(
  //     imgData,
  //     "PNG",
  //     0,
  //     0,
  //     pdfWidth,
  //     pdfHeight
  //   );

  //   pdf.save("ESIC_Report.pdf");
  // };

  // ================= EXCEL =================

  const handleExcelDownload = () => {
    const excelData = data.map((item) => ({
      IP: item.IP,

      INSURED_NAME: item["INSURED NAME"],

      PRESENT_DAYS: item["PRESENT DAYS"],

      GROSS: item.GROSS,

      EE_CONTRIBUTION: item["EE CONTRIBUTION"],
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "ESIC REPORT");

    XLSX.writeFile(workbook, "ESIC_Report.xlsx");
  };

  return (
    <div>
      {/* ================= TOP CARD ================= */}

      <Card className="border mb-2">
  <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-2 py-1">

    {/* ================= REPORT INFO ================= */}

    <div>
      <h5 className="fw-bold text-primary mb-1">
        ESIC REPORT
      </h5>

      <div className="fw-semibold small mb-1">
        {companyName}
      </div>

      <div className="d-flex gap-1 flex-wrap">

        <Badge bg="dark" className="px-2 py-1">
          Employees : {data.length}
        </Badge>

        <Badge bg="success" className="px-2 py-1">
          Gross : ₹{totalGross.toFixed(0)}
        </Badge>

        <Badge bg="danger" className="px-2 py-1">
          Contribution : ₹{totalContribution.toFixed(0)}
        </Badge>

      </div>
    </div>

    {/* ================= BUTTONS ================= */}

    <div className="d-flex gap-1 flex-wrap">

      <Button
        variant="primary"
        size="sm"
        className="px-2"
        onClick={handlePrint}
      >
        <FaPrint className="me-1" />
        Print
      </Button>

      <Button
        variant="success"
        size="sm"
        className="px-2"
        onClick={handleExcelDownload}
      >
        <FaFileExcel className="me-1" />
        Download
      </Button>

    </div>

  </Card.Body>
</Card>

      {/* ================= TABLE ================= */}

      <div ref={printRef}>
        <Card className="shadow border-0">
          <Card.Body className="p-0">
            <Table bordered hover responsive className="mb-0 align-middle">
              <thead
                style={{
                  background: "#212529",
                  color: "#fff",
                }}
              >
                <tr>
                  <th>IP</th>

                  <th>INSURED NAME</th>

                  <th>PRESENT DAYS</th>

                  <th>GROSS</th>

                  <th>EE CONTRIBUTION</th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.IP}</td>

                      <td className="fw-semibold">{item["INSURED NAME"]}</td>

                      <td>{item["PRESENT DAYS"]}</td>

                      <td>
                        ₹{" "}
                        {Number(item.GROSS || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="text-danger fw-bold">
                        ₹{" "}
                        {Number(item["EE CONTRIBUTION"] || 0).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default CsvForEsic;
