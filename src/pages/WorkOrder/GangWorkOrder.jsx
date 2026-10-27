import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreateGangWorkOrder from "./CreateGangWorkOrder";

export default function GangWorkOrderUI() {
  // --- States ---
  const [searchRows, setSearchRows] = useState([
    { id: Date.now(), searchField: "Select", keyword: "" }
  ]);
  const [selectMonth, setSelectMonth] = useState("January");
  const [selectYear, setSelectYear] = useState("2019");
  
  // या स्टेटच्या मदतीने आपण ठरवू की लिस्ट दाखवायची की नवीन फॉर्म स्क्रीन
  const [showCreateScreen, setShowCreateScreen] = useState(false);

  // --- Exact Branding Colors ---
  const colors = {
    primaryTheme: "#00a2c2", // Cyan / Turquoise Blue
    dangerTheme: "#ff4d4d",  // Red Button
    searchDark: "#1a4080",   // Dark Blue Search Button
    textSuccess: "#00cc66",  // Green Text for Counters
  };

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // --- Dynamic Rows Handlers ---
  const addSearchRow = () => {
    setSearchRows([...searchRows, { id: Date.now(), searchField: "Select", keyword: "" }]);
  };

  const removeSearchRow = (id) => {
    if (searchRows.length > 1) {
      setSearchRows(searchRows.filter(row => row.id !== id));
    } else {
      setSearchRows([{ id: Date.now(), searchField: "Select", keyword: "" }]);
    }
  };

  const handleRowInputChange = (id, field, value) => {
    setSearchRows(searchRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // ================= IF SHOW CREATE SCREEN IS TRUE =================
  // जेव्हा युझर बटन दाबेल, तेव्हा पूर्ण पॅनेल ऐवजी फक्त हा फॉर्म दाखवला जाईल
  // हा `MainLayout` च्या आत रेंडर होत असल्यामुळे साईडबार डाव्या बाजूला तसाच राहील!
  if (showCreateScreen) {
    return <CreateGangWorkOrder onClose={() => setShowCreateScreen(false)} />;
  }

  // ================= MAIN LIST SCREEN =================
  return (
    <div className="container-fluid bg-light min-vh-100 py-2 px-2" style={{ fontSize: "11px" }}>
      
      {/* ================= FILTER PANEL ================= */}
      <form 
        onSubmit={(e) => { e.preventDefault(); alert("Searching..."); }} 
        className="mb-2 bg-white p-2 border rounded shadow-sm"
      >
        <div className="row g-2">
          
          {/* LEFT SIDE: Dynamic Search Fields */}
          <div className="col-lg-7 border-end pe-2">
            {searchRows.map((row, index) => (
              <div className="row g-1 mb-1 align-items-end" key={row.id}>
                <div className="col-sm-5">
                  {index === 0 && (
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "11px" }}>
                      Select Search Field
                    </label>
                  )}
                  <select 
                    className="form-select form-select-sm text-secondary py-0"
                    style={{ height: "28px", fontSize: "11px", borderRadius: "3px" }}
                    value={row.searchField}
                    onChange={(e) => handleRowInputChange(row.id, "searchField", e.target.value)}
                  >
                    <option value="Select">Select</option>
                    <option value="Work Order No">Work Order No</option>
                  </select>
                </div>

                <div className="col-sm-5">
                  {index === 0 && (
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "11px" }}>
                      Enter Keyword
                    </label>
                  )}
                  <input
                    type="text"
                    className="form-control form-control-sm text-secondary py-0"
                    style={{ height: "28px", fontSize: "11px", borderRadius: "3px" }}
                    value={row.keyword}
                    onChange={(e) => handleRowInputChange(row.id, "keyword", e.target.value)}
                  />
                </div>

                <div className="col-sm-2 d-flex gap-1" style={{ height: "28px" }}>
                  <button 
                    type="button" 
                    className="btn btn-sm text-white flex-grow-1 border-0 fw-bold d-flex align-items-center justify-content-center p-0" 
                    style={{ backgroundColor: colors.primaryTheme, borderRadius: "3px", fontSize: "12px" }}
                    onClick={addSearchRow}
                  >
                    +
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm text-white flex-grow-1 border-0 fw-bold d-flex align-items-center justify-content-center p-0" 
                    style={{ backgroundColor: colors.dangerTheme, borderRadius: "3px", fontSize: "12px" }}
                    onClick={() => removeSearchRow(row.id)}
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE: Month, Year & Action Buttons */}
          <div className="col-lg-5">
            <div className="row g-1 mb-2">
              <div className="col-6">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "11px" }}>
                  Select Month
                </label>
                <select 
                  className="form-select form-select-sm text-secondary py-0" 
                  style={{ height: "28px", fontSize: "11px", borderRadius: "3px" }}
                  value={selectMonth}
                  onChange={(e) => setSelectMonth(e.target.value)}
                >
                  <option value="January">January</option>
                  <option value="February">February</option>
                </select>
              </div>

              <div className="col-6">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "11px" }}>
                  Select Year
                </label>
                <select 
                  className="form-select form-select-sm text-secondary py-0" 
                  style={{ height: "28px", fontSize: "11px", borderRadius: "3px" }}
                  value={selectYear}
                  onChange={(e) => setSelectYear(e.target.value)}
                >
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-start gap-1 flex-wrap">
              <button 
                type="submit" 
                className="btn btn-sm text-white border-0 px-2 py-0" 
                style={{ backgroundColor: colors.searchDark, fontSize: "11px", height: "26px", borderRadius: "3px" }}
              >
                🔍 Search
              </button>
              <button 
                type="button" 
                className="btn btn-sm text-white border-0 px-2 py-0" 
                style={{ backgroundColor: colors.dangerTheme, fontSize: "11px", height: "26px", borderRadius: "3px" }}
                onClick={() => {
                  setSearchRows([{ id: Date.now(), searchField: "Select", keyword: "" }]);
                  setSelectMonth("January");
                  setSelectYear("2019");
                }}
              >
                🔄 Reset
              </button>
              <button 
                type="button" 
                className="btn btn-sm text-white border-0 px-2 py-0" 
                style={{ backgroundColor: colors.primaryTheme, fontSize: "11px", height: "26px", borderRadius: "3px" }}
              >
                📥 Export
              </button>
              
              <button 
                type="button" 
                className="btn text-white border-0 px-2 py-0 fw-medium" 
                style={{ backgroundColor: colors.primaryTheme, fontSize: "11px", height: "26px", borderRadius: "3px" }}
                onClick={() => setShowCreateScreen(true)}
              >
                Create New Gang Work Order
              </button>
            </div>
          </div>

        </div>
      </form>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="card border-0 shadow-sm rounded-1 bg-white">
        
        {/* Title and Counters Row */}
        <div className="p-2 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="fw-bold m-0" style={{ color: "#2c3e50", fontSize: "16px" }}>Gang Work Order</h4>
          
          <div className="d-flex flex-wrap gap-2 fw-bold" style={{ fontSize: "11px" }}>
            <span style={{ color: colors.textSuccess }}>Total Bills Generated: <span className="text-dark">0</span></span>
            <span style={{ color: colors.textSuccess }}>Billing Amount: <span className="text-dark">0</span></span>
            <span style={{ color: colors.textSuccess }}>Payment Received: <span className="text-dark">0</span></span>
            <span className="text-danger">Payment not received: <span className="text-dark">0</span></span>
          </div>
        </div>

        <div className="card-body p-2">
          
          {/* Alphabet Line */}
          <div className="row align-items-center g-2 mb-2">
            <div className="col-12">
              <div className="d-flex flex-wrap gap-1">
                {alphabets.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    className="btn btn-sm bg-white border d-flex align-items-center justify-content-center p-0 text-secondary"
                    style={{ width: "22px", height: "22px", fontSize: "10px", borderRadius: "2px" }}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN DATA TABLE STRUCTURE */}
          <div className="table-responsive border rounded-1">
            <table className="table table-sm table-hover align-middle mb-0 text-dark" style={{ fontSize: "11px" }}>
              <thead className="table-light text-secondary">
                <tr>
                  <th className="py-1 px-2" style={{ width: "50px" }}>Sr No.</th>
                  <th className="py-1">Work Order no</th>
                  <th className="py-1">Client Detail</th>
                  <th className="py-1">Branch Detail</th>
                  <th className="py-1">Total Cost</th>
                  <th className="py-1">Created Detail</th>
                  <th className="py-1" style={{ width: "80px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center py-3 text-muted bg-white" style={{ fontSize: "11px" }}>
                    No data available in table
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
      
    </div>
  );
}