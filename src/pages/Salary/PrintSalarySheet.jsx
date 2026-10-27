
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PrintSalarySheet.css";

const API_URL = import.meta.env.VITE_API_URL;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MAIN_COLUMNS = [
  { label: "Sr No.", key: "sr" },
  { label: "Name", key: "name", className: "name" },
  { label: "ID No", key: "id" },
  { label: "Gross", key: "gross", total: true },
  { label: "Post", key: "post", className: "post" },
  { label: "D.P.", key: "dp", total: true },
  { label: "Salary", key: "salary", total: true },
  { label: "Other", key: "other", total: true },
  { label: "Advance", key: "advance", total: true },
  { label: "P.F.", key: "pf", total: true },
  { label: "ESIC", key: "esic", total: true },
  { label: "P.T.", key: "pt", total: true },
  { label: "Unf", key: "unf", total: true },
  { label: "R.C.", key: "rc", total: true },
  { label: "Fine", key: "fine", total: true },
  { label: "IS", key: "is", total: true },
  { label: "ttl-ded", key: "deduction", total: true },
  { label: "Net Amt", key: "net", total: true },
  { label: "Ac holder", key: "account" },
  { label: "Bank Name", key: "bank" },
  { label: "Card No", key: "card" },
  { label: "Sign", key: "sign" },
];

const HOLD_COLUMNS = [
  { label: "Sr No.", key: "sr" },
  { label: "Name", key: "name", className: "name" },
  { label: "ID No", key: "id" },
  { label: "Gross", key: "gross" },
  { label: "Post", key: "post", className: "post" },
  { label: "D.P.", key: "dp" },
  { label: "Salary", key: "salary" },
  { label: "Other", key: "other" },
  { label: "Advance", key: "advance" },
  { label: "P.F.", key: "pf" },
  { label: "ESIC", key: "esic" },
  { label: "P.T.", key: "pt" },
  { label: "Unf", key: "unf" },
  { label: "IS", key: "is" },
  { label: "ttl-ded", key: "deduction" },
  { label: "Net Amt", key: "net" },
  { label: "bank-a-c", key: "bankAccount" },
  { label: "Sign", key: "sign" },
];

const FIELDS = {
  name: ["emp_name", "name", "employee_name", "emp_full_name"],
  id: ["emp_code", "id_no", "employee_code", "emp_id"],
  gross: ["gross", "gross_salary"],
  post: ["rank", "post", "designation"],
  dp: ["dp", "present_days"],
  salary: ["salary", "earned_gross", "net_salary"],
  other: ["other", "other_allowance"],
  advance: ["advance", "deduct_advance"],
  pf: ["pf", "deduct_pf"],
  esic: ["esic", "deduct_esic"],
  pt: ["pt", "deduct_pt"],
  unf: ["unf", "uniform", "deduct_uniform"],
  rc: ["rc"],
  fine: ["fine"],
  is: ["is"],
  deduction: ["total_deduction", "ttl_ded"],
  net: ["net_amount", "net_amt", "net_take_home", "salary_payable"],
  account: ["account_holder", "accountHolder"],
  bank: ["bank_name", "bankName"],
  card: ["card_no", "cardNo"],
  bankAccount: ["bank_account", "bank_account_no", "bank_name"],
};

const getValue = (item, ...keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item[key] !== "") {
      return item[key];
    }
  }
  return "";
};

