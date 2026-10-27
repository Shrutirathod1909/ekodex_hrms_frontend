import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function WorkOrderUI() {
  // --- States ---
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState("approved");
  const [searchRows, setSearchRows] = useState([
  { id: Date.now(), searchField: "Work Order No", keyword: "" }
]);
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    searchField: "Work Order No",
    keyword: "061460",
    fromDate: "",
    toDate: "",
  });

  // --- Exact Branding Colors (From Image) ---
  const colors = {
    primaryTheme: "#00a2c2", // Cyan color from "Click Here To Search" & Action buttons
    dangerTheme: "#ff4d4d",  // Red color from minus/reset buttons
    searchDark: "#1a4080",   // Dark blue from search button
    successTheme: "#00cc66", // Green status badge
  };

  const tabConfiguration = [
    { key: "approved", label: "Approved", count: 2, color: "success" },
    { key: "pending", label: "Pending", count: 3, color: "primary" },
    { key: "rejected", label: "Rejected", count: 0, color: "danger" },
    { key: "queue", label: "Job Queue", count: 2, color: "warning" },
  ];

  // Navin query row add karnyasathi handler
const addSearchRow = () => {
  setSearchRows([
    ...searchRows,
    { id: Date.now(), searchField: "Work Order No", keyword: "" }
  ]);
};

// Row remove karnyasathi handler (Kamit kami ek row rahilach)
const removeSearchRow = (id) => {
  if (searchRows.length > 1) {
    setSearchRows(searchRows.filter(row => row.id !== id));
  } else {
    // Jar ekch row asel tar fatth state clear kara
    setSearchRows([{ id: Date.now(), searchField: "Work Order No", keyword: "" }]);
  }
};

