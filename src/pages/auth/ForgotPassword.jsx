import React, { useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  InputGroup,
  Image,
} from "react-bootstrap";

import { FaUser } from "react-icons/fa";

// import logo from "../../assets/images/ods_logo.jpeg";
import logo from "../../assets/images/logo2.jpg";

import Footer from "../../layouts/Footer";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const res = await api.post(
        `${import.meta.env.VITE_API_URL}/api/froget/forgot-password`,
        { email }
      );

      setMessage(res.data.message);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        background:
          "linear-gradient(to right, #f8f9fa, #eef1ff)",
      }}
    >

      {/* MAIN */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-4">

        <Container>

          <Card
            className="shadow-lg border-0 mx-auto w-100"
            style={{
              maxWidth: "950px",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >

            <Row className="g-0">

              {/* LEFT SIDE */}
              <Col
                xs={12}
                lg={6}
                className="bg-white p-4 d-flex flex-column justify-content-center"
              >

                {/* LOGO */}
                

                {/* HEADING */}
                <div className="text-center mb-4">

                  <h3 style={{ color: "#2f2d69", fontWeight: "bold" }}>
                    Forgot Password
                  </h3>

                  <p className="text-muted small">
                    Enter your email to receive reset link
                  </p>

                </div>

                {/* FORM */}
                <Form onSubmit={handleSubmit}>

                  {/* EMAIL */}
                  <Form.Group className="mb-3">

                    <InputGroup>

                      <InputGroup.Text>
                        <FaUser />
                      </InputGroup.Text>

                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        isInvalid={submitted && !email}
                        className="py-2"
                      />

                    </InputGroup>

                    {submitted && !email && (
                      <small className="text-danger">
                        Email is required
                      </small>
                    )}

                  </Form.Group>

                  {/* ERROR */}
                  {error && (
                    <Alert variant="danger">
                      {error}
                    </Alert>
                  )}

                  {/* SUCCESS */}
                  {message && (
                    <Alert variant="success">
                      {message}
                    </Alert>
                  )}

                  {/* BUTTON */}
                  <div className="d-grid mb-3">

                    <Button
                      type="submit"
                      style={{
                        backgroundColor: "#2f2d69",
                        border: "none",
                        padding: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      SEND RESET LINK
                    </Button>

                  </div>

                  {/* BACK */}
                  <div className="text-center">

                    <Link
                      to="/login"
                      className="text-decoration-none small"
                      style={{ color: "#2f2d69" }}
                    >
                      Back to Login
                    </Link>

                  </div>

                </Form>

              </Col>

              {/* RIGHT SIDE */}
          {/* RIGHT SIDE */}

          <Col
            xs={12}
            lg={6}
            className="
            d-flex
            align-items-center
            justify-content-center
            bg-light
            p-3
            p-md-4
            "
          >

            <Image
              src={logo}
              alt="Company Logo"
              fluid
              rounded
              style={{
                width: "100%",
                maxWidth: "320px",
                objectFit: "contain",
              }}
            />

          </Col>

            </Row>

          </Card>

        </Container>

      </div>

      <Footer />

    </div>
  );
}