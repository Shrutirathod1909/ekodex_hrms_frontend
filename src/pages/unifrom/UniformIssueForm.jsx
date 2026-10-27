import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  FaTrash,
  FaSave,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const UniformIssueForm = ({ onClose }) => {

  // ================= HEADER =================
const [header, setHeader] = useState({
  issueDate: "",
  employeeName: "",
  employeeCode: "",
  transfer: "",
  attachment: null,
  remark: "",
 issueType: "",
  total: 0,
  received: "",
  balance: 0,
  emi: "",
  warehouse_id: "",
});
const isFreeIssue = header.issueType === "ISSUED FREE UNIFORM";
const total = Number(header.total || 0);
const received = Number(header.received || 0);

const isFullyPaid = total > 0 && received >= total;
const isEmiRequired = !isFreeIssue && !isFullyPaid;
  // ================= TABLE ROWS =================
  const [rows, setRows] = useState([
    {
      sr: 1,

      product_id: "",
      itemName: "",

      sku_code: "",
      color: "",
      hsn_code: "",

      qty: 1,

      unit: "",
      size: "",

      mrp: 0,
      rate: 0,
      amount: 0,
    },
  ]);

  // ================= MASTER STATES =================
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
const [warehouses, setWarehouses] = useState([]);
  // ================= SELECTED =================
  const [selectedClient, setSelectedClient] =
    useState("");

  const [selectedClientName, setSelectedClientName] =
    useState("");

  const [selectedSite, setSelectedSite] =
    useState("");

  const [selectedSiteName, setSelectedSiteName] =
    useState("");

  // ================= LOAD =================
  useEffect(() => {
    fetchCompanies();
    fetchProducts();
    fetchWarehouses();
  }, []);
useEffect(() => {

  const totalAmount = rows.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const received =
    Number(header.received || 0);

  const balance =
    totalAmount - received;

  setHeader((prev) => ({
    ...prev,
    total: totalAmount,
    balance: balance,
  }));

}, [rows, header.received]);
  // ================= COMPANY =================
  const fetchCompanies = async () => {
    try {

      const res = await axios.post(
        `${API_URL}/api/vouchers/getAllCompanies`
      );

      setCompanies(res.data.user || []);

    } catch (err) {

      console.log(err);
    }
  };

  // ================= PRODUCT =================
  const fetchProducts = async () => {
    try {

      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(res.data.data || []);

    } catch (err) {

      console.log(err);
    }
  };
// ================= WAREHOUSE =================
const fetchWarehouses = async () => {
  try {

    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API_URL}/api/warehouse`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("WAREHOUSE API:", res.data);

    setWarehouses(
      Array.isArray(res.data)
        ? res.data
        : res.data.data || []
    );

  } catch (err) {

    console.log(err);
  }
};
  // ================= BRANCH =================
  useEffect(() => {
    if (selectedClient) {
      fetchBranches(selectedClient);
    }
  }, [selectedClient]);

  const fetchBranches = async (
    client_id
  ) => {
    try {

      const res = await axios.post(
        `${API_URL}/api/vouchers/getAllBranches`,
        { client_id }
      );

      setBranches(res.data.user || []);

    } catch (err) {

      console.log(err);
    }
  };
  

  // ================= EMPLOYEE =================
  useEffect(() => {
    if (selectedClient && selectedSite) {

      fetchEmployees(
        selectedClient,
        selectedSite
      );
    }
  }, [selectedClient, selectedSite]);

  const fetchEmployees = async (
    client_id,
    site_id
  ) => {
    try {

      const res = await axios.post(
        `${API_URL}/api/vouchers/employees`,
        {
          client_id,
          site_id,
        }
      );

      setEmployees(res.data.data || []);

    } catch (err) {

      console.log(err);
    }
  };

  // ================= OPTIONS =================
  const companyOptions = companies.map(
    (c) => ({
      value: c.id,
      label: c.title,
    })
  );

  const branchOptions = branches.map(
    (b) => ({
      value: b.site_id,
      label: b.title,
    })
  );

  const employeeOptions = employees.map(
    (e) => ({
      value: e.id,
      label: e.emp_full_name,
      full: e,
    })
  );

  const productOptions = products
    .filter((p) => p.active === 0)
    .map((p) => ({
      value: p.id,
      label: `${p.product_name} (${p.sku_code || ""
        })`,
      full: p,
    }));

  const warehouseOptions = warehouses.map((w) => ({
  value: w.id,
  label: w.warehouse_name,
  full: w,
}));
  // ================= PRODUCT SELECT =================
  const handleProductSelect = (
    selected,
    index
  ) => {

    const updated = [...rows];

    const product = selected?.full;

    updated[index].product_id =
      product?.id || "";

    updated[index].itemName =
      product?.product_name || "";

    updated[index].sku_code =
      product?.sku_code || "";

    updated[index].color =
      product?.color || "";

    updated[index].hsn_code =
      product?.hsn_code || "";

    updated[index].unit =
      product?.uom || "";

    updated[index].size =
      `${product?.height || 0} X 
       ${product?.width || 0} X 
       ${product?.length || 0}`;

    updated[index].mrp =
      product?.purchase_price || 0;

    updated[index].rate =
      product?.sale_price || 0;

    updated[index].amount =
      Number(updated[index].qty || 0) *
      Number(updated[index].rate || 0);

    setRows(updated);
  };

  // ================= ROW CHANGE =================
  const handleRowChange = (
    index,
    field,
    value
  ) => {

    const updated = [...rows];

    updated[index][field] = value;

    if (
      field === "qty" ||
      field === "rate"
    ) {

      updated[index].amount =
        Number(updated[index].qty || 0) *
        Number(updated[index].rate || 0);
    }

    setRows(updated);
  };

  // ================= ADD ROW =================
  const addRow = () => {

    setRows([
      ...rows,
      {
        sr: rows.length + 1,

        product_id: "",
        itemName: "",

        sku_code: "",
        color: "",
        hsn_code: "",

        qty: 1,

        unit: "",
        size: "",

        mrp: 0,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  // ================= DELETE ROW =================
  const deleteRow = (index) => {

    const updated = rows.filter(
      (_, i) => i !== index
    );

    setRows(
      updated.map((row, idx) => ({
        ...row,
        sr: idx + 1,
      }))
    );
  };

  // ================= SAVE =================
const handleSave = async () => {
  try {
    if (!header.issueDate) {
      alert("Please Select Issue Date");
      return;
    }

    if (!header.employeeName) {
      alert("Please Select Employee");
      return;
    }

    if (!header.warehouse_id) {
      alert("Please Select Warehouse");
      return;
    }

    console.log("FINAL HEADER BEFORE SAVE:", header);

    const formData = new FormData();

    formData.append("issue_date", header.issueDate);
    formData.append("issue_type", header.issueType);
    formData.append("total_amount", header.total);
    formData.append("advance_amount", header.received);
    formData.append("emi_no", header.emi);

    formData.append("employee_name", header.employeeName);
    formData.append("employee_code", header.employeeCode);

    formData.append("transfer_by", header.transfer);

    // ✅ FIX HERE (IMPORTANT)
    formData.append(
      "warehouse_id",
      Number(header.warehouse_id)
    );

    formData.append("remarks", header.remark);

    formData.append("client_id", selectedClient);
    formData.append("client_name", selectedClientName);

    formData.append("site_id", selectedSite);
    formData.append("site_name", selectedSiteName);

    if (
      isEmiRequired &&
      (!header.emi || Number(header.emi) <= 0)
    ) {
      alert("Please enter EMI number");
      return;
    }

    if (header.attachment) {
      formData.append("attachment", header.attachment);
    }

    formData.append("items", JSON.stringify(rows));

    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API_URL}/api/uniform`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(res.data);

    alert("Uniform Saved Successfully");

    onClose();
  } catch (err) {
    console.log(err);

    alert(
      err.response?.data?.message || "Save Failed"
    );
  }
};

  // ================= STYLE =================
  const customSelectStyles = {

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    control: (base) => ({
      ...base,
      minHeight: "38px",
    }),
  };

  // ================= UI =================
  return (
    <div className="container-fluid bg-light min-vh-100 py-3">

      {/* HEADER */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body d-flex justify-content-between align-items-center">

          <h5 className="mb-0">
            Uniform Issue Form
          </h5>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            <FaTimes /> Close
          </button>

        </div>
      </div>

      {/* FORM */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">

          <div className="row g-3">

            {/* COMPANY */}
            <div className="col-md-3">
              <label className="form-label">
                Client
              </label>

              <Select
                options={companyOptions}
                placeholder="Select client"
                isSearchable
                styles={customSelectStyles}
                menuPortalTarget={document.body}
                onChange={(selected) => {

                  setSelectedClient(
                    selected?.value || ""
                  );

                  setSelectedClientName(
                    selected?.label || ""
                  );

                  setSelectedSite("");
                  setSelectedSiteName("");

                  setBranches([]);
                  setEmployees([]);
                }}
              />
            </div>

            {/* BRANCH */}
            <div className="col-md-3">
              <label className="form-label">
                Site
              </label>

              <Select
                options={branchOptions}
                placeholder="Select site"
                isSearchable
                styles={customSelectStyles}
                menuPortalTarget={document.body}
                value={branchOptions.find(
                  (b) =>
                    b.value === selectedSite
                )}
                onChange={(selected) => {

                  setSelectedSite(
                    selected?.value || ""
                  );

                  setSelectedSiteName(
                    selected?.label || ""
                  );
                }}
              />
            </div>

            {/* EMPLOYEE */}
            <div className="col-md-3">
              <label className="form-label">
                Employee
              </label>

              <Select
                options={employeeOptions}
                placeholder="Select Employee"
                isSearchable
                styles={customSelectStyles}
                menuPortalTarget={document.body}
                onChange={(selected) => {

                  const emp =
                    selected?.full;

                  setHeader((prev) => ({
                    ...prev,

                    employeeName:
                      emp?.emp_full_name || "",

                    employeeCode:
                      emp?.employee_code || "",
                  }));
                }}
              />
            </div>

            {/* EMP CODE */}
            <div className="col-md-3">
              <label className="form-label">
                Employee Code
              </label>

              <input
                type="text"
                className="form-control"
                value={header.employeeCode}
                readOnly
              />
            </div>

            {/* ISSUE DATE */}
            <div className="col-md-3">
              <label className="form-label">
                Issue Date
              </label>

              <input
                type="date"
                className="form-control"
                value={header.issueDate}
                onChange={(e) =>
                  setHeader((prev) => ({
                    ...prev,
                    issueDate:
                      e.target.value,
                  }))
                }
              />
            </div>
{/* ISSUE TYPE */}
<div className="col-md-3">
  <label className="form-label">
    Issue Type
  </label>

  <select
    className="form-select"
    value={header.issueType}
   onChange={(e) => {

  const value = e.target.value;

  setHeader((prev) => ({
    ...prev,

    issueType: value,

    received:
      value ===
      "ISSUED FREE UNIFORM"
        ? 0
        : prev.received,

    emi:
      value ===
      "ISSUED FREE UNIFORM"
        ? 0
        : prev.emi,

    balance:
      value ===
      "ISSUED FREE UNIFORM"
        ? 0
        : prev.balance,
  }));
}}
    
  >
    <option value="">
      Select Type
    </option>

    <option value="ISSUED TO NEW EMPLOYEE">
      Issued To New Employee
    </option>

    <option value="ISSUED FREE UNIFORM">
      Issued Free Uniform
    </option>

    <option value="ISSUED TO INDIVIDUAL ITEMS">
      Issued To Individual Items
    </option>
  </select>
</div>
            {/* TRANSFER */}
<div className="col-md-3">
  <label className="form-label">
    Warehouse
  </label>

  <Select
    options={warehouseOptions}
    placeholder="Select Warehouse"
    isSearchable
    styles={customSelectStyles}
    menuPortalTarget={document.body}
    menuPosition="fixed"

    value={
      warehouseOptions.find(
        (w) => w.value === header.warehouse_id
      ) || null
    }

    onChange={(selected) => {
      console.log("SELECTED WAREHOUSE:", selected);

      setHeader((prev) => ({
        ...prev,
        transfer: selected?.label || "",
        warehouse_id: selected?.value || null,
      }));
    }}
  />
</div>

            {/* FILE */}
            <div className="col-md-3">
              <label className="form-label">
                Attachment
              </label>

              <input
                type="file"
                className="form-control"
                onChange={(e) =>
                  setHeader((prev) => ({
                    ...prev,
                    attachment:
                      e.target.files[0],
                  }))
                }
              />
            </div>

            {/* REMARK */}
            <div className="col-md-3">
              <label className="form-label">
                Remark
              </label>

              <input
                type="text"
                className="form-control"
                value={header.remark}
                onChange={(e) =>
                  setHeader((prev) => ({
                    ...prev,
                    remark:
                      e.target.value,
                  }))
                }
              />
            </div>
 <div className="col-md-3">
  <label className="form-label">
    Total Amount
  </label>

<input
  type="number"
  className="form-control"
  value={header.total}
  readOnly
/>
</div>

{!isFreeIssue && (
  <div className="col-md-3">
    <label className="form-label">Received Amount</label>

    <input
      type="number"
      min="0"
      className="form-control"
      value={header.received}
      onChange={(e) =>
        setHeader((prev) => ({
          ...prev,
          received: e.target.value,
        }))
      }
    />
  </div>
)}
{!isFreeIssue && (
  <div className="col-md-3">
    <label className="form-label">Balance Amount</label>

    <input
      type="number"
      className="form-control"
      value={header.balance}
      readOnly
    />
  </div>
)}

{isEmiRequired && (
  <div className="col-md-3">
    <label className="form-label">No of EMI</label>

    <input
      type="number"
      min="0"
      className="form-control"
      value={header.emi}
      onChange={(e) =>
        setHeader((prev) => ({
          ...prev,
          emi: e.target.value,
        }))
      }
    />
  </div>
)}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex justify-content-between mb-3">

            <h6>Item Details</h6>

            <button
              className="btn btn-success btn-sm"
              onClick={addRow}
            >
              <FaPlus /> Add Row
            </button>

          </div>

          <div className="table-responsive">

            <table className="table table-bordered">

              <thead className="table-dark">
                <tr>

                  <th>SR</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Color</th>
                  <th>HSN</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Size</th>
                  <th>MRP</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Action</th>

                </tr>
              </thead>

              <tbody>

                {rows.map((row, i) => (

                  <tr key={i}>

                    <td>{row.sr}</td>

                    {/* PRODUCT */}
               {/* ITEM CODE DROPDOWN */}
{/* ITEM CODE DROPDOWN */}
<td style={{ width: "180px", minWidth: "180px" }}>

  <Select
    options={productOptions.map((p) => ({
      ...p,
      label: p.full?.sku_code || "No Code",
    }))}
    placeholder="Code"
    isSearchable
    styles={customSelectStyles}
    menuPortalTarget={document.body}
    menuPosition="fixed"
    value={productOptions
      .map((p) => ({
        ...p,
        label: p.full?.sku_code || "No Code",
      }))
      .find(
        (p) => p.value === row.product_id
      )}
    onChange={(selected) =>
      handleProductSelect(selected, i)
    }
  />
</td>

{/* ITEM NAME AUTO SHOW */}
<td style={{ minWidth: "200px" }}>

  <input
    type="text"
    className="form-control form-control-sm"
    value={row.itemName}
    readOnly
  />
</td>

                    {/* COLOR */}
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.color}
                        readOnly
                      />
                    </td>

                    {/* HSN */}
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.hsn_code}
                        readOnly
                      />
                    </td>

                    {/* QTY */}
        <td>
  <input
    type="number"
    min="1"
    className="form-control form-control-sm"
    value={row.qty}
    onChange={(e) => {

      const value = Number(e.target.value);

      if (value >= 1) {

        handleRowChange(
          i,
          "qty",
          value
        );
      }
    }}
  />
</td>
                    {/* UNIT */}
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.unit}
                        readOnly
                      />
                    </td>

                    {/* SIZE */}
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.size}
                        readOnly
                      />
                    </td>

                    {/* MRP */}
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={row.mrp}
                        readOnly
                      />
                    </td>

                    {/* RATE */}
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={row.rate}
                        onChange={(e) =>
                          handleRowChange(
                            i,
                            "rate",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    {/* AMOUNT */}
                    <td className="fw-bold text-primary">
                      {row.amount}
                    </td>

                    {/* DELETE */}
                    <td>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          deleteRow(i)
                        }
                      >
                        <FaTrash />
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="card shadow-sm border-0 mt-3">

        <div className="card-body d-flex justify-content-end gap-2">

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
          >
            <FaSave /> Save
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            <FaTimes /> Close
          </button>

        </div>
      </div>
    </div>
  );
};

export default UniformIssueForm;