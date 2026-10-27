import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserTag,
  FaIdBadge,
} from "react-icons/fa";
import defaultImg from "./download.jfif";
import LoadingScreen from "../../components/loader/LoadingScreen";
const API_URL = import.meta.env.VITE_API_URL;
const IMG_URL = import.meta.env.VITE_FRONTEND_FOLDER;
const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `${API_URL}/api/users/${id}`,
          getAuthHeaders(),
        );
        // Handle both direct object and array responses
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setUser(data);
        console.log("user:", data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          setError("Failed to load user details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const getProfileImageSrc = () => {
    if (!user?.profile_image) return defaultImg;
    if (user.profile_image.startsWith("http") || user.profile_image.startsWith("data:") || user.profile_image.startsWith("blob:")) {
      return user.profile_image;
    }
    const cleanPath = user.profile_image.replace(/\\/g, "/").replace(/^\//, "");
    return `${import.meta.env.VITE_FRONTEND_FOLDER || ""}/api/${cleanPath}`;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !user) {
    return (
      <div className="page-container">
        <div className="alert alert-danger" style={{ fontSize: "13px" }}>
          {error || "User not found."}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/master/users")}
        >
          <FaArrowLeft className="me-2" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ fontSize: "13px" }}>
      {/* PAGE HEADER */}
      <div className="page-header mb-3">
        <h1 className="page-title m-0">User Details</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/master/users")}
        >
          <FaArrowLeft className="me-1" /> Back to Users
        </Button>
      </div>

      {/* DETAIL CARD */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <Row className="g-4">
            {/* LEFT — Profile Image + Name */}
            <Col xs={12} md={3} className="text-center border-end">
              <img
                src={getProfileImageSrc()}
                alt="Profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImg;
                }}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #dee2e6",
                  marginBottom: "12px",
                }}
              />
              <div className="fw-bold" style={{ fontSize: "14px" }}>
                {user.fullname ||
                  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  "N/A"}
              </div>
              <div className="mt-1">
                <Badge bg="primary" style={{ fontSize: "10px" }}>
                  {user.role || "No Role"}
                </Badge>
              </div>
            </Col>

            {/* RIGHT — Details Grid */}
            <Col xs={12} md={9}>
              <Row className="g-3">
                {/* Email */}
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-start gap-2">
                    <FaEnvelope
                      className="text-muted mt-1"
                      style={{ fontSize: "12px", flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#6c757d",
                          textTransform: "uppercase",
                        }}
                      >
                        Email
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        {user.email || "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Phone */}
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-start gap-2">
                    <FaPhone
                      className="text-muted mt-1"
                      style={{ fontSize: "12px", flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#6c757d",
                          textTransform: "uppercase",
                        }}
                      >
                        Contact No
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        {user.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Company */}
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-start gap-2">
                    <FaBuilding
                      className="text-muted mt-1"
                      style={{ fontSize: "12px", flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#6c757d",
                          textTransform: "uppercase",
                        }}
                      >
                        Company
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        {user.company_name_actual || user.company_name || "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Branch */}
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-start gap-2">
                    <FaIdBadge
                      className="text-muted mt-1"
                      style={{ fontSize: "12px", flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#6c757d",
                          textTransform: "uppercase",
                        }}
                      >
                        Branch
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        {user.branch_name_actual || user.branch_name || "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Role */}
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-start gap-2">
                    <FaUserTag
                      className="text-muted mt-1"
                      style={{ fontSize: "12px", flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#6c757d",
                          textTransform: "uppercase",
                        }}
                      >
                        Role
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        {user.role || "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Address */}
                <Col xs={12} sm={6}>
                  <div className="d-flex align-items-start gap-2">
                    <FaMapMarkerAlt
                      className="text-muted mt-1"
                      style={{ fontSize: "12px", flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#6c757d",
                          textTransform: "uppercase",
                        }}
                      >
                        Address
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        {[user.address, user.city, user.pincode]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* ADDITIONAL INFORMATION */}
      <Card className="shadow-sm border-0 mt-4">
        <Card.Header className="bg-light fw-bold" style={{ fontSize: "14px" }}>
          Additional Details
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4">
            {/* Bank Details */}
            <Col xs={12} md={4}>
              <div
                className="fw-bold text-muted mb-2"
                style={{ fontSize: "11px", textTransform: "uppercase" }}
              >
                Bank Location
              </div>
              <div style={{ fontSize: "12px" }}>
                <div>
                  <strong>City/State:</strong> {user.bank_city || "N/A"},{" "}
                  {user.bank_state || "N/A"}
                </div>
              </div>
            </Col>

            {/* Access/System Details */}
            <Col xs={12} md={4}>
              <div
                className="fw-bold text-muted mb-2"
                style={{ fontSize: "11px", textTransform: "uppercase" }}
              >
                System & Access
              </div>
              <div style={{ fontSize: "12px" }}>
                <div>
                  <strong>Status:</strong>{" "}
                  {user.active === "0" || !user.active ? "Active" : "Inactive"}
                </div>
                <div>
                  <strong>Employee Code:</strong> {user.emp_code || "N/A"}
                </div>
                <div>
                  <strong>Created On:</strong> {user.created_on || "N/A"}
                </div>
                <div>
                  <strong>Last Modified:</strong> {user.modified_on || "N/A"}
                </div>
              </div>
            </Col>

            {/* Site & Client Details */}
            <Col xs={12} md={4}>
              <div
                className="fw-bold text-muted mb-2"
                style={{ fontSize: "11px", textTransform: "uppercase" }}
              >
                Clients
              </div>
              <div style={{ fontSize: "12px" }}>
                {user.client_name
                  ? user.client_name.split(",").map((name, index) => (
                      <div
                        key={index}
                        className="mb-1 text-truncate"
                        title={name.trim()}
                      >
                        • {name.trim()}
                      </div>
                    ))
                  : "N/A"}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserDetailPage;
