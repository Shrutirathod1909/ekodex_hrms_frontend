import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { FaPlus, FaSearch, FaPen, FaTrashAlt } from "react-icons/fa";
import SearchPanel from "../../utils/FilterPanel";
import LoadingScreen from "../../components/loader/LoadingScreen";
import { useContext } from "react";
import { PermissionsContext } from "../../components/context/PermissionsContext";
import {
  Alert,
  Button,
  Card,
  Col,
  Dropdown,
  DropdownToggle,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import AuditTrail from "../../components/common/AuditTrail";

const Holiday = () => {
  const {
    permissions,
    userData,
    getPermissionsByModule,
    getPermissionsByModuleId,
    refetch,
  } = useContext(PermissionsContext);
  const holidaysPerms = getPermissionsByModule("Holidays");
  console.log("holidaysPerms", holidaysPerms);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeTypes, setEmployeeTypes] = useState([]); // Add state for employee types
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const isSuperAdmin =
    userData?.is_superadmin === true ||
    Number(userData?.id) === 1 ||
    String(userData?.role).trim().toUpperCase() === "SUPER ADMIN" ||
    String(userData?.role).trim().toUpperCase() === "SUPERADMIN";

  const initialFormData = {
    state: "",
    rank: "All",
    company_id: "",
    branch_id: "",
    holidays: [{ name: "", date: "" }],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [holidayFiles, setHolidayFiles] = useState({});
  const [imagePreview, setImagePreview] = useState({});

  const [searchFields, setSearchFields] = useState([
    { field: "company", keyword: "" },
  ]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

  const holidaySearchOptions = [
    { value: "company", label: "Company" },
  { value: "branch", label: "Branch" },
    { value: "state", label: "State" },
    { value: "rank", label: "Rank" },
  ];

  const API_URL = import.meta.env.VITE_API_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Fetch allotted companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/companies/allotted`,
          getAuthHeaders()
        );
        const compList = data.data || data || [];
        setCompanies(Array.isArray(compList) ? compList : []);
      } catch (err) {
        console.warn("Failed to fetch allotted companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch all accessible branches for table name display
  useEffect(() => {
    const fetchAllBranches = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/branches`,
          getAuthHeaders()
        );
        setAllBranches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Failed to fetch all branches:", err);
      }
    };
    fetchAllBranches();
  }, []);

  // Auto-select company if only 1 company is available
  useEffect(() => {
    if (companies.length === 1 && !isEditing && selectedCompanies.length === 0) {
      const single = {
        value: companies[0].id,
        label: companies[0].company_name || companies[0].name,
      };
      setSelectedCompanies([single]);
    }
  }, [companies, isEditing]);

  // Fetch branches when selectedCompanies changes
  useEffect(() => {
    if (!selectedCompanies || selectedCompanies.length === 0) {
      setBranches([]);
      setSelectedBranches([]);
      return;
    }

    const fetchBranches = async () => {
      try {
    
        
const compIds = selectedCompanies.map((c) => c.value).join(",");

const response = await axios.get(
  `${API_URL}/api/branches/by-company/0?company_id=${compIds}`,
  getAuthHeaders()
);

console.log("BRANCH API RESPONSE =>", response.data);

const branchData = response.data;
const branchList = Array.isArray(branchData)
  ? branchData
  : Array.isArray(branchData?.data)
    ? branchData.data
    : [];

console.log("BRANCH LIST =>", branchList);

let filtered = branchList;

if (!isSuperAdmin && userData?.branch_id) {
  const userBranchIds = String(userData.branch_id)
    .split(",")
    .map((s) => s.trim());

  filtered = branchList.filter((b) =>
    userBranchIds.includes(String(b.id))
  );
}

setBranches(filtered);


        setSelectedBranches((prev) => {
          const valid = prev.filter((sb) =>
            filtered.some((b) => String(b.id) === String(sb.value))
          );
          if (filtered.length === 1 && valid.length === 0) {
            return [
              {
                value: filtered[0].id,
                label: filtered[0].branch_name,
              },
            ];
          }
          return valid;
        });
      } catch (err) {
        console.warn("Failed to fetch branches for selected companies:", err);
        setBranches([]);
      }
    };

    fetchBranches();
  }, [selectedCompanies, userData]);

  // Fetch employee types for rank dropdown
