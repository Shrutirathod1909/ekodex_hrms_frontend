import React, { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const handleAuthError = (error, navigate) => {
  const status = error.response?.status;

  if (status === 401 || status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });

    return true;
  }

  return false;
};


// =====================================================
// NORMALIZE ROLE
// =====================================================

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

// =====================================================
// LEAVE LIST
// =====================================================

const LeaveList = () => {
  const navigate = useNavigate();
  const [leaveBalance, setLeaveBalance] = useState(null);

  // ===================================================
  // STATES
  // ===================================================
  // ===================================================
  // LEAVE LIMITS
  // ===================================================

  const [leaves, setLeaves] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  // ===================================================
  // USER ROLE
  // ===================================================

  const [userRole, setUserRole] = useState("");

  // ===================================================
  // NORMALIZED ROLE
  // ===================================================

  const normalizedRole = normalizeRole(userRole);

  // ===================================================
  // ADMIN CHECK
  // ===================================================

  const isAdmin = normalizedRole === "admin" || normalizedRole === "superadmin";

  // ===================================================
  // DEBUG
  // ===================================================

  console.log("USER ROLE FROM API:", userRole);

  console.log("NORMALIZED ROLE:", normalizedRole);

  console.log("IS ADMIN:", isAdmin);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchLeaves();

    fetchLeaveBalance();
  }, []);

  // ===================================================
  // GET ALL LEAVES
  // ===================================================

