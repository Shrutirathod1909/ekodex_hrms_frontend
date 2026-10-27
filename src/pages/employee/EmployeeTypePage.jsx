
  import React, { useCallback,useEffect, useState } from "react";
  import api from "../../api/axios";
  import LoadingScreen from "../../components/loader/LoadingScreen";
  import FilterPanel from "../../utils/FilterPanel";
  import { FaPen, FaSearch, FaTrashAlt } from "react-icons/fa";
  import { useContext } from "react";
  import { PermissionsContext } from "../../components/context/PermissionsContext";
  import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    Row,
    Table,
    Dropdown,
    Pagination,
  } from "react-bootstrap";
  import AuditTrail from "../../components/common/AuditTrail";

  const API_URL = import.meta.env.VITE_API_URL;

  export default function EmployeeTypePage() {
    const { permissions, getPermissionsByModule, getPermissionsByModuleId } =
      useContext(PermissionsContext);
    const employeeTypePerms = getPermissionsByModule("Employee Type");
    console.log("employeeTypePerms", employeeTypePerms, permissions);
    const token = localStorage.getItem("token");
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false); // Add this
    const [input, setInput] = useState("");
    const [leaveEligibilityDays, setLeaveEligibilityDays] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editInput, setEditInput] = useState("");
    const [editLeaveEligibilityDays, setEditLeaveEligibilityDays] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
