import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../loader/LoadingScreen";
import { useContext } from "react";
import { PermissionsContext } from "../../context/PermissionsContext";
import {
  Alert,
  Table,
  Dropdown,
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Pagination,
} from "react-bootstrap";
import {
  FaEllipsisV,
  FaPen,
  FaMoneyBill,
  FaExchangeAlt,
  FaTrash,
  FaEye,
  FaFileAlt,
  FaUndo,
} from "react-icons/fa";
import AuditTrail from "../../common/AuditTrail";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL;
const IMAGE= import.meta.env.VITE_FRONTEND_FOLDER;
const getEmployeeDocumentUrl = (docName) => {
  if (!docName) return "";

  let documentPath = String(docName)
    .trim()
    .replace(/\\/g, "/")
    .replace(/^https?:\/\/[^/]+/i, "");
  documentPath = documentPath.replace(/^.*\/(?=api\/|emp_docs\/)/i, "");
  documentPath = documentPath.replace(/^\/+/, "");

  if (documentPath.toLowerCase().startsWith("emp_docs/")) {
    documentPath = `api/${documentPath}`;
  }

  const apiUrl = IMAGE.replace(/\/+$/, "");

  return `${apiUrl}/api/${documentPath.replace(/^api\//i, "")}`;
};
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const handleGenerateOfferLetter = async (emp) => {
  try {
    const token = localStorage.getItem("token");
    const empId = emp._id || emp.id;

    const response = await fetch(
      `${API_URL}/api/employees/${empId}/generate-offer-letter`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to generate offer letter");
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error("Empty PDF received");
    }

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Open in a new tab instead of triggering a download
    window.open(url, "_blank");

    // Revoke the URL after a short delay to ensure the browser has loaded the PDF
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error(err);
    alert("Offer Letter generation failed: " + err.message);
  }
};

const handleGenerateIdCard = async (emp) => {
  try {
    const token = localStorage.getItem("token");
    const empId = emp._id || emp.id;

    const response = await fetch(
      `${API_URL}/api/employees/${empId}/generate-id-card`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to generate ID card");
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error("Empty PDF received");
    }

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Open in a new tab for viewing
    const newWindow = window.open(url, "_blank");

    // If pop-up is blocked, alert the user
    if (!newWindow) {
      alert("Please allow pop-ups to view the ID Card.");
    }

    // Revoke the URL after a delay to ensure it loads in the new tab
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error(err);
    alert("Id Card generation failed: " + err.message);
  }
};

const EmployeeTable = ({
  loading,
  error,
  employees,
  activeTab,
  onEdit,
  onUpdateSalary,
  onChangeStatus,
  onDelete,
  onVerificationClick,
  showVerificationModal,
  setShowVerificationModal,
  showVerifiedModal,
  setShowVerifiedModal,
  selectedEmployee,
  // verificationData,
  // setVerificationData,
  fetchEmployees,

  employeeTypes,
  reportingManagers,
  setSelectedEmployee,
  showDisabledList,
  disabledEmployees,
  handleRestoreEmployee,
}) => {
  const { permissions, getPermissionsByModule, getPermissionsByModuleId } =
    useContext(PermissionsContext);
  const employeePerms = getPermissionsByModule("Employee");

  const canEdit = Number(employeePerms?.edit_access) === 1;
  const canDelete = Number(employeePerms?.delete_access) === 1;
  const canPrint = Number(employeePerms?.print_access) === 1;
  const canExport = Number(employeePerms?.export_access) === 1;
const userId = Number(
  JSON.parse(localStorage.getItem("user") || "{}")?.id
);

const isSuperAdmin = userId === 1;

  const isCreatedAndModifiedBySuperAdmin = (emp) =>
  Number(emp?.created_by) === 1 &&
  Number(emp?.modified_by) === 1;
  // console.log("employeePerms", employeePerms, permissions);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [verificationData, setVerificationData] = useState({
    status: "OFFER LETTER ISSUED",
    remark: "",
  });
  const [verifyingDocumentId, setVerifyingDocumentId] = useState(null);
  const [aadhaarVerificationMessage, setAadhaarVerificationMessage] =
  useState("");
const [employeeLoginCoordinates, setEmployeeLoginCoordinates] =
  useState("NO");

const [coordinateConfiguration, setCoordinateConfiguration] =
  useState("SITE");

const [empLatitude, setEmpLatitude] = useState("");
const [empLongitude, setEmpLongitude] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10);

// Ensure employees is always an array
const user = JSON.parse(localStorage.getItem("user") || "{}");

const employeeList = Array.isArray(employees)
  ? employees.filter((emp) => {
      // Superadmin ला सर्व employees दिसतील
      if (isSuperAdmin) return true;

      // इतर users ना superadmin_status = 1 असलेले employees दिसणार नाहीत
      return Number(emp?.superadmin_status) !== 1;
    })
  : [];

const totalPages = Math.ceil(employeeList.length / itemsPerPage);

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentEmployees = employeeList.slice(
  indexOfFirstItem,
  indexOfLastItem
);

// Reset page when tab or list changes
useEffect(() => {
  setCurrentPage(1);
}, [activeTab, showDisabledList]);

// Handle changes in employee count
useEffect(() => {
  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(totalPages);
  } else if (totalPages === 0 && currentPage !== 1) {
    setCurrentPage(1);
  }
}, [totalPages, currentPage]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setCompanies(res.data?.data ?? res.data ?? []);
      } catch (err) {
        setCompanies([]);
      }
    };

    fetchCompanies();
  }, []);

  // ============================
  // COMPANY CHANGE (GLOBAL)
  // ============================
  const handleCompanyChange = async (selected) => {
    setSelectedEmployee((prev) => ({
      ...prev,
      client_id: selected ? Number(selected.value) : null,
      company_name: selected ? selected.label : "",
      site_id: null,
    }));

    if (selected) {
      await fetchSites(selected.value);
    }
  };
  const fetchSites = async (companyId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/companies/branches/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("SITES =", res.data);

      setSites(res.data?.data || res.data || []);
    } catch (err) {
      console.error("FETCH SITE ERROR =", err);
      setSites([]);
    }
  };

  useEffect(() => {
    if (
      (showVerifiedModal || showVerificationModal) &&
      selectedEmployee?.client_id
    ) {
      fetchSites(selectedEmployee.client_id);
    }
  }, [showVerifiedModal, showVerificationModal, selectedEmployee?.client_id]);
