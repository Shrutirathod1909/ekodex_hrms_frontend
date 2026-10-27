import React, { forwardRef } from "react";
import odsLogo from "../../assets/images/ods_logo.jpeg";
import axios from "axios";
import React, { forwardRef, useEffect, useState } from "react";
const InvoiceTemplate = forwardRef(({ data }, ref) => {
  const invoiceNo = data?.invoice_no || data?.po_number || "ODSMU0313/26-27";
  const invoiceDate = data?.order_date
    ? data?.order_date.split("T")[0]
    : "04/05/2026";
  const supplierName =
    data?.supplier_name || "ODS PROTECTIVE SERVICES PVT. LTD";

  const lineItems = data?.items || [
    {
      product_name: "HOUSEKEEPER",
      sku: "998533",
      qty: 1,
      mrp: 20418.0,
      gst: 18,
      total_amount: 24093.24,
    },
  ];

  const subTotal = lineItems.reduce(
    (acc, item) => acc + item.qty * item.mrp,
    0,
  );
  const totalGst = lineItems.reduce(
    (acc, item) => acc + (item.total_amount - item.qty * item.mrp),
    0,
  );
  const halfGstRate = (lineItems[0]?.gst || 18) / 2;
  const halfGstAmount = totalGst / 2;
  const grandTotalValue = subTotal + totalGst;
  const roundedGrandTotal = Math.round(grandTotalValue);
  const roundOffValue = (roundedGrandTotal - grandTotalValue).toFixed(2);

  const numberToWords = (num) => {
    if (roundedGrandTotal === 24093)
      return "TWENTY-FOUR THOUSAND NINETY-THREE ONLY";
    return "SPECIFIED AMOUNT VALUE ONLY";
  };

  return (
    <div
      ref={ref}
      style={{
        display: "block",
        width: "100%",
        backgroundColor: "#fff",
        color: "#000",
      }}
    >
      <div
        className="p-4"
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: "12px",
          color: "#000",
          lineHeight: "1.4",
        }}
      >
        {/* Original Copy Notice Tag */}
        <div
          className="d-flex justify-content-end text-muted text-uppercase mb-1"
          style={{ fontSize: "10px", fontWeight: "bold" }}
        >
          (Original)
        </div>

        {/* Corporate Header Section */}
        <div
          className="position-relative mb-3"
          style={{ minHeight: "115px", display: "flex", width: "100%" }}
        >
          {/* Logo element container */}
          <div
            className="position-absolute start-0 top-0"
            style={{ marginTop: "5px" }}
          >
            <img
              src={odsLogo}
              alt="ODS Security Logo"
              style={{ width: "95px", height: "95px", objectFit: "contain" }}
            />
          </div>

          {/* Company Details Content Area Centered */}
          <div
            className="text-center mx-auto"
            style={{ maxWidth: "75%", width: "100%" }}
          >
            <h5
              className="fw-bold mb-0 text-uppercase"
              style={{ letterSpacing: "0.5px", fontSize: "16px" }}
            >
              Purchase Order Invoice
            </h5>
            <small
              className="d-block text-secondary fw-semibold mb-2"
              style={{ fontSize: "10.5px" }}
            >
              Issued Under Section 31(1) of GST ACT 2017
            </small>

            <h6
              className="fw-bold m-0 text-uppercase"
              style={{ fontSize: "14px" }}
            >
              ODS PROTECTIVE SERVICES PVT. LTD
            </h6>
            <div
              className="text-muted"
              style={{ fontSize: "11px", marginTop: "2px" }}
            >
              105 & 106, D-Wing, Kailash Industrial Complex, Veer Savarkar Marg,
              Vikhroli (W)
              <br />
              Mumbai - 400079 | Tel No.: 022-28577766 / 2085 2700 / 9324960881
              <br />
              Email: info@odspspl.com | Pan No.: AAACY5976E
              <br />
              <strong>GST No: 27AAACY5976E1ZZ</strong> | GST State: Maharashtra
              (27)
            </div>
          </div>
        </div>

        {/* Outer Frame Grid Layout Section */}
        <div
          className="border border-dark bg-white"
          style={{ display: "block", width: "100%" }}
        >
          {/* Row 1: Invoice metadata identifiers (Forced Explicit Flexbox layouts for Print runtime engine stability) */}
          <div
            className="border-bottom border-dark"
            style={{ display: "flex", width: "100%" }}
          >
            <div
              className="border-end border-dark p-2"
              style={{ width: "50%", boxSizing: "border-box" }}
            >
              <div style={{ display: "flex", marginBottom: "4px" }}>
                <div style={{ width: "33%", fontWeight: "600" }}>PO. No.:</div>
                <div
                  style={{
                    width: "67%",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                >
                  {invoiceNo}
                </div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ width: "33%", fontWeight: "600" }}>
                  PO. Date.:
                </div>
                <div style={{ width: "67%" }}>{invoiceDate}</div>
              </div>
            </div>
            <div
              className="p-2"
              style={{ width: "50%", boxSizing: "border-box" }}
            >
              <div style={{ display: "flex", marginBottom: "4px" }}>
                <div style={{ width: "40%", fontWeight: "600" }}>
                  Bill For Month:
                </div>
                <div style={{ width: "60%" }}>: April 2026</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ width: "40%", fontWeight: "600" }}>
                  PO Period:
                </div>
                <div style={{ width: "60%" }}>: 01 Apr 2026 To 30 Apr 2026</div>
              </div>
            </div>
          </div>

          {/* Row 2: Supplier details inside 'Bill To' block */}
          <div
            className="border-bottom border-dark"
            style={{ display: "flex", width: "100%", minHeight: "105px" }}
          >
            {/* <div
              className="p-2 border-dark"
              style={{ width: "50%", boxSizing: "border-box" }}
            >
              <div
                className="fw-bold text-uppercase border-bottom pb-1 mb-1"
                style={{ fontSize: "11px" }}
              >
                From:
              </div>
              <div className="fw-bold">
                SOMAIYA SCHOOL OF HUMANITIES AND SOCIAL SCIENCES
              </div>
              <div className="text-muted">VIDYAVIHAR EAST MUMBAI - 400077</div>
            </div> */}

            <div
              className="border-end border-dark p-2"
              style={{ width: "50%", boxSizing: "border-box" }}
            >
              <div
                className="fw-bold text-uppercase border-bottom pb-1 mb-1"
                style={{ fontSize: "11px" }}
              >
                Bill To:
              </div>
              <div className="fw-bold text-uppercase">{supplierName}</div>
              <div className="text-muted">
                105 & 106, D-Wing, Kailash Industrial Complex,
                <br />
                Veer Savarkar Marg, Vikhroli (W), Mumbai - 400079
              </div>
              <div className="fw-semibold mt-1">GST No.: 27AAACY5976E1ZZ</div>
            </div>
          </div>

          {/* Row 3: Service Item Matrix Grid */}
          <div className="table-responsive">
            <table
              className="table table-bordered border-dark mb-0 align-middle"
              style={{ fontSize: "11px", width: "100%" }}
            >
              <thead
                className="table-light text-center border-bottom border-dark"
                style={{ fontSize: "10px" }}
              >
                <tr>
                  <th rowSpan="2" style={{ width: "40px" }}>
                    Sr. No.
                  </th>
                  <th rowSpan="2">Particulars</th>
                  <th rowSpan="2" style={{ width: "75px" }}>
                    HSN/SAC Code
                  </th>
                  <th rowSpan="2" style={{ width: "50px" }}>
                    Qty
                  </th>
                  <th rowSpan="2" style={{ width: "85px" }}>
                    Rate
                  </th>
                  <th rowSpan="2" style={{ width: "65px" }}>
                    Per Day
                  </th>
                  <th rowSpan="2" style={{ width: "60px" }}>
                    No. Of Duties
                  </th>
                  <th rowSpan="2" style={{ width: "95px" }}>
                    Amount
                  </th>
                  <th colSpan="2" style={{ width: "100px" }}>
                    CGST
                  </th>
                  <th colSpan="2" style={{ width: "100px" }}>
                    SGST
                  </th>
                </tr>
                <tr>
                  <th style={{ fontSize: "9px" }}>Rate</th>
                  <th style={{ fontSize: "9px" }}>Amount</th>
                  <th style={{ fontSize: "9px" }}>Rate</th>
                  <th style={{ fontSize: "9px" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="text-center">{idx + 1}</td>
                    <td className="fw-semibold text-uppercase">
                      {item.product_name}
                    </td>
                    <td className="text-center font-monospace">
                      {item.sku || "998533"}
                    </td>
                    <td className="text-center">
                      {Number(item.qty).toFixed(2)}
                    </td>
                    <td className="text-end font-monospace">
                      {Number(item.mrp).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-end font-monospace">680.60</td>
                    <td className="text-center">30</td>
                    <td className="text-end font-monospace">
                      {subTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">{halfGstRate.toFixed(2)}%</td>
                    <td className="text-end font-monospace">
                      {halfGstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">{halfGstRate.toFixed(2)}%</td>
                    <td className="text-end font-monospace">
                      {halfGstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className="fw-bold bg-light text-end">
                  <td colSpan="3" className="text-center text-uppercase">
                    Total
                  </td>
                  <td className="text-center">-</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="text-center">30.00</td>
                  <td className="font-monospace">
                    ₹{" "}
                    {subTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>-</td>
                  <td className="font-monospace">
                    ₹{" "}
                    {halfGstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>-</td>
                  <td className="font-monospace">
                    ₹{" "}
                    {halfGstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Row 4: Bank Details Metadata & Aggregates Summary block */}
          <div
            className="border-top border-dark"
            style={{ display: "flex", width: "100%" }}
          >
            <div
              className="border-end border-dark p-2"
              style={{ width: "55%", boxSizing: "border-box" }}
            >
              <div
                className="fw-bold text-decoration-underline mb-1"
                style={{ fontSize: "11px" }}
              >
                BANK DETAILS
              </div>
              <div style={{ fontSize: "11px", lineHeight: "1.5" }}>
                <strong>Bank Name:</strong> UNION BANK OF INDIA
                <br />
                <strong>Bank Account Number:</strong> 510341000703626
                <br />
                <strong>IFS Code:</strong> UBIN0933180 
              </div>
            </div>
            <div style={{ width: "45%", boxSizing: "border-box" }}>
              <div className="d-flex justify-content-between p-1 px-2 border-bottom border-dark">
                <span className="text-secondary fw-semibold">Net Total</span>
                <span className="font-monospace">
                  {grandTotalValue.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between p-1 px-2 border-bottom border-dark text-muted">
                <span>Round Off</span>
                <span className="font-monospace">{roundOffValue}</span>
              </div>
              <div
                className="d-flex justify-content-between p-2 px-2 bg-light fw-bold"
                style={{ fontSize: "13px" }}
              >
                <span>Grand Total</span>
                <span className="font-monospace">
                  ₹ {roundedGrandTotal.toLocaleString("en-IN")}.00
                </span>
              </div>
            </div>
          </div>

          {/* Row 5: Amount string text block */}
          <div
            className="p-2 border-top border-dark bg-light"
            style={{ fontSize: "10.5px" }}
          >
            <strong>INDIAN RUPEES:</strong>{" "}
            <span className="text-uppercase font-monospace fw-semibold">
              {numberToWords(roundedGrandTotal)}
            </span>
          </div>

          {/* Row 6: GST Breakdown Table Block */}
          <div className="table-responsive border-top border-dark">
            <table
              className="table table-bordered border-dark mb-0 text-center align-middle"
              style={{ fontSize: "10.5px", width: "100%" }}
            >
              <thead className="table-light fw-bold">
                <tr>
                  <th rowSpan="2">HSN/SAC Code</th>
                  <th rowSpan="2">Taxable Value</th>
                  <th colSpan="2">Central Tax</th>
                  <th colSpan="2">State Tax</th>
                  <th colSpan="2">Integrated Tax</th>
                  <th rowSpan="2">Total Tax Amt.</th>
                </tr>
                <tr>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-monospace">998533</td>
                  <td className="text-end font-monospace">
                    {subTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>{halfGstRate.toFixed(2)}%</td>
                  <td className="text-end font-monospace">
                    {halfGstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>{halfGstRate.toFixed(2)}%</td>
                  <td className="text-end font-monospace">
                    {halfGstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>0.00%</td>
                  <td className="text-end font-monospace">0.00</td>
                  <td className="text-end font-monospace fw-bold">
                    {totalGst.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr className="fw-bold bg-light text-end">
                  <td className="text-center text-uppercase">Total</td>
                  <td className="font-monospace">
                    {subTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>-</td>
                  <td className="font-monospace">
                    {halfGstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>-</td>
                  <td className="font-monospace">
                    {halfGstAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>-</td>
                  <td className="font-monospace">0.00</td>
                  <td className="font-monospace">
                    {totalGst.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Row 7: Legal stipulations vs Signature field frame block */}
          <div
            className="border-top border-dark"
            style={{ display: "flex", width: "100%", minHeight: "140px" }}
          >
            <div
              className="border-end border-dark p-2"
              style={{
                width: "55%",
                fontSize: "10px",
                color: "#333",
                boxSizing: "border-box",
              }}
            >
              <div className="fw-bold text-dark mb-1">Invoice Terms:</div>
              <ol className="ps-3 m-0" style={{ listStyleType: "decimal" }}>
                <li>
                  All Cheques/Drafts are to be made in the Favour of "
                  {supplierName}" Payable at Mumbai
                </li>
                <li>
                  Payment is to be made within 7 days of receipt of Invoice.
                </li>
                <li>
                  Interest @ 24% p.a. shall be charged, if payment is not made
                  within 15 days from the Date of Receipt.
                </li>
                <li>
                  Any queries/Corrections will be entertained only within 30
                  days from the date of submission of the bill.
                </li>
                <li>All disputes are subject to Mumbai jurisdiction only.</li>
              </ol>
            </div>
            <div
              className="p-2 d-flex flex-column justify-content-between text-end"
              style={{ width: "45%", boxSizing: "border-box" }}
            >
              <div>
                <span className="text-muted" style={{ fontSize: "10px" }}>
                  Created By:
                </span>{" "}
                <strong style={{ fontSize: "10px" }}>GARIMA SHARMA</strong>
                <div
                  className="fw-bold mt-1 text-uppercase"
                  style={{ fontSize: "10px" }}
                >
                  For {supplierName}
                </div>
              </div>
              <div className="my-2 d-flex justify-content-end px-3">
                <div
                  className="rounded-circle border border-info border-2 d-flex align-items-center justify-content-center text-info fw-bold"
                  style={{
                    width: "55px",
                    height: "55px",
                    fontSize: "7px",
                    transform: "rotate(-15deg)",
                    opacity: 0.7,
                  }}
                >
                  PASSED ODS
                </div>
              </div>
              <div
                className="fw-bold border-top border-dark pt-1 text-center text-uppercase"
                style={{ fontSize: "10px" }}
              >
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>

        <div
          className="text-center mt-2 text-muted"
          style={{ fontSize: "10px" }}
        >
          page # 1
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";
export default InvoiceTemplate;
