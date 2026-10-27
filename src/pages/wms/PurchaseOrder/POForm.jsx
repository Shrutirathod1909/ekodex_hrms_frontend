import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { FaPlus, FaTrashAlt } from "react-icons/fa";

const POForm = ({ editData, onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [formData, setFormData] = useState({
    po_number: "",
    supplier_name: "",
    company_id: "",
    company_name: "",
    branch_id: "",
    branch_name: "",
    order_date: new Date().toISOString().slice(0, 10),
    items: [],
  });

  // ================= FETCH =================
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchCompanies();
  }, []);

  useEffect(() => {
    console.log("EDIT DATA:", editData);
    if (editData) {
      setFormData({
        po_number: editData.po_number || editData.invoice_no || "",
        supplier_name: editData.supplier_name || "",
        company_id: editData.company_id || "",
        company_name: editData.company_name || "",
        branch_id: editData.branch_id || "",
        branch_name: editData.branch_name || "",
        order_date: editData.order_date ? editData.order_date.slice(0, 10) : "",

        items: Array.isArray(editData.items)
          ? editData.items.map((i) => ({
              product_name: i.product_name || "",
              sku: i.sku || "",
              color: i.color || "",

              // 🔥 IMPORTANT FIX HERE
              mrp: Number(i.mrp ?? i.purchase_price ?? 0),
              qty: Number(i.qty || 1),
              gst: Number(i.gst || 18),
              total_amount: Number(i.total_amount || 0),
              height: i.height ?? null,
              width: i.width ?? null,
              length: i.length ?? null,
              gender: i.gender ?? null,
            }))
          : [],
      });

      if (editData.company_id) {
        fetchBranchesByCompany(editData.company_id);
      }

      if (editData.supplier_name) {
        fetchProductsBySupplier(editData.supplier_name);
      }
    }
  }, [editData]);

  const fetchSuppliers = async () => {
    const res = await axios.get(`${API_URL}/api/suppliers/dropdown`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSuppliers(res.data.data || []);
  };

  const fetchProducts = async () => {
    const res = await axios.get(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data.data || []);
  };
  const fetchProductsBySupplier = async (supplier_name) => {
    if (!supplier_name) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/products/supplier/${supplier_name}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSupplierProducts(res.data.products || []);
    } catch (err) {
      console.error("Supplier products error:", err);
      setSupplierProducts([]);
    }
  };
  const fetchCompanies = async () => {
    const res = await axios.get(`${API_URL}/api/purchase-orders/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data.data || []);
  };

  const fetchBranchesByCompany = async (companyId) => {
    const res = await axios.get(
      `${API_URL}/api/purchase-orders/branches?company_id=${companyId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setBranches(res.data.data || []);
  };

  // ================= MASTER CHANGE =================
  const handleMasterChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "supplier_name" ? { items: [] } : {}),
    }));

    // 👇 ADD THIS
    if (name === "supplier_name") {
      fetchProductsBySupplier(value);
    }
  };

  // ================= ADD ROW =================
  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product_name: "", qty: 1, mrp: 0, gst: 18, total_amount: 0 },
      ],
    }));
  };

  // ================= REMOVE ROW =================
  const handleRemoveRow = (index) => {
    const updated = [...formData.items];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  // ================= ROW CHANGE =================
  const handleRowChange = (i, field, value) => {
    const items = [...formData.items];
    items[i][field] = value;

    const qty = Number(items[i].qty || 0);
    const price = Number(items[i].mrp || 0);
    const gst = Number(items[i].gst || 0);

    const base = qty * price;
    items[i].total_amount = base + (base * gst) / 100;

    setFormData({ ...formData, items });
  };

  // ================= PRODUCT FILTER =================
  const getAvailableProductsForSpecificationRow = (index) => {
    const selected = formData.items
      .filter((_, i) => i !== index)
      .map((i) => i.product_name);

    return supplierProducts.filter((p) => !selected.includes(p.product_name));
  };
  // ================= GRAND TOTAL =================
  const calculatedGrandTotal = useMemo(() => {
    return formData.items.reduce(
      (sum, i) => sum + Number(i.total_amount || 0),
      0,
    );
  }, [formData.items]);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("===== FORM DATA =====", formData);

    const selectedCompany = companies.find(
      (c) => String(c.id) === String(formData.company_id),
    );

    const selectedBranch = branches.find(
      (b) => String(b.id) === String(formData.branch_id),
    );

    const payload = {
      po_number: formData.po_number,
      supplier_name: formData.supplier_name,

      company_id: formData.company_id,
      company_name: selectedCompany?.company_name || "",

      branch_id: formData.branch_id,
      branch_name: selectedBranch?.branch_name || "",

      order_date: formData.order_date,
      items: formData.items,
    };

    console.log("===== PAYLOAD =====", payload);

    const url = editData
      ? `${API_URL}/api/purchase-orders/update/${editData.id}`
      : `${API_URL}/api/purchase-orders/create-batch`;

    try {
      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data?.message || "Success");
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error");
    }
  };

  // ================= UI =================
  return (
    <div className="container-fluid p-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h4 className="fw-bold mb-1">DRAFT NEW PURCHASE ORDER</h4>
          <small className="text-muted">
            POPULATE TRANSACTIONAL RECORDS USING NORMALIZED ARCHITECTURE
          </small>
        </div>

        <button
          className="btn btn-outline-dark rounded-pill px-4"
          onClick={onClose}
        >
          Back To Grid
        </button>
      </div>

      {/* MASTER CARD */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* PO NUMBER */}
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

            {/* DATE */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">PODATE</label>
              <input
                type="date"
                className="form-control"
                name="order_date"
                value={formData.order_date}
                onChange={handleMasterChange}
              />
            </div>

            {/* SUPPLIER */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                SELECT SUPPLIER <span className="text-danger">*</span>
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
                onChange={(opt) =>
                  handleMasterChange({
                    target: {
                      name: "supplier_name",
                      value: opt?.value || "",
                    },
                  })
                }
                isClearable
              />
            </div>

            {/* COMPANY */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">COMPANY</label>

              <select
                className="form-select"
                value={formData.company_id}
                onChange={(e) => {
                  const companyId = e.target.value;

                  const selectedCompany = companies.find(
                    (c) => c.id === Number(companyId),
                  );

                  setFormData((prev) => ({
                    ...prev,
                    company_id: companyId,
                    company_name: selectedCompany
                      ? selectedCompany.company_name
                      : "",
                    branch_id: "",
                    branch_name: "",
                  }));

                  fetchBranchesByCompany(companyId);
                }}
              >
                <option value="">Select Company</option>

                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* BRANCH */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">BRANCH</label>

              <select
                className="form-select"
                value={formData.branch_id}
                onChange={(e) => {
                  const branchId = e.target.value;

                  const selectedBranch = branches.find(
                    (b) => b.id === Number(branchId),
                  );

                  setFormData((prev) => ({
                    ...prev,
                    branch_id: branchId,
                    branch_name: selectedBranch
                      ? selectedBranch.branch_name
                      : "",
                  }));
                }}
                disabled={!formData.company_id}
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
        </div>
      </div>

      {/* LINE ITEMS HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold">LINE ITEMS LIST</h5>

        <button
          type="button"
          className="btn btn-primary btn-sm px-3"
          onClick={handleAddRow}
          disabled={!formData.supplier_name}
        >
          <FaPlus /> Add Item Row
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>PRODUCT SELECTION & VARIANTS</th>
                <th style={{ width: 100 }}>QUANTITY</th>
                <th style={{ width: 120 }}>MRP (₹)</th>
                <th style={{ width: 100 }}>GST (%)</th>
                <th style={{ width: 160 }}>TOTAL AMOUNT (₹)</th>
                <th style={{ width: 60 }}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {formData.items.length > 0 ? (
                formData.items.map((item, index) => {
                  const available =
                    getAvailableProductsForSpecificationRow(index);

                  // 2. Ensure the currently selected product is included in the dropdown options
                  const rowOptions =
                    item.product_name &&
                    !available.some((p) => p.product_name === item.product_name)
                      ? [
                          ...available,
                          {
                            product_name: item.product_name,
                            sku_code: item.sku,
                            color: item.color,
                            purchase_price: item.mrp,
                            gst_percentage: item.gst,
                          },
                        ]
                      : available;
                  return (
                    <tr key={index}>
                      {/* PRODUCT */}
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={item.product_name}
                          onChange={(e) => {
                            const selectedProduct = rowOptions.find(
                              (p) => p.product_name === e.target.value,
                            );

                            const items = [...formData.items];

                            const qty = items[index].qty || 1;
                            const price =
                              selectedProduct?.purchase_price ??
                              items[index].mrp ??
                              0;
                            const gst =
                              selectedProduct?.gst_percentage ??
                              items[index].gst ??
                              18;

                            const base = qty * price;

                            items[index] = {
                              ...items[index],
                              product_name: selectedProduct?.product_name || "",
                              sku:
                                selectedProduct?.sku_code ||
                                selectedProduct?.sku ||
                                "",
                              color: selectedProduct?.color || "",
                              height: selectedProduct?.height ?? null,
                              width: selectedProduct?.width ?? null,
                              length: selectedProduct?.length ?? null,
                              gender: selectedProduct?.gender ?? null,
                              mrp: price,
                              qty: qty,
                              gst: gst,
                              total_amount: base + (base * gst) / 100,
                            };

                            setFormData({ ...formData, items });
                          }}
                        >
                          <option value="">Select Product</option>
                          {rowOptions.map((p, pIndex) => (
                            <option key={p.id || pIndex} value={p.product_name}>
                              {p.product_name}
                            </option>
                          ))}
                        </select>

                        <small className="text-muted">
                          SKU: {item.sku || "N/A"} | COLOR:{" "}
                          {item.color || "N/A"}
                        </small>
                      </td>

                      {/* QTY */}
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          value={item.qty}
                          onChange={(e) =>
                            handleRowChange(index, "qty", e.target.value)
                          }
                        />
                      </td>

                      {/* MRP */}
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={item.mrp}
                          onChange={(e) =>
                            handleRowChange(index, "mrp", e.target.value)
                          }
                        />
                      </td>

                      {/* GST */}
                      <td>
                        <select
                          className="form-select form-select-sm"
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

                      {/* TOTAL */}
                      <td className="fw-bold">
                        ₹ {Number(item.total_amount || 0).toFixed(2)}
                      </td>

                      {/* DELETE */}
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveRow(index)}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Select supplier to start adding items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOTAL SECTION */}
      <div className="d-flex justify-content-end mb-4">
        <div className="card shadow-sm p-3" style={{ minWidth: 300 }}>
          <div className="d-flex justify-content-between">
            <span className="fw-semibold">GRAND INVOICE TOTAL:</span>
            <span className="fw-bold fs-5">
              ₹ {calculatedGrandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="text-start">
        <button
          className="btn btn-dark px-5 rounded-pill"
          onClick={handleSubmit}
        >
          Save Complete Entry
        </button>
      </div>
    </div>
  );
};

export default POForm;
