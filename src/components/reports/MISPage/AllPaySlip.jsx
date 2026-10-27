import React, { useRef } from "react";
import { Button } from "react-bootstrap";
import { FaDownload, FaPrint } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import "./AllPaySlip.css";

const AllPaySlip = ({
  billData = {},
  bankTrfData = {},
  salaryWagesData = {},
}) => {
  const employees = Array.isArray(salaryWagesData?.emp_wages)
    ? salaryWagesData.emp_wages
    : [];

  const banks = Array.isArray(bankTrfData?.empWages)
    ? bankTrfData.empWages
    : [];

  const firstItem = (value) =>
    Array.isArray(value) && value.length ? value[0] : {};

  const billInfo = firstItem(salaryWagesData?.bill_info);
  const clientInfo = firstItem(salaryWagesData?.clientdetail);
  const siteInfo = firstItem(salaryWagesData?.client_rates);
  const companyDetail = firstItem(billData?.company_detail);

  const companyName =
    companyDetail?.company_name ||
    clientInfo?.company_name ||
    clientInfo?.client_name ||
    clientInfo?.billing_company ||
    "EKODEX TECHNOLOGIES PVT LTD";

  const companyAddress =
    companyDetail?.address ||
    companyDetail?.company_address ||
    clientInfo?.address ||
    clientInfo?.company_address ||
    "";

  const companyCity = companyDetail?.city || clientInfo?.city || "";
  const companyPincode =
    companyDetail?.pincode || clientInfo?.pincode || "";

  const siteName =
    siteInfo?.site_name ||
    billInfo?.site_name ||
    employees?.[0]?.site_name ||
    "";

  const month =
    Number(
      salaryWagesData?.month ||
        billInfo?.invoice_month ||
        employees?.[0]?.at_month ||
        0
    ) || 0;

  const year =
    salaryWagesData?.year ||
    billInfo?.invoice_year ||
    employees?.[0]?.at_year ||
    "";

  const monthName = month
    ? new Date(2000, month - 1, 1).toLocaleString("en-IN", {
        month: "long",
      })
    : "";

  const slipRefs = useRef([]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getValue = (object, fields, fallback = "") => {
    for (const field of fields) {
      const value = object?.[field];

      if (value !== null && value !== undefined && value !== "") {
        return value;
      }
    }

    return fallback;
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return value;
  };

  const numberValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return value;
    }

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toISOString().split("T")[0];
  };

  const getBankInfo = (employee) =>
    banks.find(
      (bank) => String(bank?.emp_id) === String(employee?.emp_id)
    ) || {};

  const getLeaveValue = (employee, fields) =>
    getValue(employee, fields, "");

  const moneyValue = (employee, fields) =>
    getValue(employee, fields, "");

  // =========================================================
  // PRINT ALL PAY SLIPS
  // =========================================================

  const handlePrint = () => {
    const printArea = document.getElementById("all-payslip-print-area");

    if (!printArea) {
      alert("Payslip print area not found.");
      return;
    }

    if (!printArea.querySelector(".page")) {
      alert("No employee payslips found.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printWindow) {
      alert("Please allow popup windows to print payslips.");
      return;
    }

    const clonedContent = printArea.cloneNode(true);

    clonedContent.querySelectorAll(".noprint, .no-print").forEach((el) => {
      el.remove();
    });

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>All Pay Slips</title>

          <style>
            @page {
              size: A4 portrait;
              margin: 5mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 100%;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .tables-container {
              width: 100%;
              margin: 0;
              padding: 0;
              overflow: visible;
            }

            .page {
              width: 100%;
              max-width: 100%;
              margin: 0 0 8px;
              padding: 0 0 8px;
              background: #fff;
              overflow: visible;
              border-bottom: 1px dashed #777;
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-after: auto;
              break-after: auto;
            }

            .page:last-child {
              margin-bottom: 0;
              padding-bottom: 0;
              border-bottom: none;
            }

            .payslip-table {
              width: 100% !important;
              max-width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
              border-spacing: 0 !important;
              background: #fff !important;
              border: 1px solid #000 !important;
              margin: 0 !important;
            }

            .payslip-table td,
            .payslip-table th {
              border: 1px solid #000 !important;
              background: #fff !important;
              color: #000 !important;
              padding: 2px 3px !important;
              font-size: 8px !important;
              line-height: 1.15 !important;
              vertical-align: middle !important;
              overflow-wrap: anywhere;
            }

            .company-name {
              color: red !important;
              text-align: center !important;
              font-size: 11px !important;
              line-height: 13px !important;
              font-weight: 700 !important;
            }

            .company-address {
              color: #000 !important;
              text-align: center !important;
              font-size: 7px !important;
              line-height: 9px !important;
              font-weight: 400 !important;
            }

            .employee-label,
            .leave-label,
            .attendance-label,
            .bank-label {
              font-weight: 700 !important;
              text-align: left !important;
            }

            .employee-value,
            .bank-value {
              text-align: left !important;
              overflow-wrap: anywhere;
            }

            .leave-value,
            .attendance-value {
              text-align: center !important;
            }

            .salary-inner-table {
              width: 100% !important;
              max-width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
              border-spacing: 0 !important;
              margin: 0 !important;
              background: #fff !important;
            }

            .salary-inner-table td,
            .salary-inner-table th {
              border: 1px solid #000 !important;
              background: #fff !important;
              color: #000 !important;
              padding: 2px 3px !important;
              font-size: 8px !important;
              line-height: 1.15 !important;
              vertical-align: middle !important;
              overflow-wrap: anywhere;
            }

            .salary-label {
              text-align: left !important;
            }

            .salary-number {
              text-align: right !important;
              white-space: nowrap !important;
            }

            .slip-month {
              text-align: center !important;
              font-weight: 700 !important;
            }

            .noprint,
            .no-print {
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

    printWindow.onload = () => {
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
  };

  // =========================================================
  // DOWNLOAD ALL PAY SLIPS AS PDF
  // =========================================================

  const handleDownload = async () => {
    const printArea = document.getElementById("all-payslip-print-area");

    if (!printArea || !employees.length) {
      alert("No payslips available to download.");
      return;
    }

    let tempContainer;

    try {
      const clonedContent = printArea.cloneNode(true);

      clonedContent.querySelectorAll(".noprint, .no-print").forEach((el) => {
        el.remove();
      });

      tempContainer = document.createElement("div");

      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-100000px";
      tempContainer.style.top = "0";
      tempContainer.style.width = `${Math.max(
        printArea.scrollWidth,
        printArea.clientWidth,
        800
      )}px`;
      tempContainer.style.background = "#fff";
      tempContainer.style.padding = "0";
      tempContainer.style.margin = "0";
      tempContainer.style.overflow = "visible";
      tempContainer.style.zIndex = "-1";

      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(clonedContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollY: 0,
        windowWidth: tempContainer.scrollWidth,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("Unable to render payslips.");
      }

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 5;

      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      const pxPerMm = canvas.width / printableWidth;
      const pageHeightPx = Math.floor(printableHeight * pxPerMm);

      /*
       * Split the full canvas into A4-sized sections.
       * This supports many employees in one PDF.
       */
      let sourceY = 0;
      let pageIndex = 0;

      while (sourceY < canvas.height) {
        const sourceHeight = Math.min(
          pageHeightPx,
          canvas.height - sourceY
        );

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.ceil(sourceHeight);

        const context = pageCanvas.getContext("2d");

        if (!context) {
          throw new Error("Unable to create PDF page.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const image = pageCanvas.toDataURL("image/jpeg", 0.95);
        const imageHeight = sourceHeight / pxPerMm;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          image,
          "JPEG",
          margin,
          margin,
          printableWidth,
          imageHeight
        );

        sourceY += sourceHeight;
        pageIndex++;
      }

      pdf.save(
        `All_Pay_Slips_${monthName || "Month"}_${year || ""}.pdf`
      );
    } catch (error) {
      console.error("Payslip PDF download error:", error);
      alert("Failed to download payslips. Please try again.");
    } finally {
      if (tempContainer?.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }
  };

  // =========================================================
  // NO DATA
  // =========================================================

  if (!employees.length) {
    return (
      <div className="all-payslip-container">
        <div className="payslip-card">
          <div className="payslip-card-header">
            <strong>All Pay Slip</strong>
          </div>
          <div className="no-payslip-data">No Pay Slip Found</div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="all-payslip-container">
      <div className="payslip-card noprint">
        <div className="payslip-card-header">
          <div>
            <strong>All Pay Slip</strong>
            {siteName && <>{" - "}{siteName}</>}
            {monthName && <>{" | "}{monthName}</>}
            {year && <>{" "}{year}</>}
          </div>

          <div className="payslip-buttons">
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <FaPrint className="me-1" />
              Print
            </Button>

            <Button variant="success" size="sm" onClick={handleDownload}>
              <FaDownload className="me-1" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div id="all-payslip-print-area" className="tables-container">
        {employees.map((employee, index) => {
          const bankInfo = getBankInfo(employee);

          // EMPLOYEE DETAILS
          const fullname = getValue(employee, [
            "employee_full_name",
            "emp_full_name",
            "emp_name",
            "employee_name",
          ]);

          const empCode = getValue(employee, [
            "employee_code_master",
            "employee_code",
            "emp_code",
          ]);

          const designation = getValue(employee, [
            "employee_designation",
            "designation",
            "rank",
          ]);

          const dateOfJoining = getValue(employee, [
            "employee_doj",
            "date_of_joining",
            "doj",
          ]);

          const dob = getValue(employee, ["employee_dob", "dob"]);

          const uan = getValue(employee, ["employee_uan_no", "uan_no"]);

          const esic = getValue(employee, [
            "employee_esis_no",
            "esis_no",
            "esic_no",
          ]);

          const pan = getValue(employee, ["employee_pan", "pancard_no"]);

          const aadhar = getValue(employee, [
            "employee_aadhar_no",
            "aadhar_no",
          ]);

          // BANK DETAILS
          const bankName = getValue(employee, [
            "employee_bank_name",
            "bank_name",
          ], getValue(bankInfo, ["bank_name"]));

          const accountNo = getValue(employee, [
            "employee_account_no",
            "account_no",
          ], getValue(bankInfo, ["account_no"]));

          const bankIfsc = getValue(employee, [
            "employee_ifsc",
            "bank_ifsc",
            "ifsc_code",
          ], getValue(bankInfo, ["bank_ifsc", "ifsc_code"]));

          const insuranceNo = getValue(employee, [
            "employee_insurance_no",
            "insurance_no",
            "insurance_number",
          ], getValue(bankInfo, ["insurance_no"]));

          // ATTENDANCE
          const monthDays = getValue(employee, ["month_days"]);

          const payableDays = getValue(employee, [
            "actual_paid_days",
            "net_days",
            "payable_days",
            "present_days",
          ]);

          const workDays = getValue(employee, [
            "work_days",
            "working_days",
          ]);

          const weeklyOff = getValue(employee, [
            "weekoff_days",
            "weekly_off",
            "weekly_offs",
          ]);

          const paidHoliday = getValue(employee, [
            "paid_holiday",
            "paid_holidays",
            "holiday_days",
          ]);

          const paidLeaves = getValue(employee, [
            "paid_leaves",
            "paid_leave",
          ]);

          const absentDays = getValue(employee, ["absent_days"]);
          const presentDays = getValue(employee, ["present_days"]);
          const halfDays = getValue(employee, ["half_days"]);

          // LEAVE BALANCES
          const plOpening = getLeaveValue(employee, [
            "pl_opening",
            "pl_opening_balance",
            "pl_ob",
            "pl_o_bal",
            "pl_open_bal",
          ]);

          const plEarned = getLeaveValue(employee, [
            "pl_earned",
            "earned_pl",
            "pl_earned_days",
          ]);

          const plAvailable = getLeaveValue(employee, [
            "pl_available",
            "available_pl",
            "pl_avail",
          ]);

          const plClosing = getLeaveValue(employee, [
            "pl_closing",
            "pl_closing_balance",
            "pl_cb",
            "pl_c_bal",
            "pl_close_bal",
          ]);

          const slOpening = getLeaveValue(employee, [
            "sl_opening",
            "sl_opening_balance",
            "sl_ob",
            "sl_o_bal",
            "sl_open_bal",
          ]);

          const slEarned = getLeaveValue(employee, [
            "sl_earned",
            "earned_sl",
            "sl_earned_days",
          ]);

          const slAvailable = getLeaveValue(employee, [
            "sl_available",
            "available_sl",
            "sl_avail",
          ]);

          const slClosing = getLeaveValue(employee, [
            "sl_closing",
            "sl_closing_balance",
            "sl_cb",
            "sl_c_bal",
            "sl_close_bal",
          ]);

          const clOpening = getLeaveValue(employee, [
            "cl_opening",
            "cl_opening_balance",
            "cl_ob",
            "cl_o_bal",
            "cl_open_bal",
          ]);

          const clEarned = getLeaveValue(employee, [
            "cl_earned",
            "earned_cl",
            "cl_earned_days",
          ]);

          const clAvailable = getLeaveValue(employee, [
            "cl_available",
            "available_cl",
            "cl_avail",
          ]);

          const clClosing = getLeaveValue(employee, [
            "cl_closing",
            "cl_closing_balance",
            "cl_cb",
            "cl_c_bal",
            "cl_close_bal",
          ]);

          // EARNINGS
          const basicVda =
            numberValue(getValue(employee, ["basic", "basic_rate"], 0)) +
            numberValue(getValue(employee, ["vda", "vda_rate"], 0));

          const earnedBasicVda =
            numberValue(getValue(employee, ["earned_basic"], 0)) +
            numberValue(getValue(employee, ["earned_da", "earned_vda"], 0));

          const specialAllow = moneyValue(employee, [
            "special_allow",
            "special_allowance",
          ]);

          const earnedSpecialAllow = moneyValue(employee, [
            "earned_special_allow",
            "earned_special_allowance",
          ]);

          const hra = moneyValue(employee, ["hra", "hra_rate"]);
          const earnedHra = moneyValue(employee, ["earned_hra"]);

          const otherAllow = moneyValue(employee, [
            "other_allow",
            "other_allowance",
          ]);

          const earnedOtherAllow = moneyValue(employee, [
            "earned_other_allow",
            "earned_other_allowance",
          ]);

          const lww = moneyValue(employee, ["lww", "lww_rate"]);
          const earnedLww = moneyValue(employee, ["earned_lww"]);

          const bonus = moneyValue(employee, ["bonus", "bonus_rate"]);
          const earnedBonus = moneyValue(employee, ["earned_bonus"]);

          const otRate = moneyValue(employee, ["ot_rate", "ot_wages"]);
          const earnedOt = moneyValue(employee, [
            "earned_ot_wages",
            "earned_ot",
          ]);

          const gross = getValue(employee, [
            "gross",
            "def_gross_salary",
            "gross_salary",
          ]);

          const earnedGross = getValue(employee, [
            "earned_gross",
            "total_earning",
            "earn_total_gross_wages",
          ]);

          // DEDUCTIONS
          const deductPf = moneyValue(employee, ["deduct_pf", "pf"]);
          const deductEsic = moneyValue(employee, ["deduct_esic", "esic"]);
          const deductPt = moneyValue(employee, ["deduct_pt", "pt"]);
          const deductLwf = moneyValue(employee, ["deduct_lwf", "lwf"]);

          const deductUniform = moneyValue(employee, [
            "deduct_uniform",
            "uniform_deduction",
          ]);

          const deductAdvance = moneyValue(employee, [
            "deduct_advance",
            "advance",
          ]);

          const deductLoan = moneyValue(employee, ["deduct_loan", "loan"]);

          const totalDeduction = getValue(employee, [
            "total_deduction",
            "total_deductions",
          ]);

          const netSalary = getValue(employee, [
            "net_take_home",
            "salary_payable",
            "net_salary",
          ]);

          return (
            <div
              key={
                employee?.id ||
                employee?.emp_id ||
                `${employee?.emp_code || employee?.employee_code || "emp"}-${index}`
              }
              ref={(element) => {
                slipRefs.current[index] = element;
              }}
              className="page"
            >
              <table className="payslip-table">
                <colgroup>
                  <col className="col-1" />
                  <col className="col-2" />
                  <col className="col-3" />
                  <col className="col-4" />
                  <col className="col-5" />
                  <col className="col-6" />
                  <col className="col-7" />
                  <col className="col-8" />
                </colgroup>

                <thead>
                  <tr>
                    <td colSpan="8">
                      <div className="company-name">{companyName}</div>
                      <div className="company-address">
                        {companyAddress}
                        {companyAddress && companyCity ? " , " : ""}
                        {companyCity}
                        {companyCity && companyPincode ? " - " : ""}
                        {companyPincode}
                      </div>
                    </td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td colSpan="8" className="slip-month">
                      PAY SLIP FOR THE MONTH OF{" "}
                      {monthName ? monthName.toUpperCase() : ""} {year}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="employee-label">EMPLOYEE NAME :</td>
                    <td colSpan="3" className="employee-value">{displayValue(fullname)}</td>
                    <td className="employee-label">EMP. CODE :</td>
                    <td colSpan="2" className="employee-value">{displayValue(empCode)}</td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="employee-label">SITE NAME</td>
                    <td colSpan="3" className="employee-value">{displayValue(siteName)}</td>
                    <td className="employee-label">DESIGNATION</td>
                    <td colSpan="2" className="employee-value">{displayValue(designation)}</td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="employee-label">DOJ</td>
                    <td colSpan="3" className="employee-value">{formatDate(dateOfJoining)}</td>
                    <td className="employee-label">UAN</td>
                    <td colSpan="2" className="employee-value">{displayValue(uan)}</td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="employee-label">MONTH DAYS</td>
                    <td colSpan="3" className="employee-value">{displayValue(monthDays)}</td>
                    <td className="employee-label">ESIC IP</td>
                    <td colSpan="2" className="employee-value">{displayValue(esic)}</td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="employee-label">PAYABLE DAYS</td>
                    <td colSpan="3" className="employee-value">{displayValue(payableDays)}</td>
                    <td className="employee-label">DOB</td>
                    <td colSpan="2" className="employee-value">{formatDate(dob)}</td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="employee-label"></td>
                    <td colSpan="3" className="employee-value"></td>
                    <td className="employee-label">PAN</td>
                    <td colSpan="2" className="employee-value">{displayValue(pan)}</td>
                  </tr>

                  <tr>
                    <td className="leave-label"></td>
                    <td className="leave-value">PL</td>
                    <td className="leave-value">SL</td>
                    <td className="leave-value">CL</td>
                    <td className="attendance-label">WORK DAYS</td>
                    <td className="attendance-value">{displayValue(workDays)}</td>
                    <td className="bank-label">AADHAR NO</td>
                    <td className="bank-value">{displayValue(aadhar)}</td>
                  </tr>

                  <tr>
                    <td className="leave-label">O/BAL</td>
                    <td className="leave-value">{displayValue(plOpening)}</td>
                    <td className="leave-value">{displayValue(slOpening)}</td>
                    <td className="leave-value">{displayValue(clOpening)}</td>
                    <td className="attendance-label">WEEKLY OFFS</td>
                    <td className="attendance-value">{displayValue(weeklyOff)}</td>
                    <td className="bank-label">BANK NAME</td>
                    <td className="bank-value">{displayValue(bankName)}</td>
                  </tr>

                  <tr>
                    <td className="leave-label">EARNED</td>
                    <td className="leave-value">{displayValue(plEarned)}</td>
                    <td className="leave-value">{displayValue(slEarned)}</td>
                    <td className="leave-value">{displayValue(clEarned)}</td>
                    <td className="attendance-label">PAID HOL</td>
                    <td className="attendance-value">{displayValue(paidHoliday)}</td>
                    <td className="bank-label">ACCOUNT NO.</td>
                    <td className="bank-value">{displayValue(accountNo)}</td>
                  </tr>

                  <tr>
                    <td className="leave-label">AVAIL</td>
                    <td className="leave-value">{displayValue(plAvailable)}</td>
                    <td className="leave-value">{displayValue(slAvailable)}</td>
                    <td className="leave-value">{displayValue(clAvailable)}</td>
                    <td className="attendance-label">PAID LEAVE</td>
                    <td className="attendance-value">{displayValue(paidLeaves)}</td>
                    <td className="bank-label">IFSC CODE</td>
                    <td className="bank-value">{displayValue(bankIfsc)}</td>
                  </tr>

                  <tr>
                    <td className="leave-label">C/BAL</td>
                    <td className="leave-value">{displayValue(plClosing)}</td>
                    <td className="leave-value">{displayValue(slClosing)}</td>
                    <td className="leave-value">{displayValue(clClosing)}</td>
                    <td className="attendance-label">ABSENT DAYS</td>
                    <td className="attendance-value">{displayValue(absentDays)}</td>
                    <td className="bank-label">INSURANCE NO.</td>
                    <td className="bank-value">{displayValue(insuranceNo)}</td>
                  </tr>

                  <tr>
                    <td colSpan="8">
                      <table className="salary-inner-table">
                        <colgroup>
                          <col className="salary-col-1" />
                          <col className="salary-col-2" />
                          <col className="salary-col-3" />
                          <col className="salary-col-4" />
                          <col className="salary-col-5" />
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
                          <tr>
                            <td className="salary-label">BASIC + VDA</td>
                            <td className="salary-number">{formatNumber(basicVda)}</td>
                            <td className="salary-number">{formatNumber(earnedBasicVda)}</td>
                            <td className="salary-label">PF</td>
                            <td className="salary-number">{formatNumber(deductPf)}</td>
                          </tr>

                          <tr>
                            <td className="salary-label">SPL ALLOWANCE</td>
                            <td className="salary-number">{formatNumber(specialAllow)}</td>
                            <td className="salary-number">{formatNumber(earnedSpecialAllow)}</td>
                            <td className="salary-label">ESIC</td>
                            <td className="salary-number">{formatNumber(deductEsic)}</td>
                          </tr>

                          <tr>
                            <td className="salary-label">HRA</td>
                            <td className="salary-number">{formatNumber(hra)}</td>
                            <td className="salary-number">{formatNumber(earnedHra)}</td>
                            <td className="salary-label">PT</td>
                            <td className="salary-number">{formatNumber(deductPt)}</td>
                          </tr>

                          <tr>
                            <td className="salary-label">OTHER ALLOWANCE</td>
                            <td className="salary-number">{formatNumber(otherAllow)}</td>
                            <td className="salary-number">{formatNumber(earnedOtherAllow)}</td>
                            <td className="salary-label">LWF</td>
                            <td className="salary-number">{formatNumber(deductLwf)}</td>
                          </tr>

                          <tr>
                            <td className="salary-label">LWW</td>
                            <td className="salary-number">{formatNumber(lww)}</td>
                            <td className="salary-number">{formatNumber(earnedLww)}</td>
                            <td className="salary-label">UNIFORM/ID</td>
                            <td className="salary-number">{formatNumber(deductUniform)}</td>
                          </tr>

                          <tr>
                            <td className="salary-label">BONUS</td>
                            <td className="salary-number">{formatNumber(bonus)}</td>
                            <td className="salary-number">{formatNumber(earnedBonus)}</td>
                            <td className="salary-label">ADVANCE</td>
                            <td className="salary-number">{formatNumber(deductAdvance)}</td>
                          </tr>

                          <tr>
                            <td className="salary-label">OT ALLOWANCE</td>
                            <td className="salary-number">{formatNumber(otRate)}</td>
                            <td className="salary-number">{formatNumber(earnedOt)}</td>
                            <td className="salary-label">LOAN</td>
                            <td className="salary-number">{formatNumber(deductLoan)}</td>
                          </tr>

                          <tr>
                            <td className="salary-label">TOTAL EARNINGS</td>
                            <td className="salary-number">{formatNumber(gross)}</td>
                            <td className="salary-number">{formatNumber(earnedGross)}</td>
                            <td className="salary-label">TOTAL DEDUCTIONS</td>
                            <td className="salary-number">{formatNumber(totalDeduction)}</td>
                          </tr>

                          <tr>
                            <td colSpan="3" className="salary-label">
                              NET SALARY
                            </td>
                            <td colSpan="2" className="salary-number">
                              {formatNumber(netSalary)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllPaySlip;