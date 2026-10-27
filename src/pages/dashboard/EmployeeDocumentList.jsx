
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  FaSearch,
  FaFileAlt,
  FaUser,
} from "react-icons/fa";

import "./EmployeeDocumentList.css";

const DOCUMENTS = [
  "Aadhar",
  "PAN",
  "Passport",
  "Bank",
  "PF",
  "UAN",
  "ESIC",
];

const normalizeStatus = (value) => {
  if (value === null || value === undefined) return "";

  const status = String(value).trim().toUpperCase();

  if (status === "APPROVED") return "VERIFIED";
  if (status === "REJECTED") return "NOT VERIFIED";

  return status;
};

export default function EmployeeDocumentList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { documentType } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeDocument = DOCUMENTS.find(
    (doc) =>
      doc.toLowerCase() ===
      String(documentType || "").toLowerCase()
  );

  const activeDoc = activeDocument || "Aadhar";

  const [activeStatus, setActiveStatus] = useState(
    location.state?.status || "All"
  );

  // Keep status in sync when browser navigation changes the route.
  useEffect(() => {
    setActiveStatus(location.state?.status || "All");
    setCurrentPage(1);
  }, [location.pathname, location.key, location.state]);

  // Fetch employees once when this component mounts.
  useEffect(() => {
    let cancelled = false;
const loadData = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    console.log("TOKEN EXISTS:", !!token);

    if (!token) {
      setError("Login token not found. Please login again.");
      return;
    }

    const res = await api.get(
      "/api/dashboard/employee-doc-dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("DOCUMENT API:", res.data);

    setEmployees(res.data?.data?.employees || []);
  } catch (err) {
    console.error("Document API Error:", err);
    console.error("Status:", err.response?.status);
    console.error("Response:", err.response?.data);
  } finally {
    setLoading(false);
  }
};

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve the status field for the selected document.
  const getDocumentStatus = (emp) => {
    const key = activeDoc.toLowerCase();

    const fieldMap = {
      aadhar: ["aadhar_status", "aadhaar_status", "Aadhar"],
      pan: ["pan_status", "PAN"],
      passport: ["passport_status", "Passport"],
      bank: ["bank_status", "bank_account_status", "Bank"],
      pf: ["pf_status", "PF"],
      uan: ["uan_status", "UAN"],
      esic: ["esic_status", "ESIC"],
    };

    const possibleFields = fieldMap[key] || [
      `${key}_status`,
      activeDoc,
    ];

    for (const field of possibleFields) {
      const value = emp[field];

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return "";
  };

  const filteredEmployees = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return employees.filter((emp) => {
      const searchableFields = [
        emp.employee_code,
        emp.emp_full_name,
        emp.company_name,
        emp.site_name,
      ];

      const searchMatch =
        !searchText ||
        searchableFields.some((value) =>
          String(value ?? "").toLowerCase().includes(searchText)
        );

      const documentStatus = normalizeStatus(
        getDocumentStatus(emp)
      );

      const statusMatch =
        activeStatus === "All" ||
        documentStatus === normalizeStatus(activeStatus);

      return searchMatch && statusMatch;
    });
  }, [employees, search, activeDoc, activeStatus]);

  const totalPages = Math.ceil(
    filteredEmployees.length / rowsPerPage
  );

  const safeTotalPages = Math.max(1, totalPages);

  useEffect(() => {
    if (currentPage > safeTotalPages) {
      setCurrentPage(safeTotalPages);
    }
  }, [currentPage, safeTotalPages]);

  const indexOfFirst = (currentPage - 1) * rowsPerPage;

  const currentEmployees = filteredEmployees.slice(
    indexOfFirst,
    indexOfFirst + rowsPerPage
  );

  const getPaginationPages = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const changeDocument = (doc) => {
    setCurrentPage(1);

    navigate(`/employee/document-list/${doc}`, {
      state: { status: activeStatus },
    });
  };

  const changeStatus = (status) => {
    setActiveStatus(status);
    setCurrentPage(1);

    navigate(location.pathname, {
      replace: true,
      state: { status },
    });
  };

  return (
    <div className="document-page">
      {/* HEADER */}
      <div className="document-header">
        <h2>
          <FaFileAlt />
          &nbsp; Employee Documents ({filteredEmployees.length})
        </h2>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {/* DOCUMENT TABS AND STATUS */}
      <div className="document-filter-card">
        <div className="filter-left">
          <h4>Employee Documents</h4>

          <div className="tabs">
            {DOCUMENTS.map((doc) => (
              <button
                type="button"
                key={doc}
                className={
                  activeDoc === doc ? "active-tab" : ""
                }
                onClick={() => changeDocument(doc)}
              >
                {doc}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-right">
          <label htmlFor="document-status">Status</label>

          <select
            id="document-status"
            value={activeStatus}
            onChange={(e) => changeStatus(e.target.value)}
          >
            <option value="All">All Documents</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="NOT VERIFIED">Not Verified</option>
          </select>
        </div>
      </div>

      {/* SEARCH AND ROW COUNT */}
      <div className="document-card">
        <div className="search-box">
          <FaSearch />

          <input
            type="text"
            placeholder="Search Employee Code, Name, Company or Site"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="rows-per-page">
          <label htmlFor="rows-per-page">Rows per page:</label>

          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>
                  <FaUser /> Employee
                </th>
                <th>{activeDoc} Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    Loading employee documents...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    <div>{error}</div>

                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : currentEmployees.length > 0 ? (
                currentEmployees.map((emp, index) => (
                  <tr
                    key={
                      emp.employee_id ??
                      emp.employee_code ??
                      `${indexOfFirst}-${index}`
                    }
                  >
                    <td>{indexOfFirst + index + 1}</td>

                    <td>
                      <div className="employee">
                        <div className="avatar">
                          {emp.emp_full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </div>

                        <div>
                          <b>{emp.employee_code || "—"}</b>
                          <br />
                          <span>
                            {emp.emp_full_name || "Unknown Employee"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusBadge
                        value={getDocumentStatus(emp)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading &&
          !error &&
          filteredEmployees.length > 0 && (
            <div className="pagination-footer">
              <span>
                Showing {indexOfFirst + 1}–
                {Math.min(
                  indexOfFirst + rowsPerPage,
                  filteredEmployees.length
                )}{" "}
                of {filteredEmployees.length}
              </span>

              <div className="pagination-box">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  «
                </button>

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  ‹
                </button>

                {getPaginationPages().map((page, index) =>
                  page === "..." ? (
                    <span key={`dots-${index}`} className="dots">
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={page}
                      className={
                        currentPage === page ? "active-page" : ""
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={currentPage >= safeTotalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, safeTotalPages)
                    )
                  }
                >
                  ›
                </button>

                <button
                  type="button"
                  disabled={currentPage >= safeTotalPages}
                  onClick={() => setCurrentPage(safeTotalPages)}
                >
                  »
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const status = normalizeStatus(value);

  if (!status) {
    return (
      <span className="badge not-upload">
        NOT UPLOADED
      </span>
    );
  }

  if (status === "VERIFIED") {
    return (
      <span className="badge verified">
        VERIFIED
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span className="badge pending">
        PENDING
      </span>
    );
  }

  if (status === "NOT VERIFIED") {
    return (
      <span className="badge rejected">
        NOT VERIFIED
      </span>
    );
  }

  return (
    <span className="badge rejected">
      {String(value)}
    </span>
  );
}
