import React, { useRef } from "react";
import { Button } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./SinglePaySlip.css";

const SinglePaySlip = ({ data, billData }) => {
  const slipRef = useRef(null);

  if (!data) {
    return <h5 className="text-center mt-5">No PaySlip Found</h5>;
  }

  const company = billData?.company_detail?.[0] || {};

  const companyName =
    company.company_name || "EKODEX TECHNOLOGIES PVT LTD";

  const companyAddress =
    company.address ||
    "OFFICE NO-1102, 11TH FLOOR TECHNOCITY IT PREMISES X-5/3, TTC INDUSTRIAL AREA, NEAR HOTEL SAROVAR PORTICO & ICICI BANK, MAHAPE, GHANSOLI, THANE - 400710";

  const getMonthName = (month) =>
    [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ][Number(month) - 1] || "";

  const num = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const money = (value) =>
    num(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const val = (...values) =>
    values.find(
      (v) => v !== null && v !== undefined && v !== ""
    ) ?? 0;

  const text = (value) =>
    value === null || value === undefined ? "" : value;

  // ================= ATTENDANCE =================

  const monthDays = num(data.month_days);
  const workDays = num(val(data.work_days, data.month_days));

  const presentDays = num(data.present_days);
  const halfDays = num(data.half_days);
  const absentDays = num(data.absent_days);
  const weeklyOffs = num(data.weekoff_days);
  const holidayDays = num(data.holiday_days);

  const paidHoliday = num(data.paid_holiday);
  const paidLeave = num(data.paid_leave);

  const attendanceDays = num(
    val(data.attendance_days, presentDays + halfDays * 0.5)
  );

  const payableDays = num(
    val(data.actual_paid_days, data.ws_present_days, attendanceDays)
  );

  // ================= API EARNINGS & DEDUCTIONS =================

  const earningItems = Array.isArray(data.earnings)
    ? data.earnings
    : [];

  const deductionItems = Array.isArray(data.deductions)
    ? data.deductions
    : [];

  const findEarning = (...names) => {
    const item = earningItems.find((item) =>
      names.includes(
        String(item.earning_name || "").trim().toUpperCase()
      )
    );

    return num(item?.earning_amount);
  };

  const findDeduction = (...names) => {
    const item = deductionItems.find((item) =>
      names.includes(
        String(item.deduction_name || "").trim().toUpperCase()
      )
    );

    return num(item?.deduction_amount);
  };

  // ================= EARNINGS =================
  // Declare all variables before using them in the JSX.

  const basicPayable = num(
    val(data.total_basic_vda, data.basic_rate)
  );

  const basicEarned = num(
    val(
      data.earn_total_basic_da,
      findEarning("BASIC", "VDA", "BASIC + VDA")
    )
  );

  const splPayable = num(
    val(
      data.special_allowance,
      findEarning("SPL ALLOWANCE", "SPECIAL ALLOWANCE")
    )
  );

  const splEarned = num(
    val(
      data.earn_special_allowance_da,
      findEarning("SPL ALLOWANCE", "SPECIAL ALLOWANCE")
    )
  );

  const hraPayable = num(
    val(data.hra, findEarning("HRA"))
  );

  const hraEarned = num(
    val(data.earn_hra_da, findEarning("HRA"))
  );

  const otherPayable = num(
    val(data.other_allowance, findEarning("OTHER ALLOWANCE"))
  );

  const otherEarned = num(
    val(data.earn_other_allowance_da, findEarning("OTHER ALLOWANCE"))
  );

  const lwwPayable = num(
    val(data.lww, findEarning("LWW"))
  );

  const lwwEarned = num(
    val(data.earn_lww_da, findEarning("LWW"))
  );

  const bonusPayable = num(
    val(data.bonus, findEarning("BONUS"))
  );

  const bonusEarned = num(
    val(data.earn_bonus_da, findEarning("BONUS"))
  );

  const otPayable = num(
    val(data.ot_hours, findEarning("OT ALLOWANCE", "OT"))
  );

  const otEarned = num(
    val(data.earn_ot_amount, findEarning("OT ALLOWANCE", "OT"))
  );

  // ================= TOTALS =================

  const totalPayable = num(
    val(data.def_gross_salary, data.gross, data.gross_salary)
  );

  const totalEarned = num(
    val(data.total_earning, data.earn_total_gross_wages)
  );

  const grossSalary = num(data.gross_salary);

  // ================= DEDUCTIONS =================

  const pf = num(val(data.deduct_pf, findDeduction("PF")));
  const esic = num(val(data.deduct_esic, findDeduction("ESIC")));
  const pt = num(val(data.deduct_pt, findDeduction("PT")));
  const lwf = num(val(data.deduct_lwf, findDeduction("LWF")));

  const uniform = num(
    val(
      data.part_t_shirt,
      findDeduction("UNIFORM/ID", "UNIFORM", "ID")
    )
  );

  const advance = num(
    val(data.advances, findDeduction("ADVANCE"))
  );

  const totalDeductions = num(data.total_deduction);

  const netSalary = num(
    val(data.net_salary, totalEarned - totalDeductions)
  );

  const earnings = [
    ["BASIC + VDA", basicPayable, basicEarned],
    ["SPL ALLOWANCE", splPayable, splEarned],
    ["HRA", hraPayable, hraEarned],
    ["OTHER ALLOWANCE", otherPayable, otherEarned],
    ["LWW", lwwPayable, lwwEarned],
    ["BONUS", bonusPayable, bonusEarned],
    ["OT ALLOWANCE", otPayable, otEarned],
  ];

  const deductions = [
    ["PF", pf],
    ["ESIC", esic],
    ["PT", pt],
    ["LWF", lwf],
    ["UNIFORM/ID", uniform],
    ["ADVANCE", advance],
    ["TOTAL DEDUCTIONS", totalDeductions],
  ];

  // ================= PRINT =================



const handlePrint = () => {
  const element = slipRef.current;

  if (!element) {
    alert("Payslip not found!");
    return;
  }

  // Open a separate print window
  const printWindow = window.open(
    "",
    "_blank",
    "width=1200,height=800"
  );

  if (!printWindow) {
    alert("Please allow pop-ups to print the payslip.");
    return;
  }

  const printDocument = printWindow.document;

  printDocument.open();
  printDocument.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Employee Pay Slip</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="print-root"></div>
      </body>
    </html>
  `);
  printDocument.close();

  // Copy the application's existing CSS
  document
    .querySelectorAll('link[rel="stylesheet"], style')
    .forEach((node) => {
      printDocument.head.appendChild(
        node.cloneNode(true)
      );
    });

  // Add print-specific styles
  const printStyle = printDocument.createElement("style");

  printStyle.textContent = `
    @page {
      size: A4 landscape;
      margin: 5mm;
    }

    html, body {
      width: 100%;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      color: #000 !important;
      overflow: visible !important;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    #print-root {
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .slip-card {
      display: block !important;
      position: static !important;
      visibility: visible !important;
      width: 100% !important;
      max-width: none !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      border: none !important;
      box-shadow: none !important;
      background: #fff !important;
      color: #000 !important;
      transform: none !important;
    }

    .slip-card * {
      visibility: visible !important;
    }

    .slip-table {
      width: 100% !important;
      border-collapse: collapse !important;
      page-break-inside: auto;
    }

    .slip-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .slip-table th,
    .slip-table td {
      color: #000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @media print {
      .slip-card {
        position: static !important;
      }
    }
  `;

  printDocument.head.appendChild(printStyle);

  // Clone only the payslip, not the toolbar
  const clone = element.cloneNode(true);

  clone.removeAttribute("id");
  printDocument
    .getElementById("print-root")
    .appendChild(clone);

  // Wait for styles and images before printing
  const waitForImages = Promise.all(
    Array.from(printDocument.images).map((img) => {
      if (img.complete) return Promise.resolve();

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  Promise.all([
    waitForImages,
    printDocument.fonts
      ? printDocument.fonts.ready
      : Promise.resolve(),
  ]).then(() => {
    printWindow.focus();

    // Small delay for the layout to finish rendering
    setTimeout(() => {
      printWindow.print();
    }, 300);
  });
};


  // ================= DOWNLOAD PDF =================

  const handleDownload = async () => {
    const element = slipRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
      });

      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;

      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const ratio = Math.min(
        availableWidth / canvas.width,
        availableHeight / canvas.height
      );

      const width = canvas.width * ratio;
      const height = canvas.height * ratio;

      pdf.addImage(
        image,
        "PNG",
        (pageWidth - width) / 2,
        (pageHeight - height) / 2,
        width,
        height
      );

      const safeName = String(
        data.emp_full_name || "Employee"
      ).replace(/[^a-z0-9_-]/gi, "_");

      pdf.save(
        `PaySlip_${safeName}_${data.month || ""}_${data.year || ""}.pdf`
      );
    } catch (error) {
      console.error("PDF download error:", error);
      alert("PDF download failed. Please try again.");
    }
  };

  // ================= UI =================

  return (
    <div className="payslip-page">
      <div className="payslip-toolbar no-print">
        <div>
          <h3>EMPLOYEE PAY SLIP</h3>
          <p>SALARY SLIP REPORT</p>
        </div>

        <div className="toolbar-actions">
          <Button variant="primary" onClick={handlePrint}>
            Print
          </Button>

          <Button variant="success" onClick={handleDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="slip-card" ref={slipRef}>
        {/* COMPANY AND EMPLOYEE DETAILS */}

        <table className="slip-table company-table">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>

          <tbody>
            <tr>
              <td colSpan={5} className="company-heading">
                <div className="company-name">{companyName}</div>
                <div className="company-address">{companyAddress}</div>

                {(company.phone || company.email_id) && (
                  <div className="company-contact">
                    {company.phone
                      ? `PHONE: ${company.phone}`
                      : ""}
                    {company.phone && company.email_id ? " | " : ""}
                    {company.email_id
                      ? `EMAIL: ${company.email_id}`
                      : ""}
                  </div>
                )}
              </td>
            </tr>

            <tr>
              <th colSpan={5} className="payslip-heading">
                PAY SLIP FOR THE MONTH OF {getMonthName(data.month)}{" "}
                {data.year}
              </th>
            </tr>

            <tr>
              <th>EMPLOYEE NAME :</th>
              <td colSpan={2}>{text(data.emp_full_name)}</td>
              <th>EMP. CODE :</th>
              <td>{text(data.employee_code)}</td>
            </tr>

            <tr>
              <th>SITE NAME</th>
              <td colSpan={2}>{text(data.site_name)}</td>
              <th>DESIGNATION</th>
              <td>{text(data.rank)}</td>
            </tr>

            <tr>
              <th>DOJ</th>
              <td colSpan={2}>
                {text(data.doj || data.date_of_joining)}
              </td>
              <th>UAN</th>
              <td>{text(data.uan_no || data.uan)}</td>
            </tr>

            <tr>
              <th>MONTH DAYS</th>
              <td colSpan={2}>{money(monthDays)}</td>
              <th>ESIC IP</th>
              <td>{text(data.esic_ip || data.esic_no)}</td>
            </tr>

            <tr>
              <th>PAYABLE DAYS</th>
              <td colSpan={2}>{money(payableDays)}</td>
              <th>DOB</th>
              <td>{text(data.dob || data.date_of_birth)}</td>
            </tr>

            <tr>
              <th></th>
              <td colSpan={2}></td>
              <th>PAN</th>
              <td>{text(data.pan_no || data.pan_number)}</td>
            </tr>
          </tbody>
        </table>

        {/* ATTENDANCE AND BANK DETAILS */}

        <table className="slip-table attendance-table">
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>

          <tbody>
            <tr>
              <th></th>
              <th className="center-cell">PL</th>
              <th className="center-cell">SL</th>
              <th className="center-cell">CL</th>
              <th>WORK DAYS</th>
              <td className="number-cell">{money(workDays)}</td>
              <th colSpan={2}>AADHAR NO</th>
            </tr>

            <tr>
              <th>O/BAL</th>
              <td></td>
              <td></td>
              <td></td>
              <th>WEEKLY OFFS</th>
              <td className="number-cell">{money(weeklyOffs)}</td>
              <th colSpan={2}>
                {text(data.aadhar_no || data.aadhaar_no)}
              </th>
            </tr>

            <tr>
              <th>EARNED</th>
              <td></td>
              <td></td>
              <td></td>
              <th>HOLIDAYS</th>
              <td className="number-cell">{money(holidayDays)}</td>
              <th>BANK NAME</th>
              <td className="bank-value">{text(data.bank_name)}</td>
            </tr>

            <tr>
              <th>AVAIL</th>
              <td></td>
              <td></td>
              <td></td>
              <th>PAID HOL</th>
              <td className="number-cell">{money(paidHoliday)}</td>
              <th>ACCOUNT NO.</th>
              <td className="bank-value">{text(data.account_no)}</td>
            </tr>

            <tr>
              <th>C/BAL</th>
              <td></td>
              <td></td>
              <td></td>
              <th>PAID LEAVE</th>
              <td className="number-cell">{money(paidLeave)}</td>
              <th>IFSC CODE</th>
              <td className="bank-value">{text(data.ifsc_code)}</td>
            </tr>

            <tr>
              <th>PRESENT</th>
              <td></td>
              <td></td>
              <td></td>
              <th>ABSENT DAYS</th>
              <td className="number-cell">{money(absentDays)}</td>
              <th>ATTENDANCE DAYS</th>
              <td className="number-cell">{money(attendanceDays)}</td>
            </tr>

            <tr>
              <th>HALF DAYS</th>
              <td></td>
              <td></td>
              <td></td>
              <th>PAYABLE DAYS</th>
              <td className="number-cell">{money(payableDays)}</td>
              <th>PRESENT DAYS</th>
              <td className="number-cell">{money(presentDays)}</td>
            </tr>
          </tbody>
        </table>

        {/* EARNINGS AND DEDUCTIONS */}

        <table className="slip-table salary-table">
          <colgroup>
            <col style={{ width: "25%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>

          <thead>
            <tr>
              <th>EARNINGS</th>
              <th>PAYABLE</th>
              <th>EARNED</th>
              <th>DEDUCTIONS</th>
              <th>AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            {earnings.map((row, index) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td className="number-cell">{money(row[1])}</td>
                <td className="number-cell">{money(row[2])}</td>
                <td>{deductions[index]?.[0] || ""}</td>
                <td className="number-cell">
                  {deductions[index]
                    ? money(deductions[index][1])
                    : ""}
                </td>
              </tr>
            ))}

            <tr className="total-row">
              <th>TOTAL EARNINGS</th>
              <th className="number-cell">{money(totalPayable)}</th>
              <th className="number-cell">{money(totalEarned)}</th>
              <th>TOTAL DEDUCTIONS</th>
              <th className="number-cell">{money(totalDeductions)}</th>
            </tr>

            <tr className="total-row">
              <th colSpan={4}>NET SALARY</th>
              <th className="number-cell">{money(netSalary)}</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SinglePaySlip;