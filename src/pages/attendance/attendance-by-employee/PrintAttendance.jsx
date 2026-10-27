import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL;

const PrintAttendance = () => {
  const printRef = useRef(null);
  const autoDownloadDone = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const sharedRowData = location.state?.attendance;

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);

const totalDaysInMonth = new Date(
  Number(sharedRowData?.at_year),
  Number(sharedRowData?.at_month),
  0
).getDate();

  const daysArray = Array.from(
    { length: totalDaysInMonth },
    (_, index) => index + 1
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

  // ---------------------------------------
  // Daily status display
  // PP => first row P, second row P
  // P  => first row P, second row blank
  // HF => first row HF, second row blank
  // A  => first row A, second row blank
  // ---------------------------------------

const getDayParts = (emp, day) => {
  const { status, ot } = getDayDataForReport(emp, day);

  if (status === "P" && ot === 1) {
    return { first: "P P", second: "" };
  }

  if (status === "PP") {
    return { first: "P", second: "P" };
  }

  if (status === "HF" || status === "FH") {
    return { first: status, second: "" };
  }

  if (status === "A") {
    return { first: "A", second: "" };
  }

  if (status === "P" || status === "P1") {
    return { first: status, second: "" };
  }

  if (status.length > 1) {
    return {
      first: status.charAt(0),
      second: status.substring(1),
    };
  }

  return { first: status || "A", second: "" };
};

  // ---------------------------------------
  // Attendance value for each day
  // P  = 1
  // PP = 2
  // HF = 0.5
  // ---------------------------------------

const getDayAttendanceValue = (emp, day) => {
  const { status } = getDayDataForReport(emp, day);

  if (status === "PP") return 2;
  if (status === "P" || status === "P1") return 1;
  if (status === "HF" || status === "FH") return 0.5;

  return 0;
};


  // Daily column total
  const getColumnTotal = (dayNum) => {
    return employees.reduce(
      (total, emp) => total + getDayAttendanceValue(emp, dayNum),
      0
    );
  };

  // ---------------------------------------
  // N.D. calculation
  // Use backend N.D. if available.
  // Otherwise calculate from daily attendance.
  // HF contributes 0.5 to N.D.
  // PP contributes 1 to N.D. and its extra P to O.T.
  // ---------------------------------------
  const calculateNDFromDays = (emp) => {
    return daysArray.reduce((total, day) => {
      const value = String(emp?.days?.[day] ?? "")
        .trim()
        .toUpperCase();

      if (value === "P") return total + 1;
      if (value === "HF" || value === "FH") return total + 0.5;
      if (value === "PP") return total + 1;

      return total;
    }, 0);
  };

// const getEmployeeND = (emp) => {
//   return daysArray.reduce((total, day) => {
//     const { status } = getDayDataForReport(emp, day);

//     if (status === "P" || status === "PP") return total + 1;
//     if (status === "HF" || status === "FH") return total + 0.5;

//     return total;
//   }, 0);
// };


const getDayDataForReport = (emp, day) => {
  const rawValue = emp?.days?.[day];

  const dayStatus =
    rawValue && typeof rawValue === "object"
      ? String(rawValue.status ?? "").trim().toUpperCase()
      : String(rawValue ?? "").trim().toUpperCase();

  const times = Array.isArray(emp?.time?.[day])
    ? emp.time[day]
    : [];

  const timeStatus = times
    .map((t) =>
      String(t.emp_status ?? "").trim().toUpperCase()
    )
    .find(Boolean);

  return {
    status: timeStatus || dayStatus || "A",
    ot: Number(
      rawValue && typeof rawValue === "object"
        ? rawValue.ot ?? 0
        : 0
    ),
    otHours: Number(
      rawValue && typeof rawValue === "object"
        ? rawValue.otHours ?? 0
        : 0
    ),
  };
};

const getEmployeeND = (emp) => {
  return daysArray.reduce((total, day) => {
    const { status } = getDayDataForReport(emp, day);

    if (["P", "P1", "PP"].includes(status)) {
      return total + 1;
    }

    if (["HF", "FH"].includes(status)) {
      return total + 0.5;
    }

    return total;
  }, 0);
};


  // Count the extra P from every PP status as OT +1.
  const getPPExtraOT = (emp) => {
    return daysArray.reduce((total, day) => {
      const value = String(emp?.days?.[day] ?? "")
        .trim()
        .toUpperCase();

      return total + (value === "PP" ? 1 : 0);
    }, 0);
  };

  const getEmployeeOT = (emp) => {
    return Number(emp.ot ?? emp.total_ot ?? 0) + getPPExtraOT(emp);
  };

  const getEmployeeOTHrs = (emp) =>
    Number(emp.otHrs ?? emp.ot_hrs ?? emp.ot_hours ?? 0);

  const getEmployeeOff = (emp) =>
    Number(emp.off ?? emp.total_off ?? 0);

  const getEmployeeHoliday = (emp) =>
    Number(emp.holiday ?? emp.holidays ?? 0);

  const getEmployeeTotal = (emp) => {
    return (
      getEmployeeND(emp) +
      getEmployeeOT(emp) +
      getEmployeeOTHrs(emp) +
      getEmployeeOff(emp) +
      getEmployeeHoliday(emp)
    );
  };

  // Grand totals
  const totalND = employees.reduce(
    (sum, emp) => sum + getEmployeeND(emp),
    0
  );

  const totalOT = employees.reduce(
    (sum, emp) => sum + getEmployeeOT(emp),
    0
  );

  const totalOTHrs = employees.reduce(
    (sum, emp) => sum + getEmployeeOTHrs(emp),
    0
  );

  const totalOff = employees.reduce(
    (sum, emp) => sum + getEmployeeOff(emp),
    0
  );

  const totalHoliday = employees.reduce(
    (sum, emp) => sum + getEmployeeHoliday(emp),
    0
  );

  const grandTotalOverall =
    totalND + totalOT + totalOTHrs + totalOff + totalHoliday;

  // ---------------------------------------
  // Fetch attendance data
  // ---------------------------------------
  useEffect(() => {
    if (!sharedRowData) {
      setError(
        "No active attendance record found. Please go back and select a record."
      );
      setLoading(false);
      return;
    }

    const fetchDetailedLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/api/attendance/print-sheet`,
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

        if (response.data?.success) {
          setEmployees(
            Array.isArray(response.data.at_data)
              ? response.data.at_data
              : []
          );
        } else {
          setError(
            "Backend could not retrieve the attendance records."
          );
        }
      } catch (err) {
        console.error("Print View Network Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to communicate with the API server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedLogs();
  }, [sharedRowData]);

  // ---------------------------------------
  // Excel download
  // ---------------------------------------
  const handleDownloadExcelFrontend = () => {
    if (!employees.length) {
      window.alert("No employee attendance logs detected to export.");
      return;
    }

    const companyName =
      sharedRowData?.company_name?.toUpperCase() || "";

    const exportDataRows = [
      [companyName],
      [sharedRowData?.client_add || ""],
      [sharedRowData?.client_email || ""],
      [],
      [
        `Site Name: ${sharedRowData?.site_name || ""}`,
        `Month: ${
          monthNames[parseInt(sharedRowData?.at_month, 10)] ||
          sharedRowData?.at_month ||
          ""
        }`,
        `Year: ${sharedRowData?.at_year || ""}`,
      ],
      [],
      [
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
      ],
    ];

    employees.forEach((emp, index) => {
      const employeeInfo = [
        index + 1,
        emp.empName || "",
        emp.empCode || "",
        emp.rank || "",
        emp.pf || "",
        emp.esic || "",
      ];

      const firstRow = [...employeeInfo];
      const secondRow = ["", "", "", "", "", ""];

      daysArray.forEach((day) => {
        const { first, second } = getDayParts(emp, day);

        firstRow.push(first);
        secondRow.push(second);
      });

      firstRow.push(
        getEmployeeND(emp),
        getEmployeeOT(emp),
        getEmployeeOTHrs(emp),
        getEmployeeOff(emp),
        getEmployeeHoliday(emp),
        getEmployeeTotal(emp)
      );

      // Summary columns stay blank on the second row.
      secondRow.push("", "", "", "", "", "");

      exportDataRows.push(firstRow);

      const hasExtraRow = daysArray.some(
        (day) => getDayParts(emp, day).second !== ""
      );

      if (hasExtraRow) {
        exportDataRows.push(secondRow);
      }
    });

    const footerRow = [
      "Deployment Total:",
      "",
      "",
      "",
      "",
      "",
    ];

    daysArray.forEach((day) => {
      footerRow.push(getColumnTotal(day));
    });

    footerRow.push(
      totalND,
      totalOT,
      totalOTHrs,
      totalOff,
      totalHoliday,
      grandTotalOverall
    );

    exportDataRows.push(footerRow);

    const worksheet = XLSX.utils.aoa_to_sheet(exportDataRows);

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 26 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      ...daysArray.map(() => ({ wch: 5 })),
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 8 },
      { wch: 9 },
      { wch: 9 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Attendance Report"
    );

    const fileName =
      `Attendance_Sheet_${sharedRowData?.site_name || "Export"}_` +
      `${sharedRowData?.at_month || "M"}_` +
      `${sharedRowData?.at_year || "Y"}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  // Auto-download when requested from previous page
  useEffect(() => {
    if (
      location.state?.autoDownload &&
      employees.length > 0 &&
      !loading &&
      !autoDownloadDone.current
    ) {
      autoDownloadDone.current = true;
      handleDownloadExcelFrontend();
    }
  }, [employees, loading]);

  // ---------------------------------------
  // Print attendance sheet
  // ---------------------------------------
  const handlePrintClick = () => {
    if (!printRef.current) {
      window.alert("Print content is not ready.");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.alert(
        "Please allow pop-ups in your browser to print the attendance sheet."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Sheet</title>

          <style>
            @page {
              size: A3 landscape;
              margin: 5mm;
            }

            * {
              box-sizing: border-box;
            }

            html, body {
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

            th, td {
              border: 1px solid #000;
              padding: 2px;
              text-align: center;
              vertical-align: middle;
              font-size: 7px;
              line-height: 1.2;
              word-break: break-word;
              white-space: pre-line;
            }

            th {
              background: #f3f3f3 !important;
              font-weight: bold;
            }

            .meta-table td,
            .signature-table td {
              border: none !important;
            }

            .meta-table td {
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

            tr {
              page-break-inside: avoid;
            }

            @media print {
              html, body {
                width: 100%;
                height: auto;
              }

              td, th {
                font-size: 7px !important;
                padding: 2px !important;
              }
            }
          </style>
        </head>

        <body>
          <div class="print-container">
            ${printRef.current.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  if (loading) {
    return (
      <div className="text-center p-5 fw-bold text-muted">
        Fetching attendance logs...
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
          font-size: 12px !important;
        }

        .attendance-matrix-table th {
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 4px 2px !important;
          vertical-align: middle !important;
        }

        .attendance-matrix-table td {
          padding: 4px 3px !important;
          vertical-align: middle !important;
        }

        .day-col {
          min-width: 22px !important;
          text-align: center;
        }

        .meta-table td {
          border: none !important;
          padding: 6px 0;
          font-size: 13px;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border: 1px solid #000 !important;
          }
        }
      `}</style>

      <div className="main-body">
        <div className="page-wrapper">
          <div className="page-body">
            <div className="row">
              <div className="col-md-12">
                <div className="card border-0 p-0">

                  {/* Action buttons */}
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

                  {/* Printable area */}
                  <div ref={printRef} className="print-container">
                    <div className="card-body text-center p-0">

                      {/* Company heading */}
                      <div className="row mb-2">
                        <div className="col-md-12">
                          <h5
                            className="fw-bold m-0"
                            style={{
                              color: "#000",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {sharedRowData?.company_name?.toUpperCase() || ""}
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

                      {/* Site metadata */}
                      <div className="row mb-2">
                        <div className="col-12">
                          <table className="table meta-table w-100 text-start m-0">
                            <tbody>
                              <tr className="text-dark">
                                <td>
                                  <strong>Site Name:</strong>{" "}
                                  {sharedRowData?.site_name || ""}
                                </td>

                                <td>
                                  <strong>Month:</strong>{" "}
                                  {monthNames[
                                    parseInt(sharedRowData?.at_month, 10)
                                  ] || sharedRowData?.at_month}
                                </td>

                                <td>
                                  <strong>Year:</strong>{" "}
                                  {sharedRowData?.at_year || ""}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Attendance table */}
                      <div className="row">
                        <div className="col-md-12 table-responsive">
                          <table className="table table-bordered table-striped align-middle m-0 attendance-matrix-table">
                            <thead className="table-light">
                              <tr>
                                <th>Sr No.</th>
                                <th>Employee Name</th>
                                <th>Emp code</th>
                                <th>Rank</th>
                                <th>P.F.</th>
                                <th>ESIC</th>

                                {daysArray.map((day) => (
                                  <th key={day} className="day-col">
                                    {day}
                                  </th>
                                ))}

                                <th className="day-col fw-bold">N.D.</th>
                                <th className="day-col fw-bold">O.T.</th>
                                <th className="day-col">O.T/HRS</th>
                                <th className="day-col fw-bold">Off</th>
                                <th className="day-col">Holiday</th>
                                <th className="day-col fw-bold">Total</th>
                              </tr>
                            </thead>

                            <tbody>
                              {employees.map((emp, index) => {
                                const hasExtraRow = daysArray.some(
                                  (day) =>
                                    getDayParts(emp, day).second !== ""
                                );

                                const rowSpan = hasExtraRow ? 2 : 1;

                                return (
                                  <React.Fragment
                                    key={emp.empCode || index}
                                  >
                                    {/* First row */}
                                    <tr>
                                      <td
                                        rowSpan={rowSpan}
                                        className="fw-bold text-dark"
                                      >
                                        {index + 1}
                                      </td>

                                      <td
                                        rowSpan={rowSpan}
                                        className="text-start fw-semibold"
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        {emp.empName || ""}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {emp.empCode || ""}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {emp.rank || ""}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {emp.pf || ""}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {emp.esic || ""}
                                      </td>

                                      {daysArray.map((day) => {
                                        const { first } = getDayParts(
                                          emp,
                                          day
                                        );

                                        return (
                                          <td
                                            key={day}
                                            className="day-col"
                                          >
                                            {first}
                                          </td>
                                        );
                                      })}

                                      <td rowSpan={rowSpan}>
                                        {getEmployeeND(emp)}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {getEmployeeOT(emp)}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {getEmployeeOTHrs(emp)}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {getEmployeeOff(emp)}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {getEmployeeHoliday(emp)}
                                      </td>

                                      <td rowSpan={rowSpan}>
                                        {getEmployeeTotal(emp)}
                                      </td>
                                    </tr>

                                    {/* Second row: PP displays its second P */}
                                    {hasExtraRow && (
                                      <tr>
                                        {daysArray.map((day) => {
                                          const { second } = getDayParts(
                                            emp,
                                            day
                                          );

                                          return (
                                            <td
                                              key={day}
                                              className="day-col"
                                            >
                                              {second}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}

                              {/* Footer totals */}
                              <tr className="fw-bold table-light">
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

                                <td>{totalND}</td>
                                <td>{totalOT}</td>
                                <td>{totalOTHrs}</td>
                                <td>{totalOff}</td>
                                <td>{totalHoliday}</td>
                                <td>{grandTotalOverall}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Signature section */}
                      <div className="row" style={{ marginTop: "75px" }}>
                        <div className="col-md-12">
                          <table className="table w-100 border-0 m-0 signature-table">
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

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintAttendance;