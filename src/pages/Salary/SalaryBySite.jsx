import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Container,
  Dropdown,
} from "react-bootstrap";
import axios from "axios";
import "./SalarySlip.css";

const API_URL = import.meta.env.VITE_API_URL;

const SalaryBySite = () => {
  // =====================================================
  // SEARCH
  // =====================================================

  const [searchRows, setSearchRows] = useState([
    {
      field: "Select",
      keyword: "",
    },
  ]);

 // CURRENT MONTH AND YEAR
const currentDate = new Date();

const currentMonth = currentDate.toLocaleString("en-US", {
  month: "long",
});

const currentYear = String(currentDate.getFullYear());

const [month, setMonth] = useState(currentMonth);
const [year, setYear] = useState(currentYear);

  // =====================================================
  // SITE SALARY
  // =====================================================

  const [salaryData, setSalaryData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    total_sites: 0,
    total_employees: 0,
    total_earned_gross: 0,
    total_deduction: 0,
    total_net_take_home: 0,
    total_salary_payable: 0,
    total_pf: 0,
    total_esic: 0,
    total_ot_wages: 0,
    total_emp_ctc: 0,
    total_service_charges: 0,
    total_cgst: 0,
    total_sgst: 0,
    total_igst: 0,
    total_invoice_amount: 0,
    total_advance: 0,
    total_pt: 0,
    total_uniform: 0,
    total_other: 0,
  });

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
  // YEARS
  // =====================================================

