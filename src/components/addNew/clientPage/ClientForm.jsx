import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Table,
  Dropdown,
} from "react-bootstrap";
import { FaMinus, FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import EditSiteRate from "./EditSiteRate";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { useNavigate } from "react-router-dom";

const ClientForm = ({
  onSave,
  onBack,
  clientToEdit,
  companies,
  stepCount,
  onUpdate,
  editSite,
  deleteSite,
  woRateChart,
  wagesSettings,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [chargeTypes, setChargeTypes] = useState([]);
  const [error, setError] = useState(null);
  const [pincodes, setPincodes] = useState([]);
  const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
  const [showPincodeList, setShowPincodeList] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [billingCompanyBanks, setBillingCompanyBanks] = useState([]);
  const [clientSites, setClientSites] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [showEditSiteRate, setShowEditSiteRate] = useState(false);

  const fetchOtherDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/client-service-charges`, {
        params: {
          client_id: selectedClientId,
        },
      });

      setOtherDetails(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPincodes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pincodes`, getAuthHeaders());
      console.log("📦 RAW PINCODE RESPONSE:", res);
      console.log("📦 RES.DATA:", res.data);
      setPincodes(res.data || []);
    } catch (err) {
      console.log("PINCODE ERROR:", err);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (!value) {
      setPincodeSuggestions([]);
      setShowPincodeList(false);
      return;
    }

    const filtered = pincodes.filter((p) => {
      const pin = String(p.pincode || "");
      return pin.startsWith(value);
    });

    setPincodeSuggestions(filtered.slice(0, 10));
    setShowPincodeList(true);
  };

  const handleSelectPincode = (p) => {
    console.log("PIN DATA =", p);

    setFormData((prev) => ({
      ...prev,
      pincode: p.pincode || "",
      city: p.city || p.city_name || "",
      state: p.state || p.state_name || "",
      country: p.country || p.country_name || "India",
    }));

    setShowPincodeList(false);
    setPincodeSuggestions([]);
  };

  const initialFormData = {
    // CLIENT DETAILS
    companyName: "",
    contactPersonName: "",
    contactNo: "",
    emailId: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstStateCode: "",
    gstNo: "",
    sacCode: "",
    billingCompany: "",
    companyBankName: "",
    otherInfo: "",
    termsAndConditions: "",

    // BANK DETAILS
    bankName: "",
    accountNo: "",
    ifscCode: "",
    micrCode: "",
    branch: "",
    bankCity: "",

    // SITES
    sites: [],
  };

  const [clientId, setClientId] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [refreshSites, setRefreshSites] = useState(false);

  const [siteDetails, setSiteDetails] = useState({
    siteName: "",
    clientCode: "",
    siteId: "",
    workOrderNo: "",
    contactPersonName: "",
    address: "",
    billingAddress: "",
    contactNo: "",
    emailId: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    siteZoneName: "",
    locationStartDate: "",
    locationEndDate: "",
    salesPersonName: "",
    salesPersonEmailId: "",
    salesPersonContactNo: "",
    billCycleDate: "",
    status: "Active",
    cgst: "",
    sgst: "",
    igst: "",
    expectedBillingAmount: "",
    daysForBilling: "",
    viewOTHours: false,
    attachWagesSHeet: false,
    roundOffAmount: false,
    billWithoutRank: false,
    nonComplianceSite: false,
    applyLeave: false,
    ponumber: "",
    poFile: null,
  });

  const [otherDetails, setOtherDetails] = useState([
    {
      typeOfServ: "",
      chargesType: "",
      charges: "",
      calcOn: "",
      calcOperation: "",
      amountToCompare: "",
    },
  ]);
  useEffect(() => {
    if (showOtherModal) {
      fetchOtherDetails();
    }
  }, [showOtherModal]);
  const [rateRows, setRateRows] = useState([
    {
      empType: "",
      hours: "",
      nos: "",
      basic: "",
      hra: "",
      da: "",
      specialAllowance: "",
      otherAllowance: "",
      lww: "",
      bonus: "",
      costPerHeadGross: "",
      serviceChargesType: "",
      serviceCharges: "",
      perDayRate: "",
      otRate: "",
      leaveWages: "",
      uniformWashing: "",
      anyOther: "",
    },
  ]);

  const handleEditClient = (client) => {
    console.log("👉 EDIT CLICKED CLIENT:", client);

    console.log("👉 CLIENT ID (_id):", client?._id);

    setClientId(client?._id);

    setClientToEdit(client);
  };

  const handleSiteUpdate = async (updatedSiteData) => {
    try {
      console.log("🔥 FINAL DATA:", updatedSiteData);

      const clientId = Number(updatedSiteData.clientId);
      const siteId = Number(updatedSiteData.site_id || updatedSiteData.id);

      console.log("clientId:", clientId, typeof clientId);
      console.log("siteId:", siteId, typeof siteId);

      if (!clientId || !siteId) {
        alert("Missing IDs");
        return;
      }

      const res = await axios.put(
        `${API_URL}/api/clients/updateClientSite/${clientId}/${siteId}`,
        updatedSiteData,
        getAuthHeaders(),
      );

      console.log("✅ UPDATED:", res.data);
      alert("Updated successfully");
    } catch (error) {
      console.log("❌ ERROR:", error.response?.data || error.message);
      alert("Update failed");
    }
  };
  const getCompanyBanks = async (companyId) => {
    try {
      // ================================
      // GET TOKEN SAFELY
      // ================================
      const token = localStorage.getItem("token");

      if (!companyId) {
        console.log("❌ Company ID missing");
        setBillingCompanyBanks([]);
        return;
      }

      if (!token) {
        console.log("❌ Token not found");
        setBillingCompanyBanks([]);
        return;
      }

      // ================================
      // API CALL
      // ================================
      const res = await axios.get(
        `${API_URL}/api/clients/company-banks/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ================================
      // RESPONSE HANDLING
      // ================================
      if (res?.data?.success) {
        setBillingCompanyBanks(res.data.data || []);
        console.log("✅ Banks fetched successfully:", res.data.data);
      } else {
        setBillingCompanyBanks([]);
        console.log("⚠️ No banks found");
      }
    } catch (error) {
      console.log(
        "❌ BANK FETCH ERROR =>",
        error?.response?.data || error.message,
      );
      setBillingCompanyBanks([]);
    }
  };
  // Auth helper function
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };
  const getClientSites = async (clientId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/clients/client/${clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("CLIENT SITE RESPONSE => ", res.data);

      if (res.data.success) {
        const sites =
          res.data.data || res.data.sites || res.data.client?.sites || [];

        console.log("FINAL SITES => ", sites);

        setClientSites(sites);
      } else {
        setClientSites([]);
      }
    } catch (error) {
      console.log("GET SITE ERROR => ", error);
      setClientSites([]);
    }
  };
  useEffect(() => {
    fetchPincodes();
  }, []);
  useEffect(() => {
    console.log("CLIENT ID => ", clientId);

    if (clientId) {
      getClientSites(clientId);
    }
  }, [clientId]);
  useEffect(() => {
    if (clientToEdit?._id) {
      console.log("EDIT CLIENT => ", clientToEdit);

      setClientId(clientToEdit._id);

      getClientSites(clientToEdit._id);
    }
  }, [clientToEdit]);
  // --- Data Fetching for Dropdowns ---

  const handleAddSite = async (payload) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/clients/${clientId}/site`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        // 🔥 IMPORTANT FIX
        setRefreshSites((prev) => !prev);
      }
    } catch (error) {
      console.log("ADD SITE ERROR:", error);
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // =========================
        // EMPLOYEE TYPES
        // =========================
        try {
          const { data } = await axios.get(
            `${API_URL}/api/employee-types`,
            getAuthHeaders(),
          );

          console.log("EMPLOYEE TYPES API RESPONSE:", data);

          setEmployeeTypes(Array.isArray(data) ? data : []);
        } catch (empError) {
          console.warn("Failed to fetch employee types:", empError);
          setEmployeeTypes([]);
        }

        // =========================
        // CHARGE TYPES
        // =========================
        try {
          const { data } = await axios.get(
            `${API_URL}/api/charges?simple=true`,
            getAuthHeaders(),
          );

          console.log("CHARGE TYPES API RESPONSE:", data);

          setChargeTypes(Array.isArray(data) ? data : []);
        } catch (chargeError) {
          console.warn("Failed to fetch charge types:", chargeError);
          setChargeTypes([]);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          setError("Failed to load dropdown data");
        }

        console.error("Error in fetchDropdownData:", err);
      }
    };

    fetchDropdownData();

    console.log("STEP COUNT:", stepCount);

    stepCount > 0 ? setStep(stepCount) : "";
  }, []);

  useEffect(() => {
    if (clientToEdit) {
      const mergedData = { ...initialFormData, ...clientToEdit };
      // Extract bank details if they exist

      if (clientToEdit.bankDetails) {
        const bank = clientToEdit.bankDetails;
        mergedData.bankName = bank.bankName || "";
        mergedData.accountNo = bank.accountNo || "";
        mergedData.ifscCode = bank.ifscCode || "";
        mergedData.micrCode = bank.micrCode || "";
        mergedData.branch = bank.branch || "";
        mergedData.bankCity = bank.city || "";
      }
      const selectedId = mergedData.billingCompany?._id;

      const selectedCompany = companies.find((c) => c._id === selectedId);

      // update form data and bank list
      setFormData((prev) => ({
        ...prev,
        billingCompany: selectedId,
      }));

      // set banks if company has any
      if (selectedCompany && selectedCompany.bankDetails) {
        setBillingCompanyBanks(selectedCompany.bankDetails);
      } else {
        setBillingCompanyBanks([]);
      }
      setFormData(mergedData);
      // console.log(mergedData.sites);
      setClientSites(mergedData.sites);
    }
  }, [clientToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const key = name;
    // if (validationErrors[key]) {
    //   setValidationErrors((prev) => ({
    //     ...prev,
    //     [key]: "",
    //   }));
    // }
  };

  const saveClient = async (clientData) => {
    try {
      const payload = {
        ...clientData,
        sites: clientData.sites || [],
      };

      console.log("🚀 FINAL PAYLOAD:", payload);

      const response = await axios.post(`${API_URL}/api/clients`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("✅ RESPONSE:", response.data);

      alert("Client Added Successfully");

      onSave?.(response.data);
      onBack?.();
    } catch (error) {
      console.log("❌ ERROR:", error);
      console.log("📌 STATUS:", error.response?.status);
      console.log("📌 DATA:", error.response?.data);

      alert(error.response?.data?.message || "Failed to add client");
    }
  };

  // const hasValidationErrors = (errors) => {
  //   if (!errors || typeof errors !== "object") return false;

  //   // 🔹 Check field-level errors
  //   const fieldErrorsExist = Object.entries(errors)
  //     .filter(([key]) => key !== "rateRowErrors" && key !== "otherDetailErrors")
  //     .some(([_, msg]) => msg && msg.toString().trim() !== "");

  //   // 🔹 Check rate row errors
  //   const rateErrorsExist = Array.isArray(errors.rateRowErrors)
  //     ? errors.rateRowErrors.some(
  //         (row) =>
  //           row &&
  //           Object.values(row).some(
  //             (val) => val && val.toString().trim() !== "",
  //           ),
  //       )
  //     : false;

  //   // 🔹 Check other details errors
  //   const otherErrorsExist = Array.isArray(errors.otherDetailErrors)
  //     ? errors.otherDetailErrors.some(
  //         (row) =>
  //           row &&
  //           Object.values(row).some(
  //             (val) => val && val.toString().trim() !== "",
  //           ),
  //       )
  //     : false;

  //   return fieldErrorsExist || rateErrorsExist || otherErrorsExist;
  // };

  const handleSiteDetailChange = (e) => {
    // console.log(e);
    const { name, value, type, checked } = e.target;
    const key = name;
    // if (validationErrors[key]) {
    //   setValidationErrors((prev) => ({
    //     ...prev,
    //     [key]: "",
    //   }));
    // }
    setSiteDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRateRowChange = (index, field, value) => {
    setRateRows((prevRows) => {
      const updated = [...prevRows];
      const row = { ...updated[index], [field]: value };

      // if (validationErrors?.rateRowErrors?.[index]?.[field]) {
      //   setValidationErrors((prev) => {
      //     const newRateRowErrors = [...(prev.rateRowErrors || [])];
      //     if (newRateRowErrors[index]) {
      //       newRateRowErrors[index][field] = "";
      //     }
      //     return { ...prev, rateRowErrors: newRateRowErrors };
      //   });
      // }

      const num = (v) => (v && !isNaN(v) ? parseFloat(v) : 0);

      const grossFields = [
        "basic",
        "hra",
        "da",
        "specialAllowance",
        "otherAllowance",
        "lww",
        "bonus",
      ];

      if (grossFields.includes(field)) {
        const totalGross = grossFields.reduce(
          (sum, key) => sum + num(row[key]),
          0,
        );
        row.costPerHeadGross = Number(totalGross).toFixed(2);

        const days = siteDetails?.daysForBilling
          ? num(siteDetails.daysForBilling)
          : 30;

        row.perDayRate = days > 0 ? Number((totalGross / days).toFixed(2)) : 0;
      }

      updated[index] = row;
      return updated;
    });
  };

  const addRateRow = () => {
    setRateRows((prev) => [
      ...prev,
      {
        empType: "",
        hours: "",
        nos: "",
        basic: "",
        hra: "",
        da: "",
        specialAllowance: "",
        otherAllowance: "",
        lww: "",
        bonus: "",
        costPerHeadGross: "",
        serviceChargesType: "",
        serviceCharges: "",
        perDayRate: "",
        otRate: "",
        leaveWages: "",
        uniformWashing: "",
        anyOther: "",
      },
    ]);
  };

  // Delete a row
  const deleteRateRow = (index) => {
    setRateRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle changes in a specific row/field
  const handleOtherDetailChange = (index, field, value) => {
    const updated = [...otherDetails];
    updated[index][field] = value;

    // if (validationErrors?.otherDetailErrors?.[index]?.[field]) {
    //   setValidationErrors((prev) => {
    //     const newErrors = [...(prev.otherDetailErrors || [])];
    //     if (newErrors[index]) {
    //       newErrors[index][field] = "";
    //     }
    //     return { ...prev, otherDetailErrors: newErrors };
    //   });
    // }
    setOtherDetails(updated);
  };

  // Add a new row
  const addOtherDetailRow = () => {
    setOtherDetails((prev) => [
      ...prev,
      {
        typeOfServ: "",
        chargesType: "",
        charges: "",
        calcOn: "",
        calcOperation: "",
        amountToCompare: "",
      },
    ]);
  };

  // Delete a specific row
  const deleteOtherDetailRow = (index) => {
    setOtherDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  // const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  // const pincodeRegex = /^[1-9][0-9]{5}$/;
  // const contactRegex = /^[0-9]{10}$/;

  // const getTableErrorMessages = (validationErrors) => {
  //   const messages = [];

  //   // Rate rows
  //   if (validationErrors?.rateRowErrors?.length) {
  //     validationErrors.rateRowErrors.forEach((rowErr, i) => {
  //       if (rowErr) {
  //         Object.entries(rowErr).forEach(([field, msg]) => {
  //           if (msg) messages.push(`Rate Row ${i + 1}: ${msg}`);
  //         });
  //       }
  //     });
  //   }

  //   // Other details
  //   if (validationErrors?.otherDetailErrors?.length) {
  //     validationErrors.otherDetailErrors.forEach((rowErr, i) => {
  //       if (rowErr) {
  //         Object.entries(rowErr).forEach(([field, msg]) => {
  //           if (msg) messages.push(`Other Detail Row ${i + 1}: ${msg}`);
  //         });
  //       }
  //     });
  //   }

  //   return messages;
  // };

  // Step Validation
  const validateStep1 = () => {
    const errors = {};

    // Company Name
    if (!formData.companyName?.trim()) {
      errors.companyName = "Company Name is required";
    }

    // Client Code
    if (!formData.clientcode?.trim()) {
      errors.clientcode = "Client Code is required";
    }

    // // Email
    // if (!formData.emailId?.trim()) {
    //   errors.emailId = "Email ID is required";
    // } else if (!emailRegex.test(formData.emailId)) {
    //   errors.emailId = "Invalid email format";
    // }

    // // Contact Person
    // if (!formData.contactPersonName?.trim()) {
    //   errors.contactPersonName = "Contact Person Name is required";
    // }

    // // Contact No
    // if (formData.contactNo && !contactRegex.test(formData.contactNo)) {
    //   errors.contactNo = "Contact number must be 10 digits";
    // }

    // // Pincode
    // if (formData.pincode && !pincodeRegex.test(formData.pincode)) {
    //   errors.pincode = "Please enter a valid 6-digit Pincode";
    // }

    // // GST State Code
    // if (formData.gstStateCode && isNaN(formData.gstStateCode)) {
    //   errors.gstStateCode = "GST State Code must be a number";
    // }

    // // GST No
    // if (formData.gstNo && !gstRegex.test(formData.gstNo)) {
    //   errors.gstNo = "Invalid GST Format";
    // }

    // // SAC Code
    // if (formData.sacCode && !pincodeRegex.test(formData.sacCode)) {
    //   errors.sacCode = "Please enter a valid 6-digit SAC Code";
    // }

    setValidationErrors(errors);

    // Scroll to first invalid field
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];

      const element = document.querySelector(`[name="${firstErrorField}"]`);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          element.focus();
        }, 300);
      }

      return false;
    }

    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!formData.bankName?.trim()) errors.bankName = "Bank Name is required";
    if (!formData.accountNo?.trim()) {
      errors.accountNo = "Account No is required";
    } else if (!/^[0-9]{6,18}$/.test(formData.accountNo)) {
      errors.accountNo = "Account number must be 6-18 digits";
    }
    if (!formData.ifscCode?.trim()) {
      errors.ifscCode = "IFSC Code is required";
    } else if (!ifscRegex.test(formData.ifscCode)) {
      errors.ifscCode = "Invalid IFSC code";
    }
    if (formData.micrCode && !/^[0-9]{9}$/.test(formData.micrCode)) {
      errors.micrCode = "MICR Code must be 9 digits.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    const rateRowErrors = [];
    const otherDetailErrors = [];

    // --- SITE DETAILS VALIDATION ---
    // --- REQUIRED FIELDS ---
    if (!siteDetails.siteName?.trim()) {
      errors.siteName = "Site Name is required.";
    }

    // if (!siteDetails.clientcode?.trim()) {
    //   errors.clientcode = "Client Code is required.";
    // }

    if (!siteDetails.site_id?.trim()) {
      errors.site_id = "Site ID is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (siteDetails.emailId && !emailRegex.test(siteDetails.emailId)) {
      errors.emailId = "Invalid Email ID format.";
    }
    if (
      siteDetails.salesPersonEmailId &&
      !emailRegex.test(siteDetails.salesPersonEmailId)
    ) {
      errors.salesPersonEmailId = "Invalid Sales Person Email format.";
    }

    const contactRegex = /^[0-9]{10}$/;
    if (siteDetails.contactNo && !contactRegex.test(siteDetails.contactNo)) {
      errors.contactNo = "Contact number must be 10 digits.";
    }
    if (
      siteDetails.salesPersonContactNo &&
      !contactRegex.test(siteDetails.salesPersonContactNo)
    ) {
      errors.salesPersonContactNo = "Sales Person contact must be 10 digits.";
    }

    // --- TAX / NUMERIC FIELDS ---
    const taxFields = ["cgst", "sgst", "igst"];
    taxFields.forEach((field) => {
      const val = siteDetails[field];
      if (val !== "" && val !== undefined && val !== null) {
        if (isNaN(val) || val < 0 || val > 100) {
          errors[field] = `${field.toUpperCase()} must be between 0 and 100.`;
        }
      }
    });

    if (
      siteDetails.expectedBillingAmount &&
      (isNaN(siteDetails.expectedBillingAmount) ||
        Number(siteDetails.expectedBillingAmount) < 0)
    ) {
      errors.expectedBillingAmount =
        "Expected billing amount must be a valid number.";
    }

    if (
      siteDetails.daysForBilling &&
      (isNaN(siteDetails.daysForBilling) ||
        Number(siteDetails.daysForBilling) < 0)
    ) {
      errors.daysForBilling = "Days for billing must be a valid number.";
    }

    // --- RATE ROWS VALIDATION ---
    // rateRows.forEach((row, i) => {
    //   const rowErr = {};
    //   if (!row.empType?.trim()) rowErr.empType = "Employee type is required.";
    //   if (!row.basic || isNaN(row.basic))
    //     rowErr.basic = "Basic must be a valid number.";
    //   if (!row.hra || isNaN(row.hra))
    //     rowErr.hra = "HRA must be a valid number.";
    //   if (!row.serviceChargesType?.trim())
    //     rowErr.serviceChargesType = "Service charge type is required.";
    //   if (row.serviceCharges && isNaN(row.serviceCharges))
    //     rowErr.serviceCharges = "Service charges must be a number.";
    //   if (Object.keys(rowErr).length > 0) rateRowErrors[i] = rowErr;
    // });

    // --- OTHER DETAILS VALIDATION ---
    otherDetails.forEach((row, i) => {
      const rowErr = {};
      // console.log(row.amountToCompare);
      if (row.amountToCompare?.trim()) {
        const amt = row.amountToCompare.trim();

        // Case 1: Single number (integer or decimal)
        if (/^\d+(\.\d+)?$/.test(amt)) {
          const num = Number(amt);
          if (isNaN(num)) {
            rowErr.amountToCompare =
              "Amount to Compare must be a valid number.";
          }
          // console.log("1");
        }

        // Case 2: Range — two valid numbers separated by a hyphen
        else if (/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(amt)) {
          const [min, max] = amt.split("-").map((v) => Number(v));
          if (isNaN(min) || isNaN(max)) {
            rowErr.amountToCompare = "Both values in range must be numbers.";
          } else if (min >= max) {
            rowErr.amountToCompare =
              "Invalid range: first value must be less than second value.";
          }
          // console.log("2gh");
        }

        // Case 3: Anything else (invalid format)
        else {
          // console.log("3");
          rowErr.amountToCompare =
            "Enter a valid number or range (e.g., 5000 or 4000-6000).";
        }
      }

      //   if (!row.typeOfServ?.trim())
      //     rowErr.typeOfServ = "Type of Service is required.";
      //   if (!row.chargesType?.trim())
      //     rowErr.chargesType = "Charges Type is required.";
      //   if (!row.charges || isNaN(row.charges))
      //     rowErr.charges = "Charges must be a valid number.";
      //   if (!row.calcOperation?.trim())
      //     rowErr.calcOperation = "Calculation Operation is required.";
      //   if (row.amountToCompare && isNaN(row.amountToCompare))
      //     rowErr.amountToCompare = "Amount to compare must be a number.";

      if (Object.keys(rowErr).length > 0) otherDetailErrors[i] = rowErr;
    });

    // --- FINALIZE ERRORS ---
    const hasRowErrors =
      rateRowErrors.length > 0 || otherDetailErrors.length > 0;
    if (hasRowErrors) errors.tableRows = "Please fix table row errors.";

    // Store structured error details (optional, for highlighting individual cells)
    setValidationErrors({
      ...errors,
      rateRowErrors,
      otherDetailErrors,
    });

    // console.log(errors, rateRowErrors, otherDetailErrors);
    return Object.keys(errors).length === 0 && !hasRowErrors;
  };

  const scrollToFirstError = () => {
    const firstErrorField = document.querySelector(".is-invalid");

    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      firstErrorField.focus();
    }
  };

  const handleClientUpdate = async () => {
    const handleNext = () => {
      setStep((prev) => prev + 1);
    };
    try {
      const id = formData._id;
      // console.log(formData, id);
      await axios.put(
        `${API_URL}/api/clients/updateClient/${id}`,
        formData,
        getAuthHeaders(),
      );
      alert("Client updated successfully!");
      onUpdate(id);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else
        alert(
          `Error: ${
            error.response?.data?.message || "Failed to update client details."
          }`,
        );
    }
  };

  const saveOtherDetails = async () => {
    try {
      for (let row of otherDetails) {
        const payload = {
          client_id: selectedClientId,
          rate_id: row.rate_id || null,
          type_of_services: row.typeOfServ,
          count_services: row.count_services || 1,
          charges_services: row.charges,
          totalcharges_services: row.total || 0,
          newemp_type: row.newemp_type || "",
          ea_calculateon: row.calcOn,
          ea_operator: row.calcOperation,
          ea_comp_operator: row.amountToCompare,
          source: "OTHER",
        };

        await axios.post(`${API_URL}/api/client-service-charges`, payload);
      }

      alert("Saved successfully");
      fetchOtherDetails();
    } catch (err) {
      console.log(err);
    }
  };
  const handleClientBankUpdate = async () => {
    console.log("BANK UPDATE CLICKED");

    try {
      const id = formData._id;

      console.log("ID =", id);

      console.log("API URL =", `${API_URL}/api/clients/updateClientBank/${id}`);

      console.log("FORM DATA =", formData);

      const res = await axios.put(
        `${API_URL}/api/clients/updateClientBank/${id}`,
        formData,
        getAuthHeaders(),
      );

      console.log("SUCCESS =", res.data);

      alert("Bank Details updated successfully!");
    } catch (error) {
      console.log("FULL ERROR =", error);

      console.log("ERROR RESPONSE =", error.response);

      console.log("ERROR DATA =", error.response?.data);

      console.log("ERROR STATUS =", error.response?.status);
    }
  };

  const addNewSite = async () => {
    const clientId = formData._id;

    // ✅ SAFE PAYLOAD (important fix)
    const payload = {
      siteDetails: {
        ...siteDetails,
      },
      otherDetails: otherDetails || [],
      rates: rateRows || [],
    };

    // 🔥 DEBUG LOGS
    console.log("==================================");
    console.log("🚀 CLIENT ID:", clientId);
    console.log("🏗 SITE DETAILS:", siteDetails);
    console.log("📊 OTHER DETAILS:", otherDetails);
    console.log("💰 RATE ROWS:", rateRows);
    console.log("📦 FINAL PAYLOAD:", payload);
    console.log("==================================");

    try {
      const response = await axios.post(
        `${API_URL}/api/clients/${clientId}/site`,
        payload,
        getAuthHeaders(),
      );

      console.log("✅ SUCCESS RESPONSE:", response.data);

      alert("Sites added successfully!");
      onUpdate(clientId);

      // reset form
      setSiteDetails({
        siteName: "",
        clientCode: "",
        siteId: "",
        workOrderNo: "",
        contactPersonName: "",
        address: "",
        billingAddress: "",
        contactNo: "",
        emailId: "",
        city: "",
        state: "",
        country: "",
        locationName: "",
        locationStartDate: "",
        locationEndDate: "",
        salesPersonName: "",
        salesPersonEmailId: "",
        salesPersonContactNo: "",
        billCycleDate: "",
        status: "Active",
        cgst: "",
        sgst: "",
        igst: "",
        expectedBillingAmount: "",
        daysForBilling: "",
        viewOTHours: false,
        attachWagesSHeet: false,
        roundOffAmount: false,
        billWithoutRank: false,
        ponumber: "",
        poFile: null,
      });

      setRateRows([]);
      setOtherDetails([]);
    } catch (error) {
      console.log("❌ ERROR OCCURRED");
      console.log("➡️ URL:", `${API_URL}/api/clients/${clientId}/site`);
      console.log("➡️ STATUS:", error.response?.status);
      console.log("➡️ ERROR DATA:", error.response?.data);
      console.log("➡️ FULL ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert(
          `Error: ${error.response?.data?.message || "Something went wrong"}`,
        );
      }
    }
  };
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (step === 3 && !validateStep3()) {
  //     alert("Please fix the validation errors.");
  //     return;
  //   }
  //   // console.log(validationErrors);
  //   saveClient({
  //     ...formData,
  //     sites: [
  //       {
  //         ...siteDetails,
  //         otherDetails,
  //         rates: rateRows,
  //       },
  //     ],
  //   });
  // };

  const handleSubmit = async (e) => {
    // e.preventDefault();

    const url = `${
      import.meta.env.VITE_API_URL || "http://localhost:5001"
    }/api/clients`;

    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      sites: [
        {
          ...siteDetails,
          otherDetails,
          rates: rateRows,
        },
      ],
    };

    // 🔥 FULL DEBUG PRINT
    console.log("==================================");
    console.log("🚀 API URL:", url);
    console.log("🔐 TOKEN:", token);
    console.log("📦 FORM DATA:", formData);
    console.log("🏗 SITE DETAILS:", siteDetails);
    console.log("📊 OTHER DETAILS:", otherDetails);
    console.log("💰 RATE ROWS:", rateRows);
    console.log("📤 FINAL PAYLOAD:", payload);
    console.log("==================================");

    try {
      const res = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ SUCCESS RESPONSE:");
      console.log(res.data);

      // ✅ SUCCESS MESSAGE
      // alert("✅ Client Created Successfully");

      // OPTIONAL RESET FORM
      setFormData({
        companyName: "",
        contactPersonName: "",
        contactNo: "",
        emailId: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstStateCode: "",
        gstNo: "",
        sacCode: "",
        billingCompany: "",
        companyBankName: "",
        otherInfo: "",
        termsAndConditions: "",
        bankName: "",
        accountNo: "",
        ifscCode: "",
        micrCode: "",
        branch: "",
        bankCity: "",
      });
      navigate("/add-new/client");
    } catch (error) {
      console.log("❌ ERROR OCCURRED");
      console.log("➡️ URL:", url);
      console.log("➡️ TOKEN:", token);

      if (error.response) {
        console.log("📌 STATUS:", error.response.status);
        console.log("📌 RESPONSE DATA:", error.response.data);

        alert(error.response.data.message || "❌ Failed To Create Client");
      } else if (error.request) {
        console.log("📌 NO RESPONSE FROM SERVER");
        console.log(error.request);

        alert("❌ Server Not Responding");
      } else {
        console.log("📌 AXIOS ERROR:", error.message);

        alert(error.message);
      }
    }
  };

  const renderRateRows = () =>
    rateRows.map((row, idx) => (
      <tr key={idx}>
        <td>
          <Form.Select
            value={row.empType}
            name={`empType_${idx}`}
            style={{ width: "auto" }}
            onChange={(e) =>
              handleRateRowChange(idx, "empType", e.target.value)
            }
          >
            <option value="">Select Employee Type</option>
            {employeeTypes.map((emp) => (
              <option key={emp._id || emp.id} value={emp.emp_type}>
                {emp.emp_type}
              </option>
            ))}
          </Form.Select>
        </td>
        <td>
          <Form.Select
            value={row.hours}
            style={{ width: "auto" }}
            onChange={(e) => handleRateRowChange(idx, "hours", e.target.value)}
          >
            <option value="">Select Hours</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="12">12</option>
          </Form.Select>
        </td>
        <td>
          <Form.Control
            type="number"
            style={{ width: "auto" }}
            value={row.nos}
            onChange={(e) => handleRateRowChange(idx, "nos", e.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.basic}
            style={{ width: "auto" }}
            onChange={(e) => handleRateRowChange(idx, "basic", e.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.hra}
            style={{ width: "auto" }}
            onChange={(e) => handleRateRowChange(idx, "hra", e.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.da}
            style={{ width: "auto" }}
            onChange={(e) => handleRateRowChange(idx, "da", e.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.specialAllowance}
            style={{ width: "auto" }}
            onChange={(e) =>
              handleRateRowChange(idx, "specialAllowance", e.target.value)
            }
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.otherAllowance}
            style={{ width: "auto" }}
            onChange={(e) =>
              handleRateRowChange(idx, "otherAllowance", e.target.value)
            }
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.lww}
            style={{ width: "auto" }}
            onChange={(e) => handleRateRowChange(idx, "lww", e.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            style={{ width: "auto" }}
            value={row.bonus}
            onChange={(e) => handleRateRowChange(idx, "bonus", e.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.costPerHeadGross}
            style={{ width: "auto" }}
            onChange={(e) =>
              handleRateRowChange(idx, "costPerHeadGross", e.target.value)
            }
          />
        </td>
        <td>
          <Form.Select
            value={row.serviceChargesType}
            style={{ width: "auto" }}
            onChange={(e) =>
              handleRateRowChange(idx, "serviceChargesType", e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="%">%</option>
            <option value="Rs">Rs</option>
          </Form.Select>
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.serviceCharges}
            style={{ width: "auto" }}
            onChange={(e) =>
              handleRateRowChange(idx, "serviceCharges", e.target.value)
            }
          />
        </td>
        <td>
          <Form.Control
            type="number"
            value={row.perDayRate}
            style={{ width: "auto" }}
            onChange={(e) =>
              handleRateRowChange(idx, "perDayRate", e.target.value)
            }
          />
        </td>
        <td>
          <Form.Control
            style={{ width: "auto" }}
            type="number"
            value={row.otRate}
            onChange={(e) => handleRateRowChange(idx, "otRate", e.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            style={{ width: "auto" }}
            value={row.leaveWages}
            onChange={(e) =>
              handleRateRowChange(idx, "leaveWages", e.target.value)
            }
          />
        </td>
        <td>
          <Form.Control
            type="number"
            style={{ width: "auto" }}
            value={row.uniformWashing}
            onChange={(e) =>
              handleRateRowChange(idx, "uniformWashing", e.target.value)
            }
          />
        </td>
        <td>
          <Form.Control
            type="number"
            style={{ width: "auto" }}
            value={row.anyOther}
            onChange={(e) =>
              handleRateRowChange(idx, "anyOther", e.target.value)
            }
          />
        </td>
        <td>
          <div className="table-actions">
            {idx === rateRows.length - 1 && (
              <button
                type="button"
                onClick={addRateRow}
                className="icon-btn add"
              >
                <FaPlus />
              </button>
            )}
            {rateRows.length > 1 && (
              <button
                type="button"
                onClick={() => deleteRateRow(idx)}
                className="icon-btn delete"
              >
                <FaMinus />
              </button>
            )}
          </div>
        </td>
      </tr>
    ));

  const renderStepContent = () => {
    switch (step) {
      case 1: // Client Details
        return (
          <div>
            {/* {Object.keys(validationErrors).length > 0 && (
              <Alert variant="danger">
                Please fix the validation errors below.
              </Alert>
            )} */}
            <Row>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="companyName">
                  <Form.Label>
                    Company Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="companyName"
                    value={formData.companyName || ""}
                    onChange={handleChange}
                    placeholder="Company Name"
                    isInvalid={!!validationErrors.companyName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.companyName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="companyName">
                  <Form.Label>
                    Client Code <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="clientcode"
                    value={formData.clientcode || ""}
                    onChange={handleChange}
                    placeholder="Client Code"
                    isInvalid={!!validationErrors.clientcode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.clientcode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="contactNo">
                  <Form.Label>Contact No</Form.Label>

                  <Form.Control
                    name="contactNo"
                    value={formData.contactNo || ""}
                    placeholder="Contact No"
                    maxLength={10}
                    onChange={(e) => {
                      // only numbers + max 10 digits
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setFormData({
                        ...formData,
                        contactNo: value,
                      });
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.contactNo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="emailId">
                  <Form.Label>Email ID </Form.Label>
                  <Form.Control
                    name="emailId"
                    type="email"
                    value={formData.emailId || ""}
                    onChange={handleChange}
                    placeholder="Email ID"
                    // isInvalid={!!validationErrors.emailId}
                  />
                  <Form.Control.Feedback type="invalid">
                    {/* {validationErrors.emailId} */}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="contactPersonName">
                  <Form.Label>Contact Person Name</Form.Label>
                  <Form.Control
                    name="contactPersonName"
                    value={formData.contactPersonName || ""}
                    onChange={handleChange}
                    placeholder="Contact Person Name"
                    // isInvalid={!!validationErrors.contactPersonName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {/* {validationErrors.contactPersonName} */}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* ADDRESS */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="Address"
                    rows={3}
                  />
                </Form.Group>
              </Col>

              {/* PINCODE */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="pincode">
                  <Form.Label>Pincode</Form.Label>

                  <div style={{ position: "relative" }}>
                    <Form.Control
                      name="pincode"
                      placeholder="Pincode"
                      value={formData.pincode || ""}
                      onChange={handlePincodeChange}
                      onFocus={() => setShowPincodeList(true)}
                      isInvalid={!!validationErrors.pincode}
                      autoComplete="off"
                    />

                    {/* DROPDOWN */}
                    {showPincodeList && pincodeSuggestions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #ddd",
                          zIndex: 999,
                          maxHeight: "200px",
                          overflowY: "auto", backgroundColor: "lightyellow",
                          borderRadius: "6px",
                        }}
                      >
                        {pincodeSuggestions.map((p, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelectPincode(p)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{ padding: "8px", cursor: "pointer" }}
                          >
                            {p.pincode} - {p.city || p.city_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.pincode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* CITY */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="city">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </Form.Group>
              </Col>

              {/* STATE */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="state">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    name="state"
                    value={formData.state || ""}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="gstStateCode">
                  <Form.Label>GST State Code</Form.Label>
                  <Form.Control
                    name="gstStateCode"
                    value={formData.gstStateCode || ""}
                    onChange={handleChange}
                    placeholder="GST State Code"
                    // isInvalid={!!validationErrors.gstStateCode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {/* {validationErrors.gstStateCode} */}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="gstNo">
                  <Form.Label>GST No</Form.Label>
                  <Form.Control
                    name="gstNo"
                    value={formData.gstNo || ""}
                    onChange={handleChange}
                    placeholder="GST No"
                    // isInvalid={!!validationErrors.gstNo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {/* {validationErrors.gstNo} */}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="sacCode">
                  <Form.Label>SAC Code</Form.Label>
                  <Form.Control
                    name="sacCode"
                    value={formData.sacCode || ""}
                    onChange={handleChange}
                    placeholder="SAC Code"
                    // isInvalid={!!validationErrors.sacCode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {/* {validationErrors.sacCode} */}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="billingCompany">
                  <Form.Label>Billing Company</Form.Label>

                  <Form.Select
                    name="billingCompany"
                    value={formData.billingCompanyId || ""} // ✅ ID use here
                    onChange={(e) => {
                      const selectedId = e.target.value;

                      const selectedCompany = companies.find(
                        (c) => c.id === selectedId,
                      );

                      setFormData((prev) => ({
                        ...prev,

                        // ✅ STORE BOTH
                        billingCompanyId: selectedId,
                        billingCompany: selectedCompany?.company_name || "",

                        companyBankId: "",
                        companyBankName: "",
                      }));

                      if (selectedId) {
                        getCompanyBanks(selectedId);
                      } else {
                        setBillingCompanyBanks([]);
                      }
                    }}
                  >
                    <option value="">Select Billing Company</option>

                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="companyBankName">
                  <Form.Label>Display Bank Detail On Invoice</Form.Label>

                  <Form.Select
                    name="companyBankName"
                    value={formData.companyBankId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;

                      const selectedBank = billingCompanyBanks.find(
                        (b) => String(b.id) === String(selectedId),
                      );

                      setFormData((prev) => ({
                        ...prev,
                        companyBankId: selectedId,
                        companyBankName: selectedBank?.bankName
                          ? String(selectedBank.bankName)
                          : "",
                      }));
                    }}
                    disabled={billingCompanyBanks.length === 0}
                  >
                    <option value="">Select Bank</option>

                    {billingCompanyBanks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} sm={6} md={6} className="mb-3">
                <Form.Group controlId="otherInfo">
                  <Form.Label>Other Info</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="otherInfo"
                    value={formData.otherInfo || ""}
                    onChange={handleChange}
                    placeholder="Other Info"
                    rows={3}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={6} className="mb-3">
                <Form.Group controlId="termsAndConditions">
                  <Form.Label>Terms And Conditions</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="termsAndConditions"
                    value={formData.termsAndConditions || ""}
                    onChange={handleChange}
                    placeholder="Terms & Conditions"
                    rows={3}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 2: // Bank Details
        return (
          <div>
            {/* {Object.keys(validationErrors).length > 0 && (
              <Alert variant="danger">
                Please fix the validation errors below.
              </Alert>
            )} */}
            <Row>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="bankName">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    name="bankName"
                    value={formData.bankName || ""}
                    onChange={handleChange}
                    placeholder="Bank Name"
                    // isInvalid={!!validationErrors.bankName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {/* {validationErrors.bankName} */}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="accountNo">
                  <Form.Label>Account No</Form.Label>

                  <Form.Control
                    name="accountNo"
                    value={formData.accountNo || ""}
                    placeholder="Account No"
                    onChange={(e) => {
                      // only numbers
                      const value = e.target.value.replace(/\D/g, "");

                      setFormData({
                        ...formData,
                        accountNo: value,
                      });
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.accountNo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="ifscCode">
                  <Form.Label>IFSC Code</Form.Label>
                  <Form.Control
                    name="ifscCode"
                    value={formData.ifscCode || ""}
                    onChange={handleChange}
                    placeholder="IFSC Code"
                    isInvalid={!!validationErrors.ifscCode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.ifscCode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="branch">
                  <Form.Label>Branch</Form.Label>
                  <Form.Control
                    name="branch"
                    value={formData.branch || ""}
                    onChange={handleChange}
                    placeholder="Branch"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="bankCity">
                  <Form.Label>Bank City</Form.Label>
                  <Form.Control
                    name="bankCity"
                    value={formData.bankCity || ""}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="micrCode">
                  <Form.Label>MICR Code</Form.Label>

                  <Form.Control
                    name="micrCode"
                    value={formData.micrCode || ""}
                    placeholder="MICR Code"
                    maxLength={9} // limit
                    isInvalid={!!validationErrors.micrCode}
                    onChange={(e) => {
                      // only numbers + limit 9 digits
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 9);

                      setFormData({
                        ...formData,
                        micrCode: value,
                      });
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.micrCode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 3: // Rates & Sites
        return (
          <div>
            {/* {hasValidationErrors(validationErrors) && ( */}
            {/* <Alert variant="danger" className="mt-3"> */}
            {/* <Alert.Heading>
                  Please fix the validation errors below:
                </Alert.Heading> */}
            <ul className="mb-0">
              {/* 1️⃣ Field-level errors */}
              {/* {Object.entries(validationErrors)
                    .filter(
                      ([key]) =>
                        key !== "rateRowErrors" && key !== "otherDetailErrors"
                    )
                    .map(([key, msg]) =>
                      msg ? <li key={key}>{msg}</li> : null
                    )} */}

              {/* 2️⃣ Table row errors */}
              {/* {getTableErrorMessages(validationErrors).map((msg, idx) => ( */}
              {/* <li key={`table-${idx}`}>{msg}</li> */}
              {/* ))} */}
            </ul>
            {/* </Alert> */}
            {/* )} */}
            <Row>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="siteName">
                  <Form.Label>
                    Site Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="siteName"
                    value={siteDetails.siteName || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Site Name"
                    isInvalid={!!validationErrors.siteName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.siteName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="clientcode">
                  <Form.Label>
                    Client Code<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="Client Code"
                    disabled
                    value={formData.clientcode || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Client Code"
                    isInvalid={!!validationErrors.clientcode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.clientcode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="site_id">
                  <Form.Label>
                    Site Id<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="site_id"
                    value={siteDetails.site_id || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Site Id"
                    isInvalid={!!validationErrors.site_id}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.site_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="workOrderNo">
                  <Form.Label>Work Order No</Form.Label>
                  <Form.Control
                    name="workOrderNo"
                    value={siteDetails.workOrderNo || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Work Order No"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="contactPersonRates">
                  <Form.Label>Contact Person Name</Form.Label>
                  <Form.Control
                    name="contactPersonName"
                    value={siteDetails.contactPersonName || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Contact Person Name"
                  />
                </Form.Group>
              </Col>
              {/* <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    name="address"
                    as={"textarea"}
                    value={siteDetails.address || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Address"
                    rows={3}
                  />
                </Form.Group>
              </Col> */}
              {/* <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="billingAddress">
                  <Form.Label>Billing Address</Form.Label>
                  <Form.Control
                    name="billingAddress"
                    as={"textarea"}
                    value={siteDetails.billingAddress || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Billing Address"
                    rows={3}
                  />
                </Form.Group>
              </Col> */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="contactNo">
                  <Form.Label>Contact No</Form.Label>

                  <Form.Control
                    name="contactNo"
                    value={siteDetails.contactNo || ""}
                    placeholder="Contact No"
                    maxLength={10}
                    isInvalid={!!validationErrors.contactNo}
                    onChange={(e) => {
                      // only numbers
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      handleSiteDetailChange({
                        target: {
                          name: "contactNo",
                          value,
                        },
                      });
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.contactNo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="emailId">
                  <Form.Label>Email ID</Form.Label>
                  <Form.Control
                    name="emailId"
                    type="email"
                    value={siteDetails.emailId || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Email ID"
                    isInvalid={!!validationErrors.emailId}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.emailId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    name="address"
                    as="textarea"
                    value={siteDetails.address || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Address"
                    rows={3}
                  />
                </Form.Group>
              </Col>

              {/* PINCODE */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="pincode">
                  <Form.Label>Pincode</Form.Label>

                  <div style={{ position: "relative" }}>
                    <Form.Control
                      name="pincode"
                      placeholder="Pincode"
                      value={formData.pincode || ""}
                      onChange={handlePincodeChange}
                      onFocus={() => setShowPincodeList(true)}
                      isInvalid={!!validationErrors.pincode}
                      autoComplete="off"
                    />

                    {/* DROPDOWN */}
                    {showPincodeList && pincodeSuggestions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #ddd",
                          zIndex: 999,
                          maxHeight: "200px",
                          overflowY: "auto", backgroundColor: "lightyellow",
                          borderRadius: "6px",
                        }}
                      >
                        {pincodeSuggestions.map((p, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelectPincode(p)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{ padding: "8px", cursor: "pointer" }}
                          >
                            {p.pincode} - {p.city || p.city_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.pincode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="city">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    name="city"
                    value={formData.city || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="City"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="state">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    name="state"
                    value={formData.state || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="State"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="country">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    name="country"
                    value={siteDetails.country || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Country"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="sitezonename">
                  <Form.Label>Site Zone Name</Form.Label>
                  <Form.Control
                    name="sitezonename"
                    value={siteDetails.sitezonename || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Site Zone Name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.sitezonename}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* ================= LATITUDE ================= */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="latitude">
                  <Form.Label>Latitude</Form.Label>

                  <Form.Control
                    type="text"
                    name="latitude"
                    placeholder="Enter Latitude"
                    value={siteDetails.latitude || ""}
                    onChange={(e) => {
                      // only numbers and decimal
                      const value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*)\./g, "$1"); // only one dot

                      handleSiteDetailChange({
                        target: {
                          name: "latitude",
                          value,
                        },
                      });
                    }}
                  />
                </Form.Group>
              </Col>
              {/* ================= LONGITUDE ================= */}
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="longitude">
                  <Form.Label>Longitude</Form.Label>

                  <Form.Control
                    type="text"
                    name="longitude"
                    placeholder="Enter Longitude"
                    value={siteDetails.longitude || ""}
                    onChange={(e) => {
                      // only numbers and decimal
                      const value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*)\./g, "$1"); // only one dot

                      handleSiteDetailChange({
                        target: {
                          name: "longitude",
                          value,
                        },
                      });
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="billingAddress">
                  <Form.Label>Billing Address</Form.Label>
                  <Form.Control
                    name="billingAddress"
                    as="textarea"
                    value={siteDetails.billingAddress || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Billing Address"
                    rows={3}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="locationStartDate">
                  <Form.Label>Location Start Date</Form.Label>
                  <Form.Control
                    name="locationStartDate"
                    type="date"
                    value={siteDetails.locationStartDate || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Location Start Date"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="locationEndDate">
                  <Form.Label>Location End Date</Form.Label>
                  <Form.Control
                    name="locationEndDate"
                    type="date"
                    value={siteDetails.locationEndDate || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Location End Date"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="salesPersonName">
                  <Form.Label>Sales Person Name</Form.Label>
                  <Form.Control
                    name="salesPersonName"
                    value={siteDetails.salesPersonName || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Sales Person Name"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="salesPersonEmail">
                  <Form.Label>Sales Person Email ID</Form.Label>
                  <Form.Control
                    name="salesPersonEmailId"
                    type="email"
                    value={siteDetails.salesPersonEmailId || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Sales Person Email ID"
                    isInvalid={!!validationErrors.salesPersonEmailId}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.salesPersonEmailId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="salesPersonContactNo">
                  <Form.Label>Sales Person Contact No</Form.Label>
                  <Form.Control
                    name="salesPersonContactNo"
                    value={siteDetails.salesPersonContactNo || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Sales Person Contact No"
                    isInvalid={!!validationErrors.salesPersonContactNo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.salesPersonContactNo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="billCycleDate">
                  <Form.Label>Bill Cycle Date</Form.Label>
                  <Form.Select
                    name="billCycleDate"
                    value={siteDetails.billCycleDate || ""}
                    onChange={handleSiteDetailChange}
                  >
                    <option value="">Select Bill Cycle Date</option>
                    <option value="1">1st of Month</option>
                    <option value="15">15th of Month</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={siteDetails.status || ""}
                    onChange={handleSiteDetailChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="cgst">
                  <Form.Label>CGST (%)</Form.Label>
                  <Form.Control
                    name="cgst"
                    value={siteDetails.cgst || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="CGST (%)"
                    isInvalid={!!validationErrors.cgst}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.cgst}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="sgst">
                  <Form.Label>SGST (%)</Form.Label>
                  <Form.Control
                    name="sgst"
                    value={siteDetails.sgst || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="SGST (%)"
                    isInvalid={!!validationErrors.sgst}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.sgst}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="igst">
                  <Form.Label>IGST (%)</Form.Label>
                  <Form.Control
                    name="igst"
                    value={siteDetails.igst || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="IGST (%)"
                    isInvalid={!!validationErrors.igst}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.igst}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="expectedBillingAmount">
                  <Form.Label>Expected Billing Amount</Form.Label>
                  <Form.Control
                    name="expectedBillingAmount"
                    value={siteDetails.expectedBillingAmount || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Expected Billing Amount"
                    isInvalid={!!validationErrors.expectedBillingAmount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.expectedBillingAmount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="daysForBilling">
                  <Form.Label>Total No Of Days For Billing</Form.Label>
                  <Form.Control
                    name="daysForBilling"
                    value={siteDetails.daysForBilling || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="Total No Of Days For Billing"
                    isInvalid={!!validationErrors.daysForBilling}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.daysForBilling}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="ponumber">
                  <Form.Label>PO Number</Form.Label>
                  <Form.Control
                    name="ponumber"
                    value={siteDetails.ponumber || ""}
                    onChange={handleSiteDetailChange}
                    placeholder="PO Number"
                    isInvalid={!!validationErrors.ponumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.ponumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="poFile">
                  <Form.Label>PO Attachment</Form.Label>

                  <Form.Control
                    type="file"
                    name="poFile"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      setSiteDetails((prev) => ({
                        ...prev,
                        poFile: e.target.files[0],
                      }));
                    }}
                  />

                  {siteDetails.poFile && (
                    <small className="text-success">
                      Selected: {siteDetails.poFile.name}
                    </small>
                  )}
                </Form.Group>
              </Col>
              <Row className="mt-3">
                <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="viewOTHours"
                    name="viewOTHours"
                    label="View OT Hours"
                    checked={!!siteDetails.viewOTHours}
                    onChange={handleSiteDetailChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSiteDetailChange({
                          target: {
                            name: "viewOTHours",
                            type: "checkbox",
                            checked: !siteDetails.viewOTHours,
                          },
                        });
                      }
                    }}
                  />
                </Col>

                <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="attachWagesSHeet"
                    name="attachWagesSHeet"
                    label="Attach Wages Sheet"
                    checked={!!siteDetails.attachWagesSHeet}
                    onChange={handleSiteDetailChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSiteDetailChange({
                          target: {
                            name: "attachWagesSHeet",
                            type: "checkbox",
                            checked: !siteDetails.attachWagesSHeet,
                          },
                        });
                      }
                    }}
                  />
                </Col>

                <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="roundOffAmount"
                    name="roundOffAmount"
                    label="Round Off Amount"
                    checked={!!siteDetails.roundOffAmount}
                    onChange={handleSiteDetailChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSiteDetailChange({
                          target: {
                            name: "roundOffAmount",
                            type: "checkbox",
                            checked: !siteDetails.roundOffAmount,
                          },
                        });
                      }
                    }}
                  />
                </Col>

                <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="billWithoutRank"
                    name="billWithoutRank"
                    label="Bill Without Rank"
                    checked={!!siteDetails.billWithoutRank}
                    onChange={handleSiteDetailChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSiteDetailChange({
                          target: {
                            name: "billWithoutRank",
                            type: "checkbox",
                            checked: !siteDetails.billWithoutRank,
                          },
                        });
                      }
                    }}
                  />
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="nonComplianceSite"
                    name="nonComplianceSite"
                    label="Non Compliance Site"
                    checked={!!siteDetails.nonComplianceSite}
                    onChange={handleSiteDetailChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSiteDetailChange({
                          target: {
                            name: "nonComplianceSite",
                            type: "checkbox",
                            checked: !siteDetails.nonComplianceSite,
                          },
                        });
                      }
                    }}
                  />
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="applyLeave"
                    name="applyLeave"
                    label="Apply Leave"
                    checked={!!siteDetails.applyLeave}
                    onChange={handleSiteDetailChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSiteDetailChange({
                          target: {
                            name: "applyLeave",
                            type: "checkbox",
                            checked: !siteDetails.applyLeave,
                          },
                        });
                      }
                    }}
                  />
                </Col>
              </Row>
            </Row>
            <hr />

            <div className="rates-section mb-4">
              <h5 className="card-subtitle mt-3 mb-4">Charges By Rank</h5>
              <Table responsive hover bordered>
                <thead className="table-secondary">
                  <tr>
                    <th>Emp Type</th>
                    <th>Hours</th>
                    <th>Nos</th>
                    <th>BASIC</th>
                    <th>HRA</th>
                    <th>DA</th>
                    <th>Special Allowance</th>
                    <th>Other Allowance</th>
                    <th>LWW</th>
                    <th>Bonus</th>
                    <th>Cost Per Head(Gross)</th>
                    <th>Service Charges Type</th>
                    <th>Service Charges</th>
                    <th>Per Day Rate</th>
                    <th>OT Rate</th>
                    <th>Leave Wages</th>
                    <th>Uniform Washing</th>
                    <th>Any Other</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{renderRateRows()}</tbody>
              </Table>
            </div>
            {/* <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setShowOtherModal(true);
              }}
            >
              Click To Other Info
            </button> */}
          </div>
        );

      case 4:
        return showEditSiteRate ? (
          <EditSiteRate
            siteData={selectedSite}
            onBackSite={() => {
              setShowEditSiteRate(false);
            }}
            updateSite={(updatedSite) => {
              console.log("Updated:", updatedSite);

              handleSiteUpdate(updatedSite);

              setShowEditSiteRate(false);

              getClientSites(clientId);
            }}
          />
        ) : (
          <div className="table-responsive">
            <Table bordered hover>
              <thead className="table-secondary">
                <tr>
                  <th>Location Detail</th>
                  <th>Sales Person Detail</th>
                  <th>Billing Detail</th>
                  <th>Total Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {clientSites?.length > 0 ? (
                  clientSites?.map((r, idx) => (
                    <tr key={idx}>
                      {/* LOCATION */}
                      <td>
                        <strong>Site:</strong> {r?.siteName}
                        <br />
                        <strong>Client Code:</strong> {r?.clientCode}
                        <br />
                        <strong>Name:</strong> {r?.contactPersonName}
                        <br />
                        <strong>Address:</strong> {r?.address}
                      </td>

                      {/* SALES */}
                      <td>
                        <strong>Name:</strong> {r?.salesPersonName}
                        <br />
                        <strong>Contact:</strong> {r?.salesPersonContactNo}
                        <br />
                        <strong>Email:</strong> {r?.salesPersonEmailId}
                      </td>

                      {/* BILLING */}
                      <td>
                        <strong>Bill Cycle:</strong> {r?.billCycleDate}
                        <br />
                        <strong>Status:</strong> {r?.status}
                      </td>

                      {/* COST */}
                      <td>
                        {/* RATES */}
                        {r?.rates?.map((ra, i) => (
                          <div key={i}>
                            <strong>{ra?.emp_type}</strong> ({ra?.hours} hrs) :
                            ₹ {ra?.perDayRate}
                          </div>
                        ))}

                        {/* OTHER */}
                        {r?.otherDetails?.length > 0 && <hr />}

                        {r?.otherDetails?.map((o, i) => (
                          <div key={i}>
                            <strong>{o?.typeOfServ}</strong>: ₹ {o?.charges}
                          </div>
                        ))}
                      </td>

                      {/* ACTION */}
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle size="sm" variant="primary">
                            Actions
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => {
                                console.log("EDIT CLICK DATA => ", r);

                                const formattedSite = {
                                  ...r,

                                  rates: (r.rates || []).map((ra) => ({
                                    ...ra,

                                    // IMPORTANT
                                    id: ra.id || ra.rate_id || ra.site_id || 0,

                                    empType: ra.empType || ra.emp_type || "",

                                    nos: ra.nos || ra.emp_nos || 0,

                                    specialAllowance:
                                      ra.specialAllowance ||
                                      ra.special_allowance ||
                                      0,

                                    otherAllowance:
                                      ra.otherAllowance ||
                                      ra.other_allowance ||
                                      0,

                                    costPerHeadGross:
                                      ra.costPerHeadGross ||
                                      ra.emp_cost_per_head ||
                                      0,

                                    serviceChargesType:
                                      ra.serviceChargesType ||
                                      ra.service_charges_type ||
                                      "",

                                    serviceCharges:
                                      ra.serviceCharges ||
                                      ra.service_charges ||
                                      0,

                                    perDayRate:
                                      ra.perDayRate || ra.emp_perday_rate || 0,

                                    otRate: ra.otRate || ra.ot_rate || 0,

                                    leaveWages:
                                      ra.leaveWages || ra.leave_wages || 0,

                                    uniformWashing:
                                      ra.uniformWashing ||
                                      ra.uniform_washing ||
                                      0,

                                    anyOther: ra.anyOther || ra.any_other || 0,
                                  })),
                                };

                                console.log(
                                  "FORMATTED SITE => ",
                                  formattedSite,
                                );

                                setSelectedSite(formattedSite);

                                setShowEditSiteRate(true);
                              }}
                            >
                              Edit
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() => deleteSite(r?.id, r?.clientId)}
                            >
                              Delete
                            </Dropdown.Item>

                            <Dropdown.Item onClick={() => woRateChart(r)}>
                              WO Rate Chart
                            </Dropdown.Item>

                            <Dropdown.Item onClick={() => wagesSettings(r)}>
                              Wages Setting
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="card form-panel">
        <div>
          <h2 className="form-title card-header mb-4">
            {clientToEdit ? (
              <span>Edit Client - {clientToEdit.companyName}</span>
            ) : (
              "Add New Client"
            )}
          </h2>
          <div className="step-indicator">
            {/* STEP 1 */}
            <div
              className={`step ${step >= 1 ? "active" : ""}`}
              // onClick={() =>  setStep(1)}
              style={{ cursor: "pointer" }}
            >
              <span>1</span> Client Details
            </div>

            {/* STEP 2 */}
            <div
              className={`step ${step >= 2 ? "active" : ""}`}
              // onClick={() => setStep(2)}
              style={{ cursor: "pointer" }}
            >
              <span>2</span> Bank Details
            </div>

            {/* STEP 3 */}
            <div
              className={`step ${step >= 3 ? "active" : ""}`}
              // onClick={() => setStep(3)}
              style={{ cursor: "pointer" }}
            >
              <span>3</span>{" "}
              {clientToEdit ? "New Rates & Site" : "Rates & Site"}
            </div>

            {/* STEP 4 */}
            {clientToEdit && (
              <div
                className={`step ${step >= 4 ? "active" : ""}`}
                onClick={() => setStep(4)}
                style={{ cursor: "pointer" }}
              >
                <span>4</span> Added Rates
              </div>
            )}
          </div>
          {error ? (
            <Alert variant="danger" className="mb-3 text-center">
              {error}
            </Alert>
          ) : (
            ""
          )}
          <Form onSubmit={handleSubmit} className="multi-step-form">
            <div className="form-content">{renderStepContent()}</div>
            <div className="form-actions d-flex justify-content-end align-items-center">
              {step > 1 && (
                <Button
                  variant="outline-secondary"
                  type="button"
                  className="me-2"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}

              <Button
                variant="secondary"
                type="button"
                className="me-2"
                onClick={onBack}
              >
                Cancel
              </Button>
              {clientToEdit ? (
                step === 1 ? (
                  <Button
                    variant="primary"
                    type="button"
                    className="me-2"
                    onClick={handleClientUpdate}
                  >
                    Update Client
                  </Button>
                ) : step === 2 ? (
                  <Button
                    variant="primary"
                    type="button"
                    className="me-2"
                    onClick={handleClientBankUpdate}
                  >
                    Update Bank Details
                  </Button>
                ) : step === 3 ? (
                  <Button
                    variant="primary"
                    type="button"
                    className="me-2"
                    onClick={addNewSite}
                  >
                    Add New Site
                  </Button>
                ) : null
              ) : null}

              {step < 3 && (
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => {
                    if (!validateStep1()) {
                      console.log("validation1");
                      return;
                    }
                    setStep((prev) => prev + 1);
                  }}
                >
                  Next
                </Button>
              )}
              {step === 3 &&
                (!!clientToEdit ? (
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => {
                      setStep(step + 1);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => {
                      if (!validateStep3()) {
                        console.log("validation3");
                        scrollToFirstError();
                        return;
                      }
                      handleSubmit();
                    }}
                  >
                    Submit
                  </Button>
                ))}
            </div>
          </Form>
        </div>
      </Card>

      <Modal
        show={showOtherModal}
        onHide={() => setShowOtherModal(false)}
        centered
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Other Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Table bordered hover responsive>
            <thead className="table-secondary">
              <tr>
                <th>Type of Service</th>
                <th>Charges Type</th>
                <th>Charges</th>
                <th>Calculate On</th>
                <th>Select</th>
                <th>
                  Amount to Compare
                  <br /> (enter two values with '-')
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {otherDetails.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <Form.Select
                      style={{ width: "auto" }}
                      value={row.typeOfServ ?? ""}
                      onChange={(e) =>
                        handleOtherDetailChange(
                          idx,
                          "typeOfServ",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select Type of Service</option>
                      {chargeTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Select
                      type="text"
                      style={{ width: "auto" }}
                      value={row.chargesType}
                      onChange={(e) =>
                        handleOtherDetailChange(
                          idx,
                          "chargesType",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option value="Rs">Rs</option>
                      <option value="%">%</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      style={{ width: "auto" }}
                      value={row.charges}
                      onChange={(e) =>
                        handleOtherDetailChange(idx, "charges", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Form.Select
                      style={{ width: "auto" }}
                      className="form-control"
                      name="calcOn"
                      value={row.calcOn}
                      onChange={(e) =>
                        handleOtherDetailChange(idx, "calcOn", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="On Gross Salary">On Gross Salary</option>
                      <option value="On calculated salary by days">
                        On calculated salary by days
                      </option>
                      <option value="BASIC">BASIC</option>
                      <option value="HRA">HRA</option>
                      <option value="OT DAYS">OT DAYS</option>
                      <option value="AT ACTUAL">AT ACTUAL</option>
                      <option value="PF Wages">PF Wages</option>
                      <option value="ESIC Wages">ESIC Wages</option>
                      <option value="Amount to compare">
                        Amount to compare
                      </option>
                      <option value="GROSS-OTHER+OT AMT">
                        GROSS-OTHER+OT AMT
                      </option>
                      <option value="GROSS-HRA">GROSS-HRA</option>
                      <option value="GROSS-HRA-BONUS">GROSS-HRA-BONUS</option>
                      <option value="BASIC+SPECIAL ALLOW">
                        BASIC+SPECIAL ALLOW
                      </option>
                      <option value="GROSS-OTHER ALLOW">
                        GROSS-OTHER ALLOW
                      </option>
                      <option value="BASIC+DA">BASIC+DA</option>
                      <option value="BASIC+DA+SPECIAL ALLOW+OTHER ALLOW">
                        BASIC+DA+SPECIAL ALLOW+OTHER ALLOW
                      </option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Select
                      style={{ width: "auto" }}
                      value={row.calcOperation}
                      onChange={(e) =>
                        handleOtherDetailChange(
                          idx,
                          "calcOperation",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option value="equal to">equal to</option>
                      <option value="greater than">greater than</option>
                      <option value="greater than or equal to">
                        greater than or equal to
                      </option>
                      <option value="less than">less than</option>
                      <option value="less than or equal to">
                        less than or equal to
                      </option>
                      <option value="between">between</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      style={{ width: "auto" }}
                      value={row.amountToCompare}
                      onChange={(e) =>
                        handleOtherDetailChange(
                          idx,
                          "amountToCompare",
                          e.target.value,
                        )
                      }
                      isInvalid={
                        !!validationErrors.otherDetailErrors?.[idx]
                          ?.amountToCompare
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {
                        validationErrors.otherDetailErrors?.[idx]
                          ?.amountToCompare
                      }
                    </Form.Control.Feedback>
                  </td>
                  <td>
                    <div className="table-actions">
                      {idx === otherDetails.length - 1 && (
                        <button
                          type="button"
                          onClick={addOtherDetailRow}
                          className="icon-btn add"
                        >
                          <FaPlus />
                        </button>
                      )}
                      {otherDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteOtherDetailRow(idx)}
                          className="icon-btn delete"
                        >
                          <FaMinus />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setShowOtherModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={saveOtherDetails}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ClientForm;
