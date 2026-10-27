import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function AttendancePage({ setShowAttendancePage }) {
  // ===============================
  // STATES
  // ===============================
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [showDoubleDutyModal, setShowDoubleDutyModal] = useState(false);
  const [doubleDutyRow, setDoubleDutyRow] = useState(null);
  const [doubleDutyForm, setDoubleDutyForm] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  const [attendanceRows, setAttendanceRows] = useState([]);

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [attendanceStatus, setAttendanceStatus] = useState("P");

  const [checkInTime, setCheckInTime] = useState("");

  const [checkOutTime, setCheckOutTime] = useState("");

  const [checkOutDate, setCheckOutDate] = useState(attendanceDate);

  const [hasExistingAttendance] = useState(false);
  const statusOptions = [
    { value: "P", label: "Present (P)" },
    { value: "A", label: "Absent (A)" },
    { value: "W", label: "Weekly Off (W)" },
    { value: "H", label: "Holiday (H)" },
    { value: "CL", label: "Casual Leave (CL)" },
    { value: "SL", label: "Sick Leave (SL)" },
    { value: "PL", label: "Privilege Leave (PL)" },
    { value: "ML", label: "Maternity Leave (ML)" },
  ];

  const noTimeStatuses = ["A", "W", "H", "CL", "SL", "PL", "ML"];
  const timeOptions = [
    { value: "", label: "Select Time" },

    ...Array.from({ length: 24 * 60 }, (_, i) => {
      const hour = String(Math.floor(i / 60)).padStart(2, "0");
      const minute = String(i % 60).padStart(2, "0");

      return {
        value: `${hour}:${minute}`,
        label: `${hour}:${minute}`,
      };
    }),
  ];
  const [editRow, setEditRow] = useState(null);

  const updateRow = (index, field, value) => {
    setAttendanceRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updatedRow = {
          ...row,
          [field]: value,
        };

        const { workedHours, otHours } = calculateHours(
          updatedRow.checkIn,
          updatedRow.checkOut,
          updatedRow.checkInDate || attendanceDate,
          updatedRow.checkOutDate || attendanceDate,
          updatedRow.siteHours,
        );

        updatedRow.workedHours = workedHours;
        updatedRow.otHours = otHours;

        return updatedRow;
      }),
    );
  };

  const decimalToHHMM = (hours) => {
    const totalMinutes = Math.round(Number(hours || 0) * 60);

    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;

    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  const getCurrentISTTime = () => {
    const now = new Date();

    const ist = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    );

    const hour = String(ist.getHours()).padStart(2, "0");
    const minute = String(ist.getMinutes()).padStart(2, "0");

    return `${hour}:${minute}`;
  };

  const getCheckInTimeOptions = (selectedDate) => {
    const currentTime = getCurrentISTTime();

    // आजची date असेल तर current IST पर्यंत time दाखवा
    if (selectedDate === currentDate) {
      return timeOptions.filter(
        (time) => time.value === "" || time.value <= currentTime,
      );
    }

    // जुनी date असेल तर full time
    return timeOptions;
  };
  const getCheckOutTimeOptions = (checkInTime, checkInDate, checkOutDate) => {
    if (!checkInTime) {
      return timeOptions;
    }

    const currentTime = getCurrentISTTime();

    // जर Check-Out उद्याच्या दिवशी असेल तर सर्व time
    if (checkInDate !== checkOutDate) {
      return timeOptions;
    }

    // आजची date असेल तर Check-In नंतर आणि Current Time पर्यंत
    if (checkOutDate === currentDate) {
      return timeOptions.filter(
        (time) =>
          time.value === "" ||
          (time.value >= checkInTime && time.value <= currentTime),
      );
    }

    // जुनी date असेल तर Check-In नंतरचे सर्व time
    return timeOptions.filter(
      (time) => time.value === "" || time.value >= checkInTime,
    );
  };
  const calculateHours = (
    checkIn,
    checkOut,
    checkInDate,
    checkOutDate,
    siteHours,
  ) => {
    if (!checkIn || !checkOut) {
      return {
        workedHours: "0.00",
        otHours: "0.00",
      };
    }

    const inDateTime = new Date(`${checkInDate}T${checkIn}:00`);
    const outDateTime = new Date(`${checkOutDate}T${checkOut}:00`);

    let diff = (outDateTime - inDateTime) / (1000 * 60 * 60);

    if (diff < 0) diff = 0;

    const worked = diff.toFixed(2);

    const ot = Math.max(diff - Number(siteHours || 0), 0).toFixed(2);

    return {
      workedHours: worked,
      otHours: ot,
    };
  };

  const updateDoubleDuty = (field, value) => {
    setDoubleDutyForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      const { workedHours, otHours } = calculateHours(
        updated.checkIn,
        updated.checkOut,
        attendanceDate,
        updated.checkOutDate || attendanceDate,
        updated.siteHours,
      );

      return {
        ...updated,
        workedHours,
        otHours,
      };
    });
  };
  const toggleEmployee = (index) => {
    setAttendanceRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const checked = !row.isChecked;

        const updatedRow = {
          ...row,
          isChecked: checked,
        };

        // Only apply common attendance for NEW records
        if (checked && !row.attendanceId) {
          updatedRow.status = attendanceStatus;
          updatedRow.checkInDate = attendanceDate;
          updatedRow.checkOutDate = checkOutDate;
          updatedRow.checkIn = noTimeStatuses.includes(attendanceStatus)
            ? ""
            : checkInTime;
          updatedRow.checkOut = noTimeStatuses.includes(attendanceStatus)
            ? ""
            : checkOutTime;
        }

        const { workedHours, otHours } = calculateHours(
          updatedRow.checkIn,
          updatedRow.checkOut,
          updatedRow.checkInDate,
          updatedRow.checkOutDate,
          updatedRow.siteHours,
        );

        updatedRow.workedHours = workedHours;
        updatedRow.otHours = otHours;

        return updatedRow;
      }),
    );
  };

  const handleApplyToSelected = () => {
    setAttendanceRows((prev) =>
      prev.map((row) => {
        if (!row.isChecked) return row;

        return {
          ...row,
          status: attendanceStatus,
          checkInDate: attendanceDate,
          checkOutDate: checkOutDate,
          checkIn: noTimeStatuses.includes(attendanceStatus) ? "" : checkInTime,
          checkOut: noTimeStatuses.includes(attendanceStatus)
            ? ""
            : checkOutTime,
        };
      }),
    );
  };

  const handleSelectAll = (checked) => {
    setAttendanceRows((prev) =>
      prev.map((row) => ({
        ...row,
        isChecked: checked,

        ...(checked && {
          status: attendanceStatus,
          checkInDate: attendanceDate,
          checkOutDate,
          checkIn: noTimeStatuses.includes(attendanceStatus) ? "" : checkInTime,
          checkOut: noTimeStatuses.includes(attendanceStatus)
            ? ""
            : checkOutTime,
        }),
      })),
    );
  };

  const handleSaveAll = async () => {
    try {
      const selectedRows = attendanceRows.filter((row) => row.isChecked);

      if (selectedRows.length === 0) {
        alert("Please select employee");
        return;
      }

      if (!selectedClient) {
        alert("Please select client");
        return;
      }

      if (!selectedSite) {
        alert("Please select site");
        return;
      }

      const validateDateTime = selectedRows.some((row) => {
        if (noTimeStatuses.includes(row.status)) {
          return false;
        }

        const finalCheckInDate = row.checkInDate || attendanceDate;

        const finalCheckOutDate = row.checkOutDate || checkOutDate;

        const finalCheckInTime = row.checkIn || checkInTime;

        const finalCheckOutTime = row.checkOut || checkOutTime;

        if (!finalCheckInDate) {
          alert("Check-In Date is required");
          return true;
        }

        if (!finalCheckInTime) {
          alert("Check-In Time is required");
          return true;
        }

        if (!finalCheckOutDate) {
          alert("Check-Out Date is required");
          return true;
        }

        if (!finalCheckOutTime) {
          alert("Check-Out Time is required");
          return true;
        }

        return false;
      });

      if (validateDateTime) {
        return;
      }

      const payload = selectedRows.map((row) => {
        let finalStatus = row.status || "A";

        let finalCheckIn = row.checkIn || checkInTime;

        let finalCheckOut = row.checkOut || checkOutTime;

        let finalCheckInDate = row.checkInDate || attendanceDate;

        let finalCheckOutDate = row.checkOutDate || checkOutDate;

        let workedHours = 0;
        let otHours = 0;

        // ===============================
        // NO TIME STATUS
        // ===============================

        if (noTimeStatuses.includes(finalStatus)) {
          finalCheckIn = null;

          finalCheckOut = null;

          finalCheckOutDate = null;

          workedHours = 0;

          otHours = 0;
        } else {
          const hours = calculateHours(
            finalCheckIn,

            finalCheckOut,

            finalCheckInDate,

            finalCheckOutDate,

            row.siteHours,
          );

          workedHours = hours.workedHours;

          otHours = hours.otHours;

          const workedMinutes = Number(workedHours) * 60;

          const requiredMinutes = Number(row.siteHours || 0) * 60;

          if (workedMinutes >= requiredMinutes - 15) {
            finalStatus = "P";
          } else {
            finalStatus = "A";
          }
        }

        return {
          employee_id: row.employeeId,

          emp_code: row.employeeCode,

          rank: row.rank,

          emp_name: row.employeeName,

          client_id: selectedClient.value,

          client_name: selectedClient.label,

          client_code:
            selectedClient?.client_code || selectedClient?.clientCode || "",

          site_id: selectedSite.value,

          site_name: selectedSite.label,

          branch_name:
            selectedSite?.branch_name || selectedSite?.branchName || "",

          check_in_date: finalCheckInDate,

          check_in_time: finalCheckIn,

          check_out_date: finalCheckOutDate,

          check_out_time: finalCheckOut,

          site_hours: Number(row.siteHours || 0),

          emp_worked_hours: Number(workedHours),

          ot_hours: Number(otHours),

          emp_status: finalStatus,

          source: "web",

          checkout_source: "web",

          emp_remark: "Manual Attendance",
        };
      });

      console.log("Attendance Payload:", payload);

      const res = await axios.post(
        `${API_URL}/api/attendance/add-attendance`,

        payload,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      alert(res.data.message);

      fetchAttendance();

} catch (error) {
  console.log("Save Attendance Error:", error);

  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  alert(error.response?.data?.message || "Attendance save failed");
}
  }
  const handleUpdateAttendance = async (row) => {
    try {
      // =====================================
      // FINAL VALUES
      // =====================================

      const checkInDate = row.checkInDate || attendanceDate;

      const checkInTime = row.checkIn || "";

      const checkOutDate = row.checkOutDate || "";

      const checkOutTime = row.checkOut || "";

      const status = row.status || "A";

      // =====================================
      // NO TIME STATUS
      // =====================================

      const isNoTimeStatus = noTimeStatuses.includes(status);

      // =====================================
      // VALIDATION FOR PRESENT
      // =====================================

      if (!isNoTimeStatus) {
        if (!checkInDate) {
          alert("Please select Check-In Date");
          return;
        }

        if (!checkInTime) {
          alert("Please select Check-In Time");
          return;
        }

        if (!checkOutDate) {
          alert("Please select Check-Out Date");
          return;
        }

        if (!checkOutTime) {
          alert("Please select Check-Out Time");
          return;
        }

        // =====================================
        // DATE + TIME VALIDATION
        // =====================================

        const checkInDateTime = new Date(`${checkInDate}T${checkInTime}:00`);

        const checkOutDateTime = new Date(`${checkOutDate}T${checkOutTime}:00`);

        // Invalid Date Check
        if (
          isNaN(checkInDateTime.getTime()) ||
          isNaN(checkOutDateTime.getTime())
        ) {
          alert("Invalid Check-In or Check-Out Date/Time");
          return;
        }

        // Check-Out Before Check-In
        if (checkOutDateTime <= checkInDateTime) {
          alert(
            "Check-Out Date and Time must be after Check-In Date and Time.",
          );
          return;
        }
      }

      // =====================================
      // CALCULATE HOURS
      // =====================================

      let workedHours = 0;
      let otHours = 0;

      if (!isNoTimeStatus) {
        const hours = calculateHours(
          checkInTime,
          checkOutTime,
          checkInDate,
          checkOutDate,
          row.siteHours,
        );

        workedHours = Number(hours.workedHours);
        otHours = Number(hours.otHours);
      }

      // =====================================
      // PAYLOAD
      // =====================================

      const payload = {
        attendance_id: row.attendanceId,

        employee_id: row.employeeId,
        emp_code: row.employeeCode,
        emp_name: row.employeeName,

        client_id: row.clientId || selectedClient?.value,

        client_code: row.clientCode || selectedClient?.client_code || "",

        client_name: row.clientName || selectedClient?.label || "",

        site_id: row.siteId || selectedSite?.value,

        site_name: row.siteName || selectedSite?.label || "",

        branch_name: row.branchName || selectedSite?.branch_name || "",

        // =====================================
        // ATTENDANCE DATA
        // =====================================

        check_in_date: checkInDate,

        check_in_time: isNoTimeStatus ? null : checkInTime,

        check_out_date: isNoTimeStatus ? null : checkOutDate,

        check_out_time: isNoTimeStatus ? null : checkOutTime,

        site_hours: Number(row.siteHours || 0),

        emp_worked_hours: workedHours,

        ot_hours: otHours,

        emp_status: status,
      };

      console.log("UPDATE ATTENDANCE DATA:", JSON.stringify(payload, null, 2));

      // =====================================
      // API CALL
      // =====================================

      const res = await axios.post(
        `${API_URL}/api/attendance/updateAttendance/${row.attendanceId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      // =====================================
      // SUCCESS
      // =====================================

      alert(res.data.message || "Attendance Updated Successfully");

      setEditRow(null);

      fetchAttendance();
  
} catch (err) {
  console.log("UPDATE ATTENDANCE ERROR:", err);

  console.log("UPDATE ERROR RESPONSE:", err.response?.data);

  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  alert(err.response?.data?.message || "Update Failed");
}
};

  console.log("SELECTED CLIENT =>", selectedClient);
  console.log("SELECTED SITE =>", selectedSite);
  console.log("CLIENT CODE =>", selectedClient?.client_code);
  console.log("BRANCH NAME =>", selectedSite?.branch_name);
  const saveDoubleDuty = async () => {
    try {
      if (!doubleDutyForm) {
        alert("Double Duty data missing");
        return;
      }

      // ===============================
      // VALIDATION
      // ===============================

      if (!doubleDutyForm.checkIn) {
        alert("Please select Double Duty Check-In Time");
        return;
      }

      if (!doubleDutyForm.checkOut) {
        alert("Please select Double Duty Check-Out Time");
        return;
      }

      if (!selectedClient) {
        alert("Client not selected");
        return;
      }

      if (!selectedSite) {
        alert("Site not selected");
        return;
      }

      // ===============================
      // CALCULATE HOURS
      // ===============================

      const { workedHours, otHours } = calculateHours(
        doubleDutyForm.checkIn,

        doubleDutyForm.checkOut,

        attendanceDate,

        doubleDutyForm.checkOutDate || attendanceDate,

        doubleDutyForm.siteHours,
      );

      // ===============================
      // PAYLOAD
      // ===============================

      const payload = [
        {
          employee_id: doubleDutyForm.employeeId,

          emp_code: doubleDutyForm.employeeCode,

          emp_name: doubleDutyForm.employeeName,

          client_id: selectedClient.value,

          client_name: selectedClient.label,

          client_code: selectedClient.client_code || "",

          site_id: selectedSite.value,

          site_name: selectedSite.label,

          branch_name: selectedSite.branch_name || "",

          check_in_date: attendanceDate,

          check_in_time: doubleDutyForm.checkIn,

          check_out_date: doubleDutyForm.checkOutDate || attendanceDate,

          rank: doubleDutyForm.rank,
          check_out_time: doubleDutyForm.checkOut,

          site_hours: Number(doubleDutyForm.siteHours || 0),

          emp_worked_hours: Number(workedHours),

          ot_hours: Number(otHours),

          emp_status: "P",

          source: "web",

          checkout_source: "web",

          emp_remark: "Double Duty Attendance",
        },
      ];

      console.log("DOUBLE DUTY PAYLOAD:", payload);

      // ===============================
      // API CALL
      // ===============================

      const res = await axios.post(
        `${API_URL}/api/attendance/add-attendance`,

        payload,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("DOUBLE DUTY SUCCESS:", res.data);

      alert(res.data.message || "Double Duty Saved Successfully");

      setShowDoubleDutyModal(false);

      setDoubleDutyForm(null);

      fetchAttendance();
    } catch (error) {
      // ===============================
      // BACKEND ERROR SHOW
      // ===============================

      console.log("DOUBLE DUTY ERROR FULL:", error);

      console.log("DOUBLE DUTY ERROR RESPONSE:", error.response?.data);

      console.log("DOUBLE DUTY STATUS:", error.response?.status);

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Double Duty failed",
      );
    }
  };
  // ===============================
  // DATE HELPERS
  // ===============================
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = new Date();

  const currentDate = formatDate(today);

  const firstDayOfMonth = formatDate(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

const displayDate = (date) => {
  if (!date) return "";

  const datePart = String(date).split("T")[0];
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return date;

  return `${day}-${month}-${year}`;
};

  // ===============================
  // CLIENT DROPDOWN
  // ===============================
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/clients/dropdown`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("CLIENT API DATA:", res.data.data);

      setClients(res.data.data || []);
    } catch (err) {
      console.log("Client Error :", err);
    }
  };

  // ===============================
  // SITE DROPDOWN
  // ===============================
  useEffect(() => {
    if (!selectedClient) {
      setSites([]);
      setSelectedSite(null);
      return;
    }

    fetchSites();
  }, [selectedClient]);

  const fetchSites = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/clients/sites-dropdown`, {
        params: {
          client_id: selectedClient.value,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSites(res.data.data || []);
      setSelectedSite(null);
    } catch (err) {
      console.log("Site Error :", err);
    }
  };

  // ===============================
  // FETCH ATTENDANCE
  // ===============================
  useEffect(() => {
    if (selectedSite && attendanceDate) {
      fetchAttendance();
    }
  }, [selectedSite, attendanceDate]);

  const fetchAttendance = async () => {
    try {
      console.log("========================================");
      console.log("📌 FETCH ATTENDANCE START");
      console.log("Selected Site Object =>", selectedSite);
      console.log("Selected Site ID =>", selectedSite?.value);
      console.log("Selected Site Name =>", selectedSite?.label);
      console.log("Attendance Date =>", attendanceDate);
      console.log("========================================");

      const res = await axios.get(
        `${API_URL}/api/attendance/get-attendance-by-date`,
        {
          params: {
            siteId: selectedSite.value,
            date: attendanceDate,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("========================================");
      console.log("✅ ATTENDANCE API RESPONSE");
      console.log("Full Response =>", res.data);
      console.log("Response Data =>", res.data.data);
      console.log(
        "Employee Count =>",
        Array.isArray(res.data.data) ? res.data.data.length : 0,
      );
      console.log("========================================");

      const data = res.data.data || [];

      if (data.length === 0) {
        console.warn("⚠️ NO EMPLOYEE FOUND FOR THIS SITE");
        console.warn("Site ID Sent =>", selectedSite?.value);
        console.warn("Site Name =>", selectedSite?.label);
        console.warn("Date =>", attendanceDate);
      }

      // 🔍 Check every employee received from backend
      data.forEach((emp, index) => {
        console.log(`👤 Employee ${index + 1}`, {
          employeeId: emp.employee_id,
          employeeCode: emp.employee_code,
          employeeName: emp.emp_full_name,
          siteId: emp.site_id,
          clientId: emp.client_id,
          rank: emp.rank,
          status: emp.status,
        });
      });

      const rows = data.map((emp) => ({
        attendanceId: emp.emp_attendance_id,

        employeeId: emp.employee_id,
        employeeCode: emp.employee_code,
        employeeName: emp.emp_full_name,

        rank: emp.rank,
        clientId: emp.client_id,
        siteId: emp.site_id,

        status: emp.status || "",

        checkInDate: emp.check_in_date ? emp.check_in_date.split("T")[0] : "",

        checkOutDate: emp.check_out_date
          ? emp.check_out_date.split("T")[0]
          : "",

        checkIn: emp.check_in_time || "",
        checkOut: emp.check_out_time || "",

        originalCheckInDate: emp.check_in_date
          ? emp.check_in_date.split("T")[0]
          : "",

        originalCheckOutDate: emp.check_out_date
          ? emp.check_out_date.split("T")[0]
          : "",

        originalCheckIn: emp.check_in_time || "",
        originalCheckOut: emp.check_out_time || "",

        siteHours: emp.site_hours || 0,
        workedHours: Number(emp.emp_worked_hours || 0).toFixed(2),
        otHours: Number(emp.ot_hours || 0).toFixed(2),

        isChecked: false,
      }));

      console.log("========================================");
      console.log("📋 FINAL ATTENDANCE ROWS");
      console.log("Rows Count =>", rows.length);
      console.log("Rows =>", rows);

      // 🔍 Specifically check KURLA employees
      if (selectedSite?.value == 10) {
        console.log("========================================");
        console.log("🏢 KURLA CHECK");
        console.log("Expected Site ID => 10");
        console.log("Received Employee Count =>", rows.length);

        rows.forEach((emp) => {
          console.log(
            `KURLA Employee => ID:${emp.employeeId} | Code:${emp.employeeCode} | Name:${emp.employeeName} | Site:${emp.siteId}`,
          );
        });

        console.log("========================================");
      }

      setAttendanceRows(rows);

      console.log("✅ setAttendanceRows() CALLED");
      console.log("========================================");
    } catch (err) {
      console.error("❌ Attendance Error :", err);

      console.error("❌ API Error Response =>", err.response?.data);

      console.error("❌ API Status =>", err.response?.status);

      console.error("❌ Request Params =>", {
        siteId: selectedSite?.value,
        siteName: selectedSite?.label,
        date: attendanceDate,
      });
    }
  };
  // const fetchAttendance = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${API_URL}/api/attendance/get-attendance-by-date`,
  //       {
  //         params: {
  //           siteId: selectedSite.value,
  //           date: attendanceDate,
  //         },
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       },
  //     );

  //     console.log("ATTENDANCE RESPONSE =>", res.data.data);

  //     const data = res.data.data || [];

  //     const rows = data.map((emp) => ({
  //       attendanceId: emp.emp_attendance_id,

  //       employeeId: emp.employee_id,
  //       employeeCode: emp.employee_code,
  //       employeeName: emp.emp_full_name,

  //       rank: emp.rank,
  //       clientId: emp.client_id,
  //       siteId: emp.site_id,

  //       status: emp.status || "",

  //       checkInDate: emp.check_in_date ? emp.check_in_date.split("T")[0] : "",

  //       checkOutDate: emp.check_out_date
  //         ? emp.check_out_date.split("T")[0]
  //         : "",

  //       checkIn: emp.check_in_time || "",
  //       checkOut: emp.check_out_time || "",

  //       // ⭐ Add these
  //       originalCheckInDate: emp.check_in_date
  //         ? emp.check_in_date.split("T")[0]
  //         : "",

  //       originalCheckOutDate: emp.check_out_date
  //         ? emp.check_out_date.split("T")[0]
  //         : "",

  //       originalCheckIn: emp.check_in_time || "",
  //       originalCheckOut: emp.check_out_time || "",

  //       siteHours: emp.site_hours || 0,
  //       workedHours: Number(emp.emp_worked_hours || 0).toFixed(2),
  //       otHours: Number(emp.ot_hours || 0).toFixed(2),

  //       isChecked: false,
  //     }));

  //     setAttendanceRows(rows);
  //   } catch (err) {
  //     console.log("Attendance Error :", err);
  //   }
  // };
  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark">Attendance Management</h4>
        </div>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setShowAttendancePage(false)}
        >
          &larr; Back
        </button>
      </div>

      {/* Filter Card */}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-4 text-primary">Attendance Filter</h5>

          <div className="row g-3">
            {/* Client */}
            <div className="col-md-4">
              <label className="form-label fw-bold">Client</label>

              <Select
                options={clients.map((item) => ({
                  value: item.id,
                  label: item.company_name,
                  client_code: item.client_code || "",
                }))}
                value={selectedClient}
                onChange={setSelectedClient}
                isSearchable
                placeholder="Select Client"
              />
            </div>

            {/* Site */}
            <div className="col-md-4">
              <label className="form-label fw-bold">Site</label>
              <Select
                options={sites.map((item) => ({
                  value: item.id,
                  label: item.site_name,
                  branch_name: item.cc_branch_name || "",
                }))}
                value={selectedSite}
                onChange={setSelectedSite}
                isDisabled={!selectedClient}
                isSearchable
                placeholder="Select Site"
              />
            </div>

            {/* Attendance Date */}
          <div className="col-md-4">
  <label className="form-label fw-bold">Attendance Date</label>

  <div className="position-relative">
    <input
      type="text"
      className="form-control"
      value={displayDate(attendanceDate)}
      placeholder="DD-MM-YYYY"
      readOnly
      onClick={() => {
        document.getElementById("attendanceDatePicker")?.showPicker();
      }}
    />

    <input
      id="attendanceDatePicker"
      type="date"
      value={attendanceDate}
      min={firstDayOfMonth}
      max={currentDate}
      onChange={(e) => {
        setAttendanceDate(e.target.value);
        setCheckOutDate(e.target.value);
        setCheckInTime("");
        setCheckOutTime("");
      }}
      style={{
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "30px",
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  </div>
</div>
          </div>

          <hr className="my-4" />

          <h6 className="text-primary fw-bold mb-3">Attendance Details</h6>

          <div className="row g-3">
            {/* Status */}
            <div className="col-md-2">
              <label className="form-label small fw-bold">Status</label>

              <select
                className="form-select"
                value={attendanceStatus}
                onChange={(e) => {
                  setAttendanceStatus(e.target.value);
                  setCheckInTime("");
                  setCheckOutTime("");
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Check In Date */}
           <div className="col-md-2">
  <label className="form-label small fw-bold">Check-In Date</label>

  <input
    type="text"
    className="form-control"
    value={displayDate(attendanceDate)}
    readOnly
  />
</div>

            {/* Check In Time */}
            <div className="col-md-2">
              <label className="form-label small fw-bold">Check-In Time</label>

              <Select
                options={getCheckInTimeOptions(attendanceDate)}
                value={
                  timeOptions.find((t) => t.value === checkInTime) ||
                  timeOptions[0]
                }
                onChange={(selected) => {
                  setCheckInTime(selected?.value || "");
                  setCheckOutTime("");
                }}
                isSearchable
                placeholder="Select Check-In Time"
                isDisabled={noTimeStatuses.includes(attendanceStatus)}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            {/* Check Out Date */}
            <div className="col-md-2">
              <label className="form-label small fw-bold">Check-Out Date</label>

              <select
                className="form-select"
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  setCheckOutTime("");
                }}
                disabled={noTimeStatuses.includes(attendanceStatus)}
              >
                <option value={attendanceDate}>
                  {displayDate(attendanceDate)}
                </option>

                {!noTimeStatuses.includes(attendanceStatus) &&
                  (() => {
                    const nextDate = new Date(attendanceDate);
                    nextDate.setDate(nextDate.getDate() + 1);

                    const next = nextDate.toISOString().split("T")[0];

                    if (next <= currentDate) {
                      return <option value={next}>{displayDate(next)}</option>;
                    }

                    return null;
                  })()}
              </select>
            </div>

            {/* Check Out Time */}
            <div className="col-md-2">
              <label className="form-label small fw-bold">Check-Out Time</label>

              <Select
                options={getCheckOutTimeOptions(
                  checkInTime,
                  attendanceDate,
                  checkOutDate,
                )}
                value={
                  getCheckOutTimeOptions(
                    checkInTime,
                    attendanceDate,
                    checkOutDate,
                  ).find((t) => t.value === checkOutTime) || timeOptions[0]
                }
                onChange={(selected) => setCheckOutTime(selected?.value || "")}
                isSearchable
                placeholder={
                  !checkInTime
                    ? "Select Check-In Time First"
                    : "Select Check-Out Time"
                }
                isDisabled={
                  noTimeStatuses.includes(attendanceStatus) || !checkInTime
                }
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            {/* Save Button */}
            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleSaveAll}
              >
                {hasExistingAttendance
                  ? "Update Attendance"
                  : "Save Attendance"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="text-primary mb-3">Attendance List</h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Check-In Date</th>
                  <th>Check-In</th>
                  <th>Check-Out Date</th>
                  <th>Check-Out</th>
                  <th>Site Hours</th>
                  <th>Worked Hours</th>
                  <th>OT Hours</th>
                  <th>Status</th>

                  {attendanceRows.some((row) => row.attendanceId) && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {attendanceRows.map((row, index) => (
                  <tr
                    key={row.employeeId}
                    style={{
                      backgroundColor:
                        row.attendanceId && editRow !== index
                          ? "#ffd6d6"
                          : row.isChecked
                            ? "#e8f4ff"
                            : "",
                    }}
                  >
                    {/* Checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={row.isChecked || false}
                        onChange={() => toggleEmployee(index)}
                      />
                    </td>

                    {/* Employee Code */}
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleEmployee(index)}
                    >
                      {row.employeeCode}
                    </td>

                    {/* Employee Name */}
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleEmployee(index)}
                    >
                      {row.employeeName}
                    </td>

                    {/* Check In Date */}
               <td>
  {row.attendanceId && editRow !== index ? (
    <span className="text-danger fw-bold">
      {displayDate(row.checkInDate || attendanceDate) || "--"}
    </span>
  ) : (
    <input
      type="text"
      className="form-control form-control-sm"
      value={displayDate(row.checkInDate || attendanceDate)}
      readOnly
    />
  )}
</td>

                    {/* Check In Time */}
                    <td style={{ minWidth: "130px" }}>
                      {row.attendanceId && editRow !== index ? (
                        <span className="text-danger fw-bold">
                          {row.checkIn || "--"}
                        </span>
                      ) : (
                        <Select
                          options={getCheckInTimeOptions(
                            row.checkInDate || attendanceDate,
                          )}
                          value={
                            timeOptions.find((t) => t.value === row.checkIn) ||
                            timeOptions[0]
                          }
                          onChange={(selected) =>
                            updateRow(index, "checkIn", selected?.value || "")
                          }
                          isSearchable
                          isDisabled={noTimeStatuses.includes(row.status)}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />
                      )}
                    </td>

                    {/* Check Out Date */}
                    <td>
                      {row.attendanceId && editRow !== index ? (
                   <span className="text-danger fw-bold">
  {displayDate(row.checkOutDate) || "--"}
</span>
                      ) : (
                        <select
                          className="form-select"
                          value={
                            row.checkOutDate ||
                            row.checkInDate ||
                            attendanceDate
                          }
                          onChange={(e) =>
                            updateRow(index, "checkOutDate", e.target.value)
                          }
                          disabled={noTimeStatuses.includes(row.status)}
                        >
                          {/* Same Day */}
                          <option value={row.checkInDate || attendanceDate}>
                            {displayDate(row.checkInDate || attendanceDate)}
                          </option>

                          {/* Next Day */}
                          {(() => {
                            const baseDate = row.checkInDate || attendanceDate;

                            const nextDate = new Date(baseDate + "T00:00:00");

                            nextDate.setDate(nextDate.getDate() + 1);

                            const next = formatDate(nextDate);

                            if (next <= currentDate) {
                              return (
                                <option value={next}>
                                  {displayDate(next)}
                                </option>
                              );
                            }

                            return null;
                          })()}
                        </select>
                      )}
                    </td>

                    {/* Check Out Time */}
                    <td style={{ minWidth: "130px" }}>
                      {row.attendanceId && editRow !== index ? (
                        <span className="text-danger fw-bold">
                          {row.checkOut || "--"}
                        </span>
                      ) : (
                        <Select
                          options={getCheckOutTimeOptions(
                            row.checkIn,
                            row.checkInDate || attendanceDate,
                            row.checkOutDate || attendanceDate,
                          )}
                          value={
                            timeOptions.find((t) => t.value === row.checkOut) ||
                            timeOptions[0]
                          }
                          onChange={(selected) =>
                            updateRow(index, "checkOut", selected?.value || "")
                          }
                          isSearchable
                          isDisabled={
                            noTimeStatuses.includes(row.status) || !row.checkIn
                          }
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />
                      )}
                    </td>

                    {/* Site Hours */}
                    <td>{row.siteHours || 0}</td>

                    {/* Worked Hours */}
                    <td>{decimalToHHMM(row.workedHours)}</td>

                    {/* OT Hours */}
                    <td>{decimalToHHMM(row.otHours)}</td>

                    {/* Status */}
                    <td>
                      {row.attendanceId && editRow !== index ? (
                        <span className="text-danger fw-bold">
                          {row.status}
                        </span>
                      ) : (
                        <select
                          className="form-select form-select-sm"
                          value={row.status}
                          onChange={(e) => {
                            const status = e.target.value;

                            updateRow(index, "status", status);

                            if (noTimeStatuses.includes(status)) {
                              updateRow(index, "checkIn", "");
                              updateRow(index, "checkOut", "");
                            }
                          }}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Action */}
                    <td>
                      {row.attendanceId &&
                        (editRow === index ? (
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateAttendance(row)}
                            >
                              Save
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditRow(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <select
                            className="form-select form-select-sm"
                            defaultValue=""
                            onChange={(e) => {
                              const action = e.target.value;

                              if (action === "edit") {
                                setEditRow(index);
                              }

                              if (action === "doubleDuty") {
                                setDoubleDutyForm({
                                  ...row,

                                  oldCheckInDate: row.checkInDate,
                                  oldCheckIn: row.checkIn,
                                  oldCheckOutDate: row.checkOutDate,
                                  oldCheckOut: row.checkOut,

                                  checkIn: "",
                                  checkOut: "",

                                  checkOutDate: attendanceDate,

                                  workedHours: "0.00",
                                  otHours: "0.00",
                                });

                                setShowDoubleDutyModal(true);
                              }

                              e.target.value = "";
                            }}
                          >
                            <option value="">Select Action</option>
                            <option value="edit">Edit</option>
                            <option value="doubleDuty">Double Duty</option>
                          </select>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showDoubleDutyModal && doubleDutyForm && (
            <div
              className="modal show d-block"
              style={{
                background: "rgba(0,0,0,0.5)",
              }}
            >
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  {/* HEADER */}
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold text-primary">
                      Double Duty Attendance
                    </h5>

                    <button
                      className="btn-close"
                      onClick={() => {
                        setShowDoubleDutyModal(false);
                        setDoubleDutyForm(null);
                      }}
                    ></button>
                  </div>

                  {/* BODY */}

                  <div className="modal-body">
                    <div className="row g-3">
                      {/* Employee Code */}

                      <div className="col-md-4">
                        <label className="fw-bold">Employee Code</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.employeeCode || ""}
                          readOnly
                        />
                      </div>

                      {/* Employee Name */}

                      <div className="col-md-4">
                        <label className="fw-bold">Employee Name</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.employeeName || ""}
                          readOnly
                        />
                      </div>

                      {/* Status */}

                      <div className="col-md-4">
                        <label className="fw-bold">Status</label>

                        <select
                          className="form-select"
                          value={doubleDutyForm.status || "P"}
                          onChange={(e) =>
                            updateDoubleDuty("status", e.target.value)
                          }
                        >
                          <option value="P">Present</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <hr />

                        <h6 className="fw-bold text-danger">Previous Duty</h6>
                      </div>

                      {/* Old Check In Date */}

                      <div className="col-md-3">
                        <label>Check-In Date</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.oldCheckInDate || ""}
                          readOnly
                        />
                      </div>

                      {/* Old Check In */}

                      <div className="col-md-3">
                        <label>Check-In Time</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.oldCheckIn || ""}
                          readOnly
                        />
                      </div>

                      {/* Old Check Out Date */}

                      <div className="col-md-3">
                        <label>Check-Out Date</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.oldCheckOutDate || ""}
                          readOnly
                        />
                      </div>

                      {/* Old Check Out */}

                      <div className="col-md-3">
                        <label>Check-Out Time</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.oldCheckOut || ""}
                          readOnly
                        />
                      </div>

                      <div className="col-12">
                        <hr />

                        <h6 className="fw-bold text-primary">
                          New Double Duty
                        </h6>
                      </div>

                      {/* New Check In Date */}

                      <div className="col-md-3">
                        <label>Check-In Date</label>

                        <input
                          type="date"
                          className="form-control"
                          value={attendanceDate}
                          readOnly
                        />
                      </div>

                      {/* New Check In */}

                      <div className="col-md-3">
                        <label>Check-In Time</label>

                        <Select
                          options={timeOptions}
                          value={
                            timeOptions.find(
                              (t) => t.value === doubleDutyForm.checkIn,
                            ) || timeOptions[0]
                          }
                          onChange={(selected) =>
                            updateDoubleDuty("checkIn", selected?.value || "")
                          }
                          isSearchable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />
                      </div>

                      {/* New Check Out Date */}

                      <div className="col-md-3">
                        <label>Check-Out Date</label>

                        <select
                          className="form-select"
                          value={doubleDutyForm.checkOutDate || attendanceDate}
                          onChange={(e) =>
                            updateDoubleDuty("checkOutDate", e.target.value)
                          }
                        >
                          <option value={attendanceDate}>
                            {displayDate(attendanceDate)}
                          </option>

                          {(() => {
                            const nextDate = new Date(attendanceDate);

                            nextDate.setDate(nextDate.getDate() + 1);

                            const next = nextDate.toISOString().split("T")[0];

                            if (next <= currentDate) {
                              return (
                                <option value={next}>
                                  {displayDate(next)}
                                </option>
                              );
                            }

                            return null;
                          })()}
                        </select>
                      </div>

                      {/* New Check Out Time */}

                      <div className="col-md-3">
                        <label>Check-Out Time</label>

                        <Select
                          options={getCheckOutTimeOptions(
                            doubleDutyForm.checkIn,
                            attendanceDate,
                            doubleDutyForm.checkOutDate || attendanceDate,
                          )}
                          value={
                            getCheckOutTimeOptions(
                              doubleDutyForm.checkIn,
                              attendanceDate,
                              doubleDutyForm.checkOutDate || attendanceDate,
                            ).find(
                              (t) => t.value === doubleDutyForm.checkOut,
                            ) || timeOptions[0]
                          }
                          onChange={(selected) =>
                            updateDoubleDuty("checkOut", selected?.value || "")
                          }
                          isSearchable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,

                              zIndex: 9999,
                            }),
                          }}
                        />
                      </div>

                      {/* Site Hours */}

                      <div className="col-md-4">
                        <label className="fw-bold">Site Hours</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.siteHours || 0}
                          readOnly
                        />
                      </div>

                      {/* Worked Hours */}

                      <div className="col-md-4">
                        <label className="fw-bold">Worked Hours</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.workedHours || "0.00"}
                          readOnly
                        />
                      </div>

                      {/* OT Hours */}

                      <div className="col-md-4">
                        <label className="fw-bold">OT Hours</label>

                        <input
                          className="form-control"
                          value={doubleDutyForm.otHours || "0.00"}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDoubleDutyModal(false);

                        setDoubleDutyForm(null);
                      }}
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={saveDoubleDuty}
                    >
                      Save Double Duty
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;
