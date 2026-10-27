import React, { useEffect, useState } from "react";
import axios from "axios";

import { Card, Row, Col, Table, Spinner, Button, Badge } from "react-bootstrap";

import { useParams, useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaUniversity,
  FaUserTie,
  FaMapMarkerAlt,
  FaPrint,
  FaDownload,
} from "react-icons/fa";
import { useIsRTL } from "react-bootstrap/esm/ThemeProvider";

const API_URL = import.meta.env.VITE_API_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_FOLDER;

const EmployeeView = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [employee, setEmployee] = useState({});

  const [documents, setDocuments] = useState([]);

  const [experience, setExperience] = useState([]);

  const [family, setFamily] = useState([]);

  const [user, setUser] = useState([]);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employees/view/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setEmployee(res.data.employee);
      console.log("employee:", res.data.employee);

      setDocuments(res.data.documents || []);

      setExperience(res.data.experience || []);
      setUser(res.data.userdetail || []);

      setFamily(res.data.family || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const parseArrayField = (field) => {
    try {
      if (Array.isArray(field)) {
        return field.join(", ");
      }

      if (typeof field === "string" && field.startsWith("[")) {
        return JSON.parse(field).join(", ");
      }

      return field || "N/A";
    } catch {
      return field || "N/A";
    }
  };

  // PRINT

  // const handlePrint = () => {
  //   window.print();
  // };

  // // DOWNLOAD

  // const handleDownload = () => {

  //   const element =
  //     document.getElementById("employee-profile");

  //   const printWindow = window.open("", "_blank");

  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Employee Profile</title>

  //         <style>

  //           body{
  //             font-family:Arial;
  //             padding:20px;
  //           }

  //           table{
  //             width:100%;
  //             border-collapse:collapse;
  //           }

  //           table,th,td{
  //             border:1px solid #ccc;
  //           }

  //           th,td{
  //             padding:10px;
  //           }

  //         </style>

  //       </head>

  //       <body>

  //         ${element.innerHTML}

  //       </body>

  //     </html>
  //   `);

  //   printWindow.document.close();

  //   printWindow.print();

  // };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div
      id="employee-profile"
      className="container-fluid py-4"
      style={{
        background: "linear-gradient(to right,#f8fafc,#eef6ff)",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}

      <Card
        className="border-0 shadow-lg mb-4 overflow-hidden"
        style={{
          borderRadius: "20px",
        }}
      >
        <div className="header-gradient p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            {/* LEFT */}

            <div className="d-flex align-items-start gap-3 flex-wrap">
              {/* IMAGE */}

              <div className="profile-wrapper">
                <img
                  src={
                    employee.employee_logo
                      ? employee.employee_logo.startsWith("http")
                        ? employee.employee_logo
                        : `${import.meta.env.VITE_FRONTEND_FOLDER}/api/${employee.employee_logo.replace(/\\/g, "/")}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="profile"
                  className="profile-img"
                />
              </div>

              {/* INFO */}

              <div>
                <h3 className="fw-bold mb-1 text-dark">
                  {employee.emp_full_name || "Employee"}
                </h3>

                <h6 className="text-secondary mb-2">
                  {employee.rank || "N/A"}
                </h6>

                {/* SMALL CONTACT */}

                <div className="small-contact mb-2">
                  <span>
                    <FaPhone /> {employee.phone1 || "N/A"}
                  </span>

                  <span>
                    <FaEnvelope /> {employee.email_id || "N/A"}
                  </span>

                  <span>
                    <FaUserTie /> {employee.gender || "N/A"}
                  </span>
                </div>

                {/* BADGES */}

                <div className="d-flex flex-wrap gap-2 mb-2">
                  <Badge bg="light" text="dark" className="custom-badge">
                    <FaIdCard /> EMP : {employee.employee_code || "N/A"}
                  </Badge>

                  <Badge bg="info" className="custom-badge">
                    Dept : {employee.department || "N/A"}
                  </Badge>
                </div>

                {/* ONE LINE */}

                <div className="extra-line">
                  <span>
                    <strong>DOJ :</strong> {employee.date_of_joining || "N/A"}
                  </span>
                  <span className="mx-2">|</span>
                  <span>
                    <strong>Offer Letter :</strong>{" "}
                    {employee.offer_letter ? (
                      <a
                        href={`${import.meta.env.VITE_FRONTEND_FOLDER}/api/${employee.offer_letter_img_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        View ({employee.offer_letter_ref_no || "N/A"})
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                  <span className="mx-2">|</span>
                  <span>
                    <strong>Posting Order :</strong>{" "}
                    {employee.appointment_letter_img_path ? (
                      <a
                        href={`${import.meta.env.VITE_FRONTEND_FOLDER}/api/${employee.appointment_letter_img_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        View ({employee.offer_letter_ref_no || "N/A"})
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                  <span className="mx-2">|</span>
                  <span>
                    <strong>ID Card :</strong>{" "}
                    {employee.emp_id_card ? (
                      <a
                        href={`${import.meta.env.VITE_FRONTEND_FOLDER}/api/${employee.emp_id_card}`}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        View
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="d-flex gap-2 mt-3 mt-md-0 no-print">
              {/* <Button
                variant="dark"
                onClick={handlePrint}
              >
                <FaPrint /> Print
              </Button>

              <Button
                variant="success"
                onClick={handleDownload}
              >
                <FaDownload /> Download
              </Button> */}

              <Button variant="primary" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {/* PERSONAL + ADDRESS DETAILS */}

      <Card className="custom-card mb-4">
        <Card.Body className="p-4">
          <h4 className="section-title">Personal & Address Details</h4>

          <Row>
            {/* PERSONAL DETAILS */}

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Date Of Birth</label>

                <h6>{employee.dob || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Blood Group</label>

                <h6>{employee.blood_group || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Marital Status</label>

                <h6>{employee.marital_status || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Aadhar No</label>

                <h6>{employee.aadhar_no || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>PAN Card</label>

                <h6>{employee.pancard_no || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Department</label>

                <h6>{employee.department || "N/A"}</h6>
              </div>
            </Col>

            {/* PRESENT ADDRESS */}

            <Col md={4} className="mb-3">
              <div className="detail-box h-100">
                <div className="d-flex align-items-start gap-2">
                  <FaMapMarkerAlt className="address-icon mt-1" />

                  <div>
                    <label>Present Address</label>

                    <h6>
                      {employee.address || ""}, {employee.city || ""},{" "}
                      {employee.state || ""} - {employee.pincode || ""},{" "}
                      {employee.country || ""}
                    </h6>
                  </div>
                </div>
              </div>
            </Col>

            {/* PERMANENT ADDRESS */}

            <Col md={4} className="mb-3">
              <div className="detail-box h-100">
                <div className="d-flex align-items-start gap-2">
                  <FaMapMarkerAlt className="address-icon mt-1" />

                  <div>
                    <label>Permanent Address</label>

                    <h6>
                      {employee.p_address || ""}, {employee.p_city || ""},{" "}
                      {employee.p_state || ""} - {employee.p_pincode || ""},{" "}
                      {employee.p_country || ""}
                    </h6>
                  </div>
                </div>
              </div>
            </Col>

            {/* NATIVE ADDRESS */}

            <Col md={4} className="mb-3">
              <div className="detail-box h-100">
                <div className="d-flex align-items-start gap-2">
                  <FaMapMarkerAlt className="address-icon mt-1" />

                  <div>
                    <label>Native Address</label>

                    <h6>
                      {employee.native_address || ""},{" "}
                      {employee.native_city || ""},{" "}
                      {employee.native_state || ""} -{" "}
                      {employee.native_pincode || ""},{" "}
                      {employee.native_country || ""}
                    </h6>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* EMERGENCY */}

      <Card className="custom-card mb-4">
        <Card.Body className="p-4">
          <h4 className="section-title">Emergency Contact</h4>

          <Row>
            <Col md={3} className="mb-3">
              <div className="detail-box">
                <label>Person</label>

                <h6>{parseArrayField(employee.contact_person)}</h6>
              </div>
            </Col>

            <Col md={3} className="mb-3">
              <div className="detail-box">
                <label>Mobile</label>

                <h6>{parseArrayField(employee.contact_mobile)}</h6>
              </div>
            </Col>

            <Col md={3} className="mb-3">
              <div className="detail-box">
                <label>Relation</label>

                <h6>{parseArrayField(employee.contact_relation)}</h6>
              </div>
            </Col>

            <Col md={3} className="mb-3">
              <div className="detail-box">
                <label>Email</label>

                <h6>{parseArrayField(employee.contact_email)}</h6>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* REFERENCE DETAILS */}

      <Card className="custom-card mb-4">
        <Card.Body className="p-4">
          <h4 className="section-title">Reference Details</h4>

          <Row>
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Name</label>

                <h6>{employee.reference_name || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Mobile</label>

                <h6>{employee.reference_mobile || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Relation</label>

                <h6>{employee.reference_relation || "N/A"}</h6>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* BANK DETAILS */}


      <Card className="custom-card mb-4">
        <Card.Body className="p-4">
          <h4 className="section-title">
            <FaUniversity /> Bank Details
          </h4>

          <Row>
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Account Holder</label>

                <h6>{employee.ac_holder_name || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Bank Name</label>

                <h6>{employee.bank_name || "N/A"}</h6>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Account No</label>

                <h6>{employee.account_no || "N/A"}</h6>
              </div>
            </Col>

            {/* IFSC CODE */}

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>IFSC Code</label>

                <h6>{employee.bank_ifsc || "N/A"}</h6>
              </div>
            </Col>

            {/* MICR CODE */}

            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>MICR Code</label>

                <h6>{employee.bank_micr || "N/A"}</h6>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* EXPERIENCE */}
      <Card className="custom-card mb-4">
        <Card.Body className="p-3">
          <h4 className="section-title mb-3">Experience</h4>

          {experience.length > 0 ? (
            <Row>
              {experience.map((exp, index) => (
                <Col lg={4} md={6} className="mb-3" key={index}>
                  <div
                    className="detail-box h-100"
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    {/* 1st Row */}

                    <Row>
                      <Col xs={4} className="mb-2">
                        <label className="small-label">Designation</label>

                        <h6 className="small-text">
                          {exp.emp_designation || "N/A"}
                        </h6>
                      </Col>

                      <Col xs={4} className="mb-2">
                        <label className="small-label">Company</label>

                        <h6 className="small-text">
                          {exp.emp_company_name || "N/A"}
                        </h6>
                      </Col>

                      <Col xs={4} className="mb-2">
                        <label className="small-label">Joined</label>

                        <h6 className="small-text">
                          {exp.emp_joined_date || "N/A"}
                        </h6>
                      </Col>
                    </Row>

                    {/* 2nd Row */}

                    <Row>
                      <Col xs={6}>
                        <label className="small-label">Last Working</label>

                        <h6 className="small-text">
                          {exp.last_working_date || "N/A"}
                        </h6>
                      </Col>

                      <Col xs={6}>
                        <label className="small-label">CTC</label>

                        <h6 className="small-text">
                          ₹ {exp.annual_ctc || "0"}
                        </h6>
                      </Col>
                    </Row>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <p>No Experience Found</p>
          )}
        </Card.Body>
      </Card>

      {/* DOCUMENTS */}

      <Card className="custom-card mb-4">
        <Card.Body className="p-4">
          <h4 className="section-title">Documents</h4>

          <Table responsive hover className="custom-table align-middle">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Status</th>
                <th>Remark</th>
                <th>Document</th>
              </tr>
            </thead>

            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.doc_type}</td>

                    <td>
                      {doc.doc_name
                        ? (doc.doc_name || "").replace(/\\/g, "/").split("/").pop()
                        : ""}
                    </td>

                    <td>
                      <Badge
                        bg={
                          doc.doc_status === "Verified" ? "success" : "warning"
                        }
                      >
                        {doc.doc_status}
                      </Badge>
                    </td>

                    <td>{doc.doc_remark}</td>

                    <td>
                      {doc.doc_name ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            const raw = (doc.doc_name || "").replace(/\\/g, "/").replace(/^\//, "");
                            const fullUrl = raw.startsWith("http")
                              ? raw
                              : `${import.meta.env.VITE_FRONTEND_FOLDER || ""}/api/${raw}`;
                            window.open(fullUrl, "_blank");
                          }}
                        >
                          View
                        </Button>
                      ) : (
                        "No File"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Documents Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* FAMILY */}

      <Card className="custom-card mb-4">
        <Card.Body className="p-4">
          <h4 className="section-title">Family Details</h4>

          <Table responsive hover className="custom-table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Relation</th>
                <th>Gender</th>
                <th>Contact</th>
              </tr>
            </thead>

            <tbody>
              {family.length > 0 ? (
                family.map((fam, index) => (
                  <tr key={index}>
                    <td>{fam.f_relative_name}</td>

                    <td>{fam.f_relation}</td>

                    <td>{fam.f_gender}</td>

                    <td>{fam.f_contact}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No Family Details Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* SEPARATION DETAILS */}
      <Card className="custom-card mb-4">
        <Card.Body className="p-4">
          <h4 className="section-title">Separation Details</h4>
          <Row className="g-4">
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Separation Type</label>
                <h6>{employee.separation_type || "N/A"}</h6>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Reason</label>
                <h6>{employee.separate_reason || "N/A"}</h6>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Date of Separation</label>
                <h6>{employee.date_of_separation || "N/A"}</h6>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Notice Period</label>
                <h6>{employee.notice_period || "N/A"}</h6>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Last Working Date</label>
                <h6>{employee.last_working_date_sp || "N/A"}</h6>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="detail-box">
                <label>Handover Given To</label>
                <h6>{employee.handover_given_to || "N/A"}</h6>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* CSS */}

      <style>
        {`

  .header-gradient{
    background:linear-gradient(135deg,#dbeafe,#f8fafc);
  }

  .profile-img{
    width:85px;
    height:85px;
    border-radius:50%;
    object-fit:cover;
    border:3px solid #fff;
    box-shadow:0 4px 12px rgba(0,0,0,0.12);
  }

  .custom-card{
    border:none;
    border-radius:14px;
    box-shadow:0 4px 12px rgba(0,0,0,0.05);
    overflow:hidden;
  }

  .section-title{
    font-size:18px;
    font-weight:700;
    color:#0284c7;
    margin-bottom:16px;
  }

  .custom-badge{
    padding:6px 10px;
    font-size:11px;
    border-radius:8px;
    font-weight:600;
  }

  .small-contact{
    display:flex;
    flex-wrap:wrap;
    gap:12px;
    font-size:12px;
    color:#475569;
    margin-top:10px;
  }

  .small-contact div{
    display:flex;
    align-items:center;
    gap:5px;
    background:#ffffff;
    padding:6px 10px;
    border-radius:8px;
    border:1px solid #e2e8f0;
  }

  .extra-line{
    display:flex;
    flex-wrap:wrap;
    gap:14px;
    font-size:12px;
    color:#334155;
    margin-top:10px;
  }

  .extra-line div{
    background:#fff;
    padding:6px 10px;
    border-radius:8px;
    border:1px solid #e2e8f0;
  }

  .detail-box{
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:10px;
    padding:12px;
    min-height:85px;
    transition:0.3s;
  }

  .detail-box:hover{
    transform:translateY(-2px);
    box-shadow:0 5px 10px rgba(0,0,0,0.04);
  }

  .address-box{
    display:flex;
    gap:12px;
    background:#f8fafc;
    padding:14px;
    border-radius:10px;
    border:1px solid #e2e8f0;
    min-height:85px;
  }

  .address-icon{
    color:#0284c7;
    font-size:18px;
    margin-top:4px;
  }

  .experience-box{
    border-left:4px solid #0ea5e9;
    background:#f8fafc;
    padding:15px;
    border-radius:10px;
    margin-bottom:15px;
  }

  label{
    font-size:11px;
    color:#64748b;
    font-weight:700;
    margin-bottom:4px;
    text-transform:uppercase;
    letter-spacing:0.3px;
  }

  h6{
    margin:0;
    font-size:13px;
    font-weight:600;
    color:#0f172a;
    line-height:1.5;
  }

  .custom-table{
    border-radius:12px;
    overflow:hidden;
  }

  .custom-table thead{
    background:#e0f2fe;
  }

  .custom-table th{
    font-size:13px;
    font-weight:700;
    color:#0f172a;
    border:none;
    padding:12px;
  }

  .custom-table td{
    font-size:13px;
    vertical-align:middle;
    padding:12px;
  }

  .doc-link{
    text-decoration:none;
    font-weight:600;
    color:#0284c7;
  }

  .back-btn{
    border-radius:10px;
    padding:7px 14px;
    font-size:13px;
    font-weight:600;
  }

  .p-4{
    padding:1rem !important;
  }

  .mb-4{
    margin-bottom:1rem !important;
  }

  .mb-3{
    margin-bottom:0.8rem !important;
  }

  @media(max-width:768px){

    .profile-img{
      width:70px;
      height:70px;
    }

    .small-contact,
    .extra-line{
      flex-direction:column;
      gap:6px;
    }

    .section-title{
      font-size:16px;
    }

    .detail-box,
    .address-box{
      min-height:auto;
    }

  }

 

    .custom-card{
      box-shadow:none;
      border:1px solid #ddd;
    }

  }

`}
      </style>
    </div>
  );
};

export default EmployeeView;