const years = Array.from(
  { length: 7 },
  (_, index) => String(new Date().getFullYear() - index)
);

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  // =====================================================
  // MONTH NUMBER
  // =====================================================

  const getMonthNumber = (monthName) => {
    return months.indexOf(monthName) + 1;
  };

  // =====================================================
  // ADD SEARCH ROW
  // =====================================================

  const addRow = () => {
    setSearchRows((prev) => [
      ...prev,
      {
        field: "Select",
        keyword: "",
      },
    ]);
  };

  // =====================================================
  // REMOVE SEARCH ROW
  // =====================================================

  const removeRow = (index) => {
    if (searchRows.length === 1) {
      return;
    }

    setSearchRows(searchRows.filter((_, i) => i !== index));
  };

  // =====================================================
  // UPDATE SEARCH ROW
  // =====================================================

  const updateRow = (index, key, value) => {
    const rows = [...searchRows];

    rows[index][key] = value;

    setSearchRows(rows);
  };

  // =====================================================
  // GET SEARCH FILTERS
  // =====================================================

  const getSearchFilters = () => {
    let site_id = "";
    let client_id = "";
    let client_name = "";
    let site_name = "";

    searchRows.forEach((row) => {
      if (!row.keyword) {
        return;
      }

      switch (row.field) {
        case "Client Code":
          client_id = row.keyword;
          break;

        case "Client Name":
          client_name = row.keyword;
          break;

        case "Site Name":
          site_name = row.keyword;
          break;

        default:
          break;
      }
    });

    return {
      site_id,
      client_id,
      client_name,
      site_name,
    };
  };

  // =====================================================
  // FETCH SITE WISE SALARY
  // =====================================================

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      setError("");

      const monthNumber = getMonthNumber(month);

      const filters = getSearchFilters();

      const token = localStorage.getItem("token");

      console.log("SITE SALARY REQUEST:", {
        url: `${API_URL}/api/salary/site-wise`,
        month: monthNumber,
        year,
        filters,
      });

      const response = await axios.get(`${API_URL}/api/salary/site-wise`, {
        params: {
          month: monthNumber,
          year: year,
          site_id: filters.site_id,
          client_id: filters.client_id,
        },

        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      console.log("SITE WISE SALARY RESPONSE:", response.data);

      if (response.data?.success) {
        let data = response.data.data || [];

        // CLIENT NAME FILTER

        if (filters.client_name) {
          const filter = filters.client_name.trim().toLowerCase();

          data = data.filter((item) =>
            String(item.client_name || "")
              .toLowerCase()
              .includes(filter),
          );
        }

        // SITE NAME FILTER

        if (filters.site_name) {
          const filter = filters.site_name.trim().toLowerCase();

          data = data.filter((item) =>
            String(item.site_name || "")
              .toLowerCase()
              .includes(filter),
          );
        }

        setSalaryData(data);

        setSummary(response.data.summary || {});
      } else {
        setSalaryData([]);

        setSummary({});

        setError(response.data?.message || "No salary data found");
      }
    } catch (error) {
      console.error("FETCH SITE SALARY ERROR:", error);

      setSalaryData([]);

      setError(
        error.response?.data?.message || "Failed to fetch site wise salary",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    fetchSalaryData();
  };

  // =====================================================
  // RESET
  // =====================================================

const handleReset = () => {
  setSearchRows([
    {
      field: "Select",
      keyword: "",
    },
  ]);

  setMonth(currentMonth);
  setYear(currentYear);

  setEmployeeData([]);
  setEmployeeError("");

  fetchEmployeeSalary();
};

  // =====================================================
  // PRINT BY SITE
  // =====================================================

  const handlePrintBySite = (item) => {
    window.open(
      `/salary_slip/printbysite?id=${item.site_id}&month=${getMonthNumber(
        month,
      )}&year=${year}`,
      "_blank",
    );
  };

  // =====================================================
  // PRINT BY EMPLOYEE
  // =====================================================

  const handlePrintByEmployee = (item) => {
    const monthNumber = getMonthNumber(month);

    window.open(
      `/salary/print-by-employee?id=${item.site_id}&month=${monthNumber}&year=${year}&type=site`,
      "_blank",
    );
  };

  // =====================================================
  // UPDATE SALARY STATUS
  // =====================================================

  const handleUpdateSalaryStatus = async (item) => {
    const currentStatus = item.salary_status || "Unpaid";

    const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";

    const confirmUpdate = window.confirm(
      `Are you sure you want to mark this salary as ${newStatus}?`,
    );

    if (!confirmUpdate) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/salary/status`,
        {
          site_id: item.site_id,

          month: getMonthNumber(month),

          year: Number(year),

          status: newStatus,
        },
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        },
      );

      if (response.data?.success) {
        alert(`Salary marked as ${newStatus}`);

        fetchSalaryData();
      } else {
        alert(response.data?.message || "Salary status update failed");
      }
    } catch (error) {
      console.error("UPDATE SALARY STATUS ERROR:", error);

      alert(error.response?.data?.message || "Failed to update salary status");
    }
  };

  // =====================================================
  // HOLD SALARY
  // =====================================================

  const handleHoldSalary = async (item) => {
    const confirmHold = window.confirm(
      "Are you sure you want to hold this salary?",
    );

    if (!confirmHold) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/salary/hold`,
        {
          site_id: item.site_id,

          month: getMonthNumber(month),

          year: Number(year),

          status: "Hold",
        },
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        },
      );

      if (response.data?.success) {
        alert("Salary put on hold successfully");

        fetchSalaryData();
      } else {
        alert(response.data?.message || "Failed to hold salary");
      }
    } catch (error) {
      console.error("HOLD SALARY ERROR:", error);

      alert(error.response?.data?.message || "Failed to hold salary");
    }
  };

  return (
    <div className="salary-page">
      <Container fluid>
        {/* =====================================================
            SEARCH CARD
        ===================================================== */}

        <Card className="top-search-card">
          <Card.Body>
            <div className="search-section-title">
              <h6>Search Salary By Site</h6 >

              
            </div>

            <Row>
              {/* SEARCH */}

              <Col lg={7}>
                <div className="search-table">
                  <Row className="search-header">
                    <Col xs={4}>Search Field</Col>

                    <Col xs={6}>Enter Keyword</Col>

                    <Col xs={2}></Col>
                  </Row>

                  {searchRows.map((row, index) => (
                    <Row className="search-row" key={index}>
                      <Col xs={4}>
                        <Form.Select
                          value={row.field}
                          onChange={(e) =>
                            updateRow(index, "field", e.target.value)
                          }
                        >
                          <option>Select</option>

                          <option>Client Name</option>

                          <option>Client Code</option>

                          <option>Site Name</option>
                        </Form.Select>
                      </Col>

                      <Col xs={6}>
                        <Form.Control
                          type="text"
                          placeholder="Enter keyword..."
                          value={row.keyword}
                          onChange={(e) =>
                            updateRow(index, "keyword", e.target.value)
                          }
                        />
                      </Col>

                      <Col xs={2} className="search-action-col">
                        <Button className="plus-btn" onClick={addRow}>
                          +
                        </Button>

                        <Button
                          className="minus-btn"
                          onClick={() => removeRow(index)}
                        >
                          −
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
              </Col>

              {/* MONTH YEAR */}

              <Col lg={5}>
                <Row className="month-year-row">
                  <Col md={6}>
                    <Form.Label>Select Month</Form.Label>

                    <Form.Select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      {months.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Select Year</Form.Label>

                    <Form.Select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {years.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <div className="top-buttons">
                  <Button
                    className="search-btn"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    🔍&nbsp;
                    {loading ? "Loading..." : "Search"}
                  </Button>

                  <Button className="reset-btn" onClick={handleReset}>
                    ⟳&nbsp; Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* =====================================================
            SITE SALARY CARD
        ===================================================== */}

        <Card className="salary-card">
          <Card.Header className="salary-card-header">
            <h4>Salary By Site</h4>

            <div>
              <Button className="click-search-btn" onClick={handleSearch}>
                Click Here To Search
              </Button>

              <Button
                className="download-btn"
                onClick={() => console.log("DOWNLOAD REPORT")}
              >
                Download Report
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="summary">
              <span className="green">
                Total Sites: {formatNumber(summary.total_sites)}
              </span>

              <span>|</span>

              <span className="green">
                Total Salary: {formatNumber(summary.total_earned_gross)}
              </span>

              <span>|</span>

              <span className="red">
                Deduction: {formatNumber(summary.total_deduction)}
              </span>

              <span>|</span>

              <span className="blue">
                Net Payable: {formatNumber(summary.total_net_take_home)}
              </span>

              <span>|</span>

              <span className="blue">
                Total Invoice Amount:{" "}
                {formatNumber(summary.total_invoice_amount)}
              </span>

              <span>|</span>

              <span className="blue">Total Salary Paid: 0</span>

              <span>|</span>

              <span className="red">
                Total Salary Unpaid:{" "}
                {formatNumber(summary.total_salary_payable)}
              </span>
            </div>

            {/* SECOND SUMMARY */}

            <div className="summary second-summary">
              <span>Total Advance: {formatNumber(summary.total_advance)}</span>

              <span>|</span>

              <span>Total P.T.: {formatNumber(summary.total_pt)}</span>

              <span>|</span>

              <span>Total PF: {formatNumber(summary.total_pf)}</span>

              <span>|</span>

              <span>Total ESIC: {formatNumber(summary.total_esic)}</span>

              <span>|</span>

              <span>
                Total Uniform Charges: {formatNumber(summary.total_uniform)}
              </span>

              <span>|</span>

              <span>
                Total Other Charges: {formatNumber(summary.total_other)}
              </span>
            </div>

            {/* ERROR */}

            {error && <div className="alert alert-danger">{error}</div>}

            {/* =================================================
                SITE TABLE
            ================================================= */}

            <div className="table-responsive">
              <Table bordered className="salary-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>

                    <th>Site Name</th>

                    <th>Client Name</th>

                    <th>Month-Year</th>

                    <th>Employees</th>

                    <th>Total Earning(Rs)</th>

                    <th>Advance</th>

                    <th>PT</th>

                    <th>PF</th>

                    <th>ESIC</th>

                    <th>Uniform</th>

                    <th>Other</th>

                    <th>Net Payable(Rs)</th>

                    <th>Total Invoice Amount</th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="15" className="text-center">
                        Loading salary data...
                      </td>
                    </tr>
                  ) : salaryData.length === 0 ? (
                    <tr>
                      <td colSpan="15" className="text-center">
                        No salary data found
                      </td>
                    </tr>
                  ) : (
                    salaryData.map((item, index) => (
                      <tr key={`${item.site_id}-${index}`}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>
                            {item.site_name || `Site ID: ${item.site_id}`}
                          </strong>

                          <div>Site ID: {item.site_id}</div>
                        </td>

                        <td className="client-column">
                          {item.client_name && <div>{item.client_name}</div>}

                          <div>Client Code: {item.client_code}</div>
                        </td>

                        <td>
                          {month}-{year}
                        </td>

                        <td>{formatNumber(item.total_employees)}</td>

                        <td>{formatNumber(item.total_earned_gross)}</td>

                        <td>{formatNumber(item.total_advance)}</td>

                        <td>{formatNumber(item.total_pt)}</td>

                        <td>{formatNumber(item.total_pf)}</td>

                        <td>{formatNumber(item.total_esic)}</td>

                        <td>{formatNumber(item.total_uniform)}</td>

                        <td>{formatNumber(item.total_other)}</td>

                        <td>{formatNumber(item.total_net_take_home)}</td>

                        <td>{formatNumber(item.total_invoice_amount)}</td>

                        <td>
                          <Dropdown>
                            <Dropdown.Toggle
                              className="action-btn"
                              variant="primary"
                            >
                              Action
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => handlePrintBySite(item)}
                              >
                                🖨️ Print By Site
                              </Dropdown.Item>

                              <Dropdown.Item
                                onClick={() => handlePrintByEmployee(item)}
                              >
                                👥 Print By Employee
                              </Dropdown.Item>

                              <Dropdown.Divider />

                              <Dropdown.Item
                                onClick={() => handleUpdateSalaryStatus(item)}
                              >
                                💰 Update Salary Paid/Unpaid
                              </Dropdown.Item>

                              <Dropdown.Item
                                onClick={() => handleHoldSalary(item)}
                              >
                                ⏸️ Hold Salary
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default SalaryBySite;
