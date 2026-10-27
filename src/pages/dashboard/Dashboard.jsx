import api from "../../api/axios";
import axios from "axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { Row, Col, Card, Form, Button, InputGroup ,Dropdown,Container,CardBody,Badge} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { PermissionsContext } from "../../components/context/PermissionsContext";

import {
  FaSearch,
  FaRedo,
  FaBuilding,
  FaCodeBranch,
  FaUsers,
  FaLayerGroup,
  FaUserTie,
  FaMoneyCheckAlt,
  FaUniversity,
  FaFileInvoiceDollar,
  FaChartLine,
  FaBook,
  FaArrowUp,
  FaIdCard,
  FaUniversity as FaBank,
  FaCreditCard,
   FaFileExcel 
} from "react-icons/fa";

import "./Dashboard.css";

export default function Dashboard() {
  const { userData } = useContext(PermissionsContext);

  const API_URL = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [siteDate, setSiteDate] = useState("");
const [showSiteModal, setShowSiteModal] = useState(false);
const [siteDownloadLoading, setSiteDownloadLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [clientSites, setClientSites] = useState([]);
  const [branches, setBranches] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState("");
const formatDate = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const [employeeFilter, setEmployeeFilter] = useState({
  fromDate:"",
  toDate:""
});

const [showEmployeeModal,setShowEmployeeModal] = useState(false);
const [employeeDownloadLoading,setEmployeeDownloadLoading] = useState(false);
  const [allAttendance, setAllAttendance] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceRange, setAttendanceRange] = useState("today");
const [fromDate, setFromDate] = useState(null);
const [toDate, setToDate] = useState(null);
  const [attendanceTotalPages, setAttendanceTotalPages] = useState(1);
  const [attendanceLimit, setAttendanceLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [attendanceTotalCount, setAttendanceTotalCount] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    totalSites: 0,
    totalEmployees: 0,
    totalAttendance: 0,
    presentAttendance: 0,
    absentAttendance: 0,
    pendingAttendance: 0,

    employeeStages: [],
    totalND: 0,
    totalOT: 0,
    totalOFF: 0,
    totalAadhar: 0,
    verifiedAadhar: 0,
    pendingAadhar: 0,
    notVerifiedAadhar: 0,

    totalPan: 0,
    verifiedPan: 0,
    pendingPan: 0,
    notVerifiedPan: 0,

    totalBank: 0,
    verifiedBank: 0,
    pendingBank: 0,
    notVerifiedBank: 0,
    totalPassport: 0,
    verifiedPassport: 0,
    pendingPassport: 0,
    notVerifiedPassport: 0,

    totalPf: 0,
    verifiedPf: 0,
    pendingPf: 0,
    notVerifiedPf: 0,

    totalUan: 0,
    verifiedUan: 0,
    pendingUan: 0,
    notVerifiedUan: 0,

    totalEsic: 0,
    verifiedEsic: 0,
    pendingEsic: 0,
    notVerifiedEsic: 0,
  });

  /* ================= MONTHS ================= */

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


