import React, { useState } from "react";
import FreeUniform from "./FreeUniform";
import NewEmployee from "./NewEmployee";
import IndividualItems from "./IndividualItems";
import UniformIssueForm from "./UniformIssueForm";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import * as XLSX from "xlsx";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const UniformMaster = () => {
  const [activePage, setActivePage] = useState("free");
  const [showForm, setShowForm] = useState(false);

  const [showSearch, setShowSearch] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [searchBy, setSearchBy] = useState("employee");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({});

  const handleSearch = () => {
    setAppliedFilters({
      keyword,
      searchBy,
      fromDate,
      toDate,
    });
  };

  const handleReset = () => {
    setKeyword("");
    setFromDate("");
    setToDate("");
    setSearchBy("employee");
    setAppliedFilters({});
  };

  // ================= DOWNLOAD ALL DATA =================
const handleDownloadExcel = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/api/uniform`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ SAFE DATA HANDLING
    const data =
      res.data?.recordset ||
      res.data?.data ||
      res.data ||
      [];

    if (!Array.isArray(data)) {
      console.log("Invalid data format:", data);
      return;
    }

    // ✅ EXPORT ALL DB DATA (NO FILTER)
    const excelData = data.map((item) => ({
      ID: item.id,
      Employee_Name: item.employee_name,
      Employee_Code: item.employee_code,
      Item_Name: item.item_name,
      SKU_Code: item.sku_code,
      Color: item.color,
      HSN_Code: item.hsn_code,
      Qty: item.qty,
      MRP: item.mrp,
      Sale_Price: item.sale_price,
      Issue_Date: item.issue_date
        ? new Date(item.issue_date).toLocaleDateString("en-GB")
        : "",
      Transfer_By: item.transfer_by,
      Remarks: item.remarks,
      Client_Name: item.client_name,
      Site_Name: item.site_name,
      Type_Issued: item.type_issued,
      Size: item.size,
      Total_Amount: item.total_amount,
      Advance_Amount: item.advance_amount,
      EMI_No: item.emi_no,
      Created_On: item.created_on
        ? new Date(item.created_on).toLocaleString()
        : "",
    }));

    // ✅ CREATE EXCEL
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Uniform_All_Data");

    XLSX.writeFile(wb, "uniform_master_all_data.xlsx");

  } catch (err) {
    console.log("Download Error:", err.response?.data || err.message);
  }
};

  const renderPage = () => {
    const props = { filters: appliedFilters };

    switch (activePage) {
      case "free":
        return <FreeUniform {...props} />;
      case "employee":
        return <NewEmployee {...props} />;
      case "individual":
        return <IndividualItems {...props} />;
      default:
        return <FreeUniform {...props} />;
    }
  };

  return (
    <div className="container mt-3">

      {showForm ? (
        <UniformIssueForm onClose={() => setShowForm(false)} />
      ) : (
        <>
          {/* HEADER */}
          <div className="d-flex justify-content-between mb-3">
            <h5>Uniform Issue Master</h5>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-dark btn-sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                {showSearch ? <FaTimes /> : <FaSearch />} Search
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowForm(true)}
              >
                <FaPlus /> Add
              </button>
            </div>
          </div>

          {/* SEARCH */}
          {showSearch && (
            <div className="card p-3 mb-3">
              <div className="row g-2">

                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={searchBy}
                    onChange={(e) => setSearchBy(e.target.value)}
                  >
                    <option value="employee">Employee</option>
                    <option value="code">Code</option>
                    <option value="item">Item</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Search..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                <div className="col-md-2 d-flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleSearch}>
                    Search
                  </button>

                  <button className="btn btn-danger btn-sm" onClick={handleReset}>
                    Reset
                  </button>
                </div>

              </div>

              <div className="mt-2 text-end">
                <button className="btn btn-success btn-sm" onClick={handleDownloadExcel}>
                  Download Excel
                </button>
              </div>
            </div>
          )}

          {/* TABS */}
          <div className="mb-3">
            <button className={`btn btn-sm me-2 ${activePage === "free" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActivePage("free")}>
              Free Uniform
            </button>

            <button className={`btn btn-sm me-2 ${activePage === "employee" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActivePage("employee")}>
              New Employee
            </button>

            <button className={`btn btn-sm ${activePage === "individual" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActivePage("individual")}>
              Individual Items
            </button>
          </div>

          {/* CONTENT */}
          <div className="card p-3">
            {renderPage()}
          </div>
        </>
      )}
    </div>
  );
};

export default UniformMaster;