import React, { useState, useEffect, useRef, useMemo } from "react";

import api from "../../api/axios";
import clientLogger from "../../utils/clientLogger";
import LoadingScreen from "../../components/loader/LoadingScreen";
import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrashAlt,
  FaTimes,
  FaUndo,
} from "react-icons/fa";
import SearchPanel from "../../utils/FilterPanel";
import { useContext } from "react";
import { PermissionsContext } from "../../components/context/PermissionsContext";
const API_URL = import.meta.env.VITE_API_URL;
const IMG_URL = import.meta.env.VITE_FRONTEND_FOLDER ?? "";

import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Tab,
  Table,
  Tabs,
  Alert,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import JoditEditor from "jodit-react";
import Select from "react-select";
import AuditTrail from "../../components/common/AuditTrail";

const CompanyPage = () => {
  const { permissions, getPermissionsByModule, refetch } =
    useContext(PermissionsContext);
  const companyPerms = getPermissionsByModule("Companies");
  console.log("companyPerms", companyPerms);

  // Current logged-in user & superadmin detection
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const isSuperAdmin =
    currentUser?.is_superadmin === true ||
    Number(currentUser?.id) === 1 ||
    String(currentUser?.role).toUpperCase() === "SUPERADMIN" ||
    String(currentUser?.role).toUpperCase() === "SUPER ADMIN";

  const editor = useRef(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("companyDetails");
  // 0 = Active companies (default), 1 = Inactive companies
  const [activeStatus, setActiveStatus] = useState(0);
  const [pincodes, setPincodes] = useState([]);
  const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
  const [showPincodeList, setShowPincodeList] = useState(false);
  const config = useMemo(
    () => ({
      readonly: false,
      height: 300,
      placeholder: "Enter Terms & Conditions...",
    }),
    [],
  );
  const [validationErrors, setValidationErrors] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    companyName: "",
    source: "WEB",
    contactPersonName: "",
    emailId: "",
    address: "",
    country: "",
    regionState: "",
    city: "",
    pincode: "",
    stateCode: "",
    contactNo: "",
    gstNo: "",
    website: "",
    currency: "INR",
    financialYearFrom: new Date().getFullYear(),
    financialYearTo: new Date().getFullYear() + 1,
    cinNo: "",
    vatTin: "",
    cstTin: "",
    iec: "",
    invoicePrefix: "",
    termsAndCond: "",
  });

  // ================= YEAR ARRAY =================

  // ================= YEAR OPTIONS =================

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [bankDetails, setBankDetails] = useState([
    {
      bankName: "",
      accountNo: "",
      accountType: "",
      branchCity: "",
      address: "",
      swift: "",
      micr: "",
      ifsc: "",
    },
  ]);

  // ================= YEAR ARRAY =================

  const currentYear = new Date().getFullYear();

  const years = [];

  for (let year = 2000; year <= 2027; year++) {
    years.push(year);
  }

  const yearOptions = years.map((year) => ({
    value: year,
    label: year.toString(),
  }));
  // ================= HANDLE CHANGE =================
  // ==========================================
  // AUTO SELECT FY TO
  // ==========================================

  const handleFinancialYearFrom = (selectedOption) => {
    const fromYear = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,

      financialYearFrom: fromYear,

      financialYearTo: fromYear ? fromYear + 1 : "",
    }));
  };

  // ==========================================
  // HANDLE FY TO
  // ==========================================

  const handleFinancialYearTo = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,

      financialYearTo: selectedOption ? selectedOption.value : "",
    }));
  };

  // ==========================================
  // HANDLE FY TO
  // ==========================================

  const fetchPincodes = async () => {
    try {
      const res = await api.get(`${API_URL}/api/pincodes`, getAuthHeaders());

      setPincodes(res.data || []);
    } catch (err) {
      console.log("PINCODE ERROR:", err);
    }
  };
  const [searchFields, setSearchFields] = useState([
    { field: "companyName", keyword: "" },
  ]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const validSearch = searchFields.filter((f) => f.field && f.keyword);
      if (validSearch.length > 0)
        params.searchFields = JSON.stringify(validSearch);
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }
      const response = await api.get(`${API_URL}/api/companies`, {
        params,
        ...getAuthHeaders(),
      });
      setCompanies(response.data.data || []);
      console.log("companies data",response.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else
        setError(err.response?.data?.message || "Failed to fetch companies.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [companies]);

  useEffect(() => {
    fetchCompanies();
    fetchPincodes();
  }, [searchFields, dateFilter]);

  const handlePincodeChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (value.length === 0) {
      setPincodeSuggestions([]);
      setShowPincodeList(false);
      return;
    }

    const filtered = (pincodes || []).filter((p) =>
      String(p.pincode || "").startsWith(value),
    );

    setPincodeSuggestions(filtered.slice(0, 10)); // limit
    setShowPincodeList(true);
  };
  const handleSelectPincode = (p) => {
    console.log("PIN DATA =", p);

    setFormData((prev) => ({
      ...prev,
      pincode: p.pincode || "",
      city: p.city || p.city_name || "",
      regionState: p.state || p.state_name || "",
      stateCode: p.stateCode || p.state_code || "",
      country: p.country || p.country_name || p.country_code || "India",
    }));

    setShowPincodeList(false);
  };
  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const key = name;
    // if (validationErrors[key]) {
    //   setValidationErrors((prev) => ({
    //     ...prev,
    //     [key]: "",
    //   }));
    // }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    console.log("logoFile", logoFile);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBankChange = (index, e) => {
    const { name, value } = e.target;
    const updatedBanks = [...bankDetails];
    updatedBanks[index][name] = value;
    setBankDetails(updatedBanks);

    // Clear validation error on change
    if (validationErrors[`${name}_${index}`]) {
      setValidationErrors((prev) => ({
        ...prev,
        [`${name}_${index}`]: "",
      }));
    }
  };

  const addBankRow = () => {
    setBankDetails([
      ...bankDetails,
      {
        id: null, // New records get null ID
        bankName: "",
        accountNo: "",
        accountType: "",
        branchCity: "",
        address: "",
        swift: "",
        micr: "",
        ifsc: "",
      },
    ]);
  };

  const removeBankRow = (index) => {
    setBankDetails(bankDetails.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPersonName: "",
      emailId: "",
      address: "",
      country: "",
      regionState: "",
      city: "",
      pincode: "",
      stateCode: "",
      contactNo: "",
      gstNo: "",
      website: "",
      cinNo: "",
      vatTin: "",
      cstTin: "",
      iec: "",
      currency: "INR",
      financialYearFrom: new Date().getFullYear(),
      financialYearTo: new Date().getFullYear() + 1,
      invoicePrefix: "",
      termsAndCond: "",
    });
    setLogoFile(null);
    setLogoPreview(null);
    setBankDetails([
      {
        id: null,
        bankName: "",
        accountNo: "",
        accountType: "",
        branchCity: "",
        address: "",
        swift: "",
        micr: "",
        ifsc: "",
      },
    ]);
    setIsEditing(null);
    setValidationErrors({});
    // setShowForm(false);
    setActiveTab("companyDetails");
  };

  // Validation logic
  const validateForm = () => {
    let errors = {};

    if (!formData.companyName?.trim()) {
      errors.companyName = "Company Name is required";
    }

    if (!formData.emailId?.trim()) {
      errors.emailId = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailId)) {
        errors.emailId = "Invalid email format";
      }
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateBankDetails = () => {
    const errors = {};
    bankDetails.forEach((bank, idx) => {
      if (!bank.bankName || bank.bankName.trim() === "") {
        errors[`bankName_${idx}`] = "Bank name is required";
      }

      if (!bank.accountNo || bank.accountNo.trim() === "") {
        errors[`accountNo_${idx}`] = "Account number is required";
      } else if (!/^[0-9]{6,18}$/.test(bank.accountNo)) {
        errors[`accountNo_${idx}`] = "Account number must be 6-18 digits";
      }

      if (!bank.ifsc || bank.ifsc.trim() === "") {
        errors[`ifsc_${idx}`] = "IFSC code is required";
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifsc)) {
        errors[`ifsc_${idx}`] = "Invalid IFSC code";
      }
      if (bank.micr && !/^[0-9]{9}$/.test(bank.micr)) {
        errors[`micr_${idx}`] = "MICR Code must be 9 digits";
      }
      if (!bank.accountType) {
        errors[`accountType_${idx}`] = "Select Account Type";
      }
      if (!bank.branchCity || bank.branchCity.trim() === "") {
        errors[`branchCity_${idx}`] = "Branch City is required";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Validate bank details
    // Skip validation while editing
    // if (!isEditing) {
    //   if (!validateCompanyDetails() || !validateBankDetails()) {
    //     alert("Please fix validation errors");
    //     return;
    //   }
    // }

    try {
      console.log("=== COMPANY FORM DATA (SENDING TO BACKEND) ===", formData);
      const data = new FormData();

      // Company Data
      data.append("company_name", formData.companyName);
      data.append("email_id", formData.emailId);
      data.append("address", formData.address);
      data.append("phone", formData.contactNo);
      data.append("city", formData.city);
      data.append("country", formData.country);
      data.append("pincode", formData.pincode);
      data.append("state", formData.regionState);
      data.append("statecode", formData.stateCode);
      data.append("contactable_person", formData.contactPersonName);
      data.append("currency", formData.currency || "INR");
      data.append("fin_from", formData.financialYearFrom);

      data.append("fin_to", formData.financialYearTo);
      data.append("invoiceprefix", formData.invoicePrefix || "");
      data.append("gst_no", formData.gstNo);
      data.append("website", formData.website);
      data.append("cin_no", formData.cinNo);
      data.append("vat_tin", formData.vatTin);
      data.append("cst_tin", formData.cstTin);
      data.append("iec", formData.iec);
      data.append("terms", formData.termsAndCond);

      if (logoFile) {
        data.append("logo", logoFile);
      }
      if (isEditing && logoPreview) {
        let oldLogo = logoPreview?.includes("blob:") ? "" : logoPreview || "";
        // Strip any full URL — backend only needs relative path like company_logos/logo_xxx.jpg
        if (oldLogo && oldLogo.startsWith("http")) {
          try {
            const url = new URL(oldLogo);
            // Remove leading slash to get relative path
            oldLogo = url.pathname.replace(/^\/[^/]+\/api\//, "");
          } catch (e) {
            oldLogo = "";
          }
        }
        data.append("old_logo", oldLogo);
      }

      const config = {
        headers: {
          ...getAuthHeaders().headers,
        },
      };

      let companyId = null;

      // =========================
      // CREATE COMPANY
      // =========================
      if (!isEditing) {
        const response = await api.post(
          `${API_URL}/api/companies`,
          data,
          config,
        );

        companyId = response.data.company.id;
      }

      // =========================
      // UPDATE COMPANY
      // =========================
      else {
        await api.post(
          `${API_URL}/api/companies/update/${isEditing.id}`,
          data,
          config,
        );

        companyId = isEditing.id;
      }

      // =========================
      // SAVE / UPDATE BANK DETAILS
      // =========================
      // =========================
      // SAVE BANK DETAILS
      // =========================

      const validBanks = bankDetails.filter(
        (bank) =>
          bank.bankName?.trim() || bank.accountNo?.trim() || bank.ifsc?.trim(),
      );

      await api.post(
        `${API_URL}/api/companies/${companyId}/bank-details`,
        validBanks.map((bank) => ({
          id: bank.id,
          bank_name: bank.bankName,
          ac_no: bank.accountNo,
          ac_type: bank.accountType,
          branch_city: bank.branchCity,
          branch_address: bank.address,
          swift_ac_no: bank.swift,
          micr_no: bank.micr,
          ifsc_code: bank.ifsc,
        })),
        getAuthHeaders(),
      );

      alert(
        isEditing
          ? "Company updated successfully"
          : "Company created successfully",
      );

      resetForm();
      setShowForm(false);
      fetchCompanies();
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const fetchBankDetails = async (companyId) => {
    try {
      const response = await api.get(
        `${API_URL}/api/companies/${companyId}/bank-details`,
        getAuthHeaders(),
      );

      if (response.data.success) {
        const banks = response.data.data;

        if (banks.length > 0) {
          setBankDetails(
            banks.map((bank) => ({
              id: bank.id,
              bankName: bank.bank_name || "",
              accountNo: bank.ac_no || "",
              accountType: bank.ac_type || "",
              branchCity: bank.branch_city || "",
              address: bank.branch_address || "",
              swift: bank.swift_ac_no || "",
              micr: bank.micr_no || "",
              ifsc: bank.ifsc_code || "",
            })),
          );
        }
      }
    } catch (error) {
      console.log("BANK DETAILS ERROR", error);
    }
  };

  // HANDLE EDIT
  const handleEdit = async (company) => {
    console.log("EDIT COMPANY =", company);
    console.log(API_URL + company?.logo?.trim());
    setIsEditing(company);

    setFormData({
      companyName: company.company_name || "",
      source: company.source || "WEB",
      contactPersonName: company.contactable_person || "",
      emailId: company.email_id || "",
      address: company.address || "",
      country: company.country || "",
      regionState: company.state || "",
      city: company.city || "",
      pincode: company.pincode || "",
      stateCode: company.statecode || "",
      contactNo: company.phone || "",
      gstNo: company.gst_no || "",
      website: company.website || "",
      currency: company.currency || "INR",
      financialYearFrom: company.fin_from || "",
      financialYearTo: company.fin_to || "",
      cinNo: company.cin_no || "",
      vatTin: company.vat_tin || "",
      cstTin: company.cst_tin || "",
      iec: company.iec || "",
      invoicePrefix: company.invoiceprefix || "",
      termsAndCond:
        company.terms ||
        company.terms_and_condition ||
        company.terms_conditions ||
        "",
    });
    console.log("COMPANY EDIT DATA =", company);
    // LOGO PREVIEW
    // Prepend API_URL if it's a relative path (e.g., /uploads/...)
    setLogoPreview(
      company.logo
        ? company.logo.startsWith("http") || company.logo.startsWith("blob:")
          ? company.logo
          : `${API_URL}${company.logo}`
        : "",
    );

    // FETCH BANK DETAILS
    await fetchBankDetails(company.id);

    setShowForm(true);
    setShowSearch(false);
    setActiveTab("companyDetails");
  };
  // console.log("IMG_URL", IMG_URL);
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await api.delete(`/api/companies/${id}`, getAuthHeaders());
        alert("Company deleted successfully!");
        fetchCompanies(); // refresh the list
      } catch (e) {
        if (e.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          const msg = clientLogger.error("CompanyPage.handleDelete", e);
          alert(`❌ Delete Failed:\n${msg}`);
        }
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Are you sure you want to restore this company?")) {
      try {
        await api.put(`/api/companies/restore/${id}`, {}, getAuthHeaders());
        alert("Company restored successfully!");
        fetchCompanies();
      } catch (e) {
        if (e.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          const msg = clientLogger.error("CompanyPage.handleRestore", e);
          alert(`❌ Restore Failed:\n${msg}`);
        }
      }
    }
  };

  const handleSearch = () => fetchCompanies();
  const handleReset = () => {
    setSearchFields([{ field: "companyName", keyword: "" }]);
    setDateFilter({ from: "", to: "" });
    // Do NOT call fetchCompanies() here; let the useEffect handle it.
    setCurrentPage(1);
  };


const handleDownloadExcel = async () => {
  try {
    const params = {};

    const validSearch = searchFields.filter(
      (f) => f.field && f.keyword
    );

    if (validSearch.length > 0) {
      params.searchFields = JSON.stringify(validSearch);
    }

    if (dateFilter.from && dateFilter.to) {
      params.fromDate = dateFilter.from;
      params.toDate = dateFilter.to;
    }

    // Active tab = 0, Inactive tab = 1
    params.active = activeStatus;

    const randomNumber = Math.floor(
      1000000000 + Math.random() * 9000000000
    );

    const response = await api.get(
      `${API_URL}/api/companies/export`,
      {
        params,
        responseType: "blob",
        ...getAuthHeaders(),
      }
    );

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);

    const statusName =
      activeStatus === 0 ? "Active" : "Inactive";

    link.download = `Companies_${statusName}_${randomNumber}.xlsx`;

    link.click();

    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    const msg = clientLogger.error(
      "CompanyPage.downloadExcel",
      error
    );

    alert(`Excel Download Failed:\n${msg}`);
  }
};


  const searchOptions = [
    { value: "companyName", label: "Company Name" },
    { value: "contactPerson", label: "Contact Person" },
    { value: "email", label: "Email ID" },
    { value: "city", label: "City" },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const isItemActive = (val) => {
    if (val === undefined || val === null) return true;
    const s = String(val).trim();
    return s === "0" || s === "";
  };

  const activeCount = companies.filter((c) => isItemActive(c.active)).length;
  const inactiveCount = companies.filter((c) => !isItemActive(c.active)).length;
  const filteredCompanies = companies.filter((c) =>
    activeStatus === 0 ? isItemActive(c.active) : !isItemActive(c.active),
  );

  const currentCompanies = filteredCompanies.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / itemsPerPage),
  );

  if (companyPerms.length <= 0) {
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
      {/* Header — hides when form is open */}
      {!showForm && (
        <div className="page-header mb-3">
          <h3 className="page-title m-0">
            Company Management{" "}
            <span className="text-success">({companies.length})</span>
          </h3>
          <div className="page-actions">
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaSearch /> {showSearch ? "Hide Search" : "Search"}
            </button>
            {companyPerms?.add_access === 1 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                  setShowSearch(false);
                }}
              >
                <FaPlus /> Create New
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <SearchPanel
          searchFields={searchFields}
          setSearchFields={setSearchFields}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onSearch={handleSearch}
          onReset={handleReset}
          onDownloadExcel={handleDownloadExcel}
          searchOptions={searchOptions}
          showDownload={companyPerms?.export_access === 1}
        />
      )}

      {/* Form */}
      {showForm && (
        <Card className="shadow-sm border-0">
          <h2 className="page-title mb-3 p-3">
            {isEditing
              ? `Edit Company - ${isEditing.company_name || ""}`
              : "Create New Company"}
          </h2>

          <Card.Body>
            <Form onSubmit={handleSubmit} className="master-form">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                fill
                className="mb-4"
              >
                {/* ===================================================== */}
                {/* COMPANY DETAILS */}
                {/* ===================================================== */}
                <Tab eventKey="companyDetails" title="Company Details">
                  <Row className="g-4">
                    {/* Company Name */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Company Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="companyName"
                          value={formData.companyName || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^A-Za-z\s]/g,
                              "",
                            );

                            setFormData({
                              ...formData,
                              companyName: value,
                            });
                          }}
                          placeholder="Enter Company Name"
                          isInvalid={!!validationErrors.companyName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.companyName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Email */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="emailId"
                          value={formData.emailId || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Email"
                          isInvalid={!!validationErrors.emailId}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.emailId}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Contact No */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Contact No</Form.Label>
                        <Form.Control
                          type="text"
                          name="contactNo"
                          value={formData.contactNo || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // फक्त numbers
                            if (value.length <= 10) {
                              setFormData({
                                ...formData,
                                contactNo: value,
                              });
                            }
                          }}
                          placeholder="Enter Contact No"
                          maxLength={10}
                        />
                      </Form.Group>
                    </Col>

                    {/* Contact Person */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Contact Person</Form.Label>
                        <Form.Control
                          type="text"
                          name="contactPersonName"
                          value={formData.contactPersonName || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^A-Za-z\s]/g,
                              "",
                            );
                            setFormData({
                              ...formData,
                              contactPersonName: value,
                            });
                          }}
                          placeholder="Enter Contact Person"
                        />
                      </Form.Group>
                    </Col>

                    {/* Address */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Address"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Pincode</Form.Label>

                        <div style={{ position: "relative" }}>
                          <Form.Control
                            type="text"
                            name="pincode"
                            value={formData.pincode || ""}
                            onChange={(e) => {
                              // Only numbers + max 6 digits
                              const value = e.target.value
                                .replace(/\D/g, "") // remove non-numbers
                                .slice(0, 6); // limit to 6 digits

                              handlePincodeChange({
                                target: {
                                  name: "pincode",
                                  value,
                                },
                              });
                            }}
                            placeholder="Enter Pincode"
                            autoComplete="off"
                            maxLength={6}
                          />

                          {showPincodeList && pincodeSuggestions.length > 0 && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                background: "#ffffe0",
                                border: "1px solid #ddd",
                                zIndex: 9999,
                                maxHeight: "200px",
                                overflowY: "auto",
                                backgroundColor: "lightyellow",
                              }}
                            >
                              {pincodeSuggestions.map((p, i) => (
                                <div
                                  key={i}
                                  onClick={() => handleSelectPincode(p)}
                                  style={{
                                    padding: "8px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #eee",
                                  }}
                                  onMouseOver={(e) =>
                                    (e.currentTarget.style.background =
                                      "#f5f5f5")
                                  }
                                  onMouseOut={(e) =>
                                    (e.currentTarget.style.background =
                                      "#ffffe0")
                                  }
                                >
                                  <b>{p.pincode}</b> - {p.city_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    {/* City */}
                    {/* City */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city || ""}
                          onChange={handleInputChange}
                          placeholder="Enter City"
                        />
                      </Form.Group>
                    </Col>

                    {/* State */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="regionState"
                          value={formData.regionState || ""}
                          onChange={handleInputChange}
                          placeholder="Enter State"
                        />
                      </Form.Group>
                    </Col>

                    {/* Country */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={formData.country || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Country"
                        />
                      </Form.Group>
                    </Col>

                    {/* Pincode */}

                    {/* GST No */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>GST No</Form.Label>

                        <Form.Control
                          type="text"
                          name="gstNo"
                          value={formData.gstNo || ""}
                          onChange={(e) => {
                            // Uppercase + max 15 characters
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "") // only letters & numbers
                              .slice(0, 15); // GST limit

                            setFormData({
                              ...formData,
                              gstNo: value,
                            });
                          }}
                          placeholder="Enter GST No"
                          maxLength={15}
                          style={{ textTransform: "uppercase" }}
                        />
                      </Form.Group>
                    </Col>

                    {/* State Code */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>State Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="stateCode"
                          value={formData.stateCode || ""}
                          onChange={handleInputChange}
                          placeholder="Enter State Code"
                        />
                      </Form.Group>
                    </Col>
                    {/* CIN */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>CIN No</Form.Label>

                        <Form.Control
                          type="text"
                          name="cinNo"
                          value={formData.cinNo || ""}
                          onChange={(e) => {
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "") // only letters & numbers
                              .slice(0, 21); // max 21 chars

                            setFormData({
                              ...formData,
                              cinNo: value,
                            });
                          }}
                          placeholder="Enter CIN No"
                          maxLength={21}
                          style={{ textTransform: "uppercase" }}
                        />
                      </Form.Group>
                    </Col>

                    {/* IEC */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>IEC</Form.Label>

                        <Form.Control
                          type="text"
                          name="iec"
                          value={formData.iec || ""}
                       onChange={(e) => {
  const value = e.target.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

  setFormData((prev) => ({
    ...prev,
    iec: value,
  }));
}}
                          placeholder="Enter IEC"
                          maxLength={10}
                        />
                      </Form.Group>
                    </Col>

                    {/* VAT TIN */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>VAT TIN</Form.Label>

                        <Form.Control
                          type="text"
                          name="vatTin"
                          value={formData.vatTin || ""}
                          onChange={(e) => {
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "") // only letters & numbers
                              .slice(0, 15); // max 15 chars

                            setFormData({
                              ...formData,
                              vatTin: value,
                            });
                          }}
                          placeholder="Enter VAT TIN"
                          maxLength={15}
                          style={{ textTransform: "uppercase" }}
                        />
                      </Form.Group>
                    </Col>

                    {/* CST TIN */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>CST TIN</Form.Label>
                        <Form.Control
                          type="text"
                          name="cstTin"
                          value={formData.cstTin || ""}
                          maxLength={15}
                          onChange={(e) => {
  const value = e.target.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 15);

  setFormData((prev) => ({
    ...prev,
    cstTin: value,
  }));
}}
                          placeholder="Enter CST TIN"
                        />
                      </Form.Group>
                    </Col>

                    {/* ==========================================
    Financial Year From
========================================== */}

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Financial Year From</Form.Label>

                        <Select
                          options={yearOptions}
                          value={
                            yearOptions.find(
                              (item) =>
                                item.value ===
                                Number(formData.financialYearFrom),
                            ) || null
                          }
                          onChange={handleFinancialYearFrom}
                          placeholder="Search FY From"
                          isClearable
                          isSearchable
                        />
                      </Form.Group>
                    </Col>

                    {/* ==========================================
    Financial Year To
========================================== */}

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Financial Year To</Form.Label>

                        <Select
                          options={yearOptions}
                          value={
                            yearOptions.find(
                              (item) =>
                                item.value === Number(formData.financialYearTo),
                            ) || null
                          }
                          onChange={handleFinancialYearTo}
                          placeholder="Search FY To"
                          isClearable
                          isSearchable
                        />
                      </Form.Group>
                    </Col>

                    {/* Invoice Prefix */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Invoice Prefix</Form.Label>

                        <Form.Control
                          type="text"
                          name="invoicePrefix"
                          value={formData.invoicePrefix || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Invoice Prefix"
                          autoComplete="off"
                          maxLength={10}
                          style={{
                            textTransform: "uppercase",
                          }}
                        />

                        <small className="text-muted">
                          Example: INV, ODS, BILL
                        </small>
                      </Form.Group>
                    </Col>

                    {/* Website */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Website</Form.Label>
                        <Form.Control
                          type="text"
                          name="website"
                          value={formData.website || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Website"
                        />
                      </Form.Group>
                    </Col>

                    {/* Currency */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Currency</Form.Label>
                        <Form.Select
                          name="currency"
                          value={formData.currency || "INR"}
                          onChange={handleInputChange}
                        >
                          <option value="INR">INR</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Logo */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Company Logo</Form.Label>
                        <Form.Control
                          type="file"
                          name="logo"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {isEditing && logoPreview && !logoFile && (
                          <Form.Text className="text-muted">
                            (File already uploaded)
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>

                    {logoPreview && (
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Logo Preview</Form.Label>

                          <div className="mt-2">
                            <img
                              src={logoPreview}
                              alt="Company Logo"
                              crossOrigin="anonymous"
                              onLoad={() => clientLogger.success(logoPreview)}
                              onError={(e) => {
                                clientLogger.imgError(
                                  "CompanyPage.LogoPreview",
                                  logoPreview,
                                );
                                e.target.src =
                                  "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                              }}
                              style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "10px",
                                objectFit: "cover",
                                border: "1px solid #ddd",
                                padding: "4px",
                                background: "#fff",
                                display: "block",
                              }}
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    )}

                    {/* Terms */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Terms & Conditions</Form.Label>

                        <JoditEditor
                          ref={editor}
                          value={formData.termsAndCond || ""}
                          config={config}
                          onBlur={(content) => {
                            setFormData((prev) => ({
                              ...prev,
                              termsAndCond: content,
                            }));
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* BUTTONS */}
                  <div className="d-flex justify-content-center gap-3 mt-5">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        resetForm();
                        setShowForm(false);
                      }}
                    >
                      Cancel
                    </Button>

                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => setActiveTab("bankDetails")}
                        >
                          Next → Bank Details
                        </Button>
                        <Button type="submit" variant="success">
                          Update Company
                        </Button>
                      </>
                    ) : (
                      <Button type="submit" variant="success">
                        Create Company
                      </Button>
                    )}
                  </div>
                </Tab>

                {/* ===================================================== */}
                {/* BANK DETAILS */}
                {/* ===================================================== */}
                {isEditing && (
                  <Tab eventKey="bankDetails" title="Bank Details">
                    <Table bordered responsive hover>
                      <thead className="table-dark">
                        <tr>
                          <th>Bank Name</th>
                          <th>Account No</th>
                          <th>Type</th>
                          <th>Branch</th>
                          <th>Address</th>
                          <th>SWIFT</th>
                          <th>MICR</th>
                          <th>IFSC</th>
                          <th>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={addBankRow}
                            >
                              <FaPlus />
                            </Button>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {bankDetails.map((b, i) => (
                          <tr key={i}>
                            <td>
                              <Form.Control
                                name="bankName"
                                value={b.bankName || ""}
                                onChange={(e) => handleBankChange(i, e)}
                                isInvalid={!!validationErrors[`bankName_${i}`]}
                              />
                              <Form.Control.Feedback type="invalid">
                                {validationErrors[`bankName_${i}`]}
                              </Form.Control.Feedback>
                            </td>

                            <td>
                              <Form.Control
                                type="text"
                                name="accountNo"
                                value={b.accountNo || ""}
                                onChange={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  handleBankChange(i, e);
                                }}
                                maxLength={20} // आवश्यक असल्यास limit बदला
                                isInvalid={!!validationErrors[`accountNo_${i}`]}
                              />
                              <Form.Control.Feedback type="invalid">
                                {validationErrors[`accountNo_${i}`]}
                              </Form.Control.Feedback>
                            </td>

                            <td>
                              <Form.Select
                                name="accountType"
                                value={b.accountType || ""}
                                onChange={(e) => handleBankChange(i, e)}
                              >
                                <option value="">Select</option>
                                <option value="SAVINGS">Savings</option>
                                <option value="CURRENT">Current</option>
                                <option value="SALARY">Salary</option>
                              </Form.Select>
                            </td>

                            <td>
                              <Form.Control
                                name="branchCity"
                                value={b.branchCity || ""}
                                onChange={(e) => handleBankChange(i, e)}
                              />
                            </td>

                            <td>
                              <Form.Control
                                as="textarea"
                                rows={1}
                                name="address"
                                value={b.address || ""}
                                onChange={(e) => handleBankChange(i, e)}
                              />
                            </td>

                            <td>
                              <Form.Control
                                name="swift"
                                value={b.swift || ""}
                                onChange={(e) => {
                                  e.target.value = e.target.value
                                    .replace(/[^A-Za-z0-9]/g, "")
                                    .toUpperCase();
                                  handleBankChange(i, e);
                                }}
                              />
                            </td>

                            <td>
                              <Form.Control
                                name="micr"
                                value={b.micr || ""}
                                onChange={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  handleBankChange(i, e);
                                }}
                                maxLength={9}
                              />
                            </td>

                            <td>
                              <Form.Control
                                name="ifsc"
                                value={b.ifsc || ""}
                                onChange={(e) => {
                                  e.target.value = e.target.value
                                    .replace(/[^A-Za-z0-9]/g, "")
                                    .toUpperCase();
                                  handleBankChange(i, e);
                                }}
                                isInvalid={!!validationErrors[`ifsc_${i}`]}
                              />
                              <Form.Control.Feedback type="invalid">
                                {validationErrors[`ifsc_${i}`]}
                              </Form.Control.Feedback>
                            </td>

                            <td className="text-center">
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => removeBankRow(i)}
                              >
                                <FaTimes />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* BUTTONS */}
                    <div className="d-flex justify-content-center gap-3 mt-4">
                      <Button
                        variant="outline-secondary"
                        onClick={() => setActiveTab("companyDetails")}
                      >
                        Previous
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => {
                          resetForm();
                          setShowForm(false);
                        }}
                      >
                        Cancel
                      </Button>

                      <Button type="submit" variant="primary">
                        Update Company
                      </Button>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Company List Table */}
      {!showForm && (
        <Card>
          {/* ── Active / Inactive pill tabs ── */}
          <Card.Header
            style={{
              background: "#fff",
              padding: "8px 16px",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#888",
                marginRight: "4px",
              }}
            >
              Status:
            </span>
            {[
              { label: "Active", value: 0 },
              { label: "Inactive", value: 1 },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveStatus(tab.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "3px 16px",
                  borderRadius: "20px",
                  border: "1.5px solid",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  lineHeight: "1.6",
                  borderColor:
                    activeStatus === tab.value
                      ? tab.value === 0
                        ? "#28a745"
                        : "#dc3545"
                      : "#ccc",
                  backgroundColor:
                    activeStatus === tab.value
                      ? tab.value === 0
                        ? "#28a745"
                        : "#dc3545"
                      : "#fff",
                  color: activeStatus === tab.value ? "#fff" : "#666",
                }}
              >
                {tab.label} ({tab.value === 0 ? activeCount : inactiveCount})
              </button>
            ))}
          </Card.Header>

          {loading ? (
            <LoadingScreen />
          ) : error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
            <Table
              bordered
              hover
              responsive
              className="list-table"
              style={{ fontSize: "11px" }}
            >
              <thead className="table-secondary">
                <tr>
                  <th>SR</th>
                  <th>Logo</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Tracking Details</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {companies.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={9}>No data found</td>
                  </tr>
                ) : (
                  currentCompanies.map((company, index) => (
                    <tr key={company.id}>
                      {/* SR */}
                      <td>{indexOfFirstItem + index + 1}</td>

                      {/* LOGO */}
                      <td>
                        <img
                          src={company.logo || ""}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                          }}
                        />
                      </td>

                      {/* COMPANY NAME */}
                      <td>{company.company_name || "-"}</td>

                      {/* CONTACT PERSON */}
                      <td>{company.contactable_person || "-"}</td>

                      {/* EMAIL */}
                      <td>{company.email_id || "-"}</td>

                      {/* PHONE */}
                      <td>{company.phone || "-"}</td>

                      {/* CITY */}
                      <td>{company.city || "-"}</td>

                      {/* TRACKING DETAILS */}
                      <td>
                        <AuditTrail
                          createdOn={company.created_on}
                          createdByName={company.created_by_name}
                          modifiedOn={company.modified_on}
                          modifiedByName={company.modified_by_name}
                          disabledOn={company.disabled_on}
                          disabledByName={company.disabled_by_name}
                          isActive={activeStatus === 0}
                        />
                      </td>
                      {/* ACTION */}
                      <td>
                        {(() => {
                          const isCreatedBySuperAdmin =
                            Number(company.created_by) === 1 ||
                            String(company.created_by_name).trim().toUpperCase() === "SUPERADMIN" ||
                            String(company.created_by_name).trim().toUpperCase() === "SUPER ADMIN";
                          const isLockedBySuperAdmin =
                            String(company.superadmin_status) === "1" ||
                            Number(company.disabled_by) === 1 ||
                            String(company.disabled_by_name).trim().toUpperCase() === "SUPERADMIN" ||
                            String(company.disabled_by_name).trim().toUpperCase() === "SUPER ADMIN";

                          // Non-superadmins cannot modify records created by Superadmin
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
                                    {/* EDIT */}
                                    {canModify && (isSuperAdmin || companyPerms?.edit_access === 1) && (
                                      <Dropdown.Item
                                        onClick={() => handleEdit(company)}
                                      >
                                        <FaPen className="me-2 text-primary" />
                                        Edit
                                      </Dropdown.Item>
                                    )}

                                    {/* DELETE */}
                                    {canModify && (isSuperAdmin || companyPerms?.delete_access === 1) && (
                                      <Dropdown.Item
                                        onClick={() => handleDelete(company.id)}
                                      >
                                        <FaTrashAlt className="me-2 text-danger" />
                                        Delete
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
                                    {/* RESTORE */}
                                    {(isSuperAdmin || (!isLockedBySuperAdmin && companyPerms?.delete_access === 1)) && (
                                      <Dropdown.Item
                                        onClick={() => handleRestore(company.id)}
                                      >
                                        <FaUndo className="me-2 text-success" />
                                        Restore
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
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              />

              {totalPages > 1 &&
                [...Array(totalPages)]
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
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  ))}

              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              />
            </Pagination>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CompanyPage;
