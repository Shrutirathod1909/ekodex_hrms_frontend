import React, { useState, useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const ChargesTable = () => {
  const { control, register, watch, setValue } = useFormContext();
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [chargeTypes, setChargeTypes] = useState([]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rates",
  });
  const rates = watch("rates");

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

  useEffect(() => {
  const fetchDropdownData = async () => {
    console.log("Attempting to fetch dropdown data...");

    try {
      // 1. Fetch Employee Types
      const empRes = await axios.get(
        `${API_URL}/api/employee-types`,
        getAuthHeaders(),
      );

      console.log("Employee Types Data:", empRes.data);

      setEmployeeTypes(
        Array.isArray(empRes.data?.data)
          ? empRes.data.data
          : []
      );

      // 2. Fetch Charge Types
      const chargeRes = await axios.get(
        `${API_URL}/api/charges?simple=true`,
        getAuthHeaders(),
      );

      console.log("Charge Types Data:", chargeRes.data);

      setChargeTypes(
        Array.isArray(chargeRes.data)
          ? chargeRes.data
          : []
      );

    } catch (err) {
      console.error("Error fetching data:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  fetchDropdownData();
}, []);

  const addRow = () => {
    append({
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
      gross: "",
      serviceChargeType: "",
      serviceCharge: "",
      perDayRate: "",
      otRate: "",
      leaveWages: "",
      uniformWashing: "",
      anyOther: "",
    });
  };

  // Add this inside the ChargesTable component
  useEffect(() => {
    if (fields.length === 0) {
      append({ empType: "", hours: "" /* ...all other fields... */ });
    }
  }, [fields, append]);

  // Auto-calculate Gross (Cost Per Head)
  useEffect(() => {
    if (rates && rates.length > 0) {
      rates.forEach((rate, index) => {
        const basic = parseFloat(rate.basic) || 0;
        const hra = parseFloat(rate.hra) || 0;
        const da = parseFloat(rate.da) || 0;
        const special = parseFloat(rate.specialAllowance) || 0;
        const other = parseFloat(rate.otherAllowance) || 0;
        const lww = parseFloat(rate.lww) || 0;
        const bonus = parseFloat(rate.bonus) || 0;

        const sum = basic + hra + da + special + other + lww + bonus;
        
        // Only set value if it has changed to prevent infinite loops
        if (parseFloat(rate.gross) !== sum) {
          setValue(`rates.${index}.gross`, sum);
        }
      });
    }
  }, [rates, setValue]);

  // Styles to keep the table columns spacious
  const tableStyles = { minWidth: "max-content", width: "100%" };
  const colStyle = { minWidth: "120px" };

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center mb-2"
        style={{ width: "100%", marginTop: "10px" }}
      >
        <h6>Charges By Rank</h6>
        <button
          type="button"
          className="btn btn-success btn-sm"
          onClick={addRow}
        >
          + Add Row
        </button>
      </div>
      <div
        className="table-responsive"
        style={{ overflowX: "auto", fontSize: "13px" }}
      >
        <table
        className="table table-bordered table-hover align-middle"
        style={tableStyles}
      >
        <thead className="table-secondary">
          <tr>
            <th style={{ width: "60px" }}>Remove</th> {/* Moved to start */}
            <th style={{ width: "200px" }}>Emp Type</th>
            <th style={{ width: "200px" }}>Hours</th>
            <th style={{ width: "200px" }}>Nos</th>
            <th style={{ width: "200px" }}>Basic</th>
            <th style={{ width: "200px" }}>HRA</th>
            <th style={{ width: "200px" }}>DA</th>
            <th style={{ width: "200px" }}>Special Allow.</th>
            <th style={{ width: "200px" }}>Other Allow.</th>
            <th style={{ width: "200px" }}>LWW</th>
            <th style={{ width: "200px" }}>Bonus</th>
            <th style={{ width: "200px" }}>Cost Per Head(Gross)</th>
            <th style={{ width: "250px" }}>Service Charges Type</th>
            <th style={{ width: "200px" }}>Service Charges</th>
            <th style={{ width: "200px" }}>Per Day Rate</th>
            <th style={{ width: "200px" }}>OT Rate</th>
            <th style={{ width: "200px" }}>Leave Wages</th>
            <th style={{ width: "200px" }}>Uniform Washing</th>
            <th style={{ width: "200px" }}>
              Any Other
              <br />
              <small>(Rate/Month Days*N.D.)</small>
            </th>
          </tr>
        </thead>

        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id}>
              {/* Delete Button Column - Only for index > 0 */}
              <td className="text-center">
                {index > 0 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(index)}
                  >
                    -
                  </button>
                )}
              </td>

              {/* Employee Type */}
              <td>
                <Controller
                  name={`rates.${index}.empType`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={employeeTypes.map((t) => ({
                        label: t.emp_type,
                        value: t.emp_type,
                      }))}
                      value={value ? { label: value, value: value } : null}
                      onChange={(val) => onChange(val?.value)}
                      isSearchable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      menuPlacement="auto"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  )}
                />
              </td>

              {/* ... Rest of your input fields remain the same ... */}
              <td>
                <select
                  className="form-select"
                  {...register(`rates.${index}.hours`)}
                >
                  <option value="">Select</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.nos`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.basic`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.hra`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.da`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.specialAllowance`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.otherAllowance`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.lww`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.bonus`)}
                />
              </td>
              <td>
                  <input
                    type="hidden"
                    {...register(`rates.${index}.gross`)}
                  />
                  <input
                    type="number"
                    className="form-control"
                    style={{ backgroundColor: "#f8f9fa" }}
                    readOnly
                    value={
                      (parseFloat(rates?.[index]?.basic || 0)) +
                      (parseFloat(rates?.[index]?.hra || 0)) +
                      (parseFloat(rates?.[index]?.da || 0)) +
                      (parseFloat(rates?.[index]?.specialAllowance || 0)) +
                      (parseFloat(rates?.[index]?.otherAllowance || 0)) +
                      (parseFloat(rates?.[index]?.lww || 0)) +
                      (parseFloat(rates?.[index]?.bonus || 0))
                    }
                  />
              </td>

              <td>
                <Controller
                  name={`rates.${index}.serviceChargeType`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={[
                        { label: "Rs", value: "Rs" },
                        { label: "%", value: "%" },
                      ]}
                      value={
                        value
                          ? { label: value, value: value }
                          : null
                      }
                      onChange={(val) => onChange(val?.value)}
                      isSearchable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      menuPlacement="auto"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  )}
                />
              </td>

              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.serviceCharge`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.perDayRate`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.otRate`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.leaveWages`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.uniformWashing`)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  {...register(`rates.${index}.anyOther`)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
};

export default ChargesTable;
