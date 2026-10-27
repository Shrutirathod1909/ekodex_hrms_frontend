import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import * as XLSX from "xlsx";
import "./index.css";
import { useContext } from "react";
import { PermissionsContext } from "../../../components/context/PermissionsContext";
import { Collapse, Dropdown } from "react-bootstrap";
import LoadingScreen from "../../../components/loader/LoadingScreen";
import {
  FaPlus,
  FaClock,
  FaUpload,
  FaSearch,
  FaSyncAlt,
  FaFileExport,
  FaTrash,
  FaEdit,
  FaEye,
  FaUsers,
  FaBuilding,
  FaFileExcel,
} from "react-icons/fa";
import { Pagination } from "react-bootstrap";
import axios from "axios"; // Added for handling API requests
import AttendancePage from "./AttendancePage";
const API_URL = import.meta.env.VITE_API_URL;
const Index = () => {
  const {
    permissions,
    getPermissionsByModule,
    getPermissionsByModuleId,
    refetch,
  } = useContext(PermissionsContext);
  const attendanceByEmployeePerms = getPermissionsByModule(
    "Attendance by employee",
  );
  console.log("attendanceByEmployeePerms", attendanceByEmployeePerms);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [attType, setAttType] = useState("Both");
  const [employeeFilter, setEmployeeFilter] = useState({
    fromDate: "",
    toDate: "",
  });
  const [showOTModal, setShowOTModal] = useState(false);
  const [otFilter, setOtFilter] = useState({
    fromDate: "",
    toDate: "",
  });
  const [otDownloadLoading, setOtDownloadLoading] = useState(false);
  const [siteDate, setSiteDate] = useState("");
  // 1. Keep a master array of all months static reference
  const MASTER_MONTHS = [
    { value: "1", name: "January" },
    { value: "2", name: "February" },
    { value: "3", name: "March" },
    { value: "4", name: "April" },
    { value: "5", name: "May" },
    { value: "6", name: "June" },
    { value: "7", name: "July" },
    { value: "8", name: "August" },
    { value: "9", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" },
  ];

  const currentYearNum = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;

  // Generate years list (e.g., 5 years back and up to current year)
  const DYNAMIC_YEARS = Array.from({ length: 6 }, (_, i) =>
    (currentYearNum - 5 + i).toString(),
  );

  const navigate = useNavigate();
  const [employeeDownloadLoading, setEmployeeDownloadLoading] = useState(false);
  const [siteDownloadLoading, setSiteDownloadLoading] = useState(false);
  // Add this to your existing useState declarations
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showAttendancePage, setShowAttendancePage] = useState(false);
  // 1. Create a state to track visibility
  const [showUpload, setShowUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [billingDays, setBillingDays] = useState("AsPerBillingContract");
  // API Data States
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ generated: 0, notGenerated: 0 });
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const perPage = 50;
  const totalPages = Math.ceil(totalRows / perPage);
  // Form Filter Fields State
  const [searchField, setSearchField] = useState("client_name");
  const [keyword, setKeyword] = useState("");

  const [data, setData] = useState([]);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString()); // Defaults cleanly to current month (e.g. "6" for June)
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [wildcardWord, setWildcardWord] = useState("");
  const [selectedRowForInvoice, setSelectedRowForInvoice] = useState(null);

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [attendanceStatus, setAttendanceStatus] = useState("P");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");
  const [employeeList, setEmployeeList] = useState([]);
