
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPrint, FaFileExcel, FaUsers, FaArrowLeft } from "react-icons/fa";
import api from "../../api/axios";
import Select from "react-select";
import axios from "axios";
import "./attendancedetails.css";
import { Pagination } from "react-bootstrap";
import {
  Container,
  Card,
  Row,
  Col,
  Table,
  Button,
  Dropdown,
  Badge,
} from "react-bootstrap";
import LoadingScreen from "../../components/loader/LoadingScreen";

export default function AttendanceDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date");

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [attendancePage, setAttendancePage] = useState(1);
  const attendanceLimit = 20;

  useEffect(() => {
    if (date) fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const selectedDate = date.split("T")[0];

      const res = await api.get(
        `${import.meta.env.VITE_API_URL}/api/dashboard/site-wise-attendance`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            filterType: "custom",
            fromDate: selectedDate,
            toDate: selectedDate,
          },
        }
      );

      const data = res.data.data || [];

      setAttendance(
        data.map((item) => ({
          ...item,
          P: Number(item.P ?? item.p ?? item.total_P ?? 0),
          A: Number(item.A ?? item.a ?? item.total_A ?? 0),
          WO: Number(item.WO ?? item.wo ?? item.total_WO ?? 0),
          Unmarked: Number(
            item.Unmarked ?? item.unmarked ?? item.unmarked_count ?? 0
          ),
          FinalAbsent: Number(item.FinalAbsent ?? item.finalAbsent ?? 0),
        }))
      );

      setAttendancePage(1);
    } catch (err) {
      console.error("Attendance Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter((item) => {
    const text = search.trim().toLowerCase();

    return (
      !text ||
      item.ClientName?.toLowerCase().includes(text) ||
      item.SiteName?.toLowerCase().includes(text)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAttendance.length / attendanceLimit)
  );

  const currentPage = Math.min(attendancePage, totalPages);

  const attendanceList = filteredAttendance.slice(
    (currentPage - 1) * attendanceLimit,
    currentPage * attendanceLimit
  );

  const totalPresent = attendance.reduce((sum, item) => sum + item.P, 0);

  const totalAbsent = attendance.reduce(
    (sum, item) => sum + item.A + item.Unmarked,
    0
  );

  const formatDisplayDate = (value) => {
    if (!value) return "N/A";

    const [year, month, day] = value.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  };

  const getMonthYear = (value) => {
    const [year, month] = value.split("T")[0].split("-");

    return {
      at_month: Number(month),
      at_year: Number(year),
    };
  };

  const downloadAttendance = async (siteCode) => {
    try {
      const token = localStorage.getItem("token");
      const selectedDate = date.split("T")[0];

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dashboard/getAttendanceReport`,
        {
          fromDate: selectedDate,
          toDate: selectedDate,
          siteCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Attendance_${siteCode}_${selectedDate}.zip`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download Error:", err);
    }
  };

  const searchOptions = [
    ...new Set(
      attendance.flatMap((item) => [
        item.ClientName?.trim(),
        item.SiteName?.trim(),
      ])
    ),
  ]
    .filter(Boolean)
    .sort()
    .map((name) => ({ value: name, label: name }));

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
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

  if (loading) return <LoadingScreen />;

  return (
    <Container fluid className="attd-page py-3 px-3 px-lg-4">
      {/* HEADER */}
      <Card className="attd-header border-0 mb-4">
        <Card.Body className="p-3 p-lg-4">
          <Row className="align-items-center g-3">
            <Col xl={4} lg={5} md={12}>
              <div className="attd-heading">
                <div className="attd-heading-icon">
                  <FaUsers />
                </div>

                <div>
                  <div className="attd-eyebrow">ATTENDANCE MANAGEMENT</div>
                  <h3 className="attd-title">Attendance Report</h3>
                  <div className="attd-date">
                    Report Date: <strong>{formatDisplayDate(date)}</strong>
                  </div>
                </div>
              </div>
            </Col>

            <Col xl={4} lg={7} md={12}>
              <div className="attd-search-wrap">
                <div className="attd-search">
                  <Select
                    classNamePrefix="attd-select"
                    options={searchOptions}
                    placeholder="Search client or site..."
                    isClearable
                    isSearchable
                    value={
                      search
                        ? { value: search, label: search }
                        : null
                    }
                    onChange={(selected) => {
                      setSearch(selected?.value || "");
                      setAttendancePage(1);
                    }}
                  />
                </div>

                <Button
                  className="attd-reset-btn"
                  onClick={() => {
                    setSearch("");
                    setAttendancePage(1);
                  }}
                >
                  Reset
                </Button>
              </div>
            </Col>

            <Col xl={3} lg={8} md={12}>
              <Row className="g-2">
                <Col xs={4}>
                  <div className="attd-stat attd-stat-present">
                    <span className="attd-stat-label">Present</span>
                    <strong>{totalPresent}</strong>
                  </div>
                </Col>

                <Col xs={4}>
                  <div className="attd-stat attd-stat-absent">
                    <span className="attd-stat-label">Absent</span>
                    <strong>{totalAbsent}</strong>
                  </div>
                </Col>

                <Col xs={4}>
                  <div className="attd-stat attd-stat-sites">
                    <span className="attd-stat-label">Sites</span>
                    <strong>{attendance.length}</strong>
                  </div>
                </Col>
              </Row>
            </Col>
<Col xl={1} lg={4} md={12}>
  <Button
    type="button"
    className="attd-back-btn w-100"
    onClick={() => {
      if (window.history.state?.idx > 0) {
        navigate(-1);
      } else {
        navigate("/dashboard", { replace: true });
      }
    }}
  >
    <FaArrowLeft className="me-2" />
    Back
  </Button>
</Col>
          </Row>
        </Card.Body>
      </Card>

      {/* TABLE CARD */}
      <Card className="attd-table-card border-0">
        <div className="attd-table-toolbar">
          <div>
            <h5 className="attd-table-title">Site-wise Attendance</h5>
            <p className="attd-table-subtitle mb-0">
              Showing {filteredAttendance.length
                ? (currentPage - 1) * attendanceLimit + 1
                : 0}
              {" - "}
              {Math.min(currentPage * attendanceLimit, filteredAttendance.length)}
              {" of "}
              {filteredAttendance.length} records
            </p>
          </div>

          <Badge bg="light" text="dark" className="attd-record-badge">
            {filteredAttendance.length} Records
          </Badge>
        </div>

        <div className="attd-table-scroll">
          <Table hover className="attd-table mb-0">
            <thead>
              <tr>
                <th className="attd-col-sr">Sr.</th>
                <th className="attd-col-code">Client Code</th>
                <th>Client Name</th>
                <th>Site Name</th>
                <th className="attd-col-number">Manpower</th>
                <th className="attd-col-number">Present</th>
                <th className="attd-col-number">Absent</th>
                <th className="attd-col-number">Unmarked</th>
                <th className="attd-col-number">WO</th>
                <th className="attd-col-action">Action</th>
              </tr>
            </thead>

            <tbody>
              {attendanceList.length > 0 ? (
                attendanceList.map((row, index) => (
                  <tr key={row.site_id ?? row.SiteCode ?? index}>
                    <td className="attd-col-sr">
                      {(currentPage - 1) * attendanceLimit + index + 1}
                    </td>

                    <td className="attd-col-code">
                      <span className="attd-code">
                        {row.SiteCode ?? "-"}
                      </span>
                    </td>

                    <td>
                      <span className="attd-client-name">
                        {row.ClientName || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="attd-site-name">
                        {row.SiteName || "-"}
                      </span>
                    </td>

                    <td className="attd-col-number">
                      {row.TotalManpowerOfSite ?? 0}
                    </td>

                    <td className="attd-col-number">
                      <span className="attd-count attd-count-present">
                        {row.P}
                      </span>
                    </td>

                    <td className="attd-col-number">
                      <span className="attd-count attd-count-absent">
                        {row.A}
                      </span>
                    </td>

                    <td className="attd-col-number">
                      <span className="attd-count attd-count-unmarked">
                        {row.Unmarked}
                      </span>
                    </td>

                    <td className="attd-col-number">
                      <span className="attd-count attd-count-wo">
                        {row.WO}
                      </span>
                    </td>

                    <td className="attd-col-action">
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          size="sm"
                          className="attd-action-btn"
                          id={`attd-action-${row.site_id ?? row.SiteCode ?? index}`}
                        >
                          Action
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="attd-action-menu">
                          <Dropdown.Item
                            onClick={() => {
                              const monthYear = getMonthYear(date);

                              navigate(
                                "/attendance/attendance-by-employee/PrintAttendanceWithTime",
                                {
                                  state: {
                                    attendance: {
                                      ...row,
                                      site_id: row.site_id,
                                      site_name: row.SiteName,
                                      company_name: row.ClientName,
                                      at_month: monthYear.at_month,
                                      at_year: monthYear.at_year,
                                      att_type: "Both",
                                    },
                                  },
                                }
                              );
                            }}
                          >
                            <FaPrint className="me-2" />
                            Print With Time
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() => downloadAttendance(row.SiteCode)}
                          >
                            <FaFileExcel className="me-2" />
                            Download Excel
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="attd-empty">
                    <FaUsers className="attd-empty-icon" />
                    <strong>No Attendance Found</strong>
                    <span>Try changing your search or selected date.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* PAGINATION */}
        {filteredAttendance.length > 0 && (
          <div className="attd-pagination-wrap">
            <span className="attd-page-info">
              Page {currentPage} of {totalPages}
            </span>

            <Pagination className="attd-pagination mb-0">
              <Pagination.First
                disabled={currentPage === 1}
                onClick={() => setAttendancePage(1)}
              />

              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setAttendancePage(currentPage - 1)}
              />

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <Pagination.Ellipsis
                    key={`ellipsis-${index}`}
                    disabled
                  />
                ) : (
                  <Pagination.Item
                    key={page}
                    active={currentPage === page}
                    onClick={() => setAttendancePage(page)}
                  >
                    {page}
                  </Pagination.Item>
                )
              )}

              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setAttendancePage(currentPage + 1)}
              />

              <Pagination.Last
                disabled={currentPage === totalPages}
                onClick={() => setAttendancePage(totalPages)}
              />
            </Pagination>
          </div>
        )}
      </Card>
    </Container>
  );
}