const downloadEmployeeAttendance = async (fromDate, toDate) => {
  try {
    setEmployeeDownloadLoading(true);

    const formatDate = (date) => {
      if (!date) return "";

      // ISO date string मधून फक्त YYYY-MM-DD घ्या
      if (typeof date === "string") {
        return date.split("T")[0];
      }

      // Date object असल्यास date format करा
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);

    if (!formattedFromDate || !formattedToDate) {
      alert("Please select From Date and To Date");
      return;
    }

    const response = await axios.post(
      `${API_URL}/api/attendance/attendance-report`,
      {
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "application/zip",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ERP_Employee_Attendance_${formattedFromDate}_${formattedToDate}.zip`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Attendance download error:", err);
    alert("Download failed");
  } finally {
    setEmployeeDownloadLoading(false);
  }
};
const formatDisplayDate = (date) => {
  if (!date) return "";

  const onlyDate = date.split("T")[0];

  const [year, month, day] = onlyDate.split("-");

  return `${day}-${month}-${year}`;
};
 const downloadSiteAttendance = async (date) => {
  try {
    setSiteDownloadLoading(true);

    const response = await axios.post(
      `${API_URL}/api/attendance/download-site-attendance`,
      {
        date,
      },
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const blob = new Blob([response.data], {
      type: "application/zip",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Site_Attendance_${date}.zip`;
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Download failed");
  } finally {
    setSiteDownloadLoading(false);
  }
};
  /* ================= YEARS ================= */

  const years = [];

  for (let i = 2026; i >= 2020; i--) {
    years.push(i);
  }

  /* ================= USER ================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
  console.log(savedUser);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  /* ================= FETCH ================= */
useEffect(() => {

  fetchClientSites();

}, []);

useEffect(() => {
  fetchDashboardData();
}, []);
  /* ================= FETCH DASHBOARD ================= */

  /* ================= FETCH DASHBOARD ================= */


const fetchDashboardData = async (filterParams = {}) => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    // 1. Final filter values
    const companyId =
      filterParams.company_id !== undefined
        ? filterParams.company_id
        : selectedCompany || "";

    const siteId =
      filterParams.site_id !== undefined
        ? filterParams.site_id
        : selectedBranch || "";

    const filterType =
      filterParams.filterType !== undefined
        ? filterParams.filterType
        : attendanceRange;

    const finalFromDate =
      filterParams.fromDate !== undefined
        ? filterParams.fromDate
        : formatDate(fromDate);

    const finalToDate =
      filterParams.toDate !== undefined
        ? filterParams.toDate
        : formatDate(toDate);

    // 2. Common dashboard filters
const params = {
  client_id: companyId,
  site_id: siteId,

  month:
    filterParams.month !== undefined
      ? filterParams.month
      : selectedMonth || "",

  year:
    filterParams.year !== undefined
      ? filterParams.year
      : selectedYear || "",

  filterType,
  fromDate: finalFromDate,
  toDate: finalToDate,
};
    // 3. Debug logs
    console.log("========== DASHBOARD FILTERS ==========");
    console.log("Company ID:", companyId);
    console.log("Site Name/ID:", siteId);
    console.log("Request Parameters:", params);
    console.log("=======================================");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Document summary filters
const documentParams = {
  client_id: companyId,
  site_id: siteId,
};

    // 4. Call all dashboard APIs with filters
    const [
      clientRes,
      attendanceRes,
      stageRes,
      documentRes,
    ] = await Promise.all([
      api.get(`${API_URL}/api/dashboard`, {
        headers,
        params,
      }),

      api.get(
        `${API_URL}/api/dashboard/site-wise-attendance`,
        {
          headers,
          params: {
            ...params,
            perPage: 10,
            page: 1,
          },
        }
      ),

      api.get(
        `${API_URL}/api/dashboard/employee-stage-dashboard`,
        {
          headers,
          params,
        }
      ),

      api.get(
        `${API_URL}/api/dashboard/employee-doc-summary`,
        {
          headers,
          params: documentParams,
        }
      ),
    ]);

    // 5. Dashboard response
    const clients = clientRes.data?.data || {};
    const attendance = attendanceRes.data?.data || [];
    const stageData = stageRes.data?.data || {};
    const docs = documentRes.data?.data || {};

    console.log("Dashboard Response:", clients);
    console.log("Attendance Response:", attendance);
    console.log("Employee Stage Response:", stageData);
    console.log("Document Response:", docs);

    setAllAttendance(attendance);

    // 6. Employee stage summary
    const stage = [
      {
        emp_stages: "Pending",
        employee_count: Number(
          stageData.pending_count || 0
        ),
      },
      {
        emp_stages: "Offer Letter Issued",
        employee_count: Number(
          stageData.offer_letter_issued_count || 0
        ),
      },
      {
        emp_stages: "Verified",
        employee_count: Number(
          stageData.verified_count || 0
        ),
      },
    ];

    // 7. Set dashboard cards
    setDashboardData({
      totalClients: Number(clients.totalClients || 0),
      totalSites: Number(clients.totalSites || 0),
      totalEmployees: Number(docs.total_employee || 0),

      totalAttendance: attendance.length,

      presentAttendance: attendance.reduce(
        (sum, item) => sum + Number(item.P || 0),
        0
      ),

      absentAttendance: attendance.reduce(
        (sum, item) =>
          sum +
          Number(item.FinalAbsent || item.A || 0) +
          Number(item.Unmarked || 0),
        0
      ),

      pendingAttendance: attendance.reduce(
        (sum, item) => sum + Number(item.WO || 0),
        0
      ),

      employeeStages: stage,

      totalAadhar: Number(docs.aadhar_uploaded || 0),
      verifiedAadhar: Number(docs.aadhar_verified || 0),
      pendingAadhar: Number(docs.aadhar_pending || 0),
      notVerifiedAadhar: Number(docs.aadhar_not_verified || 0),

      totalPan: Number(docs.pan_uploaded || 0),
      verifiedPan: Number(docs.pan_verified || 0),
      pendingPan: Number(docs.pan_pending || 0),
      notVerifiedPan: Number(docs.pan_not_verified || 0),

      totalBank: Number(docs.bank_uploaded || 0),
      verifiedBank: Number(docs.bank_verified || 0),
      pendingBank: Number(docs.bank_pending || 0),
      notVerifiedBank: Number(docs.bank_not_verified || 0),

      totalPassport: Number(docs.passport_uploaded || 0),
      verifiedPassport: Number(docs.passport_verified || 0),
      pendingPassport: Number(docs.passport_pending || 0),
      notVerifiedPassport: Number(docs.passport_not_verified || 0),

      totalPf: Number(docs.pf_uploaded || 0),
      verifiedPf: Number(docs.pf_verified || 0),
      pendingPf: Number(docs.pf_pending || 0),
      notVerifiedPf: Number(docs.pf_not_verified || 0),

      totalUan: Number(docs.uan_uploaded || 0),
      verifiedUan: Number(docs.uan_verified || 0),
      pendingUan: Number(docs.uan_pending || 0),
      notVerifiedUan: Number(docs.uan_not_verified || 0),

      totalEsic: Number(docs.esic_uploaded || 0),
      verifiedEsic: Number(docs.esic_verified || 0),
      pendingEsic: Number(docs.esic_pending || 0),
      notVerifiedEsic: Number(docs.esic_not_verified || 0),
    });
  } catch (err) {
    console.error(
      "Dashboard Error:",
      err.response?.data || err.message || err
    );
  } finally {
    setLoading(false);
  }
};
const filteredSites = clientSites.filter(
  site =>
    String(site.client_id) === String(selectedCompany)
);
const fetchClientSites = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.get(
      `${API_URL}/api/dashboard/client-sites`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const sites =
      res.data.data ||
      res.data.clients ||
      res.data ||
      [];

    console.log("Complete API Response:", res.data);
    console.log("Total Sites:", sites.length);
    console.table(
      sites.map(site => ({
        client_id: site.client_id,
        company_name: site.company_name,
        site_id: site.site_id,
        site_name: site.site_name,
      }))
    );

    setClientSites(sites);
  } catch (err) {
    console.error(
      "Client Sites Error:",
      err.response?.data || err
    );
  }
};


