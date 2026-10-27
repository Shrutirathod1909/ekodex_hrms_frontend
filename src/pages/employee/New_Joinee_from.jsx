import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AddNewJoinee = ({ onSubmit }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("token");
  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [pincodeList, setPincodeList] = useState([]);
  const [showPincodeList, setShowPincodeList] = useState(false);
  const [pinSearch, setPinSearch] = useState("");
  const [filteredPincodes, setFilteredPincodes] = useState([]);
  const debounceRef = useRef(null);

  const [searchPin, setSearchPin] = useState("");
  const [designations, setDesignations] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  // ======================================================
  // FORM DATA
  // ======================================================

  // AddNewJoinee.jsx (ONLY FILE PART + SUBMIT FIX)
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    mobile: "",
    email: "",
    gender: "",
    dob: "",
    joining_date: "",
    department: "",
    designation: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    reference_name: "",
    reference_mobile: "",
    reference_relation: "",

    bank_name: "",
    bank_no: "",
    bank_ifsc_code: "",

    emp_status: "WORKING",

    // FILES (IMPORTANT FIXED NAMES)
    photo: null,
    resume: null,
    aadhar_card: null,
    pan_card: null,
    bank_detail: null,
  });
  // ======================================================
  // FETCH PINCODES
  const fetchDesignations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employee-types`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const list = res.data?.data || res.data || [];

      const options = list.map((item) => ({
        value: item.emp_type,
        label: item.emp_type,
      }));

      setDesignations(options);
    } catch (error) {
      console.log("Error fetching designations", error);
    }
  };
  useEffect(() => {
    fetchDesignations();
  }, []);
  useEffect(() => {
    const fetchPincode = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/pincodes`);

        console.log("PINCODE API:", res.data);

        if (Array.isArray(res.data)) {
          setPincodeList(res.data);
        } else if (Array.isArray(res.data.data)) {
          setPincodeList(res.data.data);
        } else {
          setPincodeList([]);
        }
      } catch (error) {
        console.log("PINCODE ERROR:", error);
      }
    };

    fetchPincode();
  }, [API_URL]);

  const filteredPincode = [];

  // Debounced pincode filter
  const handlePinSearch = (val) => {
    setPinSearch(val);
    setShowPincodeList(!!val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!val) { setFilteredPincodes([]); return; }
      const lower = val.toLowerCase();
      const results = pincodeList.filter(p =>
        String(p.pincode).startsWith(val) ||
        (p.area_name || "").toLowerCase().includes(lower) ||
        (p.city_name || "").toLowerCase().includes(lower) ||
        (p.state_name || "").toLowerCase().includes(lower)
      ).slice(0, 30);
      setFilteredPincodes(results);
    }, 250);
  };

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = {
        ...prev,
        [name]: value,
      };

      // ======================================================
      // AUTO FETCH CITY + STATE
      // ======================================================

      if (name === "pincode") {
        const pinData = pincodeList.find(
          (p) => String(p.pincode).trim() === String(value).trim(),
        );

        console.log("SELECTED PIN DATA:", pinData);

        updated.city = pinData?.city_name || "";

        updated.state = pinData?.state_name || "";
      }

      return updated;
    });
  };

  // ======================================================
  // HANDLE FILE
  // ======================================================

  const handleSelectPincode = (pin) => {
    setFormData((prev) => ({
      ...prev,
      pincode: pin.pincode,
      city: pin.city_name || "",
      state: pin.state_name || "",
    }));
    setShowPincodeList(false);
  };

  const handleFile = (e) => {
    const { name, files } = e.target;

    const file = files[0];

    // FILE LIMIT
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setFormData({
      joinee_code: "",

      first_name: "",
      middle_name: "",
      last_name: "",

      mobile: "",
      email: "",

      gender: "",
      dob: "",

      joining_date: "",

      department: "",
      designation: "",

      address: "",
      city: "",
      state: "",
      pincode: "",

      refName: "",
      refMobile: "",
      relation: "",

      reference_name: "",
      reference_mobile: "",
      reference_relation: "",

      bank_name: "",
      bank_no: "",
      bank_ifsc_code: "",

      employee_id: "",

      client_name: "",
      site_name: "",

      client_id: "",
      site_id: "",

      emp_status: "WORKING",
      emp_stages: "PENDING",

      photo: null,
      resume: null,
      aadhar_card: null,
      pancard: null,
      bank_detail: null,
    });
    if (fileInputRef.current) {
      const inputs =
        fileInputRef.current.querySelectorAll('input[type="file"]');
      inputs.forEach((input) => (input.value = ""));
    }
    setSearchPin("");
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateForm = () => {
    // MOBILE
    if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile)) {
      alert("Mobile number must be 10 digits");

      return false;
    }

    // EMAIL
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Invalid email address");

      return false;
    }

    // PINCODE
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      alert("Pincode must be 6 digits");

      return false;
    }

    return true;
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const loginUser = JSON.parse(localStorage.getItem("user"));

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // IMPORTANT FIELD FIXES
      data.set("date_of_joining", formData.joining_date);
      data.set("phone1", formData.mobile);
      data.set("emp_stages", formData.emp_stages);
      data.set("emp_status", formData.emp_status);

      // DEBUG
      console.log("===== FINAL FORM DATA =====");

      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }
      const response = await axios.post(
        `${API_URL}/api/new-joinee/create`,
        data, // This is your FormData object
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set "Content-Type": "multipart/form-data" here.
            // Axios handles it automatically.
          },
        },
      );
      console.log("SAVE RESPONSE:", response.data);

      alert("New Joinee Added Successfully");

      resetForm();
      navigate("/employee/employee");
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.log("SAVE ERROR:", error);

      console.log("ERROR RESPONSE:", error?.response?.data);

      alert(error?.response?.data?.message || "Failed To Save Joinee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="p-4 shadow"
      style={{
        fontSize: "13px",
      }}
    >
      <h4 className="text-primary mb-4">Add New Joinee</h4>

      <Form onSubmit={handleSubmit} ref={fileInputRef}>
        <Row>
          {/* FIRST NAME */}
          <Col md={4} className="mb-3">
            <Form.Label>First Name *</Form.Label>

            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Col>

          {/* MIDDLE NAME */}
          <Col md={4} className="mb-3">
            <Form.Label>Middle Name</Form.Label>

            <Form.Control
              type="text"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
            />
          </Col>

          {/* LAST NAME */}
          <Col md={4} className="mb-3">
            <Form.Label>Last Name *</Form.Label>

            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Col>

          {/* MOBILE */}
          <Col md={4} className="mb-3">
            <Form.Label>Mobile *</Form.Label>

            <Form.Control
              type="text"
              maxLength={10}
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </Col>

          {/* EMAIL */}
          <Col md={4} className="mb-3">
            <Form.Label>Email</Form.Label>

            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Col>

          {/* GENDER */}
          <Col md={4} className="mb-3">
            <Form.Label>Gender</Form.Label>

            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>

              <option value="Male">Male</option>

              <option value="Female">Female</option>

              <option value="Other">Other</option>
            </Form.Select>
          </Col>

          {/* DOB */}
          <Col md={4} className="mb-3">
            <Form.Label>DOB</Form.Label>

            <Form.Control
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </Col>

          {/* JOINING DATE */}
          <Col md={4} className="mb-3">
            <Form.Label>Joining Date</Form.Label>

            <Form.Control
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
            />
          </Col>

          {/* DEPARTMENT */}
          <Col md={4} className="mb-3">
            <Form.Label>Department</Form.Label>

            <Form.Control
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>Designation</Form.Label>

            <Select
              options={designations}
              value={
                designations.find(
                  (opt) => opt.value === formData.designation,
                ) || null
              }
              onChange={(selected) => {
                setSelectedDesignation(selected);

                setFormData((prev) => ({
                  ...prev,
                  designation: selected?.label,
                }));
              }}
              placeholder="Search Emp Type..."
              isSearchable
            />
          </Col>

          {/* STATUS */}

          {/* PINCODE */}
          <Col md={4} className="mb-3">
            <Form.Label>Pincode</Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                type="text"
                placeholder="Search Pincode / City / Area"
                value={formData.pincode ? `${formData.pincode}${formData.city ? " - " + formData.city : ""}` : pinSearch}
                onChange={(e) => {
                  if (formData.pincode) {
                    // Clear selection on edit
                    setFormData(prev => ({ ...prev, pincode: "", city: "", state: "" }));
                    setPinSearch(e.target.value);
                    handlePinSearch(e.target.value);
                  } else {
                    handlePinSearch(e.target.value);
                  }
                }}
                onFocus={() => { if (filteredPincodes.length > 0) setShowPincodeList(true); }}
                onBlur={() => setTimeout(() => setShowPincodeList(false), 200)}
                autoComplete="off"
              />
              {showPincodeList && filteredPincodes.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%", left: 0, right: 0,
                  backgroundColor: "#ffffe0",
                  border: "1px solid #ddd",
                  zIndex: 999,
                  maxHeight: "200px",
                  overflowY: "auto",
                  borderRadius: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}>
                  {filteredPincodes.map((pin, index) => (
                    <div
                      key={index}
                      onMouseDown={() => {
                        handleSelectPincode(pin);
                        setPinSearch("");
                        setShowPincodeList(false);
                        setFilteredPincodes([]);
                      }}
                      style={{
                        padding: "8px 10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        fontSize: "13px"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#fffacd")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#ffffe0")}
                    >
                      <strong>{pin.pincode}</strong> — {pin.area_name} — {pin.city_name} — {pin.state_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* CITY */}
          <Col md={4} className="mb-3">
            <Form.Label>City</Form.Label>

            <Form.Control
              type="text"
              name="city"
              readOnly
              value={formData.city}
            />
          </Col>

          {/* STATE */}
          <Col md={4} className="mb-3">
            <Form.Label>State</Form.Label>

            <Form.Control
              type="text"
              readOnly
              name="state"
              value={formData.state}
            />
          </Col>

          {/* ADDRESS */}
          <Col md={12} className="mb-3">
            <Form.Label>Address</Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Col>
          <Row>
            {/* REFERENCE NAME */}
            <Col md={4} className="mb-3">
              <Form.Label>Reference Name</Form.Label>
              <Form.Control
                type="text"
                name="reference_name"
                value={formData.reference_name}
                onChange={handleChange}
              />
            </Col>

            {/* REFERENCE MOBILE */}
            <Col md={4} className="mb-3">
              <Form.Label>Reference Mobile</Form.Label>
              <Form.Control
                type="text"
                name="reference_mobile"
                value={formData.reference_mobile}
                onChange={handleChange}
              />
            </Col>

            {/* REFERENCE RELATION */}
            <Col md={4} className="mb-3">
              <Form.Label>Reference Relation</Form.Label>
              <Form.Control
                type="text"
                name="reference_relation"
                value={formData.reference_relation}
                onChange={handleChange}
              />
            </Col>
          </Row>
          {/* PHOTO */}
          <Col md={4} className="mb-3">
            <Form.Label>Photo</Form.Label>

            <Form.Control
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleFile}
            />
          </Col>

          {/* RESUME */}
          <Col md={4} className="mb-3">
            <Form.Label>Resume</Form.Label>

            <Form.Control
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleFile}
            />
          </Col>

          {/* AADHAR */}
          <Col md={4} className="mb-3">
            <Form.Label>Aadhar Card</Form.Label>

            <Form.Control
              type="file"
              name="aadhar_card"
              accept="image/*,.pdf"
              onChange={handleFile}
            />
          </Col>

          {/* PAN */}
          <Col md={4} className="mb-3">
            <Form.Label>PAN Card</Form.Label>

            <Form.Control
              type="file"
              name="pan_card"
              accept="image/*,.pdf"
              onChange={handleFile}
            />
          </Col>

          {/* BANK DETAIL */}
          <Col md={4} className="mb-3">
            <Form.Label>Bank Detail</Form.Label>

            <Form.Control
              type="file"
              name="bank_detail"
              accept="image/*,.pdf"
              onChange={handleFile}
            />
          </Col>

          {/* BANK NAME */}
        </Row>

        {/* BUTTON */}

        <div className="text-end mt-4">
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? "Saving..." : "Save New Joinee"}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AddNewJoinee;
