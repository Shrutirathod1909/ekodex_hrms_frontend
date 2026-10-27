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
import { FaPlus, FaSearch, FaPen, FaTrashAlt, FaUndo } from "react-icons/fa";
import { PermissionsContext } from "../../components/context/PermissionsContext";
import { useContext } from "react";
const ZoneMasterPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const { getPermissionsByModule } = useContext(PermissionsContext);
  const zonePerms = getPermissionsByModule("Zone Master") || {};

  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [search, setSearch] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [editingId, setEditingId] = useState(null);
  // 0 = Active, 1 = Inactive
  const [activeStatus, setActiveStatus] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // ================= FETCH =================
// ================= FETCH =================
const fetchZones = async () => {
  setLoading(true);

  try {
    const res = await api.get(
      `${API_URL}/api/zones`,
      getAuthHeaders()
    );

    const allZones = Array.isArray(res.data)
      ? res.data
      : [];

    const visibleZones = isSuperAdmin
      ? allZones
      : allZones.filter(
          (zone) =>
            !(
              String(zone.active) === "1" &&
              String(zone.superadmin_status) === "1"
            )
        );

    setZones(visibleZones);
    setCurrentPage(1);
    setError("");
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      setError("Failed to load zones");
      clientLogger.error("ZoneMasterPage.fetchZones", err);
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = zoneName.trim().toUpperCase();

    if (!trimmed) {
      alert("Zone Name is required");
      return;
    }

    try {
      if (editingId) {
        await api.post(
          `${API_URL}/api/zones/update/${editingId}`,
          { zone_name: trimmed },
          getAuthHeaders(),
        );
      } else {
        await api.post(
          `${API_URL}/api/zones`,
          { zone_name: trimmed },
          getAuthHeaders(),
        );
      }

      resetForm();
      fetchZones();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (zone) => {
    setEditingId(zone.id);
    setZoneName(zone.zone_name);
    setShowForm(true);
    setShowSearch(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;

    try {
      await api.delete(`/api/zones/${id}`, getAuthHeaders());
      fetchZones();
    } catch (err) {
      const msg = clientLogger.error("ZoneMasterPage.handleDelete", err);
      alert(`❌ Delete Failed:\n${msg}`);
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this zone?")) return;

    try {
      await api.put(`/api/zones/restore/${id}`, {}, getAuthHeaders());
      fetchZones();
    } catch (err) {
      const msg = clientLogger.error("ZoneMasterPage.handleRestore", err);
      alert(`❌ Restore Failed:\n${msg}`);
    }
  };

  const resetForm = () => {
    setZoneName("");
    setEditingId(null);
    setShowForm(false);
  };

  // ================= FILTER =================
  const isItemActive = (val) => {
    if (val === undefined || val === null) return true;
    const s = String(val).trim();
    return s === "0" || s === "";
  };

  const searchedZones = zones.filter((item) =>
    item.zone_name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = searchedZones.filter((z) => isItemActive(z.active)).length;
  const inactiveCount = searchedZones.filter((z) => !isItemActive(z.active)).length;

  const filteredZones = searchedZones.filter((z) =>
    activeStatus === 0 ? isItemActive(z.active) : !isItemActive(z.active)
  );

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentZones = filteredZones.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);

  return (
    <div className="page-container" style={{ fontSize: "13px" }}>
      {/* HEADER — hides when form is open */}
      {!showForm && (
        <div className="page-header">
          <h1 className="page-title m-0">
            Zone Master{" "}
            <span className="text-success">({searchedZones.length})</span>
          </h1>

          <div className="page-actions">
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaSearch /> {showSearch ? "Hide Search" : "Search"}
            </button>
            {zonePerms?.add_access === 1 && (
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
      {showSearch && !showForm && (
        <Card className="mb-3 p-3">
          <Row>
            <Col md={4}>
              <Form.Control
                placeholder="Search Zone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: "12px" }}
              />
            </Col>
            <Col xs="auto">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setSearch(""); // Clears the input
                  setCurrentPage(1); // Optional: Reset to first page
                }}
                style={{ fontSize: "12px" }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* FORM */}
      {showForm && (
        <Card className="p-4 mb-3">
          <h2 className="page-title mb-3">
            {editingId ? "Edit Zone" : "Create Zone"}
          </h2>

          <Form onSubmit={handleSubmit} className="master-form">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Zone Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={zoneName}
                    placeholder="Enter Zone Name"
                    onChange={(e) => setZoneName(e.target.value.toUpperCase())}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4 gap-2">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                {editingId ? "Update Zone" : "Save Zone"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {!showForm && (
        <Card>
          <Card.Header style={{ background: "#fff", padding: "8px 16px", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", gap: "8px", minHeight: "44px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#888", marginRight: "4px" }}>Status:</span>
            {[{ label: "Active", value: 0 }, { label: "Inactive", value: 1 }].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveStatus(tab.value); setCurrentPage(1); }}
                style={{
                  padding: "3px 14px", borderRadius: "20px", border: "1.5px solid",
                  fontSize: "11px", fontWeight: 600, cursor: "pointer", lineHeight: "1.6",
                  borderColor: activeStatus === tab.value ? (tab.value === 0 ? "#28a745" : "#dc3545") : "#ccc",
                  backgroundColor: activeStatus === tab.value ? (tab.value === 0 ? "#28a745" : "#dc3545") : "#fff",
                  color: activeStatus === tab.value ? "#fff" : "#666",
                }}
              >
                {tab.label} ({tab.value === 0 ? activeCount : inactiveCount})
              </button>
            ))}
          </Card.Header>
          {loading ? (
            // <Alert className="text-center m-0">Loading...</Alert>
            <LoadingScreen />
          ) : error ? (
            <Alert variant="danger" className="text-center m-0">
              {error}
            </Alert>
          ) : (
            <>
              <Table bordered hover responsive>
                <thead className="table-secondary">
                  <tr>
                    <th width="80">Sr No.</th>
                    <th>Zone Name</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentZones.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No zones found
                      </td>
                    </tr>
                  ) : (
                    currentZones.map((zone, index) => (
                      <tr key={zone.id}>
                        <td>{indexOfFirst + index + 1}</td>

                        <td>{zone.zone_name}</td>

                        <td>
                          {(() => {
                            const isCreatedBySuperAdmin =
                              Number(zone.created_by) === 1 ||
                              String(zone.created_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                              String(zone.created_by_name).trim().toUpperCase() === "SUPERADMIN";
                            const isLockedBySuperAdmin =
                              String(zone.superadmin_status) === "1" ||
                              Number(zone.disabled_by) === 1 ||
                              String(zone.disabled_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                              String(zone.disabled_by_name).trim().toUpperCase() === "SUPERADMIN";
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
                                      {/* EDIT */}
                                      {canModify && (isSuperAdmin || zonePerms?.edit_access === 1) && (
                                        <Dropdown.Item onClick={() => handleEdit(zone)}>
                                          <FaPen className="me-2 text-primary" />
                                          Edit
                                        </Dropdown.Item>
                                      )}

                                      {/* DELETE */}
                                      {canModify && (isSuperAdmin || zonePerms?.delete_access === 1) && (
                                        <Dropdown.Item
                                          onClick={() => handleDelete(zone.id)}
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
                                      {/* RESTORE */}
                                      {(isSuperAdmin || (!isLockedBySuperAdmin && zonePerms?.delete_access === 1)) && (
                                        <Dropdown.Item
                                          onClick={() => handleRestore(zone.id)}
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

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-3 px-3 pb-3">
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
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default ZoneMasterPage;
