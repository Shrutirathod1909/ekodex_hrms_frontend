import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL;

const PrintAttendanceWithTime = () => {
  const printRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const sharedRowData = location.state?.attendance;

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);

  const totalDaysInMonth = 31;
  const daysArray = Array.from(
    { length: totalDaysInMonth },
    (_, i) => i + 1
  );

  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Normalize attendance status
const getDayData = (emp, day) => {
  const value = emp?.days?.[day];

  // New backend format: { status, ot, otHours }
  if (value && typeof value === "object") {
    return {
      status: String(value.status ?? "").trim().toUpperCase(),
      ot: Number(value.ot ?? 0),
      otHours: Number(value.otHours ?? 0),
    };
  }

  // Old backend format: "P", "A", "W" etc.
  return {
    status: String(value ?? "").trim().toUpperCase(),
    ot: 0,
    otHours: 0,
  };
};

const getStatus = (emp, day) => getDayData(emp, day).status;

const getDisplayStatus = (emp, day) => {
  const dayData = getDayData(emp, day);

  if (dayData.ot === 1) {
    return "P P";
  }

  return dayData.status || "";
};

const getEffectiveStatus = (emp, day) => {
  const dayData = getDayData(emp, day);

  const times = Array.isArray(emp?.time?.[day])
    ? emp.time[day]
    : [];

  const empStatus = times
    .map((t) =>
      String(t.emp_status ?? "").trim().toUpperCase()
    )
    .find(Boolean);

  // First priority: status available in time records
  // Second priority: status available in days
  return empStatus || dayData.status || "A";
};

  // Daily attendance value used in column totals

const getDayAttendanceValue = (emp, day) => {
  const dayData = getDayData(emp, day);
  const status = getEffectiveStatus(emp, day);

  if (dayData.ot === 1) return 1;

  if (["P", "P1", "PP", "P P"].includes(status)) {
    return 1;
  }

  if (["HF", "FH"].includes(status)) {
    return 0.5;
  }

  return 0;
};

  // Calculate an employee's N.D. from daily attendance.
  // HF/FH = 0.5, P/P1 = 1, PP = 1 N.D.

const getEmployeeND = (emp) => {
  return daysArray.reduce((total, day) => {
    const status = getEffectiveStatus(emp, day);
    const dayData = getDayData(emp, day);

    if (dayData.ot === 1) {
      return total + 1;
    }

    if (["P", "P1", "PP", "P P"].includes(status)) {
      return total + 1;
    }

    if (["HF", "FH"].includes(status)) {
      return total + 0.5;
    }

    return total;
  }, 0);
};

const getEmployeeOT = (emp) => {
  const days = Object.values(emp?.days || {});

  const dailyOT = days.reduce((total, dayData) => {
    if (dayData && typeof dayData === "object") {
      return total + (Number(dayData.ot) || 0);
    }

    return total;
  }, 0);

  return dailyOT;
};

  const getEmployeeOff = (emp) =>
    Number(emp?.off ?? emp?.total_off ?? 0);

  const getEmployeeOTHrs = (emp) =>
    Number(emp?.otHrs ?? emp?.ot_hrs ?? emp?.ot_hours ?? 0);

  const getEmployeeHoliday = (emp) =>
    Number(emp?.holiday ?? emp?.holidays ?? 0);

const getEmployeeTotal = (emp) =>
  getEmployeeND(emp) +
  getEmployeeOT(emp) +
  getEmployeeOTHrs(emp) +
  getEmployeeOff(emp) +
  getEmployeeHoliday(emp);

  // Daily column totals
  const getColumnTotal = (dayNum) => {
    return employees.reduce(
      (total, emp) => total + getDayAttendanceValue(emp, dayNum),
      0
    );
  };

  // Summary totals
  const totalND = employees.reduce(
    (sum, emp) => sum + getEmployeeND(emp),
    0
  );

  const totalOT = employees.reduce(
    (sum, emp) => sum + getEmployeeOT(emp),
    0
  );

  const totalOff = employees.reduce(
    (sum, emp) => sum + getEmployeeOff(emp),
    0
  );

  const totalOTHrs = employees.reduce(
    (sum, emp) => sum + getEmployeeOTHrs(emp),
    0
  );

  const totalHoliday = employees.reduce(
    (sum, emp) => sum + getEmployeeHoliday(emp),
    0
  );
