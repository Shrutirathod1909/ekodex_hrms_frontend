import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "Noavember", "December",
];

const firstValue = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const found = value.find(
        (v) => v !== null && v !== undefined && String(v).trim() !== "",
      );
      if (found !== undefined) return found;
    } else if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }
  return "";
};

const textValue = (fallback = "-", ...values) => {
  const value = firstValue(...values);
  return value === "" ? fallback : String(value);
};

const numberValue = (...values) => {
  const value = firstValue(...values);
  if (value === "") return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const money = (value) =>
  numberValue(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const integer = (value) =>
  numberValue(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const dateValue = (...values) => {
  const value = firstValue(...values);
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const monthName = (month) => MONTHS[numberValue(month) - 1] || "-";

const daysInMonth = (month, year) => {
  const m = numberValue(month);
  const y = numberValue(year);
  return m && y ? new Date(y, m, 0).getDate() : 31;
};

const statusFromAttendance = (record) => {
  const status = textValue(
    "",
    record?.status,
    record?.emp_status,
    record?.attendance_status,
  ).trim().toUpperCase();

  if (["P", "PRESENT"].includes(status)) return "P";
  if (["A", "ABSENT"].includes(status)) return "A";
  if (["W", "WO", "WEEKLY OFF"].includes(status)) return "W";
  if (["H", "HOLIDAY", "PH"].includes(status)) return "H";
  if (["OT", "O.T."].includes(status)) return "OT";
  return "";
};

const PrintSalaryByEmployee = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const type = searchParams.get("type") || "employee";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const periodName = monthName(month);

  useEffect(() => {
    let cancelled = false;

    const fetchSalary = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) throw new Error("Employee ID / Site ID is missing.");
        if (!month || !year) throw new Error("Month and year are required.");

        const token = localStorage.getItem("token");
        const params = { month, year };

        if (type === "site") params.site_id = id;
        else params.employee_id = id;

        const response = await axios.get(
          `${API_URL}/api/salary/print-by-employee`,
          {
            params,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Salary data not found.");
        }

        const result = response.data?.data || [];
        if (!Array.isArray(result)) throw new Error("Invalid salary response.");

        if (!cancelled) {
          setEmployees(result);
          if (result.length === 0) {
            setError("No salary slip found for the selected period.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("PRINT SALARY ERROR:", err);
          setEmployees([]);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to fetch salary data.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSalary();
    return () => {
      cancelled = true;
    };
  }, [id, month, year, type]);

  useEffect(() => {
    document.title = "Print Salary Slip - EKODEX TECHNOLOGIES PVT LTD";
    return () => {
      document.title = "EKODEX HRMS";
    };
  }, []);

  const handlePrint = () => {
    const slipElements = Array.from(
      document.querySelectorAll(".salary-slip-page"),
    );
    if (!slipElements.length) {
      alert("Salary slip data is not available.");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1500,height=950,scrollbars=yes,resizable=yes",
    );
    if (!printWindow) {
      alert("Please allow pop-ups for this site to print the salary slip.");
      return;
    }

    const slipsHtml = slipElements.map((element) => element.outerHTML).join("");
    const styles = document.getElementById("salary-slip-styles")?.innerHTML || "";

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Slip - ${periodName} ${year}</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="salary-print-area">${slipsHtml}</div>
        </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 700);
  };

  const handleClose = () => {
    if (window.history.length > 1) window.history.back();
    else window.close();
  };

  if (loading) {
    return (
      <Box className="salary-loading">
        <CircularProgress size={28} />
        <Typography sx={{ fontSize: 14 }}>Loading salary slip...</Typography>
      </Box>
    );
  }

  if (error && employees.length === 0) {
    return (
      <Box className="salary-error-page">
        <Paper sx={{ width: "100%", maxWidth: 600, p: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleClose}>Go Back</Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <style id="salary-slip-styles">{`
        * { box-sizing: border-box; }
        html, body, #root {
          width: 100%; min-height: 100%; margin: 0; padding: 0;
        }
        body {
          background: #fff; color: #294052;
          font-family: Arial, Helvetica, sans-serif; font-size: 12px;
        }
        .salary-toolbar {
          width: 100%; min-height: 55px; display: flex;
          align-items: center; justify-content: space-between;
          gap: 10px; padding: 6px 20px; background: #fff;
          border-bottom: 1px solid #edf0f2;
        }
        .salary-toolbar button { min-height: 40px; border-radius: 2px; font-size: 14px; }
        .salary-print-area {
          display: block; width: 100%; max-width: 100%; padding: 20px;
          margin: 0 auto; background: #fff; overflow-x: auto;
          overflow-y: visible; -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
        }
        @media screen {
          /* Make the full salary slip horizontally scrollable in the portal content area. */
          .salary-slip-page {
            width: 100% !important;
            min-width: 1600px !important;
            max-width: none !important;
          }
        }
        .salary-slip-page {
          width: 100%; max-width: none; margin: 0 auto 16px; padding: 8px;
          background: #fff; border: 1px solid #e0e5e9; box-shadow: none; overflow: visible;
        }
        .salary-table {
          width: 100% !important; margin: 0 !important; border-collapse: collapse !important;
          table-layout: fixed !important; background: #fff !important; color: #294052 !important;
          font-family: Arial, Helvetica, sans-serif !important;
        }
        .salary-table th, .salary-table td {
          border: 1px solid #e0e6eb !important; padding: 5px 4px !important;
          height: 27px; font-size: 12px !important; line-height: 1.2 !important;
          vertical-align: middle !important; overflow-wrap: anywhere; background: #fff !important;
        }
        .salary-table .company-name {
          margin: 0 0 3px !important; color: #e00000 !important;
          font-size: 12px !important; line-height: 1.2 !important; font-weight: 800 !important;
        }
        .salary-table .company-address {
          margin: 2px 0 !important; font-size: 11px !important;
          line-height: 1.35 !important; font-weight: 600 !important;
        }
        .salary-table .pay-slip-title { font-size: 12px !important; line-height: 1.3 !important; font-weight: 700 !important; }
        .salary-table .label-cell { background: #fff !important; font-size: 12px !important; font-weight: 700 !important; text-align: left !important; }
        .salary-table .value-cell { background: #fff !important; font-size: 12px !important; font-weight: 600 !important; }
        .salary-table .center-cell { text-align: center !important; font-size: 12px !important; padding: 4px !important; }
        .salary-table th.section-head {
          height: 28px !important; padding: 5px 4px !important; background: #fff !important;
          font-size: 12px !important; font-weight: 700 !important; text-align: left !important;
        }
        .salary-table td.label-cell, .salary-table td.amount-cell, .salary-table td.net-salary {
          height: 28px !important; padding: 5px 4px !important; font-size: 12px !important; line-height: 1.2 !important;
        }
        .salary-table td.amount-cell { text-align: left !important; white-space: nowrap !important; font-variant-numeric: tabular-nums; }
        .salary-table td.net-salary, .salary-table .total-row td, .salary-table tfoot td { background: #fff !important; font-weight: 800 !important; }
        /* Screen UI: keep the complete attendance table inside its own horizontal scroller */
        .attendance-scroll {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          overscroll-behavior-x: contain;
        }
        .attendance-scroll .employee-attendance-table {
          width: max-content !important;
          min-width: 100% !important;
          max-width: none !important;
          table-layout: auto !important;
        }
        /* Attendance table: compact cells and black text */
        .employee-attendance-table {
          width: max-content !important; min-width: 100% !important; max-width: none !important;
          margin: 4px 0 0 !important;
          border-collapse: collapse !important; table-layout: auto !important;
          background: #fff !important; color: #000 !important;
          font-family: Arial, Helvetica, sans-serif !important;
        }
        .employee-attendance-table th,
        .employee-attendance-table td {
          box-sizing: border-box !important; border: 1px solid #000 !important;
          height: 14px !important; padding: 1px !important;
          font-size: 10px !important; line-height: 11px !important;
          text-align: center !important; vertical-align: middle !important;
          white-space: nowrap !important; background: #fff !important; color: #000 !important;
        }
        .employee-attendance-table thead th {
          height: 16px !important; font-size: 10px !important; font-weight: 700 !important;
        }
        .employee-attendance-table .employee-info {
          text-align: left !important; white-space: normal !important;
          font-weight: 700 !important; color: #000 !important;
        }
        .employee-attendance-table .status-p,
        .employee-attendance-table .status-a,
        .employee-attendance-table .status-w,
        .employee-attendance-table .status-h {
          color: #000 !important; font-weight: 700 !important;
        }
        .employee-attendance-table .total-row td,
        .employee-attendance-table tfoot td {
          color: #000 !important; font-weight: 700 !important; height: 14px !important;
        }
        .salary-loading, .salary-error-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 16px; padding: 16px; background: #f3f6f8;
        }
        @media screen and (max-width: 768px) {
          .salary-print-area { padding: 6px; overflow-x: auto; }
          .salary-slip-page { min-width: 1600px !important; padding: 5px; }
          .salary-toolbar { padding: 8px; }
          .salary-table th, .salary-table td { padding: 4px !important; font-size: 10px !important; }
          .employee-attendance-table th, .employee-attendance-table td { font-size: 10px !important; padding: 1px !important; }
          .attendance-scroll { overflow-x: auto !important; }
        }
        @page { size: A4 landscape; margin: 5mm; }
        @media print {
          html, body, #root { width: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .salary-toolbar, .no-print { display: none !important; }
          .salary-print-area { width: 100% !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          .attendance-scroll { width: 100% !important; overflow: visible !important; }
          .attendance-scroll .employee-attendance-table { width: 100% !important; min-width: 0 !important; }
          .salary-slip-page {
            width: 100% !important; max-width: none !important; min-width: 0 !important;
            margin: 0 !important; padding: 8px 8px 0 !important; border: 0 !important; box-shadow: none !important;
            overflow: visible !important; break-after: page !important; page-break-after: always !important;
          }
          .salary-slip-page:last-child { break-after: auto !important; page-break-after: auto !important; }
          .salary-table, .employee-attendance-table {
            width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; page-break-inside: avoid !important;
          }
          .salary-table th, .salary-table td {
            height: 17px !important; padding: 2px 3px !important; font-size: 8px !important;
            line-height: 10px !important; border: 1px solid #d6dde2 !important;
          }
          .salary-table .company-name { font-size: 10px !important; line-height: 11px !important; }
          .salary-table .company-address { font-size: 8px !important; line-height: 10px !important; }
          .salary-table .pay-slip-title { font-size: 9px !important; }
          .salary-table th.section-head { height: 20px !important; padding: 3px !important; font-size: 9px !important; }
          .salary-table td.label-cell, .salary-table td.amount-cell, .salary-table td.net-salary {
            height: 20px !important; padding: 3px !important; font-size: 9px !important; line-height: 11px !important;
          }
          .employee-attendance-table { margin-top: 3px !important; }
          .employee-attendance-table th, .employee-attendance-table td {
            height: 14px !important; padding: 1px !important; font-size: 10px !important;
            line-height: 11px !important; border: 1px solid #000 !important; color: #000 !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
          .employee-attendance-table thead th { height: 16px !important; font-size: 10px !important; font-weight: 700 !important; }
          .employee-attendance-table .status-p, .employee-attendance-table .status-a,
          .employee-attendance-table .status-w, .employee-attendance-table .status-h,
          .employee-attendance-table .employee-info { color: #000 !important; }
          tr, th, td { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>

      <Box className="salary-toolbar no-print">
        <Typography sx={{ fontSize: 13, color: "#3b4a56", fontWeight: 500 }}>
          Print Salary Slip - EKODEX TECHNOLOGIES PVT LTD
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Button
            variant="contained"
            onClick={handlePrint}
            sx={{ bgcolor: "#2f5f9b", borderRadius: "2px", "&:hover": { bgcolor: "#244d80" } }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{ bgcolor: "#00a651", borderRadius: "2px", "&:hover": { bgcolor: "#008c45" } }}
          >
            Go Back
          </Button>
        </Stack>
      </Box>

      <Box className="salary-print-area">
        {employees.map((item, index) => (
          <SalarySlip
            key={item?.id || item?.salary?.id || item?.employee?.employee_id || item?.employee?.emp_id || index}
            item={item}
            month={month}
            year={year}
            monthName={periodName}
            index={index}
          />
        ))}
      </Box>
    </>
  );
};

const SalarySlip = ({ item, month, year, monthName: currentMonthName, index }) => {
  const employee = item?.employee || {};
  const site = item?.site || {};
  const salary = item?.salary || {};
  const earnings = Array.isArray(item?.earnings)
  ? item.earnings
  : [];

const deductions = Array.isArray(item?.deductions)
  ? item.deductions
  : [];

const earningTotal = numberValue(
  item?.earning_total,
  salary.total_earning,
  item?.total_earning
);

const deductionTotal = numberValue(
  item?.deduction_total,
  salary.total_deduction,
  item?.total_deduction
);
  const attendance = item?.attendance || {};

  const employeeName = textValue("-", employee.emp_name, employee.employee_name, item.emp_name, item.employee_name);
  const employeeCode = textValue("-", employee.employee_code, employee.emp_code, item.employee_code, item.emp_code);
  const siteName = textValue("-", site.site_name, item.site_name);
  const siteId = textValue("-", site.site_id, item.site_id);
  const rank = textValue("-", employee.rank, employee.designation, item.rank, item.designation);
  const joiningDate = dateValue(employee.date_of_joining, item.date_of_joining);
  const dob = dateValue(employee.dob, item.dob);
  const uan = textValue("-", employee.uan_no, item.uan_no);
  const esicIp = textValue("-", employee.esis_no, employee.esic_ip, item.esis_no, item.esic_ip);
  const pan = textValue("-", employee.pancard_no, employee.pan_no, item.pancard_no, item.pan_no);
  const aadhar = textValue("-", employee.aadhar_no, employee.aadhaar_no, item.aadhar_no, item.aadhaar_no);
  const bankName = textValue("-", employee.bank_name, item.bank_name);
  const accountNo = textValue("-", employee.account_no, item.account_no);
  const ifsc = textValue("-", employee.ifsc_code, employee.bank_ifsc, item.ifsc_code, item.bank_ifsc);
  const insuranceNo = textValue("0", employee.insurance_no, employee.insurance_number, item.insurance_no);
  const cardNo = textValue("-", employee.card_no, item.card_no);

 const monthDays = numberValue(attendance.days_in_month, salary.no_of_days, item.no_of_days) || daysInMonth(month, year);

const presentDays = numberValue(attendance.present_days, item.present_days);
const absentDays = numberValue(attendance.absent_days, item.absent_days);
const weeklyOffDays = numberValue(attendance.weekly_off_days, item.weekly_off_days);
const holidayDays = numberValue(attendance.holiday_days, item.holiday_days, item.paid_holiday);
const paidLeaveDays = numberValue(attendance.paid_leave_days, item.paid_leave_days, item.paid_leave);
const overtimeDays = numberValue(attendance.overtime_days, item.overtime_days, item.ot_days);

const payableDays = numberValue(
  attendance.paid_days,
  attendance.payable_days,
  salary.paid_days,
  salary.payable_days,
  salary.net_days,
  item.paid_days,
  item.payable_days,
  item.net_days
) || (presentDays + weeklyOffDays + holidayDays + paidLeaveDays);
  const attendanceRecords = Array.isArray(attendance.daily) ? attendance.daily : [];
  const attendanceMap = {};
  attendanceRecords.forEach((record) => {
    const day = numberValue(record?.day, record?.date_day);
    if (day > 0) attendanceMap[day] = record;
  });

  const plOpening = numberValue(item.pl_opening, item.pl_open, item.pl_ob, item.opening_pl);
  const slOpening = numberValue(item.sl_opening, item.sl_open, item.sl_ob, item.opening_sl);
  const clOpening = numberValue(item.cl_opening, item.cl_open, item.cl_ob, item.opening_cl);
  const plEarned = numberValue(item.pl_earned, item.earned_pl);
  const slEarned = numberValue(item.sl_earned, item.earned_sl);
  const clEarned = numberValue(item.cl_earned, item.earned_cl);
  const plAvailable = numberValue(item.pl_available, item.available_pl);
  const slAvailable = numberValue(item.sl_available, item.available_sl);
  const clAvailable = numberValue(item.cl_available, item.available_cl);
  const plClosing = numberValue(item.pl_closing, item.pl_balance, item.closing_pl);
  const slClosing = numberValue(item.sl_closing, item.sl_balance, item.closing_sl);
  const clClosing = numberValue(item.cl_closing, item.cl_balance, item.closing_cl);

  const basicSalary = numberValue(salary.basic, salary.basic_salary, item.basic_salary, employee.basic_salary);
  const basicVdaPayable = numberValue(salary.basic_vda_payable, salary.basic_plus_vda_payable, salary.basic_vda, item.basic_vda_payable, item.basic_plus_vda_payable, item.basic_salary, employee.basic_salary);
  const basicVdaEarned = numberValue(salary.basic_vda_earned, salary.earned_basic_vda, salary.earned_basic_plus_vda, item.basic_vda_earned, item.earned_basic_vda, item.total_earned_basic_vda);
  const splAllowancePayable = numberValue(salary.spl_allowance_payable, salary.special_allowance_payable, salary.spl_allowance, item.spl_allowance_payable, item.special_allowance_payable, item.spl_allowance);
  const splAllowanceEarned = numberValue(salary.spl_allowance_earned, salary.earned_spl_allowance, salary.earned_special_allowance, item.spl_allowance_earned, item.earned_spl_allowance);
  const hraPayable = numberValue(salary.hra_payable, salary.hra, item.hra_payable, item.hra, employee.hra);
  const hraEarned = numberValue(salary.hra_earned, salary.earned_hra, item.hra_earned, item.earned_hra);
  const otherAllowancePayable = numberValue(salary.other_allowance_payable, salary.other_payable, salary.other_allowance, item.other_allowance_payable, item.other_allowance);
  const otherAllowanceEarned = numberValue(salary.other_allowance_earned, salary.earned_other_allowance, salary.other_earned, item.other_allowance_earned, item.earned_other_allowance, item.other_earning);
  const lwwPayable = numberValue(salary.lww_payable, salary.lww, item.lww_payable, item.lww);
  const lwwEarned = numberValue(salary.lww_earned, salary.earned_lww, item.lww_earned, item.earned_lww);
  const bonusPayable = numberValue(salary.bonus_payable, salary.bonus, item.bonus_payable, item.bonus);
  const bonusEarned = numberValue(salary.bonus_earned, salary.earned_bonus, item.bonus_earned, item.earned_bonus);
  const otPayable = numberValue(salary.ot_allowance_payable, salary.ot_payable, salary.ot_allowance, item.ot_allowance_payable, item.ot_allowance);
  const otEarned = numberValue(salary.ot_allowance_earned, salary.earned_ot_allowance, salary.ot_earned, item.ot_allowance_earned, item.earned_ot_allowance);
  const totalEarningPayable = numberValue(salary.total_payable, salary.gross_salary_payable, salary.gross_payable, item.total_payable, item.gross_salary_payable);
  const totalEarningEarned = numberValue(salary.total_earning, salary.total_earned_gross, item.total_earning, item.total_earned_gross);

  const pf = numberValue(salary.pf, salary.pf_deduction, item.pf, item.pf_deduction, item.earned_pf);
  const esic = numberValue(salary.esic, salary.esic_deduction, item.esic, item.esic_deduction);
  const pt = numberValue(salary.pt, salary.pt_deduction, salary.professional_tax, item.pt, item.pt_deduction, item.professional_tax);
  const lwf = numberValue(salary.lwf, salary.lwf_deduction, salary.unf, item.lwf, item.lwf_deduction, item.unf);
  const uniformId = numberValue(salary.uniform_id, salary.uniform, salary.id_card, salary.card_deduction, item.uniform_id, item.uniform, item.id_card, item.card_deduction);
  const advance = numberValue(salary.advance, salary.advance_deduction, item.advance, item.advance_deduction);
  const fine = numberValue(salary.fine, salary.fine_deduction, item.fine, item.fine_deduction);
  const rc = numberValue(salary.rc, salary.rc_deduction, item.rc, item.rc_deduction);
  const isDeduction = numberValue(salary.is_deduction, salary.is, item.is_deduction, item.is);
  const totalDeduction = numberValue(salary.total_deduction, item.total_deduction);
  const grossSalary = numberValue(salary.gross_salary, item.gross_salary);
  const netTakeHome = numberValue(salary.net_take_home, item.net_take_home, grossSalary);
  const netPayable = numberValue(salary.net_payable, item.net_payable, grossSalary);
  const holdSalary = numberValue(salary.hold_salary, item.hold_salary);
  const salaryDays = numberValue(salary.no_of_days, item.no_of_days, payableDays);

  const payableGross = totalEarningPayable || (
    basicVdaPayable + splAllowancePayable + hraPayable +
    otherAllowancePayable + lwwPayable + bonusPayable + otPayable
  );
  const earnedGross = totalEarningEarned || (
    basicVdaEarned + splAllowanceEarned + hraEarned +
    otherAllowanceEarned + lwwEarned + bonusEarned + otEarned
  );
  const displayPayableGross = payableGross || grossSalary;
  const displayEarnedGross = earnedGross || totalEarningEarned || netTakeHome;
  const companyClient = textValue("EKODEX TECHNOLOGIES PVT LTD", site.client_name, item.client_name);

  const getAttendanceStatus = (day) => statusFromAttendance(attendanceMap[day]);

  const countStatus = (status) =>
    Array.from({ length: monthDays }, (_, i) => getAttendanceStatus(i + 1))
      .filter((value) => value === status).length;

  const presentCount = presentDays || countStatus("P");
  const absentCount = absentDays || countStatus("A");
  const offCount = weeklyOffDays || countStatus("W");
  const totalAttendance = numberValue(
    attendance.total_days,
    presentCount + absentCount + offCount + holidayDays,
  );

  return (
    <Box className="salary-slip-page">
      <table className="salary-table">
        <tbody>
          <tr>
            <td colSpan={40} style={{ textAlign: "center" }}>
              <div className="company-name">{companyClient}</div>
              <div className="company-address">
                Office No-1102, 11th Floor, Technocity IT Premises, K-5/3, TTC Industrial Area,
                Near Hotel Sarovar Portico &amp; ICICI Bank, Mahape, Ghansoli
              </div>
              <div className="company-address">Navi Mumbai - 400710</div>
            </td>
          </tr>
          <tr>
            <td colSpan={40} style={{ textAlign: "center", fontWeight: 800, padding: 5 }}>
              <span className="pay-slip-title">Pay Slip for the Month of {currentMonthName} {year}</span>
            </td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>Employee Name :</td>
            <td className="value-cell" colSpan={11}>{employeeName}</td>
            <td className="label-cell" colSpan={7}>Emp. Code :</td>
            <td className="value-cell" colSpan={13}>{employeeCode}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>Site Name</td>
            <td className="value-cell" colSpan={11}>{siteName}</td>
            <td className="label-cell" colSpan={7}>Designation</td>
            <td className="value-cell" colSpan={13}>{rank}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>DOJ</td>
            <td className="value-cell" colSpan={11}>{joiningDate}</td>
            <td className="label-cell" colSpan={7}>UAN</td>
            <td className="value-cell" colSpan={13}>{uan}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>Month Days</td>
            <td className="value-cell" colSpan={11}>{integer(monthDays)}</td>
            <td className="label-cell" colSpan={7}>ESIC IP</td>
            <td className="value-cell" colSpan={13}>{esicIp}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>Payable Days</td>
            <td className="value-cell" colSpan={11}>{integer(payableDays || salaryDays)}</td>
            <td className="label-cell" colSpan={7}>DOB</td>
            <td className="value-cell" colSpan={13}>{dob}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>Site ID</td>
            <td className="value-cell" colSpan={11}>{siteId}</td>
            <td className="label-cell" colSpan={7}>PAN</td>
            <td className="value-cell" colSpan={13}>{pan}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>Card No.</td>
            <td className="value-cell" colSpan={11}>{cardNo}</td>
            <td className="label-cell" colSpan={7}>Aadhar No</td>
            <td className="value-cell" colSpan={13}>{aadhar}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>Bank Name</td>
            <td className="value-cell" colSpan={11}>{bankName}</td>
            <td className="label-cell" colSpan={7}>Account No.</td>
            <td className="value-cell" colSpan={13}>{accountNo}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={9}>IFSC Code</td>
            <td className="value-cell" colSpan={11}>{ifsc}</td>
            <td className="label-cell" colSpan={7}>Insurance No.</td>
            <td className="value-cell" colSpan={13}>{insuranceNo}</td>
          </tr>

          <tr>
            <th colSpan={4}></th><th colSpan={3}>PL</th><th colSpan={3}>SL</th><th colSpan={3}>CL</th>
            <th colSpan={7}> </th><th colSpan={4}>Work Days</th><th colSpan={3}>{integer(payableDays)}</th>
            <th colSpan={5}> </th><th colSpan={5}> </th><th colSpan={3}> </th>
          </tr>
          <tr>
            <td className="label-cell" colSpan={4}>O/Bal</td>
            <td className="center-cell" colSpan={3}>{integer(plOpening)}</td>
            <td className="center-cell" colSpan={3}>{integer(slOpening)}</td>
            <td className="center-cell" colSpan={3}>{integer(clOpening)}</td>
            <td className="label-cell" colSpan={4}>Weekly Offs</td>
            <td className="center-cell" colSpan={3}>{integer(weeklyOffDays)}</td>
            <td className="label-cell" colSpan={4}>Paid Hol</td>
            <td className="center-cell" colSpan={3}>{integer(holidayDays)}</td>
            <td className="label-cell" colSpan={4}>Paid Leave</td>
            <td className="center-cell" colSpan={3}>{integer(paidLeaveDays)}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={4}>Earned</td>
            <td className="center-cell" colSpan={3}>{integer(plEarned)}</td>
            <td className="center-cell" colSpan={3}>{integer(slEarned)}</td>
            <td className="center-cell" colSpan={3}>{integer(clEarned)}</td>
            <td className="label-cell" colSpan={4}>Absent Days</td>
            <td className="center-cell" colSpan={3}>{integer(absentDays)}</td>
            <td className="label-cell" colSpan={4}>Present Days</td>
            <td className="center-cell" colSpan={3}>{integer(presentDays)}</td>
            <td className="label-cell" colSpan={4}>OT Days</td>
            <td className="center-cell" colSpan={3}>{integer(overtimeDays)}</td>
          </tr>
          <tr>
            <td className="label-cell" colSpan={4}>Avail</td>
            <td className="center-cell" colSpan={3}>{integer(plAvailable)}</td>
            <td className="center-cell" colSpan={3}>{integer(slAvailable)}</td>
            <td className="center-cell" colSpan={3}>{integer(clAvailable)}</td>
            <td className="label-cell" colSpan={4}>C/Bal PL</td>
            <td className="center-cell" colSpan={3}>{integer(plClosing)}</td>
            <td className="label-cell" colSpan={4}>C/Bal SL</td>
            <td className="center-cell" colSpan={3}>{integer(slClosing)}</td>
            <td className="label-cell" colSpan={4}>C/Bal CL</td>
            <td className="center-cell" colSpan={3}>{integer(clClosing)}</td>
          </tr>

          <tr>
            <th colSpan={12} className="section-head">Earnings</th>
            <th colSpan={6} className="section-head">Payable</th>
            <th colSpan={6} className="section-head">Earned</th>
            <th colSpan={10} className="section-head">Deductions</th>
            <th colSpan={6} className="section-head">Amount</th>
          </tr>
   <EarningDeductionRow
  label={earnings[0]?.earning_name || "BASIC + VDA"}
  payable={basicVdaPayable || basicSalary}
  earned={numberValue(earnings[0]?.earning_amount, basicVdaEarned)}
  deduction={deductions[0]?.deduction_name || "PF"}
  amount={numberValue(deductions[0]?.deduction_amount, pf)}
/>

<EarningDeductionRow
  label={earnings[1]?.earning_name || "SPL ALLOWANCE"}
  payable={splAllowancePayable}
  earned={numberValue(earnings[1]?.earning_amount, splAllowanceEarned)}
  deduction={deductions[1]?.deduction_name || "ESIC"}
  amount={numberValue(deductions[1]?.deduction_amount, esic)}
/>

<EarningDeductionRow
  label={earnings[2]?.earning_name || "HRA"}
  payable={hraPayable}
  earned={numberValue(earnings[2]?.earning_amount, hraEarned)}
  deduction={deductions[2]?.deduction_name || "PT"}
  amount={numberValue(deductions[2]?.deduction_amount, pt)}
/>

<EarningDeductionRow
  label={earnings[3]?.earning_name || "OTHER ALLOWANCE"}
  payable={otherAllowancePayable}
  earned={numberValue(earnings[3]?.earning_amount, otherAllowanceEarned)}
  deduction={deductions[3]?.deduction_name || "LWF"}
  amount={numberValue(deductions[3]?.deduction_amount, lwf)}
/>

<EarningDeductionRow
  label={earnings[4]?.earning_name || "LWW"}
  payable={lwwPayable}
  earned={numberValue(earnings[4]?.earning_amount, lwwEarned)}
  deduction={deductions[4]?.deduction_name || "Uniform/ID"}
  amount={numberValue(deductions[4]?.deduction_amount, uniformId)}
/>

<EarningDeductionRow
  label={earnings[5]?.earning_name || "BONUS"}
  payable={bonusPayable}
  earned={numberValue(earnings[5]?.earning_amount, bonusEarned)}
  deduction={deductions[5]?.deduction_name || "Advance"}
  amount={numberValue(deductions[5]?.deduction_amount, advance)}
/>

<EarningDeductionRow
  label={earnings[6]?.earning_name || "OT ALLOWANCE"}
  payable={otPayable}
  earned={numberValue(earnings[6]?.earning_amount, otEarned)}
  deduction={
    deductions[6]?.deduction_name || "Fine / R.C."
  }
  amount={numberValue(
    deductions[6]?.deduction_amount,
    fine + rc + isDeduction
  )}
/> <tr>
            <td colSpan={12} className="label-cell">Total Earnings</td>
            <td colSpan={6} className="amount-cell"><b>{money(displayPayableGross)}</b></td>
            <td colSpan={6} className="amount-cell"><b>{money(displayEarnedGross)}</b></td>
            <td colSpan={10} className="label-cell">Total Deductions</td>
            <td colSpan={6} className="amount-cell"><b>{money(totalDeduction)}</b></td>
          </tr>
          <tr>
            <td colSpan={12} className="label-cell">Net Salary</td>
            <td colSpan={6} className="amount-cell net-salary">{money(grossSalary)}</td>
            <td colSpan={6} className="amount-cell net-salary">{money(netTakeHome)}</td>
            <td colSpan={10} className="label-cell">Net Payable</td>
            <td colSpan={6} className="amount-cell net-salary">{money(netPayable)}</td>
          </tr>
        </tbody>
      </table>

      <div className="attendance-scroll">
      <table className="employee-attendance-table">
        <thead>
          <tr>
            <th style={{ width: 38 }}>Sr No.</th>
            <th style={{ width: 140 }}>Employee Name</th>
            <th style={{ width: 95 }}>Site Name</th>
            <th style={{ width: 155 }}>Rank</th>
            {Array.from({ length: monthDays }, (_, i) => (
              <th key={i + 1} style={{ width: 25 }}>{i + 1}</th>
            ))}
            <th style={{ width: 38 }}>N.D.</th>
            <th style={{ width: 38 }}>O.T.</th>
            <th style={{ width: 38 }}>Off</th>
            <th style={{ width: 42 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{index + 1}</td>
            <td className="employee-info">{employeeName}</td>
            <td className="employee-info">{siteName}</td>
            <td className="employee-info">{rank}</td>
            {Array.from({ length: monthDays }, (_, i) => {
              const status = getAttendanceStatus(i + 1);
              const cls = status === "P" ? "status-p" : status === "A" ? "status-a" : status === "W" ? "status-w" : status === "H" ? "status-h" : "";
              return <td key={i + 1} className={cls}>{status}</td>;
            })}
            <td>{integer(presentCount)}</td>
            <td>{integer(overtimeDays)}</td>
            <td>{integer(offCount)}</td>
            <td>{integer(totalAttendance)}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={monthDays + 4}></td>
            <td>N.D. {integer(presentCount)}</td>
            <td>O.T. {integer(overtimeDays)}</td>
            <td>Off {integer(offCount)}</td>
            <td>Total {integer(totalAttendance)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </Box>
  );
};

const EarningDeductionRow = ({
  label,
  payable,
  earned,
  deduction,
  amount,
}) => {
  const isAnyOther = (value) =>
    String(value ?? "").trim().toUpperCase() === "ANY OTHER";

  // Earning किंवा Deduction कोणतेही ANY OTHER असेल,
  // तर संपूर्ण row hide होईल.
  if (isAnyOther(label) || isAnyOther(deduction)) {
    return null;
  }

  return (
    <tr>
      <td colSpan={12} className="label-cell">{label}</td>
      <td colSpan={6} className="amount-cell">{money(payable)}</td>
      <td colSpan={6} className="amount-cell">{money(earned)}</td>
      <td colSpan={10} className="label-cell">{deduction}</td>
      <td colSpan={6} className="amount-cell">{money(amount)}</td>
    </tr>
  );
};

export default PrintSalaryByEmployee;
