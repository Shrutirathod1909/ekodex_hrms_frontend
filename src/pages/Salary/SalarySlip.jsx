
import React, { useEffect, useState } from "react";
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

const SalarySlip = () => {
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
  // EMPLOYEE SALARY
  // =====================================================

  const [employeeData, setEmployeeData] = useState([]);

  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [employeeError, setEmployeeError] = useState("");

  const [employeeSummary, setEmployeeSummary] = useState({
    total_employees: 0,
    total_earned_gross: 0,
    total_deduction: 0,
    total_net_take_home: 0,
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
    let employee_name = "";
    let employee_code = "";

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

        case "Employee Name":
          employee_name = row.keyword;
          break;

        case "Employee Code":
          employee_code = row.keyword;
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
      employee_name,
      employee_code,
    };
  };

  // =====================================================
  // FETCH EMPLOYEE SALARY
  // =====================================================

  const fetchEmployeeSalary = async () => {
    console.log("========== EMPLOYEE SALARY FETCH START ==========");

    try {
      setEmployeeLoading(true);
      setEmployeeError("");

      const monthNumber = getMonthNumber(month);
      const filters = getSearchFilters();

      const token = localStorage.getItem("token");

      console.log("EMPLOYEE SALARY REQUEST:", {
        url: `${API_URL}/api/salary/employee-wise`,
        month: monthNumber,
        year,
        filters,
      });

      const response = await axios.get(`${API_URL}/api/salary/employee-wise`, {
        params: {
          month: monthNumber,
          year: year,
          site_id: filters.site_id,
          client_id: filters.client_id,
          client_name: filters.client_name,
          site_name: filters.site_name,
          employee_name: filters.employee_name,
          employee_code: filters.employee_code,
        },

        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      console.log("EMPLOYEE WISE SALARY RESPONSE:", response.data);

      if (!response.data?.success) {
        setEmployeeData([]);

        setEmployeeSummary({
          total_employees: 0,
          total_earned_gross: 0,
          total_deduction: 0,
          total_net_take_home: 0,
        });

        setEmployeeError(
          response.data?.message || "No employee salary data found",
        );

        return;
      }

      const data = Array.isArray(response.data?.data) ? response.data.data : [];

      console.log("EMPLOYEE DATA:", data);
      console.log("EMPLOYEE DATA COUNT:", data.length);

      setEmployeeData(data);

      const backendSummary = response.data?.summary || {};

      const updatedEmployeeSummary = {
        total_employees: Number(
          backendSummary.total_employees ?? data.length ?? 0,
        ),

        total_earned_gross: Number(
          backendSummary.total_earning ??
            backendSummary.total_earned_gross ??
            0,
        ),

        total_deduction: Number(backendSummary.total_deduction ?? 0),

        total_net_take_home: Number(
          backendSummary.net_payable ?? backendSummary.total_net_take_home ?? 0,
        ),
      };

      setEmployeeSummary(updatedEmployeeSummary);

      console.log("EMPLOYEE SUMMARY:", updatedEmployeeSummary);
    } catch (error) {
      console.error("FETCH EMPLOYEE SALARY ERROR:", error);

      console.error("ERROR RESPONSE:", error.response?.data);

      setEmployeeData([]);

      setEmployeeSummary({
        total_employees: 0,
        total_earned_gross: 0,
        total_deduction: 0,
        total_net_take_home: 0,
      });

      setEmployeeError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch employee salary",
      );
    } finally {
      setEmployeeLoading(false);

      console.log("========== EMPLOYEE SALARY FETCH END ==========");
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    fetchEmployeeSalary();
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
  // PRINT EMPLOYEE
  // =====================================================

  const handlePrintEmployee = (item) => {
    const monthNumber = getMonthNumber(month);

    const employeeId = item.emp_id ?? item.employee_id ?? item.id;

    window.open(
      `/salary/print-by-employee?id=${employeeId}&month=${monthNumber}&year=${year}&type=employee`,
      "_blank",
    );
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchEmployeeSalary();
  }, []);

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="salary-page">
      <Container fluid>
        {/* =====================================================
            SEARCH CARD
        ===================================================== */}

        <Card className="top-search-card">
          <Card.Body>
            <div className="search-section-title">
              <h6>Search Salary By Employee</h6>

              
            </div>

            <Row>
              {/* SEARCH FILTERS */}

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

                          <option>Employee Name</option>

                          <option>Employee Code</option>
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
                    disabled={employeeLoading}
                  >
                    🔍&nbsp;
                    {employeeLoading ? "Loading..." : "Search"}
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
            EMPLOYEE SALARY
        ===================================================== */}

        <Card className="salary-card">
          <Card.Header className="salary-card-header">
            <h4>Salary By Employee</h4>

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
            {/* SUMMARY */}

            <div className="summary">
              <span className="green">
                Total Employees: {formatNumber(employeeSummary.total_employees)}
              </span>

              <span>|</span>

              <span className="green">
                Total Earning:{" "}
                {formatNumber(employeeSummary.total_earned_gross)}
              </span>

              <span>|</span>

              <span className="red">
                Total Deduction: {formatNumber(employeeSummary.total_deduction)}
              </span>

              <span>|</span>

              <span className="blue">
                Net Payable: {formatNumber(employeeSummary.total_net_take_home)}
              </span>
            </div>

            {/* ERROR */}

            {employeeError && (
              <div className="alert alert-warning">{employeeError}</div>
            )}

            {/* TABLE */}

            <div className="table-responsive">
              <Table bordered className="salary-table employee-salary-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>

                    <th>Employee Name</th>

                    <th>Employee Code</th>

                    <th>Rank</th>

                    <th>Month-Year</th>

                    <th>Total Earning(Rs)</th>

                    <th>Total Deduction(Rs)</th>

                    <th>Net Payable(Rs)</th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {employeeLoading ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        Loading employee salary...
                      </td>
                    </tr>
                  ) : employeeData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No employee salary found
                      </td>
                    </tr>
                  ) : (
                    employeeData.map((item, index) => (
                      <tr key={item.id || `${item.emp_id}-${index}`}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>{item.emp_name || "-"}</strong>
                        </td>

                        <td>{item.emp_code || "-"}</td>

                        <td>{item.rank?.[0] || "-"}</td>

                        <td>
                          {month}-{year}
                        </td>

                        <td>
                          {formatNumber(
                            item.total_earning ??
                              item.total_earned_gross ??
                              item.earned_gross ??
                              0,
                          )}
                        </td>

                        <td>
                          {formatNumber(item.total_deduction ?? item.deduction)}
                        </td>

                        <td>
                          {formatNumber(
                            item.gross_salary ??
                              item.net_payable ??
                              item.net_take_home ??
                              item.salary_payable ??
                              0,
                          )}
                        </td>

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
                                onClick={() => handlePrintEmployee(item)}
                              >
                                🖨️ Print
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

export default SalarySlip;