const getPageNumbers = () => {

  let pages = [];


  if(attendanceTotalPages <= 5){

    for(let i=1;i<=attendanceTotalPages;i++){
      pages.push(i);
    }

  }

  else if(attendancePage <= 3){

    pages = [
      1,
      2,
      3,
      4,
      "...",
      attendanceTotalPages
    ];

  }

  else if(attendancePage >= attendanceTotalPages - 2){

    pages = [
      1,
      "...",
      attendanceTotalPages - 3,
      attendanceTotalPages - 2,
      attendanceTotalPages - 1,
      attendanceTotalPages
    ];

  }

  else {

    pages = [
      1,
      "...",
      attendancePage - 1,
      attendancePage,
      attendancePage + 1,
      "...",
      attendanceTotalPages
    ];

  }


  return pages;

};
  const changeAttendancePage = (page) => {
    if (page < 1 || page > attendanceTotalPages) return;

    setAttendancePage(page);
  };
const dateSummary = Object.values(
  allAttendance.reduce((acc, item) => {
    const date = item.Date;

    if (!acc[date]) {
      acc[date] = {
        Date: date,
        P: 0,
        A: 0,
        FinalAbsent: 0,
        WO: 0,
        Unmarked: 0,
      };
    }

    acc[date].P += Number(item.P || 0);
    acc[date].A += Number(item.A || 0);
    acc[date].FinalAbsent += Number(item.FinalAbsent || 0);
    acc[date].WO += Number(item.WO || 0);
    acc[date].Unmarked += Number(item.Unmarked || 0);

    return acc;
  }, {})
);
useEffect(() => {
    console.log("Selected Date:", selectedAttendanceDate);
  console.table(allAttendance);
let data = selectedAttendanceDate
  ? allAttendance.filter(
      item => item.Date === selectedAttendanceDate
    )
  : dateSummary;

  console.log("Filtered Data:");
  console.table(data);
  if (selectedAttendanceDate) {
    data = data.filter(
      (item) => item.Date === selectedAttendanceDate
    );
  }

  // Summary Count
  const totalPresent = data.reduce(
    (sum, item) => sum + Number(item.P || 0),
    0
  );

  const totalAbsent = data.reduce(
    (sum, item) => sum + Number(item.A || 0)+Number(item.Unmarked || 0),
    0
  );

  const totalWO = data.reduce(
    (sum, item) => sum + Number(item.WO || 0),
    0
  );

  setDashboardData(prev => ({
    ...prev,
    presentAttendance: totalPresent,
    absentAttendance: totalAbsent,
    pendingAttendance: totalWO,
    totalAttendance: data.length,
  }));

  const startIndex = (attendancePage - 1) * attendanceLimit;
  const endIndex = startIndex + attendanceLimit;

  setAttendanceList(data.slice(startIndex, endIndex));

  setAttendanceTotalPages(
    Math.ceil(data.length / attendanceLimit)
  );

  setAttendanceTotalCount(data.length);

}, [
  attendancePage,
  attendanceLimit,
  attendanceFilter,
  allAttendance,
  selectedAttendanceDate,
]);

  /* ================= COMPANIES ================= */


