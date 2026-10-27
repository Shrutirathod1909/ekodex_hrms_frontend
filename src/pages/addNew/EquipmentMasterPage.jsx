import React, { useEffect, useState } from "react";
import axios from "axios";

import FilterPanel from "../../utils/FilterPanel";
import { FaPen, FaPlus, FaSearch, FaTrashAlt } from "react-icons/fa";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Dropdown,
} from "react-bootstrap";

const API_URL = import.meta.env.VITE_API_URL;

const EquipmentTypeMasterPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [input, setInput] = useState({
    equipment_master: "",
    rate: "",
  });

  const [searchFields, setSearchFields] = useState([
    { field: "equipment_master", keyword: "" },
  ]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const searchOptions = [
    { value: "equipment_master", label: "Equipment Type" },
    { value: "rate", label: "Rate" },
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchEquipmentTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      let params = {};
      const validSearch = searchFields.filter((f) => f.field && f.keyword);
      if (validSearch.length > 0)
        params.searchFields = JSON.stringify(validSearch);
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }
     const res = await axios.get(`${API_URL}/api/equipment`, {
  params,
  ...getAuthHeaders(),
});

setEquipmentTypes(res.data.data || []);
      // console.log(data);
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setError(
          e.response?.data?.message || "Failed to fetch Equipment Types.",
        );
      }
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });

    const key = name;
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  const resetForm = () => {
    setInput({ equipment_master: "", rate: "" });
    setEditingId(null);
    setValidationErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

const handleEdit = (item) => {
  setEditingId(item);

  setInput({
    equipment_master: item.equipment_master || "",
    rate: item.rate || "",
  });

  setShowForm(true);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.equipment_master.trim()) {
      alert("Please fix the validation error.");
      setValidationErrors((prev) => ({
        ...prev,
        equipment_master: "Equipment Type is required",
      }));
      return;
    }

    if (input.rate && isNaN(input.rate)) {
      alert("Please fix the validation error.");
      setValidationErrors((prev) => ({
        ...prev,
        rate: "Rate must be a number",
      }));
      return;
    }

    try {
      if (editingId) {
       await axios.post(
  `${API_URL}/api/equipment/update/${editingId.id}`,
          {
            equipment_master: input.equipment_master,
            rate: input.rate,
          },
          getAuthHeaders(),
        );
        alert("Equipment Type updated successfully!");
      } else {
        await axios.post(
          `${API_URL}/api/equipment`,
          {
            equipment_master: input.equipment_master,
            rate: input.rate,
          },
          getAuthHeaders(),
        );
        alert("Equipment Type created successfully!");
      }
      setShowForm(false);
      resetForm();
      fetchEquipmentTypes();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else
        alert(error.response?.data?.message || "Failed to add equipment type.");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this equipment type?")
    ) {
      try {
     await axios.post(`${API_URL}/api/equipment/delete/${id}`, {}, {
  headers: { Authorization: `Bearer ${token}` },
});
        fetchEquipmentTypes();
      } catch (e) {
        if (e.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else
          alert(
            `Error: ${
              e.response?.data?.message || "Failed to delete equipment type."
            }`,
          );
      }
    }
  };

  const handleSearch = () => {
    fetchEquipmentTypes();
  };

  useEffect(() => {
    fetchEquipmentTypes();
  }, [searchFields, dateFilter]);

  const handleReset = () => {
   setSearchFields([{ field: "equipment_master", keyword: "" }]);
    setDateFilter({ from: "", to: "" });
    fetchEquipmentTypes();
  };

 const handleDownloadExcel = async () => {
  try {
    const params = {};

    // =========================
    // SEARCH FILTER
    // =========================
    const validSearch = searchFields.filter(
      (f) => f.field && f.keyword
    );

    if (validSearch.length > 0) {
      params.searchFields = JSON.stringify(validSearch);
    }

    // =========================
    // DATE FILTER
    // =========================
    if (dateFilter.from && dateFilter.to) {
      params.fromDate = dateFilter.from;
      params.toDate = dateFilter.to;
    }

    // =========================
    // API CALL
    // =========================
    const response = await axios.get(
      `${API_URL}/api/equipment/export`,
      {
        params,
        ...getAuthHeaders(),
      }
    );

    const data = response.data.data;

    if (!data || data.length === 0) {
      alert("No data found");
      return;
    }

    // =========================
    // CSV GENERATE
    // =========================
    const headers = Object.keys(data[0]);

    const csvRows = [
      headers.join(","),

      ...data.map((row) =>
        headers
          .map((field) => `"${row[field] ?? ""}"`)
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    const randomNumber = Math.floor(
      1000000000 + Math.random() * 9000000000
    );

    link.download = `EquipmentTypes_${randomNumber}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  } catch (error) {
    console.error("Download Error:", error);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    alert("Failed to download file");
  }
};

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          Equipment Type Master{" "}
          <span className="text-success">({equipmentTypes.length})</span>
        </h1>
        <div className="page-actions">
          <button
            className="search-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch /> {showSearch ? "Hide Search" : "Search"}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
              setShowSearch(false);
            }}
          >
            <FaPlus /> Add New
          </button>
        </div>
      </div>

      {showSearch && (
        <FilterPanel
          searchFields={searchFields}
          setSearchFields={setSearchFields}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onSearch={handleSearch}
          onReset={handleReset}
          onDownloadExcel={handleDownloadExcel}
          searchOptions={searchOptions}
        />
      )}

      {showForm && (
        <Card>
          <h2 className="card-header mb-4">
            {editingId ? (
              <span>Edit Equipment Type - {editingId.equipmentType}</span>
            ) : (
              "Add New Equipment Type"
            )}
          </h2>
          <Form className="equipmentType-form" onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="equipment_master">
                  <Form.Label className="equipmentType-label">
                    Equipment Type *
                  </Form.Label>
                  <Form.Control
                    className="equipmentType-input"
                    type="text"
                    value={input.equipment_master}
                    name="equipment_master"
                    onChange={handleInputChange}
                    placeholder="Equipment Type"
                    isInvalid={!!validationErrors.equipment_master}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.equipment_master}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group controlId="equipmentType">
                  <Form.Label className="equipmentType-rate">Rate</Form.Label>
                  <Form.Control
                    name="rate"
                    type="text"
                    value={input.rate}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.rate}
                    placeholder="Rate"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.rate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="form-actions d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingId ? "Update" : "Submit"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {!showForm && (
        <Card className="card table-card">
          {loading ? (
            <Alert variant="warning" className="mb-0 text-center">
              Loading...
            </Alert>
          ) : error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
            <Table hover responsive bordered>
              <thead className="table-secondary">
                <tr>
                  <th>Equipment Type</th>
                  <th>Rate</th>
                  <th>Created Detail</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipmentTypes.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={4}>No data found</td>
                  </tr>
                ) : (
                  equipmentTypes.map((et) => (
                    <tr key={et.id}>
                      <td>{et.equipment_master || ""}</td>
                      <td>{et.rate || ""}</td>
                      <td>
                        {/* {et.created_by || ''}
                        <br /> */}
                        {et.created_on}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="secondary"
                            size="sm"
                            className="border-0 shadow-none"
                          >
                            Action
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(et)}>
                              <FaPen className="me-2 text-primary" />
                              Edit
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() => handleDelete(et.id)}
                              className="text-danger"
                            >
                              <FaTrashAlt className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
};

export default EquipmentTypeMasterPage;