const [uploadFile, setUploadFile] = useState(null);
const [clients, setClients] = useState([]);
const [sites, setSites] = useState([]);
const [selectedClient, setSelectedClient] = useState("");
const [selectedSite, setSelectedSite] = useState("");
const [templateLoading, setTemplateLoading] = useState(false);
  // console.log(employees);

  // Map your existing employee state data to react-select options format

  const employeeOptions = [
    { value: "all", label: "All Employee" },
    ...(employeeList || []).map((emp) => {
      // Fallback concatenation sequence if emp_full_name is blank in the row data
      const fullName =
        emp.emp_full_name ||
        [emp.first_name, emp.middle_name, emp.last_name]
          .filter(Boolean)
          .join(" ") ||
        "Unknown Employee";

      return {
        value: emp.employee_code || emp.employee_code,
        label: `${fullName} (${emp.employee_code || "No Code"})`,
      };
    }),
  ];

  const handleDownloadAttendance = async (row) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/attendance/print-sheet`,
        {
          params: {
            site: row.site_id,
            m: row.at_month || currentMonthNum,
            y: row.at_year || currentYearNum,
            type: row.att_type || "Both",
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.data.success) {
        alert("Failed to fetch attendance data");
        return;
      }

      const employees = response.data.at_data || [];

      if (employees.length === 0) {
        alert("No attendance records found");
        return;
      }

      const daysInMonth = new Date(
        parseInt(row.at_year),
        parseInt(row.at_month),
        0,
      ).getDate();

      const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

      const exportRows = [
        [row.company_name || ""],
        [
          "Office No-1102, 11th Floor Technocity IT Premises X-5/3, TTC Industrial Area, Mahape, Ghansoli Navi Mumbai-400710",
        ],
        ["Tel.: 7977271174 | Email: operations@ekodex.in"],
        [],
        [
          `Site Name : ${row.site_name}`,
          `Month : ${monthNames[parseInt(row.at_month)]}`,
          `Year : ${row.at_year}`,
        ],
        [],
      ];

      const headers = [
        "Sr No",
        "Employee Name",
        "Emp Code",
        "Rank",
        "PF",
        "ESIC",
        ...daysArray,
        "N.D.",
        "O.T.",
        "O.T/HRS",
        "OFF",
        "Holiday",
        "Total",
      ];

      exportRows.push(headers);

      employees.forEach((emp, index) => {
        const rowData = [
          index + 1,
          emp.empName || "",
          emp.empCode || "",
          emp.rank || "",
          emp.pf || "",
          emp.esic || "",
        ];

        daysArray.forEach((day) => {
          rowData.push(emp.days?.[day] || "A");
        });

        const nd = Number(emp.nd || 0);
        const ot = Number(emp.ot || 0);
        const off = Number(emp.off || 0);
        const holiday = Number(emp.holiday || 0);

        rowData.push(nd);
        rowData.push(ot);
        rowData.push(emp.otHrs || 0);
        rowData.push(off);
        rowData.push(holiday);
        rowData.push(nd + ot + off + holiday);

        exportRows.push(rowData);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(exportRows);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 10 },
        { wch: 10 },
        ...daysArray.map(() => ({ wch: 4 })),
        { wch: 8 },
        { wch: 8 },
        { wch: 10 },
        { wch: 8 },
        { wch: 10 },
        { wch: 10 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

      XLSX.writeFile(
        workbook,
        `Attendance_${row.site_name}_${row.at_month}_${row.at_year}.csv`,
      );
    } catch (error) {
      console.error(error);
      alert("Failed to download attendance report");
    }
  };

useEffect(() => {
  if (!keyword.trim()) {
    setData([]);
    return;
  }

  const timer = setTimeout(() => {
    handleSearchSubmit();
  }, 500);

  return () => clearTimeout(timer);
}, [keyword]);
  const getSearchByKeyWord = async (key) => {
    try {
      console.log(key);
      handleSearchSubmit();
    } catch (error) {
      console.log(error);
    }
  };


const downloadOTReport = async () => {
  try {
    // Validate dates
    if (!otFilter.fromDate || !otFilter.toDate) {
      alert("Select From Date and To Date");
      return;
    }

    // Validate date range
    if (new Date(otFilter.fromDate) > new Date(otFilter.toDate)) {
      alert("From Date cannot be greater than To Date");
      return;
    }

    setOtDownloadLoading(true);

    // Get logged-in user
    let loggedInUser = null;

    try {
      loggedInUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expired. Please login again.");
      return;
    }

    // Request body
    const requestBody = {
      from_date: otFilter.fromDate,
      to_date: otFilter.toDate,
      user_id: loggedInUser?.id || null,
    };

    console.log("Attendance Report Request:", requestBody);

    // API request
    const response = await axios.post(
      `${API_URL}/api/attendance/getAttendanceReportForDuplicates`,
      requestBody,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check response
    if (!response.data || response.data.size === 0) {
      throw new Error("The downloaded file is empty.");
    }

    // Download ZIP
    const blob = new Blob([response.data], {
      type: "application/zip",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `Attendance_Ot_Report_${otFilter.fromDate}_${otFilter.toDate}.zip`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    setShowOTModal(false);
  } catch (err) {
    console.error("Attendance Download Error:", err);

    // Blob responses may contain the backend error message
    if (err.response?.data instanceof Blob) {
      try {
        const errorText = await err.response.data.text();
        const errorData = JSON.parse(errorText);

        alert(
          errorData.message ||
          errorData.error ||
          "Attendance report download failed."
        );
      } catch {
        alert("Attendance report download failed. Check the backend console.");
      }
    } else {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Download Failed"
      );
    }
  } finally {
    setOtDownloadLoading(false);
  }
};

  const fetchAttendance = async (isReset = false) => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/attendance?page=${page}&wo=${wildcardWord}`;

      if (isReset) {
        url += "&reset=true";
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        console.log("Attendance : ", response.data);
        setAttendanceData(response.data.attendance);
        setTotalRows(response.data.totalRows);
        setLoading(false);

        setMetrics({
          generated: response.data.total_generated,
          notGenerated: response.data.total_not_generated,
        });
      }
    } catch (error) {
      setLoading(false);

      console.error(error);
    }
  };

  // Submit active multi-field search selections to POST route
