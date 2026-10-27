import React, { useRef } from "react";
import { Container, Row, Col, Table, Button, Card } from "react-bootstrap";

const BillFormat = ({ billData }) => {
  const printRef = useRef(null);

  const bill = billData?.bill_info || {};
  const client = billData?.client_detail?.[0] || {};
  const site = billData?.site_detail?.[0] || {};
  const company = billData?.company_detail?.[0] || {};

  // ============================================================
  // ORDER DATA
  // ============================================================

  const orderInfo = billData?.orders || [];

  // ============================================================
  // BANK DETAILS
  // ============================================================

  const bank =
    billData?.company_bank_detail?.[0] || billData?.bank_detail?.[0] || {};

  // ============================================================
  // PRINT
  // ============================================================

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;

    const printWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printWindow) {
      alert("Please allow popups for this website.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>

          <meta charset="UTF-8" />

          <title>Invoice ${bill?.invoice_no || ""}</title>

          <!-- Bootstrap -->
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          />

          <style>

            /* =====================================================
               GLOBAL
            ===================================================== */

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
            }

            body {
              padding: 5px;
            }

            .print-container {
              width: 100%;
              margin: 0 auto;
            }

            /* =====================================================
               HIDE NON PRINT ELEMENTS
            ===================================================== */

            .no-print {
              display: none !important;
            }

            /* =====================================================
               MAIN INVOICE
            ===================================================== */

            .invoice-box {
              width: 100%;
              border: 1px solid #ccc;
            }

            /* =====================================================
               INVOICE HEADER
            ===================================================== */

            .invoice-header {
              width: 100%;
              text-align: center;
              background: #f1f3f5 !important;
              padding: 6px !important;
              margin-bottom: 5px !important;
              border: 0 !important;
              border-radius: 0 !important;
            }

            .invoice-header h5 {
              font-size: 14px !important;
              margin: 2px 0 !important;
            }

            .invoice-header h3 {
              font-size: 22px !important;
              color: red !important;
              margin: 5px !important;
            }

            .invoice-header p {
              font-size: 11px !important;
              margin: 2px !important;
            }

            /* =====================================================
               ALL TABLES
            ===================================================== */

            .invoice-table {
              width: 100% !important;
              border-collapse: collapse !important;
              border-spacing: 0 !important;
            }

            .invoice-table th,
            .invoice-table td {
              border: 1px solid #ddd !important;
              padding: 3px !important;
            }

            .invoice-table th {
              background: #eef1f4 !important;
              font-weight: bold !important;
            }

            /* =====================================================
               CLIENT DETAILS
            ===================================================== */

            .client-table {
              width: 100% !important;
            }

            .client-table td,
            .client-table th {
              border: 1px solid #ddd !important;
              font-size: 12px !important;
              padding: 3px !important;
            }

            .client-table .label {
              font-weight: bold !important;
              width: 12% !important;
            }

            .client-table th {
              background: #eef1f4 !important;
              font-weight: bold !important;
            }

            /* =====================================================
               ITEM TABLE
            ===================================================== */

            .item-table {
              width: 100% !important;
            }

            .item-table th {
              background: #eef1f4 !important;
              font-size: 12px !important;
              text-align: center !important;
            }

            .item-table td {
              font-size: 11px !important;
              padding: 3px !important;
              vertical-align: top !important;
            }

            .item-table td div {
              line-height: 16px !important;
            }

            /* =====================================================
               SECTION TITLE
            ===================================================== */

            .section-title {
              background: #eef1f4 !important;
              text-align: center !important;
              font-weight: bold !important;
            }

            /* =====================================================
               TWO COLUMN STRUCTURE
            ===================================================== */

            .row {
              display: flex !important;
              flex-wrap: nowrap !important;
              width: 100% !important;
              margin-top: 0 !important;
              margin-right: 0 !important;
              margin-left: 0 !important;
            }

            .row > .col-md-7 {
              width: 58.333333% !important;
              max-width: 58.333333% !important;
              flex: 0 0 58.333333% !important;
              display: block !important;
            }

            .row > .col-md-5 {
              width: 41.666667% !important;
              max-width: 41.666667% !important;
              flex: 0 0 41.666667% !important;
              display: block !important;
            }

            .row > .col-md-7,
            .row > .col-md-5 {
              position: relative !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
            }

            /* =====================================================
               SUMMARY / BANK TABLE
            ===================================================== */

            .summary-table {
              width: 100% !important;
            }

            .summary-table td {
              padding: 3px !important;
              border: 1px solid #ddd !important;
            }

            /* =====================================================
               SIGNATURE
            ===================================================== */

            .signature {
              text-align: center !important;
              margin-top: 10px !important;
            }

            /* =====================================================
               BOOTSTRAP SPACING OVERRIDE
            ===================================================== */

            .mt-2 {
              margin-top: 0.5rem !important;
            }

            .mt-3 {
              margin-top: 1rem !important;
            }

            .mt-4 {
              margin-top: 1.5rem !important;
            }

            .mb-0 {
              margin-bottom: 0 !important;
            }

            .mb-1 {
              margin-bottom: 0.25rem !important;
            }

            .mb-2 {
              margin-bottom: 0.5rem !important;
            }

            /* =====================================================
               PRINT SETTINGS
            ===================================================== */

            @page {
              size: A4;
              margin: 5mm;
            }

            @media print {

              html,
              body {
                width: 100%;
                margin: 0;
                padding: 0;
                background: #fff !important;
              }

              .no-print {
                display: none !important;
              }

              .print-container {
                width: 100% !important;
              }

              /* FORCE TWO COLUMNS DURING PRINT */

              .row {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                width: 100% !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              .row > .col-md-7 {
                width: 58.333333% !important;
                max-width: 58.333333% !important;
                flex: 0 0 58.333333% !important;
              }

              .row > .col-md-5 {
                width: 41.666667% !important;
                max-width: 41.666667% !important;
                flex: 0 0 41.666667% !important;
              }

              .invoice-header {
                background: #f1f3f5 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .invoice-table th,
              .section-title,
              .table-light {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              table {
                page-break-inside: avoid !important;
              }

              tr {
                page-break-inside: avoid !important;
              }

            }

          </style>

        </head>

        <body>

          <div class="print-container">
            ${printContents}
          </div>

        </body>

      </html>
    `);

    printWindow.document.close();

    /*
     * Wait until Bootstrap CSS and invoice HTML
     * are completely loaded before opening print preview.
     */

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();

        printWindow.print();

        /*
         * Close popup after print dialog is opened.
         */

        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 500);
    };
  };

  // ============================================================
  // AMOUNT
  // ============================================================

  const grossAmount = Number(bill?.total_cost_without_gst || 0);

  const cgst = Number(bill?.cgst || 0);
  const sgst = Number(bill?.sgst || 0);
  const igst = Number(bill?.igst || 0);

  const netAmount =
    Number(bill?.final_amount) || grossAmount + cgst + sgst + igst;

  const amountInWords = numberToWords(Math.round(netAmount));

  // ============================================================
  // UI
  // ============================================================

  return (
    <Container fluid className="print-container">
      <style>{`

        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
        }

        @media print {

          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 5mm;
          }

          .print-container {
            width: 100%;
          }

        }

        .invoice-box {
          width: 100%;
          border: 1px solid #ccc;
        }

        .invoice-header {
          text-align: center;
          background: #f1f3f5;
          padding: 6px;
        }

        .invoice-header h3 {
          color: red;
          margin: 5px;
        }

        .invoice-header p {
          margin: 2px;
          font-size: 11px;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-table th,
        .invoice-table td {
          border: 1px solid #ddd;
          padding: 2px;
        }

        .invoice-table th {
          background: #eef1f4;
          text-align: left;
        }

        .section-title {
          background: #eef1f4;
          font-weight: bold;
          text-align: center;
        }

        .summary-table td {
          padding: 3px;
          border: 1px solid #ddd;
        }

        .signature {
          text-align: center;
          margin-top: 10px;
        }

        .client-table td,
        .client-table th {
          border: 1px solid #ddd !important;
          font-size: 12px;
          padding: 3px;
        }

        .client-table .label {
          font-weight: bold;
          width: 12%;
        }

        .client-table th {
          background: #eef1f4 !important;
          font-weight: bold;
        }

        .item-table th {
          background: #eef1f4 !important;
          font-size: 12px;
          text-align: center;
        }

        .item-table td {
          font-size: 11px;
          padding: 3px;
          vertical-align: top;
        }

        .item-table td div {
          line-height: 16px;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-table td,
        .invoice-table th {
          border: 1px solid #ddd !important;
        }

        .section-title {
          background: #eef1f4;
          text-align: center;
          font-weight: bold;
        }

        .invoice-table td {
          font-size: 12px;
          padding: 3px;
        }

      `}</style> 

      {/* ========================================================
          MAIN INVOICE
      ======================================================== */}
      <div className="d-flex justify-content-end mb-3">
  <Button
    variant="danger"
    style={{
      height: "32px",
      padding: "4px 12px",
      borderRadius: "4px",
    }}
    onClick={handlePrint}
  >
    Print
  </Button>
</div>

      <div ref={printRef} className="invoice-container">

          <Card className="invoice-header">
            <Card.Body className="text-center">
              <h5 className="fw-bold mb-1">TAX INVOICE</h5>

              <h3 className="fw-bold text-danger mb-1">
                {company?.company_name}
              </h3>

              <p className="fw-bold mb-1 small">
                {bill?.bill_title ||
                  "SPECIALISED IN PROVIDING ALL TYPES OF SKILLED AND UNSKILLED LABOUR SUPPLIER IN MIDC & WAREHOUSE AREAS AT PAN INDIA LEVEL SINCE 12 YRS"}
              </p>

              <p className="mb-1 small">{company?.address}</p>

              <p className="mb-1 small">
                E-mail : {company?.email_id}
                &nbsp; | &nbsp; Ph : {company?.phone}
              </p>

              <p className="mb-0 small fw-bold">GSTIN : {company?.gst_no}</p>
            </Card.Body>
          </Card>

          {/* ====================================================
              CLIENT DETAILS
          ==================================================== */}

          <Table bordered className="invoice-table client-table">
            <tbody>
              <tr className="table-light">
                <th colSpan="2" className="text-center">
                  Billing Client Details
                </th>

                <th colSpan="2" className="text-center">
                  Invoice Details
                </th>
              </tr>

              <tr>
                <td className="label">Name:</td>

                <td>{client?.company_name}</td>

                <td className="label">Invoice No.</td>

                <td>{bill?.invoice_no}</td>
              </tr>

              <tr>
                <td className="label">Add:</td>

                <td>{client?.client_add}</td>

                <td className="label">Invoice Date</td>

                <td>
                  {bill?.invoice_date
                    ? new Date(bill.invoice_date).toLocaleDateString("en-GB")
                    : "-"}
                </td>
              </tr>

              <tr>
                <td className="label">GSTIN:</td>

                <td>{client?.client_gst_no}</td>

                <td className="label">Invoice Type</td>

                <td>State</td>
              </tr>

              <tr>
                <td className="label">KINDLY ATTN:</td>

                <td>{client?.contact_person}</td>

                <td className="label">Site Name</td>

                <td>{site?.site_name}</td>
              </tr>

              <tr>
                <td className="label">Services Period</td>

                <td>
                  {bill?.invoice_month} - {bill?.invoice_year}
                </td>

                <td className="label">Billing Type</td>

                <td>{bill?.billing_type}</td>
              </tr>
            </tbody>
          </Table>

          {/* ====================================================
              ITEM TABLE
          ==================================================== */}

          <Table bordered className="invoice-table item-table">
            <thead>
              <tr className="table-light">
                <th width="5%">Sr. No.</th>

                <th width="35%">Item Description</th>

                <th width="12%">HSN / SAC</th>

                <th width="15%">QTY / TON / DAY</th>

                <th width="15%">Rate</th>

                <th width="18%">Net Amount</th>
              </tr>
            </thead>

            <tbody>
              {bill?.billing_type === "Transporter"
                ? orderInfo?.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="text-center">{index + 1}</td>

                      <td>
                        <div>
                          <b>From :</b> {item.tb_from || "-"}
                        </div>

                        <div>
                          <b>To :</b> {item.tb_to || "-"}
                        </div>

                        <div>
                          <b>Vehicle :</b> {item.tb_vehicle_no || "-"}
                        </div>

                        <div>
                          <b>LR No :</b> {item.lr_no || "-"}
                        </div>

                        <div>
                          <b>Date :</b>{" "}
                          {item.tb_date
                            ? new Date(item.tb_date).toLocaleDateString("en-GB")
                            : "-"}
                        </div>
                      </td>

                      <td className="text-center">{item.sac_code || "-"}</td>

                      <td className="text-center">{item.tb_weight || "-"}</td>

                      <td className="text-end">-</td>

                      <td className="text-end fw-bold">
                        ₹ {Number(item.total || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                : orderInfo?.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="text-center">{index + 1}</td>

                      <td>
                        <div>
                          <b>{item.emp_name || item.type || "-"}</b>
                        </div>

                        {item.emp_code && (
                          <>
                            <br />

                            <small>Code : {item.emp_code}</small>
                          </>
                        )}
                      </td>

                      <td className="text-center">
                        {item.sac_code || "998525"}
                      </td>

                      <td className="text-center">{item.total_nos || 0}</td>

                      <td className="text-end">
                        ₹{" "}
                        {Number(item.cost_per_head || 0).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="text-end fw-bold">
                        ₹ {Number(item.total || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </Table>

          {/* ====================================================
              AMOUNT + BANK
          ==================================================== */}

          <Row className="mt-2">
            {/* LEFT SIDE */}

            <Col md={7}>
              <Table bordered className="invoice-table">
                <tbody>
                  <tr>
                    <td className="section-title">
                      <b>Amount In Words</b>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ height: "60px" }}>{amountInWords}</td>
                  </tr>

                  <tr>
                    <td className="section-title">
                      <b>Bank Details</b>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <b>Bank Name :</b>
                      &nbsp;
                      {bank?.bank_name}
                      <br />
                      <b>Account No :</b>
                      &nbsp;
                      {bank?.ac_no}
                      <br />
                      <b>IFSC :</b>
                      &nbsp;
                      {bank?.ifsc_code}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            {/* RIGHT SIDE */}

            <Col md={5}>
              <Table bordered className="invoice-table">
                <tbody>
                  <tr>
                    <td>Gross Amount</td>

                    <td className="text-end">
                      ₹{" "}
                      {Number(bill?.total_cost_without_gst || 0).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                  </tr>

                  {Number(bill?.igst) > 0 && (
                    <tr>
                      <td>IGST ({bill?.igst_perc}%)</td>

                      <td className="text-end">
                        ₹ {Number(bill?.igst || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )}

                  {Number(bill?.cgst) > 0 && (
                    <tr>
                      <td>CGST ({bill?.cgst_perc}%)</td>

                      <td className="text-end">
                        ₹ {Number(bill?.cgst || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )}

                  {Number(bill?.sgst) > 0 && (
                    <tr>
                      <td>SGST ({bill?.sgst_perc}%)</td>

                      <td className="text-end">
                        ₹ {Number(bill?.sgst || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )}

                  <tr className="table-light">
                    <td>
                      <b>Net Amount</b>
                    </td>

                    <td className="text-end">
                      <b>
                        ₹{" "}
                        {Number(bill?.final_amount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </b>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* ====================================================
              TERMS + SIGNATURE
          ==================================================== */}

          <Row className="mt-3">
            <Col md={7}>
              <Table bordered className="invoice-table">
                <tbody>
                  <tr>
                    <td className="section-title">
                      <b>Terms & Conditions</b>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <ul className="mb-0">
                        <li>Payment through cheque/DD/NEFT/RTGS</li>

                        <li>Subject to Navi Mumbai jurisdiction</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            <Col md={5} className="text-center">
              <br />
              <br />

              <b>FOR {company?.company_name}</b>

              <br />
              <br />
              <br />
              <br />

              <b>Authorised Signatory</b>
            </Col>
          </Row>

          <p className="text-center mt-4">
            This is a computer generated Invoice
          </p>
        </div>
    </Container>
  );
};

// ============================================================
// NUMBER TO WORDS
// ============================================================

const numberToWords = (num) => {
  const ones = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];

  const tens = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];

  const convertBelowThousand = (n) => {
    let str = "";

    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " HUNDRED ";

      n %= 100;
    }

    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";

      n %= 10;
    }

    if (n > 0) {
      str += ones[n] + " ";
    }

    return str.trim();
  };

  if (num === 0) {
    return "ZERO RUPEES ONLY";
  }

  let result = "";

  const crore = Math.floor(num / 10000000);

  num %= 10000000;

  const lakh = Math.floor(num / 100000);

  num %= 100000;

  const thousand = Math.floor(num / 1000);

  num %= 1000;

  const hundred = num;

  if (crore) {
    result += convertBelowThousand(crore) + " CRORE ";
  }

  if (lakh) {
    result += convertBelowThousand(lakh) + " LAKH ";
  }

  if (thousand) {
    result += convertBelowThousand(thousand) + " THOUSAND ";
  }

  if (hundred) {
    result += convertBelowThousand(hundred);
  }

  return result.trim() + " RUPEES ONLY";
};

export default BillFormat;