// Row input change handle karnyasathi
const handleRowInputChange = (id, field, value) => {
  setSearchRows(searchRows.map(row => 
    row.id === id ? { ...row, [field]: value } : row
  ));
};
  // --- Handlers ---
  const handleInputChange = (field, value) => {
    setFilterCriteria((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowAction = (actionType, recordId) => {
    if (!actionType) return;
    alert(`Triggered ${actionType} for ${recordId}`);
  };

  // ================= ACTION SELECTOR (SMALL WIDTH + THEME COLOR) =================
const ActionSelector = ({ targetType, recordId }) => {
  return (
    <div className="d-flex align-items-center justify-content-center gap-1.5">
      {/* 🛠️ IMPROVED SELECT DROPDOWN */}
      <div className="position-relative" style={{ width: "74px" }}>
        <select 
          className="form-select form-select-sm text-white border-0 shadow-sm transition-all"
          style={{ 
            width: "100%", 
            fontSize: "11px", 
            fontWeight: "500",
            height: "26px", 
            paddingLeft: "6px",
            paddingRight: "16px", // Space for custom arrow
            backgroundColor: colors.primaryTheme,
            cursor: "pointer",
            borderRadius: "4px",
            WebkitAppearance: "none", // Reset default arrow
            MozAppearance: "none",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' class='bi bi-chevron-down' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 5px center",
            transition: "all 0.2s ease"
          }}
          defaultValue=""
          onChange={(e) => {
            handleRowAction(e.target.value, recordId);
            e.target.value = ""; 
          }}
          onMouseEnter={(e) => e.target.style.filter = "brightness(0.9)"}
          onMouseLeave={(e) => e.target.style.filter = "none"}
        >
          <option value="" disabled hidden>Action</option>
          <option value="view_detail" className="text-dark bg-white">Detail</option>
          <option value="edit_excel" className="text-dark bg-white">Excel</option>
          <option value="print" className="text-dark bg-white">Print</option>
          {targetType === "pending" && (
            <option value="approve" className="text-success fw-bold bg-white">✓ Approve</option>
          )}
          <option value="delete" className="text-danger bg-white">✕ Delete</option>
        </select>
      </div>

      {/* 👁️ IMPROVED RED EYE BUTTON */}
      <button 
        type="button" 
        className="btn btn-sm text-white d-flex align-items-center justify-content-center border-0 p-0 shadow-sm transition-all"
        style={{ 
          backgroundColor: colors.dangerTheme, 
          width: "26px", 
          height: "26px",
          borderRadius: "4px",
          transition: "all 0.2s ease"
        }}
        onClick={() => alert(`Quick view: ${recordId}`)}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(0.9)";
          e.currentTarget.style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
        title="Quick View"
      >
        <span style={{ fontSize: "12px", lineHeight: "1" }}>👁</span>
      </button>
    </div>
  );
};

  return (
    <div className="container-fluid bg-light min-vh-100 py-3 px-3" style={{ fontSize: "13px" }}>
      
      {/* ================= FILTER PANEL SECTION ================= */}
 {/* ================= TOGGLEABLE SEARCH FILTER PANEL ================= */}
     {showFilter && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            alert("Searching data...");
          }} 
          className="mb-4 bg-white p-3 border rounded shadow-sm"
        >
          {/* Main Layout Split */}
          <div className="row g-3">
            
            {/* LEFT COLUMN: All Dynamic Search Rows (col-lg-8 mhanje jasta space dynamic rows la) */}
            <div className="col-lg-8 border-end pe-3">
              {searchRows.map((row, index) => (
                <div className="row g-2 mb-2 align-items-end" key={row.id}>
                  <div className="col-sm-5">
                    {index === 0 && (
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                        Select Search Field
                      </label>
                    )}
                    <select 
                      className="form-select form-select-sm rounded-1 text-secondary"
                      style={{ height: "31px", fontSize: "12px" }}
                      value={row.searchField}
                      onChange={(e) => handleRowInputChange(row.id, "searchField", e.target.value)}
                    >
                      <option value="Work Order No">Work Order No</option>
                      <option value="Client Name">Client Name</option>
                      <option value="Invoice No">Invoice No</option>
                    </select>
                  </div>

                  <div className="col-sm-5">
                    {index === 0 && (
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                        Enter Keyword
                      </label>
                    )}
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-1 text-secondary"
                      style={{ height: "31px", fontSize: "12px" }}
                      value={row.keyword}
                      onChange={(e) => handleRowInputChange(row.id, "keyword", e.target.value)}
                      placeholder="Enter search code..."
                    />
                  </div>

                  <div className="col-sm-2 d-flex gap-1" style={{ height: "31px" }}>
                    <button 
                      type="button" 
                      className="btn btn-sm text-white flex-grow-1 border-0 fw-bold d-flex align-items-center justify-content-center" 
                      style={{ backgroundColor: colors.primaryTheme, borderRadius: "2px" }}
                      onClick={addSearchRow}
                    >
                      +
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm text-white flex-grow-1 border-0 fw-bold d-flex align-items-center justify-content-center" 
                      style={{ backgroundColor: colors.dangerTheme, borderRadius: "2px" }}
                      onClick={() => removeSearchRow(row.id)}
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: Static Date Filters (Ata he bilkul hणार nahi halnar nahi) */}
            <div className="col-lg-4">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                    From WO Date
                  </label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm rounded-1 text-secondary" 
                    style={{ height: "31px", fontSize: "12px" }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                    To WO Date
                  </label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm rounded-1 text-secondary" 
                    style={{ height: "31px", fontSize: "12px" }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Form Action Row Buttons */}
          <div className="d-flex justify-content-start gap-2 mt-3 pt-2 border-top">
            <button 
              type="submit" 
              className="btn btn-sm text-white rounded-1 px-3 border-0" 
              style={{ backgroundColor: colors.searchDark, fontSize: "11px", height: "28px" }}
            >
              🔍 Search
            </button>
            <button 
              type="button" 
              className="btn btn-sm text-white rounded-1 px-3 border-0" 
              style={{ backgroundColor: colors.dangerTheme, fontSize: "11px", height: "28px" }}
              onClick={() => {
                setSearchRows([{ id: Date.now(), searchField: "Work Order No", keyword: "" }]);
                setFromDate("");
                setToDate("");
              }}
            >
              🔄 Reset
            </button>
            <button 
              type="button" 
              className="btn btn-sm text-white rounded-1 px-3 border-0" 
              style={{ backgroundColor: colors.primaryTheme, fontSize: "11px", height: "28px" }}
              onClick={() => alert("Downloading Excel format report...")}
            >
              📥 Download Excel
            </button>
          </div>
        </form>
      )}

      {/* ================= TABS & TABLES CONTAINER ================= */}
      <div className="card border-0 shadow-sm rounded-1 overflow-hidden bg-white">
        
        {/* TAB HEADERS */}
     <div className="card-header bg-white p-0 border-bottom">
  {/* 🛠️ येथून flex-nowrap आणि overflow-auto काढून d-flex आणि list-unstyled जोडले आहे, ज्यामुळे स्क्रोलर गायब होईल */}
  <ul className="nav nav-tabs border-0 d-flex w-100 list-unstyled m-0">
    {tabConfiguration.map((t) => {
      const isActive = activeTab === t.key;
      return (
        // flex-grow-1 आणि flex-fill मुळे सर्व टॅब्स एकाच लाईनमध्ये उपलब्ध स्क्रीनची जागा वाटून घेतील
        <li className="nav-item flex-grow-1 flex-fill text-center" key={t.key}>
          <button
            type="button"
            className={`nav-link py-2.5 w-100 border-0 rounded-0 transition-all ${
              isActive ? "bg-white fw-bold" : "text-muted"
            }`}
            onClick={() => setActiveTab(t.key)}
            style={{ 
              fontSize: "13px", 
              // React inline style मध्ये !important चालत नाही, म्हणून active नसताना transparent border दिली आहे जेणेकरून लेआउट हलणार नाही
              borderBottom: isActive ? `2px solid ${colors.primaryTheme}` : "2px solid transparent",
              color: isActive ? colors.primaryTheme : "#555"
            }}
          >
            {t.label} 
            <span className={`badge rounded-pill ms-1 text-white bg-${t.color}`} style={{ fontSize: "10px" }}>
              {t.count}
            </span>
          </button>
        </li>
      );
    })}
  </ul>
</div>

{/* TAB DATA INTERFACES */}
<div className="card-body p-3">

  {/* ================= APPROVED VIEW MODULE ================= */}
  {activeTab === "approved" && (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0" style={{ color: "#2c3e50" }}>Approved Work Order List</h5>
        
        {/* BACK & SEARCH SMALL BUTTONS */}
        <div className="d-flex gap-1">
          <button 
            type="button" 
            className="btn btn-sm text-white border-0 px-2 py-1 shadow-sm text-nowrap" 
            style={{ 
              backgroundColor: colors.primaryTheme,
              fontSize: "11px",
              borderRadius: "3px",
              transition: "all 0.2s ease-in-out"
            }}
            onClick={() => setShowFilter(!showFilter)} 
          >
            {showFilter ? "Hide Search Panel" : "Click Here To Search"}
          </button>
        
          <button 
            type="button" 
            onClick={() => setActiveTab("pending")} 
            className="btn btn-sm text-white border-0 px-2 py-1"
            style={{ backgroundColor: colors.primaryTheme, fontSize: "11px", minWidth: "60px" }}
          >
            Go Back
          </button>
        </div>
      </div>

      <div className="table-responsive border rounded-1">
        <table className="table table-hover align-middle mb-0 text-dark" style={{ fontSize: "12px" }}>
          <thead className="table-light text-secondary">
            <tr>
              <th className="py-2.5 px-2" style={{ width: "50px" }}>Sr No.</th>
              <th className="py-2.5">Client Name <br/><span style={{ fontSize: "10px" }}>WO Type | No | Date</span></th>
              <th className="py-2.5">Total Cargo Pkg <br/><span style={{ fontSize: "10px" }}>Total Cargo Weight</span></th>
              <th className="py-2.5">Created Detail</th>
              <th className="py-2.5">Approved Detail</th>
              <th className="py-3" style={{ width: "90px" }}>Status</th>
              <th className="py-3 text-center" style={{ width: "110px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 text-muted">1</td>
              <td>
                <div className="fw-semibold text-secondary" style={{ fontSize: "12px" }}>TOPAZ WAREHOUSING</div>
                <div className="text-muted" style={{ fontSize: "11px" }}>Export - Work Order For - Carting/Gate In | WO/25-26/061460</div>
                <div className="text-black-50" style={{ fontSize: "10px" }}>2025-12-11</div>
              </td>
              <td>
                <div className="text-secondary">Cargo Pkg <span className="fw-bold">235</span></div>
                <div className="text-muted">Cargo Weight <span className="fw-bold">8282</span></div>
              </td>
              <td className="text-muted">—</td>
              <td className="text-muted">—</td>
              <td>
                <span className="badge rounded-1 px-2 py-1" style={{ backgroundColor: colors.successTheme, fontSize: "10px" }}>Approved</span>
              </td>
              <td>
                <ActionSelector targetType="approved" recordId="WO-061460" />
              </td>
            </tr>
            <tr>
              <td className="px-2 text-muted">2</td>
              <td>
                <div className="fw-semibold text-secondary" style={{ fontSize: "12px" }}>CONEX TERMINAL PRIVATE LIMITED</div>
                <div className="text-muted" style={{ fontSize: "11px" }}>LCL DESTUFF | WO/24-25/061460</div>
                <div className="text-black-50" style={{ fontSize: "10px" }}>2024-06-15</div>
              </td>
              <td>
                <div className="text-secondary">Cargo Pkg <span className="fw-bold">283</span></div>
                <div className="text-muted">Cargo Weight <span className="fw-bold">11183</span></div>
              </td>
              <td>
                <div className="text-secondary">Admin</div>
                <div className="text-muted" style={{ fontSize: "10px" }}>01-01-1970</div>
              </td>
              <td className="text-muted">—</td>
              <td>
                <span className="badge rounded-1 px-2 py-1" style={{ backgroundColor: colors.successTheme, fontSize: "10px" }}>Approved</span>
              </td>
              <td>
                <ActionSelector targetType="approved" recordId="WO-061461" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )}

  {/* ================= PENDING VIEW MODULE ================= */}
  {activeTab === "pending" && (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0" style={{ color: "#2c3e50" }}>Pending Work Order Approvals</h5>
        
        {/* BULK BUTTONS SMALL CODES */}
        <div className="d-flex gap-1">
          <button 
            type="button" 
            className="btn btn-sm text-white border-0 px-2 py-1"
            style={{ backgroundColor: colors.dangerTheme, fontSize: "11px" }}
          >
            Bulk Decline
          </button>
          <button 
            type="button" 
            className="btn btn-sm text-white border-0 px-2 py-1"
            style={{ backgroundColor: colors.primaryTheme, fontSize: "11px" }}
          >
            Bulk Approve
          </button>
        </div>
      </div>

      <div className="table-responsive border rounded-1">
        <table className="table table-hover align-middle mb-0 text-dark" style={{ fontSize: "12px" }}>
          <thead className="table-light text-secondary">
            <tr>
              <th className="py-2.5 px-2" style={{ width: "50px" }}>Sr No.</th>
              <th className="py-2.5">Client Name</th>
              <th className="py-2.5">Total Cargo</th>
              <th className="py-2.5">Created Detail</th>
              <th className="py-3" style={{ width: "90px" }}>Status</th>
              <th className="py-3 text-center" style={{ width: "110px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 text-muted">1</td>
              <td>
                <div className="fw-semibold text-secondary">SAMPLE LOGISTICS IND</div>
                <div className="text-muted" style={{ fontSize: "10px" }}>WO/24-25/09943</div>
              </td>
              <td>Pkg 120 / Wt 4500</td>
              <td>
                <div>Admin</div>
                <div className="text-muted" style={{ fontSize: "10px" }}>30-12-2025</div>
              </td>
              <td>
                <span className="badge bg-warning text-dark rounded-1 px-2 py-1" style={{ fontSize: "10px" }}>Pending</span>
              </td>
              <td>
                <ActionSelector targetType="pending" recordId="WO-09943" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )}

  {/* Fallbacks */}
  {activeTab === "rejected" && <div className="text-center py-4 text-muted">No Rejected Records Found</div>}
  {activeTab === "queue" && <div className="text-center py-4 text-muted">Job Queue Pipeline Clear</div>}

</div>
      </div>
    </div>
  );
}