const handleSearchSubmit = async (e) => {
  e?.preventDefault();

  try {
    setLoading(true);

    const payload = {
      search_fields: [searchField],
      search_keyword: [keyword.trim()],
      search_date_field: "",
      search_from_date: "",
      search_to_date: "",
      search_from_month: month,
      search_from_year: year,
    };

    console.log("SEARCH PAYLOAD:", payload);

    const response = await axios.post(
      `${API_URL}/api/attendance`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log("SEARCH RESPONSE:", response.data);

    if (response.data.success) {
      // Search results directly set करा
      setAttendanceData(response.data.attendance || []);
      setTotalRows(response.data.totalRows || 0);

      if (response.data.total_generated !== undefined) {
        setMetrics({
          generated: response.data.total_generated || 0,
          notGenerated: response.data.total_not_generated || 0,
        });
      }
    } else {
      setAttendanceData([]);
      setTotalRows(0);
    }
  } catch (error) {
    console.error("Search Error:", error);
    console.error("API Error Response:", error.response?.data);
  } finally {
    setLoading(false);
  }
};

  // ✨ DYNAMIC LOGIC: Calculate available months depending on selected year state
  const filteredMonthsList = MASTER_MONTHS.filter((m) => {
    if (year === currentYearNum.toString()) {
      return Number(m.value) <= currentMonthNum;
    }
    return true; // Return all 12 months for any prior years
  });

  const searchFieldOptions = [
    { value: "client_name", label: "Client Name" },
    { value: "site_name", label: "Site Name" },
    { value: "client_code", label: "Client Code" },
     { value: "billing_company", label: "Company" },
  { value: "billing_branch", label: "Branch" },
  ];

  // ✨ FIXED: Changed ALL_MONTHS to MASTER_MONTHS to match the new definition
  const monthOptions = filteredMonthsList.map((m) => ({
    value: m.value,
    label: m.name,
  }));

  const yearOptions = DYNAMIC_YEARS.map((y) => ({
    value: y,
    label: y,
  }));

  // Watch for month validity when the year changes
  useEffect(() => {
    if (year === currentYearNum.toString() && Number(month) > currentMonthNum) {
      setMonth(currentMonthNum.toString()); // Force reset to current month if previous selection becomes invalid
    }
  }, [year]);

  // Clear back to current month defaults
  const handleReset = () => {
    // setSearchField("client_name");
    setKeyword("");
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
    setWildcardWord("");
    setPage(0);
    fetchAttendance(true);
  };

  // Run on components mount & page transitions
useEffect(() => {
  handleSearchSubmit();
}, [page, wildcardWord, month, year]);

  // Inside Index.js
  // const handleGenerate = (billingDaysOption) => {
  //   if (!selectedRowForInvoice) {
  //     alert("No record selected!");
  //     return;
  //   }

  //   console.log("SELECTED ROW =>", selectedRowForInvoice);

  //   navigate("/attendance/attendance-by-employee/invoice-review", {
  //     state: {
  //       siteId: selectedRowForInvoice.site_id,
  //       month: selectedRowForInvoice.at_month,
  //       year: selectedRowForInvoice.at_year,

  //       type:
  //         selectedRowForInvoice.att_type ||
  //         selectedRowForInvoice.at_type ||
  //         selectedRowForInvoice.type ||
  //         "Both",

  //       billingDays: billingDaysOption,
  //     },
  //   });

  //   setShowInvoiceModal(false);
  // };
  const handleGenerate = (billingDaysOption) => {
    if (!selectedRowForInvoice) {
      alert("No record selected!");
      return;
    }

    console.log("SELECTED ROW =>", selectedRowForInvoice);

    const invoiceState = {
      // 1
      month: selectedRowForInvoice.at_month,

      // 2
      year: selectedRowForInvoice.at_year,

      // 3
      clientCode: selectedRowForInvoice.client_code,

      // 4
      clientId: selectedRowForInvoice.client_id,

      // 5
      companyName: selectedRowForInvoice.company_name,

      // 6
      siteId: selectedRowForInvoice.site_id,

      // 7
      siteName: selectedRowForInvoice.site_name,

      // Existing billing option
      billingDays: billingDaysOption,

      // Existing type
      type:
        selectedRowForInvoice.att_type ||
        selectedRowForInvoice.at_type ||
        selectedRowForInvoice.type ||
        "Both",
    };

    console.log("========== DATA SENT TO INVOICE REVIEW ==========");
    console.log("1. Month:", invoiceState.month);
    console.log("2. Year:", invoiceState.year);
    console.log("3. Client Code:", invoiceState.clientCode);
    console.log("4. Client ID:", invoiceState.clientId);
    console.log("5. Company Name:", invoiceState.companyName);
    console.log("6. Site ID:", invoiceState.siteId);
    console.log("7. Site Name:", invoiceState.siteName);
    console.log("Billing Days:", invoiceState.billingDays);
    console.log("Type:", invoiceState.type);
    console.log("FULL INVOICE STATE =>", invoiceState);
    console.log("================================================");

    navigate("/attendance/attendance-by-employee/invoice-review", {
      state: invoiceState,
    });

    setShowInvoiceModal(false);
  };
// Fetch Clients
// Fetch Clients
const fetchClients = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/clients`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("Clients:", response.data.data);

    const clientData = response.data.data || [];

    setClients(Array.isArray(clientData) ? clientData : []);
  } catch (error) {
    console.error("Fetch Clients Error:", error);
    setClients([]);
  }
};

// Fetch Sites for selected Client
const fetchSites = async (clientId) => {
  try {
    if (!clientId) {
      setSites([]);
      return;
    }

    console.log("Fetching sites for client:", clientId);

    const response = await axios.get(
      `${API_URL}/api/clients/${clientId}/sites`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log("Sites API Response:", response.data);

    const siteData = response.data?.data || [];

    setSites(Array.isArray(siteData) ? siteData : []);
  } catch (error) {
    console.error("Fetch Sites Error:", error);
    console.error("Error Status:", error.response?.status);
    console.error("Error Data:", error.response?.data);

    setSites([]);
  }
};

// Load clients when component mounts
useEffect(() => {
  console.log("🚀 Component Mounted - Loading Clients");
  fetchClients();
}, []);

useEffect(() => {
  console.log("🔄 Selected Client Changed:", selectedClient);

  if (selectedClient) {
    fetchSites(selectedClient);
  } else {
    console.log("⚠️ No Client Selected");
    setSites([]);
    setSelectedSite("");
  }
}, [selectedClient]);

// Load sites when Client changes

  // const downloadTemplate = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${API_URL}/api/attendance/download-template`,
  //       {
  //         responseType: "blob",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       },
  //     );

  //     const blob = new Blob([response.data], {
  //       type: "text/csv",
  //     });

  //     const url = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `AttendanceTemplate_${Date.now()}.csv`;

  //     document.body.appendChild(link);
  //     link.click();

  //     link.remove();
  //     window.URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Download failed");
  //   }
  // };
const downloadTemplate = async () => {
  if (!selectedClient || !selectedSite) {
    alert("Please select Client and Site first");
    return;
  }

  try {
    setTemplateLoading(true);

    const response = await axios.get(
      `${API_URL}/api/attendance/download-template`,
      {
        params: {
          client_id: selectedClient,
          site_id: selectedSite,
        },
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "text/csv" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `Attendance_Template_${selectedClient}_${selectedSite}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Template download failed:", err);
    alert("Download failed");
  } finally {
    setTemplateLoading(false);
  }
};
//   const [uploadFile, setUploadFile] = useState(null);
// const [clients, setClients] = useState([]);
// const [sites, setSites] = useState([]);
// const [selectedClient, setSelectedClient] = useState("");
// const [selectedSite, setSelectedSite] = useState("");
// const [templateLoading, setTemplateLoading] = useState(false);
useEffect(() => {
  if (selectedClient) {
    fetchSites(selectedClient);
  } else {
    setSites([]);
    setSelectedSite("");
  }
}, [selectedClient]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedExtensions = ["csv", "xls", "xlsx"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      alert("Only CSV and Excel files (.csv, .xls, .xlsx) are allowed.");
      e.target.value = "";
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const removeAttendance = async (row) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/api/attendance/remove`, {
        params: {
          site: row.site_id,
          m: row.at_month,
          y: row.at_year,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Attendance removed successfully");

      fetchAttendance();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    try {
      if (!uploadFile) {
        alert("Please select a file");
        return;
      }

      console.log("FILE:", uploadFile);
      console.log("ATT TYPE:", attType);

      const formData = new FormData();

      formData.append("excelFile", uploadFile);
      formData.append("att_type", attType);

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        `${API_URL}/api/attendance/bulk-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload failed");
    }
  };

  const handleVerifyData = async () => {
    try {
      setVerifyLoading(true);

      console.log("==========================================");
      console.log("VERIFY DATA STARTED");
      console.log("Please do not refresh the page.");
      console.log("Attendance data is currently verifying and uploading...");
      console.log("==========================================");

      const response = await axios.post(
        `${API_URL}/api/attendance/verify-data`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("VERIFY DATA RESPONSE:", response.data);

      alert(response.data.message);
    } catch (error) {
      console.error("VERIFY DATA ERROR:", error);

      alert(error.response?.data?.message || "Verification failed");
    } finally {
      setVerifyLoading(false);

      console.log("==========================================");
      console.log("VERIFY DATA PROCESS COMPLETED");
      console.log("==========================================");
    }
  };
  // const handleVerifyData = async () => {
  //   try {
  //     const response = await axios.post(
  //       `${API_URL}/api/attendance/verify-data`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       },
  //     );

  //     alert(response.data.message);
  //   } catch (error) {
  //     console.error(error);
  //     alert(error.response?.data?.message || "Verification failed");
  //   }
  // };
  const downloadEmployeeAttendance = async () => {
    try {
      if (!employeeFilter.fromDate || !employeeFilter.toDate) {
        return alert("Please select From Date and To Date");
      }

      setEmployeeDownloadLoading(true);

      const response = await axios.post(
        `${API_URL}/api/attendance/attendance-report`,
        {
          fromDate: employeeFilter.fromDate,
          toDate: employeeFilter.toDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        },
      );

      // ZIP blob
      const zipBlob = new Blob([response.data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(zipBlob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `ERP_Employee_Attendance_${employeeFilter.fromDate}_${employeeFilter.toDate}_${Date.now()}.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setShowEmployeeModal(false);

      setEmployeeDownloadLoading(false);

      setEmployeeFilter({
        fromDate: "",
        toDate: "",
      });
    } catch (error) {
      console.error("Attendance Download Error:", error);

      alert("Failed to download attendance report");

      setEmployeeDownloadLoading(false);
    }
  };

  const downloadSiteAttendance = async () => {
    try {
      if (!siteDate) {
        return alert("Please select Attendance Date");
      }

      const token = localStorage.getItem("token");

      setSiteDownloadLoading(true);

      const response = await axios.post(
        `${API_URL}/api/attendance/download-site-attendance`,
        {
          date: siteDate,
        },
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ZIP Blob
      const zipBlob = new Blob([response.data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(zipBlob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Site_Attendance_${siteDate}_${Date.now()}.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setSiteDownloadLoading(false);

      setShowSiteModal(false);
    } catch (err) {
      console.error("Site Attendance Download Error:", err);

      setSiteDownloadLoading(false);

      setShowSiteModal(false);

      alert("Failed to download report");
    }
  };

  // const handleGenerateSalary = async (billingDaysOption) => {
  //   if (!selectedRowForInvoice) {
  //     alert("No record selected!");
  //     return;
  //   }

  //   try {
  //     setSalaryLoading(true);

  //     const payload = {
  //       site_id: selectedRowForInvoice.site_id,
  //       month: selectedRowForInvoice.at_month,
  //       year: selectedRowForInvoice.at_year,
  //       billingDays: billingDaysOption,
  //     };

  //     console.log("========== GENERATE SALARY ==========");
  //     console.log("Payload:", payload);

  //     const response = await axios.post(
  //       `${API_URL}/api/salary/generate`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       },
  //     );

  //     console.log("Salary Response:", response.data);

  //     if (response.data?.success) {
  //       alert(response.data.message || "Salary generated successfully!");

  //       setShowSalaryModal(false);
  //       setSelectedRowForInvoice(null);

  //       // Refresh Monthly Records
  //       fetchAttendance();
  //     } else {
  //       alert(response.data?.message || "Failed to generate salary");
  //     }
  //   } catch (error) {
  //     console.error("Generate Salary Error:", error);

  //     alert(
  //       error.response?.data?.message ||
  //         error.response?.data?.error ||
  //         "Failed to generate salary",
  //     );
  //   } finally {
  //     setSalaryLoading(false);
  //   }
  // };
const handleGenerateSalary = async (billingDaysOption) => {
  if (!selectedRowForInvoice) {
    alert("No record selected!");
    return;
  }

  try {
    setSalaryLoading(true);

    const token = localStorage.getItem("token");

    // STEP 1: Billing Create API
const billingPayload = {
  site: selectedRowForInvoice.site_id,
  m: selectedRowForInvoice.at_month,
  y: selectedRowForInvoice.at_year,
  type: attType, // "Both" denara actual variable
  billingDays: billingDaysOption,
  clientId: selectedRowForInvoice.client_id,
};

console.log("Billing Payload:", billingPayload);

const billingResponse = await axios.post(
  `${API_URL}/api/billing/create`,
  billingPayload,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

    console.log("Billing Response:", billingResponse.data);

    // STEP 2: Salary Generate API
    const salaryPayload = {
      site_id: selectedRowForInvoice.site_id,
      month: selectedRowForInvoice.at_month,
      year: selectedRowForInvoice.at_year,
      billingDays: billingDaysOption,
      clientId: selectedRowForInvoice.client_id,
    };

    console.log("========== GENERATE SALARY ==========");
    console.log("Salary Payload:", salaryPayload);

    const salaryResponse = await axios.post(
      `${API_URL}/api/salary/generate`,
      salaryPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Salary Response:", salaryResponse.data);

    if (salaryResponse.data?.success) {
      alert(salaryResponse.data.message || "Salary generated successfully!");

      setShowSalaryModal(false);
      setSelectedRowForInvoice(null);
      await fetchAttendance();
    } else {
      alert(salaryResponse.data?.message || "Failed to generate salary");
    }
  } catch (error) {
    console.error("API Error Message:", error.message);
    console.error("API Error Response:", error.response?.data);
    console.error("API Error Status:", error.response?.status);

    alert(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Billing or salary generation failed"
    );
  } finally {
    setSalaryLoading(false);
  }
};
  if (attendanceByEmployeePerms.length <= 0) {
    refetch();
    return <LoadingScreen />;
  }
  if (showAttendancePage) {
    return (
      <AttendancePage
        setShowAttendancePage={setShowAttendancePage}
        // fetchAttendance={fetchAttendance}
        fetchAttendance={handleSearchSubmit}
      />
    );
  }

  return (
    <div
      className="container-fluid p-0"
      style={{
        fontSize: "13px",
      }}
    >
      {" "}
      <style>{`.table-responsive{
    overflow: visible !important;
      }
      `}</style>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-dark">Attendance Management</h5>

        <div className="d-flex gap-2">
          {/* Employee Attendance */}
          {attendanceByEmployeePerms?.export_access === 1 && (
            <div className="dropdown">
              <button
                className="btn btn-dark btn-sm dropdown-toggle text-white"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Download Report
              </button>

              <ul className="dropdown-menu">
                <li>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setShowEmployeeModal(true)}
                  >
                    <FaUsers className="me-2" />
                    Attendance Employee
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setShowSiteModal(true)}
                  >
                    <FaBuilding className="me-2" />
                    Attendance Site
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setShowOTModal(true)}
                  >
                    <FaClock className="me-2" />
                    Present-OT Report
                  </button>
                </li>
              </ul>
            </div>
          )}

{attendanceByEmployeePerms?.add_access === 1 && (
    <>
          <button
            className="btn btn-info btn-sm text-white"
            onClick={() => setShowUpload(!showUpload)}
          >
            <FaUpload className="me-1" />
            Bulk Upload
          </button>

            <button
              className="btn btn-success btn-sm"
              onClick={() => setShowAttendancePage(true)}
            >
              <FaPlus className="me-1" />
              Add Attendance
            </button>
       
       </>   )}
        </div>
      </div>
      <Collapse in={showUpload}>
        <div>
          <div className="card border-0 shadow-sm mb-4 p-0">
            <div className="card-body">
              <div>
                <p className="text-success fw-semibold">
                  P-Present | A-Absent | W-Weekly Off | P1 - Overtime | PP -
                  Overtime | PPP - Overtime | HF - Half Day | D - Day | N -
                  Night | H - Holiday | CL | PL | SL
                </p>

                <p className="text-danger small italic">
                  Do not use any special character in your file name
                </p>

                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Upload template:
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Attendance Type
                    </label>
                    <select
                      className="form-select"
                      value={attType}
                      onChange={(e) => setAttType(e.target.value)}
                    >
                      <option value="Both">Both</option>
                      <option value="ForInvoice">ForInvoice</option>
                      <option value="ForSalary">ForSalary</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={handleUpload}
                  >
                    Start Upload
                  </button>

                  {/* <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={handleVerifyData}
                  >
                    Verify Data
                  </button> */}

                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={handleVerifyData}
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify Data"
                    )}
                  </button>


<div className="row g-3 mt-3">
  {/* Client Dropdown */}
  <div className="col-md-4">
    <label className="form-label fw-bold">
      Select Client
    </label>

  <Select
  options={clients.map((client) => ({
    value: client._id,
    label: client.companyName,
  }))}
  value={
    clients
      .map((client) => ({
        value: client._id,
        label: client.companyName,
      }))
      .find((option) => option.value === selectedClient) || null
  }
  onChange={(option) => {
    setSelectedClient(option ? option.value : "");
    setSelectedSite("");
  }}
  placeholder="Select Client"
  isClearable
/>
  </div>

  {/* Site Dropdown */}
  <div className="col-md-4">
    <label className="form-label fw-bold">
      Select Site
    </label>

  

 <Select
  options={sites.map((site) => ({
    value: site.siteId,
    label: site.siteName,
  }))}
  value={
    sites
      .map((site) => ({
        value: site.siteId,
        label: site.siteName,
      }))
      .find(
        (option) => option.value === selectedSite
      ) || null
  }
  onChange={(option) => {
    setSelectedSite(option ? option.value : "");
  }}
  placeholder="Select Site"
  isDisabled={!selectedClient}
  isClearable
/>
  </div>

  {/* Download Template */}
  <div className="col-md-4 d-flex align-items-end">
    <button
      type="button"
      className="btn btn-warning btn-sm"
      onClick={downloadTemplate}
      disabled={
        !selectedClient ||
        !selectedSite ||
        templateLoading
      }
    >
      {templateLoading ? "Downloading..." : "Download Template"}
    </button>
  </div>
</div>

      {verifyLoading && (
                    <div className="mt-2 text-danger fw-semibold">
                      Please do not refresh the page. Attendance data is
                      currently verifying and uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Collapse>
      {/*Search Filter Panel*/}
      <Collapse in={showSearch}>
        <div>
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-0">
              <form onSubmit={handleSearchSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold">
                      Search Field
                    </label>

                    <select
                      className="form-select"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Search Field
                      </option>
                      {searchFieldOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold">
                      Keyword
                    </label>
                    <input
                      type="text"
                      className="form-control border"
                      placeholder="Type here..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                  {/* Optimized Month Dropdown */}
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold">
                      Month
                    </label>
                    <Select
                      options={monthOptions}
                      value={monthOptions.find(
                        (option) => option.value === month,
                      )}
                      onChange={(selected) => setMonth(selected.value)}
                      isSearchable
                      placeholder="Select Month"
                    />
                  </div>
                  {/* Optimized Dynamic Year Dropdown */}
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold">
                      Year
                    </label>
                    <Select
                      options={yearOptions}
                      value={yearOptions.find(
                        (option) => option.value === year,
                      )}
                      onChange={(selected) => {
                        setYear(selected.value);
                      }}
                      isSearchable
                      placeholder="Select Year"
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end gap-2">
                    <button type="submit" className="btn btn-dark flex-grow-1">
                      <FaSearch />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={handleReset}
                    >
                      <FaSyncAlt />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Collapse>
      {/* Table Section */}
      <div className="card border-0 shadow-sm rounded-3 p-2">
        <div className="card-header bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold text-dark">Monthly Records</h6>
          <div
            className="text-end"
            style={{
              fontSize: "15px",
            }}
          >
            <span className="badge bg-success-subtle text-success me-2 px-3 py-2">
              Invoice Generated: {metrics.generated}
            </span>
            <span className="badge bg-danger-subtle text-danger px-3 py-2">
              Not Generated: {metrics.notGenerated}
            </span>
          </div>
        </div>
        {loading ? (
          <LoadingScreen />
        ) : (
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-muted small py-3">Sr No.</th>
                    <th className="text-muted small">Billing Company And Branch</th>
                    <th className="text-muted small">Site Name</th>
                    <th className="text-muted small">Month-Year</th>
                    <th className="text-muted small">Total N.D.</th>
                    <th className="text-muted small">Total O.T.</th>
                    <th className="text-muted small">Total Off</th>
                    <th className="text-muted small">Total</th>
                    <th className="text-muted small text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    attendanceData.map((row, idx) => {
                      const nd = parseFloat(row.total_nd) || 0;
                      const ot = parseFloat(row.total_ot) || 0;
                      const off = parseFloat(row.total_off) || 0;
                      const grandTotal = nd + ot + off;

                      console.log("ROW DATA =>", row);
                      console.log("INVOICE STATUS =>", row.invoice_status);
                      console.log("ATT TYPE =>", row.att_type);

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
                      const cleanMonthStr =
                        monthNames[parseInt(row.at_month, 10)] || row.at_month;

                      return (
                        <tr key={row.site_id + "-" + idx}>
                          {/* Serial Counter Row */}
                          <td className="fw-bold text-dark">
                            {idx + 1 + page * perPage}
                          </td>
<td>
  <div className="fw-semibold text-dark">
    {row.billing_company || "-"}
  </div>
  <div className="text-muted small">
    Branch: {row.billing_branch || "-"}
  </div>
</td>
                          {/* Core Meta Details Matching Your Image Layout */}
                          <td>
                            <div className="text-dark">{row.company_name}</div>
                            <div className="text-muted small">
                              Site: {row.site_name}
                            </div>
                            <div className="text-muted small">
                              Client Code: {row.client_code}
                            </div>
                            <div className="text-muted small">
                              Type: {row.att_type}
                            </div>
                          </td>

                          {/* Formatted Period */}
                          <td>
                            {cleanMonthStr || monthNames[currentMonthNum]}-
                            {row?.at_year || currentYearNum}
                          </td>

                          {/* Numbers */}
                          <td>{nd}</td>
                          <td>{ot}</td>
                          <td>{off}</td>
                          <td className="fw-bold text-dark">{grandTotal}</td>

                          {/* Context Actions */}
                          <td className="text-end">
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="info"
                                size="sm"
                                className="text-white"
                                id={`dropdown-${row.site_id}`}
                              >
                                Action
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {attendanceByEmployeePerms?.print_access ===
                                  1 && (
                                  <Dropdown.Item
                                    onClick={() =>
                                      navigate(
                                        "/attendance/attendance-by-employee/PrintAttendance",
                                        {
                                          state: {
                                            attendance: {
                                              ...row,
                                              at_month:
                                                row.at_month || currentMonthNum,
                                              at_year:
                                                row.at_year || currentYearNum,
                                            },
                                          },
                                        },
                                      )
                                    }
                                  >
                                    Print
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item
                                  onClick={() =>
                                    navigate(
                                      "/attendance/attendance-by-employee/PrintAttendanceWithTime",
                                      {
                                        state: {
                                          attendance: {
                                            ...row,
                                            at_month:
                                              row.at_month || currentMonthNum,
                                            at_year:
                                              row.at_year || currentYearNum,
                                          },
                                        },
                                      },
                                    )
                                  }
                                >
                                  Print With Time
                                </Dropdown.Item>
                                {/* <Dropdown.Item
                                  onClick={() => {
                                    setSelectedRowForInvoice(row);
                                    setShowInvoiceModal(true);
                                  }}
                                >
                                  Approve
                                </Dropdown.Item> */}
                                {row.invoice_status === "Pending" &&
                                  (row.att_type === "For Invoice" ||
                                    row.att_type === "Both" ||row.att_type === "both"  ) && (
                                    <Dropdown.Item
                                      onClick={() => {
                                        console.log(
                                          "==========================================",
                                        );
                                        console.log("APPROVE CLICKED");
                                        console.log("Selected Row:", row);
                                        console.log(
                                          "Invoice Status:",
                                          row.invoice_status,
                                        );
                                        console.log(
                                          "Attendance Type:",
                                          row.att_type,
                                        );
                                        console.log("Site ID:", row.site_id);
                                        console.log("Month:", row.at_month);
                                        console.log("Year:", row.at_year);
                                        console.log(
                                          "==========================================",
                                        );

                                        setSelectedRowForInvoice(row);
                                        setShowInvoiceModal(true);
                                      }}
                                    >
                                      Approve
                                    </Dropdown.Item>
                                  )}
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedRowForInvoice(row);
                                    setBillingDays("AsPerBillingContract");
                                    setShowSalaryModal(true);
                                  }}
                                >
                                  Generate Salary
                                </Dropdown.Item>
                                <Dropdown.Divider />
                         {row.invoice_status === "Pending" && (
  <Dropdown.Item
    className="text-danger"
    onClick={() => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this attendance record?",
      );

      if (confirmed) {
        removeAttendance(row);
      }
    }}
  >
    Delete
  </Dropdown.Item>
)}

                                {/* <Dropdown.Item href="#/salary">
                                  Generate Salary
                                </Dropdown.Item> */}
                                {attendanceByEmployeePerms?.export_access ===
                                  1 && (
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleDownloadAttendance(row)
                                    }
                                  >
                                    Download
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="d-flex justify-content-end mt-3">
                <Pagination>
                  <Pagination.First
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                  />

                  <Pagination.Prev
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                  />

                  {[...Array(totalPages)].map((_, index) => {
                    if (
                      index === 0 ||
                      index === totalPages - 1 ||
                      (index >= page - 2 && index <= page + 2)
                    ) {
                      return (
                        <Pagination.Item
                          key={index}
                          active={page === index}
                          onClick={() => setPage(index)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      );
                    }

                    if (index === page - 3 || index === page + 3) {
                      return <Pagination.Ellipsis key={index} />;
                    }

                    return null;
                  })}

                  <Pagination.Next
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages - 1))
                    }
                    disabled={page === totalPages - 1}
                  />

                  <Pagination.Last
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page === totalPages - 1}
                  />
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Inside your Invoice Modal */}
      <Modal
        show={showInvoiceModal}
        onHide={() => setShowInvoiceModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark">
            Generate Invoice
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="form-label text-muted small fw-bold">
            Select Month Days for billing
          </label>
          <select
            className="form-select"
            value={billingDays}
            onChange={(e) => setBillingDays(e.target.value)}
          >
            <option value="WithSunday">With Sunday</option>
            <option value="WithoutSunday">Without Sunday</option>
            <option value="AsPerBillingContract">
              As Per Billing Contract
            </option>
          </select>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowInvoiceModal(false)}
          >
            Close
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleGenerate(billingDays)}
          >
            Generate & Review
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showSalaryModal}
        onHide={() => setShowSalaryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark">
            Generate Salary
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <label className="form-label text-muted small fw-bold">
            Select Options for salary generation
          </label>

          <select
            className="form-select"
            value={billingDays}
            onChange={(e) => setBillingDays(e.target.value)}
            disabled={salaryLoading}
          >
            <option value="WithSunday">With Sunday</option>

            <option value="WithoutSunday">Without Sunday</option>

            <option value="AsPerBillingContract">
              As Per Billing Contract
            </option>
          </select>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSalaryModal(false)}
            disabled={salaryLoading}
          >
            Close
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleGenerateSalary(billingDays)}
            disabled={salaryLoading}
          >
            {salaryLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Generating...
              </>
            ) : (
              "Generate Salary"
            )}
          </button>
        </Modal.Footer>
      </Modal>
      {showEmployeeModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Download Employee Attendance</h5>

                  <button
                    className="btn-close"
                    disabled={employeeDownloadLoading}
                    onClick={() => setShowEmployeeModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label>From Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={employeeFilter.fromDate}
                      onChange={(e) =>
                        setEmployeeFilter({
                          ...employeeFilter,
                          fromDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label>To Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={employeeFilter.toDate}
                      onChange={(e) =>
                        setEmployeeFilter({
                          ...employeeFilter,
                          toDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    disabled={employeeDownloadLoading}
                    onClick={() => setShowEmployeeModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    disabled={employeeDownloadLoading}
                    onClick={downloadEmployeeAttendance}
                  >
                    {employeeDownloadLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaFileExcel className="me-2" />
                        Download Excel
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
      {showSiteModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Download Site Attendance</h5>

                  <button
                    className="btn-close"
                    disabled={siteDownloadLoading}
                    onClick={() => setShowSiteModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label>Attendance Date</label>

                    <input
                      type="date"
                      className="form-control"
                      disabled={siteDownloadLoading}
                      value={siteDate}
                      onChange={(e) => setSiteDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    disabled={siteDownloadLoading}
                    onClick={() => setShowSiteModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success text-white"
                    disabled={siteDownloadLoading}
                    onClick={downloadSiteAttendance}
                  >
                    {siteDownloadLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaFileExcel className="me-2" />
                        Download Excel
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
      {showOTModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Download OT Report</h5>

                  <button
                    className="btn-close"
                    disabled={otDownloadLoading}
                    onClick={() => setShowOTModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label>From Date</label>

                    <input
                      type="date"
                      className="form-control"
                      value={otFilter.fromDate}
                      onChange={(e) =>
                        setOtFilter({
                          ...otFilter,

                          fromDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label>To Date</label>

                    <input
                      type="date"
                      className="form-control"
                      value={otFilter.toDate}
                      onChange={(e) =>
                        setOtFilter({
                          ...otFilter,

                          toDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowOTModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={downloadOTReport}
                    disabled={otDownloadLoading}
                  >
                    {otDownloadLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-download me-2"></i>
                        Download Excel
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Index;
