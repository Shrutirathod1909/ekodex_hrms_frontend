import axios from "axios";
import "./MISPage.css";
import React, { useEffect, useState, useContext } from "react";
import { Button, Card, Col, Form, Nav, Row, Tab } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

import BillFormat from "../../components/reports/MISPage/BillFormat";
import SalaryWagesSheet from "../../components/reports/MISPage/SalaryWagesSheet";
import BankTrfSheet from "../../components/reports/MISPage/BankTrfSheet";
import AllPaySlip from "../../components/reports/MISPage/AllPaySlip";
import SinglePaySlip from "../../components/reports/MISPage/SinglePaySlip";
import CsvForPf from "../../components/reports/MISPage/CsvForPf";
import CsvForEsic from "../../components/reports/MISPage/CsvForEsic";
import MIS from "../../components/reports/MISPage/MIS";

import { PermissionsContext } from "../../components/context/PermissionsContext";

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// DATA NOT FOUND
// ==========================================
const DataNotFound = () => (
  <div className="text-center py-4">
    <h5 className="text-muted">Data Not Found</h5>
    <p className="text-muted mb-0">
      No data available for the selected filters.
    </p>
  </div>
);

// ==========================================
// CHECK DATA
// ==========================================
const hasData = (data) => {
  if (data === null || data === undefined) {
    return false;
  }

  if (Array.isArray(data)) {
    return data.length > 0;
  }

  if (typeof data === "object") {
    if (Object.keys(data).length === 0) {
      return false;
    }

    if ("data" in data) {
      return hasData(data.data);
    }

    return true;
  }

  return Boolean(data);
};

const MISPage = () => {
  const {
    permissions,
    getPermissionsByModule,
    getPermissionsByModuleId,
  } = useContext(PermissionsContext);

  const MISPerms = getPermissionsByModule("MIS");

  const monthList = [
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

  const [searchFields, setSearchFields] = useState({
    clientName: "",
    siteName: "",
    employeeName: "",
    month: monthList[new Date().getMonth()],
    year: new Date().getFullYear(),
  });

  const [pfCsvData, setPfCsvData] = useState(null);
  const [pfLoading, setPfLoading] = useState(false);

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [esicCsvData, setEsicCsvData] = useState(null);
  const [esicLoading, setEsicLoading] = useState(false);

  const [salaryWagesData, setSalaryWagesData] = useState(null);
  const [sites, setSites] = useState([]);

  const [dataFetched, setDataFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [misData, setMisData] = useState(null);
  const [bankTrfData, setBankTrfData] = useState(null);
  const [singlePaySlipData, setSinglePaySlipData] = useState(null);
  const [billData, setBillData] = useState(null);

  const [activeTab, setActiveTab] = useState("billFormat");

  // ==========================================
  // AUTH HEADERS
  // ==========================================
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================
  // FETCH COMPANIES
  // ==========================================
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/vouchers/getAllCompanies`,
        {},
        getAuthHeaders()
      );

      if (!response.data.error) {
        setClients(response.data.user || []);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  // ==========================================
  // FETCH PF CSV
  // ==========================================
  const fetchPfCsv = async (clientId, siteId, month, year) => {
    try {
      setPfLoading(true);

      const response = await axios.get(
        `${API_URL}/api/pf/pf-csv`,
        {
          params: {
            client_id: clientId,
            site_id: siteId,
            month,
            year,
          },
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success) {
        setPfCsvData(response.data.data ?? []);
      } else {
        setPfCsvData([]);
      }
    } catch (err) {
      console.error("PF CSV Error:", err);
      setPfCsvData([]);
    } finally {
      setPfLoading(false);
    }
  };

  // ==========================================
  // FETCH ESIC CSV
  // ==========================================
  const fetchEsicCsv = async (month, year) => {
    try {
      setEsicLoading(true);

      const response = await axios.get(
        `${API_URL}/api/esic/get_esic_data`,
        {
          params: {
            month,
            year,
          },
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success) {
        setEsicCsvData(response.data.data ?? []);
      } else {
        setEsicCsvData([]);
      }
    } catch (err) {
      console.error("ESIC CSV Error:", err);
      setEsicCsvData([]);
    } finally {
      setEsicLoading(false);
    }
  };

  // ==========================================
  // FETCH SINGLE PAYSLIP
  // ==========================================
  const fetchSinglePaySlip = async (emp_id, month, year) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/payslip/${emp_id}`,
        {
          params: {
            month,
            year,
          },
          ...getAuthHeaders(),
        }
      );

      console.log("Payslip API Response:", response.data);

      const result = response.data?.data;

      if (response.data?.success && result) {
        const payslip = Array.isArray(result)
          ? result[0]
          : result;

        setSinglePaySlipData(payslip || null);
      } else {
        setSinglePaySlipData(null);
      }
    } catch (err) {
      console.error(
        "Single PaySlip Error:",
        err.response?.data || err.message
      );

      setSinglePaySlipData(null);
    }
  };

  // ==========================================
  // FETCH EMPLOYEES
  // ==========================================
  const fetchEmployees = async (clientId, siteId) => {
    try {
      if (!clientId || !siteId) {
        setEmployees([]);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/vouchers/employees`,
        {
          client_id: clientId,
          site_id: siteId,
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        setEmployees(
          response.data.data || response.data.user || []
        );
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  // ==========================================
  // CLIENT CHANGE
  // ==========================================
  const handleClientChange = async (e) => {
    const clientId = e.target.value;

    setSearchFields((prev) => ({
      ...prev,
      clientName: clientId,
      siteName: "",
      employeeName: "",
    }));

    setSites([]);
    setEmployees([]);

    if (!clientId) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/vouchers/getAllBranches`,
        {
          client_id: clientId,
        },
        getAuthHeaders()
      );

      if (!response.data.error) {
        setSites(response.data.user || []);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  // ==========================================
  // TABS
  // ==========================================
  const tabs = [
    "billFormat",
    "salaryWagesSheet",
    "bankTrfSheet",
    "allPaySlip",
    "singlePaySlip",
    "csvForPf",
    "csvForEsic",
    "mis",
  ];

  const tabTitles = {
    billFormat: "Bill Format",
    salaryWagesSheet: "Salary Wages Sheet",
    bankTrfSheet: "Bank TRF Sheet",
    allPaySlip: "All Pay Slip",
    singlePaySlip: "Single Pay Slip",
    csvForPf: "CSV FOR PF",
    csvForEsic: "CSV FOR ESIC",
    mis: "MIS",
  };

  const getMonthNumber = (monthName) => {
    return monthList.indexOf(monthName) + 1;
  };

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setSearchFields({
      clientName: "",
      employeeName: "",
      siteName: "",
      month: monthList[new Date().getMonth()],
      year: new Date().getFullYear(),
    });

    setSites([]);
    setEmployees([]);

    setBillData(null);
    setSalaryWagesData(null);
    setBankTrfData(null);
    setPfCsvData(null);
    setEsicCsvData(null);
    setMisData(null);
    setSinglePaySlipData(null);

    setDataFetched(false);
    setError(null);
  };

  // ==========================================
  // SEARCH ALL REPORTS
  // ==========================================
  const handleSearch = async () => {
    if (!searchFields.clientName) {
      setError("Please select Client/Company.");
      return;
    }

    if (!searchFields.siteName) {
      setError("Please select Site.");
      return;
    }

    setLoading(true);
    setDataFetched(false);
    setError(null);

    // Clear previous search results
    setBillData(null);
    setSalaryWagesData(null);
    setBankTrfData(null);
    setPfCsvData(null);
    setEsicCsvData(null);
    setMisData(null);
    setSinglePaySlipData(null);

    try {
      const monthNumber = getMonthNumber(searchFields.month);
      const year = Number(searchFields.year);
      const clientId = Number(searchFields.clientName);
      const siteId = Number(searchFields.siteName);

      // ==========================================
      // BILL FORMAT
      // ==========================================
      try {
        const billResponse = await axios.get(
          `${API_URL}/api/billing-format`,
          {
            params: {
              client_id: clientId,
              site_id: siteId,
              month: monthNumber,
              year,
            },
            ...getAuthHeaders(),
          }
        );

        console.log("Bill API:", billResponse.data);

        if (billResponse.data?.success) {
          setBillData(billResponse.data.data ?? null);
        }
      } catch (err) {
        console.error("Bill API Error:", err);
      }

      // ==========================================
      // SALARY WAGES SHEET
      // ==========================================
      try {
        const salaryResponse = await axios.post(
          `${API_URL}/api/salary-wages-sheet`,
          {
            client_id: clientId,
            site_id: siteId,
            month: monthNumber,
            year,
          },
          getAuthHeaders()
        );

        console.log("Salary API:", salaryResponse.data);

        if (salaryResponse.data?.status) {
          setSalaryWagesData(
            salaryResponse.data.data ?? null
          );
        }
      } catch (err) {
        console.error("Salary API Error:", err);
      }

      // ==========================================
      // BANK TRF SHEET
      // ==========================================
      try {
        const bankResponse = await axios.post(
          `${API_URL}/api/bank-trf-sheet`,
          {
            client_id: clientId,
            site_id: siteId,
            month: monthNumber,
            year,
          },
          getAuthHeaders()
        );

        console.log("Bank API:", bankResponse.data);

        if (bankResponse.data?.success) {
          setBankTrfData(bankResponse.data.data ?? null);
        }
      } catch (err) {
        console.error("Bank API Error:", err);
      }

      // ==========================================
      // PF CSV
      // ==========================================
      await fetchPfCsv(
        clientId,
        siteId,
        monthNumber,
        year
      );

      // ==========================================
      // ESIC CSV
      // ==========================================
      await fetchEsicCsv(monthNumber, year);

      // ==========================================
      // MIS REPORT
      // ==========================================
      try {
        const misResponse = await axios.post(
          `${API_URL}/api/mis-report`,
          {
            at_month: monthNumber,
            at_year: year,
            clientid: clientId,
            siteid: siteId,
          },
          getAuthHeaders()
        );

        console.log("MIS API:", misResponse.data);

        if (misResponse.data?.success) {
          setMisData(misResponse.data);
        }
      } catch (err) {
        console.error("MIS API Error:", err);
      }

      // ==========================================
      // SINGLE PAYSLIP
      // ==========================================
      if (searchFields.employeeName) {
        await fetchSinglePaySlip(
          searchFields.employeeName,
          monthNumber,
          year
        );
      }
    } catch (err) {
      console.error("Main Search Error:", err);
      setError("Failed to fetch report data.");
    } finally {
      setLoading(false);

      // Show all tabs after all report requests finish,
      // even if some individual APIs return no data.
      setDataFetched(true);
    }
  };

  // ==========================================
  // RENDER ACTIVE TAB CONTENT
  // ==========================================
  const renderTabContent = () => {
    switch (activeTab) {
      case "billFormat":
        return hasData(billData) ? (
          <BillFormat billData={billData} />
        ) : (
          <DataNotFound />
        );

      case "salaryWagesSheet":
        return hasData(salaryWagesData) ? (
          <SalaryWagesSheet salaryData={salaryWagesData} />
        ) : (
          <DataNotFound />
        );

      case "bankTrfSheet":
        return hasData(bankTrfData) ? (
          <BankTrfSheet bankTrfData={bankTrfData} />
        ) : (
          <DataNotFound />
        );

      case "allPaySlip":
        return (
          hasData(billData) ||
          hasData(bankTrfData) ||
          hasData(salaryWagesData)
        ) ? (
          <AllPaySlip
            billData={billData}
            bankTrfData={bankTrfData}
            salaryWagesData={salaryWagesData}
          />
        ) : (
          <DataNotFound />
        );

      case "singlePaySlip":
        return !searchFields.employeeName ? (
          <div className="text-center py-4">
            <p>Please select an employee and click Search.</p>
          </div>
        ) : hasData(singlePaySlipData) ? (
          <SinglePaySlip
            data={singlePaySlipData}
            billData={billData}
          />
        ) : (
          <DataNotFound />
        );

      case "csvForPf":
        if (pfLoading) {
          return <p className="text-center py-4">Loading...</p>;
        }

        return hasData(pfCsvData) ? (
          <CsvForPf
            data={pfCsvData}
            loading={pfLoading}
          />
        ) : (
          <DataNotFound />
        );

      case "csvForEsic":
        if (esicLoading) {
          return <p className="text-center py-4">Loading...</p>;
        }

        return hasData(esicCsvData) ? (
          <CsvForEsic
            billData={billData}
            data={esicCsvData}
            loading={esicLoading}
          />
        ) : (
          <DataNotFound />
        );

      case "mis":
        return hasData(misData) ? (
          <MIS
            billData={billData}
            data={misData}
            loading={loading}
          />
        ) : (
          <DataNotFound />
        );

      default:
        return <DataNotFound />;
    }
  };

  // ==========================================
  // MAIN JSX
  // ==========================================
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MIS</h1>
      </div>

      {/* SEARCH FORM */}
      <Card className="mis-search-card">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Row>
            {/* CLIENT */}
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Form.Group controlId="client_company_name">
                <Form.Label>Client/Company</Form.Label>

                <Form.Select
                  value={searchFields.clientName}
                  onChange={handleClientChange}
                >
                  <option value="">Select</option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* SITE */}
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Form.Group controlId="client_site">
                <Form.Label>Select Site</Form.Label>

                <Form.Select
                  value={searchFields.siteName}
                  onChange={(e) => {
                    const siteId = e.target.value;

                    setSearchFields((prev) => ({
                      ...prev,
                      siteName: siteId,
                      employeeName: "",
                    }));

                    setEmployees([]);

                    if (siteId) {
                      fetchEmployees(
                        searchFields.clientName,
                        siteId
                      );
                    }
                  }}
                >
                  <option value="">Select</option>

                  {sites.map((site) => (
                    <option
                      key={site.site_id}
                      value={site.site_id}
                    >
                      {site.site_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* EMPLOYEE - ONLY SINGLE PAYSLIP */}
            {activeTab === "singlePaySlip" && (
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="employee">
                  <Form.Label>Select Employee</Form.Label>

                  <Form.Select
                    value={searchFields.employeeName}
                    onChange={(e) =>
                      setSearchFields((prev) => ({
                        ...prev,
                        employeeName: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select</option>

                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.emp_full_name} ({emp.employee_code})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {/* MONTH */}
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Form.Group controlId="month">
                <Form.Label>Select Month</Form.Label>

                <Form.Select
                  value={searchFields.month}
                  onChange={(e) =>
                    setSearchFields((prev) => ({
                      ...prev,
                      month: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>

                  {monthList.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* YEAR */}
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Form.Group controlId="year">
                <Form.Label>Select Year</Form.Label>

                <Form.Select
                  value={searchFields.year}
                  onChange={(e) =>
                    setSearchFields((prev) => ({
                      ...prev,
                      year: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* BUTTONS */}
          <Row className="mis-search-actions">
            <Col xs={12} sm="auto">
              <Button
                type="submit"
                className="mis-search-btn"
                disabled={loading}
              >
                <FaSearch size={12} />
                <span>
                  {loading ? "Loading..." : "Search"}
                </span>
              </Button>
            </Col>

            <Col xs={12} sm="auto">
              <Button
                type="button"
                className="mis-reset-btn"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </Button>
            </Col>
          </Row>

          {error && (
            <div className="text-danger mt-3">
              {error}
            </div>
          )}
        </Form>
      </Card>

      {/* LOADING */}
      {loading && (
        <div className="text-center my-3">
          <h5>Loading reports...</h5>
        </div>
      )}

      {/* SHOW ALL TABS AFTER SEARCH */}
      {dataFetched && (
        <Card className="mt-3">
          <Tab.Container
            activeKey={activeTab}
            onSelect={(key) => {
              if (key) {
                setActiveTab(key);
              }
            }}
          >
            <Nav
              variant="pills"
              fill
              className="mb-3 flex-wrap"
            >
              {tabs.map((tab) => (
                <Nav.Item key={tab}>
                  <Nav.Link eventKey={tab}>
                    {tabTitles[tab]}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            <Tab.Content>
              {renderTabContent()}
            </Tab.Content>
          </Tab.Container>
        </Card>
      )}
    </div>
  );
};

export default MISPage;