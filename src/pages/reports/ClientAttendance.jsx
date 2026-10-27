import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./ClientAttendance.css";

const ClientAttendance = () => {
  // =====================================================
  // CURRENT MONTH & YEAR
  // =====================================================

  const currentDate = new Date();

  const currentMonth = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const currentYear = String(currentDate.getFullYear());

  // =====================================================
  // MONTHS
  // =====================================================

  const months = [
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

  // =====================================================
  // YEARS - CURRENT YEAR TO LAST 6 YEARS
  // =====================================================

  const years = Array.from(
    { length: 7 },
    (_, index) => String(Number(currentYear) - index)
  );

  // =====================================================
  // STATES
  // =====================================================

  const [client, setClient] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const [clients, setClients] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const [daysInMonth, setDaysInMonth] = useState(
    new Date(
      Number(currentYear),
      months.indexOf(currentMonth) + 1,
      0
    ).getDate()
  );

  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // =====================================================
  // MONTH NUMBER
  // =====================================================

  const getMonthNumber = (monthName) => {
    return months.indexOf(monthName) + 1;
  };

  // =====================================================
  // FETCH CLIENTS
  // =====================================================

  const fetchClients = async () => {
    try {
      setLoadingClients(true);

      const response = await api.get(
        "/api/clientwise-attendance/clients"
      );

      console.log("CLIENT LIST:", response.data);

      if (response.data?.success) {
        setClients(response.data.clients || []);
      } else {
        setClients([]);

        setError(
          response.data?.message || "Failed to fetch clients"
        );
      }
    } catch (error) {
      console.error("CLIENT FETCH ERROR:", error);

      setClients([]);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch clients"
      );
    } finally {
      setLoadingClients(false);
    }
  };

  // =====================================================
  // FETCH ATTENDANCE
  // =====================================================

  const fetchAttendance = async (
    selectedClient = client,
    selectedMonth = month,
    selectedYear = year
  ) => {
    try {
      setLoadingAttendance(true);
      setError("");

      setCurrentPage(1);

      const monthNumber = getMonthNumber(selectedMonth);

      if (monthNumber < 1 || !selectedYear) {
        setAttendanceData([]);
        setError("Please select a valid month and year.");
        return;
      }

      const params = {
        month: monthNumber,
        year: Number(selectedYear),
      };

      // Client selected असेल तर client_id पाठवायचा
      if (selectedClient) {
        params.client_id = selectedClient;
      }

      console.log("ATTENDANCE PARAMS:", params);

      const response = await api.get(
        "/api/clientwise-attendance",
        {
          params,
        }
      );

      console.log("ATTENDANCE RESPONSE:", response.data);

      if (response.data?.success) {
        const data = response.data?.data || {};

        setAttendanceData(data.attendance || []);

        // API कडून महिन्यातील दिवस मिळाले तर ते वापरायचे
        const calculatedDays = new Date(
          Number(selectedYear),
          monthNumber,
          0
        ).getDate();

        setDaysInMonth(
          Number(data.daysInMonth) || calculatedDays
        );
      } else {
        setAttendanceData([]);

        setError(
          response.data?.message || "Failed to fetch attendance"
        );
      }
    } catch (error) {
      console.error("ATTENDANCE FETCH ERROR:", error);

      setAttendanceData([]);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch attendance"
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  // =====================================================
  // INITIAL PAGE LOAD
  // =====================================================

  useEffect(() => {
    const loadPage = async () => {
      try {
        setInitialLoading(true);

        // Clients आणि current month attendance load
        await Promise.all([
          fetchClients(),
          fetchAttendance("", currentMonth, currentYear),
        ]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadPage();

    // Initial load साठीच
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    fetchAttendance(client, month, year);
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setClient("");
    setMonth(currentMonth);
    setYear(currentYear);

    fetchAttendance("", currentMonth, currentYear);
  };

  // =====================================================
  // MONTH / YEAR CHANGE
  // =====================================================

  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;

    setMonth(selectedMonth);
    setCurrentPage(1);

    const monthNumber = getMonthNumber(selectedMonth);

    const calculatedDays = new Date(
      Number(year),
      monthNumber,
      0
    ).getDate();

    setDaysInMonth(calculatedDays);
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;

    setYear(selectedYear);
    setCurrentPage(1);

    const monthNumber = getMonthNumber(month);

    const calculatedDays = new Date(
      Number(selectedYear),
      monthNumber,
      0
    ).getDate();

    setDaysInMonth(calculatedDays);
  };

  // =====================================================
  // PAGINATION DATA
  // =====================================================

  const totalRecords = attendanceData.length;

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return attendanceData.slice(startIndex, endIndex);
  }, [attendanceData, currentPage, rowsPerPage]);

  // =====================================================
  // ROWS PER PAGE
  // =====================================================

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // =====================================================
  // PREVIOUS PAGE
  // =====================================================

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((previousPage) => previousPage - 1);
    }
  };

  // =====================================================
  // NEXT PAGE
  // =====================================================

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((previousPage) => previousPage + 1);
    }
  };

  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  // =====================================================
  // DAYS
  // =====================================================

  const days = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  // =====================================================
  // FULL PAGE LOADING SCREEN
  // =====================================================

  if (initialLoading) {
    return (
      <div className="attendance-loading-screen">
        <div className="attendance-loader-card">
          <div className="attendance-spinner"></div>

          <div className="attendance-loading-title">
            Loading Attendance
          </div>

          <div className="attendance-loading-text">
            Please wait while we load client attendance...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="attendance-page">
      {/* FILTER SECTION */}

      <div className="filter-section">
        {/* CLIENT */}

        <div className="filter-item">
          <label>Select Client</label>

          <select
            value={client}
            onChange={(e) => {
              setClient(e.target.value);
              setCurrentPage(1);
            }}
            disabled={loadingClients}
          >
            <option value="">All Clients</option>

            {clients.map((item) => (
              <option
                key={item.client_id}
                value={item.client_id}
              >
                {item.client_name}
              </option>
            ))}
          </select>
        </div>

        {/* MONTH */}

        <div className="filter-item">
          <label>Select Month</label>

          <select
            value={month}
            onChange={handleMonthChange}
          >
            {months.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* YEAR */}

        <div className="filter-item">
          <label>Select Year</label>

          <select
            value={year}
            onChange={handleYearChange}
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* BUTTONS */}

        <div className="button-section">
          <button
            type="button"
            className="search-btn"
            onClick={handleSearch}
            disabled={loadingAttendance}
          >
            {loadingAttendance ? "Loading..." : "Search"}
          </button>

          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={loadingAttendance}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="attendance-error">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th className="sr-column">Sr No.</th>
              <th className="client-column">Client Name</th>
              <th className="site-column">Site Name</th>

              {days.map((day) => (
                <th key={day} className="day-column">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* TABLE LOADING */}

            {loadingAttendance ? (
              <tr>
                <td
                  colSpan={days.length + 3}
                  className="loading-cell"
                >
                  <div className="table-loading">
                    <div className="small-spinner"></div>

                    <span>Loading attendance...</span>
                  </div>
                </td>
              </tr>
            ) : attendanceData.length === 0 ? (
              /* NO DATA */

              <tr>
                <td
                  colSpan={days.length + 3}
                  className="no-data"
                >
                  No Data Found
                </td>
              </tr>
            ) : (
              /* PAGINATED DATA */

              paginatedData.map((row, rowIndex) => {
                const actualIndex =
                  (currentPage - 1) * rowsPerPage + rowIndex;

                return (
                  <tr
                    key={`${row.client_id}-${row.site_id}`}
                  >
                    <td className="sr-column">
                      {actualIndex + 1}
                    </td>

                    <td className="client-column">
                      {row.client_name}
                    </td>

                    <td className="site-column">
                      {row.site_name}
                    </td>

                    {days.map((day) => {
                      const dayData = row.days?.find(
                        (item) => Number(item.day) === day
                      );

                      return (
                        <td key={day} className="day-column">
                          {dayData?.value || "0/0"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      {!loadingAttendance && attendanceData.length > 0 && (
        <div className="pagination-container">
          {/* LEFT SIDE */}

          <div className="pagination-info">
            Showing{" "}
            <strong>
              {(currentPage - 1) * rowsPerPage + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(
                currentPage * rowsPerPage,
                totalRecords
              )}
            </strong>{" "}
            of <strong>{totalRecords}</strong> records
          </div>

          {/* ROWS PER PAGE */}

          <div className="rows-per-page">
            <span>Rows:</span>

            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* PAGE BUTTONS */}

          <div className="pagination-buttons">
            <button
              type="button"
              className="pagination-arrow"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                className={
                  currentPage === page
                    ? "page-number active"
                    : "page-number"
                }
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="pagination-arrow"
              onClick={handleNext}
              disabled={
                totalPages === 0 || currentPage === totalPages
              }
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAttendance;