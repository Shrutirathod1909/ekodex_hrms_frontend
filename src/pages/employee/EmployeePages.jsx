  import React, { useState, useEffect } from "react";
  import * as XLSX from "xlsx";
  import EmployeeTable from "../../components/employee/employeePage/EmployeeTable";
  import FilterPanel from "../../utils/FilterPanel";
  import { useLocation } from "react-router-dom";
  import { useContext } from "react";
  import { PermissionsContext } from "../../components/context/PermissionsContext";

  import AddEmployee from "../../components/employee/employeePage/AddEmployee";
  import { FaMinus, FaPlus, FaSearch } from "react-icons/fa";
  import { Alert, Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
  import LoadingScreen from "../../components/loader/LoadingScreen";
  import api from "../../api/axios";
  const API_URL = import.meta.env.VITE_API_URL;
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const EmployeePages = () => {
    const { getPermissionsByModule } = useContext(PermissionsContext);

  const employeePerms = getPermissionsByModule("Employee");

  const canAdd = Number(employeePerms?.add_access) === 1;
  const canExport = Number(employeePerms?.export_access) === 1;
    const [showSiteErrorModal, setShowSiteErrorModal] = useState(false);
    const [siteErrors, setSiteErrors] = useState([]);
  const [showBulkUploadErrorModal, setShowBulkUploadErrorModal] =
    useState(false);

  const [bulkUploadErrors, setBulkUploadErrors] = useState([]);
    const [disabledEmployees, setDisabledEmployees] = useState([]);
    const [showDisabledList, setShowDisabledList] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [workingCount, setWorkingCount] = useState(0);
    const [leftCount, setLeftCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
    const [changeEmployeeStatus, setChangeEmployeeStatus] = useState(null);
    // Employee Site Bulk Update
    const [showSiteBulkUpdate, setShowSiteBulkUpdate] = useState(false);
    const [selectedSiteUpdateFile, setSelectedSiteUpdateFile] = useState(null);

    const [siteUpdateErrMsg, setSiteUpdateErrMsg] = useState("");
    const [siteUpdateSucMsg, setSiteUpdateSucMsg] = useState("");

    const [showSiteUpdateErr, setShowSiteUpdateErr] = useState(false);
    // Search and filter states
    const [searchFields, setSearchFields] = useState([
      { field: "", keyword: "" },
    ]);
    const debouncedSearchFields = useDebounce(searchFields, 400);
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
    const debouncedDateFilter = useDebounce(dateFilter, 400);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const location = useLocation();

    // const onVerificationClick = (emp, type) => {
    //   setSelectedEmployee(emp);

    //   if (type === "verified") {
    //     setShowVerifiedModal(true);
    //   } else {
    //     setShowVerificationModal(true);
    //   }
    // };
    // Bulk upload states
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [showBulkUploadErr, setShowBulkUploadErr] = useState(false);
    const [showBulkUpdateErr, setShowBulkUpdateErr] = useState(false);
    const [showPanUpdate, setShowPanUpdate] = useState(false);
    const [selectedBulkUploadFile, setSelectedBulkUploadFile] = useState(null);
    const [selectedUpdateFile, setSelectedUpdateFile] = useState(null);
    const [bulkUploadErrMsg, setBulkUploadErrMsg] = useState("");
    const [bulkUploadSucMsg, setBulkUploadSucMsg] = useState("");
    const [bulkUpdateErrMsg, setBulkUpdateErrMsg] = useState("");
    const [bulkUpdateSucMsg, setBulkUpdateSucMsg] = useState("");
    const [activeTab, setActiveTab] = useState(
      location.state?.activeTab || "Pending",
    );
    const [activeStatus, setActiveStatus] = useState(0);

    const [pendingCount, setPendingCount] = useState(0);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const [offerCount, setOfferCount] = useState(0);
    // Search options
    const [site, setSite] = useState([]);
    const [companies, setCompanies] = useState([]);
const [branches, setBranches] = useState([]);
const [selectedCompany, setSelectedCompany] = useState("");
const [selectedBranch, setSelectedBranch] = useState("");
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [reportingManagers, setReportingManagers] = useState([]);
    const searchOptions = [
      { value: "", label: "Global Search" },

      { value: "employeeCode", label: "Employee Code" },
      { value: "client_code", label: "Client Code" },
      { value: "client_name", label: "Client Name" },
      { value: "firstName", label: "First Name" },
      { value: "lastName", label: "Last Name" },
      { value: "emailId", label: "Email ID" },
      { value: "designation", label: "Designation" },
      { value: "department", label: "Department" },
      { value: "panCardNo", label: "PAN Card No" },
      { value: "uanNo", label: "UAN No" },
      { value: "esisNo", label: "ESIC No" },
    ];

    const handleSiteUpdateFileChange = (e) => {
      setSiteUpdateErrMsg("");
      setSiteUpdateSucMsg("");
      setShowSiteUpdateErr(false);

      setSelectedSiteUpdateFile(e.target.files[0]);
    };

    const handleSiteBulkUpload = async () => {
      if (!selectedSiteUpdateFile) {
        setSiteUpdateErrMsg("Please select file");
        return;
      }

      setSiteUpdateErrMsg("Uploading...");

      const formData = new FormData();
      formData.append("file", selectedSiteUpdateFile);

      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `${API_URL}/api/employees-site/site-bulk-upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        const result = await response.json();

        if (response.ok) {
          setSiteUpdateSucMsg(result.message);
          setSiteUpdateErrMsg("");

          fetchEmployees();
        } else {
          setSiteUpdateSucMsg("");
          setSiteUpdateErrMsg(result.message || "Upload failed");
        }
      } catch (err) {
        setSiteUpdateErrMsg("Upload failed");
      }
    };
    useEffect(() => {
      if (location.state?.activeTab) {
        setActiveTab(location.state.activeTab);
      }
    }, [location.state]);

const handleVerifySiteBulkUpload = async () => {
  setSiteUpdateErrMsg("Verifying...");
  setSiteUpdateSucMsg("");
  setSiteErrors([]);

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API_URL}/api/employees-site/verify-site-bulk-upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setSiteUpdateErrMsg(
        result.message || "Verification failed"
      );
      return;
    }

    setSiteUpdateErrMsg("");

    if (result.errors?.length > 0) {
      setSiteErrors(result.errors);
      setShowSiteErrorModal(true);

      setSiteUpdateSucMsg(
        `${result.errors.length} rows have errors`
      );
    } else {
      setSiteUpdateSucMsg(
        result.message || "Site verification completed successfully"
      );
      setShowSiteErrorModal(false);
    }

    fetchEmployees();
  } catch (err) {
    console.error("Verify site bulk upload error:", err);
    setSiteUpdateErrMsg("Verification failed");
  }
};
    // const handleDownloadSiteTemplate = async () => {
    //   try {
    //     const token = localStorage.getItem("token");

    //     const response = await fetch(
    //       `${API_URL}/api/employees-site/site-update-template`,
    //       {
    //         method: "GET",
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       },
    //     );

    //     console.log(response.status);
    //     console.log(response.headers.get("content-type"));

    //     if (!response.ok) {
    //       const text = await response.text();
    //       console.log(text);
    //       return;
    //     }

    //     const blob = await response.blob();

    //     const url = window.URL.createObjectURL(blob);

    //     const a = document.createElement("a");

    //     a.href = url;
    //     a.download = "EmployeeSiteUpdateTemplate.csv";

    //     document.body.appendChild(a);

    //     a.click();

    //     a.remove();

    //     window.URL.revokeObjectURL(url);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };

const handleDownloadSiteTemplate = () => {
  const data = [
    {
      employee_code: "",
      employee_name: "",
      client_code: "",
      site_name: "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "EmployeeSiteUpdate"
  );

  XLSX.writeFile(workbook, "EmployeeSiteUpdateTemplate.csv");
};

    const isItemActive = (val) => {
      if (val === undefined || val === null) return true;
      const s = String(val).trim();
      return s === "0" || s === "false" || s === "";
    };

    const activeCount = employees.filter((emp) =>
      isItemActive(emp.active),
    ).length;
    const inactiveCount = employees.filter(
      (emp) => !isItemActive(emp.active),
    ).length;

    const statusFilteredEmployees = employees.filter((emp) => {
      return activeStatus === 0
        ? isItemActive(emp.active)
        : !isItemActive(emp.active);
    });

const getStageProps = (stage) => {
  const normalized = String(stage ?? "")
    .trim()
    .toUpperCase();

  const isOffer = normalized === "OFFER LETTER ISSUED";

  const isPending = normalized === "PENDING";

  const isVerified = [
    "VERIFIED",
    "READYTOJOIN",
    "ON HOLD",
    "REJECT",
    "REJECTED",
  ].includes(normalized);

  return { isOffer, isPending, isVerified };
};

    const dynamicPendingCount = statusFilteredEmployees.filter(
      (emp) => getStageProps(emp.emp_stages).isPending,
    ).length;
    const dynamicVerifiedCount = statusFilteredEmployees.filter(
      (emp) => getStageProps(emp.emp_stages).isVerified,
    ).length;
    const dynamicOfferCount = statusFilteredEmployees.filter(
      (emp) => getStageProps(emp.emp_stages).isOffer,
    ).length;

    const filteredEmployees = statusFilteredEmployees.filter((emp) => {
      const { isPending, isVerified, isOffer } = getStageProps(emp.emp_stages);
      if (activeTab === "Pending") return isPending;
      if (activeTab === "Verified") return isVerified;
      if (activeTab === "Offer") return isOffer;
      return true;
    });

    const fetchDisabledEmployees = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/employees/disabled`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok) {
          setDisabledEmployees(result.data || []);
        }
      } catch (err) {
        console.error("Disabled employees fetch error:", err);
      }
    };

    const handleRestoreEmployee = async (id) => {
      if (!window.confirm("Restore this employee?")) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/employees/restore/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok) {
          alert("Employee restored successfully");

          fetchEmployees();
          fetchDisabledEmployees();
        } else {
          alert(result.message || "Restore failed");
        }
      } catch (err) {
        console.error(err);
        alert("Restore failed");
      }
    };



const fetchEmployees = async () => {
  setLoading(true);
  setError(null);

  try {
    const queryParams = new URLSearchParams();

    // Company filter
    if (selectedCompany) {
      queryParams.append("company_id", String(selectedCompany));
    }

    // Branch filter
    if (selectedBranch) {
      queryParams.append("branch_id", String(selectedBranch));
    }

    // Search fields
    const validSearch = debouncedSearchFields
      .filter((item) => {
        return (
          item &&
          String(item.keyword || "").trim() !== ""
        );
      })
      .map((item) => ({
        field: item.field || "",
        keyword: String(item.keyword).trim(),
      }));

    if (validSearch.length > 0) {
      queryParams.append(
        "searchFields",
        JSON.stringify(validSearch)
      );
    }

    // Date filters
    if (debouncedDateFilter.from) {
      queryParams.append(
        "fromDate",
        debouncedDateFilter.from
      );
    }

    if (debouncedDateFilter.to) {
      queryParams.append(
        "toDate",
        debouncedDateFilter.to
      );
    }

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/employees?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `API request failed: ${response.status}`
      );
    }

    const result = await response.json();

    const data = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    setEmployees(data);

    // Search suggestions
    setSuggestions({
      firstName: [
        ...new Set(data.map((emp) => emp.first_name).filter(Boolean)),
      ],
      middleName: [
        ...new Set(data.map((emp) => emp.middle_name).filter(Boolean)),
      ],
      lastName: [
        ...new Set(data.map((emp) => emp.last_name).filter(Boolean)),
      ],
      department: [
        ...new Set(data.map((emp) => emp.department).filter(Boolean)),
      ],
      designation: [
        ...new Set(data.map((emp) => emp.rank).filter(Boolean)),
      ],
      company: [
        ...new Set(data.map((emp) => emp.company_name).filter(Boolean)),
      ],
      site: [
        ...new Set(data.map((emp) => emp.site_name).filter(Boolean)),
      ],
    });

    const working = data.filter(
      (emp) =>
        String(emp.active ?? "").trim() === "0" &&
        String(emp.emp_stages ?? "").trim().toUpperCase() ===
          "OFFER LETTER ISSUED" &&
        String(emp.em_status ?? "").trim().toUpperCase() === "WORKING"
    ).length;

    const left = data.filter(
      (emp) =>
        String(emp.active ?? "").trim() === "0" &&
        String(emp.emp_stages ?? "").trim().toUpperCase() ===
          "OFFER LETTER ISSUED" &&
        String(emp.em_status ?? "").trim().toUpperCase() === "LEFT"
    ).length;

    setWorkingCount(working);
    setLeftCount(left);

    const pending = data.filter(
      (emp) =>
        String(emp.emp_stages ?? "").trim().toUpperCase() === "PENDING"
    ).length;

    const verified = data.filter((emp) => {
      const stage = String(emp.emp_stages ?? "").trim().toUpperCase();

      return (
        Boolean(emp.verify_on) &&
        ["VERIFIED", "READYTOJOIN", "ON HOLD"].includes(stage)
      );
    }).length;

    const offer = data.filter(
      (emp) =>
        String(emp.emp_stages ?? "").trim().toUpperCase() ===
        "OFFER LETTER ISSUED"
    ).length;

    setPendingCount(pending);
    setVerifiedCount(verified);
    setOfferCount(offer);

    console.log("Employee API URL:", queryParams.toString());
    console.log("Employees fetched:", data.length);
  } catch (err) {
    console.error("Fetch employees error:", err);
    setError(
      `Failed to fetch employees: ${err.message || "Unknown error"}`
    );
  } finally {
    setLoading(false);
  }
};


const fetchBranches = async (companyId) => {
  if (!companyId) {
    setBranches([]);
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/branches/by-company/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch branches");
    }

    setBranches(
      Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : []
    );
  } catch (error) {
    console.error("Branch fetch error:", error);
    setBranches([]);
  }
};
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // console.log("Company ID =>", company);

        const [companiesRes, employeeTypeRes, reportingManagerRes] =
          await Promise.all([
            fetch(`${API_URL}/api/companies`, { headers }),
            fetch(`${API_URL}/api/employee-types`, { headers }),
            fetch(`${API_URL}/api/employees/reporting-managers`, { headers }),
          ]);

        const companiesData = await companiesRes.json();
        const employeeTypeData = await employeeTypeRes.json();
        const reportingManagerData = await reportingManagerRes.json();

        console.log("Companies Data =>", companiesData);
        console.log("Employee Type Data =>", employeeTypeData);
        console.log("Reporting Manager Data =>", reportingManagerData);

        setCompanies(companiesData.data || []);
        // site data is dynamically populated in fetchEmployees based on unique site names in data
        setEmployeeTypes(employeeTypeData.data || []);
        setReportingManagers(reportingManagerData.data || []);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
      }
    };

    useEffect(() => {
      fetchEmployees();
      fetchDropdownData();
      fetchDisabledEmployees();
    }, []);

    const handleSearch = () => {
      fetchEmployees();
    };

 const handleReset = () => {
  setSearchFields([{ field: "", keyword: "" }]);
  setDateFilter({ from: "", to: "" });

  setSelectedCompany("");
  setSelectedBranch("");
  setBranches([]);
};

useEffect(() => {
  fetchEmployees();
}, [
  debouncedSearchFields,
  debouncedDateFilter,
  selectedCompany,
  selectedBranch,
]);

    const handleDownloadExcel = async () => {
      try {
        const params = {};

        const validSearch = searchFields.filter(
          (f) => f.field !== undefined && f.keyword,
        );

        if (validSearch.length > 0) params.searchFields = validSearch;
        if (dateFilter.from && dateFilter.to) {
          params.fromDate = dateFilter.from;
          params.toDate = dateFilter.to;
        }

        // Build URL query string
        const queryParams = new URLSearchParams();

        if (params.searchFields) {
          queryParams.append("searchFields", JSON.stringify(params.searchFields));
        }
        if (params.fromDate) queryParams.append("fromDate", params.fromDate);
        if (params.toDate) queryParams.append("toDate", params.toDate);
        const token = localStorage.getItem("token");

        const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

        const response = await fetch(
          `${API_URL}/api/employees/export?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!response.ok) {
          throw new Error(
            `Failed to download update template: ${response.status}`,
          );
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Employees_${randomNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        // Axios sends 401 here
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        console.error("Excel download error:", error);
        alert("Failed to download Excel. Please try again.");
      }
    };

    const handleDownloadUploadTemplate = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/employees/download-template`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to download template: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "EmployeeTemplate.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download error:", err);
        alert("Failed to download Excel template.");
      }
    };

    const handleDownloadUploadErrorExcel = async () => {
      try {
        const token = localStorage.getItem("token");
        // Corrected URL:
        const response = await fetch(
          `${API_URL}/api/employees/uploaderrortemplate/download`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to download template: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ViewUploadedData.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download error:", err);
        alert("Failed to download Excel template.");
      }
    };

    const handleDownloadUpdateTemplate = async () => {
      try {
        const params = {};

        const validSearch = searchFields.filter(
          (f) => f.field !== undefined && f.keyword,
        );

        if (validSearch.length > 0) params.searchFields = validSearch;
        if (dateFilter.from && dateFilter.to) {
          params.fromDate = dateFilter.from;
          params.toDate = dateFilter.to;
        }

        // Build URL query string
        const queryParams = new URLSearchParams();

        if (params.searchFields) {
          queryParams.append("searchFields", JSON.stringify(params.searchFields));
        }
        if (params.fromDate) queryParams.append("fromDate", params.fromDate);
        if (params.toDate) queryParams.append("toDate", params.toDate);

        const token = localStorage.getItem("token");
        const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

        const response = await fetch(
          `${API_URL}/api/employees/updatetemplate/download?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!response.ok) {
          throw new Error(
            `Failed to download update template: ${response.status}`,
          );
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Employee_Specific_${randomNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download update template error:", err);
        alert("Failed to download update Excel template.");
      }
    };

  const handleDownloadUpdateErrorExcel = async () => {
    try {
      const token = localStorage.getItem("token");

      // Check login token
      if (!token) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      // Call the correct backend route
      const response = await fetch(
        `${API_URL}/api/employees/uploaderrortemplate/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle unauthorized request
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      // Handle backend errors
      if (!response.ok) {
        let errorMessage = `Download failed (${response.status})`;

        try {
          const errorData = await response.json();

          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Response may not be JSON
        }

        console.error("Download API error:", errorMessage);
        throw new Error(errorMessage);
      }

      // Convert response into Excel blob
      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("Downloaded Excel file is empty.");
      }

      // Create temporary download URL
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "ViewUploadedData.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Release temporary URL
      window.setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      console.log("Failed employee Excel downloaded successfully.");
    } catch (err) {
      console.error("Download error:", err);

      alert(
        err.message || "Failed to download Excel template."
      );
    }
  };
    const handleBulkUploadFileChange = (e) => {
      setBulkUploadSucMsg("");
      setBulkUploadErrMsg("");
      setShowBulkUploadErr(false);
      setSelectedBulkUploadFile(e.target.files[0]);
    };

  const handleBulkUpload = async () => {
    if (!selectedBulkUploadFile) {
      setBulkUploadSucMsg("");
      setBulkUploadErrMsg("Please select a file to upload.");
      return;
    }

    setBulkUploadErrMsg("Uploading...");
    setBulkUploadSucMsg("");

    const formData = new FormData();
    formData.append("file", selectedBulkUploadFile);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/employees/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      console.log("Bulk upload response:", result);

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok || !result.success) {
        setBulkUploadSucMsg("");
        setBulkUploadErrMsg(
          result.message || result.error || "File upload failed!"
        );
        return;
      }

      // Backend response madhun uploaded rows count ghya.
      const insertedCount = Number(
        result.totalInserted ??
        result.insertedCount ??
        result.companyResults?.reduce(
          (total, company) =>
            total +
            Number(company.insertedRecords ?? company.insertedCount ?? 0),
          0
        ) ??
        0
      );

      setBulkUploadSucMsg(
        `${insertedCount} ${
          insertedCount === 1 ? "row" : "rows"
        } uploaded successfully! Click on Verify Data`
      );

      setBulkUploadErrMsg("");

      await fetchEmployees();
    } catch (err) {
      console.error("Bulk upload error:", err);
      setBulkUploadSucMsg("");
      setBulkUploadErrMsg(
        err.message || "Upload failed!"
      );
    } finally {
      setSelectedBulkUploadFile(null);

      const fileInput = document.getElementById("bulkUploadFileInput");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const handleVerifyBulkUpload = async () => {
    setBulkUploadSucMsg("");
    setBulkUploadErrMsg("Verifying...");
    setBulkUploadErrors([]);
    setShowBulkUploadErrorModal(false);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/employees/verify-bulk-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log("VERIFY BULK UPLOAD RESPONSE =", result);

      // ============================================
      // UNAUTHORIZED
      // ============================================

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      // ============================================
      // SUCCESS RESPONSE
      // ============================================

      if (response.ok) {
        setBulkUploadErrMsg("");

        // ============================================
        // ERROR DATA FOUND
        // ============================================

        if (
          result.results &&
          Array.isArray(result.results) &&
          result.results.length > 0
        ) {
          console.log(
            "BULK UPLOAD ERRORS =",
            result.results
          );

          // Store error rows
          setBulkUploadErrors(result.results);

          // Show View Uploaded Data button
          setShowBulkUploadErr(true);

          setBulkUploadSucMsg(
            `${result.results.length} row(s) have errors. Click "View Uploaded Data" to check errors.`
          );

          // Optional popup
          setShowBulkUploadErrorModal(true);

        } else {
          // ============================================
          // NO ERROR
          // ============================================

          setBulkUploadErrors([]);
          setShowBulkUploadErr(false);
          setShowBulkUploadErrorModal(false);

          setBulkUploadSucMsg(
            result.message ||
            "Bulk upload verification successful."
          );
        }

        fetchEmployees();

      } else {

        // ============================================
        // API ERROR
        // ============================================

        const errorMessage =
          result.message ||
          result.error ||
          "Verification failed.";

        setBulkUploadSucMsg("");
        setBulkUploadErrMsg(errorMessage);

        // Popup
        alert(errorMessage);
      }

    } catch (err) {

      console.error(
        "VERIFY BULK UPLOAD ERROR =",
        err
      );

      const errorMessage =
        err?.message ||
        "Something went wrong while verifying bulk upload.";

      setBulkUploadErrMsg(
        `Verification failed: ${errorMessage}`
      );

      setBulkUploadSucMsg("");

      alert(
        `Verification failed:\n\n${errorMessage}`
      );
    }
  };

  const handleBulkUpdateFileChange = (e) => {
    setBulkUpdateErrMsg("");
    setBulkUpdateSucMsg("");
    setShowBulkUpdateErr(false);

    const file = e.target.files?.[0] || null;
    setSelectedUpdateFile(file);
  };

  const handleBulkUpdate = async () => {
    // Validate selected file
    if (!selectedUpdateFile) {
      setBulkUpdateSucMsg("");
      setBulkUpdateErrMsg("Please select a file to upload.");
      return;
    }

    setBulkUpdateErrMsg("Uploading...");
    setBulkUpdateSucMsg("");
    setShowBulkUpdateErr(false);

    const formData = new FormData();
    formData.append("file", selectedUpdateFile);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/employees/bulk-update-doc`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      console.log("Bulk Update Document Response:", result);

      // Handle expired or invalid token
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      // Handle successful upload
      if (response.ok && result.success !== false) {
        // Support different backend response property names
        const rawCount =
          result.updatedCount ??
          result.totalRows ??
          result.count ??
          result.affectedRows;

        const updatedCount = Number(rawCount);

        if (rawCount !== undefined && Number.isFinite(updatedCount)) {
          setBulkUpdateSucMsg(
            `${updatedCount} ${
              updatedCount === 1 ? "row" : "rows"
            } uploaded successfully! Click on Verify Data.`
          );
        } else {
          // Avoid displaying "undefined rows"
          setBulkUpdateSucMsg(
            result.message ||
              "File uploaded successfully! Click on Verify Data."
          );
        }

        setBulkUpdateErrMsg("");

        // Refresh employee data
        await fetchEmployees();
      } else {
        setBulkUpdateSucMsg("");
        setBulkUpdateErrMsg(
          result.message || "File upload failed!"
        );
      }
    } catch (err) {
      console.error("Bulk Update Upload Error:", err);

      setBulkUpdateSucMsg("");
      setBulkUpdateErrMsg(
        err.message || "Upload failed! Please try again."
      );
    } finally {
      setSelectedUpdateFile(null);

      const fileInput = document.getElementById(
        "bulkUpdateFileInput"
      );

      if (fileInput) {
        fileInput.value = "";
      }
    }
  };
    
  const handleVerifyBulkUpdate = async () => {
    setBulkUpdateSucMsg("");
    setBulkUpdateErrMsg("Verifying...");
    setShowBulkUpdateErr(false);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/employees/verify-bulk-update2`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (result.errors?.length) {
        setShowBulkUpdateErr(true);
      }

      if (response.ok) {
        setBulkUpdateErrMsg("");

        setBulkUpdateSucMsg(
          `Total: ${result.totalRecords}, Updated: ${result.successCount}, Failed: ${result.errorCount}`
        );

        if (result.errorCount > 0) {
          setBulkUpdateErrMsg(
            `${result.errorCount} records failed. Click View Uploaded Data to see errors.`
          );
        }

        fetchEmployees();
      } else {
        setBulkUpdateSucMsg("");
        setBulkUpdateErrMsg(
          result.message || "Verification failed."
        );
      }

      console.log("Verification result:", result);
    } catch (err) {
      setBulkUpdateSucMsg("");
      setBulkUpdateErrMsg(
        `Verification failed: ${err.message}`
      );
    }
  };


    const handleDeleteEmployee = async (id) => {
      if (!window.confirm("Are you sure you want to delete this employee?")) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/employees/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete: ${response.status}`);
        }

        alert("Employee deleted successfully!");
        fetchEmployees();
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          alert(`Failed to delete employee: ${err.message}`);
        }
        console.error("Delete error:", err);
      }
    };

    const handleChangeEmployeeStatus = (emp) => {
      setChangeEmployeeStatus(emp);
      setShowChangeStatusModal(true);
    };

    const handleUpdateEmployeeStatus = async () => {
      if (!changeEmployeeStatus) return;

      const id = changeEmployeeStatus.id;
      const currentStatus = changeEmployeeStatus.status || "WORKING";

      console.log(changeEmployeeStatus);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/employees/${id}/status`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: changeEmployeeStatus.em_status }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update status: ${response.status}`);
        }

        alert("Employee status updated successfully!");
        setChangeEmployeeStatus(false);
        fetchEmployees();
      } catch (err) {
        console.error("Status update error:", err);
        alert(`Failed to update employee status: ${err.message}`);
      }
    };
    const handleVerificationClick = (emp, type) => {
      setSelectedEmployee(emp);

      // setVerificationData({
      //   status: emp.emp_stages,
      //   remark: emp.verification_remark,
      // });

      if (type === "VERIFIED") {
        const fetchNextEmployeeCode = async () => {
          try {
            const res = await api.get(
              `${API_URL}/api/employees/next-code`,
              getAuthHeaders(),
            );

            if (res.data.success) {
              console.log("res.data.nextCode", res.data.nextCode);
              setSelectedEmployee((prev) => ({
                ...prev,
                employee_code: res.data.nextCode,
              }));
            }
            console.log("emp_next_code : ", res.data);
          } catch (err) {
            console.log("EMP CODE ERROR:", err);
          }
        };
        fetchNextEmployeeCode();
        setShowVerifiedModal(true);
      } else if (type === "approved") {
        return;
      } else {
        setShowVerificationModal(true);
      }
    };
    const handleEditEmployee = (employee) => {
      setEditingEmployee(employee);
      setShowAddEmployee(true);
    };

    const handleUpdateSalary = (employee) => {
      // setEditingEmployee(employee);
      // setShowAddEmployee(true);
    };

    const handleAddEmployeeSuccess = () => {
      setShowAddEmployee(false);
      setEditingEmployee(null);
      fetchEmployees();
    };

    const handleCancelAddEmployee = () => {
      setShowAddEmployee(false);
      setEditingEmployee(null);
    };

    // if (showAddEmployee) {
    //   return (
    //     <AddEmployee
    //       employee={editingEmployee}
    //       onSuccess={handleAddEmployeeSuccess}
    //       onCancel={handleCancelAddEmployee}
    //     />
    //   );
    // }

    return (
      <div
        className="page-container"
        style={{
          fontSize: "13px",
        }}
      >
        <div className="page-header">
          <h1 className="page-title">
            Employee Management{" "}
            <span className="text-success">
              (
              {activeTab === "Pending"
                ? pendingCount
                : activeTab === "Verified"
                  ? verifiedCount
                  : offerCount || 0}
              )
            </span>
          </h1>

          <div className="page-actions">
            <div className="employee-counts">
              <span className="working">Working : {workingCount}</span>
              <span className="left">Left : {leftCount}</span>
              {/* <span className="total">Total : {employees.length}</span> */}
            </div>
            <button
              className="search-btn"
              onClick={() => setShowSearchPanel(!showSearchPanel)}
            >
              <FaSearch /> {showSearchPanel ? "Hide Search" : "Search"}
            </button>
            {canAdd && (
              <button
              className="btn-primary"
              onClick={() => {
                setShowAddEmployee(true);
                setEditingEmployee(null);
                setShowSearchPanel(false);
              }}
            >
              <FaPlus />
              Add New Employee
            </button>
            )}
          </div>
        </div>
   {showSearchPanel && (
  <>
    {/* Company & Branch — TOP */}
    {/* <Card className="shadow-sm border-0 mb-2">
      <Card.Body className="py-2">
        <Row className="g-2 align-items-end">
          <Col md={5}>
            <Form.Label>Company</Form.Label>
            <Form.Select
              value={selectedCompany}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedCompany(id);
                setSelectedBranch("");
                setBranches([]);
                if (id) fetchBranches(id);
              }}
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id ?? c.company_id} value={c.id ?? c.company_id}>
                  {c.company_name ?? c.name ?? c.companyName}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={5}>
            <Form.Label>Branch</Form.Label>
            <Form.Select
              value={selectedBranch}
              disabled={!selectedCompany || !branches.length}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id ?? b.branch_id} value={b.id ?? b.branch_id}>
                  {b.branch_name ?? b.name ?? b.branchName}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2} className="d-flex gap-2">
            <Button onClick={handleSearch}>Search</Button>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSelectedCompany("");
                setSelectedBranch("");
                setBranches([]);
                handleReset();
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card> */}

    {/* EXISTING FILTERS — BELOW */}
    <FilterPanel
      searchFields={searchFields}
      setSearchFields={setSearchFields}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      onSearch={handleSearch}
      onReset={handleReset}
      onDownloadExcel={handleDownloadExcel}
      searchOptions={searchOptions}
      companies={companies}
      branches={branches}
      selectedCompany={selectedCompany}
      selectedBranch={selectedBranch}
      onCompanyChange={(id) => {
        setSelectedCompany(id);
        setSelectedBranch("");
        setBranches([]);
        if (id) fetchBranches(id);
      }}
      onBranchChange={setSelectedBranch}
      suggestions={Array.from(new Set(
        employees.flatMap((e) => [
          e.emp_full_name, e.employee_code,
          e.client_name, e.site_name
        ]).filter(Boolean)
      ))}
      onSuggestionClick={(index, suggestion) => {
        const updated = [...searchFields];
        updated[index].keyword = suggestion;
        setSearchFields(updated);
      }}
    />
  </>
)}

        {showAddEmployee ? (
          <AddEmployee
            key={editingEmployee ? editingEmployee.id : "new"}
            editingEmployee={editingEmployee}
            setEditingEmployee={setEditingEmployee}
            onSuccess={handleAddEmployeeSuccess}
            onCancel={handleCancelAddEmployee}
          />
        ) : (
          <div>
            {canAdd && (
                <>
            {/* Employee Bulk Upload */}
            <Card className="mb-2">
              <Card.Title
                onClick={() => setShowBulkUpload(!showBulkUpload)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  fontSize: "14px",
                  marginBottom: 0,
                }}
                className="d-flex align-items-center"
              >
                <span className="me-2">
                  {showBulkUpload ? <FaMinus size={12} /> : <FaPlus size={12} />}
                </span>
                <span>Employee Bulk Upload</span>
              </Card.Title>

              {showBulkUpload && (
                <Card.Body style={{ padding: "10px 12px", fontSize: "12px" }}>
                  <p
                    style={{
                      color: "var(--red-color)",
                      fontWeight: "600",
                      fontStyle: "italic",
                      marginBottom: "8px",
                      fontSize: "11px",
                    }}
                  >
                    Do not use any special character in your file name
                  </p>

                  <Form.Group as={Row} className="align-items-center mb-2">
                    <Col xs="auto">
                      <Form.Label
                        htmlFor="bulkUploadFileInput"
                        className="btn btn-secondary btn-sm mb-0"
                      >
                        Choose File
                      </Form.Label>

                      <Form.Control
                        id="bulkUploadFileInput"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleBulkUploadFileChange}
                        style={{ display: "none" }}
                      />
                    </Col>

                    <Col>
                      <small>
                        {selectedBulkUploadFile
                          ? selectedBulkUploadFile.name
                          : "No file chosen"}
                      </small>
                    </Col>
                  </Form.Group>

                  <p className="text-muted mb-2" style={{ fontSize: "11px" }}>
                    Please Upload Excel Sheet Only.
                  </p>

                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleBulkUpload}
                    >
                      Start Upload
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={handleVerifyBulkUpload}
                    >
                      Verify Data
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleDownloadUploadTemplate}
                    >
                      Download Template
                    </Button>

  {showBulkUploadErr && (
    <Button
      size="sm"
      variant="success"
      onClick={() => setShowBulkUploadErrorModal(true)}
    >
      View Uploaded Data
    </Button>
  )}
                  </div>

                  {bulkUploadErrMsg && (
                    <Alert
                      variant="danger"
                      className="mt-2 mb-0 py-1"
                      style={{ fontSize: "11px" }}
                    >
                      {bulkUploadErrMsg}
                    </Alert>
                  )}

                  {bulkUploadSucMsg && (
                    <Alert
                      variant="success"
                      className="mt-2 mb-0 py-1"
                      style={{ fontSize: "11px" }}
                    >
                      {bulkUploadSucMsg}
                    </Alert>
                  )}
                </Card.Body>
              )}
            </Card>

            {/* Employee Site Bulk Update */}
            <Card className="mb-2">
              <Card.Title
                onClick={() => setShowSiteBulkUpdate(!showSiteBulkUpdate)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: 0,
                }}
                className="d-flex align-items-center"
              >
                <span className="me-2">
                  {showSiteBulkUpdate ? (
                    <FaMinus size={12} />
                  ) : (
                    <FaPlus size={12} />
                  )}
                </span>

                <span>Employee Site Bulk Update</span>
              </Card.Title>

              {showSiteBulkUpdate && (
                <Card.Body
                  style={{
                    padding: "10px 12px",
                    fontSize: "12px",
                  }}
                >
                  <Form.Group as={Row} className="align-items-center mb-2">
                    <Col xs="auto">
                      <Form.Label
                        htmlFor="siteBulkUploadFileInput"
                        className="btn btn-secondary btn-sm mb-0"
                      >
                        Choose File
                      </Form.Label>

                      <Form.Control
                        id="siteBulkUploadFileInput"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleSiteUpdateFileChange}
                        style={{ display: "none" }}
                      />
                    </Col>

                    <Col>
                      <small className="text-muted">
                        {selectedSiteUpdateFile
                          ? selectedSiteUpdateFile.name
                          : "No file chosen"}
                      </small>
                    </Col>
                  </Form.Group>

                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSiteBulkUpload}
                    >
                      Start Upload
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={handleVerifySiteBulkUpload}
                    >
                      Verify Data
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleDownloadSiteTemplate}
                    >
                      Download Template
                    </Button>
                  </div>

                  {siteUpdateErrMsg && (
                    <Alert variant="danger" className="mt-2 py-1 mb-0">
                      {siteUpdateErrMsg}
                    </Alert>
                  )}

                  {siteUpdateSucMsg && (
                    <Alert variant="success" className="mt-2 py-1 mb-0">
                      {siteUpdateSucMsg}
                    </Alert>
                  )}
                </Card.Body>
              )}
            </Card>

            {/* Employee PAN/ESIC/UAN/BASIC SALARY Update */}
            <Card className="mb-2">
              <Card.Title
                onClick={() => setShowPanUpdate(!showPanUpdate)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: 0,
                }}
                className="d-flex align-items-center"
              >
                <span className="me-2">
                  {showPanUpdate ? <FaMinus size={12} /> : <FaPlus size={12} />}
                </span>
                <span>Employee PANCARD / ESIS / UAN / BASIC SALARY Update</span>
              </Card.Title>

              {showPanUpdate && (
                <Card.Body
                  style={{
                    padding: "10px 12px",
                    fontSize: "12px",
                  }}
                >
                  <p
                    style={{
                      color: "var(--red-color)",
                      fontWeight: "600",
                      fontStyle: "italic",
                      fontSize: "11px",
                      marginBottom: "8px",
                    }}
                  >
                    Do not use any special character in your file name
                  </p>

                  <Form.Group as={Row} className="align-items-center mb-2">
                    <Col xs="auto">
                      <Form.Label
                        htmlFor="bulkUpdateFileInput"
                        className="btn btn-secondary btn-sm mb-0"
                      >
                        Choose File
                      </Form.Label>

                      <Form.Control
                        id="bulkUpdateFileInput"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleBulkUpdateFileChange}
                        style={{ display: "none" }}
                      />
                    </Col>

                    <Col>
                      <small className="text-muted">
                        {selectedUpdateFile
                          ? selectedUpdateFile.name
                          : "No file chosen"}
                      </small>
                    </Col>
                  </Form.Group>

                  <p className="text-muted mb-2" style={{ fontSize: "11px" }}>
                    Please Upload Excel Sheet Only.
                  </p>

                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleBulkUpdate}
                    >
                      Start Upload
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={handleVerifyBulkUpdate}
                    >
                      Verify Data
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleDownloadUpdateTemplate}
                    >
                      Download Template
                    </Button>

                    {showBulkUpdateErr && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={handleDownloadUpdateErrorExcel}
                      >
                        View Uploaded Data
                      </Button>
                    )}
                  </div>

                  {bulkUpdateErrMsg && (
                    <Alert
                      variant="danger"
                      className="mt-2 mb-0 py-1"
                      style={{ fontSize: "11px" }}
                    >
                      {bulkUpdateErrMsg}
                    </Alert>
                  )}

                  {bulkUpdateSucMsg && (
                    <Alert
                      variant="success"
                      className="mt-2 mb-0 py-1"
                      style={{ fontSize: "11px" }}
                    >
                      {bulkUpdateSucMsg}
                    </Alert>
                  )}
                </Card.Body>
              )}
            </Card>
</>
  )}
            <Card>
              {/* Active / Inactive pill tabs */}
              <div
                style={{
                  background: "#fff",
                  padding: "8px 16px",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "44px",
                  marginBottom: "15px",
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
                    onClick={() => setActiveStatus(tab.value)}
                    style={{
                      padding: "4px 16px",
                      borderRadius: "20px",
                      border: "1px solid",
                      background: "transparent",
                      fontSize: "12px",
                      fontWeight: "500",
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
              </div>

              <div className="d-flex gap-2 mb-2">
                <Button
                  size="sm"
                  className="me-2"
                  variant={
                    activeTab === "Pending" ? "primary" : "outline-primary"
                  }
                  style={{
                    backgroundColor:
                      activeTab === "Pending" ? "#0d6efd" : "#e7f1ff",
                    color: activeTab === "Pending" ? "#fff" : "#0d6efd",
                    border: "2px solid #0d6efd",
                    fontWeight: 700,
                  }}
                  onClick={() => setActiveTab("Pending")}
                >
                  Pending ({dynamicPendingCount})
                </Button>

                <Button
                  size="sm"
                  className="me-2"
                  variant={
                    activeTab === "Verified" ? "success" : "outline-success"
                  }
                  style={{
                    backgroundColor:
                      activeTab === "Verified" ? "#198754" : "#d1e7dd",
                    color: activeTab === "Verified" ? "#fff" : "#198754",
                    border: "2px solid #198754",
                    fontWeight: 700,
                  }}
                  onClick={() => setActiveTab("Verified")}
                >
                  Verified/OnHold/Reject ({dynamicVerifiedCount})
                </Button>

                <Button
                  size="sm"
                  variant={activeTab === "Offer" ? "warning" : "outline-warning"}
                  style={{
                    backgroundColor:
                      activeTab === "Offer" ? "#e67e22" : "#fdebd0",
                    color: activeTab === "Offer" ? "#fff" : "#e67e22",
                    border: "2px solid #e67e22",
                    fontWeight: 700,
                  }}
                  onClick={() => setActiveTab("Offer")}
                >
                  Offer Letter Issued ({dynamicOfferCount})
                </Button>
              </div>

              {/* Employee Table */}
              <EmployeeTable
                loading={loading}
                error={error}
                employees={filteredEmployees}
                activeTab={activeTab}
                onEdit={handleEditEmployee}
                onUpdateSalary={handleUpdateSalary}
                onChangeStatus={handleChangeEmployeeStatus}
                onDelete={handleDeleteEmployee}
                onVerificationClick={handleVerificationClick}
                showVerificationModal={showVerificationModal}
                setShowVerificationModal={setShowVerificationModal}
                showVerifiedModal={showVerifiedModal}
                setShowVerifiedModal={setShowVerifiedModal}
                selectedEmployee={selectedEmployee}
                // verificationData={verificationData}
                // setVerificationData={setVerificationData}
                fetchEmployees={fetchEmployees}
                companies={companies}
                site={site}
                employeeTypes={employeeTypes}
                reportingManagers={reportingManagers}
                setSelectedEmployee={setSelectedEmployee}
                showDisabledList={activeStatus === 1}
                disabledEmployees={[]} // Not used if using currentEmployees
                handleRestoreEmployee={handleRestoreEmployee}
              />
            </Card>
          </div>
        )}

        {changeEmployeeStatus ? (
          <Modal
            centered
            show={showChangeStatusModal}
            onHide={() => setShowChangeStatusModal(false)}
            size="md"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Change Status -{" "}
                {changeEmployeeStatus.first_name +
                  " " +
                  changeEmployeeStatus.last_name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col className="mb-3" md={12}>
                  <Form.Group controlId="initial">
                    <Form.Label>Employee Status</Form.Label>
                    <Form.Select
                      name="initial"
                      value={changeEmployeeStatus.em_status || "WORKING"}
                      onChange={(e) =>
                        setChangeEmployeeStatus({
                          ...changeEmployeeStatus,
                          em_status: e.target.value,
                        })
                      }
                    >
                      <option value="WORKING">Working</option>
                      <option value="LEFT">Left</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowChangeStatusModal(false)}
              >
                Close
              </Button>
              <Button variant="primary" onClick={handleUpdateEmployeeStatus}>
                Update
              </Button>
            </Modal.Footer>
          </Modal>
        ) : (
          ""
        )}
        <Modal
          show={showSiteErrorModal}
          onHide={() => setShowSiteErrorModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Site Bulk Upload Errors</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee Code</th>
                    <th>Employee Name</th>
                    <th>Site Code</th>
                    <th>Site Name</th>
                    <th>Error</th>
                  </tr>
                </thead>

                <tbody>
                  {siteErrors.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>

                      <td>{row.employee_code}</td>

                      <td>{row.employee_name}</td>

                      <td>{row.client_code}</td>

                      <td>{row.site_name}</td>

                      <td style={{ color: "red" }}>{row.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowSiteErrorModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
  {/* =====================================================
      EMPLOYEE BULK UPLOAD ERROR MODAL
  ===================================================== */}

  <Modal
    show={showBulkUploadErrorModal}
    onHide={() => setShowBulkUploadErrorModal(false)}
    size="xl"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title>
        Employee Bulk Upload Errors
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      {bulkUploadErrors.length === 0 ? (
        <div className="text-center text-muted py-4">
          No errors found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-sm table-hover">
            <thead className="table-danger">
              <tr>
                <th>#</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Client Code</th>
                <th>Site Code</th>
                <th>Error</th>
              </tr>
            </thead>

            <tbody>
              {bulkUploadErrors.map((row, index) => (
                <tr key={index}>
                  <td>
                    {index + 1}
                  </td>

                  <td>
                    {row.employee_code ||
                      row.employeeCode ||
                      "-"}
                  </td>

                  <td>
                    {row.employee_name ||
                      row.emp_full_name ||
                      row.employeeName ||
                      "-"}
                  </td>

                  <td>
                    {row.email_id ||
                      row.emailId ||
                      "-"}
                  </td>

                  <td>
                    {row.client_code ||
                      row.clientCode ||
                      "-"}
                  </td>

                  <td>
                    {row.site_code ||
                      row.siteCode ||
                      "-"}
                  </td>

                  <td
                    style={{
                      color: "red",
                      fontWeight: "600",
                    }}
                  >
                    {row.error ||
                      row.message ||
                      row.errors ||
                      "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal.Body>

    <Modal.Footer>
      <Button
        variant="secondary"
        onClick={() =>
          setShowBulkUploadErrorModal(false)
        }
      >
        Close
      </Button>

      <Button
        variant="success"
        onClick={handleDownloadUploadErrorExcel}
      >
        Download Excel
      </Button>
    </Modal.Footer>
  </Modal>
      </div>
    );
  };

  export default EmployeePages;
