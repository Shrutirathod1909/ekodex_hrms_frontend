import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FaMinus, FaPlus } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const EditSiteRate = ({ siteData, onBackSite, updateSite }) => {
  const [siteDetails, setSiteDetails] = useState({});
  const [otherDetails, setOtherDetails] = useState([
    {
      type_of_services: "",
      count_services: "",
      charges_services: "",
      totalcharges_services: "",
      newemp_type: "",
      ea_calculateon: "",
      ea_operator: "",
      ea_comp_operator: "",
      source: "",
    },
  ]);
  const [rateRows, setRateRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [chargeTypes, setChargeTypes] = useState([]);
  const [data, setData] = useState([]);
  const clientId = siteData?.client_id || siteData?.clientId || siteData?.id;

  const siteId = siteData?.site_id || siteData?.siteId;
  // GET client_other_info by site/client id

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
  const fetchOtherCharges = () => {
    console.log("🔥 fetchOtherCharges CALLED");

    console.log("👉 clientId =", clientId);
    console.log("👉 siteId =", siteId);

    axios
      .get(`${API_URL}/api/client-service-charges`, {
        params: {
          client_id: clientId,
          rate_id: siteId,
        },
      })
      .then((res) => {
        console.log("✅ API SUCCESS FULL RESPONSE =", res);
        console.log("✅ API DATA =", res.data);
        console.log("✅ API DATA.data =", res.data?.data);

        const finalData = (res.data?.data || []).map((r) => ({
          id: r.id,

          type_of_services: r.type_of_services || "",

          chargesType: r.newemp_type || "",

          charges: r.charges_services || "",

          calcOn: r.ea_calculateon || "",

          calcOperation: r.ea_operator || "",

          amountToCompare: r.ea_comp_operator || "",
        }));

        setOtherDetails(finalData);
      })
      .catch((err) => {
        console.log("❌ API ERROR =", err);
        console.log("❌ ERROR RESPONSE =", err.response);
        console.log("❌ ERROR MESSAGE =", err.message);
      });
  };
  useEffect(() => {
    const clientId = siteData?.client_id || siteData?.clientId || siteData?.id;

    const siteId = siteData?.site_id || siteData?.siteId;

    if (clientId && siteId) {
      fetchOtherCharges(clientId, siteId);
    }
  }, [siteData]);
  useEffect(() => {
    fetchChargeTypes();
  }, []);

  const fetchChargeTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/charges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("CHARGES RESPONSE =", res.data);

      let finalData = [];

      if (Array.isArray(res.data)) {
        finalData = res.data;
      } else if (Array.isArray(res.data.data)) {
        finalData = res.data.data;
      } else if (Array.isArray(res.data.charges)) {
        finalData = res.data.charges;
      }

      setChargeTypes(finalData);
    } catch (error) {
      console.error("FETCH CHARGES ERROR =", error);

      setChargeTypes([]);
    }
  };
  useEffect(() => {
    fetchEmployeeTypes();
  }, []);

  const fetchEmployeeTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const url = `${API_URL}/api/employee-types`;

      console.log("API URL =", url);
      console.log("TOKEN =", token);

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("FULL RESPONSE =", res);
      console.log("RESPONSE DATA =", res.data);

      // IMPORTANT
      let finalData = [];

      if (Array.isArray(res.data)) {
        finalData = res.data;
      } else if (Array.isArray(res.data.data)) {
        finalData = res.data.data;
      } else if (Array.isArray(res.data.employeeTypes)) {
        finalData = res.data.employeeTypes;
      }

      console.log("FINAL DATA =", finalData);

      setEmployeeTypes(finalData);
    } catch (error) {
      console.error("EMPLOYEE TYPES ERROR =", error);

      if (error.response) {
        console.log("ERROR RESPONSE =", error.response.data);
      }

      setEmployeeTypes([]);
    }
  };
  const fetchClientOtherInfo = async (clientId, siteId) => {
    try {
      const token = localStorage.getItem("token");

      const url = `${API_URL}/api/client-other-info/${clientId}/${siteId}`;

      console.log("=================================");
      console.log("FETCH CLIENT OTHER INFO API");
      console.log("URL =", url);
      console.log("CLIENT ID =", clientId);
      console.log("SITE ID =", siteId);
      console.log("TOKEN =", token);
      console.log("=================================");

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("=================================");
      console.log("SUCCESS RESPONSE");
      console.log("STATUS =", res.status);
      console.log("FULL RESPONSE =", res);
      console.log("DATA =", res.data);
      console.log("=================================");

      return res.data;
    } catch (error) {
      console.log("=================================");
      console.log("API ERROR");

      // FULL ERROR
      console.log("ERROR =", error);

      // AXIOS RESPONSE
      if (error.response) {
        console.log("ERROR STATUS =", error.response.status);

        console.log("ERROR RESPONSE DATA =", error.response.data);
      }

      // REQUEST ERROR
      if (error.request) {
        console.log("ERROR REQUEST =", error.request);
      }

      console.log("=================================");

      return null;
    }
  };

  useEffect(() => {
    const loadClientOtherInfo = async () => {
      try {
        const clientId =
          siteData?.client_id || siteData?.clientId || siteData?.id;

        const siteId = siteData?.site_id || siteData?.siteId;

        if (!clientId || !siteId) {
          return;
        }

        const data = await fetchClientOtherInfo(clientId, siteId);

        console.log("CLIENT OTHER INFO =", data);

        // =========================
        // SITE DETAILS
        // =========================

        if (data?.siteDetails) {
          setSiteDetails(data.siteDetails);
        }

        // =========================
        // RATES
        // =========================

        if (Array.isArray(data?.data)) {
          const mappedRates = data.data.map((r) => ({
            rate_id: r.rate_id || 0,
            client_id: r.client_id || clientId,

            empType: r.emp_type || "",
            hours: r.emp_hours || "",

            nos: r.emp_nos || "",

            basic: r.emp_basic || "",
            hra: r.hra || "",

            da: r.emp_da || "",

            specialAllowance: r.special_allow || "",
            otherAllowance: r.other_allow || "",

            lww: r.lww || "",
            bonus: r.bonus || "",

            costPerHeadGross: r.emp_cost_per_head || "",

            serviceChargesType: r.service_charges_type || "",
            serviceCharges: r.service_charges || "",

            perDayRate: r.emp_perday_rate || "",

            otRate: r.ot_rate || "",

            leaveWages: r.fixed_leave_wages || "",

            uniformWashing: r.fixed_uniform_wages || "",

            anyOther: r.any_other || "",
          }));

          console.log("MAPPED RATES =", mappedRates);

          setRateRows(mappedRates);
        }
        // =========================
        // OTHER DETAILS
        // =========================

        if (Array.isArray(data?.otherDetails)) {
          setOtherDetails(data.otherDetails);
        }
      } catch (error) {
        console.log("LOAD CLIENT INFO ERROR =", error);
      }
    };

    loadClientOtherInfo();
  }, [siteData]);

  console.log("SITE DATA =", siteData);
  console.log("RATES =", siteData?.rates);

  useEffect(() => {
    if (!siteData) return;

    // =========================
    // SITE DETAILS
    // =========================
    setSiteDetails(siteData || {});

    // =========================
    // RATES TABLE
    // =========================
    setRateRows(
      Array.isArray(siteData?.rates)
        ? siteData.rates.map((r) => ({
            rate_id: r.rate_id || r.site_id || siteData.site_id || 0,

            client_id: r.client_id || siteData.client_id || 0,

            empType: r.emp_type || "",

            hours: r.hours || "",

            nos: r.emp_nos || "",

            basic: r.basic || "",

            hra: r.hra || "",

            da: r.da || "",

            specialAllowance: r.special_allowance || "",

            otherAllowance: r.other_allowance || "",

            lww: r.lww || "",

            bonus: r.bonus || "",

            costPerHeadGross: r.emp_cost_per_head || "",

            serviceChargesType: r.service_charges_type || "",

            serviceCharges: r.service_charges || "",

            perDayRate: r.emp_perday_rate || "",

            otRate: r.ot_rate || "",

            leaveWages: r.leave_wages || "",

            uniformWashing: r.uniform_washing || "",

            anyOther: r.any_other || "",
          }))
        : [
            {
              rate_id: 0,
              client_id: siteData?.client_id || 0,
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
          ],
    );

    // =========================
    // OTHER CHARGES TABLE
    // =========================
    setOtherDetails(
      Array.isArray(siteData?.otherDetails)
        ? siteData.otherDetails.map((r) => ({
            type_of_services: r.type_of_services || "",
            chargesType: r.chargesType || "",
            charges: r.charges || "",
            calcOn: r.calcOn || "",
            calcOperation: r.calcOperation || "",
            amountToCompare: r.amountToCompare || "",
          }))
        : [
            // fallback empty row
            {
              type_of_services: "",
              chargesType: "",
              charges: "",
              calcOn: "",
              calcOperation: "",
              amountToCompare: "",
            },
          ],
    );
  }, [siteData]);

  const handleSiteDetailChange = (e) => {
    const { name, value, type, checked } = e.target;
    const key = name;
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
    setSiteDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRateRowChange = (index, field, value) => {
    setRateRows((prevRows) => {
      const updated = [...prevRows];
      const row = { ...updated[index], [field]: value };

      if (validationErrors?.rateRowErrors?.[index]?.[field]) {
        setValidationErrors((prev) => {
          const newRateRowErrors = [...(prev.rateRowErrors || [])];
          if (newRateRowErrors[index]) {
            newRateRowErrors[index][field] = "";
          }
          return { ...prev, rateRowErrors: newRateRowErrors };
        });
      }

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

  const handleOtherDetailChange = (index, field, value) => {
    const updated = [...otherDetails];

    updated[index] = {
      ...updated[index],
      [field]: value, // 🔥 THIS IS MOST IMPORTANT
    };

    setOtherDetails(updated);
  };

  // Add a new row
  const addOtherDetailRow = () => {
    setOtherDetails((prev) => [
      ...prev,
      {
        type_of_services: "",
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

  const getTableErrorMessages = (validationErrors) => {
    const messages = [];
    // console.log(validationErrors);
    // Rate rows
    if (validationErrors?.rateRowErrors?.length) {
      validationErrors.rateRowErrors.forEach((rowErr, i) => {
        if (rowErr) {
          Object.entries(rowErr).forEach(([field, msg]) => {
            if (msg) messages.push(`Rate Row ${i + 1}: ${msg}`);
          });
        }
      });
    }

    // Other details
    if (validationErrors?.otherDetailErrors?.length) {
      validationErrors.otherDetailErrors.forEach((rowErr, i) => {
        if (rowErr) {
          Object.entries(rowErr).forEach(([field, msg]) => {
            if (msg) messages.push(`Other Detail Row ${i + 1}: ${msg}`);
          });
        }
      });
    }
    // console.log(messages);
    return messages;
  };

  const validateStep3 = () => {
    const errors = {};
    const rateRowErrors = [];
    const otherDetailErrors = [];

    // --- SITE DETAILS VALIDATION ---
    if (!siteDetails.siteName?.trim()) {
      errors.siteName = "Site Name is required.";
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
  const saveOtherCharges = async (token, siteDetails, otherDetails) => {
    const payload = {
      client_id: siteDetails.clientId || siteDetails.client_id,

      // जर प्रत्येक row ला same site_id लागतो
      site_id: siteDetails.site_id || siteDetails.id,

      otherDetails: otherDetails.map((row) => ({
        id: row.id || 0,

        // 🔥 FIX: fallback to parent site_id
        site_id: Number(row.site_id || siteDetails.site_id || siteDetails.id),

        type_of_services: row.type_of_services || "",

        count_services: Number(row.charges) || 0,

        charges_services: Number(row.charges) || 0,

        totalcharges_services: Number(row.charges) || 0,

        newemp_type: row.chargesType || "",

        ea_calculateon: row.calcOn || "",

        ea_operator: row.calcOperation || "",

        ea_comp_operator: row.amountToCompare || "",

        source: "website",
      })),
    };

    console.log("FINAL PAYLOAD =>", payload);

    return await axios.post(`${API_URL}/api/client-service-charges`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const handleUpdateSite = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const payload = {
        client_id: siteDetails.clientId || siteDetails.id,

        siteDetails: { ...siteDetails },

        rates: rateRows.map((row) => ({
          rate_id: row.rate_id || 0,
          client_id: siteDetails.clientId || siteDetails.client_id || 0,

          emp_type: row.empType || "",
          hours: Number(row.hours) || 0,
          emp_nos: Number(row.nos) || 0,

          basic: Number(row.basic) || 0,
          hra: Number(row.hra) || 0,
          da: Number(row.da) || 0,

          special_allowance: Number(row.specialAllowance) || 0,
          other_allowance: Number(row.otherAllowance) || 0,
          lww: Number(row.lww) || 0,
          bonus: Number(row.bonus) || 0,

          emp_cost_per_head: Number(row.costPerHeadGross) || 0,
          emp_total_cost:
            (Number(row.costPerHeadGross) || 0) * (Number(row.nos) || 0),

          service_charges_type: row.serviceChargesType || "",
          service_charges: Number(row.serviceCharges) || 0,

          emp_perday_rate: Number(row.perDayRate) || 0,
          ot_rate: Number(row.otRate) || 0,
          leave_wages: Number(row.leaveWages) || 0,
          uniform_washing: Number(row.uniformWashing) || 0,
          any_other: Number(row.anyOther) || 0,
        })),
      };

      // =========================
      // MAIN UPDATE CALL
      // =========================
      const res = await axios.post(
        `${API_URL}/api/client-other-info/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // =========================
      // 🔥 OTHER CHARGES SAVE (JOIN DONE HERE)
      // =========================
      await saveOtherCharges(token, siteDetails, otherDetails);

      alert("Updated Successfully ✅");

      if (updateSite) updateSite(payload);
    } catch (error) {
      console.log("UPDATE ERROR =", error.response?.data || error);
      alert("Update Failed ❌");
    }
  };

  const renderRateRows = () =>
    (rateRows || []).map((row, idx) => (
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
              <option key={emp._id || emp.id} value={emp.name}>
                {emp.name}
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
            value={row.basic ?? ""}
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

  const hasValidationErrors = (errors) => {
    if (!errors || typeof errors !== "object") return false;

    // 🔹 Check field-level errors
    const fieldErrorsExist = Object.entries(errors)
      .filter(([key]) => key !== "rateRowErrors" && key !== "otherDetailErrors")
      .some(([_, msg]) => msg && msg.toString().trim() !== "");

    // 🔹 Check rate row errors
    const rateErrorsExist = Array.isArray(errors.rateRowErrors)
      ? errors.rateRowErrors.some(
          (row) =>
            row &&
            Object.values(row).some(
              (val) => val && val.toString().trim() !== "",
            ),
        )
      : false;

    // 🔹 Check other details errors
    const otherErrorsExist = Array.isArray(errors.otherDetailErrors)
      ? errors.otherDetailErrors.some(
          (row) =>
            row &&
            Object.values(row).some(
              (val) => val && val.toString().trim() !== "",
            ),
        )
      : false;

    return fieldErrorsExist || rateErrorsExist || otherErrorsExist;
  };

  return (
    <div>
      <Card className="card form-panel">
        <div>
          <h2 className="form-title card-header mb-4">
            Edit Client Site & Rate - {siteDetails.siteName}
          </h2>
          {hasValidationErrors(validationErrors) && (
            <Alert variant="danger" className="mt-3">
              <Alert.Heading>
                Please fix the validation errors below:
              </Alert.Heading>
              <ul className="mb-0">
                {getTableErrorMessages(validationErrors).map((msg, idx) => (
                  <li key={`table-${idx}`}>{msg}</li>
                ))}
              </ul>
            </Alert>
          )}
          <Row>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="siteName">
                <Form.Label>Site Name *</Form.Label>
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="contactNo">
                <Form.Label>Contact No</Form.Label>
                <Form.Control
                  name="contactNo"
                  value={siteDetails.contactNo || ""}
                  onChange={handleSiteDetailChange}
                  placeholder="Contact No"
                  isInvalid={!!validationErrors.contactNo}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.contactNo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="city">
                <Form.Label>City</Form.Label>
                <Form.Control
                  name="city"
                  value={siteDetails.city || ""}
                  onChange={handleSiteDetailChange}
                  placeholder="City"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="state">
                <Form.Label>State</Form.Label>
                <Form.Control
                  name="state"
                  value={siteDetails.state || ""}
                  onChange={handleSiteDetailChange}
                  placeholder="State"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="locationName">
                <Form.Label>Location Name</Form.Label>
                <Form.Control
                  name="locationName"
                  value={siteDetails.locationName || ""}
                  onChange={handleSiteDetailChange}
                  placeholder="Location Name"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="officeLatitude">
                <Form.Label>Latitude</Form.Label>

                <Form.Control
                  type="text"
                  name="officeLatitude"
                  value={siteDetails.officeLatitude || ""}
                  onChange={handleSiteDetailChange}
                  placeholder="Enter Latitude"
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="officeLongitude">
                <Form.Label>Longitude</Form.Label>

                <Form.Control
                  type="text"
                  name="officeLongitude"
                  value={siteDetails.officeLongitude || ""}
                  onChange={handleSiteDetailChange}
                  placeholder="Enter Longitude"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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
            <Col xs={12} sm={6} md={4} className="mb-3">
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

          {/* ========================= CHARGES BY RANK ========================= */}

          <div className="rates-section mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-subtitle m-0">Charges By Rank</h5>

              <Button
                variant="success"
                size="sm"
                type="button"
                onClick={addRateRow}
              >
                + Add Column
              </Button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <Table responsive bordered hover>
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
                    <th>Gross</th>
                    <th>Service Type</th>
                    <th>Service Charges</th>
                    <th>Per Day Rate</th>
                    <th>OT Rate</th>
                    <th>Leave Wages</th>
                    <th>Uniform Washing</th>
                    <th>Any Other</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {(rateRows || []).map((row, idx) => (
                    <tr key={idx}>
                      {/* EMP TYPE */}
                      <td>
                        <Form.Select
                          style={{ minWidth: "170px" }}
                          value={row.empType ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "empType", e.target.value)
                          }
                        >
                          <option value="">Select</option>

                          {employeeTypes.map((emp, index) => (
                            <option
                              key={emp._id || emp.id || index}
                              value={emp.emp_type}
                            >
                              {emp.emp_type}
                            </option>
                          ))}
                        </Form.Select>
                      </td>

                      {/* HOURS */}
                      <td>
                        <Form.Select
                          style={{ minWidth: "100px" }}
                          value={row.hours ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "hours", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="12">12</option>
                        </Form.Select>
                      </td>

                      {/* NOS */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "90px" }}
                          value={row.nos ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "nos", e.target.value)
                          }
                        />
                      </td>

                      {/* BASIC */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "120px" }}
                          value={row.basic ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "basic", e.target.value)
                          }
                        />
                      </td>

                      {/* HRA */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "120px" }}
                          value={row.hra ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "hra", e.target.value)
                          }
                        />
                      </td>

                      {/* DA */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "120px" }}
                          value={row.da ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "da", e.target.value)
                          }
                        />
                      </td>

                      {/* SPECIAL */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "150px" }}
                          value={row.specialAllowance ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(
                              idx,
                              "specialAllowance",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* OTHER */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "150px" }}
                          value={row.otherAllowance ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(
                              idx,
                              "otherAllowance",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* LWW */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "120px" }}
                          value={row.lww ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "lww", e.target.value)
                          }
                        />
                      </td>

                      {/* BONUS */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "120px" }}
                          value={row.bonus ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "bonus", e.target.value)
                          }
                        />
                      </td>

                      {/* GROSS */}
                      <td>
                        <Form.Control
                          type="number"
                          style={{ minWidth: "140px" }}
                          value={row.costPerHeadGross ?? ""}
                          readOnly
                        />
                      </td>

                      {/* SERVICE TYPE */}
                      <td>
                        <Form.Select
                          style={{ minWidth: "120px" }}
                          value={row.serviceChargesType ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(
                              idx,
                              "serviceChargesType",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="%">%</option>
                          <option value="Rs">Rs</option>
                        </Form.Select>
                      </td>

                      {/* SERVICE CHARGES */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "130px" }}
                          value={row.serviceCharges ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(
                              idx,
                              "serviceCharges",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* PER DAY */}
                      <td>
                        <Form.Control
                          type="number"
                          style={{ minWidth: "130px" }}
                          value={row.perDayRate ?? ""}
                          readOnly
                        />
                      </td>

                      {/* OT */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "120px" }}
                          value={row.otRate ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "otRate", e.target.value)
                          }
                        />
                      </td>

                      {/* LEAVE */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "130px" }}
                          value={row.leaveWages ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(
                              idx,
                              "leaveWages",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* UNIFORM */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "140px" }}
                          value={row.uniformWashing ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(
                              idx,
                              "uniformWashing",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* ANY OTHER */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "130px" }}
                          value={row.anyOther ?? ""}
                          onChange={(e) =>
                            handleRateRowChange(idx, "anyOther", e.target.value)
                          }
                        />
                      </td>

                      {/* ACTION */}
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            type="button"
                            onClick={addRateRow}
                          >
                            +
                          </Button>

                          {rateRows.length > 1 && (
                            <Button
                              variant="danger"
                              size="sm"
                              type="button"
                              onClick={() => deleteRateRow(idx)}
                            >
                              -
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          {/* ========================= OTHER CHARGES ========================= */}

          <div className="other-charges-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-subtitle m-0">Other Charges</h5>

              <Button
                variant="success"
                size="sm"
                type="button"
                onClick={addOtherDetailRow}
              >
                + Add Column
              </Button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <Table bordered hover responsive>
                <thead className="table-secondary">
                  <tr>
                    <th>Service</th>
                    <th>Type</th>
                    <th>Charges</th>
                    <th>Calc On</th>
                    <th>Operation</th>
                    <th>Compare</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {(otherDetails || []).map((row, idx) => (
                    <tr key={idx}>
                      {/* SERVICE */}
                      <td>
                        <Form.Select
                          style={{ minWidth: "180px" }}
                          value={row.type_of_services ?? ""}
                          onChange={(e) =>
                            handleOtherDetailChange(
                              idx,
                              "type_of_services",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select</option>

                          {chargeTypes.map((t, index) => (
                            <option
                              key={t.id || t._id || index}
                              value={t.id} // 🔥 FIX HERE
                            >
                              {t.charges_master || t.name}
                            </option>
                          ))}
                        </Form.Select>
                      </td>

                      {/* TYPE */}
                      <td>
                        <Form.Select
                          style={{ minWidth: "120px" }}
                          value={row.chargesType ?? ""}
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

                      {/* CHARGES */}
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          style={{ minWidth: "120px" }}
                          value={row.charges ?? ""}
                          onChange={(e) =>
                            handleOtherDetailChange(
                              idx,
                              "charges",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* CALC ON */}
                      <td>
                        <Form.Select
                          style={{ minWidth: "180px" }}
                          value={row.calcOn ?? ""}
                          onChange={(e) =>
                            handleOtherDetailChange(
                              idx,
                              "calcOn",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="Gross">On Gross Salary</option>
                          <option value="BASIC">BASIC</option>
                          <option value="HRA">HRA</option>
                          <option value="PF Wages">PF Wages</option>
                        </Form.Select>
                      </td>

                      {/* OPERATION */}
                      <td>
                        <Form.Select
                          style={{ minWidth: "150px" }}
                          value={row.calcOperation ?? ""}
                          onChange={(e) =>
                            handleOtherDetailChange(
                              idx,
                              "calcOperation",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="equal">Equal</option>
                          <option value="greater">Greater</option>
                          <option value="less">Less</option>
                          <option value="between">Between</option>
                        </Form.Select>
                      </td>

                      {/* COMPARE */}
                      <td>
                        <Form.Control
                          type="text"
                          style={{ minWidth: "170px" }}
                          value={row.amountToCompare ?? ""}
                          onChange={(e) =>
                            handleOtherDetailChange(
                              idx,
                              "amountToCompare",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* ACTION */}
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            type="button"
                            onClick={addOtherDetailRow}
                          >
                            +
                          </Button>

                          {otherDetails.length > 1 && (
                            <Button
                              variant="danger"
                              size="sm"
                              type="button"
                              onClick={() => deleteOtherDetailRow(idx)}
                            >
                              -
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="form-actions d-flex justify-content-end align-items-center">
            <Button
              variant="secondary"
              type="button"
              className="me-2"
              onClick={onBackSite}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              className="me-2"
              onClick={handleUpdateSite}
            >
              Update
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditSiteRate;