// const handleAttendanceSearch = () => {

// const companyName =
// companies.find(
//  c => String(c.id) === String(selectedCompany)
// )?.title;


// const branchName =
// branches.find(
//  b => String(b.id) === String(selectedBranch)
// )?.site_name;



// const filtered = allAttendance.filter((item)=>{

// return (

// (!companyName ||
//  item.ClientName?.toLowerCase() === companyName.toLowerCase()
// )

// &&

// (!branchName ||
//  item.SiteName?.toLowerCase() === branchName.toLowerCase()
// )

// &&

// (!selectedMonth ||
//  item.at_month?.toLowerCase() === selectedMonth.toLowerCase()
// )

// &&

// (!selectedYear ||
//  String(item.at_year) === String(selectedYear)
// )

// );

// });




// setAttendanceFilter(filtered);

// setAttendancePage(1);

// setAttendanceTotalCount(filtered.length);

// setAttendanceTotalPages(
//  Math.ceil(filtered.length / attendanceLimit)
// );

// };
  /* ================= RESET ================= */

const handleReset = () => {
  setSelectedCompany("");
  setSelectedBranch("");
  setSelectedMonth("");
  setSelectedYear("");

  setAttendanceRange("today");
  setFromDate(null);
  setToDate(null);

  setBranches([]);
  setAttendanceFilter([]);
  setAttendancePage(1);

  fetchDashboardData({
    company_id: "",
    site_id: "",
    month: "",
    year: "",
    filterType: "today",
    fromDate: "",
    toDate: "",
  });
};


