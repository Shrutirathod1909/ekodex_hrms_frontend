import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import Select from "react-select";

import {
  Card,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";

import {
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const WarehouseForm = () => {

  const navigate = useNavigate();

  // ===============================
  // GET ID FOR EDIT
  // ===============================
  const { id } = useParams();

  const isEdit = !!id;

  const [loading, setLoading] =
    useState(false);

  const [companyOptions, setCompanyOptions] =
    useState([]);

  const [pincodeOptions, setPincodeOptions] =
    useState([]);

  const [selectedCompany, setSelectedCompany] =
    useState(null);

  const [selectedPincode, setSelectedPincode] =
    useState(null);

  const [formData, setFormData] = useState({
    client_name: "",
    client_code: "",

    warehouse_name: "",

    contact_person: "",
    mobile_no: "",
    email_id: "",

    support_mobile_no: "",
    support_email: "",

    gst_no: "",

    address1: "",
    address2: "",

    city: "",
    state_name: "",
    country_name: "India",

    pincode: "",
  });

  const token =
    localStorage.getItem("token");

  // ===============================
  // FETCH COMPANIES
  // ===============================
  const fetchCompanies = async () => {

    try {

      const response = await axios.post(
        `${API_URL}/api/vouchers/getAllCompanies`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const companies =
        response.data.user || [];

      const options = companies.map(
        (item) => ({
          value: item.id,

          label: item.title,

          client_code:
            item.client_code,
        })
      );

      setCompanyOptions(options);

    } catch (error) {

      console.error(
        "Company Fetch Error",
        error
      );
    }
  };

  // ===============================
  // FETCH SINGLE DATA FOR EDIT
  // ===============================
  const fetchWarehouseById =
    async () => {

      try {

        const response =
          await axios.get(
            `${API_URL}/api/warehouse/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data = response.data;

        // SET FORM DATA
        setFormData({
          client_name:
            data.client_name || "",

          client_code:
            data.client_code || "",

          warehouse_name:
            data.warehouse_name || "",

          contact_person:
            data.contact_person || "",

          mobile_no:
            data.mobile_no || "",

          email_id:
            data.email_id || "",

          support_mobile_no:
            data.support_mobile_no || "",

          support_email:
            data.support_email || "",

          gst_no:
            data.gst_no || "",

          address1:
            data.address1 || "",

          address2:
            data.address2 || "",

          city:
            data.city || "",

          state_name:
            data.state_name || "",

          country_name:
            data.country_name ||
            "India",

          pincode:
            data.pincode || "",
        });

        // SET COMPANY
        setSelectedCompany({
          label:
            data.client_name,

          client_code:
            data.client_code,
        });

        // SET PINCODE
        setSelectedPincode({
          label:
            `${data.pincode} - ${data.city}`,

          pincode:
            data.pincode,

          city:
            data.city,

          state:
            data.state_name,

          country:
            data.country_name,
        });

      } catch (error) {

        console.error(
          "Fetch Single Warehouse Error",
          error
        );
      }
    };

  useEffect(() => {

    fetchCompanies();

    if (id) {
      fetchWarehouseById();
    }

  }, [id]);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // COMPANY CHANGE
  // ===============================
  const handleCompanyChange = (
    selectedOption
  ) => {

    setSelectedCompany(
      selectedOption
    );

    setFormData((prev) => ({
      ...prev,

      client_name:
        selectedOption?.label || "",

      client_code:
        selectedOption?.client_code ||
        "",
    }));
  };

  // ===============================
  // SEARCH PINCODE
  // ===============================
  const searchPincode = async (
    inputValue
  ) => {

    if (
      !inputValue ||
      inputValue.length < 2
    ) {
      return;
    }

    try {

      const response =
        await axios.get(
          `${API_URL}/api/pincodes-dropdown/search?q=${inputValue}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const options =
        response.data.map(
          (item) => ({
            value: item.id,

            label:
              `${item.pincode} - ${item.area_name}`,

            pincode:
              item.pincode,

            city:
              item.city_name,

            state:
              item.state_name,

            country:
              item.country_code ||
              "India",
          })
        );

      setPincodeOptions(options);

    } catch (error) {

      console.error(
        "Pincode Search Error",
        error
      );
    }
  };

  // ===============================
  // PINCODE CHANGE
  // ===============================
  const handlePincodeChange = (
    selectedOption
  ) => {

    setSelectedPincode(
      selectedOption
    );

    setFormData((prev) => ({
      ...prev,

      pincode:
        selectedOption?.pincode || "",

      city:
        selectedOption?.city || "",

      state_name:
        selectedOption?.state || "",

      country_name:
        selectedOption?.country ||
        "India",
    }));
  };

  // ===============================
  // SAVE / UPDATE
  // ===============================
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      let response;

      // ===============================
      // UPDATE
      // ===============================
      if (isEdit) {

        response =
          await axios.post(
            `${API_URL}/api/warehouse/update/${id}`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

      } else {

        // ===============================
        // CREATE
        // ===============================
        response =
          await axios.post(
            `${API_URL}/api/warehouse/create`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );
      }

      alert(response.data.message);

      navigate("/warehouse-list");

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to save warehouse"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="container-fluid py-3">

      <Card className="shadow-sm border-0 rounded-3">

        {/* HEADER */}
        <Card.Header
          className="
            bg-primary
            text-white
            d-flex
            justify-content-between
            align-items-center
            py-2
          "
        >

          <h6 className="mb-0 fw-bold">

            {isEdit
              ? "Edit Warehouse"
              : "Add Warehouse"}

          </h6>

          <Button
            size="sm"
            variant="light"
            onClick={() =>
              navigate("/warehouse-list")
            }
          >
            <FaArrowLeft className="me-1" />
            Back
          </Button>

        </Card.Header>

        <Card.Body>

          <Form onSubmit={handleSubmit}>

            <Row>

              {/* CLIENT */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Client Name
                  </Form.Label>

                  <Select
                    options={
                      companyOptions
                    }
                    value={
                      selectedCompany
                    }
                    placeholder="Search Client..."
                    onChange={
                      handleCompanyChange
                    }
                    isSearchable
                  />

                </Form.Group>
              </Col>

              {/* CLIENT CODE */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Client Code
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    value={
                      formData.client_code
                    }
                    readOnly
                  />

                </Form.Group>
              </Col>

              {/* WAREHOUSE */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Warehouse Name
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    name="warehouse_name"
                    value={
                      formData.warehouse_name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </Form.Group>
              </Col>

              {/* GST */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    GST No
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    name="gst_no"
                    value={
                      formData.gst_no
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* CONTACT */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Contact Person
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    name="contact_person"
                    value={
                      formData.contact_person
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* MOBILE */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Mobile No
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    name="mobile_no"
                    value={
                      formData.mobile_no
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* EMAIL */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Email ID
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="email"
                    name="email_id"
                    value={
                      formData.email_id
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* SUPPORT MOBILE */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Support Mobile
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    name="support_mobile_no"
                    value={
                      formData.support_mobile_no
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* SUPPORT EMAIL */}
              <Col md={6}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Support Email
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="email"
                    name="support_email"
                    value={
                      formData.support_email
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* ADDRESS1 */}
              <Col md={12}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Address 1
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={2}
                    name="address1"
                    value={
                      formData.address1
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* ADDRESS2 */}
              <Col md={12}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Address 2
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={2}
                    name="address2"
                    value={
                      formData.address2
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* PINCODE */}
              <Col md={3}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Pincode
                  </Form.Label>

                  <Select
                    options={
                      pincodeOptions
                    }
                    value={
                      selectedPincode
                    }
                    placeholder="Search..."
                    isSearchable
                    onInputChange={
                      (value) => {
                        searchPincode(
                          value
                        );
                      }
                    }
                    onChange={
                      handlePincodeChange
                    }
                  />

                </Form.Group>
              </Col>

              {/* CITY */}
              <Col md={3}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    City
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    value={
                      formData.city
                    }
                    readOnly
                  />

                </Form.Group>
              </Col>

              {/* STATE */}
              <Col md={3}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    State
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    value={
                      formData.state_name
                    }
                    readOnly
                  />

                </Form.Group>
              </Col>

              {/* COUNTRY */}
              <Col md={3}>
                <Form.Group className="mb-3">

                  <Form.Label>
                    Country
                  </Form.Label>

                  <Form.Control
                    size="sm"
                    type="text"
                    value={
                      formData.country_name
                    }
                    readOnly
                  />

                </Form.Group>
              </Col>

            </Row>

            {/* BUTTONS */}
            <div className="text-end mt-2">

              <Button
                size="sm"
                variant="secondary"
                className="me-2"
                onClick={() =>
                  navigate("/warehouse-list")
                }
              >
                <FaArrowLeft className="me-1" />
                Back
              </Button>

              <Button
                size="sm"
                type="submit"
                variant="primary"
                disabled={loading}
              >
                <FaSave className="me-1" />

                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Update"
                  : "Save"}

              </Button>

            </div>

          </Form>

        </Card.Body>

      </Card>

    </div>
  );
};

export default WarehouseForm;