import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import "./salary.css";
// import * as XLSX from "xlsx-js-style";

const SalaryWagesSheet = ({ salaryData }) => {
  const [employees, setEmployees] = useState([]);
  const [billInfo, setBillInfo] = useState({});
  const [totals, setTotals] = useState({});

  // =========================================================
  // FORMAT VALUE
  // =========================================================

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return value;
  };

  // =========================================================
  // NUMBER VALUE
  // =========================================================

  const numberValue = (value) => {
    const num = Number(value);

    return Number.isFinite(num) ? num : 0;
  };

  // =========================================================
  // WAGES HEADER
  // =========================================================

  const wagesHeader = useMemo(() => {
    let header = salaryData?.client_rates?.[0]?.wages_header;

    if (!header) {
      return {};
    }

    try {
      if (typeof header === "string") {
        return JSON.parse(header);
      }

      return header;
    } catch (error) {
      console.error("WAGES HEADER PARSE ERROR:", error);
      return {};
    }
  }, [salaryData]);

  // =========================================================
  // EXACT EMP_WAGES MAPPING
  // =========================================================

  const columnGroups = useMemo(
    () => ({
      // =====================================================
      // PRIMARY DETAILS
      // =====================================================

      primaryDetail: {
        title: "PRIMARY DETAILS",

        columns: [
          {
            key: "srNo",
            label: "SR. NO.",
            source: "index",
            numeric: false,
          },
          {
            key: "nameOfEmployee",
            label: "NAME OF EMPLOYEE",
            source: "employee_full_name",
            fallback: "emp_name",
            numeric: false,
          },
          {
            key: "dob",
            label: "DOB",
            source: "employee_dob",
            fallback: "dob",
            numeric: false,
          },
          {
            key: "mobileNo",
            label: "MOBILE NO.",
            source: "employee_mobile_no",
            fallback: "phone1",
            numeric: false,
          },
          {
            key: "aadhar",
            label: "AADHAR",
            source: "employee_aadhar_no",
            fallback: "aadhar_no",
            numeric: false,
          },
          {
            key: "ifsc",
            label: "IFSC",
            source: "employee_ifsc",
            fallback: "bank_ifsc",
            numeric: false,
          },
          {
            key: "pan",
            label: "PAN",
            source: "employee_pan",
            fallback: "pancard_no",
            numeric: false,
          },
          {
            key: "bankName",
            label: "BANK NAME",
            source: "employee_bank_name",
            fallback: "bank_name",
            numeric: false,
          },
          {
            key: "acNo",
            label: "A/C NO.",
            source: "employee_account_no",
            fallback: "account_no",
            numeric: false,
          },
          {
            key: "doj",
            label: "DOJ",
            source: "employee_doj",
            fallback: "date_of_joining",
            numeric: false,
          },
          {
            key: "designation",
            label: "DESIGNATION",
            source: "employee_designation",
            fallback: "rank",
            numeric: false,
          },
          {
            key: "empCode",
            label: "EMP CODE",
            source: "employee_code_master",
            fallback: "emp_code",
            numeric: false,
          },
          {
            key: "pf",
            label: "PF NO.",
            source: "employee_pf_no",
            fallback: "pf_no",
            numeric: false,
          },
          {
            key: "uan",
            label: "UAN",
            source: "employee_uan_no",
            fallback: "uan_no",
            numeric: false,
          },
          {
            key: "esicIp",
            label: "ESIC IP",
            source: "employee_esis_no",
            fallback: "esis_no",
            numeric: false,
          },

          // ATTENDANCE
          {
            key: "monthDay",
            label: "MONTH DAYS",
            source: "month_days",
            numeric: true,
          },
          {
            key: "presentDays",
            label: "PRESENT DAYS",
            source: "present_days",
            numeric: true,
          },
          {
            key: "absentDays",
            label: "ABSENT DAYS",
            source: "absent_days",
            numeric: true,
          },
          {
            key: "otDay",
            label: "OT DAYS",
            source: "ot_days",
            numeric: true,
          },
          {
            key: "weeklyOff",
            label: "WEEKLY OFF",
            source: "weekly_off",
            numeric: true,
          },
          {
            key: "paidLeaves",
            label: "PAID LEAVES",
            source: "paid_leaves",
            numeric: true,
          },
          {
            key: "halfDay",
            label: "HALF DAY",
            source: "half_day",
            numeric: true,
          },
          {
            key: "totalSalaryDays",
            label: "TOTAL SALARY DAYS",
            source: "net_days",
            numeric: true,
          },
        ],
      },

      // =====================================================
      // FIXED GROSS
      // =====================================================

      fixGrossComponents: {
        title: "FIX GROSS COMPONENTS",

        columns: [
          {
            key: "basic",
            label: "BASIC",
            source: "basic",
            numeric: true,
          },
          {
            key: "vda",
            label: "VDA",
            source: "vda",
            numeric: true,
          },
          {
            key: "hra",
            label: "HRA",
            source: "hra",
            numeric: true,
          },
          {
            key: "specialAllowance",
            label: "SPECIAL ALLOWANCE",
            source: "special_allow",
            numeric: true,
          },
          {
            key: "otherAllowance",
            label: "OTHER ALLOWANCE",
            source: "other_allow",
            numeric: true,
          },
          {
            key: "otRate",
            label: "OT RATE",
            source: "ot_rate",
            numeric: true,
          },
          {
            key: "lww",
            label: "LWW",
            source: "lww",
            numeric: true,
          },
          {
            key: "bonus",
            label: "BONUS",
            source: "bonus",
            numeric: true,
          },
          {
            key: "leaveWages",
            label: "LEAVE WAGES",
            source: "fixed_leave_wages",
            numeric: true,
          },
          {
            key: "rateOrDay",
            label: "RATE / DAY",
            source: "per_day_rate",
            numeric: true,
          },
          {
            key: "anyOther",
            label: "ANY OTHER",
            source: "any_other",
            numeric: true,
          },
          {
            key: "totalGross",
            label: "TOTAL GROSS",
            source: "gross",
            numeric: true,
          },
        ],
      },

      // =====================================================
      // EARNED COMPONENTS
      // =====================================================

      earnedComponents: {
        title: "EARNED COMPONENTS",

        columns: [
          {
            key: "basic",
            label: "BASIC",
            source: "earned_basic",
            numeric: true,
          },
          {
            key: "vda",
            label: "VDA",
            source: "earned_da",
            numeric: true,
          },
          {
            key: "hra",
            label: "HRA",
            source: "earned_hra",
            numeric: true,
          },
          {
            key: "specialAllowance",
            label: "SPECIAL ALLOWANCE",
            source: "earned_special_allow",
            numeric: true,
          },
          {
            key: "otherAllowance",
            label: "OTHER ALLOWANCE",
            source: "earned_other_allow",
            numeric: true,
          },
          {
            key: "otAmount",
            label: "OT AMOUNT",
            source: "earned_ot_wages",
            numeric: true,
          },
          {
            key: "lww",
            label: "LWW",
            source: "earned_lww",
            numeric: true,
          },
          {
            key: "bonus",
            label: "BONUS",
            source: "earned_bonus",
            numeric: true,
          },
          {
            key: "leaveWages",
            label: "LEAVE WAGES",
            source: "earned_leave_wages",
            numeric: true,
          },
          {
            key: "anyOther",
            label: "ANY OTHER",
            source: "earned_any_other",
            numeric: true,
          },
          {
            key: "totalEarned",
            label: "TOTAL EARNED",
            source: "earned_gross",
            numeric: true,
          },
        ],
      },

      // =====================================================
      // DEDUCTIONS
      // =====================================================

      deductions: {
        title: "DEDUCTIONS",

        columns: [
          {
            key: "epf",
            label: "EPF",
            source: "deduct_pf",
            numeric: true,
          },
          {
            key: "esic",
            label: "ESIC",
            source: "deduct_esic",
            numeric: true,
          },
          {
            key: "pt",
            label: "PT",
            source: "deduct_pt",
            numeric: true,
          },
          {
            key: "mlwf",
            label: "MLWF",
            source: "deduct_lwf",
            numeric: true,
          },
          {
            key: "advance",
            label: "ADVANCE",
            source: "deduct_advance",
            numeric: true,
          },
          {
            key: "loan",
            label: "LOAN",
            source: "deduct_loan",
            numeric: true,
          },
          {
            key: "uniform",
            label: "UNIFORM",
            source: "deduct_uniform",
            numeric: true,
          },
          {
            key: "id",
            label: "ID",
            source: "deduct_id",
            numeric: true,
          },
          {
            key: "recovery",
            label: "RECOVERY",
            source: "deduct_recovery",
            numeric: true,
          },
          {
            key: "installments",
            label: "INSTALLMENTS",
            source: "deduct_installment",
            numeric: true,
          },
          {
            key: "anyother",
            label: "ANY OTHER",
            source: "deduct_other",
            numeric: true,
          },
          {
            key: "totalDeduction",
            label: "TOTAL DEDUCTION",
            source: "total_deduction",
            numeric: true,
          },
        ],
      },

      // =====================================================
      // CONTRIBUTIONS
      // =====================================================

      contributions: {
        title: "CONTRIBUTIONS",

        columns: [
          {
            key: "esic",
            label: "ESIC",
            source: "emp_esic",
            numeric: true,
          },
          {
            key: "epf",
            label: "EPF",
            source: "emp_pf",
            numeric: true,
          },
          {
            key: "mlwf",
            label: "MLWF",
            source: "emp_lwf",
            numeric: true,
          },
          {
            key: "uniform",
            label: "UNIFORM",
            source: "earned_uniform_wages",
            numeric: true,
          },
          {
            key: "subtotal",
            label: "SUB TOTAL",
            source: "emp_ctc",
            numeric: true,
          },
        ],
      },
    }),
    [],
  );

  // =========================================================
  // SINGLE ROOT LEVEL COLUMNS
  // =========================================================

  const singleColumns = useMemo(
    () => [
      {
        key: "salaryPayable",
        label: "SALARY PAYABLE",
        source: "salary_payable",
        numeric: true,
      },
      {
        key: "arrearsPayable",
        label: "ARREARS PAYABLE",
        source: "arrears_payable",
        numeric: true,
      },
      {
        key: "netSalary",
        label: "NET SALARY",
        source: "net_take_home",
        numeric: true,
      },
      {
        key: "serviceCharges",
        label: "SERVICE CHARGES",
        source: "emp_service_charges",
        numeric: true,
      },
      {
        key: "taxValueBeforeTax",
        label: "TAX VALUE BEFORE TAX",
        source: "emp_ictc",
        numeric: true,
      },
      {
        key: "igst",
        label: "IGST",
        source: "IGST",
        numeric: true,
      },
      {
        key: "sgst",
        label: "SGST",
        source: "SGST",
        numeric: true,
      },
      {
        key: "wagesForPf",
        label: "WAGES FOR PF",
        source: "pf_wages",
        numeric: true,
      },
      {
        key: "wagesForEsic",
        label: "WAGES FOR ESIC",
        source: "esic_wages",
        numeric: true,
      },
      {
        key: "cgst",
        label: "CGST",
        source: "CGST",
        numeric: true,
      },
      {
        key: "taxInvoiceValue",
        label: "INVOICE VALUE",
        source: "emp_invoice_amount",
        numeric: true,
      },
    ],
    [],
  );

  // =========================================================
  // ACTIVE GROUPS / COLUMNS
  // =========================================================

  const activeGroups = useMemo(() => {
    const groups = [];

    Object.entries(columnGroups).forEach(([groupKey, group]) => {
      const enabledColumns = group.columns.filter(
        (column) => wagesHeader?.[groupKey]?.[column.key] === true,
      );

      if (enabledColumns.length > 0) {
        groups.push({
          key: groupKey,
          title: group.title,
          columns: enabledColumns,
        });
      }
    });

    return groups;
  }, [columnGroups, wagesHeader]);

  const activeSingleColumns = useMemo(() => {
    return singleColumns.filter((column) => wagesHeader?.[column.key] === true);
  }, [singleColumns, wagesHeader]);

  // =========================================================
  // FINAL FLAT COLUMNS
  // =========================================================

  const activeColumns = useMemo(() => {
    const result = [];

    activeGroups.forEach((group) => {
      group.columns.forEach((column) => {
        result.push({
          ...column,
          groupKey: group.key,
          groupTitle: group.title,
        });
      });
    });

    activeSingleColumns.forEach((column) => {
      result.push({
        ...column,
        groupKey: "single",
        groupTitle: "",
      });
    });

    return result;
  }, [activeGroups, activeSingleColumns]);

  // =========================================================
  // GET VALUE
  // =========================================================

  const getColumnValue = (emp, column, index) => {
    if (column.source === "index") {
      return index + 1;
    }

    const value = emp?.[column.source];

    if (value !== null && value !== undefined && value !== "") {
      return value;
    }

    if (column.fallback) {
      return emp?.[column.fallback];
    }

    return "-";
  };

  // =========================================================
  // TOTALS
  // =========================================================

  const calculateTotals = (employeeList) => {
    const result = {};

    activeColumns.forEach((column) => {
      if (column.source === "index" || !column.numeric) {
        result[column.source] = "";
        return;
      }

      result[column.source] = employeeList.reduce(
        (sum, employee) => sum + numberValue(employee?.[column.source]),
        0,
      );
    });

    setTotals(result);
  };

  // =========================================================
  // USE EFFECT
  // =========================================================

  useEffect(() => {
    const empData = salaryData?.emp_wages || [];

    setEmployees(empData);

    if (salaryData?.bill_info && salaryData.bill_info.length > 0) {
      setBillInfo(salaryData.bill_info[0]);
    }

    calculateTotals(empData);
  }, [salaryData, activeColumns]);

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // =========================================================
  // EXCEL DOWNLOAD
  // =========================================================

  const handleDownloadExcel = () => {
    if (!employees.length) {
      return;
    }

    // -------------------------------------------------------
    // GROUP HEADER
    // -------------------------------------------------------

    const mainHeader = [];
    const subHeader = [];

    activeGroups.forEach((group) => {
      group.columns.forEach((column, index) => {
        if (index === 0) {
          mainHeader.push(group.title);
        } else {
          mainHeader.push("");
        }

        subHeader.push(column.label);
      });
    });

    activeSingleColumns.forEach((column) => {
      mainHeader.push(column.label);
      subHeader.push("");
    });

    // -------------------------------------------------------
    // BODY
    // -------------------------------------------------------

    const rows = employees.map((employee, index) =>
      activeColumns.map((column) => getColumnValue(employee, column, index)),
    );

    // -------------------------------------------------------
    // TOTAL
    // -------------------------------------------------------

    const totalRow = activeColumns.map((column) => {
      if (column.source === "index") {
        return "";
      }

      if (!column.numeric) {
        return column.source === "employee_full_name" ? "TOTAL" : "";
      }

      return totals[column.source] ?? 0;
    });

    const sheetData = [mainHeader, subHeader, ...rows, totalRow];

    // -------------------------------------------------------
    // SHEET
    // -------------------------------------------------------

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // -------------------------------------------------------
    // MERGES
    // -------------------------------------------------------

    const merges = [];

    let currentColumn = 0;

    activeGroups.forEach((group) => {
      const start = currentColumn;

      const end = currentColumn + group.columns.length - 1;

      if (end > start) {
        merges.push({
          s: {
            r: 0,
            c: start,
          },
          e: {
            r: 0,
            c: end,
          },
        });
      }

      currentColumn = end + 1;
    });

    worksheet["!merges"] = merges;

    // -------------------------------------------------------
    // DYNAMIC WIDTH
    // -------------------------------------------------------

    worksheet["!cols"] = activeColumns.map((column) => {
      let maxLength = column.label.length;

      employees.forEach((employee, index) => {
        const value = getColumnValue(employee, column, index);

        maxLength = Math.max(maxLength, String(value ?? "").length);
      });

      return {
        wch: Math.min(Math.max(maxLength + 2, 10), 35),
      };
    });

    // -------------------------------------------------------
    // STYLES
    // -------------------------------------------------------

    const headerStyle = {
      font: {
        bold: true,
        color: {
          rgb: "FFFFFF",
        },
      },

      fill: {
        fgColor: {
          rgb: "1E40AF",
        },
      },

      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },

      border: {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      },
    };

    const subHeaderStyle = {
      font: {
        bold: true,
      },

      fill: {
        fgColor: {
          rgb: "DBEAFE",
        },
      },

      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },

      border: {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      },
    };

    const bodyStyle = {
      alignment: {
        horizontal: "center",
        vertical: "center",
      },

      border: {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      },
    };

    const totalStyle = {
      font: {
        bold: true,
      },

      fill: {
        fgColor: {
          rgb: "FDE68A",
        },
      },

      alignment: {
        horizontal: "center",
        vertical: "center",
      },

      border: {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      },
    };

    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const address = XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

        if (!worksheet[address]) {
          continue;
        }

        if (row === 0) {
          worksheet[address].s = headerStyle;
        } else if (row === 1) {
          worksheet[address].s = subHeaderStyle;
        } else if (row === employees.length + 2) {
          worksheet[address].s = totalStyle;
        } else {
          worksheet[address].s = bodyStyle;
        }
      }
    }

    // -------------------------------------------------------
    // DOWNLOAD
    // -------------------------------------------------------

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Wages");

    XLSX.writeFile(
      workbook,
      `Salary_Wages_${billInfo?.invoice_no || "Sheet"}.xlsx`,
    );
  };

  // =========================================================
  // MONTH
  // =========================================================

  const billingMonth =
    billInfo?.invoice_month && billInfo?.invoice_year
      ? new Date(
          Number(billInfo.invoice_year),
          Number(billInfo.invoice_month) - 1,
        ).toLocaleString("default", {
          month: "long",
        })
      : "-";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div id="print-area" className="salary-wrapper">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Card className="shadow-sm border-0 mb-3 no-print">
        <Card.Header className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            {/* <h3 className="mb-2 fw-bold text-dark">Salary Wages Sheet</h3> */}

            <div className="invoice-info">
              {/* <p>
                <strong>Invoice No :</strong> {billInfo?.invoice_no || "-"}
              </p> */}

              <p>
                <strong>Billing Month :</strong> {billingMonth}{" "}
                {billInfo?.invoice_year || ""}
              </p>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="danger"
              className="px-4 fw-semibold"
              onClick={handlePrint}
            >
              Print
            </Button>

            <Button
              variant="success"
              className="px-4 fw-semibold"
              onClick={handleDownloadExcel}
            >
              Download
            </Button>
          </div>
        </Card.Header>
      </Card>

      {/* =====================================================
          PRINT HEADER
      ===================================================== */}

      {/* <div className="salary-print-header">
        <h2>SALARY WAGES SHEET</h2>

        <div>
          <strong>Client :</strong>{" "}
          {salaryData?.clientdetail?.[0]?.company_name ||
            billInfo?.client_name ||
            "-"}
        </div>

        <div>
          <strong>Site :</strong>{" "}
          {salaryData?.client_rates?.[0]?.site_name ||
            billInfo?.site_name ||
            "-"}
        </div>

        <div>
          <strong>Invoice No :</strong> {billInfo?.invoice_no || "-"}
        </div>

        <div>
          <strong>Billing Month :</strong> {billingMonth}{" "}
          {billInfo?.invoice_year || ""}
        </div>
      </div> */}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="salary-table-container">
            <Table bordered className="salary-table mb-0">
              <thead>
                {/* ===========================
                    GROUP HEADER
                ============================ */}

                <tr className="main-header">
                  {activeGroups.map((group) => (
                    <th
                      key={group.key}
                      colSpan={group.columns.length}
                      className="group-header"
                    >
                      {group.title}
                    </th>
                  ))}

                  {activeSingleColumns.map((column) => (
                    <th key={column.key} rowSpan={2} className="single-header">
                      {column.label}
                    </th>
                  ))}
                </tr>

                {/* ===========================
                    COLUMN HEADER
                ============================ */}

                <tr className="sub-header">
                  {activeGroups.map((group) =>
                    group.columns.map((column) => (
                      <th key={`${group.key}-${column.key}`}>{column.label}</th>
                    )),
                  )}
                </tr>
              </thead>

              <tbody>
                {/* ===========================
                    EMPLOYEES
                ============================ */}

                {employees.length > 0 ? (
                  employees.map((employee, index) => (
                    <tr key={employee.id || index}>
                      {activeColumns.map((column) => {
                        const value = getColumnValue(employee, column, index);

                        return (
                          <td
                            key={`${employee.id}-${column.groupKey}-${column.key}`}
                            className={
                              column.numeric
                                ? "number-cell"
                                : column.key === "nameOfEmployee"
                                  ? "name-cell"
                                  : ""
                            }
                          >
                            {formatValue(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={activeColumns.length || 1}
                      className="text-center py-4"
                    >
                      No Data Found
                    </td>
                  </tr>
                )}

                {/* ===========================
                    TOTAL
                ============================ */}

                {employees.length > 0 && (
                  <tr className="total-row">
                    {activeColumns.map((column, index) => {
                      if (column.source === "index") {
                        return <td key={column.key}>-</td>;
                      }

                      if (!column.numeric) {
                        return (
                          <td key={column.key}>{index === 0 ? "TOTAL" : ""}</td>
                        );
                      }

                      return (
                        <td key={column.key} className="number-cell">
                          {Number(totals[column.source] || 0).toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SalaryWagesSheet;
