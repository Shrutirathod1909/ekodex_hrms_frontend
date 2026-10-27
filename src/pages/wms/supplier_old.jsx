import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import {
  FaSearch,
  FaSyncAlt,
  FaFileExcel,
  FaPlus,
  FaUpload,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const IMG_URL = import.meta.env.VITE_FRONTEND_FOLDER;

const Supplier = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  // Add this near your other state variables
  const [logo, setLogo] = useState(null);
  const [statusTab, setStatusTab] = useState("active"); // 'active' or 'inactive'
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_person_name: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    bank_name: "",
    account_no: "",
    account_type: "",
    swift_code: "",
    micr_no: "",
    ifsc_code: "",
  });

  // ================= FETCH & SEARCH FUNCTION =================
  const fetchSuppliers = async (
    search = "",
    page = 1,
    limit = 10,
    status = "active",
  ) => {
    try {
      const response = await axios.get(`${API_URL}/api/suppliers`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        params: { search, page, limit, status }, // Backend must filter by status
      });
      setSuppliers(response.data.data);
      setTotalCount(response.data.total);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (status) => {
    setStatusTab(status);
    fetchSuppliers(searchTerm, 1, rowsPerPage, status);
  };

  // Update search and other interactions to pass the current statusTab
  const handleSearch = () =>
    fetchSuppliers(searchTerm, 1, rowsPerPage, statusTab);

  useEffect(() => {
    fetchSuppliers(searchTerm, currentPage, rowsPerPage);
  }, []);

  const handleReset = () => {
    setSearchTerm("");
    fetchSuppliers("", 1, rowsPerPage);
  };

  const handleExport = () => {
    if (!suppliers || suppliers.length === 0) {
      alert("No data available to export");
      return;
    }
    const exportData = suppliers.map((item) => ({
      ID: item.id,
      Supplier_Name: item.supplier_name,
      Contact_Person: item.contact_person_name,
      Phone: item.phone,
      Email: item.email,
      Address: item.address,
      City: item.city,
      State: item.state,
      Pincode: item.pincode,
      Bank_Name: item.bank_name,
      Account_No: item.account_no,
      Account_Type: item.account_type,
      IFSC_Code: item.ifsc_code,
      Swift_Code: item.swift_code,
      MICR_No: item.micr_no,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, `Suppliers_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ================= DOWNLOAD BLANK BULK TEMPLATE =================
  const handleDownloadTemplate = () => {
    // These keys will be the first row (headers) in your Excel sheet
    const templateHeaders = [
      {
        "Supplier Name": "",
        "Contact Person": "",
        Phone: "",
        Email: "",
        Address: "",
        State: "",
        City: "",
        Pincode: "",
        "Bank Name": "",
        "Account Number": "",
        "Account Type": "",
        "IFSC Code": "",
        "Swift Code": "",
        "MICR Number": "",
      },
    ];

    // Passing dummy data array with headers structured properly
    const worksheet = XLSX.utils.json_to_sheet(templateHeaders, {
      header: [
        "Supplier Name",
        "Contact Person",
        "Phone",
        "Email",
        "Address",
        "State",
        "City",
        "Pincode",
        "Bank Name",
        "Account Number",
        "Account Type",
        "IFSC Code",
        "Swift Code",
        "MICR Number",
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "Supplier_Bulk_Import_Template.xlsx");
  };

  // ================= PARSE & EXECUTE BULK UPLOAD FILE =================
  const handleBulkUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const binaryString = evt.target.result;
        const workbook = XLSX.read(binaryString, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // sheet_to_json reads rows. We add defval: "" so missing/empty values don't break the object keys
        const excelRowsJson = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        if (excelRowsJson.length === 0) {
          alert("The uploaded excel sheet contains no data rows.");
          return;
        }

        // Map data safely. Added fallback strings to avoid undefined fields
        const cleanPayload = excelRowsJson.map((row) => ({
          supplier_name: String(row["Supplier Name"] || "").trim(),
          contact_person_name: String(row["Contact Person"] || "").trim(),
          phone: String(row["Phone"] || "").trim(),
          email: String(row["Email"] || "").trim(),
          address: String(row["Address"] || "").trim(),
          state: String(row["State"] || "").trim(),
          city: String(row["City"] || "").trim(),
          pincode: String(row["Pincode"] || "").trim(),
          bank_name: String(row["Bank Name"] || "").trim(),
          account_no: String(row["Account Number"] || "").trim(),
          account_type: String(row["Account Type"] || "").trim(),
          ifsc_code: String(row["IFSC Code"] || "").trim(),
          swift_code: String(row["Swift Code"] || "").trim(),
          micr_no: String(row["MICR Number"] || "").trim(),
        }));

        // Filter out completely blank rows (where user just left an empty template line)
        const validPayload = cleanPayload.filter(
          (item) => item.supplier_name !== "",
        );

        if (validPayload.length === 0) {
          alert(
            "No valid rows found. Please make sure the 'Supplier Name' column is filled out.",
          );
          return;
        }

        if (
          !window.confirm(
            `Are you sure you want to run bulk processing imports for ${validPayload.length} supplier entries?`,
          )
        ) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const response = await axios.post(
          `${API_URL}/api/suppliers/bulk-create`,
          { suppliers: validPayload },
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          },
        );

        alert(response.data.message || "Bulk Data Imported Successfully!");
        fetchSuppliers(searchTerm);
      } catch (err) {
        console.error("Spreadsheet processing error detail:", err);
        alert(`Failed to extract spreadsheet data. Error: ${err.message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      supplier_name: "",
      contact_person_name: "",
      phone: "",
      email: "",
      address: "",
      state: "",
      city: "",
      pincode: "",
      bank_name: "",
      account_no: "",
      account_type: "",
      swift_code: "",
      micr_no: "",
      ifsc_code: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      supplier_name: item.supplier_name || "",
      contact_person_name: item.contact_person_name || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      state: item.state || "",
      city: item.city || "",
      pincode: item.pincode || "",
      bank_name: item.bank_name || "",
      account_no: item.account_no || "",
      account_type: item.account_type || "",
      swift_code: item.swift_code || "",
      micr_no: item.micr_no || "",
      ifsc_code: item.ifsc_code || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object to handle text + file
    const data = new FormData();

    // Append all text fields
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append the file if it exists
    if (logo) {
      data.append("logo", logo);
    }

    try {
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data", // Crucial for file uploads
        },
      };

      if (editId) {
        await axios.put(
          `${API_URL}/api/suppliers/update/${editId}`,
          data,
          config,
        );
        alert("Supplier Updated");
      } else {
        await axios.post(`${API_URL}/api/suppliers/create`, data, config);
        alert("Supplier Created");
      }
      fetchSuppliers(searchTerm);
      resetForm();
      setLogo(null); // Clear logo state
    } catch (err) {
      console.error(err);
      alert("Error occurred while saving.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete supplier?")) return;
    try {
      await axios.delete(`${API_URL}/api/suppliers/delete/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      fetchSuppliers(searchTerm);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container-fluid p-0 min-vh-100">
      {/* Hidden file input handler */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".xlsx, .xls"
        onChange={handleBulkUploadFile}
      />

      {/* ================= MAIN HEADER BLOCK WITH COMPACT ACTION BUTTONS ================= */}
      {!showForm && (
        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h3 className="page-title m-0">
            Supplier Management{" "}
            <span className="text-success fw-semibold">({totalCount})</span>
          </h3>

          <div className="d-flex gap-2">
            {/* DOWNLOAD EMPTY TEMPLATE ACTION */}
            <button
              class="btn btn-warning btn-sm"
              onClick={handleDownloadTemplate}
            >
              Download Template
            </button>

            {/* BULK UPLOAD SELECTION TRIGGER */}
            <button
              class="btn btn-info btn-sm"
              onClick={() => fileInputRef.current.click()}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 512 512"
                class="me-1"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
              </svg>
              Bulk Upload
            </button>
          </div>
        </div>
      )}

      {/* ================= SEARCH & ADD PANEL ================= */}
      {!showForm && (
        <div
          className="card border-0 shadow-sm p-3 mb-4 bg-white"
          style={{ borderRadius: "12px" }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div
              className="d-flex align-items-center flex-grow-1"
              style={{ maxWidth: "550px" }}
            >
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  title="Search"
                >
                  <FaSearch />
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleReset}
                  title="Reset"
                >
                  <FaSyncAlt />
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleExport}
                  title="Export Excel"
                >
                  <FaFileExcel />
                </button>
              </div>
            </div>

            {!showForm && (
              <div className=" d-flex gap-2">
                <button
                  className={`btn ${statusTab === "active" ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() => handleTabChange("active")}
                >
                  Active
                </button>
                <button
                  className={`btn ${statusTab === "inactive" ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() => handleTabChange("inactive")}
                >
                  Inactive
                </button>
              </div>
            )}

            <button
              className="btn btn-dark rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
              style={{ height: "40px", fontSize: "14px" }}
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={12} /> Add Supplier
            </button>
          </div>
        </div>
      )}

      {/* ================= DATA GRID LIST TABLE ================= */}
      {!showForm && (
        <div className="card border-0 shadow-sm p-0 rounded-3">
          <div className="table-responsive" style={{ overflow: "visible" }}>
            <table className="table table-hover align-middle mb-0 bg-white">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th className="text-center" style={{ width: "100px" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {suppliers && suppliers.length > 0 ? (
                  suppliers.map((item) => (
                    <tr key={item.id}>
                      <td className="text-muted">{item.id}</td>
                      <td className="fw-bold">{item.supplier_name}</td>
                      <td>{item.contact_person_name}</td>
                      <td>{item.phone}</td>
                      <td>{item.email}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {item.city}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="dropdown">
                          <button
                            className="btn btn-white btn-sm border text-secondary"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ padding: "6px 10px" }}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow border-light">
                            <li>
                              <button
                                className="dropdown-item py-2"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger py-2"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No Suppliers Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= CREATION & MANIPULATION DATA FORM ================= */}
      {showForm && (
        <div className="card shadow-lg border-0 rounded-3 bg-white">
          <div className="card-header bg-white d-flex justify-content-between py-3 align-items-center border-bottom-0">
            <h4 className="mb-0 fw-bold text-dark">
              {editId
                ? "Update Supplier Parameters"
                : "Create New Supplier Profile"}
            </h4>
            <button
              className="btn btn-outline-secondary px-4 rounded-pill"
              onClick={resetForm}
            >
              Back
            </button>
          </div>
          <div className="card-body p-4 pt-2">
            <form onSubmit={handleSubmit}>
              {/* BASIC DETAILS BLOCK */}
              <div className="p-3 border rounded-3 mb-4 bg-light">
                <h6 className="text-primary fw-bold mb-3">Basic Details</h6>
                <div className="row">
                  {[
                    "supplier_name",
                    "contact_person_name",
                    "phone",
                    "email",
                    "state",
                    "city",
                    "pincode",
                  ].map((key) => (
                    <div className="col-md-3 mb-3" key={key}>
                      <label className="form-label text-capitalize text-secondary fw-medium">
                        {key.replaceAll("_", " ")}
                      </label>
                      <input
                        name={key}
                        className="form-control bg-white"
                        value={formData[key] || ""}
                        onChange={handleChange}
                      />
                    </div>
                  ))}

                  <div className="col-md-3 mb-3">
                    <label className="form-label text-secondary fw-medium">
                      Supplier Logo
                    </label>
                    <input
                      type="file"
                      className="form-control bg-white"
                      accept="image/*"
                      onChange={(e) => setLogo(e.target.files[0])}
                    />
                    <small className="text-muted">Upload PNG, JPG</small>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-secondary fw-medium">
                      Address Line
                    </label>
                    <textarea
                      name="address"
                      className="form-control bg-white"
                      rows="2"
                      value={formData.address || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* BANK DETAILS BLOCK */}
              <div className="p-3 border rounded-3 mb-4 bg-light">
                <h6 className="text-success fw-bold mb-3">Bank Details</h6>
                <div className="row">
                  {[
                    "bank_name",
                    "account_no",
                    "account_type",
                    "ifsc_code",
                    "swift_code",
                    "micr_no",
                  ].map((key) => (
                    <div className="col-md-3 mb-3" key={key}>
                      <label className="form-label text-capitalize text-secondary fw-medium">
                        {key.replaceAll("_", " ")}
                      </label>
                      <input
                        name={key}
                        className="form-control bg-white"
                        value={formData[key] || ""}
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-success px-5 rounded-pill shadow-sm fw-medium">
                {editId ? "Update Entry Portfolio" : "Save Complete Entry"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-3 p-3">
        <div>
          Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount}{" "}
          entries
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0">Rows:</label>

          <select
            className="form-select form-select-sm"
            style={{ width: "90px" }}
            value={rowsPerPage}
            onChange={(e) => {
              const limit = Number(e.target.value);
              setRowsPerPage(limit);
              fetchSuppliers(searchTerm, 1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <nav>
          <ul className="pagination mb-0">
            {/* Previous */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() =>
                  fetchSuppliers(searchTerm, currentPage - 1, rowsPerPage)
                }
              >
                Previous
              </button>
            </li>

            {/* Page Numbers */}
            {Array.from(
              { length: Math.ceil(totalCount / rowsPerPage) },
              (_, index) => (
                <li
                  key={index + 1}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      fetchSuppliers(searchTerm, index + 1, rowsPerPage)
                    }
                  >
                    {index + 1}
                  </button>
                </li>
              ),
            )}

            {/* Next */}
            <li
              className={`page-item ${
                currentPage >= Math.ceil(totalCount / rowsPerPage)
                  ? "disabled"
                  : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  fetchSuppliers(searchTerm, currentPage + 1, rowsPerPage)
                }
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Supplier;
