import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Select from "react-select";
import { saveAs } from "file-saver";
// import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "./InvoiceTemplate";
import InvoiceView from "./InvoiceView"; // Import the invoice preview component
import {
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaEllipsisV,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaFileExcel,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const PurchaseOrder = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [activePrintRecord, setActivePrintRecord] = useState(null);
  const [viewingPrintRecord, setViewingPrintRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);

  const [activeTab, setActiveTab] = useState("active");
  const [statusTab, setStatusTab] = useState("Pending");

  const printComponentRef = useRef();

  // const executePrintAction = useReactToPrint({
  //   contentRef: printComponentRef,
  //   documentTitle: `Tax_Invoice_${activePrintRecord?.invoice_no || "PO"}`,
  //   onAfterPrint: () => setActivePrintRecord(null),
  // });

  // useEffect(() => {
  //   if (activePrintRecord) {
  //     executePrintAction();
  //   }
  // }, [activePrintRecord]);

  const [formData, setFormData] = useState({
    po_number: "",
    supplier_name: "",
    company_id: "", // Added
    branch_id: "", // Added
    order_date: new Date().toISOString().slice(0, 10),
    status: "Pending",
    items: [],
  });

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/purchase-orders/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranchesByCompany = async (companyId) => {
    try {
      // This API should filter branches by company_id in your backend
      const res = await axios.get(
        `${API_URL}/api/purchase-orders/branches?company_id=${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBranches(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // ================= FETCH DATA SERVICES =================
  const fetchPurchaseOrders = async (
    page = 1,
    limit = itemsPerPage,
    active = activeTab,
    status = statusTab,
  ) => {
    try {
      const res = await axios.get(`${API_URL}/api/purchase-orders`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        params: {
          page,
          limit,
          active,
          status,
        },
      });

      setPurchaseOrders(res.data.data || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders(currentPage, itemsPerPage, activeTab, statusTab);
  }, [currentPage, itemsPerPage, activeTab, statusTab]);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/suppliers/dropdown`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSuppliers();
    fetchCompanies();
    fetchProducts();
  }, []);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // ================= DYNAMIC FILTER MATRICES =================
  const filteredProductsBySupplier = useMemo(() => {
    if (!formData.supplier_name) return [];
    return products.filter(
      (p) =>
        p.supplier_name?.toLowerCase() ===
          formData.supplier_name.toLowerCase() ||
        p.supplier_id ===
          suppliers.find((s) => s.supplier_name === formData.supplier_name)?.id,
    );
  }, [formData.supplier_name, products, suppliers]);

  const getAvailableProductsForSpecificationRow = (currentRowIndex) => {
    const productsSelectedInOtherRows = formData.items
      .filter((_, idx) => idx !== currentRowIndex)
      .map((item) => item.product_name)
      .filter(Boolean);
    return filteredProductsBySupplier.filter(
      (product) => !productsSelectedInOtherRows.includes(product.product_name),
    );
  };

  const filtered = useMemo(() => {
    return purchaseOrders.filter((p) => {
      const text = `${p.invoice_no || p.po_number || ""} ${
        p.supplier_name || ""
      } ${p.product_name || ""}`.toLowerCase();

      const searchMatch = text.includes(search.toLowerCase());

      // Active / Inactive filter
      const activeMatch =
        activeTab === "active"
          ? Number(p.active) === 0
          : Number(p.active) === 1;

      // Pending / Approved / Rejected filter
      const statusMatch =
        (p.status || "").toLowerCase() === statusTab.toLowerCase();

      return searchMatch && activeMatch && statusMatch;
    });
  }, [purchaseOrders, search, activeTab, statusTab]);

  // ================= SPREADSHEET EXPORT SERVICES =================
  const handleExportToExcel = () => {
    if (filtered.length === 0) {
      alert("No data available to export.");
      return;
    }
    const formattedData = filtered.map((item) => ({
      OrderID: item.order_id || item.id,
      PONumber: item.invoice_no || item.po_number || "N/A",
      SupplierName: item.supplier_name || "N/A",
      ProductName: item.product_name || "N/A",
      SKU: item.sku || "N/A",
      Quantity: item.qty || 0,
      "PurchasePrice(₹)": item.purchase_price || 0,
      "TotalAmount(₹)": item.total_amount || 0,
      OrderDate: item.order_date || "N/A",
      Status: item.status || "Pending",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PO_Ledger");
    XLSX.writeFile(
      workbook,
      `PO_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // ================= DOWNLOAD BLANK BULK TEMPLATE =================
  const handleDownloadTemplate = () => {
    const headers = [
      "PONumber",
      "SupplierName",
      "ProductName",
      "Quantity",
      "PurchasePrice(₹)",
      "OrderDate",
      "Status",
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PO_Template");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "Purchase_Order_Bulk_Template.xlsx");
  };

  // ================= BULK INGESTION HANDLER =================
  const handleBulkExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (rawData.length === 0)
          return alert("Spreadsheet workspace is empty.");
        const parsedOrders = rawData.map((row) => ({
          po_number: row["PONumber"] || row["po_number"] || "",
          supplier_name: row["SupplierName"] || row["supplier_name"] || "",
          product_name: row["ProductName"] || row["product_name"] || "",
          qty: row["Quantity"] || row["qty"] || 0,
          purchase_price: row["PurchasePrice(₹)"] || row["purchase_price"] || 0,
          total_amount:
            Number(row["Quantity"] || 0) * Number(row["PurchasePrice(₹)"] || 0),
          order_date: row["OrderDate"] || new Date().toISOString().slice(0, 10),
          status: row["Status"] || "Pending",
        }));
        const response = await axios.post(
          `${API_URL}/api/purchase-orders/bulk-upload`,
          { purchaseOrders: parsedOrders },
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          },
        );
        if (response.data.success) {
          alert(response.data.message);
          fetchPurchaseOrders();
        }
      } catch (error) {
        alert("Error parsing excel ledger properties data structure.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // ================= CORE ACTION REDUCERS =================
  const handleMasterChange = (e) => {
    const { name, value } = e.target;
    if (name === "supplier_name") {
      setFormData((prev) => ({
        ...prev,
        supplier_name: value,
        items: value
          ? [
              {
                product_name: "",
                sku: "",
                qty: 1,
                mrp: 0,
                gst: 18,
                total_amount: 0,
                color: "",
                height: "",
                width: "",
                length: "",
                gender: "",
              },
            ]
          : [],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRow = () => {
    if (!formData.supplier_name) return;
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_name: "",
          sku: "",
          qty: 1,
          mrp: 0,
          gst: 18,
          total_amount: 0,
          color: "",
          height: "",
          width: "",
          length: "",
          gender: "",
        },
      ],
    }));
  };

  const handleRemoveRow = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleRowChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    let currentItem = { ...updatedItems[index], [field]: value };
    if (field === "product_name") {
      const selectedProd = products.find((p) => p.product_name === value);
      currentItem.mrp = selectedProd
        ? selectedProd.purchase_price || selectedProd.price || 0
        : 0;
      currentItem.gst = selectedProd ? selectedProd.gst_percentage || 18 : 18;
      currentItem.sku = selectedProd?.sku_code || selectedProd?.sku || "";
      currentItem.color = selectedProd?.color || "";
      currentItem.height = selectedProd?.height || "";
      currentItem.width = selectedProd?.width || "";
      currentItem.length = selectedProd?.length || "";
      currentItem.gender = selectedProd?.gender || "";
    }
    const quantity =
      field === "qty" ? parseInt(value) || 0 : parseInt(currentItem.qty) || 0;
    const price =
      field === "mrp"
        ? parseFloat(value) || 0
        : parseFloat(currentItem.mrp) || 0;
    const gstRate =
      field === "gst"
        ? parseFloat(value) || 0
        : parseFloat(currentItem.gst) || 0;
    const baseGross = quantity * price;
    currentItem.total_amount = baseGross + baseGross * (gstRate / 100);
    updatedItems[index] = currentItem;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculatedGrandTotal = useMemo(() => {
    return formData.items.reduce(
      (sum, item) => sum + (parseFloat(item.total_amount) || 0),
      0,
    );
  }, [formData.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Please add at least one product row item sequence.");
      return;
    }

    // 1. Prepare the payload with Names
    const selectedCompany = companies.find(
      (c) => String(c.id) === String(formData.company_id),
    );
    const selectedBranch = branches.find(
      (b) => String(b.id) === String(formData.branch_id),
    );

    const payload = {
      ...formData,
      company_name: selectedCompany ? selectedCompany.company_name : "",
      branch_name: selectedBranch ? selectedBranch.branch_name : "",
    };

    try {
      const config = {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      };

      if (editId) {
        const res = await axios.put(
          `${API_URL}/api/purchase-orders/update/${editId}`,
          payload,
          config,
        );
        alert(res.data.message || "Record Updated!");
      } else {
        const res = await axios.post(
          `${API_URL}/api/purchase-orders/create-batch`,
          payload,
          config,
        );
        alert(res.data.message || "Order Saved!");
      }

      fetchPurchaseOrders();
      resetForm();
    } catch (err) {
      console.error("Axios Submission Context:", err);
      const serverErrorMessage =
        err.response?.data?.message ||
        "Error trying to process multi-row batch data operations.";
      alert(serverErrorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      po_number: "",
      supplier_name: "",
      order_date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      items: [],
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditId(item.order_id || item.id);

    let formattedLineItems = [];
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      formattedLineItems = item.items.map((subItem) => ({
        product_name: subItem.product_name || "",
        sku: subItem.sku || "",
        qty: subItem.qty || 1,
        mrp: subItem.purchase_price || subItem.mrp || 0,
        gst: subItem.gst_percentage || subItem.gst || 18,
        total_amount: subItem.total_amount || 0,
        color: subItem.color || "",
        height: subItem.height || "",
        width: subItem.width || "",
        length: subItem.length || "",
        gender: subItem.gender || "",
      }));
    } else {
      formattedLineItems = [
        {
          product_name: item.product_name || "",
          sku: item.sku || "",
          qty: item.qty || 1,
          mrp: item.purchase_price || 0,
          gst: item.gst_percentage || 18,
          total_amount: item.total_amount || 0,
          color: item.color || "",
          height: item.height || "",
          width: item.width || "",
          length: item.length || "",
          gender: item.gender || "",
        },
      ];
    }

    if (item.company_id) {
      fetchBranchesByCompany(item.company_id);
    }

    setFormData({
      po_number: item.invoice_no || item.po_number || "",
      supplier_name: item.supplier_name || "",
      company_id: item.company_id || "",
      branch_id: item.branch_id || "",
      order_date: item.order_date
        ? item.order_date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      status: item.status || "Pending",
      items: formattedLineItems,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase entry?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/purchase-orders/delete/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      fetchPurchaseOrders();
    } catch (err) {
      console.error("Deletion error:", err);
    }
  };
const handleStatusUpdate = async (id, status) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/purchase-orders/status/${id}`,
      {
        status: status,
      },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    alert(res.data.message || "Status updated successfully");

    fetchPurchaseOrders(
      currentPage,
      itemsPerPage,
      activeTab,
      statusTab
    );
  } catch (err) {
    console.error("Status update error:", err);

    alert(
      err.response?.data?.message || "Status update failed"
    );
  }
};
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-success-subtle text-success border border-success-subtle";
      case "pending":
        return "bg-warning-subtle text-warning border border-warning-subtle";
      case "cancelled":
        return "bg-danger-subtle text-danger border border-danger-subtle";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  return (
    <div className="container-fluid p-0 min-vh-100">
      {viewingPrintRecord ? (
        /* --- Screen 1: Dedicated Invoice Preview View Page --- */
        <InvoiceView
          data={viewingPrintRecord}
          onBack={() => setViewingPrintRecord(null)}
        />
      ) : !showForm ? (
        /* --- Screen 2: Master Grid Dashboard Table Panel --- */
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h3 className="page-title m-0">
              Purchase Orders{" "}
              <span className="text-success fw-semibold">({totalCount})</span>
            </h3>
            <div className=" d-flex justify-content-between align-items-center flex-wrap gap-3">
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
                  onClick={() =>
                    document.getElementById("bulkPoExcelFileInput").click()
                  }
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
          </div>

          <div
            className="card border-0 shadow-sm p-3 bg-white"
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
                    className="form-control bg-white"
                    style={{
                      height: "40px",
                      borderColor: "#ced4da",
                      fontSize: "14px",
                    }}
                    placeholder="Search PO ledger..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    className="btn d-flex align-items-center justify-content-center px-3 text-white"
                    type="button"
                    style={{ backgroundColor: "#007bff" }}
                  >
                    <FaSearch size={14} />
                  </button>
                  <button
                    className="btn d-flex align-items-center justify-content-center px-3 text-white"
                    type="button"
                    onClick={() => setSearch("")}
                    style={{ backgroundColor: "#6c757d" }}
                  >
                    <FaSyncAlt size={14} />
                  </button>
                  <button
                    className="btn d-flex align-items-center justify-content-center px-3 text-white"
                    type="button"
                    onClick={handleExportToExcel}
                    style={{ backgroundColor: "#198754" }}
                  >
                    <FaFileExcel size={14} />
                  </button>
                </div>
              </div>
              <button
                className="btn text-white px-4 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                style={{
                  height: "40px",
                  backgroundColor: "#1a1d20",
                  borderRadius: "50px",
                  fontSize: "14px",
                }}
                onClick={() => setShowForm(true)}
              >
                <FaPlus size={12} /> Add Purchase Order
              </button>
            </div>
          </div>

          <div className="card border-0 p-2">
            <div className="card-body py-2">
              <div className="d-flex align-items-center flex-wrap gap-3">
                {/* Active / Inactive */}
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${
                      activeTab === "active" ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setActiveTab("active")}
                  >
                    Active
                  </button>

                  <button
                    className={`btn ${
                      activeTab === "inactive" ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setActiveTab("inactive")}
                  >
                    Inactive
                  </button>
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "1px",
                    height: "32px",
                    backgroundColor: "#000",
                  }}
                ></div>

                {/* Pending / Approved / Rejected */}
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${
                      statusTab === "Pending" ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setStatusTab("Pending")}
                  >
                    Pending
                  </button>

                  <button
                    className={`btn ${
                      statusTab === "approved" ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setStatusTab("approved")}
                  >
                    Approved
                  </button>

                  <button
                    className={`btn ${
                      statusTab === "rejected" ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setStatusTab("rejected")}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="card border-0 shadow-sm p-0 rounded-3"
            style={{ overflow: "visible" }}
          >
            <div className="table-responsive" style={{ overflow: "visible" }}>
              <table className="table table-hover align-middle mb-0 bg-white">
                <thead className="table-dark">
                  <tr>
                    <th className="py-3 px-3" style={{ width: "70px" }}>
                      ID
                    </th>
                    <th className="py-3">PONumber</th>
                    <th className="py-3">PODate</th>
                    <th className="py-3">Supplier Target</th>
                    <th className="py-3">Total Value</th>
                    <th className="py-3" style={{ width: "130px" }}>
                      Status
                    </th>
                    <th
                      className="py-3 px-3 text-center"
                      style={{ width: "110px" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((p) => {
                      const currentId = p.order_id || p.id;
                      return (
                        <tr key={currentId}>
                          <td className="px-3 text-muted fw-medium">
                            {currentId}
                          </td>
                          <td className="fw-bold text-dark font-monospace">
                            {p.invoice_no || p.po_number || "N/A"}
                          </td>
                          <td className="text-secondary">
                            {p.order_date ? p.order_date.split("T")[0] : "N/A"}
                          </td>
                          <td className="text-secondary">{p.supplier_name}</td>
                          <td className="text-dark fw-bold">
                            ₹{" "}
                            {Number(
                              p.total_amount || p.grand_total || 0,
                            ).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-1.5 fw-semibold ${getStatusBadgeClass(p.status)}`}
                            >
                              {p.status || "Pending"}
                            </span>
                          </td>
                          <td
                            className="px-3 text-center position-relative"
                            style={{ overflow: "visible" }}
                          >
                            <button
                              className="btn btn-light bg-white border p-0 d-inline-flex align-items-center justify-content-center shadow-sm"
                              style={{ width: "34px", height: "34px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(
                                  openDropdownId === currentId
                                    ? null
                                    : currentId,
                                );
                              }}
                            >
                              <FaEllipsisV size={14} />
                            </button>
                            {openDropdownId === currentId && (
                              <div
                                className="position-absolute bg-white border rounded-3 shadow-lg py-1 text-start"
                                style={{
                                  right: "24px",
                                  top: "38px",
                                  zIndex: 9999,
                                  minWidth: "140px",
                                  border: "1px solid #cbd5e1",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="dropdown-item px-3 py-2 text-dark fw-medium"
                                  style={{ fontSize: "13px" }}
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleEdit(p);
                                  }}
                                >
                                  Edit Record
                                </button>
                                <button
                                  className="dropdown-item px-3 py-2 text-dark fw-medium"
                                  style={{ fontSize: "13px" }}
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setViewingPrintRecord(p);
                                  }}
                                >
                                  View Invoice
                                </button>
                                <button
                                  className="dropdown-item px-3 py-2 text-danger fw-medium"
                                  style={{ fontSize: "13px" }}
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleDelete(currentId);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No Purchase Orders found in database view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center p-3 flex-wrap">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount}
              </div>

              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  style={{ width: "100px" }}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ),
                  )}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* --- Screen 3: Transaction Batch Creator Form Panel --- */
        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1 text-dark">
                {editId
                  ? "Update Purchase Manifest"
                  : "Draft New Purchase Order"}
              </h4>
              <small className="text-muted">
                Populate transactional records using normalized architecture
              </small>
            </div>
            <button
              className="btn btn-outline-dark rounded-pill px-4"
              onClick={resetForm}
              style={{ fontSize: "14px" }}
            >
              Back To Grid
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary">
                  PONumber (Invoice No)
                </label>
                <input
                  className="form-control bg-white"
                  name="po_number"
                  placeholder="e.g. PO-2026-001"
                  value={formData.po_number}
                  onChange={handleMasterChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary">
                  PODate
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-secondary">
                    <FaCalendarAlt />
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    name="order_date"
                    value={
                      formData.order_date
                        ? formData.order_date.slice(0, 10)
                        : ""
                    }
                    onChange={handleMasterChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4 mb-1">
                <label className="form-label fw-semibold text-secondary">
                  Select Supplier <span className="text-danger">*</span>
                </label>
                <Select
                  options={suppliers.map((s) => ({
                    value: s.supplier_name,
                    label: s.supplier_name,
                  }))}
                  value={
                    formData.supplier_name
                      ? {
                          value: formData.supplier_name,
                          label: formData.supplier_name,
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    // Trigger your existing logic
                    handleMasterChange({
                      target: {
                        name: "supplier_name",
                        value: selectedOption ? selectedOption.value : "",
                      },
                    });
                  }}
                  placeholder="Search & Select Supplier..."
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: "#ced4da",
                      padding: "2px",
                    }),
                  }}
                />
              </div>

              {/* Company Dropdown */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary">
                  Company
                </label>
                <select
                  className="form-select"
                  value={formData.company_id}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      company_id: val,
                      branch_id: "",
                    }));
                    if (val) fetchBranchesByCompany(val);
                    else setBranches([]);
                  }}
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Dropdown */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary">
                  Branch
                </label>
                <select
                  className="form-select"
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      branch_id: e.target.value,
                    }))
                  }
                  disabled={!formData.company_id}
                  required
                >
                  <option value="">
                    {formData.company_id
                      ? "Select Branch"
                      : "Select Company First"}
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark m-0">Line Items List</h5>
              <button
                type="button"
                className="btn btn-sm text-white px-3 fw-semibold d-flex align-items-center gap-1"
                style={{
                  backgroundColor: "#007bff",
                  opacity: formData.supplier_name ? 1 : 0.5,
                }}
                onClick={handleAddRow}
                disabled={!formData.supplier_name}
              >
                <FaPlus size={10} /> Add Item Row
              </button>
            </div>

            <div className="table-responsive border rounded-3 mb-4">
              <table className="table align-middle mb-0 table-bordered">
                <thead
                  className="table-secondary text-dark"
                  style={{ fontSize: "13px" }}
                >
                  <tr>
                    <th>Product Selection & Variants</th>
                    <th style={{ width: "95px" }}>Quantity</th>
                    <th style={{ width: "130px" }}>MRP (₹)</th>
                    <th style={{ width: "105px" }}>GST (%)</th>
                    <th style={{ width: "155px" }}>Total Amount (₹)</th>
                    <th className="text-center" style={{ width: "55px" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length > 0 ? (
                    formData.items.map((item, index) => {
                      const contextualAvailableProducts =
                        getAvailableProductsForSpecificationRow(index);
                      return (
                        <tr key={index}>
                          <td>
                            <select
                              className="form-select form-select-sm border-0 shadow-none bg-transparent"
                              value={item.product_name}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "product_name",
                                  e.target.value,
                                )
                              }
                              required
                            >
                              <option value="">Select Target Product</option>
                              {item.product_name &&
                                !contextualAvailableProducts.some(
                                  (p) => p.product_name === item.product_name,
                                ) && (
                                  <option value={item.product_name}>
                                    {item.product_name}
                                  </option>
                                )}
                              {contextualAvailableProducts.map((p) => (
                                <option key={p.id} value={p.product_name}>
                                  {p.product_name}
                                </option>
                              ))}
                            </select>
                            <div
                              className="d-flex gap-2 px-2 text-muted font-monospace"
                              style={{ fontSize: "11px" }}
                            >
                              <span>SKU: {item.sku || "N/A"}</span>|
                              <span>Color: {item.color || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm border-0 font-monospace text-center bg-transparent shadow-none"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                handleRowChange(index, "qty", e.target.value)
                              }
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm border-0 font-monospace bg-transparent shadow-none"
                              min="0"
                              step="0.01"
                              value={item.mrp}
                              onChange={(e) =>
                                handleRowChange(index, "mrp", e.target.value)
                              }
                              required
                            />
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm border-0 bg-transparent shadow-none text-center font-monospace"
                              value={item.gst}
                              onChange={(e) =>
                                handleRowChange(index, "gst", e.target.value)
                              }
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                          <td className="bg-light">
                            <div className="input-group input-group-sm border-0">
                              <span className="input-group-text bg-transparent border-0 text-muted px-1">
                                <FaFileInvoiceDollar size={11} />
                              </span>
                              <input
                                className="form-control form-control-sm border-0 bg-transparent fw-bold text-dark font-monospace shadow-none"
                                value={Number(item.total_amount).toFixed(2)}
                                readOnly
                              />
                            </div>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0"
                              onClick={() => handleRemoveRow(index)}
                            >
                              <FaTrashAlt size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-4 text-muted bg-white"
                        style={{ fontSize: "13px" }}
                      >
                        Select a Supplier from the dropdown above to initialize
                        line item entries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="row justify-content-end mb-4">
              <div className="col-md-5">
                <div className="card p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-secondary">
                      Grand Invoice Total:
                    </span>
                    <h4 className="fw-bold text-dark m-0">
                      ₹{" "}
                      {calculatedGrandTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-dark rounded-pill px-5 shadow-sm"
              >
                {editId ? "Update Complete Entry" : "Save Complete Entry"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
