import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaSearch, FaSyncAlt, FaPlus, FaFileExcel } from "react-icons/fa";

const POList = ({ onAdd, onEdit, onView }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("supplier");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("Active");
  const [statusTab, setStatusTab] = useState("Pending");

  // ============================
  // STATUS MODAL STATES
  // ============================
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const exportToExcel = () => {
    const data = filtered.map((p) => ({
      "PO ID": p.id,
      "PO Number": p.invoice_no,
      Supplier: p.supplier_name,
      "PO Date": p.order_date
        ? new Date(p.order_date).toLocaleDateString("en-IN")
        : "",
      "Total Value": p.grand_total,
      Status: p.status,
    }));

    // Step 2: worksheet create
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Step 3: workbook create
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");

    // Step 4: buffer generate
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Step 5: file save
    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, `purchase_orders_filtered.xlsx`);
  };
  const downloadTemplate = () => {
    const data = [
      {
        invoice_no: "",
        order_date: "",
        supplier_name: "",
        company_name: "",
        branch_name: "",
        product_name: "",
        sku: "",
        qty: "",
        color: "",
        height: "",
        width: "",
        length: "",
        gender: "",
        purchase_price: "",
        sale_price: "",
        gst_type: "",
        gst_percentage: "",
        total_amount: "",
        status: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
      { wch: 18 }, // invoice_no
      { wch: 18 }, // order_date
      { wch: 25 }, // supplier_name
      { wch: 25 }, // company_name
      { wch: 25 }, // branch_name
      { wch: 25 }, // product_name
      { wch: 15 }, // sku
      { wch: 10 }, // qty
      { wch: 12 }, // color
      { wch: 10 }, // height
      { wch: 10 }, // width
      { wch: 10 }, // length
      { wch: 12 }, // gender
      { wch: 18 }, // purchase_price
      { wch: 18 }, // sale_price
      { wch: 15 }, // gst_type
      { wch: 15 }, // gst_percentage
      { wch: 18 }, // total_amount
      { wch: 15 }, // status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PO_Template");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "purchase_order_template.xlsx");
  };
  // ============================
  // FETCH PURCHASE ORDERS
  // ============================
  const fetchPO = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/purchase-orders`, {
        params: {
          page: 1,
          limit: 100,
          active: activeTab.toLowerCase(),
          status: statusTab,
        },
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setPurchaseOrders(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPO();
  }, [activeTab, statusTab]);

  // ============================
  // DELETE PURCHASE ORDER
  // ============================
  const deletePO = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to move this Purchase Order to Inactive?",
    );

    if (!confirmDelete) return;

    try {
      await axios.post(
        `${API_URL}/api/purchase-orders/delete/${id}`,
        {}, // 👈 EMPTY BODY
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      setPurchaseOrders((prev) => prev.filter((p) => p.id !== id));

      alert("Purchase Order moved to Inactive");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete Purchase Order");
    }
  };
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert("Please select file");
      return;
    }

    const formData = new FormData();
    formData.append("productOrderExcel", file);

    try {
      const response = await axios.post(
        `${API_URL}/api/purchase-orders/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      alert(response.data.message);

      // REFRESH TABLE
      fetchPO();

      // RESET INPUT
      e.target.value = "";
    } catch (error) {
      console.log("BULK ERROR =>", error);

      alert(error?.response?.data?.message || "Bulk upload failed");
    }
  };
  // ============================
  // OPEN STATUS MODAL
  // ============================
  const openStatusModal = (po) => {
    setSelectedPO(po);
    setShowStatusModal(true);
  };

  // ============================
  // UPDATE STATUS
  // ============================
  const updateStatus = async (status) => {
    try {
      const apiUrl = `${API_URL}/api/purchase-orders/status/${selectedPO.id}`;

      const response = await axios.post(
        apiUrl,
        { status },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API RESPONSE =>", response.data);

      setPurchaseOrders((prev) =>
        prev.map((item) =>
          item.id === selectedPO.id ? { ...item, status } : item,
        ),
      );

      setShowStatusModal(false);

      alert(`PO ${status} successfully`);
    } catch (error) {
      console.log("ERROR =>", error);
      console.log("ERROR RESPONSE =>", error?.response?.data);
      alert("Failed to update status");
    }
  };

  // ============================
  // SEARCH FILTER
  const filtered = purchaseOrders.filter((p) => {
    const searchText = search.toLowerCase();

    // ---------- SEARCH FIELD FILTER ----------
    let matchSearch = true;

    if (searchText) {
      if (searchField === "supplier") {
        matchSearch = (p.supplier_name || "")
          .toLowerCase()
          .includes(searchText);
      } else if (searchField === "po") {
        matchSearch = (p.invoice_no || "").toLowerCase().includes(searchText);
      }
    }

    // ---------- DATE FILTER ----------
    let poDate = p.order_date ? new Date(p.order_date) : null;

    let matchDate = true;

    if (fromDate) {
      matchDate = poDate >= new Date(fromDate);
    }

    if (toDate) {
      matchDate = matchDate && poDate <= new Date(toDate + "T23:59:59");
    }

    return matchSearch && matchDate;
  });

  const tabs = ["Active", "Inactive"];
  const statusTabs = ["Pending", "Approved", "Rejected"];

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0 text-primary">
            PURCHASE ORDERS ({purchaseOrders.length})
          </h4>
        </div>

        <div className="d-flex gap-2">
          <div className="d-flex gap-2">
            <button
              className="btn btn-warning btn-sm"
              onClick={downloadTemplate}
            >
              Download Template
            </button>
          </div>

          <label className="btn btn-info btn-sm mb-0">
            <FaFileExcel /> Bulk Upload
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              hidden
              onChange={handleBulkUpload}
            />
          </label>

          <button className="btn btn-dark btn-sm" onClick={onAdd}>
            <FaPlus /> Add Purchase Order
          </button>
          {/* SEARCH TOGGLE BUTTON */}
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? "Hide Search" : "Show Search"}
          </button>
        </div>
      </div>

      {/* SEARCH PANEL */}
      {showSearch && (
        <div className="card p-2 mb-3 shadow-sm">
          {/* FIRST ROW */}
          <div className="row g-2 align-items-end">
            {/* Search Type */}
            <div className="col-md-2">
              <label className="form-label small mb-1">Search By</label>

              <select
                className="form-select form-select-sm"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="supplier">Supplier</option>

                <option value="po">PO Number</option>
              </select>
            </div>

            {/* Keyword */}
            <div className="col-md-3">
              <label className="form-label small mb-1">Keyword</label>

              <input
                className="form-control form-control-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* From Date */}
            <div className="col-md-2">
              <label className="form-label small mb-1">From</label>

              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="col-md-2">
              <label className="form-label small mb-1">To</label>

              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="col-md-3 d-flex gap-1">
              <button className="btn btn-warning btn-sm w-100">Search</button>

              <button
                className="btn btn-danger btn-sm w-100"
                onClick={() => {
                  setSearch("");
                  setFromDate("");
                  setToDate("");
                  setSearchField("supplier");
                }}
              >
                Reset
              </button>

              <button
                className="btn btn-success btn-sm w-100"
                onClick={exportToExcel}
              >
                Excel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* TABS */}
      <div className="card p-3 mb-3 shadow-sm">
        <div className="d-flex gap-3 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${
                activeTab === t ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}

          <div className="border-start mx-2"></div>

          {statusTabs.map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${
                statusTab === s ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setStatusTab(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Sr. No</th>
                <th>PO NUMBER</th>
                <th>PO DATE</th>
                <th>SUPPLIER</th>
                <th>TOTAL VALUE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>

                  <td className="fw-semibold">{p.invoice_no}</td>

                  <td>
                    {p.order_date
                      ? new Date(p.order_date).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td>{p.supplier_name}</td>

                  <td className="fw-bold">
                    ₹ {Number(p.grand_total || 0).toFixed(2)}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      role="button"
                      onClick={() => openStatusModal(p)}
                      className={`badge cursor-pointer ${
                        p.status?.toLowerCase() === "approved"
                          ? "bg-success"
                          : p.status?.toLowerCase() === "rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                      }`}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {p.status || "Pending"}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-dark dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        Action
                      </button>

                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => onEdit(p)}
                          >
                            Edit Record
                          </button>
                        </li>

                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => onView(p)}
                          >
                            View Invoice
                          </button>
                        </li>

                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => deletePO(p.id)}
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="d-flex justify-content-between p-3">
          <small>Showing {filtered.length} records</small>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm">
              Previous
            </button>

            <button className="btn btn-primary btn-sm">1</button>

            <button className="btn btn-outline-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* STATUS MODAL */}
      {showStatusModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              {/* Header */}
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Update PO Status</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                />
              </div>

              {/* Body */}
              <div className="modal-body text-center py-4">
                <p className="text-muted mb-3">
                  Select the current status of this Purchase Order
                </p>

                {/* Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-outline-dark dropdown-toggle px-4 py-2 rounded-3 w-75"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Choose Status
                  </button>

                  <ul className="dropdown-menu shadow-sm w-75">
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 text-success"
                        onClick={() => updateStatus("approved")}
                      >
                        <span className="badge bg-success">●</span> Approved
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 text-danger"
                        onClick={() => updateStatus("rejected")}
                      >
                        <span className="badge bg-danger">●</span> Rejected
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 text-warning"
                        onClick={() => updateStatus("pending")}
                      >
                        <span className="badge bg-warning">●</span> Pending
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POList;
