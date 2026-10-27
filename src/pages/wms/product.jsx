import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FaSearch,
  FaSyncAlt,
  FaFileExcel,
  FaPlus,
  FaUpload,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

// Separate Product Row component to prevent whole table list re-rendering during standalone operations
const ProductRow = React.memo(
  ({
    item,
    index,
    currentPage,
    itemsPerPage,
    activeTab,
    onEdit,
    onDelete,
    onRestore,
    apiUrl,
  }) => {
    return (
      <tr>
        <td className="px-3 text-muted fw-medium">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </td>
        <td>
          {item.images && item.images.length > 0 ? (
            <img
              src={`${IMG_URL ?? ""}/api/${item.images[0].image_path}`}
              alt=""
              width="48"
              height="48"
              loading="lazy"
              style={{
                objectFit: "cover",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            />
          ) : (
            <span className="text-muted" style={{ fontSize: "12px" }}>
              No Image
            </span>
          )}
        </td>
        <td className="fw-bold text-dark">{item.product_name}</td>
        <td className="text-secondary">{item.supplier_name}</td>
        <td className="font-monospace">{item.sku_code}</td>
        <td className="text-dark fw-medium">₹{item.purchase_price}</td>
        <td className="text-dark fw-medium">₹{item.sale_price}</td>
        <td className="px-3 text-center">
          <div className="dropdown d-inline-block">
            <button
              className="btn btn-light bg-white border p-0 d-inline-flex align-items-center justify-content-center shadow-sm"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "6px",
                borderColor: "#cbd5e1",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end shadow-lg border-0 py-1"
              style={{ fontSize: "13px", minWidth: "120px" }}
            >
              <li>
                <button
                  className="dropdown-item py-2 fw-medium text-dark"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
              </li>
              <li>
                {activeTab === "active" ? (
                  <button
                    className="dropdown-item py-2 fw-medium text-danger"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    className="dropdown-item py-2 fw-medium text-success"
                    onClick={() => onRestore(item)}
                  >
                    Restore
                  </button>
                )}
              </li>
            </ul>
          </div>
        </td>
      </tr>
    );
  },
);

const API_URL = import.meta.env.VITE_API_URL;
const IMG_URL = import.meta.env.VITE_FRONTEND_FOLDER;
const Product = () => {
  const token = localStorage.getItem("token");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [totalCount, setTotalCount] = useState(0);

  // ================= PAGINATION STATE ENGINE =================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Defaults to 10 rows per page view boundary

  const [errors, setErrors] = useState({
    supplier_name: false,
    product_name: false,
    sku_code: false,
  });

  const [hsnList, setHsnList] = useState([]);

  // Add a fetch function
  const fetchHsnCodes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/hsn-code`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      // console.log("hsnCode:", res.data);

      setHsnList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching HSN codes:", err);
    }
  };

  const [units, setUnits] = useState([]);

  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/uom`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setUnits(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const [formData, setFormData] = useState({
    supplier_name: "",
    product_name: "",
    sku_code: "",
    color: "#000000",
    height: "",
    width: "",
    length: "",
    gender: "",
    hsn_code: "",
    purchase_price: "",
    sale_price: "",
    gst_percentage: "",
    uom_id: "",
    uom: "",
    status: "active",
  });

  const [images, setImages] = useState(Array(10).fill(null));
  const [previewImages, setPreviewImages] = useState(Array(10).fill(null));

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async (statusType, page = 1, limit = itemsPerPage) => {
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        params: {
          status: statusType,
          page,
          limit,
        },
      });

      setProducts(response.data.data || []);
      setTotalCount(response.data.totalCount || 0);
      setCurrentPage(page);
    } catch (error) {
      console.log(error);
    }
  };
  // ================= FETCH SUPPLIERS =================
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/suppliers`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      // console.log("Suppliers:", res.data);
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  useEffect(() => {
    fetchProducts(activeTab, currentPage, itemsPerPage);
  }, [activeTab, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSuppliers();
    fetchHsnCodes(); // Add this
    fetchUnits(); // New
  }, []);

  // ================= FILTER PRODUCTS BY SEARCH QUERY =================
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return products;
    return products.filter((item) => {
      return (
        (item.product_name || "").toLowerCase().includes(query) ||
        (item.supplier_name || "").toLowerCase().includes(query) ||
        (item.sku_code || "").toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  // Reset page window index to 1 whenever search text content mutates
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ================= ACTION UTILITIES STABLE DECLARATION =================
  const handleEdit = useCallback(
    (item) => {
      setEditId(item.id);
      setFormData({
        supplier_name: item.supplier_name || "",
        product_name: item.product_name || "",
        sku_code: item.sku_code || "",
        color: item.color || "#000000",
        height: item.height || "",
        width: item.width || "",
        length: item.length || "",
        gender: item.gender || "",
        hsn_code: item.hsn_code || "",
        purchase_price: item.purchase_price || "",
        sale_price: item.sale_price || "",
        gst_percentage: item.gst_percentage || "",
        uom_id: item.uom_id || "",
        uom: item.uom || "",
        status: item.status || "active",
      });
      const oldPreview = Array(10).fill(null);
      if (item.images) {
        item.images.forEach((img, index) => {
          oldPreview[index] = `${IMG_URL ?? ""}/api/${img.image_path}`;
        });
      }
      setPreviewImages(oldPreview);
      setShowForm(true);
    },
    [IMG_URL],
  );
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Archive Product?")) return;

      try {
        await axios.post(
          `${API_URL}/api/products/delete/${id}`,
          {},
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );

        alert("Product Archived Successfully");

        fetchProducts(activeTab, currentPage, itemsPerPage);
      } catch (error) {
        console.log(error);

        alert(error.response?.data?.message || "Delete Failed");
      }
    },
    [API_URL, token, activeTab, currentPage, itemsPerPage],
  );

  const handleRestore = useCallback(
    async (item) => {
      if (
        !window.confirm(`Restore "${item.product_name}" back to active status?`)
      )
        return;
      try {
        await axios.post(
          `${API_URL}/api/products/restore/${item.id}`,
          { ...item, status: "active" },
          { headers: { Authorization: token ? `Bearer ${token}` : "" } },
        );
        alert("Product Restored Successfully");
        fetchProducts(activeTab);
      } catch (error) {
        console.log(error);
        alert("Failed to restore product");
      }
    },
    [API_URL, token, activeTab],
  );

  // ================= EXPORT DATA ENGINE TO EXCEL =================
  const handleExportToExcel = () => {
    if (filteredProducts.length === 0) {
      alert(
        "No data available to export in the current view filtering framework.",
      );
      return;
    }
    const formattedData = filteredProducts.map((item) => ({
      ProductID: item.id,
      ProductName: item.product_name || "N/A",
      SupplierName: item.supplier_name || "N/A",
      SKUCode: item.sku_code || "N/A",
      HSNCode: item.hsn_code || "N/A",
      ColorHex: item.color || "#000000",
      "Height(cm)": item.height || "-",
      "Width(cm)": item.width || "-",
      "Length(cm)": item.length || "-",
      GenderSegment: item.gender || "Universal",
      "PurchasePrice(₹)": item.purchase_price ? Number(item.purchase_price) : 0,
      "SalePrice(₹)": item.sale_price ? Number(item.sale_price) : 0,
      "GSTPercentage(%)": item.gst_percentage
        ? `${item.gst_percentage}%`
        : "0%",
      SystemStatus: item.status || "active",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductsLedger");
    const fileName = `Products_Report_${activeTab}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // ================= DOWNLOAD BLANK BULK TEMPLATE =================
  const handleDownloadTemplate = () => {
    const headers = [
      "ProductName",
      "SupplierName",
      "SKUCode",
      "HSNCode",
      "ColorHex",
      "Height(cm)",
      "Width(cm)",
      "Length(cm)",
      "GenderSegment",
      "PurchasePrice(₹)",
      "SalePrice(₹)",
      "GSTPercentage(%)",
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "Product_Bulk_Import_Template.xlsx");
  };

  // ================= PARSE & EXECUTE BULK UPLOAD FILE =================
  const handleBulkExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (rawData.length === 0) {
          alert("The selected spreadsheet workspace contains no data rows.");
          return;
        }

        const cleanPayload = rawData.map((row) => ({
          product_name: row["ProductName"]
            ? String(row["ProductName"]).trim()
            : "",
          supplier_name: row["SupplierName"]
            ? String(row["SupplierName"]).trim()
            : "",
          sku_code: row["SKUCode"] ? String(row["SKUCode"]).trim() : "",
          hsn_code: row["HSNCode"] ? String(row["HSNCode"]).trim() : "",
          color: row["ColorHex"] ? String(row["ColorHex"]).trim() : "#000000",
          height: row["Height(cm)"] ? String(row["Height(cm)"]).trim() : "",
          width: row["Width(cm)"] ? String(row["Width(cm)"]).trim() : "",
          length: row["Length(cm)"] ? String(row["Length(cm)"]).trim() : "",
          gender: row["GenderSegment"]
            ? String(row["GenderSegment"]).trim()
            : "Universal",
          purchase_price: row["PurchasePrice(₹)"]
            ? Number(row["PurchasePrice(₹)"])
            : 0,
          sale_price: row["SalePrice(₹)"] ? Number(row["SalePrice(₹)"]) : 0,
          gst_percentage: row["GSTPercentage(%)"]
            ? String(row["GSTPercentage(%)"]).replace("%", "").trim()
            : "0",
        }));

        const validPayload = cleanPayload.filter(
          (item) => item.product_name !== "",
        );
        if (validPayload.length === 0) {
          alert(
            "No valid rows found. Please ensure the 'ProductName' column is filled.",
          );
          return;
        }

        if (
          !window.confirm(
            `Are you sure you want to run bulk processing imports for ${validPayload.length} product entries?`,
          )
        ) {
          e.target.value = "";
          return;
        }

        const response = await axios.post(
          `${API_URL}/api/products/bulk-upload`,
          { products: validPayload },
          { headers: { Authorization: token ? `Bearer ${token}` : "" } },
        );

        if (response.data.success) {
          alert(response.data.message || "Bulk Data Imported Successfully!");
          fetchProducts(activeTab);
        }
      } catch (error) {
        console.error("Failed executing file ingestion engine:", error);
        alert(
          `Error parsing file structure. Verify column properties match rules. Error: ${error.message}`,
        );
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleTabChange = (tabName) => {
    setSearch("");
    setCurrentPage(1);
    setActiveTab(tabName);
    setActiveTab(tabName);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const updatedImages = [...images];
    updatedImages[index] = file;
    setImages(updatedImages);
    const updatedPreview = [...previewImages];
    updatedPreview[index] = URL.createObjectURL(file);
    setPreviewImages(updatedPreview);
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages[index] = null;
    const updatedPreview = [...previewImages];
    updatedPreview[index] = null;
    setImages(updatedImages);
    setPreviewImages(updatedPreview);
  };

  const handleProceedNext = () => {
    const { supplier_name, product_name, sku_code, uom_id } = formData;
    const newErrors = {
      supplier_name: !supplier_name.trim(),
      product_name: !product_name.trim(),
      sku_code: !sku_code.trim(),
      uom_id: !uom_id, // Add this if you want to enforce it
    };
    setErrors(newErrors);

    if (
      newErrors.supplier_name ||
      newErrors.product_name ||
      newErrors.sku_code
    ) {
      alert(
        "Please complete all required fields (*): Supplier, Product Title, and SKU Code before proceeding.",
      );
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Disable button to prevent double-submission
    setIsSubmitting(true);
    const hasImage = previewImages.some((img) => img !== null);
    if (!hasImage) {
      alert("Please upload at least 1 image slot asset.");
      setIsSubmitting(false);
      return;
    }
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });
      images.forEach((img) => {
        if (img) form.append("product-img", img);
      });
      if (editId) {
        await axios.post(`${API_URL}/api/products/update/${editId}`, form, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Updated Successfully");
      } else {
        await axios.post(`${API_URL}/api/products/create`, form, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Created Successfully");
      }
      fetchProducts(activeTab);
      resetForm();
    } catch (error) {
      console.log(error);
      alert("Something went wrong processing datastreams.");
    } finally {
      // Re-enable in all cases (success or failure)
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_name: "",
      product_name: "",
      sku_code: "",
      color: "#000000",
      height: "",
      width: "",
      length: "",
      gender: "",
      hsn_code: "",
      purchase_price: "",
      sale_price: "",
      gst_percentage: "",
      uom_id: "",
      uom: "",
      status: "active",
    });
    setErrors({
      supplier_name: false,
      product_name: false,
      sku_code: false,
    });
    setImages(Array(10).fill(null));
    setPreviewImages(Array(10).fill(null));
    setEditId(null);
    setStep(1);
    setShowForm(false);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="container-fluid p-0 min-vh-100">
      {!showForm && (
        <>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h3 className="page-title m-0">
              Product Management{" "}
              <span className="text-success fw-semibold">({totalCount})</span>
            </h3>
            <div className="d-flex gap-2">
              {/* DOWNLOAD EMPTY TEMPLATE ACTION */}
              <button
                className="btn btn-warning btn-sm"
                onClick={handleDownloadTemplate}
              >
                Download Template
              </button>

              {/* BULK UPLOAD SELECTION TRIGGER */}
              <button
                className="btn btn-info btn-sm"
                type="button"
                onClick={() =>
                  document.getElementById("bulkExcelFileInput")?.click()
                }
              >
                <FaUpload className="me-1" />
                Bulk Upload
              </button>

              <input
                type="file"
                id="bulkExcelFileInput"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleBulkExcelUpload}
              />
            </div>
          </div>

          <ul className="nav nav-pills mb-3 gap-2 bg-white p-2 rounded-3 shadow-sm d-inline-flex">
            <li className="nav-item">
              <button
                className={`nav-link rounded-2 fw-semibold px-4 py-2 ${activeTab === "active" ? "active bg-dark text-white" : "text-secondary"}`}
                onClick={() => handleTabChange("active")}
                style={{ fontSize: "14px" }}
              >
                Active Products
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-2 fw-semibold px-4 py-2 ${activeTab === "inactive" ? "active bg-dark text-white" : "text-secondary"}`}
                onClick={() => handleTabChange("inactive")}
                style={{ fontSize: "14px" }}
              >
                Archived/Inactive
              </button>
            </li>
          </ul>

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
                    className="form-control bg-white"
                    style={{
                      height: "40px",
                      borderColor: "#ced4da",
                      fontSize: "14px",
                      borderRadius: "4px 0 0 4px",
                    }}
                    placeholder="Search current list view..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    list="productSuggestions"
                  />
                  <datalist id="productSuggestions">
                    {products.map((item) => (
                      <option key={item.id} value={item.product_name} />
                    ))}
                  </datalist>
                  <button
                    className="btn d-flex align-items-center justify-content-center px-3 text-white"
                    type="button"
                    style={{
                      backgroundColor: "#007bff",
                      borderRadius: "0",
                      height: "40px",
                    }}
                  >
                    <FaSearch size={14} />
                  </button>
                  <button
                    className="btn d-flex align-items-center justify-content-center px-3 text-white"
                    type="button"
                    onClick={() => setSearch("")}
                    style={{
                      backgroundColor: "#6c757d",
                      borderRadius: "0",
                      height: "40px",
                    }}
                    title="Reset Filter"
                  >
                    <FaSyncAlt size={14} />
                  </button>
                  <button
                    className="btn d-flex align-items-center justify-content-center px-3 text-white"
                    type="button"
                    onClick={handleExportToExcel}
                    style={{
                      backgroundColor: "#198754",
                      borderRadius: "0 4px 4px 0",
                      height: "40px",
                    }}
                    title="Export File to Excel"
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
                  borderColor: "#1a1d20",
                  borderRadius: "50px",
                  fontSize: "14px",
                }}
                onClick={() => setShowForm(true)}
              >
                <FaPlus size={12} /> Add Product
              </button>
            </div>
          </div>

          <div className="card border-0 shadow-sm p-0 rounded-3 overflow-hidden">
            <div className="table-responsive" style={{ minHeight: "250px" }}>
              <table className="table table-hover align-middle mb-0 bg-white">
                <thead
                  className="table-dark"
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <tr>
                    <th
                      className="py-3 px-3 text-white"
                      style={{ width: "70px" }}
                    >
                      Sr. No
                    </th>
                    <th className="py-3 text-white" style={{ width: "90px" }}>
                      Image
                    </th>
                    <th className="py-3 text-white">Product</th>
                    <th className="py-3 text-white">Supplier</th>
                    <th className="py-3 text-white">SKU</th>
                    <th className="py-3 text-white">Purchase</th>
                    <th className="py-3 text-white">Sale</th>
                    <th
                      className="py-3 px-3 text-white text-center"
                      style={{ width: "110px" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item, index) => (
                      <ProductRow
                        key={item.id}
                        index={index}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        item={item}
                        activeTab={activeTab}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRestore={handleRestore}
                        apiUrl={API_URL}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-5 text-muted fw-medium"
                      >
                        No Data Found for this Category Workspace
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 p-3 flex-wrap gap-3">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount} entries
              </div>

              <div className="d-flex align-items-center gap-3">
                <select
                  className="form-select form-select-sm"
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
      )}

      {/*================= MULTI-STEP CREATION FORM PANEL =================*/}
      {showForm && (
        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1 text-dark">
                {editId ? "Update Product Catalog" : "Create New Product"}
              </h4>
              <small className="text-muted">
                Populate product data parameters step by step
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

          <div className="d-flex gap-2 mb-4">
            <button
              type="button"
              className={`btn rounded-pill px-4 fw-medium ${step === 1 ? "btn-dark" : "btn-outline-secondary"}`}
              style={{ fontSize: "14px" }}
              onClick={() => setStep(1)}
            >
              1. Basic Parameters
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-4 fw-medium ${step === 2 ? "btn-dark" : "btn-outline-secondary"}`}
              style={{ fontSize: "14px" }}
              onClick={handleProceedNext}
            >
              2. Image Assets Gallery
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="row g-3">
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
                      // Update state exactly like your handleChange
                      setFormData({
                        ...formData,
                        supplier_name: selectedOption
                          ? selectedOption.value
                          : "",
                      });
                      setErrors((prev) => ({ ...prev, supplier_name: false }));
                    }}
                    placeholder="Search & Select Supplier..."
                    isClearable
                    className={`${errors.supplier_name ? "is-invalid" : ""}`}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        borderColor: errors.supplier_name
                          ? "#dc3545"
                          : "#ced4da",
                        padding: "2px",
                      }),
                    }}
                  />
                  {errors.supplier_name && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      Supplier field parameter is required.
                    </div>
                  )}
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Product Title<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    className={`form-control rounded-3 ${errors.product_name ? "is-invalid" : ""}`}
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.product_name && (
                    <div
                      className="invalid-feedback"
                      style={{ fontSize: "11px" }}
                    >
                      Product Title string property is required.
                    </div>
                  )}
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    SKU Code<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku_code"
                    className={`form-control rounded-3 ${errors.sku_code ? "is-invalid" : ""}`}
                    value={formData.sku_code}
                    onChange={handleChange}
                    required
                  />
                  {errors.sku_code && (
                    <div
                      className="invalid-feedback"
                      style={{ fontSize: "11px" }}
                    >
                      SKU identifier metadata is required.
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Select Gender
                  </label>
                  <select
                    name="gender"
                    className="form-select rounded-3"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    HSN Code
                  </label>
                  <Select
                    options={hsnList.map((h) => ({
                      value: h.hsn_code,
                      label: `${h.hsn_code} - ${h.description}`,
                    }))}
                    value={
                      formData.hsn_code
                        ? {
                            value: formData.hsn_code,
                            label:
                              hsnList.find(
                                (h) => h.hsn_code === formData.hsn_code,
                              )?.description || formData.hsn_code,
                          }
                        : null
                    }
                    onChange={(selectedOption) => {
                      setFormData({
                        ...formData,
                        hsn_code: selectedOption ? selectedOption.value : "",
                      });
                    }}
                    placeholder="Search HSN..."
                    isClearable
                    styles={{
                      control: (base) => ({ ...base, borderRadius: "0.5rem" }),
                    }}
                  />
                </div>

                <div className="col-md-2 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Color Theme
                  </label>
                  <input
                    type="color"
                    name="color"
                    className="form-control form-control-color w-100 rounded-3"
                    value={formData.color}
                    onChange={handleChange}
                    style={{ height: "40px" }}
                  />
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Unit of Measure
                  </label>
                  <Select
                    options={units.map((u) => ({
                      value: u.uom_id,
                      label: `${u.unit_name} (${u.standard_abbreviation})`, // Keep your visual label
                      unit_name: u.unit_name, // Store the name for the backend
                    }))}
                    value={
                      units.find((u) => u.uom_id === formData.uom_id)
                        ? {
                            value: formData.uom_id,
                            label: units.find(
                              (u) => u.uom_id === formData.uom_id,
                            ).unit_name,
                          }
                        : null
                    }
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        uom_id: selected ? selected.value : null,
                        uom: selected ? selected.unit_name : null, // ADD THIS
                      })
                    }
                    placeholder="Select UOM..."
                    isClearable
                  />
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Height Dimension
                  </label>
                  <input
                    type="text"
                    name="height"
                    className="form-control rounded-3"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Width Dimension
                  </label>
                  <input
                    type="text"
                    name="width"
                    className="form-control rounded-3"
                    value={formData.width}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Length Dimension
                  </label>
                  <input
                    type="text"
                    name="length"
                    className="form-control rounded-3"
                    value={formData.length}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Base Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    className="form-control rounded-3"
                    value={formData.purchase_price}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    Target Retail Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    className="form-control rounded-3"
                    value={formData.sale_price}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label fw-semibold text-secondary">
                    GST Rate (%)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      name="gst_percentage"
                      className="form-control rounded-3"
                      style={{ borderRadius: "6px 0 0 6px" }}
                      value={formData.gst_percentage || ""}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <span
                      className="input-group-text bg-light text-secondary fw-semibold"
                      style={{ borderRadius: "0 6px 6px 0" }}
                    >
                      %
                    </span>
                  </div>
                </div>

                <div className="col-12 mt-4 pt-2">
                  <button
                    type="button"
                    className="btn btn-dark rounded-pill px-5 shadow-sm"
                    onClick={handleProceedNext}
                  >
                    Proceed Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="row">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div className="col-lg-2 col-md-3 col-6 mb-3" key={index}>
                      <div className="border rounded-3 p-2 bg-white shadow-sm">
                        <div
                          className="position-relative mb-2"
                          style={{
                            height: "110px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: "#f8f9fa",
                            border: "1px dashed #cbd5e1",
                          }}
                        >
                          {previewImages[index] ? (
                            <>
                              <img
                                src={previewImages[index]}
                                alt=""
                                className="w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  fontSize: "11px",
                                  padding: 0,
                                }}
                                onClick={() => removeImage(index)}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                              <div style={{ fontSize: "24px" }}>🖼️</div>
                              <small
                                style={{ fontSize: "11px" }}
                                className="fw-medium"
                              >
                                Slot {index + 1}
                              </small>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          name="product-img"
                          className="form-control form-control-sm"
                          style={{ fontSize: "11px" }}
                          onChange={(e) => handleImageChange(e, index)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="d-flex gap-2 mt-4 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setStep(1)}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-5 shadow-sm"
                    disabled={isSubmitting} // This disables the button
                  >
                    {isSubmitting
                      ? "Processing..."
                      : editId
                        ? "Update Product"
                        : "Save Product"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Product;