if (!user || loading) {
  return (
    <div className="dashboard-loader">
      <div className="loader-spinner"></div>
      <p>Loading Dashboard...</p>
    </div>
  );
}

  /* ================= ACTIONS ================= */

  const actions = [
    { name: "Wages", icon: <FaMoneyCheckAlt />, path: "/reports/mis" },
    { name: "Bank TRF", icon: <FaUniversity />, path: "/reports/mis" },
    { name: "Salary", icon: <FaFileInvoiceDollar />, path: "/reports/mis" },
    { name: "MIS", icon: <FaChartLine />, path: "/reports/mis" },
    { name: "Ledger", icon: <FaBook />, path: "/reports/ledger" },
  ];
  return (
 <Container fluid className="dashboard-container">
 <Row className="dashboard-wrapper">
        {/* ================= TOP HEADER ================= */}

        <Card className="top-header shadow-sm border-0">
<Card.Body className="d-flex justify-content-between align-items-center p-2">
        <div className="d-flex align-items-center gap-2">
      <Badge
 bg="primary"
 className="rounded-circle p-2"
>
 {user?.name?.charAt(0)||"A"}
</Badge>
            <div>
              <h6>Hi {user?.name || "Admin"} 👋</h6>

              <p>Here is your overview for today</p>
            </div>
          </div>

        <div className="d-flex align-items-center gap-2">
            {/* COMPANY */}

            <div className="header-select">
              <FaBuilding className="header-icon" />

   <Select
  menuPortalTarget={document.body}
  menuPosition="fixed"
  className="react-select-container"
  classNamePrefix="react-select"

  options={[
    ...new Map(
      clientSites.map(item => [
        String(item.client_id),
        {
          value: String(item.client_id),
          label: item.company_name,
        },
      ])
    ).values(),
  ]}

  value={
    [
      ...new Map(
        clientSites.map(item => [
          String(item.client_id),
          {
            value: String(item.client_id),
            label: item.company_name,
          },
        ])
      ).values(),
    ].find(
      x => String(x.value) === String(selectedCompany)
    ) || null
  }

  onChange={(selected) => {

    const id = selected?.value || "";

    console.log("Selected Company:", id);

    setSelectedCompany(String(id));
    setSelectedBranch("");
  }}

  placeholder="Select Client"
  isClearable
/>
            </div>

            {/* BRANCH */}

<div className="header-select">
  <FaCodeBranch className="header-icon" />

  <Select
    key={selectedCompany}
    menuPortalTarget={document.body}
    menuPosition="fixed"
    className="react-select-container"
    classNamePrefix="react-select"

    options={filteredSites.map(site => ({
      value: String(site.site_id),
      label: site.site_name,
    }))}

    value={
      filteredSites
        .map(site => ({
          value: String(site.site_id),
          label: site.site_name,
        }))
        .find(
          site =>
            site.value === String(selectedBranch)
        ) || null
    }

    onChange={selected => {
      const siteId = selected?.value || "";

      setSelectedBranch(siteId);

      console.log("Selected Company ID:", selectedCompany);
      console.log("Selected Site ID:", siteId);
      console.log("Selected Site Name:", selected?.label);
    }}

    placeholder={
      selectedCompany
        ? "Select Site"
        : "Select Client First"
    }

    isClearable
    isDisabled={!selectedCompany}
  />
</div>

<Form.Select
  className="modern-select"
  value={attendanceRange}
  onChange={(e) => setAttendanceRange(e.target.value)}
>
  <option value="today">Today</option>
  <option value="yesterday">Yesterday</option>
  <option value="7days">Last 7 Days</option>
  <option value="30days">Last 30 Days</option>
  <option value="currentMonth">Current Month</option>
  <option value="lastMonth">Last Month</option>
</Form.Select>
{attendanceRange === "custom" && (
  <div className="custom-date-wrapper">
<DatePicker
  selectsRange
  startDate={fromDate}
  endDate={toDate}
  onChange={(update) => {
    const [start, end] = update;

    console.log("Selected:", start, end);

    setFromDate(start);
    setToDate(end);
  }}
  placeholderText="Select Date Range"
  className="modern-date"
/>
  </div>
)}
            {/* MONTH */}

            {/* <Form.Select
              className="modern-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Month</option>

              {months.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </Form.Select> */}

            {/* YEAR */}

            {/* <Form.Select
              className="modern-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Year</option>

              {years.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select> */}

            {/* BUTTONS */}
<Button
  className="search"
  onClick={() => {
    setAttendancePage(1);

    fetchDashboardData({
      company_id: selectedCompany || "",
      site_id: selectedBranch || "",
      month: selectedMonth || "",
      year: selectedYear || "",
      filterType: attendanceRange,
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate),
    });
  }}
>
  <FaSearch />
</Button>
            <Button className="reset" onClick={handleReset}>
              <FaRedo />
            </Button>
          </div>
        </Card.Body>
        </Card>


        {/* ================= MAIN STATS ================= */}

        <Row className="g-4 mt-1">
          {/* CLIENTS CARD */}

          <Col lg={4} md={12}>
<div
  className="modern-card blue-card"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/add-new/client")}