useEffect(() => {
  if (!showVerifiedModal) return;

  const currentStatus = String(selectedEmployee?.emp_stages || "")
    .trim()
    .toUpperCase();

  const allowedStatuses = [
    "OFFER LETTER ISSUED",
    "ON HOLD",
    "REJECT",
  ];

  setVerificationData((prev) => ({
    ...prev,
    status: allowedStatuses.includes(currentStatus)
      ? currentStatus
      : "OFFER LETTER ISSUED",
  }));
}, [showVerifiedModal, selectedEmployee?.id, selectedEmployee?._id]);
  useEffect(() => {
    if (sites.length > 0 && selectedEmployee?.site_id) {
      const matchedSite = sites.find(
        (s) =>
          String(s.site_id || s.id || s._id) ===
          String(selectedEmployee.site_id),
      );
      if (
        matchedSite &&
        matchedSite.cc_site_hours &&
        !selectedEmployee.working_hours
      ) {
        setSelectedEmployee((prev) => ({
          ...prev,
          working_hours: matchedSite.cc_site_hours,
        }));
      }
    }
  }, [sites, selectedEmployee?.site_id, selectedEmployee?.working_hours]);

  useEffect(() => {
    if (
      showVerifiedModal &&
      selectedEmployee &&
      !selectedEmployee.employee_code
    ) {
      const fetchNextCode = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${API_URL}/api/employees/next-code`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success && res.data?.nextCode) {
            setSelectedEmployee((prev) => ({
              ...prev,
              employee_code: res.data.nextCode,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch next employee code", err);
        }
      };
      fetchNextCode();
    }
  }, [showVerifiedModal, selectedEmployee?.employee_code]);

  // console.log("COMPANIES DATA:", companies);
  // console.log("SITES DATA:", sites);
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const handleUpdateSalary = (employeeId) => {
    console.log("EMPLOYEE OBJECT ID =", employeeId);

    if (!employeeId) {
      alert("Employee ID not found");
      return;
    }

    navigate(`/employee/update-salary/${employeeId}`);
  };
  // ============================
  // TRANSFER MODAL STATES
  // ============================
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    client_id: "",
    site_id: "",
    working_hours: "",
    shift_type: "",
    employee_code: "",
    employee_type: "",
    reporting_manager: "",
  });

  const openTransferModal = (employee) => {
    console.log("TRANSFER EMPLOYEE =", employee);
    setTransferData({
      client_id: "", // intentionally empty so they pick a new one
      site_id: "",
      working_hours: "",
      shift_type: "",
      employee_code: employee.employee_code || "",
      employee_type: employee.employee_type || employee.rank || "",
      reporting_manager: employee.reporting_manager || "",
    });
    setSelectedEmployee(employee);
    setShowTransferModal(true);
  };
  const openVerificationModal = async (employee) => {
    try {
      console.log("EMPLOYEE =", employee);
      setVerificationData({
        status: "VERIFIED",
        remark: "",
      });
      setSelectedEmployee(employee);

      setShowVerificationModal(true);

      const token = localStorage.getItem("token");

      const employeeId = employee.id || employee._id;

      console.log("EMPLOYEE ID =", employeeId);

      const res = await axios.get(
        `${API_URL}/api/document-verification/employee/${employeeId}/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("API RESPONSE =", res.data);

      setEmployeeDocs(res.data.data || []);
    } catch (err) {
      console.log("DOCUMENT ERROR =", err);

      alert("Failed to load documents");
    }
  };
  const applyDocumentVerification = (documentId, verification) => {
    setEmployeeDocs((currentDocs) =>
      currentDocs.map((doc) =>
        doc.id === documentId ? { ...doc, ...verification } : doc,
      ),
    );
  };

  const getVerificationError = (error) => {
    const responseData = error.response?.data;
    if (responseData?.message) return responseData.message;
    if (typeof responseData === "string") {
      const responseMessage = responseData
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (responseMessage) return responseMessage.slice(0, 500);
    }

    return error.message || "Document verification failed";
  };

  const verifyPanDocument = async (doc) => {
    setVerifyingDocumentId(doc.id);
    try {
      const response = await axios.post(
        `${API_URL}/api/document-verification/${doc.id}/pan`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      applyDocumentVerification(doc.id, response.data.verification);
      toast.success(response.data.message || "PAN verified successfully");
      fetchEmployees();
    } catch (error) {
      toast.error(getVerificationError(error));
    } finally {
      setVerifyingDocumentId(null);
    }
  };

  const verifyVoterIdDocument = async (doc) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers?.Authorization) {
      toast.error("Your login session has expired. Please sign in again.");
      return;
    }

    setVerifyingDocumentId(doc.id);
    try {
      const response = await axios.post(
        `${API_URL}/api/document-verification/${doc.id}/voter-id`,
        {},
        authConfig,
      );

      applyDocumentVerification(doc.id, response.data.verification);
      toast.success(response.data.message || "Voter ID verified successfully");
      fetchEmployees();
    } catch (error) {
      toast.error(getVerificationError(error));
    } finally {
      setVerifyingDocumentId(null);
    }
  };

  const verifyDrivingLicenseDocument = async (doc) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers?.Authorization) {
      toast.error("Your login session has expired. Please sign in again.");
      return;
    }

    setVerifyingDocumentId(doc.id);
    try {
      const response = await axios.post(
        `${API_URL}/api/document-verification/${doc.id}/driving-license`,
        {},
        authConfig,
      );

      applyDocumentVerification(doc.id, response.data.verification);
      toast.success(
        response.data.message || "Driving License verified successfully",
      );
      fetchEmployees();
    } catch (error) {
      toast.error(getVerificationError(error));
    } finally {
      setVerifyingDocumentId(null);
    }
  };

  const verifyAadhaarDocument = async (doc) => {
    const authorizationWindow = window.open("about:blank", "_blank");
    if (!authorizationWindow) {
      toast.error("Please allow pop-ups to authorize DigiLocker.");
      return;
    }

    setVerifyingDocumentId(doc.id);
    setAadhaarVerificationMessage("Starting DigiLocker authorization...");

    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      const startResponse = await axios.post(
        `${API_URL}/api/document-verification/${doc.id}/aadhaar`,
        {
          redirectUrl: new URL(
            "/employee/employee",
            import.meta.env.VITE_FRONTEND_URL || window.location.origin,
          ).toString(),
        },
        { headers },
      );

      authorizationWindow.location.href = startResponse.data.url;
      setAadhaarVerificationMessage(
        "Authorize Aadhaar access in the DigiLocker window. Waiting for authorization...",
      );

      for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 5000));
        const statusResponse = await axios.get(
          `${API_URL}/api/document-verification/${doc.id}/aadhaar/${encodeURIComponent(startResponse.data.sessionId)}/status`,
          { headers },
        );

        if (statusResponse.data.verified) {
          authorizationWindow.close();
          applyDocumentVerification(doc.id, statusResponse.data.verification);
          setAadhaarVerificationMessage("");
          toast.success(statusResponse.data.message || "Aadhaar verified successfully");
          fetchEmployees();
          return;
        }

        setAadhaarVerificationMessage(
          `Waiting for DigiLocker authorization... (${attempt + 1}/60)`,
        );
      }

      throw new Error("DigiLocker authorization timed out. Please try again.");
    } catch (error) {
      authorizationWindow.close();
      setAadhaarVerificationMessage("");
      toast.error(getVerificationError(error));
    } finally {
      setVerifyingDocumentId(null);
    }
  };

  const handleUpdateDocument = async (doc) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/employees/documents/${doc.id}`,
        {
          doc_status: doc.doc_status,
          doc_remark: doc.doc_remark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("UPDATE RESPONSE =", response.data);

      alert("Document Updated Successfully");
    } catch (err) {
      console.log("UPDATE ERROR =", err);

      alert("Failed To Update Document");
    }
  };

  const onView = (id) => {
    navigate(`/employee/view/${id}`);
  };

  const formatDateForUI = (dateString) => {
    if (!dateString) return "-";
    const d = dateString.split(" ")[0];
    if (d.includes("-")) {
      const parts = d.split("-");
      if (parts[0].length === 4) return d;
      if (parts[0].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return d;
  };
  return (
    <div className="table-responsive" style={{ overflow: "visible" }}>
      {loading ? (
        // <Alert variant="warning" className="mb-0 text-center">
        //   Loading clients...
        // </Alert>
        <LoadingScreen />
      ) : error ? (
        <Alert variant="danger" className="mb-0 text-center">
          {error}
        </Alert>
      ) : (
        <Table hover bordered className="employee-table">
          <thead className="table-secondary">
            <tr>
              <th>Sr No.</th>
              <th>Code & Name</th>
              <th>Designation</th>
              <th>Client</th>
              <th>Tracking Details</th>
              <th>Attachement</th>
              <th>Verification</th>
              {activeTab !== "Offer" && <th>Status</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
           {employeeList.length === 0 ? (
              <tr className="text-center">
                <td colSpan={activeTab === "Offer" ? 8 : 9}>No data found</td>
              </tr>
            ) : (
              currentEmployees.map((emp, index) => (
                <tr key={emp._id || emp.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>
                    {emp.employee_code ? "Code :" + emp.employee_code : ""}{" "}
                    <br />
                    {emp.initial} {emp.first_name} {emp.last_name} <br />
                    {emp.uan_no && `UAN No: ${emp.uan_no}`} <br />
                    {emp.esisNo && `ESIS No: ${emp.esisNo}`}
                  </td>
                  <td>
                    {emp.rank}
                    <br />
                    {emp?.shift_type && (
                      <>
                        {emp.shift_type}
                        <br />
                      </>
                    )}
                    {emp?.site_hours && <>{emp.site_hours} hours</>}
                  </td>
                  <td>
                    {emp.client_name || emp.company_name || "-"}
                    <br />
                    {emp.client_code ? "Client Code: " + emp.client_code : "-"}
                    <br />
                    {emp.site_name ? "Site Name: " + emp.site_name : "-"}
                  </td>
                  {/* TRACKING */}
                  <td>
                    <AuditTrail
                      createdOn={emp.created_on}
                      createdByName={emp.created_by_name}
                      modifiedOn={emp.modified_on}
                      modifiedByName={emp.modified_by_name}
                      disabledOn={emp.disabled_on}
                      disabledByName={emp.disabled_by_name}
                      isActive={!showDisabledList}
                    />
                  </td>
                  {/* <td>
                    {[
                      emp.aadharcard_1,
                      emp.attachment_2,
                      emp.attachment_3,
                      emp.attachment_4,
                    ]
                      .filter(Boolean)
                      .map((file, i) => (
                        <div key={i}>
                          <a
                            href={`${import.meta.env.VITE_API_URL}/uploads/${file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Attachment {i + 1}
                          </a>
                        </div>
                      ))}

                    {!emp.attachment_1 &&
                      !emp.attachment_2 &&
                      !emp.attachment_3 &&
                      !emp.attachment_4 && (
                        <span className="text-muted">No Attachment</span>
                      )}
                  </td> */}
                  <td>
                    {emp.documents && emp.documents.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {emp.documents.map((doc) => (
                          <li key={doc.id}>
                            <a
                              href={doc.doc_name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              <small>• {doc.doc_type}</small>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <small className="text-muted">No docs</small>
                    )}
                  </td>
                  <td>
                    
<span
  className={`badge ${
    emp.emp_stages === "OFFER LETTER ISSUED"
      ? "bg-primary"
      : emp.emp_stages === "VERIFIED"
        ? "bg-success"
        : ["REJECT", "REJECTED"].includes(
            String(emp.emp_stages || "").trim().toUpperCase()
          )
          ? "bg-danger"
          : emp.emp_stages === "ON HOLD"
            ? "bg-warning text-dark"
            : "bg-warning text-dark"
  }`}
  style={{ cursor: "pointer" }}
  onClick={() => {
    console.log(emp);

    const status = String(emp.emp_stages || "")
      .trim()
      .toUpperCase();

    if (status === "APPROVED") {
      onVerificationClick(emp, "approved");
    } else if (status === "VERIFIED") {
      onVerificationClick(emp, "VERIFIED");
    } else if (status === "OFFER LETTER ISSUED") {
      return;
    } else {
      openVerificationModal(emp);
    }
  }}
>
  {emp.emp_stages || "PENDING"}
</span>

                    {emp.verify_remarks && (
                      <div
                        className="mt-1 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <em>Remark: {emp.verify_remarks}</em>
                      </div>
                    )}
                    {activeTab === "Offer" && (
                      <div className="mt-2">
                        <span
                          className={`status-badge status-${emp?.status?.toLowerCase()}`}
                        >
                          {emp?.em_status}
                        </span>
                      </div>
                    )}
                  </td>
                  {activeTab !== "Offer" && (
                    <td>
                      <span
                        className={`status-badge status-${emp?.status?.toLowerCase()}`}
                      >
                        {emp?.em_status}
                      </span>
                    </td>
                  )}
                  <td>
                    <Dropdown
                      align="end"
                      menuProps={{ flip: true, renderOnMount: true }}
                    >
                      <Dropdown.Toggle
                        variant="secondary"
                        size="sm"
                        className="border-0 shadow-none"
                      >
                        Action
                      </Dropdown.Toggle>

                      <Dropdown.Menu renderOnMount={true}>
                        <Dropdown.Item onClick={() => onView(emp.id)}>
                          <FaEye className="me-2 text-info" />
                          View
                        </Dropdown.Item>
{(isSuperAdmin ||
  (canEdit && !isCreatedAndModifiedBySuperAdmin(emp))) && (
  <Dropdown.Item onClick={() => onEdit(emp)}>
    <FaPen className="me-2 text-primary" />
    Edit
  </Dropdown.Item>
)}
                        {canEdit && (
                          <Dropdown.Item
                            onClick={() =>
                              handleUpdateSalary(emp.id || emp._id)
                            }
                          >
                            <FaMoneyBill className="me-2 text-success" />
                            Update Salary
                          </Dropdown.Item>
                        )}

                        {canEdit && (
                          <Dropdown.Item onClick={() => onChangeStatus(emp)}>
                            <FaExchangeAlt className="me-2 text-warning" />
                            Change Status
                          </Dropdown.Item>
                        )}

                        {activeTab === "Offer" && false && (
                          <Dropdown.Item
                            onClick={() => handleGenerateOfferLetter(emp)}
                            className="text-primary"
                          >
                            <FaFileAlt className="me-2" />
                            Generate Letter
                          </Dropdown.Item>
                        )}

                        {activeTab === "Offer" && false && (
                          <Dropdown.Item
                            onClick={() => handleGenerateIdCard(emp)}
                            className="text-primary"
                          >
                            <FaFileAlt className="me-2" />
                            Generate Id Card
                          </Dropdown.Item>
                        )}

                        {activeTab === "Offer" && (
                          <Dropdown.Item onClick={() => openTransferModal(emp)}>
                            <FaExchangeAlt className="me-2 text-info" />
                            Employee Transfer
                          </Dropdown.Item>
                        )}

                        <Dropdown.Divider />

{showDisabledList ? (
  <Dropdown.Item
    onClick={() => handleRestoreEmployee(emp.id)}
    className="text-success"
  >
    <FaUndo className="me-2" />
    Restore
  </Dropdown.Item>
) : (
  (isSuperAdmin ||
    (canDelete && !isCreatedAndModifiedBySuperAdmin(emp))) && (
    <Dropdown.Item
      onClick={() => onDelete(emp.id)}
      className="text-danger"
    >
      <FaTrash className="me-2" />
      Delete
    </Dropdown.Item>
  )
)}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

 
{totalPages > 0 && (
  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
    <div className="text-muted">
      Showing {indexOfFirstItem + 1}–
      {Math.min(indexOfLastItem, employeeList.length)} of{" "}
      {employeeList.length} employees
    </div>

    {totalPages > 1 && (
      <Pagination className="mb-0">
        <Pagination.First
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        />

        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => Math.max(1, prev - 1))
          }
        />

        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 2
          )
          .reduce((pages, page, index, visiblePages) => {
            if (
              index > 0 &&
              page - visiblePages[index - 1] > 1
            ) {
              pages.push(`ellipsis-${page}`);
            }

            pages.push(page);
            return pages;
          }, [])
          .map((page) =>
            typeof page === "string" ? (
              <Pagination.Ellipsis key={page} disabled />
            ) : (
              <Pagination.Item
                key={page}
                active={currentPage === page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Pagination.Item>
            )
          )}

        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(totalPages, prev + 1)
            )
          }
        />

        <Pagination.Last
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        />
      </Pagination>
    )}
  </div>
)}


      <Modal
        show={showVerificationModal}
        onHide={() => setShowVerificationModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Employee Verification</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedEmployee && (
            <>
              {/* ========================================= */}
              {/* EMPLOYEE DETAILS */}
              {/* ========================================= */}

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Employee Name</strong>

                  <div>
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </div>
                </Col>

                {/* <Col md={6}>
                  <strong>Employee Code</strong>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedEmployee.employee_code}
                    onChange={(e) => {
                      console.log(e.target.value);
                    }}
                  />
                </Col> */}
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Designation</strong>
                  <div>{selectedEmployee.rank}</div>
                </Col>

                <Col md={6}>
                  <strong>Status</strong>

                  <div>
                    <span
                      className={`badge ${
                        selectedEmployee?.emp_stages === "VERIFIED"
                          ? "bg-success"
                          : selectedEmployee?.emp_stages === "APPROVED"
                            ? "bg-primary"
                            : selectedEmployee?.emp_stages === "REJECT"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                      }`}
                    >
                      {selectedEmployee?.emp_stages || "PENDING"}
                    </span>
                  </div>
                </Col>
              </Row>

              {/* <Row className="mb-3">
                <Col md={6}>
                  <strong>Verified By</strong>

                  <div>{selectedEmployee.verify_name || "N/A"}</div>
                </Col>

                <Col md={6}>
                  <strong>Verified Date</strong>

                  <div>
                    {selectedEmployee.verify_on
                      ? new Date(selectedEmployee.verify_on).toLocaleDateString(
                          "en-GB",
                        )
                      : "N/A"}
                  </div>
                </Col>
              </Row> */}

              {/* ========================================= */}
              {/* DOCUMENTS */}
              {/* ========================================= */}

              <hr />

              <h5 className="mb-3">Uploaded Documents</h5>

              {employeeDocs.length === 0 ? (
                <Alert variant="danger">No Documents Found</Alert>
              ) : (
                <Row>
                  {employeeDocs.map((doc, index) => {
                    const fileUrl = getEmployeeDocumentUrl(doc.doc_name);
                    const normalizedDocumentType = String(doc.doc_type || "")
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "");
                    const isPanDocument = ["PAN", "PANCARD"].includes(
                      normalizedDocumentType,
                    );
                    const isAadhaarDocument = [
                      "AADHAAR",
                      "AADHAARCARD",
                      "AADHARCARD",
                    ].includes(normalizedDocumentType);
                    const isVoterIdDocument = [
                      "VOTERID",
                      "VOTERCARD",
                    ].includes(normalizedDocumentType);
                    const isDrivingLicenseDocument = [
                      "DL",
                      "DRIVINGLICENSE",
                      "DRIVINGLICENCE",
                      "DRIVERSLICENSE",
                      "DRIVERLICENSE",
                    ].includes(normalizedDocumentType);
                    const isDocumentVerified =
                      String(doc.verify_status || "").toUpperCase() ===
                      "SUCCESS";

                    const isImage = fileUrl?.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i,
                    );

                    return (
                      <Col md={4} key={doc.id || index} className="mb-4">
                        <div className="border rounded p-3 h-100 shadow-sm">
                          <div className="mb-2">
                            <strong>Document Type</strong>

                            <div>{doc.doc_type}</div>
                          </div>

                          <div className="text-center mb-3">
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt="document"
                                style={{
                                  width: "100%", // Takes up full width of container
                                  height: "150px", // Maintains consistent height
                                  maxWidth: "150px", // Restricts width
                                  maxHeight: "150px", // Restricts height
                                  objectFit: "cover",
                                  border: "1px solid #ddd",
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(fileUrl, "_blank")}
                                onError={(e) => {
                                  // Prevent infinite loop by checking current src
                                  if (e.target.src.includes("/no-image.png")) {
                                    e.target.onerror = null; // Remove handler to stop further attempts
                                    return;
                                  }
                                  console.log("IMAGE LOAD FAILED =", fileUrl);
                                  e.target.src = "/no-image.png";
                                }}
                              />
                            ) : (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary btn-sm"
                              >
                                View Document
                              </a>
                            )}
                          </div>
                          <div className="d-flex flex-column align-items-start gap-2">
                            {isDocumentVerified ? (
                              <Alert variant="success" className="py-2 px-3 mb-0">
                                Verified
                                {doc.verified_by_name
                                  ? ` by ${doc.verified_by_name}`
                                  : ""}
                                {doc.verified_at
                                  ? ` on ${new Date(doc.verified_at).toLocaleString()}`
                                  : ""}
                              </Alert>
                            ) : (
                              <Button
                                size="sm"
                                variant="success"
                                disabled={
                                  (!isPanDocument &&
                                    !isAadhaarDocument &&
                                    !isVoterIdDocument &&
                                    !isDrivingLicenseDocument) ||
                                  verifyingDocumentId !== null
                                }
                                onClick={() => {
                                  if (isPanDocument) verifyPanDocument(doc);
                                  else if (isAadhaarDocument)
                                    verifyAadhaarDocument(doc);
                                  else if (isVoterIdDocument)
                                    verifyVoterIdDocument(doc);
                                  else if (isDrivingLicenseDocument)
                                    verifyDrivingLicenseDocument(doc);
                                }}
                              >
                                {verifyingDocumentId === doc.id
                                  ? "Verifying..."
                                  : isPanDocument
                                    ? "Verify PAN"
                                    : isAadhaarDocument
                                      ? "Verify with DigiLocker"
                                      : isVoterIdDocument
                                        ? "Verify Voter ID"
                                        : isDrivingLicenseDocument
                                          ? "Verify Driving License"
                                          : "Verification unavailable"}
                              </Button>
                            )}
                            {verifyingDocumentId === doc.id &&
                              isAadhaarDocument &&
                              aadhaarVerificationMessage && (
                                <small className="text-muted">
                                  {aadhaarVerificationMessage}
                                </small>
                              )}
                            {doc.doc_status && (
                              <small className="text-muted">
                                Document status: {doc.doc_status}
                              </small>
                            )}
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              )}

              {/* ========================================= */}
              {/* COMPANY + SITE */}
              {/* ========================================= */}

              <hr />

              {/* ========================================= */}
              {/* STATUS */}
              {/* ========================================= */}

              <Form.Group className="mb-3">
                <Form.Label>Verification Status</Form.Label>

                <Form.Select
                  value={verificationData.status} // Use the local state variable
                  onChange={(e) => {
                    console.log(e.target.value);
                    setVerificationData({
                      ...verificationData,
                      status: e.target.value || "VERIFIED",
                    });
                  }}
                >
                  <option value="VERIFIED">Verified</option>
                  <option value="ON HOLD">On Hold</option>
                  <option value="REJECT">Reject</option>
                </Form.Select>
              </Form.Group>

              {/* REMARK */}

              <Form.Group className="mb-3">
                <Form.Label>Verification Remark</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter verification remark"
                  value={verificationData.remark}
                  onChange={(e) =>
                    setVerificationData({
                      ...verificationData,
                      remark: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowVerificationModal(false)}
          >
            Close
          </Button>

          <Button
            variant="success"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");

                console.log("TOKEN =", token);

                // =====================================
                // EMPLOYEE ID
                // =====================================

                const employeeId = Number(
                  selectedEmployee?.id ||
                    selectedEmployee?._id ||
                    selectedEmployee?.emp_id,
                );

                console.log("SELECTED EMPLOYEE =", selectedEmployee);

                console.log("EMPLOYEE ID =", employeeId);

                if (!employeeId) {
                  alert("Employee ID Missing");

                  return;
                }

                // =====================================
                // VERIFY URL
                // =====================================

                const verifyUrl = `${API_URL}/api/employees/verify/${employeeId}`;

                console.log("VERIFY URL =", verifyUrl);

                // =====================================
                // PAYLOAD
                // =====================================

                const payload = {
                  verification_remark: verificationData.remark,
                  status: verificationData.status,
                  client_id: selectedEmployee.client_id,
                  site_id: selectedEmployee.site_id,
                };

                console.log("VERIFY PAYLOAD =", payload);

                // =====================================
                // API CALL
                // =====================================

                const response = await fetch(verifyUrl, {
                  method: "PUT",

                  headers: {
                    Authorization: `Bearer ${token}`,

                    "Content-Type": "application/json",
                  },

                  body: JSON.stringify(payload),
                });

                console.log("RESPONSE STATUS =", response.status);

                const result = await response.json();

                console.log("VERIFY RESPONSE =", result);

                if (!response.ok) {
                  throw new Error(
                    result.message || "Failed to verify employee",
                  );
                }

                alert("Verification Updated Successfully");

                setShowVerificationModal(false);

                fetchEmployees();
              } catch (err) {
                console.log("VERIFY ERROR =", err);

                alert(err.message);
              }
            }}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <style>
        {`
      .employee-verify-modal {
  max-width: 75% !important;
  width: 75% !important;
}
      `}
      </style>
      <Modal
        centered
        show={showVerifiedModal}
        dialogClassName="employee-verify-modal"
        onHide={() => {
          setShowVerifiedModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Verified Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Employee Name</strong>
                  <div>
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </div>
                </Col>

                <Col md={3}>
                  <strong>Employee Code</strong>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedEmployee.employee_code}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                      setSelectedEmployee({
                        ...selectedEmployee,
                        employee_code: numericValue,
                      });
                    }}
                  />
                </Col>
                <Col md={3}>
                  <strong>Designation</strong>
                  <div>{selectedEmployee.rank}</div>
                </Col>

                <Col md={2}>
                  <strong>Status</strong>
                  <div>
                    <span
                      className={`badge ${
                        selectedEmployee?.emp_stages === "VERIFIED"
                          ? "bg-success"
                          : selectedEmployee?.emp_stages === "ON HOLD"
                            ? "bg-warning text-dark"
                            : selectedEmployee?.emp_stages === "REJECT"
                              ? "bg-danger"
                              : "bg-primary"
                      }`}
                    >
                      {selectedEmployee?.emp_stages || "OFFER LETTER ISSUED"}
                    </span>
                    {selectedEmployee?.verify_remarks && (
                      <div
                        className="mt-1 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <em>Remark: {selectedEmployee.verify_remarks}</em>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>Verified By</strong>
                  <div>{selectedEmployee.verify_name || "N/A"}</div>
                </Col>

                <Col md={4}>
                  <strong>Verified Date</strong>
                  <div>
                    {selectedEmployee.verify_on
                      ? selectedEmployee.verify_on
                      : "N/A"}
                  </div>
                </Col>

                {/* Company + Site */}

                {/* CLIENT */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Client</Form.Label>

                    <Select
                      placeholder="Select Client..."
                      options={companies
                        .filter((c) => String(c.active) !== "1")
                        .map((c) => ({
                          value: String(c._id || c.id),
                          label: c.companyName || c.company_name,
                        }))}
                      value={
                        companies
                          .map((c) => ({
                            value: String(c._id || c.id),
                            label: c.companyName || c.company_name,
                          }))
                          .find(
                            (opt) =>
                              opt.value === String(selectedEmployee?.client_id),
                          ) || null
                      }
                      onChange={handleCompanyChange}
                    />
                  </Form.Group>
                </Col>
                <Row className="mb-3 mt-3">
                  {/* SITE */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Site</Form.Label>

                      <Select
                        isDisabled={!selectedEmployee?.client_id}
                        options={sites.map((s) => ({
                          value: String(s.site_id || s.id || s._id),
                          label: s.siteName,
                          // Include the hours in the option object for easy access
                          hours: s.cc_site_hours,
                        }))}
                        value={
                          sites
                            .map((s) => ({
                              value: String(s.site_id || s.id || s._id),
                              label: s.siteName,
                              hours: s.cc_site_hours,
                            }))
                            .find(
                              (opt) =>
                                opt.value === String(selectedEmployee?.site_id),
                            ) || null
                        }
                        onChange={(selected) => {
                          // 1. Update the state with site info
                          // 2. Auto-fill working_hours if selected.hours exists
                          setSelectedEmployee((prev) => ({
                            ...prev,
                            site_id: selected?.value || "",
                            site_name: selected?.label || "",
                            working_hours:
                              selected?.hours || prev.working_hours, // Auto-populate here
                          }));
                        }}
                      />
                    </Form.Group>
                  </Col>

                  {/* Working Hours + Shift Type */}

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Working Hours</Form.Label>
                      <Form.Control
                        type="text"
                        readOnly
                        placeholder="Enter working hours"
                        value={selectedEmployee?.working_hours || ""}
                        onChange={(e) =>
                          setSelectedEmployee((prev) => ({
                            ...prev,
                            working_hours: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Shift Type</Form.Label>
                      <Form.Select
                        value={selectedEmployee?.shift_type || ""}
                        onChange={(e) =>
                          setSelectedEmployee((prev) => ({
                            ...prev,
                            shift_type: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Shift Type</option>
                        <option value="MORNING">Morning</option>
                        <option value="NIGHT">Night</option>
                        <option value="GENERAL">General</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>

                <Form.Select
  value={verificationData.status}
  onChange={(e) =>
    setVerificationData((prev) => ({
      ...prev,
      status: e.target.value,
    }))
  }
>
  <option value="OFFER LETTER ISSUED">
    Offer Letter Issued
  </option>
  <option value="ON HOLD">On Hold</option>
  <option value="REJECT">Reject</option>
</Form.Select>
                    </Form.Group>
                  </Col>
                  {verificationData.status === "OFFER LETTER ISSUED" && (
  <>
{/* Employee Login Coordinates Access */}
<Row className="mb-3 mt-3">
  <Col md={4}>
    <Form.Group>
      <Form.Label>Employee Login Coordinates Access</Form.Label>
      <Form.Select
        value={employeeLoginCoordinates}
        onChange={(e) => {
          const value = e.target.value;
          setEmployeeLoginCoordinates(value);

          if (value === "NO") {
            setCoordinateConfiguration("SITE");
            setEmpLatitude("");
            setEmpLongitude("");
          }
        }}
      >
        <option value="NO">NO</option>
        <option value="YES">YES</option>
      </Form.Select>
    </Form.Group>
  </Col>

  {employeeLoginCoordinates === "YES" && (
    <Col md={4}>
      <Form.Group>
        <Form.Label>Coordinate Configuration</Form.Label>
        <Form.Select
          value={coordinateConfiguration}
          onChange={(e) => {
            const value = e.target.value;
            setCoordinateConfiguration(value);

            if (value !== "EMPLOYEE") {
              setEmpLatitude("");
              setEmpLongitude("");
            }
          }}
        >
        <option value="SITE">Site Coordinates</option>
          <option value="EMPLOYEE">Employee Coordinates</option>
        </Form.Select>
      </Form.Group>
    </Col>
  )}
</Row>

{/* Show latitude and longitude only for Employee Coordinates */}
{employeeLoginCoordinates === "YES" &&
  coordinateConfiguration === "EMPLOYEE" && (
    <Row className="mb-3">
      <Col md={4}>
        <Form.Group>
          <Form.Label>Emp Latitude</Form.Label>
          <Form.Control
            type="number"
            step="any"
            placeholder="Enter employee latitude"
            value={empLatitude}
            onChange={(e) => setEmpLatitude(e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label>Emp Longitude</Form.Label>
          <Form.Control
            type="number"
            step="any"
            placeholder="Enter employee longitude"
            value={empLongitude}
            onChange={(e) => setEmpLongitude(e.target.value)}
          />
        </Form.Group>
      </Col>
    </Row>
  )}

</>
  )}
                </Row>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowVerifiedModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            
onClick={async () => {
  try {
    if (!selectedEmployee?.client_id || !selectedEmployee?.site_id) {
      alert("Please select both Client and Site before submitting.");
      return;
    }

    if (!selectedEmployee?.shift_type) {
      alert("Please select shift type.");
      return;
    }

    const allowedStatuses = [
      "OFFER LETTER ISSUED",
      "ON HOLD",
      "REJECT",
    ];

    const status = String(verificationData.status || "")
      .trim()
      .toUpperCase();

    if (!allowedStatuses.includes(status)) {
      alert("Please select a valid employee status.");
      return;
    }

    const employeeId =
      selectedEmployee.id ||
      selectedEmployee._id ||
      selectedEmployee.emp_id;
console.log("Selected Employee ID:", employeeId);
console.log(
  "Selected Employee Code:",
  selectedEmployee.employee_code
);
    if (!employeeId) {
      alert("Employee ID not found.");
      return;
    }

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/employees/offer-status/${employeeId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: selectedEmployee.client_id,
          site_id: selectedEmployee.site_id,
          employee_code: selectedEmployee.employee_code,
          employee_type: selectedEmployee.employee_type,
          reporting_manager: selectedEmployee.reporting_manager,
          shift_type: selectedEmployee.shift_type,
          working_hours: selectedEmployee.working_hours,
          verification_status: status,
            employee_login_coordinates_type:
    employeeLoginCoordinates === "YES" &&
    coordinateConfiguration === "EMPLOYEE"
      ? "EMPLOYEE COORDINATES"
      : "SITE",

  employee_login_coordinates:
    employeeLoginCoordinates === "YES" &&
    coordinateConfiguration === "EMPLOYEE" &&
    empLatitude !== "" &&
    empLongitude !== ""
      ? [
          {
            office_latitude: Number(empLatitude),
            office_longitude: Number(empLongitude),
          },
        ]
      : [],
        }),
      }
    );

    const result = await response.json();

    console.log("STATUS:", response.status);
    console.log("RESULT:", result);

    if (!response.ok) {
      throw new Error(
        result.message || result.error || "Failed to update employee status."
      );
    }

    if (status === "OFFER LETTER ISSUED") {
      alert("Offer Letter Issued Successfully.");
    } else if (status === "ON HOLD") {
      alert("Employee status updated to On Hold.");
    } else if (status === "REJECT") {
      alert("Employee Rejected Successfully.");
    }

    setShowVerifiedModal(false);
    await fetchEmployees();
  } catch (err) {
    console.error("Update Employee Status Error:", err);
    alert(err.message || "Failed to update employee status.");
  }
}}

          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ============================ */}
      {/* EMPLOYEE TRANSFER MODAL */}
      {/* ============================ */}
      <Modal
        centered
        show={showTransferModal}
        dialogClassName="employee-verify-modal"
        onHide={() => {
          setShowTransferModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Employee Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Employee Name</strong>
                  <div>
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </div>
                </Col>

                <Col md={4}>
                  <strong>Employee Code</strong>
                  <div>{selectedEmployee.employee_code}</div>
                </Col>
                <Col md={4}>
                  <strong>Designation</strong>
                  <div>{selectedEmployee.rank}</div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Current Client</strong>
                  <div>{selectedEmployee.client_name || "-"}</div>
                </Col>
                <Col md={6}>
                  <strong>Current Site</strong>
                  <div>{selectedEmployee.site_name || "-"}</div>
                </Col>
              </Row>

              <hr />
              <h6 className="mb-3">Transfer Details</h6>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>New Client</strong>
                  <Select
                    options={companies
                      .filter(
                        (c) =>
                          String(c.id || c._id) !==
                            String(selectedEmployee.client_id) &&
                          String(c.active) !== "1",
                      )
                      .map((c) => ({
                        value: String(c.id || c._id),
                        label: c.companyName || c.company_name || c.client_name,
                      }))}
                    value={
                      transferData.client_id
                        ? {
                            value: transferData.client_id,
                            label:
                              companies.find(
                                (c) =>
                                  String(c.id || c._id) ===
                                  String(transferData.client_id),
                              )?.companyName ||
                              companies.find(
                                (c) =>
                                  String(c.id || c._id) ===
                                  String(transferData.client_id),
                              )?.company_name ||
                              companies.find(
                                (c) =>
                                  String(c.id || c._id) ===
                                  String(transferData.client_id),
                              )?.client_name ||
                              "",
                          }
                        : null
                    }
                    onChange={async (selected) => {
                      setTransferData({
                        ...transferData,
                        client_id: selected.value,
                        site_id: "",
                      });
                      await fetchSites(selected.value);
                    }}
                    placeholder="Select New Client..."
                  />
                </Col>
                <Col md={6}>
                  <strong>New Site</strong>
                  <Select
                    options={sites
                      .filter(
                        (s) =>
                          String(s.site_id || s.id || s._id) !==
                            String(selectedEmployee.site_id) &&
                          String(s.active) !== "1",
                      )
                      .map((s) => ({
                        value: String(s.site_id || s.id || s._id),
                        label: s.siteName || s.site_name,
                      }))}
                    value={
                      transferData.site_id
                        ? {
                            value: transferData.site_id,
                            label:
                              sites.find(
                                (s) =>
                                  String(s.site_id || s.id || s._id) ===
                                  String(transferData.site_id),
                              )?.siteName ||
                              sites.find(
                                (s) =>
                                  String(s.site_id || s.id || s._id) ===
                                  String(transferData.site_id),
                              )?.site_name ||
                              "",
                          }
                        : null
                    }
                    onChange={(selected) => {
                      const siteDetails = sites.find(
                        (s) =>
                          String(s.site_id || s.id || s._id) ===
                          String(selected.value),
                      );
                      setTransferData({
                        ...transferData,
                        site_id: selected.value,
                        working_hours:
                          siteDetails?.cc_site_hours ||
                          siteDetails?.working_hours ||
                          "",
                        shift_type: siteDetails?.shift_type || "",
                      });
                    }}
                    placeholder="Select New Site..."
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Working Hours</strong>
                  <Form.Control
                    type="number"
                    value={transferData.working_hours}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        working_hours: e.target.value,
                      })
                    }
                  />
                </Col>
                <Col md={6}>
                  <strong>Shift Type</strong>
                  <Form.Select
                    value={transferData.shift_type}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        shift_type: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Shift Type</option>
                    <option value="MORNING">MORNING</option>
                    <option value="EVENING">EVENING</option>
                    <option value="NIGHT">NIGHT</option>
                    <option value="GENERAL">GENERAL</option>
                  </Form.Select>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTransferModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                if (!transferData.client_id || !transferData.site_id) {
                  alert(
                    "Please select both New Client and New Site before submitting.",
                  );
                  return;
                }

                const payload = {
                  client_id: transferData.client_id,
                  site_id: transferData.site_id,
                  employee_code: transferData.employee_code,
                  employee_type: transferData.employee_type,
                  reporting_manager: transferData.reporting_manager,
                  shift_type: transferData.shift_type,
                  working_hours: transferData.working_hours,
                  verification_status: "OFFER LETTER ISSUED",
                };

                const token = localStorage.getItem("token");
                const response = await fetch(
                  `${API_URL}/api/employees/offer-status/${selectedEmployee.id || selectedEmployee._id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  },
                );

                const result = await response.json();

                if (!response.ok) {
                  throw new Error(
                    result.error || result.message || JSON.stringify(result),
                  );
                }

                alert("Employee Transfer Successful. Documents Regenerated.");
                setShowTransferModal(false);
                fetchEmployees();
              } catch (err) {
                console.error("Transfer Error:", err);
                alert(err.message);
              }
            }}
          >
            Submit Transfer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeTable;