// Fetch employee types for rank dropdown
useEffect(() => {
  const fetchEmployeeTypes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/employee-types`,
        getAuthHeaders()
      );

      console.log("EMPLOYEE TYPES API DATA =>", response.data);

      // API response:
      // {
      //   success: true,
      //   data: [...]
      // }

      const employeeTypeList = response.data?.data || [];

      setEmployeeTypes(
        Array.isArray(employeeTypeList) ? employeeTypeList : []
      );
    } catch (err) {
      console.error("Failed to fetch employee types:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setEmployeeTypes([]);
    }
  };

  fetchEmployeeTypes();
}, [API_URL]);

const fetchHolidays = async () => {
  setLoading(true);
  setError(null);

  try {
    const params = {};

    const validSearch = searchFields.filter(
      (f) => f.field && f.keyword
    );

    if (validSearch.length > 0) {
      params.searchFields = JSON.stringify(validSearch);
    }

    if (dateFilter.from && dateFilter.to) {
      params.fromDate = dateFilter.from;
      params.toDate = dateFilter.to;
    }

    const res = await axios.get(`${API_URL}/api/holidays`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("HOLIDAYS API RESPONSE:", res.data);

    const fetchedData = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    const loggedInUserId = Number(userData?.id);

    const visibleHolidays = fetchedData.filter((holiday) => {
      const isSuperAdminDeleted =
        Number(holiday?.superadmin_status) === 1;

      // Super Admin can see all holidays
      if (loggedInUserId === 1) {
        return true;
      }

      // Hide Super Admin deleted holidays from other users
      return !isSuperAdminDeleted;
    });

    const sortedHolidays = visibleHolidays.sort(
      (a, b) => Number(b.id) - Number(a.id)
    );

    setHolidays(sortedHolidays);
  } catch (err) {
    console.error("FETCH HOLIDAYS ERROR:", err);

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      setError("Failed to load holidays.");
      setHolidays([]);
    }
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (!showForm) {
      fetchHolidays();
    }
  }, [showForm]);

  useEffect(() => {
    fetchHolidays();
  }, [searchFields, dateFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [e.target.name]: e.target.value });
    const key = name; // for company details, usually just the field name
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };
  const handleHolidayRowChange = (index, field, value) => {
    const updated = [...formData.holidays];
    updated[index][field] = value;
    setFormData({ ...formData, holidays: updated });

    const key = `holiday${
      field.charAt(0).toUpperCase() + field.slice(1)
    }_${index}`;
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };
  const handleFileChange = (index, file) => {
    setHolidayFiles((prev) => ({ ...prev, [index]: file }));

    // Create preview
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview((prev) => ({ ...prev, [index]: previewUrl }));
    } else {
      setImagePreview((prev) => {
        const newPreview = { ...prev };
        delete newPreview[index];
        return newPreview;
      });
    }
  };

  const addHolidayRow = () =>
    setFormData({
      ...formData,
      holidays: [...formData.holidays, { name: "", date: "" }],
    });

  const removeHolidayRow = (index) => {
    const updatedHolidays = formData.holidays.filter((_, i) => i !== index);
    setFormData({ ...formData, holidays: updatedHolidays });

    // Rebuild files and previews with corrected indices
    const newFiles = {};
    const newPreviews = {};

    updatedHolidays.forEach((_, i) => {
      if (holidayFiles[i >= index ? i + 1 : i]) {
        newFiles[i] = holidayFiles[i >= index ? i + 1 : i];
      }
      if (imagePreview[i >= index ? i + 1 : i]) {
        newPreviews[i] = imagePreview[i >= index ? i + 1 : i];
      }
    });

    setHolidayFiles(newFiles);
    setImagePreview(newPreviews);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setHolidayFiles({});
    setIsEditing(null);
    setValidationErrors({});
    setShowForm(false);
    setImagePreview({});
    if (companies.length === 1) {
      setSelectedCompanies([
        {
          value: companies[0].id,
          label: companies[0].company_name || companies[0].name,
        },
      ]);
    } else {
      setSelectedCompanies([]);
    }
    setSelectedBranches([]);
  };

  const validateForm = () => {
    const errors = {};
    if (companies.length > 0 && selectedCompanies.length === 0) {
      errors.company = "Company is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State Name is required";
    }

    formData.holidays.forEach((h, index) => {
      if (!h.name.trim())
        errors[`holidayName_${index}`] = "Holiday name is required";
      if (!h.date) errors[`holidayDate_${index}`] = "Holiday date is required";
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    const payload = new FormData();
    payload.append("state", formData.state);
    payload.append("rank", formData.rank);
    const companyIdStr = selectedCompanies.map((c) => c.value).join(",");
    const branchIdStr = selectedBranches.map((b) => b.value).join(",");
    payload.append("company_id", companyIdStr);
    payload.append("branch_id", branchIdStr);

    payload.append("holidaysData", JSON.stringify(formData.holidays));

    Object.keys(holidayFiles).forEach((index) => {
      payload.append(`holiday_image_${index}`, holidayFiles[index]);
    });

    try {
      const config = {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
        },
      };
      if (isEditing) {
        await axios.put(
          `${API_URL}/api/holidays/${isEditing.id}`,
          payload,
          config,
        );
        alert("Holiday updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/holidays`, payload, config);
        alert("Holiday created successfully!");
      }
      resetForm();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else
        alert(
          `Operation failed: ${err.response?.data?.message || "Server error"}`,
        );
    }
  };

  const handleEdit = async (holiday) => {
    setIsEditing(holiday);

    setValidationErrors({});

    let initialSelectedComp = [];
    if (holiday.company_id) {
      const compIds = String(holiday.company_id)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      initialSelectedComp = compIds.map((id) => {
        const found = companies.find((c) => String(c.id) === String(id));
        return found
          ? { value: found.id, label: found.company_name || found.name }
          : { value: id, label: `Company ${id}` };
      });
    } else if (companies.length === 1) {
      initialSelectedComp = [
        {
          value: companies[0].id,
          label: companies[0].company_name || companies[0].name,
        },
      ];
    }
    setSelectedCompanies(initialSelectedComp);

    if (initialSelectedComp.length > 0) {
      try {
        const compIds = initialSelectedComp.map((c) => c.value).join(",");
        const { data } = await axios.get(
          `${API_URL}/api/branches/by-company/0?company_id=${compIds}`,
          getAuthHeaders()
        );
        const branchList = Array.isArray(data) ? data : [];
        setBranches(branchList);

        if (holiday.branch_id) {
          const bIds = String(holiday.branch_id)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const selB = bIds.map((id) => {
            const found = branchList.find((b) => String(b.id) === String(id));
            return found
              ? { value: found.id, label: found.branch_name }
              : { value: id, label: `Branch ${id}` };
          });
          setSelectedBranches(selB);
        } else {
          setSelectedBranches([]);
        }
      } catch (e) {
        console.error("Failed to load branches on edit:", e);
      }
    } else {
      setSelectedBranches([]);
    }

    setFormData({
      state: holiday.state || "",
      rank: holiday.rank || "All",
      company_id: holiday.company_id || "",
      branch_id: holiday.branch_id || "",
      holidays: (holiday.holidays || []).map((h) => ({
        id: h.id,
        name: h.name || h.holiday_name || "",
        date: h.date || h.holiday_date || "",
        image: h.image || "",
      })),
    });

    const previews = {};

    (holiday.holidays || []).forEach((h, index) => {
      if (h.image) {
        previews[index] = h.image;
      }
    });

    setImagePreview(previews);

    setHolidayFiles({});

    setShowForm(true);

    setShowSearch(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        await axios.delete(`${API_URL}/api/holidays/${id}`, getAuthHeaders());
        alert("Holiday deleted!");
        fetchHolidays();
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else alert("Delete failed!");
      }
    }
  };

  const handleSearch = () => fetchHolidays();
  const handleReset = () => {
    setSearchFields([{ field: "state", keyword: "" }]);
    setDateFilter({ from: "", to: "" });
    setTimeout(() => fetchHolidays(), 0);
  };

  const handleDownloadExcel = async () => {
    try {
      const params = {};
      const validSearch = searchFields.filter((f) => f.field && f.keyword);
      if (validSearch.length > 0)
        params.searchFields = JSON.stringify(validSearch);

      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

      const response = await axios.get(`${API_URL}/api/holidays/export`, {
        params,
        responseType: "blob", // IMPORTANT
        ...getAuthHeaders(),
      });

      // Create Excel File
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Holidays_${randomNumber}.xlsx`;
      link.click();
    } catch (error) {
      // Axios sends 401 here
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      console.error("Excel download error:", error);
      alert("Failed to download Excel. Please try again.");
    }
  };

  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.company_name || c.name || c.companyName,
  }));

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: b.branch_name || b.name,
  }));

  const formatCompanyNames = (companyIdStr) => {
    if (!companyIdStr) return "All";
    const ids = String(companyIdStr).split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return "All";
    return ids
      .map((id) => {
        const found = companies.find((c) => String(c.id) === String(id));
        return found ? (found.company_name || found.name) : id;
      })
      .join(", ");
  };

  const formatBranchNames = (branchIdStr) => {
    if (!branchIdStr) return "All";
    const ids = String(branchIdStr).split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return "All";
    return ids
      .map((id) => {
        const found = allBranches.find((b) => String(b.id) === String(id));
        return found ? found.branch_name : id;
      })
      .join(", ");
  };

  const uniqueRanks = [
    ...new Set(
      holidays.map((h) => h.rank).filter((rank) => rank && rank !== "All"),
    ),
  ];

  if (holidaysPerms.length <= 0) {
    refetch();
    return <LoadingScreen />;
  }
  return (
    <div
      className="page-container"
      style={{
        fontSize: "13px",
      }}
    >
      <div className="page-header">
        <h1 className="page-title">
          Holiday Master{" "}
          <span className="text-success">({holidays.length})</span>
        </h1>
        <div className="page-actions">
          <button
            className="search-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch /> {showSearch ? "Hide Search" : "Search"}
          </button>
          {holidaysPerms?.add_access === 1 && (
            <button
              className="btn-primary"
              onClick={() => {
                setShowSearch(false);
                resetForm();
                if (companies.length === 1) {
                  setSelectedCompanies([
                    {
                      value: companies[0].id,
                      label: companies[0].company_name || companies[0].name,
                    },
                  ]);
                }
                setShowForm(true);
              }}
            >
              <FaPlus /> Add New Holiday
            </button>
          )}
        </div>
      </div>

      {showSearch && (
        <SearchPanel
          searchFields={searchFields}
          setSearchFields={setSearchFields}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onSearch={handleSearch}
          onReset={handleReset}
          onDownloadExcel={handleDownloadExcel}
          searchOptions={holidaySearchOptions}
        />
      )}

      {showForm && (
        <Card className="card form-panel">
          <h2 className="card-header mb-4">
            {isEditing ? (
              <span>Edit Holiday - {isEditing.state}</span>
            ) : (
              "Add New Holiday"
            )}
          </h2>
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="danger">
              Please fix the validation errors below.
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row className="form-grid">
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="company">
                  <Form.Label>Company *</Form.Label>
                  <Select
                    isMulti
                    options={companyOptions}
                    value={selectedCompanies}
                    onChange={(selected) => {
                      setSelectedCompanies(selected || []);
                      if (validationErrors.company) {
                        setValidationErrors((prev) => ({ ...prev, company: "" }));
                      }
                    }}
                    placeholder="Select Company"
                    className={validationErrors.company ? "is-invalid" : ""}
                    classNamePrefix="company-select"
                  />
                  {validationErrors.company && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.company}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="branch">
                  <Form.Label>Branch</Form.Label>
                  <Select
                    isMulti
                    options={branchOptions}
                    value={selectedBranches}
                    onChange={(selected) => setSelectedBranches(selected || [])}
                    placeholder="Select Branch (All if empty)"
                    isDisabled={selectedCompanies.length === 0}
                    classNamePrefix="branch-select"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="state">
                  <Form.Label>State Name *</Form.Label>
                  <Form.Control
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State Name"
                    isInvalid={!!validationErrors.state}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.state}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="rank">
                  <Form.Label>Rank</Form.Label>
                  <Form.Select
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                  >
                    <option value="All">All Ranks</option>

                    {employeeTypes.map((emp, index) => (
                      <option key={emp.id || index} value={emp.emp_type}>
                        {emp.emp_type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div>
              <h5 className="card-subtitle mt-3 mb-4">Holiday Details</h5>
              {formData.holidays.map((h, index) => (
                <Row key={index} className="mb-3">
                  <Col xs={12} sm={6} md={4} className="mb-3">
                    <Form.Group controlId="name">
                      <Form.Label>Holiday Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={h.name}
                        placeholder="Holiday Name"
                        onChange={(e) =>
                          handleHolidayRowChange(index, "name", e.target.value)
                        }
                        isInvalid={!!validationErrors[`holidayName_${index}`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors[`holidayName_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Group controlId="date">
                      <Form.Label>Holiday Date *</Form.Label>
                      <Form.Control
                        type="date"
                        value={h.date}
                        onChange={(e) =>
                          handleHolidayRowChange(index, "date", e.target.value)
                        }
                        isInvalid={!!validationErrors[`holidayDate_${index}`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors[`holidayDate_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={4} className="mb-3">
                    <Form.Group controlId={`holidayFile${index}`}>
                      <Form.Label>Attach Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        name={`holidayFile${index}`}
                        onChange={(e) =>
                          handleFileChange(index, e.target.files[0])
                        }
                      />
                    </Form.Group>
                    {imagePreview[index] && (
                      <div className="text-center image-preview mt-2">
                        <img
                          src={imagePreview[index]}
                          alt={`Preview ${index}`}
                          style={{
                            width: "180px",
                            height: "200px",
                            // objectFit: "cover",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    )}
                  </Col>
                  <Col className="mb-3" md="auto">
                    <div
                      className="holiday-row-actions"
                      style={{ paddingTop: "32px" }}
                    >
                      {formData.holidays.length > 1 && (
                        <Button
                          type="button"
                          className="me-2"
                          variant="danger"
                          onClick={() => removeHolidayRow(index)}
                        >
                          Remove
                        </Button>
                      )}
                      {index === formData.holidays.length - 1 && (
                        <Button
                          type="button"
                          onClick={addHolidayRow}
                          variant="primary"
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              ))}
            </div>

            <div className="form-actions d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? "Update Holiday" : "Save Holiday"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {!showForm && (
        <Card>
          {loading ? (
            // <Alert variant="warning" className="mb-0 text-center">
            //   Loading...
            // </Alert>
            <LoadingScreen />
          ) : error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
          <div className="holiday-table-wrapper">
  <Table hover bordered className="cool-table mb-0">
              <thead className="table-secondary">
                <tr>
                  <th>Company</th>
                  <th>Branch</th>
                  <th>State</th>
                  <th>Rank</th>
                  <th>Holidays Count</th>
                  <th>Tracking Details</th>
                 <th
  style={{
    minWidth: "110px",
    width: "110px",
    textAlign: "center",
    whiteSpace: "nowrap",
  }}
>
  Actions
</th>
                </tr>
              </thead>
              <tbody>
                {holidays.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={7}>No data found</td>
                  </tr>
                ) : (
                  holidays.map((h) => (
                    <tr key={h.id}>
                      <td>{formatCompanyNames(h.company_id)}</td>
                      <td>{formatBranchNames(h.branch_id)}</td>
                      <td className="state-cell">{h.state}</td>
                      <td>{h.rank}</td>
                      <td>{h.holidays?.length || 0}</td>
                        {/* TRACKING */}
                        <td>
                          <AuditTrail 
                            createdOn={h.created_on}
                            createdByName={h.created_by_name}
                            modifiedOn={h.modified_on}
                            modifiedByName={h.modified_by_name}
                            disabledOn={h.disabled_on}
                            disabledByName={h.disabled_by_name}
                            isActive={true}
                          />
                        </td>
                 <td
  style={{
    minWidth: "110px",
    width: "110px",
    textAlign: "center",
    whiteSpace: "nowrap",
    position: "relative",
  }}
>
  <Dropdown align="end">
    <Dropdown.Toggle
      variant="secondary"
      size="sm"
      className="border-0 shadow-none"
    >
      Action
    </Dropdown.Toggle>

    <Dropdown.Menu
      align="end"
      style={{
        minWidth: "220px",
        zIndex: 9999,
      }}
    >
      {h.holidays?.map(
        (hol, idx) =>
          hol.image && (
            <Dropdown.Item
              key={`img-${idx}`}
              href={hol.image}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              View {hol.holiday_name} Attachment
            </Dropdown.Item>
          ),
      )}
{holidaysPerms?.edit_access === 1 &&
  !(
    Number(h.created_by) === 1 &&
    Number(h.modified_by) === 1
  ) && (
    <Dropdown.Item onClick={() => handleEdit(h)}>
      <FaPen className="me-2 text-primary" />
      Edit
    </Dropdown.Item>
  )}

{holidaysPerms?.delete_access === 1 &&
  !(
    Number(h.created_by) === 1 &&
    Number(h.modified_by) === 1
  ) && (
    <Dropdown.Item
      onClick={() => handleDelete(h.id)}
      className="text-danger"
    >
      <FaTrashAlt className="me-2" />
      Delete
    </Dropdown.Item>
  )}
    </Dropdown.Menu>
  </Dropdown>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Holiday;
