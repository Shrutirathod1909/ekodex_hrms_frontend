import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import clientLogger from "../../utils/clientLogger";
import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Dropdown,
  Badge,
  Pagination,
} from "react-bootstrap";
import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrashAlt,
  FaVideo,
  FaExternalLinkAlt,
} from "react-icons/fa";

const TrainingVideoPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [search, setSearch] = useState("");

  // Form fields
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rank, setRank] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // ================= FETCH =================
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `${API_URL}/api/training-videos`,
        getAuthHeaders()
      );
      setVideos(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setError("Failed to load training videos");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search]);

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) { alert("Title is required"); return; }
    if (!videoLink.trim()) { alert("Video Link is required"); return; }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      rank: rank.trim(),
      video_link: videoLink.trim(),
      from_date: fromDate || null,
      to_date: toDate || null,
    };

    try {
      if (editingId) {
        await api.post(
          `${API_URL}/api/training-videos/update/${editingId}`,
          payload,
          getAuthHeaders()
        );
      } else {
        await api.post(
          `${API_URL}/api/training-videos`,
          payload,
          getAuthHeaders()
        );
      }
      resetForm();
      fetchVideos();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (video) => {
    setEditingId(video.id);
    setTitle(video.title || "");
    setDescription(video.description || "");
    setRank(video.rank || "");
    setVideoLink(video.video_link || "");
    setFromDate(video.from_date || "");
    setToDate(video.to_date || "");
    setShowForm(true);
    setShowSearch(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training video?")) return;

    try {
      await api.delete(`/api/training-videos/${id}`, getAuthHeaders());
      fetchVideos();
    } catch (err) {
      const msg = clientLogger.error("TrainingVideoPage.handleDelete", err);
      alert(`❌ Delete Failed:\n${msg}`);
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setRank("");
    setVideoLink("");
    setFromDate("");
    setToDate("");
    setShowForm(false);
  };

  // ================= FILTER =================
  const filteredVideos = videos.filter((v) =>
    v.title?.toLowerCase().includes(search.toLowerCase()) ||
    v.rank?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  return (
    <div className="page-container" style={{ fontSize: "11px" }}>

      {/* HEADER */}
      {!showForm && (
        <div className="page-header">
          <h1 className="page-title">
            Training Videos{" "}
            <span className="text-success">({filteredVideos.length})</span>
          </h1>

          <div className="page-actions">
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaSearch /> {showSearch ? "Hide Search" : "Search"}
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetForm();
                setShowForm(true);
                setShowSearch(false);
              }}
            >
              <FaPlus /> Add Video
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      {showSearch && !showForm && (
        <Card className="mb-3 p-3">
          <Row>
            <Col md={4}>
              <Form.Control
                placeholder="Search by Title or Rank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: "10px" }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* FORM */}
      {showForm && (
        <Card className="p-4 mb-3">
          <h2 className="page-title mb-3">
            {editingId ? "Edit Training Video" : "Add Training Video"}
          </h2>

          <Form onSubmit={handleSubmit} className="master-form">
            <Row className="g-3">

              {/* Title */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    placeholder="Enter video title"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Rank / Designation */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rank / Designation</Form.Label>
                  <Form.Control
                    type="text"
                    value={rank}
                    placeholder="e.g. Male Security Guard"
                    onChange={(e) => setRank(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Video Link */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Video Link <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="url"
                    value={videoLink}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Description */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    placeholder="Enter description"
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* From Date */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* To Date */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>
              </Col>

            </Row>

            <div className="d-flex justify-content-end mt-4 gap-2">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingId ? "Update Video" : "Save Video"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* TABLE */}
      {!showForm && (
        <Card>
          {loading ? (
            <Alert className="text-center m-0">Loading...</Alert>
          ) : error ? (
            <Alert variant="danger" className="text-center m-0">{error}</Alert>
          ) : (
            <>
              <Table bordered hover responsive>
                <thead className="table-secondary">
                  <tr>
                    <th width="60">Sr No.</th>
                    <th>Title & Rank</th>
                    <th width="100">From</th>
                    <th width="100">To</th>
                    <th width="160">Created / Modified</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentVideos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No training videos found
                      </td>
                    </tr>
                  ) : (
                    currentVideos.map((video, index) => (
                      <tr key={video.id}>
                        <td>{indexOfFirst + index + 1}</td>

                        <td>
                          <div style={{ fontWeight: 500 }}>{video.title}</div>
                          {video.rank && (
                            <div className="mt-1">
                              <Badge bg="secondary" style={{ fontSize: "10px" }}>
                                {video.rank}
                              </Badge>
                            </div>
                          )}
                        </td>

                        <td>{video.from_date || "—"}</td>
                        <td>{video.to_date || "—"}</td>

                        <td>
                          <div style={{ fontSize: "11px" }}>
                            <div>
                              <strong>Create:</strong>{" "}
                              {video.created_on ? video.created_on : "-"}
                            </div>
                            <div className="mt-1">
                              <strong>Modify:</strong>{" "}
                              {video.modified_on ? video.modified_on : "-"}
                            </div>
                          </div>
                        </td>

                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="secondary" size="sm" style={{ fontSize: "11px" }}>
                              Actions
                            </Dropdown.Toggle>

                            <Dropdown.Menu renderOnMount={true} popperConfig={{ strategy: "fixed" }}>
                              <Dropdown.Item onClick={() => handleEdit(video)}>
                                <FaPen className="me-2 text-primary" /> Edit
                              </Dropdown.Item>

                              <Dropdown.Item onClick={() => handleDelete(video.id)}>
                                <FaTrashAlt className="me-2 text-danger" /> Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* PAGINATION */}
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  />

                  {totalPages > 1 &&
                    [...Array(totalPages)]
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
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}

                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default TrainingVideoPage;