const fetchLeaveBalance = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/employee-leave/getEmployeeLeaveBalance`,
      getAuthHeaders()
    );

    if (response.data?.success) {
      setLeaveBalance(response.data.balance);
    }
  } catch (error) {
    console.error("LEAVE BALANCE ERROR:", error.response?.data || error);

    if (handleAuthError(error, navigate)) return;
  }
};

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/employee-leave/getAdminAllEmployeeLeaves`,

        {
          ...getAuthHeaders(),

          params: {
            status: "All",

            search: "",

            limit: 100,

            offset: 0,
          },
        },
      );

      console.log("LEAVE API RESPONSE:", response.data);

      // =================================================
      // GET ROLE FROM API
      // =================================================

      const apiRole = response.data?.role || response.data?.user?.role || "";

      console.log("ROLE RECEIVED FROM API:", apiRole);

      setUserRole(apiRole);

      // =================================================
      // GET LEAVES
      // =================================================

      const data = response.data?.leaves || response.data?.data || [];

      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LEAVE LIST ERROR:", error.response?.data || error);

      alert(error.response?.data?.message || "Failed to load leave list");

      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // DELETE LEAVE
  // ===================================================

  const handleDelete = async (id) => {
    if (!id) {
      alert("Leave ID not found");
      return;
    }

    const token = localStorage.getItem("token");

    console.log("========== DELETE DEBUG ==========");
    console.log("TOKEN:", token);
    console.log("LEAVE ID:", id);
    console.log("URL:", `${API_URL}/api/employee-leave/${id}`);
    console.log("==================================");

    if (!token) {
      alert("Token not found in localStorage");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this leave?")) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios({
        method: "post",

        url: `${API_URL}/api/employee-leave/${id}`,

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("DELETE RESPONSE:", response.data);

      alert(response.data?.message || "Leave deleted successfully");

      await fetchLeaves();
    } catch (error) {
      console.error("DELETE FULL ERROR:", error);

      console.error("DELETE RESPONSE:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete leave",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // EDIT LEAVE
  // ===================================================

  const handleEdit = (id, leaveStatus) => {
    if (!id) {
      alert("Leave ID not found");

      return;
    }

    // Admin ला edit नाही
    if (isAdmin) {
      alert("Admin cannot edit leave");

      return;
    }

    const currentStatus = String(leaveStatus || "")
      .trim()
      .toUpperCase();

    // Pending नसल्यास edit करू नका
    if (currentStatus && currentStatus !== "PENDING") {
      alert("Only Pending leave can be edited");

      return;
    }

    navigate(`/leaves/edit/${id}`);
  };

  // ===================================================
  // APPROVE LEAVE
  // ===================================================

  const handleApprove = async (id) => {
    if (!id) {
      alert("Leave ID not found");

      return;
    }

    if (!isAdmin) {
      alert("Only Admin or SuperAdmin can approve leave");

      return;
    }

    const confirmApprove = window.confirm(
      "Are you sure you want to approve this leave?",
    );

    if (!confirmApprove) {
      return;
    }

    try {
      setLoading(true);

      console.log("APPROVING LEAVE ID:", id);

      const response = await axios.post(
        `${API_URL}/api/employee-leave/approveLeave`,

        {
          leave_id: id,
        },

        getAuthHeaders(),
      );

      console.log("APPROVE RESPONSE:", response.data);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to approve leave");
      }

      alert(response.data?.message || "Leave approved successfully");

      await fetchLeaves();
      await fetchLeaveBalance();
    } catch (error) {
      console.error("APPROVE ERROR:", error.response?.data || error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve leave",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // REJECT LEAVE
  // ===================================================

  const handleReject = async (id) => {
    if (!id) {
      alert("Leave ID not found");

      return;
    }

    if (!isAdmin) {
      alert("Only Admin or SuperAdmin can reject leave");

      return;
    }

    const confirmReject = window.confirm(
      "Are you sure you want to reject this leave?",
    );

    if (!confirmReject) {
      return;
    }

    try {
      setLoading(true);

      console.log("REJECTING LEAVE ID:", id);

      const response = await axios.post(
        `${API_URL}/api/employee-leave/rejectLeave`,

        {
          leave_id: id,
        },

        getAuthHeaders(),
      );

      console.log("REJECT RESPONSE:", response.data);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to reject leave");
      }

      alert(response.data?.message || "Leave rejected successfully");

      await fetchLeaves();
      await fetchLeaveBalance();
    } catch (error) {
      console.error("REJECT ERROR:", error.response?.data || error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject leave",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return String(date);
    }

    return d.toLocaleDateString("en-GB");
  };

  // ===================================================
  // CALCULATE DAYS
  // ===================================================

  const calculateDays = (leave) => {
    const leaveType = leave.leave_type || leave.leaveType || leave.type || "";

    if (String(leaveType).trim().toUpperCase() === "HALF_DAY") {
      return "0.5";
    }

    const fromDate = leave.from_date || leave.fromDate;

    const toDate = leave.to_date || leave.toDate;

    if (!fromDate || !toDate) {
      return "-";
    }

    const from = new Date(`${String(fromDate).split("T")[0]}T00:00:00`);

    const to = new Date(`${String(toDate).split("T")[0]}T00:00:00`);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return "-";
    }

    const diff = to.getTime() - from.getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // ===================================================
  // STATUS BADGE
  // ===================================================

  const getStatusBadge = (value) => {
    const current = String(value || "PENDING")
      .trim()
      .toUpperCase();

    if (current === "APPROVED") {
      return <span className="badge bg-success">Approved</span>;
    }

    if (current === "REJECTED") {
      return <span className="badge bg-danger">Rejected</span>;
    }

    if (current === "CANCELLED") {
      return <span className="badge bg-secondary">Cancelled</span>;
    }

    return <span className="badge bg-warning text-dark">Pending</span>;
  };

  // ===================================================
  // FILTER LEAVES
  // ===================================================

  const filteredLeaves = leaves.filter((leave) => {
    const employeeName =
      leave.employee_name ||
      leave.employeeName ||
      leave.emp_name ||
      leave.name ||
      "";

    const employeeCode =
      leave.employee_code || leave.employeeCode || leave.emp_code || "";

    const leaveType = leave.leave_type || leave.leaveType || leave.type || "";

    const reason = leave.reason || "";

    const clientName = leave.client_name || leave.clientName || "";

    const siteName = leave.site_name || leave.siteName || "";

    const leaveStatus = leave.status || "PENDING";

    const text = `
          ${employeeName}
          ${employeeCode}
          ${leaveType}
          ${reason}
          ${clientName}
          ${siteName}
        `.toLowerCase();

    const searchMatch = text.includes(search.toLowerCase().trim());

    const statusMatch =
      !status ||
      String(leaveStatus).trim().toUpperCase() ===
        String(status).trim().toUpperCase();

    return searchMatch && statusMatch;
  });
  // ===================================================
  // USER LEAVE COUNTS
  // ONLY FOR NORMAL USER
  // ===================================================

  const leaveCounts = {
    CL: 0,

    SL: 0,

    PL: 0,

    ML: 0,
  };

  if (!isAdmin) {
    leaves.forEach((leave) => {
      const leaveType = String(
        leave.leave_type || leave.leaveType || leave.type || "",
      )
        .trim()
        .toUpperCase();

      const leaveStatus = String(leave.status || "PENDING")
        .trim()
        .toUpperCase();

      // जर तुम्हाला Pending + Approved दोन्ही count करायचे असतील
      // खालील condition काढून टाका

      if (leaveStatus === "REJECTED" || leaveStatus === "CANCELLED") {
        return;
      }

      if (leaveType === "CL") {
        leaveCounts.CL += 1;
      } else if (leaveType === "SL") {
        leaveCounts.SL += 1;
      } else if (leaveType === "PL") {
        leaveCounts.PL += 1;
      } else if (leaveType === "ML") {
        leaveCounts.ML += 1;
      }
    });
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div
      className="card"
      style={{
        fontSize: "13px",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Leave List</h5>

          <div className="d-flex align-items-center gap-2">
            {/* ADMIN ROLE */}

            {isAdmin && <span className="badge bg-primary">{userRole}</span>}

            {/* APPLY LEAVE */}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/leaves/apply")}
            >
              + Apply Leave
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          BODY
      ================================================= */}

      <div className="card-body">
        {/* USER LEAVE SUMMARY */}
        {/* ================================================
    USER LEAVE BALANCE
================================================ */}

        {!isAdmin && leaveBalance && (
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <div className="card border shadow-sm">
              <div className="card-body py-2 px-3">
                <span className="badge bg-primary">Earned Leave</span>

                <div className="small mt-2">
                  Available:{" "}
                  <strong>{Number(leaveBalance.available_leave || 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="row mb-3">
          {/* SEARCH */}

          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search Employee / Code / Client / Site / Leave Type / Reason"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* STATUS */}

          <div className="col-md-3 mb-2">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>

              <option value="PENDING">Pending</option>

              <option value="APPROVED">Approved</option>

              <option value="REJECTED">Rejected</option>

              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* COUNT */}

          <div className="col-md-3 mb-2 d-flex align-items-center">
            <span className="text-muted">
              Total: <strong>{filteredLeaves.length}</strong>
            </span>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="table-responsive">
          <table
            className="
              table
              table-bordered
              table-hover
              align-middle
              mb-0
            "
          >
            <thead className="table-light">
              <tr>
                <th>#</th>

                <th>Employee</th>

                <th>Client</th>

                <th>Site</th>

                <th>Leave Type</th>

                <th>From Date</th>

                <th>To Date</th>

                <th>Days</th>

                <th>Half Day / Time</th>

                <th>Reason</th>

                <th>Status</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {/* =============================================
                  LOADING
              ============================================= */}

              {loading ? (
                <tr>
                  <td
                    colSpan="12"
                    className="
                      text-center
                      py-4
                    "
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                /* =============================================
                    NO DATA
                ============================================= */

                <tr>
                  <td
                    colSpan="12"
                    className="
                      text-center
                      py-4
                    "
                  >
                    No Leave Found
                  </td>
                </tr>
              ) : (
                /* =============================================
                    DATA
                ============================================= */

                filteredLeaves.map((leave, index) => {
                  // =========================================
                  // ID
                  // =========================================

                  const id = leave.id || leave.leave_id;

                  // =========================================
                  // EMPLOYEE
                  // =========================================

                  const employeeName =
                    leave.employee_name ||
                    leave.employeeName ||
                    leave.emp_name ||
                    leave.name ||
                    "-";

                  const employeeCode =
                    leave.employee_code ||
                    leave.employeeCode ||
                    leave.emp_code ||
                    "";

                  // =========================================
                  // CLIENT
                  // =========================================

                  const clientName =
                    leave.client_name || leave.clientName || "-";

                  // =========================================
                  // SITE
                  // =========================================

                  const siteName = leave.site_name || leave.siteName || "-";

                  // =========================================
                  // LEAVE TYPE
                  // =========================================

                  const leaveType =
                    leave.leave_type || leave.leaveType || leave.type || "-";

                  // =========================================
                  // DATES
                  // =========================================

                  const fromDate = leave.from_date || leave.fromDate;

                  const toDate = leave.to_date || leave.toDate;

                  // =========================================
                  // HALF DAY TIME
                  // =========================================

                  const halfDayTime =
                    leave.half_day_time ||
                    leave.halfDayTime ||
                    leave.from_time ||
                    leave.fromTime ||
                    leave.time ||
                    "";

                  // =========================================
                  // REASON
                  // =========================================

                  const reason = leave.reason || "-";

                  // =========================================
                  // STATUS
                  // =========================================

                  const leaveStatus = leave.status || "PENDING";

                  // =========================================
                  // PENDING CHECK
                  // =========================================

                  const isPending =
                    String(leaveStatus).trim().toUpperCase() === "PENDING";

                  // =========================================
                  // RETURN ROW
                  // =========================================

                  return (
                    <tr key={id || index}>
                      {/* =====================================
                            #
                        ===================================== */}

                      <td>{index + 1}</td>

                      {/* =====================================
                            EMPLOYEE
                        ===================================== */}

                      <td>
                        <strong>{employeeName}</strong>

                        {employeeCode && (
                          <div className="text-muted small">{employeeCode}</div>
                        )}
                      </td>

                      {/* =====================================
                            CLIENT
                        ===================================== */}

                      <td>{clientName}</td>

                      {/* =====================================
                            SITE
                        ===================================== */}

                      <td>{siteName}</td>

                      {/* =====================================
                            LEAVE TYPE
                        ===================================== */}

                      <td>
                        {String(leaveType).trim().toUpperCase() === "HALF_DAY"
                          ? "Half Day"
                          : leaveType}
                      </td>

                      {/* =====================================
                            FROM DATE
                        ===================================== */}

                      <td>{formatDate(fromDate)}</td>

                      {/* =====================================
                            TO DATE
                        ===================================== */}

                      <td>{formatDate(toDate)}</td>

                      {/* =====================================
                            DAYS
                        ===================================== */}

                      <td>{calculateDays(leave)}</td>

                      {/* =====================================
                            HALF DAY TIME
                        ===================================== */}

                      <td>
                        {String(leaveType).trim().toUpperCase() === "HALF_DAY"
                          ? halfDayTime || "-"
                          : "-"}
                      </td>

                      {/* =====================================
                            REASON
                        ===================================== */}

                      <td
                        style={{
                          maxWidth: "220px",

                          whiteSpace: "normal",

                          wordBreak: "break-word",
                        }}
                      >
                        {reason}
                      </td>

                      {/* =====================================
                            STATUS
                        ===================================== */}

                      <td>{getStatusBadge(leaveStatus)}</td>

                      {/* =====================================
                            ACTION
                        ===================================== */}

                      <td>
                        <div
                          className="
                              d-flex
                              gap-1
                              flex-wrap
                            "
                        >
                          {/* =================================
                                NORMAL USER
                                EDIT + DELETE
                            ================================= */}

                          {!isAdmin && (
                            <>
                              {/* EDIT
                                    Only Pending
                                */}

                              {isPending && (
                                <button
                                  type="button"
                                  className="
                                      btn
                                      btn-sm
                                      btn-outline-primary
                                    "
                                  onClick={() => handleEdit(id, leaveStatus)}
                                  disabled={loading}
                                >
                                  Edit
                                </button>
                              )}

                              {/* DELETE
                                    Only Pending
                                */}

                              {isPending && (
                                <button
                                  type="button"
                                  className="
                                      btn
                                      btn-sm
                                      btn-outline-danger
                                    "
                                  onClick={() => handleDelete(id)}
                                  disabled={loading}
                                >
                                  Delete
                                </button>
                              )}

                              {/* Approved / Rejected */}

                              {!isPending && (
                                <span className="text-muted">-</span>
                              )}
                            </>
                          )}

                          {/* =================================
                                ADMIN / SUPERADMIN
                                APPROVE + REJECT ONLY
                            ================================= */}

                          {isAdmin && isPending && (
                            <>
                              {/* APPROVE */}

                              <button
                                type="button"
                                className="
                                      btn
                                      btn-sm
                                      btn-success
                                    "
                                onClick={() => handleApprove(id)}
                                disabled={loading}
                              >
                                Approve
                              </button>

                              {/* REJECT */}

                              <button
                                type="button"
                                className="
                                      btn
                                      btn-sm
                                      btn-danger
                                    "
                                onClick={() => handleReject(id)}
                                disabled={loading}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* =================================
                                ADMIN
                                APPROVED / REJECTED
                            ================================= */}

                          {isAdmin && !isPending && (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveList;