const getNumber = (item, key) => {
  const value = getValue(item, ...(FIELDS[key] || [key]));
  const number = Number(String(value || 0).replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const getEmployeeName = (item) => getValue(item, ...FIELDS.name) || "-";
const getEmployeeCode = (item) => getValue(item, ...FIELDS.id) || "-";

const getPaymentMode = (item) =>
  String(item?.payment_mode || item?.salary_mode || "")
    .trim()
    .toLowerCase();

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const PrintSalarySheet = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const siteId = searchParams.get("id");
  const month = searchParams.get("month") || "4";
  const year = searchParams.get("year") || "2026";

  const [site, setSite] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [holdEmployees, setHoldEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthName = MONTHS[Number(month) - 1] || "April";

  useEffect(() => {
    let active = true;

    const fetchSalary = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/salary/site-employees`,
          {
            params: { site_id: siteId, month, year },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!active) return;

        if (response.data?.success) {
          setEmployees(
            Array.isArray(response.data.data) ? response.data.data : []
          );
          setSite(response.data.site || null);

          const holds =
            response.data.holdEmployees ??
            response.data.hold_employees ??
            [];

          setHoldEmployees(Array.isArray(holds) ? holds : []);
        } else {
          setEmployees([]);
          setHoldEmployees([]);
          setError(response.data?.message || "Salary data not found.");
        }
      } catch (err) {
        if (!active) return;

        console.error("PRINT SALARY ERROR:", err);
        setEmployees([]);
        setHoldEmployees([]);
        setError(
          err.response?.data?.message ||
            "Unable to load salary data. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSalary();
    return () => {
      active = false;
    };
  }, [siteId, month, year]);

  const totals = useMemo(() => {
    const result = {};

    MAIN_COLUMNS.filter((column) => column.total).forEach(({ key }) => {
      result[key] = employees.reduce(
        (sum, item) => sum + getNumber(item, key),
        0
      );
    });

    return result;
  }, [employees]);

  const paymentTotals = useMemo(
    () =>
      employees.reduce(
        (result, item) => {
          const mode = getPaymentMode(item);
          const amount = getNumber(item, "net");

          if (mode === "card") result.card += amount;
          if (mode === "cash") result.cash += amount;
          if (mode === "bank") result.bank += amount;

          return result;
        },
        { card: 0, cash: 0, bank: 0 }
      ),
    [employees]
  );

  const renderCell = (item, key, index) => {
    if (key === "sr") return index + 1;
    if (key === "name") return getEmployeeName(item);
    if (key === "id") return getEmployeeCode(item);
    if (key === "post") return getValue(item, ...FIELDS.post) || "-";
    if (key === "sign") return "";
    if (key === "account") return getValue(item, ...FIELDS.account);
    if (key === "bank") return getValue(item, ...FIELDS.bank);
    if (key === "card") return getValue(item, ...FIELDS.card);
    if (key === "bankAccount") return getValue(item, ...FIELDS.bankAccount);

    return formatNumber(getNumber(item, key));
  };

  const renderEmployeeTable = (rows, columns, className, isHold = false) => (
    <table className={className}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={column.className || ""}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="no-data">
              {isHold ? "" : "No salary data found"}
            </td>
          </tr>
        ) : (
          rows.map((item, index) => (
            <tr key={item.id || item.emp_id || item.employee_id || index}>
              {columns.map((column) => (
                <td key={column.key} className={column.className || ""}>
                  {renderCell(item, column.key, index)}
                </td>
              ))}
            </tr>
          ))
        )}

        {!isHold && rows.length > 0 && (
          <tr className="total-row">
            {columns.map((column) => (
              <td key={column.key}>
                {column.total ? formatNumber(totals[column.key]) : ""}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );

const handlePrint = () => {
  if (loading) {
    window.alert("Salary data is still loading. Please wait.");
    return;
  }

  const content = document.querySelector(".salary-print-content");

  if (!content) {
    window.alert("Salary content not found.");
    return;
  }

  if (error && employees.length === 0) {
    window.alert("Salary data is not available to print.");
    return;
  }

  window.print();
};

  const handleDownload = () => {
    const rows = [
      ["EKODEX TECHNOLOGIES PVT LTD"],
      ["Site Name", site?.site_name || "Mahape"],
      ["Month", monthName],
      ["Year", year],
      [],
      MAIN_COLUMNS.map((column) => column.label),
    ];

    employees.forEach((item, index) => {
      rows.push(MAIN_COLUMNS.map((column) => renderCell(item, column.key, index)));
    });

    if (employees.length) {
      rows.push(
        MAIN_COLUMNS.map((column) =>
          column.key === "id"
            ? "TOTAL"
            : column.total
              ? formatNumber(totals[column.key])
              : ""
        )
      );
    }

    rows.push(
      [],
      ["PAYMENT SUMMARY"],
      ["CARD SALARY", formatNumber(paymentTotals.card)],
      ["CASH SALARY", formatNumber(paymentTotals.cash)],
      ["BANK SALARY", formatNumber(paymentTotals.bank)],
      [],
      ["HOLD SALARY EMPLOYEE"],
      HOLD_COLUMNS.map((column) => column.label)
    );

    holdEmployees.forEach((item, index) => {
      rows.push(HOLD_COLUMNS.map((column) => renderCell(item, column.key, index)));
    });

    const csv = "\uFEFF" + rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeSiteName = (site?.site_name || "Mahape")
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    link.href = url;
    link.download = `Salary_Sheet_${safeSiteName}_${monthName}_${year}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="print-site-page">
      <div className="print-page-header no-print">
        <span>Print Salary Sheet - {site?.site_name || "Mahape"}</span>

        <div className="print-page-actions">
          <button className="print-btn" onClick={handlePrint}>Print</button>
          <button className="download-btn" onClick={handleDownload}>Download</button>
          <button
            className="back-btn"
            onClick={() => navigate("/salary/salary-by-employee")}
          >
            Go Back
          </button>
        </div>
      </div>

      <div className="salary-print-content">
        <div className="company-header">
          <h1>EKODEX TECHNOLOGIES PVT LTD</h1>
          <p>
            Office No-1102, 11th Floor, Technocity IT Premises X-5/3,
            TTC Industrial Area, Near Hotel Sarovar Portico & ICICI Bank,
            Mahape, Ghansoli, Navi Mumbai - 400710
          </p>
          <p>Navi Mumbai - 400710</p>
          <p>Tel.: 7977271174 Email:</p>
        </div>

        <div className="salary-line" />

        <div className="site-month-year">
          <div><b>Site Name:</b> {site?.site_name || "Mahape"}</div>
          <div><b>Month:</b> {monthName}</div>
          <div><b>Year:</b> {year}</div>
        </div>

        {loading ? (
          <div className="loading-text">Loading salary data...</div>
        ) : error && employees.length === 0 ? (
          <div className="error-text">{error}</div>
        ) : (
          <>
            <div className="salary-table-container">
              {renderEmployeeTable(
                employees,
                MAIN_COLUMNS,
                "print-salary-table"
              )}
            </div>

            <div className="salary-payment-summary">
              <div><b>CARD SALARY</b><span>{formatNumber(paymentTotals.card)}</span></div>
              <div><b>CASH SALARY</b><span>{formatNumber(paymentTotals.cash)}</span></div>
              <div><b>BANK SALARY</b><span>{formatNumber(paymentTotals.bank)}</span></div>
            </div>

            <div className="hold-salary-section">
              <h3>Hold Salary Employee</h3>
              <div className="hold-salary-container">
                {renderEmployeeTable(
                  holdEmployees,
                  HOLD_COLUMNS,
                  "hold-salary-table",
                  true
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrintSalarySheet;