const handleCompanyChange = async (e) => {
  const companyId = e.target.value;

  setSelectedCompany(companyId);
  setSelectedBranch("");
  setBranches([]);

  if (companyId) {
    await fetchBranches(companyId);
  }
};
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const loginUser = JSON.parse(
    localStorage.getItem("loginUser") ||
    localStorage.getItem("user") ||
    "{}"
  );

  const isSuperAdmin =
    loginUser.is_superadmin === true ||
    String(loginUser.role || "").trim().toUpperCase() === "SUPER ADMIN";
    const [searchFields, setSearchFields] = useState([
      { field: "emp_type", keyword: "" },
    ]);
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
const searchOptions = [
  { value: "emp_type", label: "Employee Type" },
];

    const getAuthHeaders = () => {
      const token = localStorage.getItem("token");
      if (!token) return {};
      return { headers: { Authorization: `Bearer ${token}` } };
    };
  const fetchTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      // Search fields: Employee Type, Company, Branch
      const validSearch = searchFields.filter(
        (f) =>
          f.field &&
          String(f.keyword || "").trim() !== ""
      );

      if (validSearch.length > 0) {
        params.searchFields = JSON.stringify(validSearch);
      }

      // Date filter
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      const { data } = await api.get(
        `${API_URL}/api/employee-types`,
        {
          params,
          ...getAuthHeaders(),
        }
      );

      console.log("Employee Type API Response:", data);

      setEmployeeTypes(
        Array.isArray(data?.data) ? data.data : []
      );

      setCurrentPage(1);
    } catch (e) {
      console.error(
        "FETCH EMPLOYEE TYPES ERROR:",
        e.response?.data || e
      );

      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setError(
          e.response?.data?.message ||
            "Failed to fetch Employee types."
        );

        setEmployeeTypes([]);
      }
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      fetchTypes();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      alert("Please enter Employee Type.");
      return;
    }

    const leaveDays = Number(leaveEligibilityDays);

    if (!Number.isInteger(leaveDays) || leaveDays <= 0) {
      alert("Please enter valid Leave Eligibility Days.");
      return;
    }

    // SUPER ADMIN साठी Company आणि Branch आवश्यक
    if (isSuperAdmin && (!selectedCompany || !selectedBranch)) {
      alert("Please select Company and Branch.");
      return;
    }

    const payload = {
      emp_type: input.trim(),
      leave_eligibility_days: leaveDays,
    };

    // Company आणि Branch IDs फक्त SUPER ADMIN साठी
    if (isSuperAdmin) {
      payload.company_id = Number(selectedCompany);
      payload.branch_id = Number(selectedBranch);
    }

    try {
      const response = await api.post(
        `${API_URL}/api/employee-types`,
        payload,
        getAuthHeaders()
      );

      alert(response.data?.message || "Employee Type created successfully.");

      setInput("");
      setLeaveEligibilityDays("");
      setSelectedCompany("");
      setSelectedBranch("");
      setBranches([]);
      setShowForm(false);

      await fetchTypes();
    } catch (error) {
      console.error(
        "CREATE EMPLOYEE TYPE ERROR:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add employee type."
      );
    }
  };
  const fetchCompanies = useCallback(async () => {
    if (!isSuperAdmin) return;

    try {
      setLoadingCompanies(true);

      const response = await api.get(
        `${API_URL}/api/companies`,
        getAuthHeaders()
      );

      console.log("COMPANY API RESPONSE:", response.data);

      const result = response.data;

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.companies)
            ? result.companies
            : [];

      const activeCompanies = list.filter(
        (company) => Number(company.active) === 0
      );

      setCompanies(activeCompanies);
    } catch (err) {
      console.error(
        "FETCH COMPANIES ERROR:",
        err.response?.data || err.message
      );
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, [isSuperAdmin]);
  useEffect(() => {
    if (isSuperAdmin) {
      fetchCompanies();
    }
  }, [isSuperAdmin, fetchCompanies]);
const fetchBranches = async (companyId) => {
  if (!companyId) {
    setBranches([]);
    return [];
  }

  try {
    setLoadingBranches(true);

    const response = await api.get(
      `${API_URL}/api/branches/by-company/${companyId}`,
      getAuthHeaders()
    );

    console.log("BRANCH API RESPONSE:", response.data);

    const result = response.data;

    // API response madhun all branches milva
    const list = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.branches)
          ? result.branches
          : [];

    console.log("ALL BRANCHES:", list);

    // Company ID ani active var filter karu naka
    // API madhun alelya sarva branches show kara
    const allBranches = list;

    console.log("ALL BRANCHES TO DISPLAY:", allBranches);

    setBranches(allBranches);

    return allBranches;
  } catch (err) {
    console.error(
      "FETCH BRANCHES ERROR:",
      err.response?.data || err.message
    );

    setBranches([]);
    return [];
  } finally {
    setLoadingBranches(false);
  }
};
      const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this employee type?")) {
        try {
          await api.delete(`${API_URL}/api/employee-types/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          if (e.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
          } else
            alert(
              `Error: ${
                e.response?.data?.message || "Failed to delete employee type."
              }`,
            );
        }
      }
      fetchTypes();
    };

    const handleEdit = (id, name, leaveDays) => {
      setEditingId(id);
      setEditInput(name);
      setEditLeaveEligibilityDays(
        leaveDays !== null && leaveDays !== undefined ? String(leaveDays) : ""
      );
    };


  const handleUpdate = async (id) => {
    // ==========================================
    // 1. Validate Employee Type
    // ==========================================
    if (!editInput || !editInput.trim()) {
      alert("Please enter Employee Type.");
      return;
    }

    // ==========================================
    // 2. Validate Leave Eligibility Days
    // ==========================================
    if (
      editLeaveEligibilityDays === "" ||
      editLeaveEligibilityDays === null ||
      editLeaveEligibilityDays === undefined
    ) {
      alert("Please enter Leave Eligibility Days.");
      return;
    }

    const leaveDays = Number(editLeaveEligibilityDays);

    if (!Number.isInteger(leaveDays) || leaveDays < 0) {
      alert(
        "Leave Eligibility Days must be a non-negative integer."
      );
      return;
    }

    // ==========================================
    // 3. Validate SUPER ADMIN Company & Branch
    // ==========================================
    if (isSuperAdmin) {
      if (
        selectedCompany === "" ||
        selectedCompany === null ||
        selectedCompany === undefined
      ) {
        alert("Please select Company.");
        return;
      }

      if (
        selectedBranch === "" ||
        selectedBranch === null ||
        selectedBranch === undefined
      ) {
        alert("Please select Branch.");
        return;
      }
    }

    // ==========================================
    // 4. Prepare Payload
    // ==========================================
    const payload = {
      emp_type: editInput.trim(),
      leave_eligibility_days: leaveDays,
    };

    // ------------------------------------------
    // SUPER ADMIN
    // Company + Branch required
    // ------------------------------------------
    if (isSuperAdmin) {
      payload.company_id = Number(selectedCompany);
      payload.branch_id = Number(selectedBranch);
    }

    // ------------------------------------------
    // ADMIN
    // Do NOT send company_id / branch_id
    //
    // Backend automatically gets:
    // req.user.company_id
    //
    // Branch is NOT used for access restriction.
    // ------------------------------------------

    console.log("======================================");
    console.log("UPDATE EMPLOYEE TYPE");
    console.log({
      id,
      isSuperAdmin,
      payload,
    });
    console.log("======================================");

    try {
      // ==========================================
      // 5. Call Update API
      // ==========================================
      const response = await api.put(
        `${API_URL}/api/employee-types/${id}`,
        payload,
        getAuthHeaders()
      );

      console.log(
        "UPDATE EMPLOYEE TYPE RESPONSE:",
        response.data
      );

      // ==========================================
      // 6. Handle API Response
      // ==========================================
      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Update failed."
        );
      }

      // ==========================================
      // 7. Reset Edit Form
      // ==========================================
      setEditingId(null);
      setEditInput("");
      setEditLeaveEligibilityDays("");

      // ==========================================
      // 8. Reset Super Admin Selection
      // ==========================================
      if (isSuperAdmin) {
        setSelectedCompany("");
        setSelectedBranch("");
        setBranches([]);
      }

      // ==========================================
      // 9. Refresh Employee Types
      // ==========================================
      await fetchTypes();

      // ==========================================
      // 10. Success Message
      // ==========================================
      alert(
        response.data?.message ||
        "Employee Type updated successfully."
      );

    } catch (error) {
      console.error(
        "UPDATE EMPLOYEE TYPE ERROR:",
        error.response?.data || error
      );

      // ==========================================
      // 11. Unauthorized / Token Expired
      // ==========================================
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      // ==========================================
      // 12. Show Backend Error
      // ==========================================
      alert(
        error.response?.data?.message ||
        error.message ||
        "Failed to update employee type."
      );
    }
  };

    const handleSearch = () => {
      fetchTypes();
    };

    useEffect(() => {
      fetchTypes();
    }, [searchFields, dateFilter]);

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

        const response = await api.get(`${API_URL}/api/employee-types/export`, {
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
        link.download = `EmployeeTypes_${randomNumber}.xlsx`;
        link.click();
      } catch (error) {
        // api sends 401 here
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        console.error("Excel download error:", error);
        alert("Failed to download Excel. Please try again.");
      }
    };

  const handleReset = () => {
    setSearchFields([{ field: "emp_type", keyword: "" }]);
    setDateFilter({ from: "", to: "" });
    setCurrentPage(1);
  };
    const totalItems = employeeTypes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentEmployeeTypes = employeeTypes.slice(
      indexOfFirstItem,
      indexOfLastItem,
    );

    const handlePageChange = (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    };

    const handleItemsPerPageChange = (e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1);
    };
    return (
      <div
        className="page-container"
        style={{
          fontSize: "13px",
        }}
      >
        <style>{`.form-container {
    overflow: hidden;
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  }

  .form-container.collapsed {
    max-height: 0;
    opacity: 0;
  }

  .form-container.expanded {
    max-height: 200px; /* Adjust based on your form height */
    opacity: 1;
  }`}</style>
        <div className="page-header">
          <h1 className="page-title">
            Employee Type{" "}
            <span className="text-success">({employeeTypes.length})</span>
          </h1>
          <div className="page-actions">
            <button
              className="search-btn"
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaSearch /> {showSearch ? "Hide Search" : "Search"}
            </button>
            <button
              className="btn btn-primary me-2" // Add some margin to separate buttons
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Hide Form" : "+ Add New"}
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
    companies={companies}
    branches={branches}
    selectedCompany={selectedCompany}
    selectedBranch={selectedBranch}
    onCompanyChange={(companyId) => {
      setSelectedCompany(companyId);
      setSelectedBranch("");
      setBranches([]);

      if (companyId) fetchBranches(companyId);
    }}
    onBranchChange={setSelectedBranch}
  />
)}

        <Card className="card table-card">
          <div>
            {/* Apply the container classes here */}
        <div
    className={`form-container ${showForm ? "expanded" : "collapsed"}`}
  >
    <div className="p-3 border-bottom">
      <h5>Add New Employee Type</h5>

      <Form className="emp-type-form" onSubmit={handleSubmit}>
        <Row className="align-items-end">

          {/* Company & Branch: Only SUPER ADMIN */}
          {isSuperAdmin && (
            <>
              <Col md={5} className="mb-3">
                <Form.Group controlId="company">
                  <Form.Label>Company</Form.Label>

                <Form.Select
    value={selectedCompany}
    onChange={handleCompanyChange}
    required
  >
    <option value="">
      {loadingCompanies ? "Loading companies..." : "Select Company"}
    </option>

    {companies.map((company) => (
      <option
        key={company.id ?? company.company_id}
        value={company.id ?? company.company_id}
      >
        {company.company_name ?? company.name}
      </option>
    ))}
  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={5} className="mb-3">
                <Form.Group controlId="branch">
                  <Form.Label>Branch</Form.Label>

<Form.Select
  value={selectedBranch}
  onChange={(e) => setSelectedBranch(e.target.value)}
  required
  disabled={!selectedCompany || loadingBranches}
>
  <option value="">
    {loadingBranches ? "Loading branches..." : "Select Branch"}
  </option>

  {branches.map((branch) => (
    <option
      key={branch.id ?? branch.branch_id}
      value={branch.id ?? branch.branch_id}
    >
      {branch.branch_name ?? branch.name ?? "Unnamed Branch"}
    </option>
  ))}
</Form.Select>
                </Form.Group>
              </Col>
            </>
          )}

          <Col md={isSuperAdmin ? 5 : 5} className="mb-3">
            <Form.Group controlId="emp-type">
              <Form.Label>Employee Type</Form.Label>

              <Form.Control
                className="emp-type-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Employee Type"
                required
              />
            </Form.Group>
          </Col>

          <Col md={5} className="mb-3">
            <Form.Group controlId="leave-eligibility-days">
              <Form.Label>Leave Eligibility Days</Form.Label>

              <Form.Control
                className="emp-type-input"
                type="number"
                min="1"
                step="1"
                value={leaveEligibilityDays}
                onChange={(e) =>
                  setLeaveEligibilityDays(e.target.value)
                }
                placeholder="Leave Eligibility Days"
                required
              />
            </Form.Group>
          </Col>

          <Col md={2} className="mb-3">
            <Button
              type="submit"
              variant="primary"
              className="emp-type-submit"
            >
              Submit
            </Button>
          </Col>

        </Row>
      </Form>
    </div>
  </div>

  <div className="mt-3">
    {loading ? (
      <LoadingScreen />
    ) : error ? (
      <Alert variant="danger" className="mb-0 text-center">
        {error}
      </Alert>
    ) : (
      <Table hover responsive bordered>
        <thead className="table-secondary">
          <tr>
            <th>SR NO</th>

            {isSuperAdmin && (
              <>
                <th>COMPANY</th>
                <th>BRANCH</th>
              </>
            )}

            <th>EMPLOYEE TYPE</th>
            <th>LEAVE ELIGIBILITY DAYS</th>
            <th>Tracking Details</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {employeeTypes.length === 0 ? (
            <tr className="text-center">
              <td colSpan={isSuperAdmin ? 7 : 5}>
                No data found
              </td>
            </tr>
          ) : (
            currentEmployeeTypes.map((et, index) => (
              <tr key={et.id}>
                <td>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>

                {/* COMPANY */}
                {isSuperAdmin && (
                  <td>
                    {editingId === et.id ? (
                      <Form.Select
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        required
                      >
                        <option value="">
                          {loadingCompanies
                            ? "Loading companies..."
                            : "Select Company"}
                        </option>

                        {companies.map((company) => {
                          const companyId =
                            company.id ?? company.company_id;

                          return (
                            <option
                              key={companyId}
                              value={companyId}
                            >
                              {company.company_name ?? company.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                    ) : (
                      et.company_name ??
                      et.company?.company_name ??
                      "-"
                    )}
                  </td>
                )}

                {/* BRANCH */}
                {isSuperAdmin && (
                  <td>
                    {editingId === et.id ? (
                      <Form.Select
                        value={selectedBranch}
                        onChange={(e) =>
                          setSelectedBranch(e.target.value)
                        }
                        disabled={!selectedCompany || loadingBranches}
                        required
                      >
                        <option value="">
                          {loadingBranches
                            ? "Loading branches..."
                            : "Select Branch"}
                        </option>

                        {branches.map((branch) => {
                          const branchId =
                            branch.id ?? branch.branch_id;

                          return (
                            <option
                              key={branchId}
                              value={branchId}
                            >
                              {branch.branch_name ?? branch.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                    ) : (
                      et.branch_name ??
                      et.branch?.branch_name ??
                      "-"
                    )}
                  </td>
                )}

                {/* EMPLOYEE TYPE */}
                <td>
                  {editingId === et.id ? (
                    <Form.Control
                      value={editInput}
                      onChange={(e) =>
                        setEditInput(e.target.value)
                      }
                      className="emp-type-input"
                      style={{ minWidth: 120 }}
                    />
                  ) : (
                    et.emp_type
                  )}
                </td>

                {/* LEAVE ELIGIBILITY DAYS */}
                <td>
                  {editingId === et.id ? (
                    <Form.Control
                      type="number"
                      min="1"
                      step="1"
                      value={editLeaveEligibilityDays}
                      onChange={(e) =>
                        setEditLeaveEligibilityDays(e.target.value)
                      }
                      className="emp-type-input"
                      style={{ minWidth: 120 }}
                    />
                  ) : (
                    et.leave_eligibility_days ?? "-"
                  )}
                </td>

                {/* TRACKING DETAILS */}
                <td>
                  <AuditTrail
                    createdOn={et.created_on}
                    createdByName={
                      et.created_by?.name || et.created_by_name
                    }
                    modifiedOn={et.modified_on}
                    modifiedByName={
                      et.modified_by?.name || et.modified_by_name
                    }
                    disabledOn={et.disabled_on}
                    disabledByName={
                      et.disabled_by?.name || et.disabled_by_name
                    }
                    isActive={true}
                  />
                </td>

                {/* ACTION */}
                <td>
                  {editingId === et.id ? (
                    <div className="table-actions d-flex gap-2">
                      <Button
                        className="emp-type-cancel"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditInput("");
                          setEditLeaveEligibilityDays("");
                          setSelectedCompany("");
                          setSelectedBranch("");
                          setBranches([]);
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        className="emp-type-update"
                        onClick={() => handleUpdate(et.id)}
                      >
                        Update
                      </Button>
                    </div>
                  ) : (
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="secondary"
                        size="sm"
                        className="border-0 shadow-none"
                      >
                        Action
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={async () => {
                            handleEdit(
                              et.id,
                              et.emp_type,
                              et.leave_eligibility_days
                            );

                            if (isSuperAdmin) {
                              const companyId =
                                et.company_id ??
                                et.company?.id ??
                                "";

                              const branchId =
                                et.branch_id ??
                                et.branch?.id ??
                                "";

                              setSelectedCompany(
                                companyId !== ""
                                  ? String(companyId)
                                  : ""
                              );

                              setSelectedBranch(
                                branchId !== ""
                                  ? String(branchId)
                                  : ""
                              );

                              if (companyId) {
                                await fetchBranches(String(companyId));
                              } else {
                                setBranches([]);
                              }
                            }
                          }}
                        >
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
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    )}

    {/* PAGINATION */}
    {employeeTypes.length > 0 && (
      <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Show</span>

          <Form.Select
            size="sm"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            style={{ width: "80px" }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>

          <span className="text-muted">
            of {totalItems}
          </span>
        </div>

        {totalPages > 1 && (
          <Pagination className="mb-0">
            <Pagination.First
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
            />

            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            />

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 2
              )
              .map((page, index, arr) => {
                const previousPage = arr[index - 1];

                return (
                  <React.Fragment key={page}>
                    {previousPage &&
                      page - previousPage > 1 && (
                        <Pagination.Ellipsis disabled />
                      )}

                    <Pagination.Item
                      active={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  </React.Fragment>
                );
              })}

            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() =>
                handlePageChange(currentPage + 1)
              }
            />

            <Pagination.Last
              disabled={currentPage === totalPages}
              onClick={() =>
                handlePageChange(totalPages)
              }
            />
          </Pagination>
        )}
      </div>
    )}
  </div>
          </div>
        </Card>
      </div>
    );
  }
