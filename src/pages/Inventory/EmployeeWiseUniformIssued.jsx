import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL;

const EmployeeWiseUniformIssued = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= GET EMPLOYEES =================
  const getEmployees = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/employeewise-uniform/employees`
      );

      const options = (res.data.data || []).map((emp) => ({
        value: emp.employee_code,
        label: `${emp.emp_full_name} (${emp.employee_code})`,
        empName: emp.emp_full_name,
      }));

      setEmployees(options);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= GET DATA (ALL / FILTER) =================
  const getData = async (filters = {}) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/employeewise-uniform/uniform-all-data`,
        {
          params: {
            employee_code: filters.employee_code || "",
            employee_name: filters.employee_name || "",
            from_date: filters.from_date || "",
            to_date: filters.to_date || "",
          },
        }
      );

      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ================= ON LOAD =================
  useEffect(() => {
    getEmployees();
    getData(); // ✅ LOAD ALL DATA ON PAGE OPEN
  }, []);

  // ================= SEARCH =================
  const handleSearch = () => {
    getData({
      employee_code: employeeCode,
      employee_name: employeeName,
      from_date: fromDate,
      to_date: toDate,
    });
  };

  // ================= EXCEL DOWNLOAD =================
  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      alert("No data available");
      return;
    }

    const exportData = data.map((item, index) => ({
      "Sr No": index + 1,
      "ID": item.id,
      "Employee Code": item.employee_code,
      "Employee Name": item.employee_name,
      "SKU Code": item.sku_code,
      "Item Name": item.item_name,
      "Color": item.color,
      "HSN Code": item.hsn_code,
      "Qty": item.qty || item.issue_qty,
      "MRP": item.mrp,
      "Sale Price": item.sale_price,
      "Issue Date": item.issue_date
        ? new Date(item.issue_date).toLocaleDateString()
        : "",
      "Transfer By": item.transfer_by,
      "Remarks": item.remarks,
  
    
      "Client Name": item.client_name,
      "Site Name": item.site_name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Uniform_Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, "Employee_Wise_Uniform_Report.xlsx");
  };

  return (
    <div className="container-fluid p-4">
      <div className="card shadow border-0">

        {/* HEADER */}
        <div className="card-header bg-primary text-white d-flex justify-content-between">
          <h4 className="mb-0">Employee Wise Uniform Issued</h4>

          <button className="btn btn-light" onClick={handleExportExcel}>
            Download Excel
          </button>
        </div>

        <div className="card-body">

          {/* FILTER */}
          <div className="row g-3 mb-3">

            <div className="col-md-4">
              <label>Employee</label>
              <Select
                options={employees}
                value={selectedEmployee}
                onChange={(data) => {
                  setSelectedEmployee(data);
                  setEmployeeCode(data?.value || "");
                  setEmployeeName(data?.empName || "");
                }}
                isSearchable
                isClearable
              />
            </div>

            <div className="col-md-2">
              <label>Name</label>
              <input
                className="form-control"
                value={employeeName}
                disabled
              />
            </div>

            <div className="col-md-2">
              <label>From</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label>To</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

          </div>

          {/* BUTTONS */}
          <div className="mb-3 d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSearch}>
              {loading ? "Loading..." : "Search"}
            </button>

          

            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedEmployee(null);
                setEmployeeCode("");
                setEmployeeName("");
                setFromDate("");
                setToDate("");
                getData(); // reload all
              }}
            >
              Reset
            </button>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover">

              <thead className="table-dark">
                <tr>
                  <th>Sr</th>
                  <th>Emp Code</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.employee_code}</td>
                      <td>{item.employee_name}</td>
                      <td>{item.sku_code}</td>
                      <td>{item.item_name}</td>
                      <td>{item.qty || item.issue_qty}</td>
                      <td>
                        {item.issue_date
                          ? new Date(item.issue_date).toLocaleDateString()
                          : ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeWiseUniformIssued;