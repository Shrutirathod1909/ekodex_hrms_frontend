import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SupplierForm from "./SupplierForm";
import SupplierList from "./SupplierList";

const Supplier = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);
  // ================= STATES =================
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [statusTab, setStatusTab] = useState("active");

  const [editId, setEditId] = useState(null);
  const [logo, setLogo] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);

  // 1. Modify the data displayed to the List component
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = suppliers.slice(indexOfFirstItem, indexOfLastItem);

  // 2. Logic to handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_person_name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    state: "",
    city: "",
    bank_name: "",
    account_no: "",
    account_type: "",
    swift_code: "",
    micr_no: "",
    ifsc_code: "",
  });
  // DOWNLOAD TEMPLATE
  const handleDownloadTemplate = () => {
    const template = [
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

    const worksheet = XLSX.utils.json_to_sheet(template);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(data, "Supplier_Template.xlsx");
  };

  // BULK UPLOAD
  // ================= FRONTEND =================

  const handleBulkUploadFile = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, {
          type: "array",
        });

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log("📦 Parsed Data:", data);

        const payload = {
          suppliers: data,
        };

        const res = await axios.post(
          `${API_URL}/api/suppliers/bulk-create`,
          payload,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",

              "Content-Type": "application/json",
            },
          },
        );

        console.log("✅ SUCCESS:", res.data);

        alert(res.data.message);

        fetchSuppliers();
      } catch (err) {
        console.log("❌ ERROR:", err);

        alert(err?.response?.data?.message || "Bulk Upload Failed");
      }
    };

    reader.onerror = () => {
      alert("File Read Failed");
    };

    reader.readAsArrayBuffer(file);
  };
  // ================= FETCH =================
  // ================= FETCH =================
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/suppliers?status=${statusTab}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      setSuppliers(response.data.data || []);
      setTotalCount(response.data.data.length || 0);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
  if (!token) {
    navigate("/login");
  }
}, [token, navigate]);

  useEffect(() => {
    fetchSuppliers();
  }, [statusTab]);

  // ================= CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateFormData = (data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };
  // ================= RESET =================
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

  // ================= EDIT =================

  const handleEdit = (item) => {
    // IMPORTANT
    setShowForm(true);

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

      logo_url: item.logo_url || "",
    });
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/suppliers/search?search=${searchTerm}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      setSuppliers(response.data.data || []);
      setTotalCount(response.data.data.length || 0);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= RESET =================
  const handleReset = () => {
    setSearchTerm("");
    fetchSuppliers();
  };

  // ================= SUBMIT =================
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();

      // 2. Append form fields safely
      Object.keys(formData).forEach((key) => {
        // Avoid appending undefined or null values if not required
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      if (logo) {
        data.append("supplierlogo", logo);
      }

      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      };

      const url = editId
        ? `${API_URL}/api/suppliers/update/${editId}`
        : `${API_URL}/api/suppliers/create`;

      // 3. Perform Request
      const response = await axios.post(url, data, config);

      // 4. Success feedback
      alert(response.data.message || "Supplier saved successfully!");

      // 5. Cleanup
      fetchSuppliers();
      resetForm();
    } catch (err) {
      // 6. Robust Error Handling
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      console.error("Submission Error:", err);
      alert(`Failed to save: ${errorMessage}`);
    } finally {
      // 7. Reset loading state regardless of success or failure
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!suppliers || suppliers.length === 0) {
      alert("No Data Found");
      return;
    }

    const exportData = suppliers.map((item, index) => ({
      ID: index + 1,
      Supplier: item.supplier_name,
      Contact: item.contact_person_name,
      Phone: item.phone,
      Email: item.email,
      Address: item.address,
      State: item.state,
      City: item.city,
      Pincode: item.pincode,
      "Bank Name": item.bank_name,
      "Account No": item.account_no,
      "Account Type": item.account_type,
      "IFSC Code": item.ifsc_code,
      "Swift Code": item.swift_code,
      "MICR No": item.micr_no,
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

    saveAs(data, "Suppliers.xlsx");
  };
  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete Supplier?")) return;

    try {
      await axios.post(
        `${API_URL}/api/suppliers/delete/${id}`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      alert("Supplier Deleted");

      fetchSuppliers();
    } catch (err) {
      console.log(err);
      alert("Delete Failed");
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    if (!window.confirm("Restore Supplier?")) return;

    try {
      await axios.post(
        `${API_URL}/api/suppliers/restore/${id}`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      alert("Supplier Restored");

      fetchSuppliers();
    } catch (err) {
      console.log(err);
      alert("Restored Failed");
    }
  };
  return (
    <div className="container-fluid">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".xlsx,.xls"
        onChange={handleBulkUploadFile}
      />
      {showForm ? (
        <SupplierForm
          editId={editId}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          resetForm={resetForm}
          setLogo={setLogo}
          updateFormData={updateFormData}
        />
      ) : (
        <SupplierList
          suppliers={currentSuppliers}
          totalCount={suppliers.length} // Use length of the full array
          currentPage={currentPage} // Pass this for active state
          itemsPerPage={itemsPerPage}
          onPageChange={paginate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          handleReset={handleReset}
          handleExport={handleExport}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleRestore={handleRestore}
          setShowForm={setShowForm}
          statusTab={statusTab}
          handleTabChange={setStatusTab}
          handleDownloadTemplate={handleDownloadTemplate}
          fileInputRef={fileInputRef}
        />
      )}
    </div>
  );
};

export default Supplier;
