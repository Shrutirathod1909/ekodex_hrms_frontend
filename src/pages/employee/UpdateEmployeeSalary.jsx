import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateEmployeeSalary.css";

const API_URL = import.meta.env.VITE_API_URL;

const UpdateEmployeeSalary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [employee, setEmployee] = useState(null);

  const [salaryTemplates, setSalaryTemplates] = useState([]);

  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [loadingEmployee, setLoadingEmployee] = useState(true);

  const [saving, setSaving] = useState(false);

  const [employeeError, setEmployeeError] = useState("");

  const [templateError, setTemplateError] = useState("");

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    // Salary Template
    salaryTemplateId: "",
    salaryTemplate: "",

    // Gross Salary
    grossSalary: "",
    grossSalaryType: "Per month",

    // Basic Salary
    basicSalary: "",
    basicSalaryType: "Rs",

    // Per Day
    perDaySalary: "",

    // Rules
    basicRule: "",
    daRule: "",
  });

  // ==========================================
  // FETCH ON PAGE LOAD
  // ==========================================

  useEffect(() => {
    if (!id) {
      setEmployeeError("Employee ID not found");
      setLoadingEmployee(false);
      return;
    }

    fetchEmployeeSalary();
    fetchSalaryTemplates();
  }, [id]);

  // ==========================================
  // FETCH EMPLOYEE SALARY
  // ==========================================

  const fetchEmployeeSalary = async () => {
    try {
      setLoadingEmployee(true);

      setEmployeeError("");

      const token = localStorage.getItem("token");

      console.log(
        "=========================================="
      );

      console.log(
        "GET EMPLOYEE SALARY ID =",
        id
      );

      const response = await axios.get(
        `${API_URL}/api/salary-update/employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "EMPLOYEE SALARY RESPONSE =",
        response.data
      );

      const salaryData =
        response.data?.data;

      if (!salaryData) {
        setEmployeeError(
          "Employee salary data not found"
        );

        return;
      }

      // ==========================================
      // SET EMPLOYEE
      // ==========================================

      setEmployee(salaryData);

      // ==========================================
      // SET FORM DATA
      // ==========================================

      setFormData({
        // Salary Template
        salaryTemplateId:
          salaryData.salary_template_id ?? "",

        salaryTemplate:
          salaryData.salary_template ?? "",

        // Gross Salary
        grossSalary:
          salaryData.gross_salary ?? "",

        grossSalaryType:
          salaryData.gross_salary_type ||
          "Per month",

        // Basic Salary
        basicSalary:
          salaryData.basic_salary ?? "",

        basicSalaryType:
          salaryData.basic_salary_type ||
          "Rs",

        // Per Day
        perDaySalary:
          salaryData.perday_salary ?? "",

        // Rules
        basicRule:
          salaryData.basic_term ?? "",

        daRule:
          salaryData.da_term ?? "",
      });

    } catch (error) {

      console.error(
        "=========================================="
      );

      console.error(
        "GET EMPLOYEE SALARY ERROR =",
        error
      );

      console.error(
        "ERROR RESPONSE =",
        error.response?.data
      );

      setEmployeeError(
        error.response?.data?.message ||
        "Failed to load employee salary"
      );

    } finally {

      setLoadingEmployee(false);

    }
  };

  // ==========================================
  // FETCH SALARY TEMPLATES
  // ==========================================

  const fetchSalaryTemplates = async () => {

    try {

      setLoadingTemplates(true);

      setTemplateError("");

      const token =
        localStorage.getItem("token");

      console.log(
        "FETCHING SALARY TEMPLATES..."
      );

      const response = await axios.get(
        `${API_URL}/api/salary-templates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "SALARY TEMPLATES RESPONSE =",
        response.data
      );

      if (response.data?.success) {

        setSalaryTemplates(
          response.data.data || []
        );

      } else {

        setSalaryTemplates([]);

        setTemplateError(
          response.data?.message ||
          "Failed to load salary templates"
        );
      }

    } catch (error) {

      console.error(
        "FETCH SALARY TEMPLATE ERROR =",
        error
      );

      console.error(
        "ERROR RESPONSE =",
        error.response?.data
      );

      setSalaryTemplates([]);

      setTemplateError(
        error.response?.data?.message ||
        "Failed to load salary templates"
      );

    } finally {

      setLoadingTemplates(false);

    }
  };

  // ==========================================
  // TEMPLATE CHANGE
  // ==========================================

  const handleTemplateChange = (e) => {

    const templateId =
      e.target.value;

    console.log(
      "SELECTED TEMPLATE ID =",
      templateId
    );

    // ==========================================
    // EMPTY TEMPLATE
    // ==========================================

    if (!templateId) {

      setFormData((prev) => ({
        ...prev,

        salaryTemplateId: "",

        salaryTemplate: "",
      }));

      return;
    }

    // ==========================================
    // FIND SELECTED TEMPLATE
    // ==========================================

    const selectedTemplate =
      salaryTemplates.find(
        (template) =>
          String(template.id) ===
          String(templateId)
      );

    console.log(
      "SELECTED TEMPLATE =",
      selectedTemplate
    );

    if (!selectedTemplate) {

      console.warn(
        "Template not found for ID:",
        templateId
      );

      return;
    }

    // ==========================================
    // SET TEMPLATE + SALARY DATA
    // ==========================================

    setFormData({

      // ========================================
      // TEMPLATE
      // ========================================

      salaryTemplateId:
        String(selectedTemplate.id),

      salaryTemplate:
        selectedTemplate.template_name ??
        selectedTemplate.salary_template ??
        selectedTemplate.name ??
        "",

      // ========================================
      // GROSS SALARY
      // ========================================

      grossSalary:
        selectedTemplate.gross_salary ??
        "",

      grossSalaryType:
        selectedTemplate.gross_salary_type ||
        "Per month",

      // ========================================
      // BASIC SALARY
      // ========================================

      basicSalary:
        selectedTemplate.basic_salary ??
        "",

      basicSalaryType:
        selectedTemplate.basic_salary_type ||
        "Rs",

      // ========================================
      // PER DAY SALARY
      // ========================================

      perDaySalary:
        selectedTemplate.perday_salary ??
        "",

      // ========================================
      // RULES
      // ========================================

      basicRule:
        selectedTemplate.basic_term ??
        "",

      daRule:
        selectedTemplate.da_term ??
        "",
    });
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    // ==========================================
    // NUMERIC FIELDS
    // ==========================================

    const numericFields = [
      "grossSalary",
      "basicSalary",
      "perDaySalary",
    ];

    if (
      numericFields.includes(name)
    ) {

      // Prevent negative value
      if (
        value !== "" &&
        Number(value) < 0
      ) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    console.log(
      "=========================================="
    );

    console.log(
      "SALARY SUBMIT START"
    );

    try {

      setSaving(true);

      const token =
        localStorage.getItem("token");

      console.log(
        "Employee ID:",
        id
      );

      console.log(
        "Token exists:",
        !!token
      );

      // ==========================================
      // VALIDATION
      // ==========================================

      if (!id) {

        alert(
          "Employee ID not found"
        );

        return;
      }

      if (
        !formData.salaryTemplateId
      ) {

        alert(
          "Please select salary template"
        );

        return;
      }

      // ==========================================
      // PAYLOAD
      // ==========================================

      const payload = {

        // Employee
        employeeId: id,

        // ========================================
        // SALARY TEMPLATE
        // ========================================

        salary_template_id:
          formData.salaryTemplateId ||
          null,

        salary_template:
          formData.salaryTemplate ||
          null,

        // ========================================
        // GROSS SALARY
        // ========================================

        gross_salary:
          formData.grossSalary ||
          null,

        gross_salary_type:
          formData.grossSalaryType ||
          null,

        // ========================================
        // BASIC SALARY
        // ========================================

        basic_salary:
          formData.basicSalary ||
          null,

        basic_salary_type:
          formData.basicSalaryType ||
          null,

        // ========================================
        // PER DAY SALARY
        // ========================================

        perday_salary:
          formData.perDaySalary ||
          null,

        // ========================================
        // RULES
        // ========================================

        basic_term:
          formData.basicRule ||
          null,

        da_term:
          formData.daRule ||
          null,
      };

      console.log(
        "FINAL SALARY PAYLOAD =",
        payload
      );

      // ==========================================
      // API CALL
      // ==========================================

      const response = await axios.post(

        `${API_URL}/api/salary-update/employee/${id}`,

        payload,

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      console.log(
        "SALARY UPDATE STATUS =",
        response.status
      );

      console.log(
        "SALARY UPDATE RESPONSE =",
        response.data
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      if (
        response.data?.success
      ) {

        alert(
          "Employee salary updated successfully"
        );

        const updatedEmployee =
          response.data.data;

        // ========================================
        // UPDATE EMPLOYEE
        // ========================================

        setEmployee(
          (prev) => ({
            ...prev,
            ...updatedEmployee,
          })
        );

        // ========================================
        // UPDATE FORM
        // ========================================

        setFormData(
          (prev) => ({
            ...prev,

            salaryTemplateId:
              updatedEmployee
                ?.salary_template_id ??
              prev.salaryTemplateId,

            salaryTemplate:
              updatedEmployee
                ?.salary_template ??
              prev.salaryTemplate,

            grossSalary:
              updatedEmployee
                ?.gross_salary ??
              prev.grossSalary,

            grossSalaryType:
              updatedEmployee
                ?.gross_salary_type ??
              prev.grossSalaryType,

            basicSalary:
              updatedEmployee
                ?.basic_salary ??
              prev.basicSalary,

            basicSalaryType:
              updatedEmployee
                ?.basic_salary_type ??
              prev.basicSalaryType,

            perDaySalary:
              updatedEmployee
                ?.perday_salary ??
              prev.perDaySalary,

            basicRule:
              updatedEmployee
                ?.basic_term ??
              prev.basicRule,

            daRule:
              updatedEmployee
                ?.da_term ??
              prev.daRule,
          })
        );

      } else {

        alert(
          response.data?.message ||
          "Salary update failed"
        );
      }

    } catch (error) {

      console.error(
        "=========================================="
      );

      console.error(
        "SALARY UPDATE ERROR =",
        error
      );

      console.error(
        "STATUS =",
        error.response?.status
      );

      console.error(
        "DATA =",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Salary update failed"
      );

    } finally {

      setSaving(false);

    }
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {

    navigate(-1);

  };

  // ==========================================
  // LOADING EMPLOYEE
  // ==========================================

  if (loadingEmployee) {

    return (

      <div className="salary-page">

        <Container className="py-5 text-center">

          <Spinner animation="border" />

          <div className="mt-2">
            Loading employee details...
          </div>

        </Container>

      </div>
    );
  }

  // ==========================================
  // EMPLOYEE ERROR
  // ==========================================

  if (employeeError) {

    return (

      <div className="salary-page">

        <Container className="py-5">

          <Alert variant="danger">
            {employeeError}
          </Alert>

          <Button
            variant="secondary"
            onClick={() =>
              navigate(-1)
            }
          >
            Go Back
          </Button>

        </Container>

      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (

    <div className="salary-page">

      {/* ========================================
          BLUE BAR
      ======================================== */}

      <div className="salary-top-bar"></div>

      <Container
        fluid
        className="salary-container"
      >

        {/* ========================================
            PAGE TITLE
        ======================================== */}

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h3 className="salary-page-title mb-0">

            Update Salary of employee -{" "}

            {employee?.emp_full_name ||
              "Employee"}

          </h3>

          <Button
            variant="secondary"
            onClick={() =>
              navigate(-1)
            }
          >
            Go Back
          </Button>

        </div>

        {/* ========================================
            TEMPLATE ERROR
        ======================================== */}

        {templateError && (

          <Alert
            variant="warning"
            className="mb-3"
          >
            {templateError}
          </Alert>

        )}

        {/* ========================================
            SALARY CARD
        ======================================== */}

        <Card className="salary-card">

          <Card.Header>

            <strong>
              Salary Details
            </strong>

          </Card.Header>

          <Card.Body>

            <Form
              onSubmit={
                handleSubmit
              }
            >

              <Row className="g-4">

                {/* ==================================
                    SALARY TEMPLATE
                ================================== */}

                <Col
                  lg={3}
                  md={6}
                >

                  <Form.Group>

                    <Form.Label>
                      Template
                    </Form.Label>

                    <Form.Select

                      name="salaryTemplateId"

                      value={
                        formData.salaryTemplateId
                      }

                      onChange={
                        handleTemplateChange
                      }

                      disabled={
                        loadingTemplates ||
                        saving
                      }

                    >

                      <option value="">

                        {loadingTemplates
                          ? "Loading templates..."
                          : "Select Template"}

                      </option>

                      {salaryTemplates.map(
                        (template) => (

                          <option
                            key={template.id}
                            value={template.id}
                          >

                            {
                              template.template_name ??
                              template.salary_template ??
                              template.name ??
                              `Template ${template.id}`
                            }

                            {template.rank
                              ? ` - ${template.rank}`
                              : ""}

                          </option>

                        )
                      )}

                    </Form.Select>

                  </Form.Group>

                </Col>

                {/* ==================================
                    GROSS SALARY
                ================================== */}

                <Col
                  lg={3}
                  md={6}
                >

                  <Form.Label>
                    Gross Salary
                  </Form.Label>

                  <div className="salary-input-group">

                    <Form.Control

                      type="number"

                      min="0"

                      step="0.01"

                      name="grossSalary"

                      value={
                        formData.grossSalary
                      }

                      onChange={
                        handleChange
                      }

                      disabled={saving}

                    />

                    <Form.Select

                      name="grossSalaryType"

                      value={
                        formData.grossSalaryType
                      }

                      onChange={
                        handleChange
                      }

                      disabled={saving}

                    >

                      <option value="Per month">
                        Per month
                      </option>

                      <option value="Per day">
                        Per day
                      </option>

                      <option value="Per year">
                        Per year
                      </option>

                    </Form.Select>

                  </div>

                </Col>

                {/* ==================================
                    BASIC SALARY
                ================================== */}

                <Col
                  lg={3}
                  md={6}
                >

                  <Form.Label>
                    Basic Salary
                  </Form.Label>

                  <div className="salary-input-group">

                    <Form.Control

                      type="number"

                      min="0"

                      step="0.01"

                      name="basicSalary"

                      value={
                        formData.basicSalary
                      }

                      onChange={
                        handleChange
                      }

                      disabled={saving}

                    />

                    <Form.Select

                      name="basicSalaryType"

                      value={
                        formData.basicSalaryType
                      }

                      onChange={
                        handleChange
                      }

                      disabled={saving}

                    >

                      <option value="Rs">
                        Rs
                      </option>

                      <option value="%">
                        %
                      </option>

                    </Form.Select>

                  </div>

                </Col>

                {/* ==================================
                    PER DAY SALARY
                ================================== */}

                <Col
                  lg={3}
                  md={6}
                >

                  <Form.Group>

                    <Form.Label>
                      Per Day Salary
                    </Form.Label>

                    <Form.Control

                      type="number"

                      min="0"

                      step="0.01"

                      name="perDaySalary"

                      value={
                        formData.perDaySalary
                      }

                      onChange={
                        handleChange
                      }

                      disabled={saving}

                    />

                  </Form.Group>

                </Col>

                {/* ==================================
                    BASIC RULE
                ================================== */}

                <Col
                  lg={3}
                  md={6}
                >

                  <Form.Group>

                    <Form.Label>

                      BASIC{" "}

                      <span className="rule-text">
                        (As per government rule)
                      </span>

                    </Form.Label>

                    <Form.Control

                      type="text"

                      name="basicRule"

                      value={
                        formData.basicRule
                      }

                      onChange={
                        handleChange
                      }

                      disabled={saving}

                    />

                  </Form.Group>

                </Col>

                {/* ==================================
                    DA RULE
                ================================== */}

                <Col
                  lg={3}
                  md={6}
                >

                  <Form.Group>

                    <Form.Label>

                      DA{" "}

                      <span className="rule-text">
                        (As per government rule)
                      </span>

                    </Form.Label>

                    <Form.Control

                      type="text"

                      name="daRule"

                      value={
                        formData.daRule
                      }

                      onChange={
                        handleChange
                      }

                      disabled={saving}

                    />

                  </Form.Group>

                </Col>

              </Row>

              {/* ====================================
                  BUTTONS
              ==================================== */}

              <div className="salary-buttons">

                <Button
                  type="submit"
                  className="btn-submit"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />

                      Updating...
                    </>
                  ) : (
                    "Submit"
                  )}

                </Button>

                <Button
                  type="button"
                  className="btn-cancel"
                  onClick={
                    handleCancel
                  }
                  disabled={saving}
                >
                  Cancel
                </Button>

              </div>

            </Form>

          </Card.Body>

        </Card>

      </Container>

    </div>
  );
};

export default UpdateEmployeeSalary;