>
              <div className="modern-card-header">
                <div className="card-left">
                  <div className="card-icon blue-icon">
                    <FaUsers />
                  </div>

                  <div>
                    <h5>Clients & Sites</h5>

                    <p>Registered Companies</p>
                  </div>
                </div>

              </div>

              <div className="card-mini-grid">
                <div className="mini-stat-box">
                  <h4>{dashboardData.totalClients}</h4>

                  <span>Clients</span>
                </div>

                <div className="mini-stat-box">
                  <h4>{dashboardData.totalSites}</h4>
  {/* <h4>{attendanceTotalCount}</h4> */}
                  <span>Sites</span>
                </div>
              </div>
            </div>
          <Col lg={12}>
  <div className="modern-card stage-main-card">
    <div className="modern-card-header">
      <div className="card-left">
        <div className="card-icon green-icon">
          <FaUsers />
        </div>

        <div>
          <h5>Employee Stage</h5>
          <p>Employee Status Overview</p>
        </div>
      </div>
    </div>

   <div className="employee-stage-grid">
  {dashboardData?.employeeStages?.map((item, index) => (
    <div
      key={index}
      className="stage-card"
      style={{ cursor: "pointer" }}
   onClick={() =>
  navigate("/employee/employee", {
    state: {
      activeTab:
        item.emp_stages === "Offer Letter Issued"
          ? "Offer"
          : item.emp_stages,
    },
  })
}
    >
      <div className="stage-icon">
        <FaUsers />
      </div>

      <div>
        <h4>{item.employee_count}</h4>
        <p>{item.emp_stages}</p>
      </div>
    </div>
  ))}
</div>
  </div>
</Col>
          </Col>

          {/* EMPLOYEE DOCUMENTS */}

          <Col lg={8} md={12}>
            <div className="modern-card purple-card">
              <div className="modern-card-header">
                <div className="card-left">
                  <div className="card-icon purple-icon">
                    <FaUserTie />
                  </div>

                  <div>
                    <h5>Employee Documents</h5>

                    <p>Employee Verification Overview</p>
                  </div>
                </div>

                <div className="big-count">{dashboardData.totalEmployees}</div>
              </div>

              {/* DOCUMENT GRID */}

              <div className="document-grid">
                {/* ================= AADHAR ================= */}

                <div
 className="doc-box"
style={{cursor:"pointer"}}
onClick={() => {
  console.log("Opening Aadhar document list");

  navigate("/employee/document-list/Aadhar", {
    state: { status: "All" },
  });
}}
>
                  <div className="doc-top">
                    <div className="doc-icon aadhar-bg" >
                      <FaIdCard />
                    </div>

                  <h6>Aadhaar Card</h6>
                    {/* <div className="doc-count">{dashboardData.totalAadhar}</div> */}
                  </div>


               <p

>
Verified : {dashboardData.verifiedAadhar}
</p>


<p

>
Pending : {dashboardData.pendingAadhar}
</p>


<p

>
Not Verified : {dashboardData.notVerifiedAadhar}
</p>
                </div>

                {/* ================= PAN ================= */}

              <div
 className="doc-box"
style={{cursor:"pointer"}}
 onClick={() =>
 navigate("/employee/document-list/PAN",{
   state:{
    status:"All"
   }
 })
}
>
       
                  <div className="doc-top">
                    <div className="doc-icon pan-bg">
                      <FaCreditCard />
                    </div>

                  <h6>PAN Card</h6>
                    {/* <div className="doc-count">{dashboardData.totalPan}</div> */}
                  </div>


               <p

>
Verified : {dashboardData.verifiedPan}
</p>


<p

>
Pending : {dashboardData.pendingPan}
</p>


<p

>
Not Verified : {dashboardData.notVerifiedPan}
</p>
                </div>

                {/* ================= PASSPORT ================= */}
        <div
 className="doc-box"
style={{cursor:"pointer"}}
 onClick={() =>
 navigate("/employee/document-list/Passport",{
   state:{
    status:"All"
   }
 })
}
>
                  <div className="doc-top">
                    <div className="doc-icon passport-bg">
                      <FaBook />
                    </div>

                    <h6>Passport</h6>
                    {/* <div className="doc-count">
                      {dashboardData.totalPassport}
                    </div> */}
                  </div>


               <p

>
Verified : {dashboardData.verifiedPassport}
</p>


<p

>
Pending : {dashboardData.pendingPassport}
</p>


