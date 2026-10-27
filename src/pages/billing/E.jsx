import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Table, Row, Col, Button } from "react-bootstrap";

const API_URL = import.meta.env.VITE_API_URL;

const PrintInvoice = () => {
  const printRef = useRef(null);
  const { autoNo } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/billing/print-invoice/${autoNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        console.log(response.data);
        setInvoiceData(response.data.data);
      }
    } catch (error) {
      console.error("InvoiceFetchError:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }
  if (!invoiceData) {
    return <div className="p-4">Invoice not found</div>;
  }

  const {
    billInfo,
    clientDetail,
    siteDetail,
    companyDetail,
    orderInfo,
    empWages,
    companyBankDetail,
  } = invoiceData;

  const bill = billInfo[0];
  const client = clientDetail[0];
  const company = companyDetail[0];
  const bank = companyBankDetail?.[0];

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
    <link
 rel="stylesheet"
 href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
/>
      <title>Invoice ${bill?.invoice_no}</title>

      <style>
        *{
          box-sizing:border-box;
        }

        body{
          font-family: Arial, sans-serif;
          padding:20px;
          color:#000;
          font-size:13px;
        }

        table{
          width:100%;
          border-collapse:collapse;
        }

        th,td{
          border:1px solid #000;
          padding:6px;
        }

        .text-center{
          text-align:center;
        }

        .text-end{
          text-align:right;
        }

        .fw-bold{
          font-weight:bold;
        }

        .invoice-header{
          text-align:center;
          margin-bottom:20px;
        }

        .invoice-info{
          display:flex;
          justify-content:space-between;
          gap:20px;
          margin-bottom:15px;
        }

        .invoice-left{
          width:60%;
        }

        .invoice-right{
          width:35%;
        }

        .summary-table{
          width:300px;
          margin-left:auto;
          margin-top:10px;
        }

        @page{
          size:A4;
          margin:10mm;
        }
      </style>

    </head>

    <body>
      ${printContents}
    </body>

    </html>
  `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const grossAmount =
    Number(bill?.gross_amount) ||
    empWages?.reduce((sum, item) => sum + Number(item.salary_payable || 0), 0);

  const cgst = Number(bill?.cgst || 0);
  const sgst = Number(bill?.sgst || 0);
  const igst = Number(bill?.igst || 0);

  const netAmount =
    Number(bill?.final_amount) || grossAmount + cgst + sgst + igst;

  const amountInWords = numberToWords(Math.round(netAmount));

  return (
    <Container fluid className="print-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white !important; }
          .print-container { width: 100%; margin: 0; padding: 0; }
          @page { size: A4; margin: 10mm; }
        }
        .invoice-table th, .invoice-table td { border: 1px solid #000; padding: 8px; }
        .summary-table td { padding: 5px 10px; }
      `}</style>

      <div className="d-flex justify-content-end mb-4 no-print">
        <Button variant="success" onClick={handlePrint}>
          Print Invoice
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="ms-2"
        >
          Go Back
        </Button>
      </div>

      <div className="bg-white p-4 border shadow-sm" ref={printRef}>
        <div className="text-center mb-4">
          <h5 className="fw-bold">TAX INVOICE</h5>
          <h3 className="text-danger fw-bold">{company?.company_name}</h3>
          <p className="small mb-1">{company?.address}</p>
          <p className="small">
            E-mail: {company?.email} | Ph: {company?.phone} |{" "}
            <strong>GSTIN:</strong> {company?.gst_no}
          </p>
        </div>

        <div className="d-flex justify-content-between mb-4 border-top border-bottom py-2">
          <div style={{ width: "60%" }}>
            <strong>Billing Client Details</strong>
            <p className="mb-0">
              <strong>Name:</strong> {client?.company_name}
            </p>
            <p className="mb-0">
              <strong>Add.:</strong> {client?.billing_address}
            </p>
            <p className="mb-0">
              <strong>GSTIN:</strong> {client?.gst_no}
            </p>
            <p className="mb-0">
              <strong>KINDLY ATTN:</strong> {bill?.attention_to}
            </p>
          </div>
          <div style={{ width: "35%" }} className="border-start ps-3">
            <strong>Invoice Details</strong>
            <p className="mb-0">
              <strong>Invoice No.:</strong> {bill?.invoice_no}
            </p>
            <p className="mb-0">
              <strong>Invoice Date:</strong>{" "}
              {new Date(bill?.invoice_date).toLocaleDateString("en-GB")}
            </p>
            <p className="mb-0">
              <strong>Site Name:</strong> {bill?.site_name}
            </p>
          </div>
        </div>

        <Table bordered className="invoice-table">
          <thead>
            <tr className="bg-light">
              <th>Sr. No.</th>
              <th>Item Description</th>
              <th>HSN/SAC</th>
              <th>QTY/TON/DAY</th>
              <th>Rate</th>
              <th>Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {empWages?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.rank}</td>
                <td>{item.sac_code}</td>
                <td>{item.net_days}</td>
                <td>{item.per_day_rate}</td>
                <td>{Number(item.net_days) * Number(item.per_day_rate)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between mb-4">
          <div className="col-7">
            <div className="mb-3">
              <strong>Amount in Words:</strong>
              <div className="border p-2 mt-1 text-uppercase fw-bold">
                {amountInWords}
              </div>
            </div>

            <div className="border p-2 mb-3">
              <strong>Bank Details</strong>
              <div className="small mt-1 d-flex flex-column">
                <div>
                  <strong>NAME:</strong> {bank?.bank_name}
                </div>
                <div>
                  <strong>A/c No.:</strong> {bank?.ac_no}
                </div>
                <div>
                  <strong>Branch:</strong> {bank?.branch_name}
                </div>
                <div>
                  <strong>IFSC:</strong> {bank?.ifsc_code}
                </div>
              </div>
            </div>
          </div>
          <table className="summary-table" style={{ width: "300px" }}>
            <tbody>
              <tr>
                <td>
                  <strong>Gross Amount</strong>
                </td>
                <td className="text-end">
                  ₹{Number(bill?.total_cost_without_gst || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>IGST</strong>
                </td>
                <td className="text-end">
                  ₹{Number(bill?.igst || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>SGST</strong>
                </td>
                <td className="text-end">
                  ₹{Number(bill?.sgst || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>CGST</strong>
                </td>
                <td className="text-end">
                  ₹{Number(bill?.cgst || 0).toLocaleString()}
                </td>
              </tr>
              <tr className="border-top">
                <td>
                  <strong>Net Amount</strong>
                </td>
                <td className="text-end">
                  <strong>
                    ₹{Number(bill?.final_amount || 0).toLocaleString()}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="row mt-2 justify-content-end">
          <div className="border p-2 mb-3 col-12">
            <strong>Terms & Conditions</strong>
            <p className="small mb-0">
              * Payment is requested by crossed cheque/DD in favor of{" "}
              <strong>M/s {company?.company_name}</strong> or made by NEFT/RTGS.
            </p>
            <p className="small mb-0">
              * Subject to Jurisdiction of NAVI MUMBAI court only.
            </p>
          </div>
          <div className="col-5">
            <div className="text-center mt-2 pt-4">
              <strong>FOR {company?.company_name}</strong>
              <br />
              <br />
              <br />
              <br />
              <strong>Authorised Signatory</strong>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 small">
          This is a computer generated Invoice
        </div>
      </div>
    </Container>
  );
};

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

  if (num === 0) return "ZERO RUPEES ONLY";

  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore) result += convertBelowThousand(crore) + " CRORE ";

  if (lakh) result += convertBelowThousand(lakh) + " LAKH ";

  if (thousand) result += convertBelowThousand(thousand) + " THOUSAND ";

  if (hundred) result += convertBelowThousand(hundred);

  return result.trim() + " RUPEES ONLY";
};

export default PrintInvoice;
