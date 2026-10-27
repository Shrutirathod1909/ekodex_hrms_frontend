import React, { useRef } from "react";
import "./voucher-print.css";

const PrintVoucher = ({ data, onBack }) => {
  console.log("PRINT DATA =", data);

  const printRef = useRef(null);

  const handlePrint = () => {
    const printContents =
      document.getElementById("print-area").innerHTML;

    const printWindow =
      window.open("", "", "width=900,height=650");

    printWindow.document.write(`
      <html>
        <head>
          <title>Voucher Print</title>

          <style>

            body{
              font-family:Segoe UI,sans-serif;
              padding:20px;
              background:#fff;
            }

            .voucher{
              width:800px;
              margin:auto;
              background:#fff;
              padding:35px;
              border:1px solid #dbe3ec;
              border-radius:14px;
            }

            .voucher-header{
              text-align:center;
              border-bottom:2px solid #1a4080;
              padding-bottom:18px;
              margin-bottom:25px;
            }

            .voucher-header h2{
              color:#1a4080;
              margin:0;
            }

            .voucher-info{
              display:flex;
              justify-content:space-between;
              gap:20px;
              margin-bottom:25px;
            }

            .voucher-info div{
              flex:1;
              border:1px solid #ddd;
              padding:15px;
              border-radius:10px;
            }

            .voucher-table{
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            }

            .voucher-table th{
              background:#1a4080;
              color:white;
              padding:12px;
              border:1px solid #ddd;
            }

            .voucher-table td{
              padding:12px;
              border:1px solid #ddd;
            }

            .total-row{
              background:#edf3ff;
            }

            .amount-words{
              margin-top:20px;
              padding:15px;
              background:#f5f8fc;
              border-left:5px solid #1a4080;
            }

            .bank-box{
              margin-top:25px;
              padding:20px;
              border:1px solid #ddd;
              border-radius:10px;
            }

            .signature{
              display:flex;
              justify-content:space-between;
              margin-top:70px;
            }

            .signature div{
              width:30%;
              text-align:center;
              border-top:2px solid #333;
              padding-top:40px;
            }

          </style>

        </head>

        <body>

          ${printContents}

        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

    printWindow.close();
  };

  // ✅ NUMBER TO WORDS
  const numberToWords = (num) => {
    if (!num) return "";

    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const inWords = (n) => {
      if (n < 20) return a[n];

      if (n < 100) {
        return b[Math.floor(n / 10)] + " " + a[n % 10];
      }

      if (n < 1000) {
        return (
          a[Math.floor(n / 100)] +
          " Hundred " +
          inWords(n % 100)
        );
      }

      if (n < 100000) {
        return (
          inWords(Math.floor(n / 1000)) +
          " Thousand " +
          inWords(n % 1000)
        );
      }

      if (n < 10000000) {
        return (
          inWords(Math.floor(n / 100000)) +
          " Lakh " +
          inWords(n % 100000)
        );
      }

      return "";
    };

    return inWords(parseInt(num)) + " Only";
  };

  if (!data) return <p>Loading...</p>;

  // ✅ PARSE PARTICULARS
  let particulars = [];

  try {
    if (data.particular) {
      const parsed =
        typeof data.particular === "string"
          ? JSON.parse(data.particular)
          : data.particular;

      particulars = (parsed || []).filter((p) => {
        return (
          p &&
          p.particular &&
          p.particular.trim() !== "" &&
          p.particular !== "-" &&
          p.amount !== "" &&
          p.amount !== null &&
          p.amount !== undefined &&
          Number(p.amount) > 0
        );
      });
    }
  } catch (err) {
    particulars = [];
  }

  // ✅ TOTAL
  const totalAmount = particulars.reduce((sum, item) => {
    return sum + Number(item.amount || 0);
  }, 0);

  return (
    <div className="voucher-wrapper">

      {/* ================= ACTION BUTTONS ================= */}
      <div className="voucher-actions no-print">

        {/* BACK BUTTON */}
        <button
          className="voucher-back-btn"
          onClick={onBack}
        >
          Back
        </button>

        {/* PRINT BUTTON */}
        <button
          type="button"
          className="print-btn"
          onClick={handlePrint}
        >
          Print Voucher
        </button>

      </div>

      {/* ================= PRINT AREA ================= */}
      <div id="print-area">

        <div className="voucher">

          {/* HEADER */}
          <div className="voucher-header">

            <h2>
              {data.company_name || "N/A"}
            </h2>

            <h3>
              PAYMENT VOUCHER
            </h3>

            <p>
              Voucher No :
              {data.voucher_no || "N/A"}
            </p>

          </div>

          {/* INFO SECTION */}
          <div className="voucher-info">

            <div>

              <p>
                <b>Site :</b>
                {data.site_name || "N/A"}
              </p>

              <p>
                <b>Client :</b>
                {data.client_name || "N/A"}
              </p>

              <p>
                <b>Employee :</b>
                {data.emp_name || "N/A"}
              </p>

              <p>
                <b>Emp Code :</b>
                {data.emp_code || "N/A"}
              </p>

            </div>

            <div>

              <p>
                <b>Date :</b>
                {data.payment_date || "N/A"}
              </p>

              <p>
                <b>Mode :</b>
                {data.mode || "N/A"}
              </p>

              <p>
                <b>Status :</b>
                {data.status || "N/A"}
              </p>

              <p>
                <b>Type :</b>
                {data.type || "N/A"}
              </p>

            </div>

          </div>

          {/* TABLE */}
          <table className="voucher-table">

            <thead>

              <tr>

                <th>
                  Particular
                </th>

                <th>
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {particulars.length > 0 ? (

                particulars.map((item, index) => (

                  <tr key={index}>

                    <td>
                      {item.particular || "-"}
                    </td>

                    <td>
                      {Number(item.amount || 0).toFixed(2)}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td>
                    {data.particular || "N/A"}
                  </td>

                  <td>
                    {Number(data.amount || 0).toFixed(2)}
                  </td>

                </tr>

              )}

              {/* TOTAL */}
              <tr className="total-row">

                <td>
                  <b>Total</b>
                </td>

                <td>
                  <b>
                    {(
                      totalAmount ||
                      Number(data.amount || 0)
                    ).toFixed(2)}
                  </b>
                </td>

              </tr>

            </tbody>

          </table>

          {/* AMOUNT WORDS */}
          <div className="amount-words">

            <b>Amount in Words :</b>

            {
              data.amount_in_words
                ? data.amount_in_words
                : numberToWords(
                    totalAmount || data.amount || 0
                  )
            }

          </div>

          {/* BANK DETAILS */}
          <div className="bank-box">

            <p>
              <b>Bank Name :</b>
              {data.bank_name || "N/A"}
            </p>

            <p>
              <b>Account No :</b>
              {data.bank_ac_no || "N/A"}
            </p>

            <p>
              <b>IFSC Code :</b>
              {data.ifsc_code || "N/A"}
            </p>

            <p>
              <b>Beneficiary :</b>
              {data.beneficiary_name || "N/A"}
            </p>

          </div>

          {/* SIGNATURE */}
          <div className="signature">

            <div>
              Prepared By
            </div>

            <div>
              Approved By
            </div>

            <div>
              Received By
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PrintVoucher;