import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Collapse, Form } from "react-bootstrap";
import Select from "react-select";
import { FaPlus, FaMinus, FaSearch, FaFileExport } from "react-icons/fa";
import ClientList from "../../../components/addNew/clientPage/ClientList";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import { useContext } from "react";

import { PermissionsContext } from "../../../components/context/PermissionsContext";
import LoadingScreen from "../../../components/loader/LoadingScreen";
// Assuming these are imported or defined in your utility file
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/clients`;
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

function ClientTable() {
  const {
    permissions,
    getPermissionsByModule,
    getPermissionsByModuleId,
    refetch,
  } = useContext(PermissionsContext);

  const clientPerms = getPermissionsByModule("Client");
  console.log("clientPerms", clientPerms);
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([{ field: null, keyword: "" }]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [error, setError] = useState(null);
  const [searchFields] = useState([]);
  const [dateFilter] = useState({ from: "", to: "" });
  const [activeStatus, setActiveStatus] = useState(0);

  const isItemActive = (val) => {
    if (val === undefined || val === null) return true;
    const s = String(val).trim();
    return s === "0" || s === "";
  };

  const activeCount = filteredClients.filter((c) => isItemActive(c.active)).length;
  const inactiveCount = filteredClients.filter((c) => !isItemActive(c.active)).length;

  const displayedClients = filteredClients.filter((c) => activeStatus === 0 ? isItemActive(c.active) : !isItemActive(c.active));
const canEditOrDeleteClient = (client) => {
  return (
    Number(client?.created_by) !== 1 &&
    Number(client?.modified_by) !== 1
  );
};
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // const [selectedYear, setSelectedYear] = useState(null);
  // const [selectedMonth, setSelectedMonth] = useState(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  // const allMonths = [
  //   { value: 1, label: "January" },
  //   { value: 2, label: "February" },
  //   { value: 3, label: "March" },
  //   { value: 4, label: "April" },
  //   { value: 5, label: "May" },
  //   { value: 6, label: "June" },
  //   { value: 7, label: "July" },
  //   { value: 8, label: "August" },
  //   { value: 9, label: "September" },
  //   { value: 10, label: "October" },
  //   { value: 11, label: "November" },
  //   { value: 12, label: "December" },
  // ];

  // const yearOptions = Array.from({ length: 8 }, (_, i) => ({
  //   value: currentYear - i,
  //   label: String(currentYear - i),
  // }));

  // const monthOptions =
  //   selectedYear?.value === currentYear
  //     ? allMonths.filter((month) => month.value <= currentMonth)
  //     : allMonths;

  // Available search options
  const fieldOptions = [
    { value: "", label: "Select" },
      { value: "billingCompany", label: "Company" },
        { value: "billingBranch", label: " Branch" },
    { value: "companyName", label: "Client Name" },
    { value: "contactNo", label: "Contact No" },
    { value: "x_client_code", label: "Client Code" },
    { value: "emailId", label: "Email Id" },
  ];

  const [dateField, setDateField] = useState({
    value: "created_on",
    label: "Created On",
  });

  // FIX: Added useEffect to trigger the fetch on mount

const fetchClients = async () => {
  setLoading(true);

  try {
    const response = await axios.get(API_BASE_URL, getAuthHeaders());

    const result = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];

    const loggedInUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const loggedInUserId = Number(loggedInUser?.id);

    const visibleClients = result.filter((client) => {
      return !(
        Number(client?.superadmin_status) === 1 &&
        loggedInUserId !== 1
      );
    });

    setClients(visibleClients);
    setFilteredClients(visibleClients);
  } catch (err) {
    console.error("FETCH CLIENTS ERROR =>", err);
  } finally {
    setLoading(false);
  }
};

// पुढचा function लगेच इथून सुरू होईल


  const handleKeywordChange = (e, index) => {
    const updated = [...filters];
    updated[index].keyword = e.target.value;
    setFilters(updated);
  };

  const addFilter = () => {
    setFilters([...filters, { field: null, keyword: "" }]);
  };

  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);
    setFilters(updated);
  };

  const getAvailableOptions = (currentIndex) => {
    const selectedValues = filters
      .filter((_, idx) => idx !== currentIndex)
      .map((item) => item.field?.value);

    return fieldOptions.filter(
      (option) => option.value === "" || !selectedValues.includes(option.value),
    );
  };

  // const handleSearch = () => {
  //   let result = [...clients];

  //   // Dynamic Search Fields
  //   filters.forEach((filter) => {
  //     if (!filter.field?.value || !filter.keyword.trim()) return;

  //     const keyword = filter.keyword.toLowerCase().trim();

  //     result = result.filter((client) => {
  //       const value =
  //         client?.[filter.field.value]?.toString().toLowerCase() || "";

  //       console.log(
  //         "Field:",
  //         filter.field.value,
  //         "Value:",
  //         value,
  //         "Keyword:",
  //         keyword,
  //       );

  //       return value.includes(keyword);
  //     });
  //   });

  //   // Month / Year Filter
  //   // if (selectedMonth && selectedYear) {
  //   //   result = result.filter((client) => {
  //   //     const dateValue =
  //   //       client.createdAt || client.created_date || client.createdDate;

  //   //     if (!dateValue) return false;

  //   //     const dt = new Date(dateValue);

  //   //     if (isNaN(dt)) return false;

  //   //     return (
  //   //       dt.getMonth() + 1 === selectedMonth.value &&
  //   //       dt.getFullYear() === selectedYear.value
  //   //     );
  //   //   });
  //   // }

  //   setFilteredClients(result);
  // };

  const handleSearch = () => {
    let result = [...clients];

    // 1. Text Filters (Your existing logic)
    filters.forEach((filter) => {
      if (!filter.field?.value || !filter.keyword.trim()) return;
      const keyword = filter.keyword.toLowerCase().trim();
      result = result.filter((client) => {
        const value =
          client?.[filter.field.value]?.toString().toLowerCase() || "";
        return value.includes(keyword);
      });
    });

    // Inside handleSearch, under "2. Fixed Date Range Filter"
    if (dateRange.from || dateRange.to) {
      const from = dateRange.from
        ? new Date(dateRange.from).setHours(0, 0, 0, 0)
        : null;
      const to = dateRange.to
        ? new Date(dateRange.to).setHours(23, 59, 59, 999)
        : null;

      result = result.filter((client) => {
        // Dynamically select the field based on the dropdown
        const rawDate = client[dateField.value];
        if (!rawDate) return false;

        const dateOnly = rawDate.toString().substring(0, 10);
        const clientDate = new Date(dateOnly).getTime();

        if (isNaN(clientDate)) return false;

        if (from && clientDate < from) return false;
        if (to && clientDate > to) return false;
        return true;
      });
    }

    setFilteredClients(result);
  };
  // const exportClients = async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/export`, {
  //       responseType: "blob",
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     });

  //     const blob = new Blob([response.data], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     const url = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");

  //     link.href = url;

  //     link.download = `Clients_${new Date().getTime()}.xlsx`;

  //     document.body.appendChild(link);

  //     link.click();

  //     document.body.removeChild(link);

  //     window.URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error("Export failed:", err);

  //     alert("Failed to export clients.");
  //   }
  // };

  // const resetFilters = () => {
  //   const defaultYear = {
  //     value: currentYear,
  //     label: String(currentYear),
  //   };

  //   const defaultMonth = allMonths[currentMonth - 1];

  //   setFilters([
  //     {
  //       field: null,
  //       keyword: "",
  //     },
  //   ]);

  //   setSelectedYear(defaultYear);
  //   setSelectedMonth(defaultMonth);

  //   setFilteredClients(clients);
  // };

  const exportClients = async () => {
    try {
      // Extract only the IDs of the currently displayed clients (respects both search and active tab)
      const displayedIds = displayedClients.map((c) => c._id);
      console.log(displayedClients);
      const response = await axios.post(
        `${API_BASE_URL}/export`,
        { ids: displayedIds }, // Send the displayed list
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Filtered_Clients_${new Date().getTime()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export filtered clients.");
    }
  };

  const resetFilters = () => {
    setFilters([{ field: null, keyword: "" }]);
    setDateRange({ from: "", to: "" });
    setDateField({ value: "created_on", label: "Created On" }); // Reset field
    setFilteredClients(clients);
  };

  useEffect(() => {
    // const defaultYear = {
    //   value: currentYear,
    //   label: String(currentYear),
    // };

    // const defaultMonth = allMonths[currentMonth - 1];

    // setSelectedYear(defaultYear);
    // setSelectedMonth(defaultMonth);

    fetchClients();
  }, []);

  // const handleYearChange = (year) => {
  //   setSelectedYear(year);

  //   if (year.value === currentYear) {
  //     setSelectedMonth(allMonths[currentMonth - 1]);
  //   } else {
  //     setSelectedMonth(allMonths[0]);
  //   }
  // };

  if (clientPerms.length <= 0) {
    refetch();
    return <LoadingScreen />;
  }
  return (
    <div
      className="container-fluid p-0"
      style={{
        fontSize: "13px",
      }}
    >
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="page-title m-0">
          CLIENT MANAGEMENT{" "}
          <span className="text-success">({filteredClients.length})</span>
        </h4>
        <div>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaSearch className="me-2" />{" "}
            {showFilters ? "Hide Search" : "Search"}
          </Button>
          {clientPerms?.add_access === 1 && (
            <Button
              variant="primary"
              onClick={() => navigate("/client/add")} // Adjust this path to your Add Client route
            >
              <FaPlus className="me-2" /> Add New
            </Button>
          )}
        </div>
      </div>

      {/* 3. Filter Card */}
      <div className="container-fluid p-0">
        <Collapse in={showFilters}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row>
                {/* Left Column: Dynamic Fields */}
                <Col md={8}>
                  <div className="g-2 mb-2 row">
                    <div className="col-md-4">Select Search Field</div>
                    <div className="col-md-4">Enter Keyword</div>
                  </div>

                  {filters.map((filter, index) => (
                    <Row key={index} className="g-2 mb-2">
                      <Col md={4}>
                        <Select
                          value={filter.field}
                          options={getAvailableOptions(index)}
                          placeholder="Select Field..."
                          onChange={(selected) =>
                            handleFieldChange(selected, index)
                          }
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Control
                          size="sm"
                          value={filter.keyword}
                          type="text"
                          placeholder="Enter keyword..."
                          onChange={(e) => handleKeywordChange(e, index)}
                        />
                      </Col>

                      <Col md={2}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={addFilter}
                          disabled={
                            !filter.field ||
                            filters.length >= fieldOptions.length - 1
                          }
                        >
                          <FaPlus />
                        </Button>

                        {filters.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-1"
                            onClick={() => removeFilter(index)}
                          >
                            <FaMinus />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </Col>
                {/* Right Column: Date Selectors */}
                <Col md={4} className="border-start ps-3">
                  <Row className="g-2">
                    <Col md={12}>
                      <Form.Label className="small fw-bold">
                        Select Date Field
                      </Form.Label>
                      <Select
                        value={dateField}
                        options={[
                          { value: "created_on", label: "Created On" },
                          { value: "modified_on", label: "Modified On" },
                        ]}
                        onChange={setDateField}
                        size="sm"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">From</Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={dateRange.from}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, from: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">To</Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={dateRange.to}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, to: e.target.value })
                        }
                      />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-fill"
                      onClick={handleSearch}
                    >
                      <FaSearch className="me-1" /> Search
                    </Button>
                    <Button variant="danger" size="sm" onClick={resetFilters}>
                      Reset
                    </Button>
                    {clientPerms?.export_access === 1 && (
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-fill"
                        onClick={exportClients}
                      >
                        <FaFileExport className="me-1" /> Export
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Collapse>
      </div>

      {/* Table Section */}
      <div style={{ marginTop: "8px" }}>
        <Card className="table-card">
          <Card.Header style={{ background: "#fff", padding: "8px 16px", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", gap: "8px", minHeight: "44px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#888", marginRight: "4px" }}>Status:</span>
            {[{ label: "Active", value: 0 }, { label: "Inactive", value: 1 }].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                style={{
                  padding: "3px 14px", borderRadius: "20px", border: "1.5px solid",
                  fontSize: "11px", fontWeight: 600, cursor: "pointer", lineHeight: "1.6",
                  borderColor: activeStatus === tab.value ? (tab.value === 0 ? "#28a745" : "#dc3545") : "#ccc",
                  backgroundColor: activeStatus === tab.value ? (tab.value === 0 ? "#28a745" : "#dc3545") : "#fff",
                  color: activeStatus === tab.value ? "#fff" : "#666",
                }}
              >
                {tab.label} ({tab.value === 0 ? activeCount : inactiveCount})
              </button>
            ))}
          </Card.Header>
 <ClientList
  clientPerms={clientPerms}
  clients={displayedClients}
  loading={loading}
  fetchClients={fetchClients}
  activeStatus={activeStatus}
  canEditOrDeleteClient={canEditOrDeleteClient}
/>
        </Card>
      </div>
    </div>
  );
}

export default ClientTable;
