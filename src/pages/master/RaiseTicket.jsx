import React, { useState, useEffect, useRef } from "react";
import { Card, Table, Button, Form, Row, Col, Modal } from "react-bootstrap";
import axios from "axios";
import * as XLSX from "xlsx";
import { FaSearch } from "react-icons/fa";
import { useContext } from "react";
import { PermissionsContext } from "../../components/context/PermissionsContext";
// Get base URL for APIs (same pattern as other pages in this project)
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Get current logged-in user from localStorage
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};
const currentUser = getUser();

const RaiseTicket = () => {
  const { permissions, getPermissionsByModule, getPermissionsByModuleId } =
    useContext(PermissionsContext);
  const raiseTicketPerms = getPermissionsByModuleId(29);
  // console.log("raiseTicketPerms", raiseTicketPerms);
  // State for Listing
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("Open");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Raise Query Modal State
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    ticket_detail: "",
  });
  const [ticketImage, setTicketImage] = useState(null);
  const [ticketVideo, setTicketVideo] = useState(null);

  // Admin Action Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionForm, setActionForm] = useState({
    status: "",
    admin_comment: "",
  });

  // Chat/Reply Modal State
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatReply, setChatReply] = useState("");
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Fetch Tickets on Load
  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter Logic when tickets or tab change (removed search/date dependencies for manual search)
  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [tickets, activeTab]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/raise_ticket`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTickets(response.data);
    } catch (err) {
      alert("Failed to fetch tickets.");
    }
  };

  const applyFilters = () => {
    let filtered = tickets.filter((ticket) => ticket.status === activeTab);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.ticketid?.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.raised_by?.toLowerCase().includes(q),
      );
    }

    if (fromDate) {
      filtered = filtered.filter(
        (t) => new Date(t.created_on) >= new Date(fromDate),
      );
    }

    if (toDate) {
      // To include the end of the day
      const endToDate = new Date(toDate);
      endToDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.created_on) <= endToDate);
    }

    setFilteredTickets(filtered);
  };

  // Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  // ----- Raise Query Handlers -----
  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.ticket_detail) {
      return alert("Subject and details are required!");
    }

    const formData = new FormData();
    formData.append("subject", ticketForm.subject);
    formData.append("ticket_detail", ticketForm.ticket_detail);

    if (ticketImage) formData.append("ticket_image", ticketImage);
    if (ticketVideo) formData.append("ticket_video", ticketVideo);

    try {
      await axios.post(`${API_BASE_URL}/raise_ticket`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Query raised successfully!");
      setShowRaiseModal(false);
      resetRaiseForm();
      fetchTickets();
    } catch (err) {
      alert("Failed to raise query.");
    }
  };

  const resetRaiseForm = () => {
    setTicketForm({ subject: "", ticket_detail: "" });
    setTicketImage(null);
    setTicketVideo(null);
  };

  // ----- Action Handlers -----
  const handleActionClick = (ticket) => {
    setSelectedTicket(ticket);
    setActionForm({
      status: ticket.status || "Open",
      admin_comment: ticket.admin_comment || "",
    });
    setShowActionModal(true);
  };

  const handleReplyClick = async (ticket) => {
    setSelectedTicket(ticket);
    setChatReply("");
    setShowChatModal(true);
    fetchReplies(ticket.id);
  };

  const fetchReplies = async (ticket_id) => {
    setRepliesLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/raise_ticket/replies/${ticket_id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setReplies(res.data);
      setTimeout(
        () => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch {
      setReplies([]);
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!chatReply.trim()) return;
    try {
      await axios.post(
        `${API_BASE_URL}/raise_ticket/reply/${selectedTicket.id}`,
        { message: chatReply },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setChatReply("");
      fetchReplies(selectedTicket.id);
      fetchTickets();
    } catch {
      alert("Failed to send reply.");
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/raise_ticket/action/${selectedTicket.id}`,
        actionForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      alert("Ticket action saved!");
      setShowActionModal(false);
      fetchTickets();
    } catch (err) {
      alert("Failed to update ticket action.");
    }
  };

  // ----- Excel Export -----
  const handleDownloadExcel = () => {
    if (filteredTickets.length === 0) return alert("No data to download!");

    const exportData = filteredTickets.map((t) => ({
      "Request Id": t.ticketid,
      "Raise By": t.raised_by || "System",
      Subject: t.subject,
      "Ticket Detail": t.ticket_detail,
      "Ticket Created": t.created_on,
      Status: t.status,
      "Admin Comment": t.admin_comment || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab}_Tickets`);
    XLSX.writeFile(wb, `${activeTab}_Tickets.xlsx`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="page-container" style={{ fontSize: "13px" }}>
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1 className="page-title">
          {activeTab} Queries{" "}
          <span className="text-success">({filteredTickets.length})</span>
        </h1>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={handleDownloadExcel}
          >
            ↓ Download {activeTab}
          </button>
          {currentUser?.role?.toLowerCase() !== "admin" && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowRaiseModal(true)}
            >
              + Raise Query
            </button>
          )}
        </div>
      </div>

      <p className="text-muted small mb-3">
        New tickets created will take a few minutes to appear here. We request
        your patience.
      </p>

      {/* TABS */}
      <div className="mb-3">
        <ul className="nav nav-tabs">
          {["Open", "Resolved", "Closed"].map((tab) => {
            const count = tickets.filter((t) => t.status === tab).length;
            return (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? "active fw-bold" : "text-secondary"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab} <span className="badge bg-secondary ms-1">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* FILTERS */}
      <Card className="mb-3 p-3">
        <Row className="align-items-end g-2">
          <Col md={2}>
            <Form.Label className="mb-1">From Date</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Form.Label className="mb-1">To Date</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label className="mb-1">Search</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search ID, Subject, Raise By..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={4} className="d-flex gap-2">
            <button className="btn btn-warning btn-sm" onClick={applyFilters}>
              <FaSearch className="me-1" /> Search
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              ↺ Reset
            </button>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card>
        <Table bordered hover responsive>
          <thead className="table-secondary">
            <tr>
              <th>Request Id</th>
              <th>Raise By</th>
              <th>Subject</th>
              <th>Ticket Created</th>
              <th>Status</th>
              <th>Remark</th>
              <th width="150" className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.length > 0 ? (
              currentTickets.map((ticket, index) => (
                <tr key={ticket.id}>
                  <td>{ticket.ticketid}</td>
                  <td>{ticket.raised_by || "User"}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.created_on}</td>
                  <td>
                    <span
                      className={`badge ${
                        ticket.status === "Open"
                          ? "bg-warning text-dark"
                          : ticket.status === "Resolved"
                            ? "bg-success"
                            : "bg-secondary"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  {/* Remark: shown only for Resolved/Closed */}
                  <td style={{ fontSize: "11px", color: "#555" }}>
                    {(ticket.status === "Resolved" ||
                      ticket.status === "Closed") &&
                    ticket.status_changed_by ? (
                      <>
                        <div>
                          <strong>{ticket.status}</strong> by{" "}
                          <strong>{ticket.status_changed_by}</strong>
                        </div>
                        <div>{ticket.status_changed_on}</div>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      {/* Action button: only Admin sees it */}
                      {currentUser?.role?.toLowerCase() === "admin" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleActionClick(ticket)}
                        >
                          Action
                        </button>
                      )}
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleReplyClick(ticket)}
                      >
                        Reply
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-3 text-muted">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-end mt-3 px-3 pb-3">
            <ul className="pagination mb-0">
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
      </Card>

      {/* ---------------- MODALS ---------------- */}

      {/* Raise Query Modal */}
      <Modal
        show={showRaiseModal}
        onHide={() => setShowRaiseModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "15px" }}>Need Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRaiseSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                Subject / Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter a brief title for your query"
                value={ticketForm.subject}
                onChange={(e) =>
                  setTicketForm({
                    ...ticketForm,
                    subject: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Please Describe the issue <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={4}
                value={ticketForm.ticket_detail}
                onChange={(e) =>
                  setTicketForm({
                    ...ticketForm,
                    ticket_detail: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Attach Image (Upto 5MB)</Form.Label>
                  <Form.Control
                    size="sm"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTicketImage(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Attach Video (Upto 50MB)</Form.Label>
                  <Form.Control
                    size="sm"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setTicketVideo(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowRaiseModal(false)}
              >
                Close
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Admin Action Modal */}
      <Modal
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "15px" }}>
            Ticket Action: {selectedTicket?.ticketid}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleActionSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                value={selectedTicket?.subject || ""}
                readOnly
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Issue Detail</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={3}
                value={selectedTicket?.ticket_detail || ""}
                readOnly
                disabled
              />
            </Form.Group>

            {/* Attachments */}
            {(selectedTicket?.image || selectedTicket?.video) && (
              <div className="mb-3 d-flex gap-2">
                {selectedTicket?.image && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}${selectedTicket.image.replace("/api", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-info"
                  >
                    View Image
                  </a>
                )}
                {selectedTicket?.video && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}${selectedTicket.video.replace("/api", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-info"
                  >
                    View Video
                  </a>
                )}
              </div>
            )}

            <hr />

            <Form.Group className="mb-3">
              <Form.Label>Update Status</Form.Label>
              <Form.Select
                size="sm"
                value={actionForm.status}
                onChange={(e) =>
                  setActionForm({ ...actionForm, status: e.target.value })
                }
              >
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Admin Comment / Remark</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={3}
                placeholder="Write your remarks here..."
                value={actionForm.admin_comment}
                onChange={(e) =>
                  setActionForm({
                    ...actionForm,
                    admin_comment: e.target.value.toUpperCase(),
                  })
                }
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowActionModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Save Action
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Chat / Reply Modal */}
      <Modal
        show={showChatModal}
        onHide={() => setShowChatModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600" }}>
              💬 {selectedTicket?.ticketid}{" "}
              <span
                className={`badge ms-2 ${selectedTicket?.status === "Open" ? "bg-warning text-dark" : selectedTicket?.status === "Resolved" ? "bg-success" : "bg-secondary"}`}
                style={{ fontSize: "10px" }}
              >
                {selectedTicket?.status}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#888" }}>
              {selectedTicket?.subject}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body style={{ padding: 0, backgroundColor: "#e9edef" }}>
          {/* Messages Area */}
          <div
            style={{ height: "300px", overflowY: "auto", padding: "10px 12px" }}
          >
            {/* Original Query (Description) */}
            {selectedTicket && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    String(selectedTicket.created_by) ===
                    String(currentUser?.id)
                      ? "flex-end"
                      : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      String(selectedTicket.created_by) ===
                      String(currentUser?.id)
                        ? "#d9fdd3"
                        : "#ffffff",
                    borderRadius:
                      String(selectedTicket.created_by) ===
                      String(currentUser?.id)
                        ? "8px 0px 8px 8px"
                        : "0px 8px 8px 8px",
                    padding: "7px 11px",
                    maxWidth: "80%",
                    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      marginBottom: "3px",
                      color:
                        String(selectedTicket.created_by) ===
                        String(currentUser?.id)
                          ? "#25d366"
                          : "#007bff",
                    }}
                  >
                    {selectedTicket.raised_by || "Client"}
                  </div>
                  <div
                    style={{
                      color: "#111",
                      lineHeight: "1.5",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedTicket.ticket_detail}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#888",
                      textAlign: "right",
                      marginTop: "3px",
                    }}
                  >
                    {selectedTicket.created_on?.substring(0, 16)}
                  </div>
                </div>
              </div>
            )}

            {/* Replies */}
            {repliesLoading ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: "12px",
                  marginTop: "30px",
                }}
              >
                Loading replies...
              </div>
            ) : replies.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: "11px",
                  marginTop: "10px",
                  marginBottom: "30px",
                }}
              >
                No replies yet. Start the conversation!
              </div>
            ) : (
              replies.map((reply) => {
                const isMine =
                  String(reply.reply_by_id) === String(currentUser?.id);
                return (
                  <div
                    key={reply.id}
                    style={{
                      display: "flex",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isMine ? "#d9fdd3" : "#ffffff",
                        borderRadius: isMine
                          ? "8px 0px 8px 8px"
                          : "0px 8px 8px 8px",
                        padding: "7px 11px",
                        maxWidth: "80%",
                        boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          marginBottom: "3px",
                          color: isMine ? "#25d366" : "#007bff",
                        }}
                      >
                        {reply.reply_by_name} ({reply.reply_role})
                      </div>
                      <div
                        style={{
                          color: "#111",
                          lineHeight: "1.5",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {reply.message}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#888",
                          textAlign: "right",
                          marginTop: "3px",
                        }}
                      >
                        {reply.created_on}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Reply Input Bar */}
          <div
            style={{
              backgroundColor: "#f0f2f5",
              borderTop: "1px solid #dee2e6",
              padding: "8px 12px",
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              rows={2}
              className="form-control form-control-sm"
              placeholder="Type a message..."
              value={chatReply}
              onChange={(e) => setChatReply(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReplySubmit();
                }
              }}
              style={{ resize: "none", fontSize: "12px", flex: 1 }}
            />
            <button
              className="btn btn-success btn-sm"
              onClick={handleReplySubmit}
              disabled={!chatReply.trim()}
              style={{
                whiteSpace: "nowrap",
                fontSize: "12px",
                marginBottom: "2px",
              }}
            >
              Send ➤
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RaiseTicket;
