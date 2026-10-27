import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import clientLogger from "../../utils/clientLogger";
import { FaPlus, FaSearch, FaPen, FaTrashAlt, FaUndo } from "react-icons/fa";
import LoadingScreen from "../../components/loader/LoadingScreen";
import SearchPanel from "../../utils/FilterPanel";
import { useContext } from "react";
import { PermissionsContext } from "../../components/context/PermissionsContext";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Dropdown,
  Pagination,
} from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import AuditTrail from "../../components/common/AuditTrail";

const BranchPage = () => {
  const { permissions, getPermissionsByModule, refetch } =
    useContext(PermissionsContext);
  const branchesPerms = getPermissionsByModule("Branches");

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
const loggedInCompanyId = String(
  currentUser?.company_id ??
  currentUser?.companyId ??
  ""
).trim();
console.log("LOGIN USER:", currentUser);
console.log("LOGIN COMPANY NAME:", currentUser?.company_name);
console.log("LOGIN COMPANY ID:", currentUser?.company_id);
  const isSuperAdmin =
    currentUser?.is_superadmin === true ||
    Number(currentUser?.id) === 1 ||
    String(currentUser?.role).toUpperCase() === "SUPERADMIN" ||
    String(currentUser?.role).toUpperCase() === "SUPER ADMIN";

  const formatToYMDHIS = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString); // Return as is if it's already a formatted string that fails Date parse
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      " " +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0")
    );
  };

  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);

    // const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (!includeTime) return datePart;

    // return `${datePart} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    return datePart;
  };

  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [zones, setZones] = useState([]);
  const [pincodes, setPincodes] = useState([]);

  const [pincodeSearch, setPincodeSearch] = useState("");
  const [showPincodeList, setShowPincodeList] = useState(false);

  const pincodeRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  const initialFormData = {
    branchName: "",
    areaName: "",
    email: "",
    costingMethod: "FIFO",
    defSalesAccount: "",
    defBranchDispAccount: "",
    address: "",
    pincode: "",
    contactNo: "",
    defPurchaseAccount: "",
    defBranchRecvAccount: "",
    zone_id: "",
    companyId: [],
    source: "WEB",
  };
  const [formData, setFormData] = useState(initialFormData);

  const [searchFields, setSearchFields] = useState([
    { field: "branchName", keyword: "" },
  ]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  // 0 = Active, 1 = Inactive
  const [activeStatus, setActiveStatus] = useState(0);

  const branchSearchOptions = [
    { value: "branchName", label: "Branch Name" },
      { value: "company_name", label: "Company Name" },
    { value: "areaName", label: "Area Name" },
    { value: "zone_name", label: "Zone Name" },
    { value: "pincode", label: "Pincode" },
  ];
  const handleNumberOnly = (e) => {
    const { name, value } = e.target;

    // allow only digits
    if (/^\d*$/.test(value)) {
      handleInputChange(e);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const isItemActive = (val) => {
    if (val === undefined || val === null) return true;
    const s = String(val).trim();
    return s === "0" || s === "";
  };

  // const activeCount = branches.filter((b) => isItemActive(b.active)).length;
  // const inactiveCount = branches.filter((b) => !isItemActive(b.active)).length;
  // const filteredBranches = branches.filter((b) => activeStatus === 0 ? isItemActive(b.active) : !isItemActive(b.active));


const loggedInCompanyName = String(
  currentUser?.company ?? currentUser?.company_name ?? ""
).trim().toUpperCase();

const companyFilteredBranches = branches
  .map((branch) => {
    // Super Admin ला सर्व companies चे branches
    if (isSuperAdmin) return branch;

    // Login user ची company ID/name उपलब्ध नसल्यास branch दाखवू नका
    if (!loggedInCompanyId && !loggedInCompanyName) {
      return null;
    }

    // Branch ला assign केलेले company IDs
    const branchCompanyIds = String(branch.company_id ?? "")
      .split(",")
      .map((id) => id.trim());

    // Branch ला assign केलेल्या company names
    const branchCompanyNames = String(branch.company_name ?? "")
      .split(",")
      .map((name) => name.trim());

    // Login user च्या company ID शी जुळणारा index
    const matchingIndex = loggedInCompanyId
      ? branchCompanyIds.indexOf(loggedInCompanyId)
      : -1;

    // Login user च्या company name शी जुळणारे नाव
    const matchingName = loggedInCompanyName
      ? branchCompanyNames.find(
          (name) => name.toUpperCase() === loggedInCompanyName
        )
      : "";

    // ID किंवा company name जुळले पाहिजे
    if (matchingIndex === -1 && !matchingName) {
      return null;
    }

    // Companies column मध्ये फक्त login केलेल्या company चे नाव
    return {
      ...branch,
      company_name:
        matchingName ||
        branchCompanyNames[matchingIndex] ||
        branch.company_name,
    };
  })
  .filter(Boolean);

// Active / Inactive counts
const activeCount = companyFilteredBranches.filter(
  (branch) => isItemActive(branch.active)
).length;

const inactiveCount = companyFilteredBranches.filter(
  (branch) => !isItemActive(branch.active)
).length;

// Active / Inactive filtering
const filteredBranches = companyFilteredBranches.filter((branch) =>
  activeStatus === 0
    ? isItemActive(branch.active)
    : !isItemActive(branch.active)
);

// Pagination
const currentBranches = filteredBranches.slice(
  indexOfFirstItem,
  indexOfLastItem
);

const totalPages = Math.ceil(
  filteredBranches.length / itemsPerPage
);

  // const currentBranches = filteredBranches.slice(indexOfFirstItem, indexOfLastItem);
  // const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchPincodes = async () => {
    try {
      const res = await api.get(`${API_URL}/api/pincodes`, getAuthHeaders());

      console.log("PINCODES API RESPONSE:", res.data); // 👈 ADD THIS

      setPincodes(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FILTER =================
  const filteredPincodes = pincodes.filter((p) =>
    p.pincode?.toString().includes(pincodeSearch),
  );

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pincodeRef.current && !pincodeRef.current.contains(event.target)) {
        setShowPincodeList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= LOAD PINCODES =================
  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const validSearchFields = searchFields.filter(
        (f) => f.field && f.keyword,
      );
      if (validSearchFields.length > 0) {
        params.searchFields = JSON.stringify(validSearchFields);
      }
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }
      const res = await api.get(`${API_URL}/api/branches`, {
        params,
        ...getAuthHeaders(),
      });
      setBranches(res.data);
      console.log("branch",res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else setError("Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get(
        `${API_URL}/api/companies`,
        getAuthHeaders(),
      );

      console.log("COMPANY RESPONSE =", response.data);

      // ✅ Correct
      setCompanies(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await api.get(`${API_URL}/api/zones`, getAuthHeaders());
      setZones(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchCompanies();
    fetchZones();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const key = name;
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  const handleCompanySelection = (companyId) => {
    const selectedCompanies = [...formData.companyId];
    const index = selectedCompanies.indexOf(companyId);
    if (index > -1) {
      selectedCompanies.splice(index, 1);
    } else {
      selectedCompanies.push(companyId);
    }
    setFormData({ ...formData, companyId: selectedCompanies });

    if (validationErrors.companyId) {
      setValidationErrors((prev) => ({
        ...prev,
        companyId: "",
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setValidationErrors({});
    setIsEditing(null);
    // setShowForm(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.branchName.trim()) {
      errors.branchName = "Branch name is required.";
    }

    if (!formData.companyId || formData.companyId.length === 0) {
      errors.companyId = "Please select at least one company.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix validation errors");
      return;
    }

    try {
      const selectedCompanyNames = companies
        .filter((c) => formData.companyId.includes(Number(c.id)))
        .map((c) => c.company_name)
        .join(",");

      const selectedZone = zones.find((z) => z.id === Number(formData.zone_id));

      const payload = {
        branch_name: formData.branchName,
        source: formData.source || "WEB",
        branch_code: "",
        company_name: selectedCompanyNames,
        company_id: formData.companyId.join(","),
        zone_id: formData.zone_id,
        zone_name: selectedZone ? selectedZone.zone_name : "",

        email: formData.email,
        address: formData.address,
        city: formData.areaName,
        pincode: formData.pincode,

        costing_method: formData.costingMethod,
        def_purchase_ac: formData.defPurchaseAccount,
        def_sales_ac: formData.defSalesAccount,
        def_branch_recv_ac: formData.defBranchRecvAccount,
        def_branch_desp_ac: formData.defBranchDispAccount,

        phone: formData.contactNo,
      };

      const url = isEditing
        ? `${API_URL}/api/branches/update/${isEditing.id}`
        : `${API_URL}/api/branches`;

      const method = "post";

      await api.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert(`Branch ${isEditing ? "updated" : "created"} successfully!`);

      resetForm();
      setShowForm(false);
      fetchBranches();
    } catch (err) {
      const msg = clientLogger.error("BranchPage.handleSubmit", err);
      alert(`❌ Save Failed:\n${msg}`);
    }
  };

  const handleEdit = (branch) => {
    setIsEditing(branch);

    setValidationErrors({});

    setFormData({
      branchName: branch.branch_name || "",
      source: branch.source || "WEB",
      areaName: branch.city || "",
      email: branch.email || "",
      costingMethod: branch.costing_method || "FIFO",

      defSalesAccount: branch.def_sales_ac || "",
      defBranchDispAccount: branch.def_branch_desp_ac || "",

      address: branch.address || "",
      pincode: branch.pincode || "",
      contactNo: branch.phone || "",

      defPurchaseAccount: branch.def_purchase_ac || "",
      defBranchRecvAccount: branch.def_branch_recv_ac || "",
      zone_id: branch.zone_id || "",

      companyId: branch.company_id
        ? branch.company_id.split(",").map(Number)
        : [],
    });

    // IMPORTANT
    setPincodeSearch(branch.pincode || "");

    setShowForm(true);
    setShowSearch(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await api.delete(`/api/branches/${id}`, getAuthHeaders());
        alert("Branch deleted successfully!");
        fetchBranches();
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          const msg = clientLogger.error("BranchPage.handleDelete", err);
          alert(`❌ Delete Failed:\n${msg}`);
        }
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Are you sure you want to restore this branch?")) {
      try {
        await api.put(`/api/branches/restore/${id}`, {}, getAuthHeaders());
        alert("Branch restored successfully!");
        fetchBranches();
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          const msg = clientLogger.error("BranchPage.handleRestore", err);
          alert(`❌ Restore Failed:\n${msg}`);
        }
      }
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchFields, dateFilter]);

  const handleSearch = () => fetchBranches();

  const resetSearch = () => {
    setSearchFields([{ field: "branchName", keyword: "" }]);
    setDateFilter({ from: "", to: "" });
    fetchBranches();
  };

  const handleDownloadExcel = async () => {
    try {
      const params = { active: activeStatus };
      const validSearch = searchFields.filter((f) => f.field && f.keyword);
      if (validSearch.length > 0)
        params.searchFields = JSON.stringify(validSearch);

      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      console.log(params);

      const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

      const response = await api.get(`${API_URL}/api/branches/export`, {
        params,
        responseType: "blob", // IMPORTANT
        ...getAuthHeaders(),
      });

      // Create Excel File
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Branches_${randomNumber}.xlsx`;
      link.click();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const msg = clientLogger.error("BranchPage.downloadExcel", error);
      alert(`❌ Excel Download Failed:\n${msg}`);
    }
  };

  if (branchesPerms.length <= 0) {
    refetch();
    return <LoadingScreen />;
  }

  return (
    <div
      className="page-container"
      style={{
        fontSize: "13px",
      }}
    >
      {/* Page Header — hides when form is open */}
      {!showForm && (
        <div className="page-header mb-3">
          <h1 className="page-title m-0">
            Branch Management{" "}
            <span className="text-success">({branches.length})</span>
          </h1>
          <div className="page-actions">
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaSearch /> {showSearch ? "Hide Search" : "Search"}
            </button>
            {branchesPerms?.add_access === 1 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  resetForm();
                  setShowSearch(false);
                  setShowForm(true);
                }}
              >
                <FaPlus /> Create New
              </button>
            )}
          </div>
        </div>
      )}

      {showSearch && (
        <SearchPanel
          searchFields={searchFields}
          setSearchFields={setSearchFields}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onSearch={handleSearch}
          onReset={resetSearch}
          onDownloadExcel={handleDownloadExcel}
          searchOptions={branchSearchOptions}
          showDownload={branchesPerms?.export_access === 1}
        />
      )}

      {showForm && (
        <Card className="shadow-sm border-0">
          <h2 className="page-title mb-3 p-3">
            {isEditing ? (
              <span>Edit Branch - {isEditing.branch_name}</span>
            ) : (
              "Create New Branch"
            )}
          </h2>
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="danger">
              Please fix the validation errors below.
            </Alert>
          )}
          <Card.Body>
            <Form className="branch-form master-form" onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="branchName">
                    <Form.Label>Branch Name *</Form.Label>
                    <Form.Control
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      placeholder="Enter Branch name"
                      isInvalid={!!validationErrors.branchName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.branchName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="zone_id">
                    <Form.Label>Zone</Form.Label>
                    <Form.Select
                      name="zone_id"
                      value={formData.zone_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Zone</option>
                      {zones
                        .filter((zone) => Number(zone.active) === 0)
                        .map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.zone_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="address">
                    <Form.Label>Address</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Pincode</Form.Label>

                    <div style={{ position: "relative" }} ref={pincodeRef}>
                      <Form.Control
                        value={pincodeSearch}
                        placeholder="Search Pincode..."
                        autoComplete="off"
                        onChange={(e) => {
                          setPincodeSearch(e.target.value);
                          setShowPincodeList(true);
                        }}
                        onFocus={() => setShowPincodeList(true)}
                      />

                      {showPincodeList && (
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            background: "#ffffe0",
                            border: "1px solid #ddd",
                            zIndex: 999,
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          {filteredPincodes.length > 0 ? (
                            filteredPincodes.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#f5f5f5")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.background = "#ffffe0")
                                }
                               
onClick={() => {
  const selectedPincode = String(item.pincode || "");
  const selectedCity = item.city_name || "";

  setFormData((prev) => ({
    ...prev,
    pincode: selectedPincode,
    areaName: selectedCity,
  }));

  setPincodeSearch(selectedPincode);
  setShowPincodeList(false);
}}
                              >
                                {item.pincode} - {item.city_name}
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: "8px" }}>
                              No pincode found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
                 <Form.Group controlId="areaName">
  <Form.Label>City</Form.Label>
  <Form.Control
    name="areaName"
    value={formData.areaName || ""}
    placeholder="Auto filled from pincode"
    readOnly
  />
</Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="email">
                    <Form.Label>Email ID</Form.Label>
                    <Form.Control
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email ID"
                      type="text"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="contactNo">
                    <Form.Label>Contact No</Form.Label>
                    <Form.Control
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={(e) => {
                        const value = e.target.value;

                        // allow only numbers
                        if (/^\d*$/.test(value)) {
                          handleInputChange(e);
                        }
                      }}
                      maxLength={10}
                      placeholder="Enter Contact No"
                      inputMode="numeric"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="costingMethod">
                    <Form.Label>Costing Method</Form.Label>
                    <Form.Select
                      name="costingMethod"
                      value={formData.costingMethod}
                      onChange={handleInputChange}
                    >
                      <option value="FIFO">FIFO</option>
                      <option value="LIFO">LIFO</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="defPurchaseAccount">
                    <Form.Label>Def. Purchase Account</Form.Label>
                    <Form.Control
                      name="defPurchaseAccount"
                      value={formData.defPurchaseAccount}
                      onChange={handleNumberOnly}
                      placeholder="Def. Purchase Account"
                      inputMode="numeric"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="defSalesAccount">
                    <Form.Label>Def. Sales Account</Form.Label>
                    <Form.Control
                      name="defSalesAccount"
                      value={formData.defSalesAccount}
                      onChange={handleNumberOnly}
                      placeholder="Def. Sales Account"
                      inputMode="numeric"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="defBranchRecvAccount">
                    <Form.Label>Def. Branch Recv. Account</Form.Label>
                    <Form.Control
                      name="defBranchRecvAccount"
                      value={formData.defBranchRecvAccount}
                      onChange={handleNumberOnly}
                      placeholder="Def. Branch Recv. Account"
                      inputMode="numeric"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3} className="mb-3">
                  <Form.Group controlId="defBranchDispAccount">
                    <Form.Label>Def. Branch Disp. Account</Form.Label>
                    <Form.Control
                      name="defBranchDispAccount"
                      value={formData.defBranchDispAccount}
                      onChange={handleNumberOnly}
                      placeholder="Def. Branch Disp. Account"
                      inputMode="numeric"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <hr />
              <div className="mb-3 branch-company-selection">
                <h4 className="fs-5">Select Company *</h4>

                {companies.filter(c => isItemActive(c.active)).length > 0 ? (
                  <div className="row">
                    {companies.filter(c => isItemActive(c.active)).map((company) => (
                      <div key={company.id} className="col-6 col-md-3 mb-2">
                        <Form.Check
                          type="checkbox"
                          id={`company-${company.id}`}
                          label={company.company_name}
                          checked={formData.companyId.includes(
                            Number(company.id),
                          )}
                          onChange={() =>
                            handleCompanySelection(Number(company.id))
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No Companies Found</p>
                )}

                {validationErrors.companyId && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.companyId}
                  </div>
                )}
              </div>

              <div className="form-actions d-flex justify-content-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={handleSubmit}>
                  {isEditing ? "Update Branch" : "Save Branch"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Branch List Table */}
      {!showForm && (
        <Card className="branch-card">
          <Card.Header style={{ background: "#fff", padding: "8px 16px", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", gap: "8px", minHeight: "44px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#888", marginRight: "4px" }}>Status:</span>
            {[{ label: "Active", value: 0 }, { label: "Inactive", value: 1 }].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveStatus(tab.value); setCurrentPage(1); }}
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
          {loading ? (
            // <Alert variant="warning" className="mb-0 text-center">
            //   Loading...
            // </Alert>
            <LoadingScreen />
          ) : error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
            <Table
              hover
              bordered
              responsive
              className="list-table"
              style={{ fontSize: "10.5px" }}
            >
              <thead className="table-secondary">
                <tr>
                  <th>Sr No</th>
                  <th>Branch Name</th>
                  <th>Area Name</th>
                  <th>Address</th>
                  <th>Zone Name</th>
                  <th>Pincode</th>
                  <th>Companies</th>

                  {/* ONE COLUMN */}
                  <th>Tracking Details</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
               
{currentBranches.length === 0 ? (
  <tr className="text-center">
    <td colSpan={9}>No data found</td>
  </tr>
) : (
  currentBranches.map((branch, index) => (

                    <tr key={branch.id}>
                      <td>{indexOfFirstItem + index + 1}</td>

                      <td>{branch.branch_name}</td>

                      <td>{branch.city || "-"}</td>

                      <td>{branch.address}</td>

                      <td>{branch.zone_name || "-"}</td>

                      <td>{branch.pincode}</td>

                      <td>{branch.company_name || "-"}</td>

                      {/* TRACKING */}
                        <td>
                          <AuditTrail 
                            createdOn={branch.created_on}
                            createdByName={branch.created_by_name}
                            modifiedOn={branch.modified_on}
                            modifiedByName={branch.modified_by_name}
                            disabledOn={branch.disabled_on}
                            disabledByName={branch.disabled_by_name}
                            isActive={activeStatus === 0}
                          />
                        </td>

                      <td>
                        {(() => {
                          const isCreatedBySuperAdmin =
                            Number(branch.created_by) === 1 ||
                            String(branch.created_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                            String(branch.created_by_name).trim().toUpperCase() === "SUPERADMIN";
                          const isLockedBySuperAdmin =
                            String(branch.superadmin_status) === "1" ||
                            Number(branch.disabled_by) === 1 ||
                            String(branch.disabled_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                            String(branch.disabled_by_name).trim().toUpperCase() === "SUPERADMIN";
                          const canModify = isSuperAdmin || !isCreatedBySuperAdmin;

                          return (
                            <Dropdown>
                              <Dropdown.Toggle variant="secondary" size="sm">
                                Actions
                              </Dropdown.Toggle>

                              <Dropdown.Menu
                                renderOnMount={true}
                                popperConfig={{ strategy: "fixed" }}
                              >
                                {activeStatus === 0 ? (
                                  <>
                                    {canModify && (isSuperAdmin || branchesPerms?.edit_access === 1) && (
                                      <Dropdown.Item onClick={() => handleEdit(branch)}>
                                        <FaPen className="me-2 text-primary" /> Edit
                                      </Dropdown.Item>
                                    )}

                                    {canModify && (isSuperAdmin || branchesPerms?.delete_access === 1) && (
                                      <Dropdown.Item
                                        onClick={() => handleDelete(branch.id)}
                                      >
                                        <FaTrashAlt className="me-2 text-danger" /> Delete
                                      </Dropdown.Item>
                                    )}

                                    {!canModify && (
                                      <Dropdown.Item disabled className="text-muted small">
                                        Protected (Created by Super Admin)
                                      </Dropdown.Item>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {(isSuperAdmin || (!isLockedBySuperAdmin && branchesPerms?.delete_access === 1)) && (
                                      <Dropdown.Item
                                        onClick={() => handleRestore(branch.id)}
                                      >
                                        <FaUndo className="me-2 text-success" /> Restore
                                      </Dropdown.Item>
                                    )}

                                    {isLockedBySuperAdmin && !isSuperAdmin && (
                                      <Dropdown.Item disabled className="text-muted small">
                                        Locked by Super Admin
                                      </Dropdown.Item>
                                    )}
                                  </>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
          <div className="d-flex justify-content-end mt-3">
            <ul className="pagination">
              {/* Prev */}
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </button>
              </li>

              {/* Pages */}
              {[...Array(totalPages)]
                .map((_, i) => i + 1)
                .filter((page) => {
                  let startPage = Math.max(1, currentPage - 1);
                  let endPage = startPage + 3;
                  if (endPage > totalPages) {
                    endPage = totalPages;
                    startPage = Math.max(1, endPage - 3);
                  }
                  return page >= startPage && page <= endPage;
                })
                .map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

              {/* Next */}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BranchPage;