<p

>
Not Verified : {dashboardData.notVerifiedPassport}
</p>
                </div>

                {/* ================= PF ================= */}

        <div
 className="doc-box"
style={{cursor:"pointer"}}
 onClick={() =>
 navigate("/employee/document-list/PF",{
   state:{
    status:"All"
   }
 })
}
>
                  <div className="doc-top">
                    <div className="doc-icon pf-bg">
                      <FaFileInvoiceDollar />
                    </div>

                  <h6>PF Details</h6>
                    {/* <div className="doc-count">{dashboardData.totalPf}</div> */}
                  </div>

<p

>
Verified : {dashboardData.verifiedPf}
</p>


<p

>
Pending : {dashboardData.pendingPf}
</p>


<p

>
Not Verified : {dashboardData.notVerifiedPf}
</p>
                </div>

                {/* ================= UAN ================= */}

        <div
 className="doc-box"
style={{cursor:"pointer"}}
 onClick={() =>
 navigate("/employee/document-list/UAN",{
   state:{
    status:"All"
   }
 })
}
>        <div className="doc-top">
                    <div className="doc-icon uan-bg">
                      <FaUserTie />
                    </div>

                  <h6>UAN Details</h6>
                    {/* <div className="doc-count">{dashboardData.totalUan}</div> */}
                  </div>


                  <p>Verified : {dashboardData.verifiedUan}</p>

                               <p>Pending : {dashboardData.pendingUan}</p>

                               <p>Not Verified : {dashboardData.notVerifiedUan}</p>
                </div>

                {/* ================= ESIC ================= */}
        <div
 className="doc-box"
style={{cursor:"pointer"}}
 onClick={() =>
 navigate("/employee/document-list/ESIC",{
   state:{
    status:"All"
   }
 })
}
>
                  <div className="doc-top">
                    <div className="doc-icon esic-bg">
                      <FaUniversity />
                    </div>

                  <h6>ESIC Details</h6>
                    {/* <div className="doc-count">{dashboardData.totalEsic}</div> */}
                  </div>


                                                     <p>Verified : {dashboardData.verifiedEsic}</p>

                                         <p>Pending : {dashboardData.pendingEsic}</p>

                                           <p>Not Verified : {dashboardData.notVerifiedEsic}</p>
                </div>

                {/* ================= BANK ================= */}
      <div
 className="doc-box"
style={{cursor:"pointer"}}
 onClick={() =>
 navigate("/employee/document-list/BANK",{
   state:{
    status:"All"
   }
 })
}
>
                  <div className="doc-top">
                    <div className="doc-icon bank-bg">
                      <FaBank />
                    </div>

                  <h6>Bank Details</h6>
                    {/* <div className="doc-count">{dashboardData.totalBank}</div> */}
                  </div>


                  <p>Verified : {dashboardData.verifiedBank}</p>

                  <p     >Pending : {dashboardData.pendingBank}</p>

                  <p>Not Verified : {dashboardData.notVerifiedBank}</p>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={12}>
            <div className="attendance-dashboard-card mt-3">
              {/* HEADER */}

           <div className="attendance-header">

  <div className="attendance-title">
    <div className="attendance-circle">
      <FaUsers />
    </div>

    <div>
      <h5>Attendance Report</h5>
      <span>Site wise monthly attendance details</span>
    {selectedAttendanceDate && (
    <div className="selected-date">
      Date : <strong>{formatDisplayDate(selectedAttendanceDate)}</strong>
    </div>
  )}
    </div>
  </div>

  <div className="attendance-summary">

    <div className="summary-box present-box">
      <h3>{dashboardData.presentAttendance}</h3>
      <span>Present</span>
    </div>

    <div className="summary-box absent-box">
      <h3>{dashboardData.absentAttendance}</h3>
      <span>Absent</span>
    </div>

    <div className="summary-box site-box">
       <h3>{dashboardData.totalSites}</h3>
      <span>Sites</span>
    </div>

  </div>

</div>
              {/* TABLE */}
<div className="d-flex justify-content-end mb-2">
  {selectedAttendanceDate && (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        setSelectedAttendanceDate("");
        setAttendancePage(1);
      }}
    >
   Go Back
    </Button>
  )}
