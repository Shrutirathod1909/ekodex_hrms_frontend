import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import AddVoucherForm from "./AddVoucherForm";
import PrintVoucher from "./PrintVoucher";
export default function Vouchers() {
  // --- States ---
  const [clients, setClients] = useState([]);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [editData, setEditData] = useState(null);
  const [bulkClient, setBulkClient] = useState(null);
  const [bulkSite, setBulkSite] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSites, setBulkSites] = useState([]);
  const [showUTRModal, setShowUTRModal] = useState(false);
  const [searchRows, setSearchRows] = useState([
    { id: Date.now(), searchField: "Select", keyword: "" },
  ]);
  const getCurrentMonthDates = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const fromDate = new Date(year, month, 1);
  const toDate = new Date(year, month + 1, 0);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  return {
    fromDate: formatDate(fromDate),
    toDate: formatDate(toDate),
  };
};

const currentMonthDates = getCurrentMonthDates();

const [fromDate, setFromDate] = useState(currentMonthDates.fromDate);
const [toDate, setToDate] = useState(currentMonthDates.toDate);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");
  const [printData, setPrintData] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const handleBack = (refresh = false) => {
    setShowAddForm(false);
    setEditData(null);

    if (refresh) {
      getAllVouchers(); // 🔥 IMPORTANT REFRESH
    }
  };
  const getCompanies = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/vouchers/getAllCompanies`);
      setClients(res.data.user || []);
    } catch (err) {
      console.log("Company Error:", err);
    }
  };
  useEffect(() => {
    getCompanies();
  }, []);

  
  const keyword = searchRows[0]?.keyword?.toLowerCase() || "";


const normalizeStatus = (status) => {
  const value = String(status ?? "").trim().toLowerCase();

  if (value === "0" || value === "pending") return "pending";
  if (value === "1" || value === "approved") return "approved";
  if (value === "2" || value === "rejected") return "rejected";
  if (value === "deleted") return "deleted";

  if (value.replace(/\s+/g, "_") === "payment_done") {
    return "payment_done";
  }

  return value;
};

const filteredVouchers = vouchers.filter((v) => {
  const status = normalizeStatus(v.status);

  const matchesTab =
    activeTab === "Pending"
      ? status === "pending"
      : activeTab === "Approved"
        ? status === "approved"
        : activeTab === "Rejected"
          ? status === "rejected"
          : activeTab === "Deleted Vouchers"
            ? status === "deleted"
            : activeTab === "Payment done"
              ? status === "payment_done"
              : true;

  const keyword = searchRows[0]?.keyword?.trim().toLowerCase() || "";

  const matchesSearch =
    !keyword ||
    String(v.voucher_no ?? "").toLowerCase().includes(keyword) ||
    String(v.emp_name ?? "").toLowerCase().includes(keyword) ||
    String(v.company_name ?? "").toLowerCase().includes(keyword);

  return matchesTab && matchesSearch;
});

  // --- Exact Branding Colors From Images ---
  const colors = {
    primaryTheme: "#00a2c2", // Cyan Blue (+ Button, Action, Search Fields)
    dangerTheme: "#ff4d4d", // Red Minus, Reset, Bulk Upload
    searchDark: "#1a4080", // Dark Blue Search, Add Voucher
    textSuccess: "#00cc66", // Green Counter Text
    darkBlueHeader: "#1d4487", // Top blue border line
    utrGreen: "#198754", // UTR Bulk Upload Green
  };
  const handleAutoTabSwitch = (data) => {
    if (!searchRows[0]?.keyword) return;

    const statuses = [...new Set(data.map((v) => v.status))];

    if (statuses.includes("pending")) setActiveTab("Pending");
    else if (statuses.includes("Approved")) setActiveTab("Approved");
    else if (statuses.includes("Rejected")) setActiveTab("Rejected");
    else if (statuses.includes("payment_done")) setActiveTab("Payment done");
    else if (statuses.includes("Deleted")) setActiveTab("Deleted Vouchers");
  };
  const getAllVouchers = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/vouchers/getAllVouchers?search=${searchRows[0]?.keyword || ""}&fromDate=${fromDate}&toDate=${toDate}`,
      );

      const data = await res.json();

      if (data.success) {
        const result = data.data || [];

        setVouchers(result);

        // 🔥 AUTO TAB SWITCH ADD करा
        handleAutoTabSwitch(result);
      }
    } catch (err) {
      console.log("Voucher Fetch Error =", err);
    }
  };
  useEffect(() => {
    getAllVouchers();
  }, [activeTab, fromDate, toDate, searchRows[0]?.keyword]);
  // --- Tabs List ---
  const tabs = [
    "Pending",
    "Approved",
    "Rejected",
    "Payment done",
    "Deleted Vouchers",
  ];

  // ================= DELETE API =================
  const downloadUTRTemplate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vouchers/utr-template`);

      // ❌ ERROR HANDLING (SMART + SAFE)
      if (!response.ok) {
        const contentType = response.headers.get("content-type");

        let errorMessage = "Download failed";

        try {
          if (contentType && contentType.includes("application/json")) {
            const err = await response.json();
            errorMessage = err.message || errorMessage;
          } else {
            errorMessage = await response.text();
          }
        } catch (e) {
          errorMessage = "Server error occurred";
        }

        // 👉 THIS WILL SHOW PROPER ERROR
        alert("❌ " + errorMessage);
        console.error("Backend Error:", errorMessage);

        return; // stop execution
      }

      // ✅ SUCCESS FILE DOWNLOAD
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "UTR_Template.xlsx";

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Frontend Error:", error);
      alert("❌ Network / Server issue: " + error.message);
    }
  };
  const getSitesByClient = async (client_id) => {
    try {
      const res = await axios.post(`${API_URL}/api/vouchers/getAllBranches`, {
        client_id,
      });

      setBulkSites(res.data.user || []);
    } catch (err) {
      console.log(err);
    }
  };
  const deleteVoucher = async (id) => {
    try {
      // 🔥 LOGIN USER DATA
      const userData = JSON.parse(localStorage.getItem("user"));

      const payload = {
        disabled_by: userData?.id || "",
        deleted_by_name:
          userData?.name || userData?.username || userData?.employee_name || "",
      };

      console.log("🚀 DELETE REQUEST START");
      console.log("ID:", id);
      console.log("PAYLOAD:", payload);

      const res = await fetch(`${API_URL}/api/vouchers/delete/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // ✅ FULL RESPONSE LOG
      console.log("📩 DELETE API RESPONSE:", data);
      console.log("STATUS:", res.status);
      console.log("OK:", res.ok);

      if (data.success) {
        console.log("✅ DELETE SUCCESS FOR ID:", id);

        alert("Voucher Deleted Successfully");

        // refresh table
        getAllVouchers();

        // close dropdown
        setOpenDropdownIdx(null);
      } else {
        console.log("❌ DELETE FAILED RESPONSE:", data);

        alert(data.message || "Delete Failed");
      }
    } catch (err) {
      console.log("🔥 DELETE ERROR (CATCH):", err);
      console.log("STACK:", err?.stack);

      alert("Something went wrong");
    }
  };
  const approveVoucher = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));

      const payload = {
        approved_by: userData?.id || "",
        approved_by_name:
          userData?.name ||
          userData?.username ||
          userData?.employee_name ||
          "Admin",
      };

      console.log("🚀 APPROVE REQUEST START");
      console.log("ID:", id);
      console.log("PAYLOAD:", payload);

      const res = await fetch(`${API_URL}/api/vouchers/approve/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("📩 APPROVE RESPONSE:", data);
      console.log("STATUS:", res.status);

      if (data.success) {
        alert("Voucher Approved Successfully");

        getAllVouchers(); // refresh table
        setOpenDropdownIdx(null);
      } else {
        alert(data.message || "Approve Failed");
      }
    } catch (err) {
      console.log("🔥 APPROVE ERROR:", err);
      alert("Something went wrong");
    }
  };
  const rejectVoucher = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));

      const payload = {
        rejected_by: userData?.id || "",
        rejected_by_name:
          userData?.name ||
          userData?.username ||
          userData?.employee_name ||
          "Admin",
      };

      const res = await fetch(`${API_URL}/api/vouchers/reject/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Voucher Rejected Successfully");
        getAllVouchers();
        setOpenDropdownIdx(null);
      } else {
        alert(data.message || "Reject Failed");
      }
    } catch (err) {
      console.log("REJECT ERROR:", err);
      alert("Something went wrong");
    }
  };
  // --- Header Title Logic Based on Tab ---
  const getHeaderTitle = () => {
    if (activeTab === "Rejected") return "Cancelled Vouchers";
    return `${activeTab} Vouchers`;
  };
  const handleUTRBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 🔥 ADD LOGIN USER
      formData.append("user_id", user?.id || "");
      formData.append("user_name", user?.name || user?.username || "");

      const res = await fetch(`${API_URL}/api/vouchers/upload-utr`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("UTR RESPONSE =", data);

      if (data.success) {
        alert(
          `UTR Upload Success
Updated: ${data.updated || 0}
Skipped: ${data.skipped || 0}`,
        );

        getAllVouchers();
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.log("UTR Upload Error =", error);
      alert("Bulk upload failed");
    }
  };
  const exportEmployees = async () => {
    try {
      const client_id = bulkClient || "";
      const site_id = bulkSite || "";

      const response = await fetch(
        `${API_URL}/api/vouchers/download-employees?client_id=${client_id}&site_id=${site_id}`,
      );

      if (!response.ok) {
        alert("Export failed");
        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "employees.xlsx";

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("Export Error:", err);
      alert("Export failed");
    }
  };
  const handleBulkUpload = async () => {
    try {
      if (!bulkClient) {
        alert("Select Client");
        return;
      }

      if (!bulkSite) {
        alert("Select Site");
        return;
      }

      if (!bulkFile) {
        alert("Select File");
        return;
      }

      const formData = new FormData();

      formData.append("file", bulkFile);

      // IMPORTANT
      formData.append("client_id", bulkClient);
      formData.append("site_id", bulkSite);
      const response = await axios.post(
        `${API_URL}/api/vouchers/bulk-upload-emp-advance`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      alert(response.data.message);

      setIsBulkUploadOpen(false);
    } catch (error) {
      console.log(error);

      alert(error?.response?.data?.message || "Upload Failed");
    }
  };
  // --- Counter/Total Stats Logic Based on Tab ---
  const getStatsText = () => {
    const total = filteredVouchers.length;

    const totalAmount = filteredVouchers.reduce((sum, v) => {
      return sum + (Number(v.amount) || 0);
    }, 0);

    switch (activeTab) {
      case "Pending":
        return `Total Vouchers: ${total} | Amt: ${totalAmount.toLocaleString()}`;

      case "Approved":
        return `Total Vouchers: ${total} | Amt: ${totalAmount.toLocaleString()}`;

      case "Rejected":
        return `Total Vouchers: ${total} | Amt: ${totalAmount.toLocaleString()}`;

      case "Payment done":
        return `Total Vouchers: ${total} | Amt: ${totalAmount.toLocaleString()}`;

      case "Deleted Vouchers":
        return `Total Vouchers: ${total} | Amt: ${totalAmount.toLocaleString()}`;

      default:
        return "Total: 0";
    }
  };

  if (showPrint) {
    return (
      <div>
        <PrintVoucher data={printData} onBack={() => setShowPrint(false)} />
      </div>
    );
  }
  // --- Dynamic Mock Table Data per Tab ---

  // --- Dynamic Search Handlers ---
  const addSearchRow = () => {
    setSearchRows([
      ...searchRows,
      { id: Date.now(), searchField: "Select", keyword: "" },
    ]);
  };

  const removeSearchRow = (id) => {
    if (searchRows.length > 1) {
      setSearchRows(searchRows.filter((row) => row.id !== id));
    } else {
      setSearchRows([{ id: Date.now(), searchField: "Select", keyword: "" }]);
    }
  };

  const handleRowInputChange = (id, field, value) => {
    setSearchRows(
      searchRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    );
  };

  // टॅब बदलल्यावर ओपन असलेले ड्रॉपडाउन बंद करणे
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setOpenDropdownIdx(null);
  };

  return (
    <>
      {showUTRModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 99999,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowUTRModal(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{
              width: "420px",
              animation: "fadeIn 0.2s ease-in-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">📤 UTR Bulk Upload</h5>

              <button
                className="btn btn-sm btn-light"
                onClick={() => setShowUTRModal(false)}
              >
                ✖
              </button>
            </div>

            <p className="text-muted small mb-3">
              Upload Excel file (.xlsx / .xls) for bulk UTR update
            </p>

            {/* DOWNLOAD TEMPLATE */}
            <button
              className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
              onClick={downloadUTRTemplate}
            >
              📥 Download Template
            </button>

            {/* FILE UPLOAD BOX */}
            <div
              className="border rounded-3 p-3 text-center mb-3"
              style={{
                borderStyle: "dashed",
                cursor: "pointer",
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                className="form-control d-none"
                id="utrFile"
                onChange={handleUTRBulkUpload}
              />

              <label htmlFor="utrFile" style={{ cursor: "pointer" }}>
                <div className="mb-2 fs-3">📂</div>
                <div className="fw-semibold">Click to Upload File</div>
                <small className="text-muted">
                  or drag & drop Excel file here
                </small>
              </label>
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-success w-50"
                onClick={handleUTRBulkUpload}
              >
                🚀 Upload
              </button>

              <button
                className="btn btn-outline-secondary w-50"
                onClick={() => setShowUTRModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isBulkUploadOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 99999 }}
          onClick={() => setIsBulkUploadOpen(false)}
        >
          <div
            className="bg-white p-3 rounded shadow"
            style={{ width: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h6 className="mb-3">Bulk Upload</h6>

            {/* CLIENT */}
            <select
              className="form-select form-select-sm mb-2"
              value={bulkClient ?? ""}
              onChange={(e) => {
                setBulkClient(e.target.value);
                getSitesByClient(e.target.value);
              }}
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* SITE */}
            <select
              className="form-select form-select-sm mb-2"
              value={bulkSite ?? ""}
              onChange={(e) => setBulkSite(e.target.value)}
            >
              <option value="">Select Site</option>
              {bulkSites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.site_name}
                </option>
              ))}
            </select>

            {/* DOWNLOAD TEMPLATE */}
            <button
              className="btn btn-primary btn-sm w-100 mb-2"
              onClick={exportEmployees}
            >
              📥 Download Template
            </button>

            {/* FILE */}
            <input
              type="file"
              className="form-control form-control-sm mb-3"
              accept=".xlsx,.xls"
              onChange={(e) => setBulkFile(e.target.files[0])}
            />

            {/* BUTTONS */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-secondary btn-sm w-50"
                onClick={() => setIsBulkUploadOpen(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-success btn-sm w-50"
                onClick={handleBulkUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddForm ? (
        <AddVoucherForm onBack={handleBack} editData={editData} />
      ) : (
        <div
          className="w-100 bg-light min-vh-100 p-3"
          style={{ fontSize: "11px", fontFamily: "sans-serif" }}
          onClick={() => setOpenDropdownIdx(null)}
        >
          {/* ================= MAIN CARD CONTAINER ================= */}
          <div
            className="card shadow-sm border border-secondary border-opacity-25 rounded-0 bg-white mb-3 w-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ================= TOP HEADER BAR ================= */}
            <div
              className="card-header bg-white d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
              style={{ borderTop: `3px solid ${colors.darkBlueHeader}` }}
            >
              <h5
                className="fw-bold m-0 text-secondary"
                style={{ fontSize: "15px" }}
              >
                {getHeaderTitle()}
              </h5>

              <div className="d-flex align-items-center gap-1">
                <span
                  className="fw-bold me-2"
                  style={{ color: colors.textSuccess, fontSize: "13px" }}
                >
                  {getStatsText()}
                </span>

                <button
                  className="btn btn-sm text-white border-0 fw-medium"
                  style={{
                    backgroundColor: colors.primaryTheme,
                    fontSize: "10px",
                    borderRadius: "2px",
                    padding: "4px 8px",
                  }}
                >
                  Click Here To Search
                </button>
                <button
                  className="btn btn-sm text-white border-0 fw-medium"
                  style={{
                    backgroundColor: colors.searchDark,
                    fontSize: "10px",
                    borderRadius: "2px",
                    padding: "4px 8px",
                  }}
                  onClick={() => setShowAddForm(true)}
                >
                  Add Voucher
                </button>
                {activeTab === "Approved" && (
                  <>
                    <button
                      className="btn btn-sm text-white border-0 fw-medium"
                      style={{
                        backgroundColor: colors.dangerTheme,
                        fontSize: "10px",
                        borderRadius: "2px",
                        padding: "4px 8px",
                      }}
                      onClick={() => setIsBulkUploadOpen(true)}
                    >
                      + Bulk Upload
                    </button>
                    <button
                      className="btn btn-sm text-white border-0 fw-medium"
                      style={{
                        backgroundColor: colors.utrGreen,
                        fontSize: "10px",
                        borderRadius: "2px",
                        padding: "4px 8px",
                      }}
                      onClick={() => setShowUTRModal(true)}
                    >
                      ⬆ UTR Bulk Upload
                    </button>
                  </>
                )}
                {activeTab === "Payment done" && (
                  <button
                    className="btn btn-sm text-white border-0 fw-medium"
                    style={{
                      backgroundColor: colors.dangerTheme,
                      fontSize: "10px",
                      borderRadius: "2px",
                      padding: "4px 8px",
                    }}
                  >
                    + Bulk Upload
                  </button>
                )}
              </div>
            </div>

            {/* ================= FILTER PANEL ================= */}
            <div className="card-body p-3">
              <div className="row g-3 m-0 w-100">
                {/* LEFT PANEL: Inputs */}
                <div className="col-md-7 border-end pe-md-3 ps-0">
                  {searchRows.map((row, index) => (
                    <div className="row g-2 mb-2 align-items-end" key={row.id}>
                      <div className="col-sm-5">
                        {index === 0 && (
                          <label
                            className="form-label text-secondary fw-bold mb-1"
                            style={{ fontSize: "10px" }}
                          >
                            Select Search Field
                          </label>
                        )}
                        <select
                          className="form-select form-select-sm text-secondary"
                          style={{
                            height: "26px",
                            fontSize: "11px",
                            borderRadius: "2px",
                          }}
                          value={row.searchField}
                          onChange={(e) =>
                            handleRowInputChange(
                              row.id,
                              "searchField",
                              e.target.value,
                            )
                          }
                        >
                          <option value="Select">Select</option>
                          <option value="Voucher No">Voucher No</option>
                        </select>
                      </div>

                      <div className="col-sm-5">
                        {index === 0 && (
                          <label
                            className="form-label text-secondary fw-bold mb-1"
                            style={{ fontSize: "10px" }}
                          >
                            Enter Keyword
                          </label>
                        )}
                        <input
                          type="text"
                          className="form-control form-control-sm text-secondary"
                          style={{
                            height: "26px",
                            fontSize: "11px",
                            borderRadius: "2px",
                          }}
                          value={row.keyword}
                          onChange={(e) =>
                            handleRowInputChange(
                              row.id,
                              "keyword",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="col-sm-2 d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm text-white border-0 fw-bold p-0 d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: colors.primaryTheme,
                            width: "24px",
                            height: "26px",
                            borderRadius: "2px",
                          }}
                          onClick={addSearchRow}
                        >
                          <span>+</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm text-white border-0 fw-bold p-0 d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: colors.dangerTheme,
                            width: "24px",
                            height: "26px",
                            borderRadius: "2px",
                          }}
                          onClick={() => removeSearchRow(row.id)}
                        >
                          <span>−</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RIGHT PANEL: Dates & Actions */}
                <div className="col-md-5 ps-md-3 pe-0 d-flex flex-column justify-content-between">
               <div className="row g-2 mb-2">
  <div className="row">
    <div className="col">
      <label>From Date</label>
      <input
        type="date"
        className="form-control"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
    </div>

    <div className="col">
      <label>To Date</label>
      <input
        type="date"
        className="form-control"
        value={toDate}
        min={fromDate || undefined}
        onChange={(e) => setToDate(e.target.value)}
      />
    </div>
  </div>
</div>

                  <div className="d-flex gap-1 justify-content-start mt-2">
                    <button
                      className="btn btn-sm text-white"
                      style={{ backgroundColor: colors.searchDark }}
                      onClick={() => getAllVouchers()}
                    >
                      🔍 Search
                    </button>
                    <button
                      className="btn btn-sm text-white"
                      style={{ backgroundColor: colors.dangerTheme }}
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                        setSearchRows([
                          {
                            id: Date.now(),
                            searchField: "Select",
                            keyword: "",
                          },
                        ]);
                        getAllVouchers();
                      }}
                    >
                      🔄 Reset
                    </button>
                    <button
                      className="btn btn-sm text-white border-0 px-3 py-3 d-flex align-items-center gap-1"
                      style={{
                        backgroundColor: colors.primaryTheme,
                        fontSize: "13px",
                        borderRadius: "4px",
                        height: "26px",
                      }}
                    >
                      📥 Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= TABS NAVIGATION ================= */}
          <ul
            className="nav nav-tabs nav-fill border-bottom bg-white w-100"
            style={{ fontSize: "11px" }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link border-end border-start px-2 py-2 fw-medium rounded-0 
            ${
              isActive
                ? "active bg-white fw-bold text-dark border-bottom-0"
                : "bg-light text-secondary"
            }`}
                    style={{
                      fontSize: "11px",
                      transition: "none",
                      // Add a thick colored border to the active tab to "highlight" it
                      borderTop: isActive
                        ? `3px solid ${colors.primaryTheme}`
                        : "1px solid #dee2e6",
                    }}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4"></div>
          {/* ================= DATA GRID TABLES ================= */}
          <div
            className="card border border-top-0 border-secondary border-opacity-25 rounded-0 bg-white p-0 shadow-sm w-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="table-responsive w-100 m-0"
              style={{ overflow: "visible" }}
            >
              <table
                className="table table-sm table-bordered table-hover align-middle mb-0 text-secondary w-100"
                style={{ fontSize: "11px" }}
              >
                {/* --- Thead --- */}
                <thead
                  className="table-light text-dark fw-bold"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  {activeTab === "Pending" && (
                    <tr>
                      <th className="text-center" style={{ width: "30px" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{ width: "12px", height: "12px" }}
                        />
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        Sr No
                      </th>
                      <th style={{ width: "120px" }}>
                        Voucher No
                        <br />
                        Payment Date
                      </th>
                      <th>
                        Client Name
                        <br />
                        Site
                      </th>
                      <th>
                        Employee
                        <br />
                        Gang
                      </th>
                      <th>Particular</th>
                      <th>
                        Total Paid
                        <br />
                        Mode
                      </th>
                      <th>Created Detail</th>
                      <th className="text-center" style={{ width: "90px" }}>
                        Action
                      </th>
                    </tr>
                  )}
                  {activeTab === "Approved" && (
                    <tr>
                      <th className="text-center" style={{ width: "30px" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{ width: "12px", height: "12px" }}
                        />
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        Sr No
                      </th>
                      <th style={{ width: "120px" }}>
                        Voucher No
                        <br />
                        Payment Date
                      </th>
                      <th>
                        Client Name
                        <br />
                        Site
                      </th>
                      <th>Employee</th>
                      <th>Particular</th>
                      <th>
                        Total Paid
                        <br />
                        Mode
                      </th>
                      <th>Created By</th>
                      <th>Approved Detail</th>
                      <th className="text-center" style={{ width: "90px" }}>
                        Action
                      </th>
                    </tr>
                  )}
                  {activeTab === "Rejected" && (
                    <tr>
                      <th style={{ width: "50px" }}>Sr No</th>
                      <th>Voucher No</th>
                      <th>
                        Client Name
                        <br />
                        Site
                      </th>
                      <th>
                        Employee Name
                        <br />
                        Gang
                      </th>
                      <th>Particular</th>
                      <th>
                        Mode
                        <br />
                        Total Paid
                      </th>
                      <th>Created Detail</th>
                      <th>Rejected Detail</th>
                      <th className="text-center" style={{ width: "90px" }}>
                        Action
                      </th>
                    </tr>
                  )}
                  {activeTab === "Payment done" && (
                    <tr>
                      <th className="text-center" style={{ width: "30px" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{ width: "12px", height: "12px" }}
                        />
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        Sr No
                      </th>
                      <th style={{ width: "120px" }}>
                        Voucher No
                        <br />
                        Payment Date
                      </th>
                      <th>
                        Client Name
                        <br />
                        Site
                      </th>
                      <th>
                        Particular
                        <br />
                        Type
                      </th>
                      <th>
                        Total Paid
                        <br />
                        Mode
                      </th>
                      <th>Company</th>
                      <th>UTR Details</th>
                      <th>Created By</th>
                      <th className="text-center" style={{ width: "90px" }}>
                        Action
                      </th>
                    </tr>
                  )}
                  {activeTab === "Deleted Vouchers" && (
                    <tr>
                      <th className="text-center" style={{ width: "30px" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{ width: "12px", height: "12px" }}
                        />
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        Sr No
                      </th>
                      <th>Voucher No</th>
                      <th>
                        Client Name
                        <br />
                        Site
                      </th>
                      <th>Employee Name</th>
                      <th>Mode</th>
                      <th>Total Paid</th>
                      <th>Created Detail</th>
                    </tr>
                  )}
                </thead>

                {/* --- Tbody --- */}
                <tbody>
                  {filteredVouchers.map((row, idx) => (
                    <tr key={idx} className="bg-white">
                      {/* --- PENDING TAB ROWS --- */}
                      {activeTab === "Pending" && (
                        <>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ width: "12px", height: "12px" }}
                            />
                          </td>
                          <td className="text-center">{idx + 1}</td>
                          <td>
                            <div className="fw-bold text-dark">
                              {row.voucher_no}
                            </div>

                            <div className="text-muted">{row.payment_date}</div>
                          </td>
                          <td>
                            <div>COMPANY : {row.company_name}</div>
                            <div>SITE : {row.site_name}</div>
                          </td>
                          <td>
                            <div>EMPLOYEE : {row.emp_name}</div>
                            {/* <div>GANG : {row.gang_name}</div> */}
                          </td>
                          <td>
                            <div>
                              PARTICULAR :
                              {(() => {
                                try {
                                  const particulars = JSON.parse(
                                    row.particular || "[]",
                                  );

                                  return particulars
                                    .filter((p) => p.particular || p.amount)
                                    .map((p, i) => (
                                      <div key={i}>
                                        {p.particular} - ₹{p.amount}
                                      </div>
                                    ));
                                } catch (err) {
                                  return row.particular;
                                }
                              })()}
                            </div>

                            <div>TYPE : {row.type}</div>
                          </td>
                          <td>
                            <div className="fw-bold text-dark">
                              AMOUNT : {row.amount}
                            </div>

                            <div>MODE : {row.mode}</div>
                          </td>
                          <td>{row.created_on}</td>
                          <td className="text-center position-relative overflow-visible">
                            <div className="dropdown">
                              {/* BUTTON */}
                              <button
                                className="btn btn-sm text-white fw-semibold d-flex align-items-center gap-1 shadow-sm"
                                style={{
                                  backgroundColor: colors.primaryTheme,
                                  fontSize: "11px",
                                  borderRadius: "3px",
                                  padding: "4px 14px",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownIdx(
                                    openDropdownIdx === idx ? null : idx,
                                  );
                                }}
                              >
                                Action
                                <span style={{ fontSize: "10px"}}>▼</span>
                              </button>

                              {/* DROPDOWN */}
                              {openDropdownIdx === idx && (
                                <div
                                  className="position-absolute end-0 mt-1 bg-white border rounded-3 shadow-lg"
                                  style={{
                                    width: "160px",
                                    zIndex: 9999,
                                    overflow: "hidden",
                                  }}
                                >
                                  {/* EDIT */}
                                  <button
                                    className="w-100 text-start px-3 py-2 border-0 bg-white dropdown-hover"
                                    onClick={() => {
                                      setEditData(row);
                                      setShowAddForm(true);
                                      setOpenDropdownIdx(null);
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>

                                  {/* DELETE */}
                                  <button
                                    className="w-100 text-start px-3 py-2 border-0 bg-white text-danger dropdown-hover"
                                    onClick={() => deleteVoucher(row.id)}
                                  >
                                    🗑️ Delete
                                  </button>

                                  {/* APPROVE */}
                                  <button
                                    className="w-100 text-start px-3 py-2 border-0 bg-white text-success dropdown-hover"
                                    onClick={() => approveVoucher(row.id)}
                                  >
                                    ✔ Approve
                                  </button>

                                  {/* REJECT */}
                                  <button
                                    className="w-100 text-start px-3 py-2 border-0 bg-white text-warning dropdown-hover"
                                    onClick={() => rejectVoucher(row.id)}
                                  >
                                    ❌ Reject
                                  </button>

                                  {/* PRINT */}
                                  <button
                                    className="w-100 text-start px-3 py-2 border-0 bg-white dropdown-hover"
                                    onClick={() => {
                                      setPrintData(row);
                                      setShowPrint(true);
                                      setOpenDropdownIdx(null);
                                    }}
                                  >
                                    🖨 Print
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* --- APPROVED TAB ROWS --- */}
                      {activeTab === "Approved" && (
                        <>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ width: "12px", height: "12px" }}
                            />
                          </td>

                          <td className="text-center">{idx + 1}</td>

                          <td>
                            <div className="fw-bold text-dark">
                              {row.voucher_no}
                            </div>
                            <div className="text-muted">{row.payment_date}</div>
                          </td>

                          <td>
                            <div>{row.company_name}</div>
                            <div>{row.site_name}</div>
                          </td>

                          <td>
                            <div>{row.emp_name}</div>
                            <div>{row.gang_name}</div>
                          </td>

                          <td>
                            {(() => {
                              try {
                                const list = JSON.parse(row.particular || "[]");
                                return list
                                  .filter((p) => p.particular && p.amount)
                                  .map((p, i) => (
                                    <div key={i}>
                                      {p.particular} - ₹{p.amount}
                                    </div>
                                  ));
                              } catch {
                                return row.particular;
                              }
                            })()}
                          </td>

                          <td>
                            <div className="fw-bold text-dark">
                              ₹ {row.amount}
                            </div>
                            <div>{row.mode}</div>
                          </td>

                          <td>
                            <div>{row.created_by}</div>
                            <div className="text-muted">{row.created_on}</div>
                          </td>

                          <td>
                            <div>Approved By: {row.approved_by}</div>
                            <div className="text-muted">{row.approved_on}</div>
                          </td>
                          <td className="text-center position-relative overflow-visible">
                            <div className="dropdown">
                              <button
                                className="btn btn-sm text-white border-0"
                                style={{
                                  backgroundColor: colors.primaryTheme,
                                  fontSize: "11px",
                                  padding: "2px 6px",
                                  lineHeight: "1",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownIdx(
                                    openDropdownIdx === idx ? null : idx,
                                  );
                                }}
                              >
                                Action ▾
                              </button>

                              {openDropdownIdx === idx && (
                                <ul
                                  className="dropdown-menu show shadow border position-absolute end-0 mt-1"
                                  style={{
                                    zIndex: 9999,
                                    minWidth: "120px",
                                    fontSize: "12px",
                                    padding: "4px 0",
                                  }}
                                >
                                  <li>
                                    <button
                                      className="dropdown-item py-1 px-2"
                                      style={{ fontSize: "12px" }}
                                      onClick={() => {
                                        setEditData(row);
                                        setShowAddForm(true);
                                        setOpenDropdownIdx(null);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </li>

                                  <li>
                                    <button
                                      className="dropdown-item py-1 px-2 text-danger"
                                      style={{ fontSize: "12px" }}
                                      onClick={() => deleteVoucher(row.id)}
                                    >
                                      Delete
                                    </button>
                                  </li>

                                  <li>
                                    <button
                                      className="dropdown-item py-1 px-2"
                                      style={{ fontSize: "12px" }}
                                      onClick={() => {
                                        setPrintData(row);
                                        setShowPrint(true);
                                        setOpenDropdownIdx(null);
                                      }}
                                    >
                                      Print
                                    </button>
                                  </li>
                                </ul>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* --- REJECTED TAB ROWS --- */}
                      {activeTab === "Rejected" && (
                        <>
                          <td className="text-center">{idx + 1}</td>

                          <td>
                            <div className="fw-bold text-dark">
                              {row.voucher_no}
                            </div>
                            <div className="text-muted">{row.payment_date}</div>
                          </td>

                          <td>
                            <div>{row.company_name}</div>
                            <div>{row.site_name}</div>
                          </td>

                          <td>
                            <div>{row.emp_name}</div>
                            <div>{row.gang_name}</div>
                          </td>

                          <td>
                            {(() => {
                              try {
                                const list = JSON.parse(row.particular || "[]");
                                return list
                                  .filter((p) => p.particular && p.amount)
                                  .map((p, i) => (
                                    <div key={i}>
                                      {p.particular} - ₹{p.amount}
                                    </div>
                                  ));
                              } catch {
                                return row.particular;
                              }
                            })()}
                          </td>

                          <td>
                            <div className="fw-bold text-dark">
                              ₹ {row.amount}
                            </div>
                            <div>{row.mode}</div>
                          </td>

                          <td>
                            <div>{row.created_by}</div>
                            <div className="text-muted">{row.created_on}</div>
                          </td>

                          <td>
                            <div>{row.rejectedDetail}</div>

                            <div className="text-muted">
                              <small>
                                Rejected by: {row.rejected_by || "-"}
                              </small>
                            </div>

                            <div className="text-muted">
                              <small>
                                Rejected on: {row.rejected_on || "-"}
                              </small>
                            </div>
                          </td>

                          <td className="text-center">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => approveVoucher(row.id || row._id)}
                            >
                              Approve
                            </button>
                          </td>
                        </>
                      )}

                      {/* --- PAYMENT DONE TAB ROWS --- */}
                      {activeTab === "Payment done" && (
                        <>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                            />
                          </td>

                          <td className="text-center">{idx + 1}</td>

                          <td>
                            <div className="fw-bold text-dark">
                              {row.voucher_no}
                            </div>
                            <div className="text-muted">{row.payment_date}</div>
                          </td>

                          <td>
                            <div>{row.company_name}</div>
                            <div>{row.site_name}</div>
                          </td>

                          <td>
                            <div>{row.emp_name}</div>
                          </td>

                          <td>
                            <div className="fw-bold text-dark">
                              ₹ {row.amount}
                            </div>
                            <div>{row.mode}</div>
                          </td>

                          <td>
                            <div>{row.company_name}</div>
                          </td>

                          {/* ✅ FIXED UTR SECTION */}
                          <td>
                            <div className="fw-bold">
                              UTR No: {row.utr_no || "-"}
                            </div>

                            <div>UTR By: {row.utr_updated_by_Name || "-"}</div>

                            <div className="text-muted">
                              UTR On: {row.utr_updated_on || "-"}
                            </div>
                          </td>

                          <td>
                            {row.created_by_name || "-"}

                            <div className="text-muted">{row.created_on}</div>
                          </td>

                          <td>
                            <td className="text-center position-relative">
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm text-white"
                                  style={{
                                    backgroundColor: "#00a2c2",
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownIdx(
                                      openDropdownIdx === idx ? null : idx,
                                    );
                                  }}
                                >
                                  Action ▾
                                </button>

                                {openDropdownIdx === idx && (
                                  <div
                                    className="position-absolute end-0 mt-1 bg-white border rounded shadow"
                                    style={{ minWidth: "140px", zIndex: 9999 }}
                                  >
                                    {/* EDIT */}
                                    <button
                                      className="w-100 text-start px-3 py-2 border-0 bg-white"
                                      onClick={() => {
                                        setEditData(row);
                                        setShowAddForm(true);
                                        setOpenDropdownIdx(null);
                                      }}
                                    >
                                      ✏️ Edit
                                    </button>

                                    {/* DELETE */}
                                    <button
                                      className="w-100 text-start px-3 py-2 border-0 bg-white text-danger"
                                      onClick={() => deleteVoucher(row.id)}
                                    >
                                      🗑 Delete
                                    </button>

                                    {/* PRINT */}
                                    <button
                                      className="w-100 text-start px-3 py-2 border-0 bg-white"
                                      onClick={() => {
                                        setPrintData(row);
                                        setShowPrint(true);
                                        setOpenDropdownIdx(null);
                                      }}
                                    >
                                      🖨 Print
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </td>
                        </>
                      )}

                      {/* --- DELETED TAB ROWS --- */}
                      {activeTab === "Deleted Vouchers" && (
                        <>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ width: "12px", height: "12px" }}
                            />
                          </td>
                          <td className="text-center">{idx + 1}</td>
                          <td className="fw-bold text-dark">
                            {row.voucher_no}
                          </td>
                          <td>
                            <div>{row.company_name}</div>
                            <div>{row.site_name}</div>
                          </td>
                          <td>{row.emp_name}</td>
                          <td>{row.mode}</td>
                          <td>
                            <div className="fw-bold text-dark">
                              AMOUNT : {row.amount}
                            </div>

                            <div>MODE : {row.mode}</div>
                          </td>
                          <td>
                            <div>{row.created_by}</div>
                            <div className="text-muted">{row.created_on}</div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
