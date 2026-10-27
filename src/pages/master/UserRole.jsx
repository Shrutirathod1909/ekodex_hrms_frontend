import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import clientLogger from "../../utils/clientLogger";
import LoadingScreen from "../../components/loader/LoadingScreen";
import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Dropdown,
} from "react-bootstrap";
import { useContext } from "react";
import { PermissionsContext } from "../../components/context/PermissionsContext";
import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrashAlt,
  FaTimes,
  FaUndo,
} from "react-icons/fa";

const UserRole = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const currentUser = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user") || "null") ||
        JSON.parse(sessionStorage.getItem("user") || "{}")
      );
    } catch {
      return {};
    }
  })();
  const isSuperAdmin =
    currentUser?.is_superadmin === true ||
    Number(currentUser?.id) === 1 ||
    String(currentUser?.role).toUpperCase() === "SUPERADMIN" ||
    String(currentUser?.role).toUpperCase() === "SUPER ADMIN";

  const { permissions, getPermissionsByModule, getPermissionsByModuleId } =
    useContext(PermissionsContext);
  const userRolePerms = getPermissionsByModule("Role Master");
  console.log("userRolePerms", userRolePerms);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [search, setSearch] = useState("");

  const [roleName, setRoleName] = useState("");
  const [editingId, setEditingId] = useState(null);
  // 0 = Active, 1 = Inactive
  const [activeStatus, setActiveStatus] = useState(0);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // ================= FETCH =================
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}/api/roles`, getAuthHeaders());
      setRoles(res.data || []);
    } catch (err) {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      alert("Role Name is required");
      return;
    }

    try {
      if (editingId) {
        await api.post(
          `${API_URL}/api/roles/update/${editingId}`,
          { role_name: roleName },
          getAuthHeaders(),
        );
      } else {
        await api.post(
          `${API_URL}/api/roles`,
          { role_name: roleName },
          getAuthHeaders(),
        );
      }

      resetForm();
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (role) => {
    setEditingId(role.id);
    setRoleName(role.role_name);
    setShowForm(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await api.delete(`/api/roles/${id}`, getAuthHeaders());

      fetchRoles();
    } catch (err) {
      const msg = clientLogger.error("UserRole.handleDelete", err);
      alert(`❌ Delete Failed:\n${msg}`);
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this role?")) return;

    try {
      await api.put(`/api/roles/restore/${id}`, {}, getAuthHeaders());
      alert("Role restored successfully!");
      fetchRoles();
    } catch (err) {
      const msg = clientLogger.error("UserRole.handleRestore", err);
      alert(`❌ Restore Failed:\n${msg}`);
    }
  };

  const resetForm = () => {
    setRoleName("");
    setEditingId(null);
    setShowForm(false);
  };

  // ================= FILTER =================
  const isItemActive = (val) => {
    if (val === undefined || val === null) return true;
    const s = String(val).trim();
    return s === "0" || s === "";
  };

  const activeCount = roles
    .filter((r) => isItemActive(r.active))
    .filter((r) =>
      r.role_name?.toLowerCase().includes(search.toLowerCase()),
    ).length;

  const inactiveCount = roles
    .filter((r) => !isItemActive(r.active))
    .filter((r) =>
      r.role_name?.toLowerCase().includes(search.toLowerCase()),
    ).length;

  const filteredRoles = roles
    .filter((r) =>
      activeStatus === 0 ? isItemActive(r.active) : !isItemActive(r.active),
    )
    .filter((item) =>
      item.role_name?.toLowerCase().includes(search.toLowerCase()),
    );

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  return (
    <div
      className="page-container"
      style={{
        fontSize: "13px",
      }}
    >
      {/* HEADER — hides when form is open */}
      {!showForm && (
        <div className="page-header">
          <h1 className="page-title m-0">
            Role Master{" "}
            <span className="text-success">({filteredRoles.length})</span>
          </h1>

          <div className="page-actions">
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaSearch /> {showSearch ? "Hide Search" : "Search"}
            </button>
            {userRolePerms?.add_access === 1 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                  setShowSearch(false);
                }}
              >
                <FaPlus /> Create New
              </button>
            )}
          </div>
        </div>
      )}

      {/* SEARCH */}
      {showSearch && (
        <Card className="mb-3 p-3">
          <Row>
            <Col md={4}>
              {/* Using InputGroup to hold both the input and the clear button */}
              <div className="input-group">
                <Form.Control
                  placeholder="Search Here..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearch("")}
                    title="Clear Search"
                  >
                    <FaTimes size={14} />
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* FORM */}
      {showForm && (
        <Card className="p-4 mb-3">
          <h2 className="page-title mb-3">
            {editingId ? "Edit Role" : "Create Role"}
          </h2>

          <Form onSubmit={handleSubmit} className="master-form">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role Name *</Form.Label>

                  <Form.Control
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={resetForm}>
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                {editingId ? "Update Role" : "Save Role"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* TABLE (same UI) */}
      {!showForm && (
        <Card>
          <Card.Header
            style={{
              background: "#fff",
              padding: "8px 16px",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#888",
                marginRight: "4px",
              }}
            >
              Status:
            </span>
            {[
              { label: "Active", value: 0 },
              { label: "Inactive", value: 1 },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveStatus(tab.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "3px 14px",
                  borderRadius: "20px",
                  border: "1.5px solid",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  lineHeight: "1.6",
                  borderColor:
                    activeStatus === tab.value
                      ? tab.value === 0
                        ? "#28a745"
                        : "#dc3545"
                      : "#ccc",
                  backgroundColor:
                    activeStatus === tab.value
                      ? tab.value === 0
                        ? "#28a745"
                        : "#dc3545"
                      : "#fff",
                  color: activeStatus === tab.value ? "#fff" : "#666",
                }}
              >
                {tab.label} ({tab.value === 0 ? activeCount : inactiveCount})
              </button>
            ))}
          </Card.Header>
          {loading ? (
            // <Alert className="text-center">Loading...</Alert>
            <LoadingScreen />
          ) : error ? (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          ) : (
            <>
              <Table bordered hover responsive>
                <thead className="table-secondary">
                  <tr>
                    <th width="80">Sr No.</th>
                    <th>Role Name</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRoles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    currentRoles.map((role, index) => (
                      <tr key={role.id}>
                        <td>{indexOfFirst + index + 1}</td>

                        <td>{role.role_name}</td>

                        <td>
                          {(() => {
                            const isCreatedBySuperAdmin =
                              Number(role.created_by) === 1 ||
                              String(role.created_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                              String(role.created_by_name).trim().toUpperCase() === "SUPERADMIN";
                            const isLockedBySuperAdmin =
                              String(role.superadmin_status) === "1" ||
                              Number(role.disabled_by) === 1 ||
                              String(role.disabled_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                              String(role.disabled_by_name).trim().toUpperCase() === "SUPERADMIN";
                            const canModify = isSuperAdmin || !isCreatedBySuperAdmin;

                            return (
                              <Dropdown>
                                <Dropdown.Toggle variant="secondary" size="sm">
                                  Actions
                                </Dropdown.Toggle>

                                <Dropdown.Menu
                                  renderOnMount={true}
                                  popperConfig={{ strategy: "fixed" }}
                                >
                                  {activeStatus === 0 ? (
                                    <>
                                      {canModify && (isSuperAdmin || userRolePerms?.edit_access === 1) && (
                                        <Dropdown.Item
                                          onClick={() => handleEdit(role)}
                                        >
                                          <FaPen className="me-2 text-primary" />
                                          Edit
                                        </Dropdown.Item>
                                      )}

                                      {canModify && (isSuperAdmin || userRolePerms?.delete_access === 1) && (
                                        <Dropdown.Item
                                          onClick={() => handleDelete(role.id)}
                                        >
                                          <FaTrashAlt className="me-2 text-danger" />
                                          Delete
                                        </Dropdown.Item>
                                      )}

                                      {!canModify && (
                                        <Dropdown.Item disabled className="text-muted small">
                                          Protected (Created by Super Admin)
                                        </Dropdown.Item>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {(isSuperAdmin || (!isLockedBySuperAdmin && userRolePerms?.delete_access === 1)) && (
                                        <Dropdown.Item
                                          onClick={() => handleRestore(role.id)}
                                        >
                                          <FaUndo className="me-2 text-success" />
                                          Restore
                                        </Dropdown.Item>
                                      )}

                                      {isLockedBySuperAdmin && !isSuperAdmin && (
                                        <Dropdown.Item disabled className="text-muted small">
                                          Locked by Super Admin
                                        </Dropdown.Item>
                                      )}
                                    </>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* PAGINATION (same UI style minimal change) */}
              <div className="d-flex justify-content-end mt-3">
                <ul className="pagination">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Prev
                    </button>
                  </li>

                  {[...Array(totalPages)]
                    .map((_, i) => i + 1)
                    .filter((page) => {
                      let startPage = Math.max(1, currentPage - 1);
                      let endPage = startPage + 3;
                      if (endPage > totalPages) {
                        endPage = totalPages;
                        startPage = Math.max(1, endPage - 3);
                      }
                      return page >= startPage && page <= endPage;
                    })
                    .map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
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
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default UserRole;
