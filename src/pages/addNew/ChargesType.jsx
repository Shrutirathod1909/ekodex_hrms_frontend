import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Collapse,
  Form,
  Table,
  Dropdown,
  Alert,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import Select from "react-select";
import {
  FaPlus,
  FaMinus,
  FaSearch,
  FaFileExport,
  FaRedo,
  FaPen,
  FaTrashAlt,
} from "react-icons/fa";
import api from "../../api/axios"; // Adjust to your actual axios/api import path
import LoadingScreen from "../../components/loader/LoadingScreen";
import AuditTrail from "../../components/common/AuditTrail";

function ChargesType() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState([{ field: null, keyword: "" }]);
  const [resetKey, setResetKey] = useState(0);
  const [dateFilter, setDateFilter] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fieldOptions = [
    {
      value: "charges_master",
      label: "Charge Name",
    },
    {
      value: "label_display",
      label: "Label Display",
    },
  ];
const formatApiDate = (dateString) => {
  if (!dateString) return null;

  // Example:
  // "2026-09-01 9:51 34"
  // Convert to:
  // "2026-09-01 09:51:34"

  const match = dateString.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{1,2})\s+(\d{1,2})$/,
  );

  if (match) {
    const [, date, hour, minute, second] = match;

    return `${date} ${String(hour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  }

  return dateString;
};
  const handleFilterChange = (index, key, value) => {
    const updated = [...filters];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setFilters(updated);
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        field: null,
        keyword: "",
      },
    ]);
  };

  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);

    setFilters(updated.length ? updated : [{ field: null, keyword: "" }]);
  };
  // 1. Fetch Function
  const fetchCharges = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const activeFilters = filters.filter(
        (item) => item.field && item.keyword.trim() !== "",
      );

      const response = await api.get("/api/charges", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          searchFields: JSON.stringify(activeFilters),
          dateField: dateFilter,
          fromDate,
          toDate,
        },
      });

      const fetchedData = response.data.data || [];
      setData(fetchedData.sort((a, b) => parseInt(b.id) - parseInt(a.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEdit(false);

    setShowForm(false);

    setFormData({
      id: null,
      charges_master: "",
      label_display: "",
    });
  };

  const resetFilters = async () => {
    const resetFilter = [{ field: null, keyword: "" }];
    setResetKey((prev) => prev + 1);
    setFilters(resetFilter);
    setDateFilter(null);
    setFromDate("");
    setToDate("");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/api/charges", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          searchFields: JSON.stringify([]),
          fromDate: "",
          toDate: "",
          dateField: null,
        },
      });

      const fetchedData = response.data.data || [];
      setData(fetchedData.sort((a, b) => parseInt(b.id) - parseInt(a.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const [formData, setFormData] = useState({
    id: null,
    charges_master: "",
    label_display: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (isEdit) {
        await api.put(`/api/charges/${formData.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Updated Successfully");
      } else {
        await api.post("/api/charges", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Created Successfully");
      }

      resetForm();

      fetchCharges();
    } catch (err) {
      console.error(err);
    }
  };

  const [isEdit, setIsEdit] = useState(false);

  const handleEdit = (item) => {
    setIsEdit(true);

    setShowForm(true);

    setFormData({
      id: item.id,
      charges_master: item.charges_master,
      label_display: item.label_display,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this charge?")) {
      return;
    }

    try {
      console.log("deleteCharge", id);
      const chargeTypeId = id?.id || id;
      const token = localStorage.getItem("token");

      const response = await api.delete(`/api/charges/${chargeTypeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData((prev) => prev.filter((item) => item.id !== id));

      alert(response.data.message || "Charge deleted successfully.");
      fetchCharges();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to delete charge.");
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      alert("No records available to export.");
      return;
    }

    const exportData = data.map((item, index) => ({
      "Sr No": index + 1,
      "Charge Name": item.charges_master || "",
      "Label Display": item.label_display || "",
      "Created By": item.created_by_name || "-",
        "Created Date": item.created_on
          ? (() => {
              const d = new Date(item.created_on);
              if(isNaN(d)) return item.created_on;
              const pad = (n) => String(n).padStart(2, "0");
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            })()
          : "",
    }));

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Convert worksheet to CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // Create Blob
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    // Download CSV
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Charges_Master_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid p-0" style={{ fontSize: "13px" }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="page-title m-0">
          CHARGES MASTER <span className="text-success">({data.length})</span>
        </h4>
        <div>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaSearch /> {showFilters ? "Hide Search" : "Search"}
          </Button>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              "Hide Form"
            ) : (
              <>
                <FaPlus /> Add New
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Collapse in={showFilters}>
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={7}>
                {filters.map((filter, index) => (
                  <Row key={index} className="g-2 mb-2 align-items-center">
                    <Col md={5}>
                      <Select
                        key={resetKey}
                        value={fieldOptions.find(
                          (x) => x.value === filter.field,
                        )}
                        options={fieldOptions}
                        onChange={(selected) =>
                          handleFilterChange(
                            index,
                            "field",
                            selected?.value || null,
                          )
                        }
                        isClearable
                      />
                    </Col>
                    <Col md={5}>
                      <Form.Control
                        size="sm"
                        placeholder="Enter keyword..."
                        value={filter.keyword}
                        onChange={(e) =>
                          handleFilterChange(index, "keyword", e.target.value)
                        }
                      />
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={addFilter}
                      >
                        <FaPlus />
                      </Button>
                      {filters.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-1"
                          onClick={() => removeFilter(index)}
                        >
                          <FaMinus />
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
              </Col>
              <Col md={5} className="border-start ps-3">
                <Row className="g-2">
                  <Col md={12}>
                    <Form.Label className="small fw-bold">
                      Date filter on
                    </Form.Label>
                    <Select
                      key={`date-${resetKey}`}
                      value={[
                        {
                          value: "created_on",
                          label: "Created Date",
                        },
                        {
                          value: "modified_on",
                          label: "Modified Date",
                        },
                      ].find((x) => x.value === dateFilter)}
                      onChange={(selected) =>
                        setDateFilter(selected?.value || null)
                      }
                      options={[
                        {
                          value: "created_on",
                          label: "Created Date",
                        },
                        {
                          value: "modified_on",
                          label: "Modified Date",
                        },
                      ]}
                      isClearable
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small fw-bold">From Date</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small fw-bold">To Date</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </Col>
                </Row>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-fill"
                    onClick={fetchCharges}
                  >
                    <FaSearch className="me-1" /> Search
                  </Button>
                  <Button variant="danger" size="sm" onClick={resetFilters}>
                    <FaRedo className="me-1" />
                    Reset
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-fill"
                    onClick={handleExport}
                  >
                    <FaFileExport className="me-1" />
                    Export
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Collapse>

      {/* Add New Form (Collapsible) */}
      <div
        className={`overflow-hidden transition-all ${showForm ? "mb-3" : ""}`}
        style={{ maxHeight: showForm ? "200px" : "0", transition: "all 0.3s" }}
      >
        <Card className="p-3">
          <h5>{isEdit ? "Edit Charge" : "Add New Charge"}</h5>
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Label>Charge Name</Form.Label>
                <Form.Control
                  name="charges_master"
                  value={formData.charges_master}
                  onChange={handleInputChange}
                  placeholder="Enter Charge Name"
                />
              </Col>
              <Col md={4}>
                <Form.Label>Label Display</Form.Label>

                <Form.Control
                  name="label_display"
                  value={formData.label_display}
                  onChange={handleInputChange}
                  placeholder="Enter Label Display"
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant={isEdit ? "warning" : "primary"}>
                  {isEdit ? "Update" : "Submit"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingScreen />
          ) : (
            <Table hover responsive bordered className="mb-0">
              <thead className="table-secondary">
                <tr>
                  <th>#</th>
                  <th>CHARGE NAME</th>
                  <th>Label to display</th>
                  <th>Tracking Details</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td> {/* Index Row */}
                      <td>{item.charges_master}</td>
                      <td>{item.label_display}</td>
                      {/* TRACKING */}
                      <td>
                      <AuditTrail
  createdOn={formatApiDate(item.created_on)}
  createdByName={item.created_by_name}
  modifiedOn={formatApiDate(item.modified_on)}
  modifiedByName={item.modified_by_name}
  disabledOn={formatApiDate(item.disabled_on)}
  disabledByName={item.disabled_by_name}
  isActive={item.active === "0" || item.active === 0}
/>
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
                            <Dropdown.Item onClick={() => handleEdit(item)}>
                              <FaPen className="text-primary me-2" /> Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="text-danger"
                              onClick={() => handleDelete(item)}
                            >
                              <FaTrashAlt className="me-2" /> Delete
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
        </Card.Body>
      </Card>
    </div>
  );
}

export default ChargesType;
