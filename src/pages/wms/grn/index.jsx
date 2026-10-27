import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FaSearch,
  FaSyncAlt,
  FaFileExcel,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const GRNPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [grnData, setGrnData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [poList, setPoList] = useState([]);
  const [viewMode, setViewMode] = useState(null); // New state for View
  const [file, setFile] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0); // Assuming your API returns total

  // Add this state
  const [searchTerm, setSearchTerm] = useState("");

  // Update the fetch function
  const fetchGRNs = async (search = "", page = 1, limit = 10) => {
    try {
      const res = await axios.get(`${API_URL}/api/grn`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, page, limit },
      });
      // Adjust based on your API response structure (e.g., res.data.data and res.data.total)
      setGrnData(res.data.data || []);
      setTotalCount(res.data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching GRNs:", err);
    }
  };
  const handleView = async (grnId) => {
    try {
      const res = await axios.get(`${API_URL}/api/grn/${grnId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if data exists. If items aren't in res.data.data,
      // you might need to adjust this to res.data (depending on your controller)
      const grnData = res.data.data || res.data;

      // Ensure items exist as an array
      setViewMode({ ...grnData, items: grnData.items || [] });
    } catch (err) {
      console.error("Error viewing GRN:", err);
      alert("Could not load GRN details.");
    }
  };

  const [formData, setFormData] = useState({
    grn_number: "",
    supplier_name: "",
    order_id: "",
    po_number: "",
    received_date: new Date().toISOString().slice(0, 10),
    challan_no: "",
    challan_date: "",
    lr_no: "",
    transporter: "",
    vehicle_no: "", // New field
    company_id: "", // New field
    company_name: "", // Auto-filled
    branch_id: "", // New field
    branch_name: "", // Auto-filled
    narration: "",
    items: [],
  });

  useEffect(() => {
    fetchSuppliers();
    fetchGRNs(searchTerm, currentPage, rowsPerPage);
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/suppliers/dropdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const handleSupplierChange = async (selectedOption) => {
    const supplierName = selectedOption.value;

    setFormData((prev) => ({
      ...prev,
      supplier_name: supplierName,
      po_number: "",
      order_id: "",
      items: [],
    }));

    setPoList([]);

    try {
      const res = await axios.get(
        `${API_URL}/api/purchase-orders/by-supplier`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            supplier_name: supplierName,
          },
        },
      );

      setPoList(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePOChange = async (selectedOption) => {
    const po = selectedOption.data;
    try {
      const res = await axios.get(
        `${API_URL}/api/purchase-orders/${po.order_id}/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const products = res.data.data; // This now contains items + company info
      const firstItem = products[0] || {}; // Take company info from the first record

      setFormData((prev) => ({
        ...prev,
        order_id: po.order_id,
        po_number: po.invoice_no,
        // Now pulling from the joined query result
        company_id: firstItem.company_id || po.company_id || "",
        company_name: firstItem.company_name || po.company_name || "",
        branch_id: firstItem.branch_id || po.branch_id || "",
        branch_name: firstItem.branch_name || po.branch_name || "",
        items: res.data.data.map((item) => ({
          product_name: item.product_name,
          product_id: item.id,
          sku: item.sku,
          order_qty: Number(item.qty), // New: Fixed Order Qty
          qty_received: Number(item.qty), // Editable Received Qty
          unit_price: Number(item.purchase_price),
          balance_qty: 0, // Or logic: order_qty - qty_received
          remark: "", // New: Remark
          total: Number(item.qty) * Number(item.purchase_price),
        })),
      }));
    } catch (error) {
      console.error("Error loading PO data:", error);
    }
  };

  // const handleRowChange = (index, field, value) => {
  //   let updatedItems = [...formData.items];
  //   let val = parseFloat(value) || 0;

  //   // 1. Prevent negative values
  //   if (val < 0) val = 0;

  //   // 2. If changing Received Qty, enforce limit
  //   if (field === "qty_received") {
  //     if (val > updatedItems[index].order_qty) {
  //       alert(
  //         `Received quantity cannot exceed order quantity (${updatedItems[index].order_qty})`,
  //       );
  //       val = updatedItems[index].order_qty; // Reset to max
  //     }
  //   }

  //   updatedItems[index][field] = val;

  //   // 3. Recalculate
  //   const qty = parseFloat(updatedItems[index].qty_received || 0);
  //   const price = parseFloat(updatedItems[index].unit_price || 0);

  //   // Balance Amount = (Order Qty - Received Qty) * Unit Price
  //   const balanceQty = updatedItems[index].order_qty - qty;
  //   updatedItems[index].balance_qty = balanceQty * price;

  //   // Total Amount = Received Qty * Unit Price
  //   updatedItems[index].total = qty * price;

  //   setFormData({ ...formData, items: updatedItems });
  // };

  const handleRowChange = (index, field, value) => {
    let updatedItems = [...formData.items];

    // If the field is 'remark', treat it as text and update directly
    if (field === "remark") {
      updatedItems[index].remark = value;
    } else {
      // For all other fields (qty, price, etc.), treat as numbers
      let val = parseFloat(value) || 0;

      // 1. Prevent negative values
      if (val < 0) val = 0;

      // 2. If changing Received Qty, enforce limit
      if (field === "qty_received") {
        if (val > updatedItems[index].order_qty) {
          alert(
            `Received quantity cannot exceed order quantity (${updatedItems[index].order_qty})`,
          );
          val = updatedItems[index].order_qty;
        }
      }

      updatedItems[index][field] = val;

      // 3. Recalculate totals
      const qty = parseFloat(updatedItems[index].qty_received || 0);
      const price = parseFloat(updatedItems[index].unit_price || 0);

      // Balance Amount = (Order Qty - Received Qty) * Unit Price
      const balanceQty = updatedItems[index].order_qty - qty;
      updatedItems[index].balance_qty = balanceQty * price;

      // Total Amount = Received Qty * Unit Price
      updatedItems[index].total = qty * price;
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const calculatedGrandTotal = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total) || 0;
      return sum + itemTotal;
    }, 0);
  }, [formData.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();

    // FIX: Map 'total' to 'total_amount' so the backend calculation works
    const processedItems = formData.items.map((item) => ({
      ...item,
      total_amount: parseFloat(item.total) || 0,
    }));

    // Append standard fields
    Object.keys(formData).forEach((key) => {
      if (key !== "items") formDataObj.append(key, formData[key]);
    });

    // Append the processed items with the correct key
    formDataObj.append("items", JSON.stringify(processedItems));

    // Append file
    if (file) formDataObj.append("ref_document", file);

    try {
      await axios.post(`${API_URL}/api/grn/create`, formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("GRN Saved Successfully!");
      setShowForm(false);
      fetchGRNs();
    } catch (err) {
      alert("Error saving GRN");
    }
  };

  const handleExport = async () => {
    try {
      // Call the new export-specific endpoint
      const res = await axios.get(`${API_URL}/api/grn/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm }, // Still support search filtering for the export
      });

      const allData = res.data.data || [];

      if (allData.length === 0) {
        alert("No data available to export");
        return;
      }

      const exportData = allData.map((item) => ({
        "GRN ID": item.grn_number,
        Supplier: item.supplier_name,
        Date: new Date(item.received_date).toLocaleDateString(),
        "Challan No": item.challan_no,
        "LR/RR No": item.lr_no,
        "Grand Total": item.grand_total,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "GRNs");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(data, `GRN_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data.");
    }
  };

  return (
    <div className="container-fluid p-0 min-vh-100">
      {viewMode ? (
        // --- SCREEN 3: VIEW DETAILS ---
        <div className="card p-5 shadow-sm border-0">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-5">
            <div>
              <h2 className="fw-bold text-primary">GRN INVOICE</h2>
              <p className="text-muted mb-0">
                GRN ID: <strong>{viewMode.grn_number}</strong>
              </p>
              <p className="text-muted">
                Date: {new Date(viewMode.received_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-end">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setViewMode(null)}
              >
                Close View
              </button>
            </div>
          </div>

          {/* Information Grid */}
          <div className="row mb-5">
            <div className="col-md-6">
              <h6 className="text-uppercase text-secondary fw-bold">
                Supplier Information
              </h6>
              <p className="mb-1">
                <strong>Name:</strong> {viewMode.supplier_name}
              </p>
              <p className="mb-1">
                <strong>Transporter:</strong> {viewMode.transporter || "N/A"}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <h6 className="text-uppercase text-secondary fw-bold">
                Document Details
              </h6>
              <p className="mb-1">
                <strong>Challan No:</strong> {viewMode.challan_no}
              </p>
              <p className="mb-1">
                <strong>LR/RR No:</strong> {viewMode.lr_no}
              </p>
              <p className="mb-1">
                <strong>Ref Doc: </strong>
                {viewMode.ref_document ? (
                  <a
                    href={`${API_URL}/${viewMode.ref_document}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive mb-4">
            <table className="table table-hover border">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th className="text-center">Order Qty</th>
                  <th className="text-center">Received Qty</th>
                  <th className="text-end">Unit Price</th>
                  <th className="text-end">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {viewMode.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td className="text-center">{item.qty_ordered || 0}</td>
                    <td className="text-center">{item.qty_received}</td>
                    <td className="text-end">
                      ₹{parseFloat(item.unit_price).toFixed(2)}
                    </td>
                    <td className="text-end fw-bold">
                      ₹{parseFloat(item.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="d-flex justify-content-end">
            <div className="w-25">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹{parseFloat(viewMode.grand_total).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2">
                <h5 className="fw-bold">Grand Total</h5>
                <h5 className="fw-bold text-primary">
                  ₹{parseFloat(viewMode.grand_total).toFixed(2)}
                </h5>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-top">
            <p className="text-muted small">
              <strong>Narration:</strong> {viewMode.narration}
            </p>
          </div>
        </div>
      ) : !showForm ? (
        // --- SCREEN 1: DASHBOARD ---
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h3 className="page-title m-0">
              Goods Received Note{" "}
              <span className="text-success fw-semibold">({totalCount})</span>
            </h3>
          </div>
          <div
            className="card border-0 shadow-sm p-3 mb-4 bg-white"
            style={{ borderRadius: "12px" }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              {/* Search Input Group */}
              <div
                className="d-flex align-items-center flex-grow-1"
                style={{ maxWidth: "550px" }}
              >
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by GRN ID or Supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && fetchGRNs(searchTerm)
                    }
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchGRNs(searchTerm)}
                  >
                    <FaSearch />
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      fetchGRNs("");
                    }}
                  >
                    <FaSyncAlt />
                  </button>
                  {/* Add this button here */}
                  <button
                    className="btn btn-success"
                    onClick={handleExport}
                    title="Export to Excel"
                  >
                    <FaFileExcel />
                  </button>
                </div>
              </div>

              {/* New GRN Button */}
              <button
                className="btn btn-dark rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                style={{ height: "40px" }}
                onClick={() => setShowForm(true)}
              >
                <FaPlus size={12} /> New GRN
              </button>
            </div>
          </div>
          <div className="card border-0 shadow-sm p-0">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>GRN ID</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                {grnData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  grnData.map((grn) => (
                    <tr key={grn.grn_id}>
                      <td>{grn.grn_number}</td>
                      <td>{grn.supplier_name}</td>
                      <td>
                        {new Date(grn.received_date).toLocaleDateString()}
                      </td>
                      <td>₹{parseFloat(grn.grand_total).toFixed(2)}</td>
                      <td>
                        {/* Optional: Add a button to view items if needed */}
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => {
                            console.log("Viewing GRN ID:", grn.grn_id);
                            handleView(grn.grn_id);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // --- SCREEN 2: FORM ---
        <div className="card shadow-lg border-0 rounded-3 bg-white p-4">
          <div className="d-flex justify-content-between mb-4">
            <h4 className="fw-bold">Create New GRN</h4>
            <button
              className="btn btn-outline-secondary rounded-pill"
              onClick={() => setShowForm(false)}
            >
              Back
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4 p-3 bg-light rounded-3">
              <div className="col-md-3">
                <label className="fw-semibold">Supplier</label>
                <Select
                  options={suppliers.map((s) => ({
                    label: s.supplier_name,
                    value: s.supplier_name,
                  }))}
                  onChange={handleSupplierChange}
                />
              </div>
              <div className="col-md-3">
                <label className="fw-semibold">Purchase Order</label>
                <Select
                  isDisabled={!formData.supplier_name}
                  options={poList.map((po) => ({
                    label: po.invoice_no,
                    value: po.invoice_no,
                    data: po,
                  }))}
                  onChange={handlePOChange}
                />
              </div>
              <div className="col-md-3">
                <label className="fw-semibold">GRN ID</label>
                <input
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, grn_number: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="fw-semibold">Received Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.received_date}
                  onChange={(e) =>
                    setFormData({ ...formData, received_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-2">
                <label className="fw-semibold small">Challan No.</label>
                <input
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, challan_no: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <label className="fw-semibold small">Challan Date</label>
                <input
                  type="date"
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, challan_date: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <label className="fw-semibold small">LR/RR No.</label>
                <input
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, lr_no: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <label className="fw-semibold small">Transporter</label>
                <input
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, transporter: e.target.value })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="fw-semibold small">Narration</label>
                <input
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, narration: e.target.value })
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="fw-semibold">Ref Document</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="col-md-3">
                <label className="fw-semibold">Vehicle No.</label>
                <input
                  className="form-control"
                  value={formData.vehicle_no}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle_no: e.target.value })
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="fw-semibold">Company</label>
                <input
                  className="form-control"
                  value={formData.company_name}
                  readOnly // Auto-filled from PO
                  placeholder="Select PO first"
                />
              </div>

              <div className="col-md-3">
                <label className="fw-semibold">Branch</label>
                <input
                  className="form-control"
                  value={formData.branch_name}
                  readOnly // Auto-filled from PO
                  placeholder="Select PO first"
                />
              </div>
            </div>

            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>Product</th>
                  <th>Order Qty</th>
                  <th>Received Qty</th>
                  <th>Balance (Amt)</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>
                      <input
                        className="form-control"
                        value={item.order_qty}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.qty_received}
                        min="0"
                        max={item.order_qty}
                        onChange={(e) =>
                          handleRowChange(index, "qty_received", e.target.value)
                        }
                      />
                    </td>
                    {/* Updated: Added Rupee sign and formatted to 2 decimals */}
                    <td>
                      <strong>
                        ₹{parseFloat(item.balance_qty || 0).toFixed(2)}
                      </strong>
                    </td>

                    {/* Updated: Added 'disabled' attribute */}
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.unit_price}
                        disabled
                      />
                    </td>
                    <td>
                      <strong>₹{parseFloat(item.total || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <input
                        type="text" // Explicitly define as text
                        className="form-control"
                        value={item.remark || ""} // Ensure it handles undefined/null
                        placeholder="Enter notes..."
                        onChange={(e) =>
                          handleRowChange(index, "remark", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-flex justify-content-end align-items-center">
              <h5 className="me-4">
                Grand Total: ₹{calculatedGrandTotal.toFixed(2)}
              </h5>
              <button
                type="submit"
                className="btn btn-success px-5 rounded-pill"
              >
                Save GRN
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && totalCount > 0 && !viewMode && (
        <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-white border rounded">
          <div>
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount}{" "}
            entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    fetchGRNs(searchTerm, currentPage - 1, rowsPerPage)
                  }
                >
                  Previous
                </button>
              </li>
              {Array.from(
                { length: Math.ceil(totalCount / rowsPerPage) },
                (_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        fetchGRNs(searchTerm, index + 1, rowsPerPage)
                      }
                    >
                      {index + 1}
                    </button>
                  </li>
                ),
              )}
              <li
                className={`page-item ${currentPage >= Math.ceil(totalCount / rowsPerPage) ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    fetchGRNs(searchTerm, currentPage + 1, rowsPerPage)
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default GRNPage;
