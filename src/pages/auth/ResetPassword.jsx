import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Row,
  Col
} from "react-bootstrap";

import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// import logo from "../../assets/images/ods_logo.jpeg";
import logo from "../../assets/images/logo2.jpg";


const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/froget/reset-password/${token}`,
        {
          newPassword,
          confirmPassword
        }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Card className="shadow p-3" style={{ width: "800px" }}>
        <Row>

          {/* LEFT SIDE FORM */}
          <Col md={6} className="p-4">
            <h4 className="text-center mb-3">Reset Password</h4>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>

              {/* New Password */}
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>

                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <InputGroup.Text
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              {/* Confirm Password */}
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>

                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <InputGroup.Text
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Button
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </Form>
          </Col>

          {/* RIGHT SIDE LOGO */}
          <Col md={6} className="d-flex align-items-center justify-content-center bg-light">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "70%", objectFit: "contain" }}
            />
          </Col>

        </Row>
      </Card>
    </Container>
  );
}