</div>
              <div className="attendance-scroll">
                <table className="new-attendance-table">
      <thead>
  <tr>
{!selectedAttendanceDate ? (
  <>
   <th>Sr.</th>
    <th>Date</th>
    <th>Present</th>
    <th>Absent</th>
    <th>Unmarked</th>
    <th>WO</th>
    <th>Action</th>
  </>
) : (
  <>
    <th>Sr.</th>

    <th>Client</th>
    <th>Site</th>
    <th>Manpower</th>
    <th>Present</th>
    <th>Absent</th>
    <th>Unmarked</th>
    <th>WO</th>
  </>
)}
  </tr>
</thead>

                  {!selectedAttendanceDate ? (

attendanceList.map((row,index)=>(
<tr key={index}>

 <td>{(attendancePage - 1) * attendanceLimit + index + 1}</td>

<td>
  <span
    style={{
      cursor: "pointer",
      color: "blue",
      textDecoration: "underline",
    }}
    onClick={() => {
      window.open(
        `/attendance-details?date=${row.Date}`,
        "_blank"
      );
    }}
  >
    {formatDisplayDate(row.Date)}
  </span>
</td>
<td>{row.P}</td>
<td>{row.A}</td>
<td>{row.Unmarked}</td>
<td>{row.WO}</td>
<td>
<Dropdown drop="up">
  <Dropdown.Toggle 
    size="sm" 
    variant="primary"
  >
    Action
  </Dropdown.Toggle>

  <Dropdown.Menu>

<Dropdown.Item
  onClick={() => downloadEmployeeAttendance(row.Date, row.Date)}
>
  <FaUsers className="me-2" />
  Attendance Employee
</Dropdown.Item>

<Dropdown.Item
  onClick={() => downloadSiteAttendance(row.Date)}
>
  <FaBuilding className="me-2" />
  Attendance Site
</Dropdown.Item>

  </Dropdown.Menu>

</Dropdown>

</td>
</tr>
))

) : (

attendanceList.map((row,index)=>(
<tr key={index}>
 <td>{(attendancePage - 1) * attendanceLimit + index + 1}</td>

<td>{row.ClientName}</td>
<td>{row.SiteName}</td>
<td>{row.TotalManpowerOfSite}</td>
<td>{row.P}</td>
<td>{row.A}</td>
<td>{row.Unmarked}</td>
<td>{row.WO}</td>

</tr>
))

)}
                </table>

           <div className="attendance-pagination">

  {/* First */}
  <button
    className="page-btn"
    disabled={attendancePage === 1}
    onClick={() => changeAttendancePage(1)}
  >
    &laquo;
  </button>

  {/* Previous */}
  <button
    className="page-btn"
    disabled={attendancePage === 1}
    onClick={() => changeAttendancePage(attendancePage - 1)}
  >
    &lsaquo;
  </button>

  {/* Page Numbers */}
{getPageNumbers().map((page,index)=>(


page === "..." ?


<span
key={index}
className="dots"
>
...
</span>


:


<button

key={index}

className={`page-btn ${
attendancePage === page 
? 
"active-page" 
: 
""
}`}

onClick={()=>
changeAttendancePage(page)
}

>

{page}

</button>


))}

  {/* Next */}
  <button
    className="page-btn"
    disabled={attendancePage === attendanceTotalPages}
    onClick={() => changeAttendancePage(attendancePage + 1)}
  >
    &rsaquo;
  </button>

  {/* Last */}
  <button
    className="page-btn"
    disabled={attendancePage === attendanceTotalPages}
    onClick={() => changeAttendancePage(attendanceTotalPages)}
  >
    &raquo;
  </button>

</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* ================= QUICK ACTIONS ================= */}

        {/* <div className="quick-section">

        <div className="section-title">
          Quick Actions
        </div>

        <Row className="g-3">

          {actions.map((item) => (

            <Col
              xl={2}
              lg={3}
              md={4}
              sm={6}
              xs={6}
              key={item.name}
            >

         <div className="quick-action-card" onClick={() => navigate(item.path)} style={{ cursor: "pointer" }} >

                <div className="quick-icon">
                  {item.icon}
                </div>

                <h6>
                  {item.name}
                </h6>

              </div>

            </Col>

          ))}

        </Row>

      </div> */}
   </Row>
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
    </Container>
   
    
    );
}
