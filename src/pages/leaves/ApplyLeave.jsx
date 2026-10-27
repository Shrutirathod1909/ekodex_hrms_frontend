import React, { useEffect, useState } from "react";

import axios from "axios";

import Select from "react-select";

import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
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


const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
// =====================================================
// EMPLOYEE ID
// =====================================================

const getEmployeeId = (employee) => {
  return (
    employee?.id ??
    employee?.employee_id ??
    employee?.emp_id ??
    employee?.employeeId ??
    null
  );
};

// =====================================================
// EMPLOYEE NAME
// =====================================================

const getEmployeeName = (employee) => {
  return (
    employee?.employee_name ||
    employee?.employeeName ||
    employee?.emp_name ||
    employee?.name ||
    employee?.fullname ||
    employee?.full_name ||
    ""
  );
};

// =====================================================
// EMPLOYEE CODE
// =====================================================

const getEmployeeCode = (employee) => {
  return (
    employee?.employee_code ||
    employee?.employeeCode ||
    employee?.emp_code ||
    employee?.code ||
    ""
  );
};

// =====================================================
// FORMAT DATE FOR INPUT
// =====================================================

const formatDateForInput = (date) => {
  if (!date) {
    return "";
  }

  // SQL date:
  // 2026-08-31T00:00:00.000Z

  if (typeof date === "string") {
    return date.split("T")[0];
  }

  try {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// =====================================================
// APPLY / EDIT LEAVE COMPONENT
// =====================================================

const ApplyLeave = () => {
  const navigate = useNavigate();

  // ===================================================
  // GET ID FROM URL
  // ===================================================

  const { id } = useParams();

  // ===================================================
  // EDIT MODE
  // ===================================================

  const isEditMode = Boolean(id);

  // ===================================================
  // STATES
  // ===================================================

  const [employees, setEmployees] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [loadingLeave, setLoadingLeave] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [availableLeave, setAvailableLeave] = useState(null);

  const [loadingBalance, setLoadingBalance] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",

    leaveType: "",

    fromDate: "",

    toDate: "",

    halfDayTime: "",

    reason: "",
  });

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =====================================================
  // LOAD LEAVE DATA
  // =====================================================

  useEffect(() => {
    if (isEditMode && id) {
      fetchLeaveDetails();
    }
  }, [id, isEditMode]);

  // =====================================================
  // GET EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const response = await axios.get(
        `${API_URL}/api/employees/dropdown`,

        getAuthHeaders(),
      );

      console.log("EMPLOYEE RESPONSE:", response.data);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data?.employees)) {
        data = response.data.employees;
      } else if (Array.isArray(response.data?.recordset)) {
        data = response.data.recordset;
      } else if (Array.isArray(response.data?.result)) {
        data = response.data.result;
      }

      console.log("EMPLOYEE COUNT:", data.length);

      setEmployees(data);
   } catch (error) {
  console.error("EMPLOYEE API ERROR:", error.response?.data || error);

  if (handleAuthError(error, navigate)) return;

  setEmployees([]);
} finally {
  setLoadingEmployees(false);
}
  };

  // =====================================================
  // GET SINGLE LEAVE DETAILS
  // =====================================================

  const fetchLeaveDetails = async () => {
    try {
      setLoadingLeave(true);

      console.log("EDIT LEAVE ID:", id);

      // ===============================================
      // API CALL
      // ===============================================

      const response = await axios.get(
        `${API_URL}/api/employee-leave/${id}`,

        getAuthHeaders(),
      );

      console.log("EDIT LEAVE RESPONSE:", response.data);

      // ===============================================
      // GET LEAVE OBJECT
      // ===============================================

      const leave =
        response.data?.leave ||
        response.data?.data ||
        response.data?.result ||
        response.data;

      console.log("FINAL LEAVE DATA:", leave);

      // ===============================================
      // VALIDATION
      // ===============================================

      if (!leave || typeof leave !== "object") {
        throw new Error("Leave data not found");
      }

      // ===============================================
      // EMPLOYEE ID
      // ===============================================

      const employeeId =
        leave.emp_id || leave.employee_id || leave.employeeId || "";

      // ===============================================
      // LEAVE TYPE
      // ===============================================

      const leaveType = leave.type || leave.leave_type || leave.leaveType || "";

      // ===============================================
      // HALF DAY TIME
      // ===============================================

      const halfDayTime =
        leave.from_time || leave.half_day_time || leave.halfDayTime || "";

      // ===============================================
      // SET FORM
      // ===============================================

      setForm({
        employeeId: employeeId ? String(employeeId) : "",

        leaveType: String(leaveType).trim().toUpperCase(),

        fromDate: formatDateForInput(leave.from_date || leave.fromDate),

        toDate: formatDateForInput(leave.to_date || leave.toDate),

        halfDayTime: String(halfDayTime).trim().toUpperCase(),

        reason: leave.reason || "",
      });

      console.log("FORM DATA SET SUCCESSFULLY");
   } catch (error) {
  console.error("FETCH LEAVE ERROR:", error.response?.data || error);

  if (handleAuthError(error, navigate)) return;

  alert(
    error.response?.data?.message ||
      error.message ||
      "Failed to load leave details"
  );
} finally {
  setLoadingLeave(false);
}
  };

  // =====================================================
  // EMPLOYEE OPTIONS
  // =====================================================

  const employeeOptions = employees

    .map((employee) => {
      const empId = getEmployeeId(employee);

      const name = getEmployeeName(employee);

      const code = getEmployeeCode(employee);

      if (!empId) {
        return null;
      }

      return {
        value: String(empId),

        label: code ? `${name || "Employee"} (${code})` : name || "Employee",

        employee,

        searchText: `

                ${name}

                ${code}

                ${empId}

                ${employee?.first_name || ""}

                ${employee?.last_name || ""}

              `.toLowerCase(),
      };
    })

    .filter(Boolean);

  // =====================================================
  // CUSTOM SEARCH
  // =====================================================

  const filterEmployeeOption = (
    candidate,

    inputValue,
  ) => {
    if (!inputValue) {
      return true;
    }

    const searchText = inputValue

      .toLowerCase()

      .trim();

    return candidate.data.searchText.includes(searchText);
  };

  // =====================================================
  // HANDLE NORMAL INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,

      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // =====================================================
  // EMPLOYEE CHANGE
  // =====================================================

  const handleEmployeeChange = (selectedOption) => {
    const value = selectedOption?.value || "";

    setForm((prev) => ({
      ...prev,

      employeeId: value,
    }));

    console.log(
      "SELECTED EMPLOYEE:",

      selectedOption?.employee,
    );

    if (!value) {
      setAvailableLeave(null);
    }
  };

  // =====================================================
  // GET EARNED LEAVE BALANCE FOR SELECTED EMPLOYEE
  // =====================================================

  const fetchEmployeeLeaveBalance = async (employeeId) => {
    if (!employeeId) {
      setAvailableLeave(null);
      return;
    }

    try {
      setLoadingBalance(true);

      const response = await axios.get(
        `${API_URL}/api/employee-leave/getEmployeeLeaveBalance`,
        {
          ...getAuthHeaders(),
          params: { emp_id: employeeId },
        },
      );

      console.log("SELECTED EMPLOYEE LEAVE BALANCE:", response.data);

      if (response.data?.success) {
        setAvailableLeave(Number(response.data?.balance?.available_leave || 0));
      } else {
        setAvailableLeave(0);
      }
} catch (error) {
  console.error(
    "SELECTED EMPLOYEE LEAVE BALANCE ERROR:",
    error.response?.data || error
  );

  if (handleAuthError(error, navigate)) return;

  setAvailableLeave(null);
} finally {
  setLoadingBalance(false);
}
  };

  // Fetch when employee changes or edit data loads
  useEffect(() => {
    if (form.employeeId) {
      fetchEmployeeLeaveBalance(form.employeeId);
    } else {
      setAvailableLeave(null);
    }
  }, [form.employeeId]);

  // =====================================================
  // LEAVE TYPE CHANGE
  // =====================================================

  const handleLeaveTypeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,

      leaveType: value,

      toDate: value === "HALF_DAY" ? prev.fromDate : prev.toDate,

      halfDayTime: value === "HALF_DAY" ? prev.halfDayTime : "",
    }));
  };

  // =====================================================
  // FROM DATE CHANGE
  // =====================================================

  const handleFromDateChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,

      fromDate: value,

      toDate: prev.leaveType === "HALF_DAY" ? value : prev.toDate,
    }));
  };

  // =====================================================
  // CALCULATE DAYS
  // =====================================================

  const calculateDays = () => {
    if (!form.fromDate) {
      return 0;
    }

    if (form.leaveType === "HALF_DAY") {
      return 0.5;
    }

    if (!form.toDate) {
      return 0;
    }

    const from = new Date(`${form.fromDate}T00:00:00`);

    const to = new Date(`${form.toDate}T00:00:00`);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return 0;
    }

    const difference = to.getTime() - from.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===============================================
    // VALIDATION
    // ===============================================

    if (!form.employeeId) {
      alert("Please select Employee");

      return;
    }

    if (!form.leaveType) {
      alert("Please select Leave Type");

      return;
    }

    if (!form.fromDate) {
      alert("Please select From Date");

      return;
    }

    if (form.leaveType !== "HALF_DAY" && !form.toDate) {
      alert("Please select To Date");

      return;
    }

    if (form.leaveType !== "HALF_DAY" && form.toDate < form.fromDate) {
      alert("To Date cannot be before From Date");

      return;
    }

    if (form.leaveType === "HALF_DAY" && !form.halfDayTime) {
      alert("Please select Half Day Time");

      return;
    }

    // =====================================================
    // EARNED LEAVE BALANCE VALIDATION
    // One row in emp_leave_tbl represents one earned leave.
    // HALF_DAY also reserves one earned-leave row on approval.
    // =====================================================

    const requestedDays = calculateDays();
    const requiredEarnedLeaves = Math.ceil(Number(requestedDays) || 0);

    if (availableLeave === null && !isEditMode) {
      await fetchEmployeeLeaveBalance(form.employeeId);
    }

    const balanceToValidate =
      availableLeave === null ? null : Number(availableLeave);

    if (
      !isEditMode &&
      balanceToValidate !== null &&
      balanceToValidate < requiredEarnedLeaves
    ) {
      alert(
        `Insufficient earned leave. Available: ${balanceToValidate}, Required: ${requiredEarnedLeaves}`,
      );
      return;
    }

    if (!form.reason.trim()) {
      alert("Please enter Reason");

      return;
    }

    // ===============================================
    // SELECTED EMPLOYEE
    // ===============================================

    const selectedEmployee = employees.find(
      (employee) => String(getEmployeeId(employee)) === String(form.employeeId),
    );

    console.log(
      "SELECTED EMPLOYEE:",

      selectedEmployee,
    );

    // ===============================================
    // EMPLOYEE DETAILS
    // ===============================================

    let employeeCode = "";

    let employeeName = "";

    if (selectedEmployee) {
      employeeCode = getEmployeeCode(selectedEmployee);

      employeeName = getEmployeeName(selectedEmployee);
    }

    // ===============================================
    // USER ID
    // ===============================================

    const userId =
      localStorage.getItem("user_id") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("id");

    // ===============================================
    // PAYLOAD
    // ===============================================

    const payload = {
      emp_id: Number(form.employeeId),

      emp_code: employeeCode || null,

      emp_name: employeeName || null,

      from_date: form.fromDate,

      to_date: form.leaveType === "HALF_DAY" ? form.fromDate : form.toDate,

      from_time: form.leaveType === "HALF_DAY" ? form.halfDayTime : null,

      to_time: null,

      type: form.leaveType,

      reason: form.reason.trim(),

      created_by: userId ? Number(userId) : null,
    };

    console.log("====================================");

    console.log(isEditMode ? "UPDATE LEAVE PAYLOAD:" : "ADD LEAVE PAYLOAD:");

    console.log(payload);

    console.log("====================================");

    try {
      setSubmitting(true);

      let response;

      // =============================================
      // EDIT MODE
      // =============================================

      if (isEditMode) {
        response = await axios.post(
          `${API_URL}/api/employee-leave/updateEmployeeLeave/${id}`,

          payload,

          getAuthHeaders(),
        );
      }

      // =============================================
      // ADD MODE
      // =============================================
      else {
        response = await axios.post(
          `${API_URL}/api/employee-leave/addEmployeeLeave`,

          payload,

          getAuthHeaders(),
        );
      }

      console.log(
        "LEAVE RESPONSE:",

        response.data,
      );

      if (response.data?.success === false || response.data?.error === true) {
        throw new Error(response.data?.message || "Failed to save leave");
      }

      alert(
        response.data?.message ||
          (isEditMode
            ? "Leave updated successfully"
            : "Leave applied successfully"),
      );

      navigate("/Leaves-management");
   } catch (error) {
  console.error("SAVE LEAVE ERROR:", error.response?.data || error);

  if (handleAuthError(error, navigate)) return;

  alert(
    error.response?.data?.message ||
      error.message ||
      "Failed to save leave"
  );
} finally {
  setSubmitting(false);
}
  };

  // =====================================================
  // SELECTED EMPLOYEE OPTION
  // =====================================================

  const selectedEmployeeOption =
    employeeOptions.find(
      (option) => String(option.value) === String(form.employeeId),
    ) || null;

  // =====================================================
  // REACT SELECT STYLES
  // =====================================================

  const employeeSelectStyles = {
    control: (provided, state) => ({
      ...provided,

      minHeight: "38px",

      borderColor: state.isFocused ? "#86b7fe" : "#ced4da",

      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(13,110,253,.15)" : "none",

      fontSize: "13px",
    }),

    menu: (provided) => ({
      ...provided,

      zIndex: 9999,
    }),

    menuPortal: (provided) => ({
      ...provided,

      zIndex: 9999,
    }),
  };

  // =====================================================
  // LOADING LEAVE
  // =====================================================

  if (loadingLeave) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          Loading Leave Details...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        card
        form-panel
      "
      style={{
        fontSize: "13px",
      }}
    >
      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="card-header">
        <div
          className="
            d-flex
            justify-content-between
            align-items-center
          "
        >
          <h5 className="mb-0">{isEditMode ? "Edit Leave" : "Apply Leave"}</h5>

          <button
            type="button"
            className="
              btn
              btn-outline-primary
              btn-sm
            "
            onClick={() => navigate("/Leaves-management")}
          >
            Leave List
          </button>
        </div>
      </div>

      {/* ===============================================
          BODY
      =============================================== */}

      <div className="card-body">
        {/* ===============================================
            EARNED LEAVE BALANCE
        =============================================== */}
        {form.employeeId && (
          <div className="alert alert-light border py-2 px-3 mb-3 d-flex justify-content-between align-items-center">
            <span>
              <strong>Available Earned Leave:</strong>{" "}
              {loadingBalance ? "Loading..." : (availableLeave ?? "-")}
            </span>
            {!loadingBalance && availableLeave !== null && (
              <span className="text-muted small">
                
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* EMPLOYEE */}

            <div className="mb-3 col-md-4">
              <label className="form-label">
                Employee
                <span className="text-danger">{" *"}</span>
              </label>

              <Select
                options={employeeOptions}
                value={selectedEmployeeOption}
                onChange={handleEmployeeChange}
                isLoading={loadingEmployees}
                isDisabled={loadingEmployees || submitting}
                isSearchable
                isClearable
                placeholder="Search Employee..."
                filterOption={filterEmployeeOption}
                styles={employeeSelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            {/* LEAVE TYPE */}

            <div className="mb-3 col-md-4">
              <label className="form-label">
                Leave Type
                <span className="text-danger">{" *"}</span>
              </label>

              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleLeaveTypeChange}
                className="form-select"
                disabled={submitting}
              >
                <option value="">Select Leave Type</option>

                <option value="CL">Casual Leave (CL)</option>

                <option value="SL">Sick Leave (SL)</option>

                <option value="PL">Privilege Leave (PL)</option>

                <option value="ML">Medical Leave (ML)</option>

                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>

            {/* FROM DATE */}

            <div className="mb-3 col-md-4">
              <label className="form-label">
                From Date
                <span className="text-danger">{" *"}</span>
              </label>

              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                min={getTodayDate()}
                onChange={handleFromDateChange}
                className="form-control"
                disabled={submitting}
              />
            </div>

            {/* TO DATE */}

            {form.leaveType !== "HALF_DAY" && (
              <div className="mb-3 col-md-4">
                <label className="form-label">
                  To Date
                  <span className="text-danger">{" *"}</span>
                </label>

                <input
                  type="date"
                  name="toDate"
                  value={form.toDate}
                  min={form.fromDate || getTodayDate()}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                />
              </div>
            )}

            {/* HALF DAY */}

            {form.leaveType === "HALF_DAY" && (
              <div className="mb-3 col-md-4">
                <label className="form-label">
                  Half Day Time
                  <span className="text-danger">{" *"}</span>
                </label>

                <select
                  name="halfDayTime"
                  value={form.halfDayTime}
                  onChange={handleChange}
                  className="form-select"
                  disabled={submitting}
                >
                  <option value="">Select Time</option>

                  <option value="FIRST_HALF">First Half</option>

                  <option value="SECOND_HALF">Second Half</option>
                </select>
              </div>
            )}

            {/* TOTAL DAYS */}

            {form.fromDate && form.leaveType && (
              <div className="mb-3 col-md-4">
                <label className="form-label">Total Days</label>

                <input
                  type="text"
                  className="form-control"
                  value={calculateDays()}
                  readOnly
                />
              </div>
            )}

            {/* REASON */}

            <div className="mb-3 col-md-8">
              <label className="form-label">
                Reason
                <span className="text-danger">{" *"}</span>
              </label>

              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Enter leave reason"
                disabled={submitting}
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/Leaves-management")}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loadingEmployees}
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Applying..."
                : isEditMode
                  ? "Update Leave"
                  : "Apply Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