const grandTotalOverall =
  totalND +
  totalOT +
  totalOTHrs +
  totalOff +
  totalHoliday;

  useEffect(() => {
    if (!sharedRowData) {
      setError(
        "No active record metadata detected. Please navigate from the main panel selection."
      );
      setLoading(false);
      return;
    }

  const fetchDetailedLogs = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.get(
      `${API_URL}/api/attendance/print-time-sheet`,
      {
        params: {
          site: sharedRowData.site_id,
          m: sharedRowData.at_month,
          y: sharedRowData.at_year,
          type: sharedRowData.att_type || "Both",
        },
        withCredentials: true,
      }
    );

    console.log("Attendance API Response:", response.data);
    console.log("Employee Attendance Data:", response.data.at_data);

    if (response.data.success) {
      const attendanceData = Array.isArray(response.data.at_data)
        ? response.data.at_data
        : [];

      // Check OT values received from backend
      attendanceData.forEach((emp) => {
        console.log("Employee:", emp.empName, {
          ot: emp.ot,
          otHrs: emp.otHrs,
          total_ot: emp.total_ot,
          days: emp.days,
        });
      });

      setEmployees(attendanceData);
    } else {
      setEmployees([]);
      setError(
        "Backend failed to map matching employee logs for this profile row."
      );
    }
  } catch (err) {
    console.error("Print View Network Error:", err);
    setError("Unable to communicate with API service server.");
  } finally {
    setLoading(false);
  }
};
    fetchDetailedLogs();
  }, [sharedRowData]);

  // Excel download
  const handleDownloadExcelFrontend = () => {
    if (!employees || employees.length === 0) {
      window.alert("No employee attendance logs detected to export.");
      return;
    }

    const companyNameClean = sharedRowData?.company_name
      ? sharedRowData.company_name.toUpperCase()
      : "";

    const officeAddress = sharedRowData?.client_add || "";
    const contactDetails = sharedRowData?.client_email || "";

    const month =
      monthNames[parseInt(sharedRowData?.at_month, 10)] ||
      sharedRowData?.at_month ||
      "";

    const exportDataRows = [
      [companyNameClean],
      [officeAddress],
      [contactDetails],
      [],
      [
        `Site Name: ${sharedRowData?.site_name || ""}`,
        `Month: ${month}`,
        `Year: ${sharedRowData?.at_year || ""}`,
      ],
      [],
    ];

    const tableHeaders = [
      "Sr No.",
      "Employee Name",
      "Emp code",
      "Rank",
      "P.F.",
      "ESIC",
      ...daysArray,
      "N.D.",
      "O.T.",
      "O.T/HRS",
      "Off",
      "Holiday",
      "Total",
    ];

    exportDataRows.push(tableHeaders);

    employees.forEach((emp, index) => {
      const individualRow = [
        index + 1,
        emp.empName || "",
        emp.empCode || "",
        emp.rank || "",
        emp.pf || "",
        emp.esic || "",
      ];

      daysArray.forEach((day) => {
 const status = getDisplayStatus(emp, day) || "A";
const displayStatus = getDisplayStatus(emp, day) || "A";
        const times = Array.isArray(emp.time?.[day])
          ? emp.time[day]
          : [];

        const attendanceLines = [status];

        times.forEach((t) => {
          attendanceLines.push(`IN : ${t.checkIn || "-"}`);

          if (status === "A" && t.checkOut) {
            attendanceLines.push(
              `OUT : Early Checkout (${t.checkOut})`
            );
          } else {
            attendanceLines.push(`OUT : ${t.checkOut || "-"}`);
          }
        });

        individualRow.push(attendanceLines.join("\n"));
      });

      individualRow.push(
        getEmployeeND(emp),
        getEmployeeOT(emp),
        getEmployeeOTHrs(emp),
        getEmployeeOff(emp),
        getEmployeeHoliday(emp),
        getEmployeeTotal(emp)
      );

      exportDataRows.push(individualRow);
    });

    const bottomFooterRow = [
      "Deployment Total:",
      "",
      "",
      "",
      "",
      "",
    ];

    daysArray.forEach((day) => {
      bottomFooterRow.push(getColumnTotal(day));
    });

    bottomFooterRow.push(
      totalND,
      totalOT,
      totalOTHrs,
      totalOff,
      totalHoliday,
      grandTotalOverall
    );

    exportDataRows.push(bottomFooterRow);

    const worksheet = XLSX.utils.aoa_to_sheet(exportDataRows);

    const columnWidths = [
      { wch: 8 },
      { wch: 28 },
      { wch: 12 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
    ];

    daysArray.forEach(() => {
      columnWidths.push({ wch: 22 });
    });

    columnWidths.push(
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 }
    );

    worksheet["!cols"] = columnWidths;

    // Enable wrapping for cells that contain IN/OUT times
    worksheet["!rows"] = exportDataRows.map((row, index) => ({
      hpt: index > 6 ? 42 : 20,
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Attendance Report"
    );

    const safeSiteName = String(
      sharedRowData?.site_name || "Export"
    ).replace(/[\\/:*?"<>|]/g, "_");

    const fileName = `Attendance_Sheet_${safeSiteName}_${sharedRowData?.at_month || "M"}_${sharedRowData?.at_year || "Y"}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  // Automatically download Excel when requested from previous page
  useEffect(() => {
    if (
      !loading &&
      !error &&
      location.state?.autoDownload &&
      employees.length > 0
    ) {
      handleDownloadExcelFrontend();
    }
  }, [loading, error, employees]);

  // Print
  const handlePrintClick = () => {
    if (!printRef.current) {
      window.alert("Print content not loaded.");
      return;
    }

    const printContents = printRef.current.innerHTML;
    const printWindow = window.open(
      "",
      "_blank",
      "width=1800,height=1000"
    );

    if (!printWindow) {
      window.alert("Please allow pop-ups to print the attendance sheet.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Sheet</title>
          <meta charset="UTF-8" />
          <style>
            @page {
              size: A3 landscape;
              margin: 5mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 8px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .print-container {
              width: 100%;
              overflow: visible;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: auto;
            }

            th,
            td {
              border: 1px solid #000;
              padding: 2px;
              text-align: center;
              vertical-align: top;
              font-size: 7px;
              line-height: 1.2;
              word-break: break-word;
              white-space: pre-line;
            }

            th {
              background: #f3f3f3 !important;
              font-weight: bold;
            }

            .meta-table td {
              border: none !important;
              font-size: 10px;
              text-align: left;
              padding: 2px 4px;
            }

            .no-print,
            .card-header,
            .card-header-noprint {
              display: none !important;
            }

            .table-responsive {
              overflow: visible !important;
            }

            .day-col {
              min-width: 32px;
            }

            tr {
              page-break-inside: avoid;
            }

            @media print {
              html,
              body {
                width: 100%;
                height: auto;
              }

              table {
                page-break-inside: auto;
              }

              th,
              td {
                font-size: 7px !important;
                padding: 2px !important;
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
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (loading) {
    return (
      <div className="text-center p-5 fw-bold text-muted">
        Fetching Grid Transaction Logs...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="alert alert-danger m-4"
        style={{ fontSize: "13px" }}
      >
        {error}
        <button
          className="btn btn-sm btn-dark ms-2"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="pcoded-inner-content bg-white p-3"
      style={{ fontSize: "13px" }}
    >
      <style>{`
        .attendance-matrix-table {
          font-size: 11px;
          border-collapse: collapse;
          width: 100%;
        }

        .attendance-matrix-table th,
        .attendance-matrix-table td {
          border: 1px solid #000;
          padding: 3px;
          text-align: center;
          vertical-align: top;
        }

        .day-col {
          min-width: 45px;
        }

        .meta-table td {
          border: none !important;
          padding: 4px 0;
          font-size: 13px;
        }

        @page {
          size: A3 landscape;
          margin: 5mm;
        }

        @media print {
          html,
          body {
            margin: 0;
            padding: 0;
            font-size: 8px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .table-responsive {
            overflow: visible !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          th,
          td {
            border: 1px solid #000 !important;
            padding: 2px !important;
            font-size: 7px !important;
            white-space: pre-line;
            word-break: break-word;
          }

          .day-col {
            min-width: 32px !important;
          }

          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="main-body">
        <div className="page-wrapper">
          <div className="page-body">
            <div className="row">
              <div className="col-md-12">
                <div className="card border-0 p-0">
                  {/* Control panel */}
                  <div className="card-header-noprint bg-light mb-4 p-3 rounded no-print">
                    <div className="row align-items-center">
                      <div
                        className="col-md-8 fw-bold text-secondary"
                        style={{ fontSize: "13px" }}
                      >
                        Print Attendance Sheet -{" "}
                        {sharedRowData?.company_name} (
                        {sharedRowData?.site_name})
                      </div>

                      <div className="col-md-4 text-end d-flex gap-2 justify-content-end">
                        <button
                          onClick={handlePrintClick}
                          className="btn btn-primary btn-sm px-3"
                        >
                          Print
                        </button>

                        <button
                          onClick={() => navigate(-1)}
                          className="btn btn-success btn-sm px-3"
                        >
                          Go Back
                        </button>

                        <button
                          onClick={handleDownloadExcelFrontend}
                          className="btn btn-success btn-sm px-3"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Printable report */}
                  <div ref={printRef} className="print-container">
                    <div className="card-body text-center p-0">
                      <div className="row mb-2">
                        <div className="col-md-12">
                          <h5
                            className="fw-bold m-0"
                            style={{
                              color: "#000",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {sharedRowData?.company_name
                              ? sharedRowData.company_name.toUpperCase()
                              : ""}
                          </h5>

                          <p className="small text-muted m-0 mt-1">
                            {sharedRowData?.client_add || ""}
                          </p>

                          <p className="small text-muted m-0">
                            {sharedRowData?.client_email || ""}
                          </p>
                        </div>
                      </div>

                      <hr className="my-2" />

                      {/* Site details */}
                      <div className="row mb-2">
                        <div className="col-12">
                          <table className="table meta-table w-100 text-start m-0">
                            <tbody>
                              <tr className="text-dark">
                                <td>
                                  <strong>Site Name:</strong>{" "}
                                  {sharedRowData?.site_name}
                                </td>

                                <td>
                                  <strong>Month:</strong>{" "}
                                  {monthNames[
                                    parseInt(sharedRowData?.at_month, 10)
                                  ] || sharedRowData?.at_month}
                                </td>

                                <td>
                                  <strong>Year:</strong>{" "}
                                  {sharedRowData?.at_year}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Attendance matrix */}
                      <div className="row">
                        <div className="col-md-12 table-responsive">
                          <table className="table table-bordered table-striped align-middle m-0 attendance-matrix-table">
                            <thead className="table-light">
                              <tr>
                                <th style={{ minWidth: "30px" }}>Sr</th>
                                <th style={{ minWidth: "120px" }}>
                                  Employee Name
                                </th>
                                <th style={{ minWidth: "65px" }}>
                                  Emp Code
                                </th>
                                <th style={{ minWidth: "70px" }}>
                                  Rank
                                </th>
                                <th style={{ minWidth: "45px" }}>
                                  P.F.
                                </th>
                                <th style={{ minWidth: "45px" }}>
                                  ESIC
                                </th>

                                {daysArray.map((day) => (
                                  <th
                                    key={day}
                                    className="day-col"
                                    style={{ fontSize: "11px" }}
                                  >
                                    {day}
                                  </th>
                                ))}

                                <th>N.D.</th>
                                <th>O.T.</th>
                                <th>O.T/HRS</th>
                                <th>OFF</th>
                                <th>Holiday</th>
                                <th>Total</th>
                              </tr>
                            </thead>

                            <tbody>
                              {employees.map((emp, index) => {
                                const ndVal = getEmployeeND(emp);
                                const otVal = getEmployeeOT(emp);
                                const offVal = getEmployeeOff(emp);
                                const otHoursVal = getEmployeeOTHrs(emp);
                                const holidayVal = getEmployeeHoliday(emp);
                                const rowSum = getEmployeeTotal(emp);

                                return (
                                  <tr key={emp.empCode || index}>
                                    <td className="fw-bold text-dark">
                                      {index + 1}
                                    </td>

                                    <td
                                      style={{
                                        minWidth: "120px",
                                        textAlign: "left",
                                        whiteSpace: "normal",
                                        overflowWrap: "anywhere",
                                        fontWeight: 600,
                                        padding: "4px",
                                      }}
                                    >
                                      {emp.empName || ""}
                                    </td>

                                    <td
                                      style={{
                                        minWidth: "65px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {emp.empCode || ""}
                                    </td>

                                    <td
                                      style={{
                                        minWidth: "70px",
                                        whiteSpace: "normal",
                                        overflowWrap: "anywhere",
                                        textAlign: "left",
                                      }}
                                    >
                                      {emp.rank || ""}
                                    </td>

                                    <td>{emp.pf || ""}</td>
                                    <td>{emp.esic || ""}</td>

                              {daysArray.map((day) => {
const dayData = getDayData(emp, day);

const times = Array.isArray(emp.time?.[day])
  ? emp.time[day]
  : [];

const hasTime = times.some(
  (t) =>
    String(t.checkIn || "").trim() !== "" ||
    String(t.checkOut || "").trim() !== ""
);

const empStatus = times
  .map((t) => String(t.emp_status || "").trim().toUpperCase())
  .find(Boolean);

// Status priority: emp_status -> days status -> A
const displayStatus = hasTime
  ? (dayData.status || empStatus || "P")
  : (empStatus || dayData.status || "A");

const status = displayStatus;
                                      return (
                                        <td
                                          key={day}
                                          style={{
                                            minWidth: "58px",
                                            padding: "3px",
                                            verticalAlign: "top",
                                            textAlign: "left",
                                            lineHeight: "1.4",
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontWeight: "bold",
                                              marginBottom: "3px",
                                              color: "#000",
                                              whiteSpace: "pre-line",
                                            }}
                                          >
                                          {displayStatus === "PP"
  ? "P\nP"
  : displayStatus}
                                          </div>

                                       {hasTime ? (
  times.map((t, timeIndex) => (
    <div
      key={timeIndex}
      style={{
        borderTop: "1px dotted #ccc",
        marginTop: "2px",
        paddingTop: "2px",
      }}
    >
      <div>
        <b>IN</b> : {t.checkIn || "-"}
      </div>

      <div>
        <b>OUT</b> : {t.checkOut || "-"}
      </div>
    </div>
  ))
) : null}
                                        </td>
                                      );
                                    })}

                                    <td className="bg-success-subtle fw-bold">
                                      {ndVal}
                                    </td>

                                    <td className="bg-warning-subtle fw-bold">
                                      {otVal}
                                    </td>

                                    <td>{otHoursVal}</td>

                                    <td className="bg-info-subtle fw-bold">
                                      {offVal}
                                    </td>

                                    <td>{holidayVal}</td>

                                    <td className="bg-dark text-white fw-bold">
                                      {rowSum}
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* Summary footer */}
                              <tr
                                className="fw-bold table-light"
                                style={{ fontSize: "14px" }}
                              >
                                <td
                                  colSpan={6}
                                  className="text-end text-dark pe-3"
                                >
                                  Deployment Total:
                                </td>

                                {daysArray.map((day) => (
                                  <td
                                    key={day}
                                    className="day-col text-primary fw-bold"
                                  >
                                    {getColumnTotal(day)}
                                  </td>
                                ))}

                                <td className="bg-success-subtle fw-bold">
                                  {totalND}
                                </td>

                                <td className="bg-warning-subtle fw-bold">
                                  {totalOT}
                                </td>

                                <td>{totalOTHrs}</td>

                                <td className="bg-info-subtle fw-bold">
                                  {totalOff}
                                </td>

                                <td>{totalHoliday}</td>

                                <td className="bg-dark text-black fw-bold">
                                  {grandTotalOverall}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Signature footer */}
                      <div className="row" style={{ marginTop: "75px" }}>
                        <div className="col-md-12">
                          <table className="table w-100 border-0 m-0">
                            <tbody>
                              <tr>
                                <td
                                  align="center"
                                  className="border-0"
                                  style={{ width: "50%" }}
                                >
                                  <div
                                    className="border-bottom mx-auto mb-2"
                                    style={{
                                      width: "190px",
                                      borderColor: "#bbb",
                                    }}
                                  />

                                  <span className="fw-bold text-dark small">
                                    Signature of Manager
                                  </span>
                                </td>

                                <td
                                  align="center"
                                  className="border-0"
                                  style={{ width: "50%" }}
                                >
                                  <div
                                    className="border-bottom mx-auto mb-2"
                                    style={{
                                      width: "190px",
                                      borderColor: "#bbb",
                                    }}
                                  />

                                  <span className="fw-bold text-dark small">
                                    Signature of Site In-Charge
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End printable report */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintAttendanceWithTime;