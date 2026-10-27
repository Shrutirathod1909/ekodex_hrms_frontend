import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import ChargesTable from "./ChargesTable";
import AsyncSelect from "react-select/async";
import { Controller } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OtherChargesTable from "./OtherChargesTable";
import LeaveConfigurationPage from "./LeaveConfigurationPage";
const API_URL = import.meta.env.VITE_API_URL;
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

const SiteDetailsStep = ({ previousStep, isEdit = false, siteId = null, onCancel }) => {
  const navigate = useNavigate();
    // const [leaveConfiguration, setLeaveConfiguration] =
    //     useState([]);
  const {
  register,
  watch,
  control,
  setValue,
  getValues,
  trigger,
  formState: { errors },
} = useFormContext();
const applyLeaveConfiguration = async (siteId, leaveConfiguration) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/employee-leaves/apply-site-leaves`,
      {
        site_id: Number(siteId),
        leaves: leaveConfiguration,
      },
      getAuthHeaders()
    );

    console.log(
      "========================================"
    );
    console.log(
      "LEAVE CONFIGURATION API RESPONSE:",
      res.data
    );
    console.log(
      "========================================"
    );

    if (!res.data?.success) {
      throw new Error(
        res.data?.message ||
          "Failed to apply leave configuration"
      );
    }

    return res.data;

  } catch (error) {
    console.error(
      "APPLY LEAVE CONFIGURATION ERROR:",
      error
    );

    throw error;
  }
};
const handleFinalSubmit = async () => {
  try {
    // ============================================
    // VALIDATE SITE REQUIRED FIELDS
    // ============================================
const valid = await trigger([
  "siteName",
  "latitude",
  "longitude",
  "attendanceUploadType",
  "cc_site_hours",
]);

    if (!valid) {
      const firstError =
        document.querySelector(".is-invalid");

      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        firstError.focus();
      }

      return;
    }

    // ============================================
    // GET FORM DATA
    // ============================================

    const formData = getValues();

console.log("========================================");
console.log("SITE FORM DATA:", formData);
console.log(
  "ATTENDANCE UPLOAD TYPE:",
  formData.attendanceUploadType
);
console.log("SITE HOURS:", formData.cc_site_hours);
console.log("TOTAL MANPOWER:", formData.cc_total_manpower);
console.log("========================================");

    // ============================================
    // CHECK APPLY LEAVE
    // ============================================

    if (formData.applyLeave) {
      // ==========================================
      // GET LEAVE CONFIGURATION
      // ==========================================

      const leaveConfiguration =
        formData.leaveConfiguration || [];

      console.log(
        "LEAVE CONFIGURATION:",
        leaveConfiguration
      );

      // ==========================================
      // AT LEAST ONE ROW REQUIRED
      // ==========================================

      if (leaveConfiguration.length === 0) {
        alert("Please add Leave Configuration.");
        return;
      }

      // ==========================================
      // VALIDATE LEAVE ROWS
      // ==========================================

      const invalidLeaveRow =
        leaveConfiguration.some((row) => {
          return (
            !row.financialYear ||
            !row.from_year ||
            !row.to_year ||
            !row.leaveType ||
            row.totalLeaves === "" ||
            row.totalLeaves === null ||
            row.totalLeaves === undefined
          );
        });

      if (invalidLeaveRow) {
        alert(
          "Please complete all Leave Configuration fields."
        );
        return;
      }

      // ==========================================
      // PREPARE LEAVE DATA
      // ==========================================

      const leaveRows = leaveConfiguration.map((row) => ({
        financialYear: row.financialYear,
        from_year: Number(row.from_year),
        to_year: Number(row.to_year),
        leaveType: row.leaveType,
        totalLeaves: Number(row.totalLeaves),
      }));

      console.log(
        "LEAVE API PAYLOAD:",
        {
          site_id: formData.site_id,
          leaves: leaveRows,
        }
      );

      // ==========================================
      // CALL LEAVE API
      // ==========================================

      try {
        const leaveResponse = await axios.post(
          `${API_URL}/api/employee-leaves/apply-site-leaves`,
          {
            site_id: formData.site_id,
            leaves: leaveRows,
          },
          getAuthHeaders()
        );

        console.log(
          "LEAVE API RESPONSE:",
          leaveResponse.data
        );

        if (!leaveResponse.data?.success) {
          alert(
            leaveResponse.data?.message ||
            "Failed to apply leave configuration."
          );

          return;
        }

        console.log(
          "Leave configuration applied successfully"
        );

      } catch (leaveError) {
        console.error(
          "LEAVE API ERROR:",
          leaveError
        );

        console.error(
          "LEAVE API RESPONSE:",
          leaveError.response?.data
        );

        alert(
          leaveError.response?.data?.message ||
          leaveError.message ||
          "Failed to apply leave configuration."
        );

        return;
      }
    }

    // ============================================
    // SITE VALIDATION SUCCESS
    // ============================================

    console.log(
      "SITE VALIDATION SUCCESS"
    );

    // ============================================
    // CONTINUE MAIN SITE SUBMIT
    // ============================================

    document
      .getElementById("clientFormSubmit")
      ?.click();

  } catch (error) {
    console.error(
      "FINAL SUBMIT ERROR:",
      error
    );

    alert(
      error?.message ||
      "Something went wrong while submitting."
    );
  }
};




  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (isEdit) {
      navigate(-1);
    } else {
      navigate("/add-new/client");
    }
  };

  const loadPincodes = async (inputValue) => {
    try {
      if (!inputValue || inputValue.length < 2) {
        return [];
      }

      const res = await axios.get(
        `${API_URL}/api/pincodes-dropdown/search?q=${inputValue}`,
        getAuthHeaders(),
      );

      return (res.data || []).map((item) => ({
        value: item.pincode,
        label: `${item.pincode} - ${item.area_name}, ${item.city_name}`,
        city: item.city_name,
        state: item.state_name,
        area: item.area_name,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Add these to your component state
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Generate a temporary URL for the preview
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#ffffe0" : (state.isSelected ? "#f0f0c0" : "#ffffe0"),
      color: "black",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#ffffe0",
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 })
  };

  return (
    <div
      className="form-panel"
      style={{
        fontSize: "13px",
      }}
    >
      <div className="card-header p-0">
        <h2 className="form-title card-header">
          {isEdit ? "Edit Site" : "Add New Client Site"}
        </h2>
      </div>

      <div className="card-body">
        <div className="row">
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">
              Site Name <span className="text-danger">*</span>
            </label>
            <input
              {...register("siteName", {
                required: "Site Name is required",
              })}
              className={`form-control ${errors.siteName ? "is-invalid" : ""}`}
              placeholder="Site Name"
            />

            {errors.siteName && (
              <div className="invalid-feedback">{errors.siteName.message}</div>
            )}
          </div>

          <div className="mb-3 col-md-3 col-sm-6 col-12">
           <div className="mb-3 col-md-3 col-sm-6 col-12">
  <label className="form-label">Site Id</label>

  <input
    {...register("site_id")}
    className="form-control"
    placeholder="Site Id"
  />
</div>

            {errors.site_id && (
              <div className="invalid-feedback">{errors.site_id.message}</div>
            )}
          </div>

          {/* Client Code */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">
              Client Code <span className="text-danger">*</span>
            </label>
            <input
              disabled
              {...register("clientcode", {
                required: "Client Code is required",
              })}
              className={`form-control ${errors.clientcode ? "is-invalid" : ""}`}
              placeholder="Client Code"
            />
            {errors.clientcode && (
              <div className="invalid-feedback">
                {errors.clientcode.message}
              </div>
            )}
          </div>

          {/* Work Order No */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Work Order No</label>
            <input
              {...register("workOrderNo")}
              type="text"
              className="form-control"
              placeholder="Work Order No"
            />
          </div>

          {/* Site Contact Person */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Site Contact Person</label>
            <input
              {...register("siteContactPerson")}
              type="text"
              className="form-control"
              placeholder="Site Contact Person"
            />
          </div>

          {/* Site Contact No */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Site Contact No</label>
            <input
              {...register("siteContactNo")}
              type="tel"
              className="form-control"
              placeholder="Site Contact No"
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
              }
            />
          </div>

          {/* Site Email ID */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Site Email ID</label>
            <input
              {...register("siteEmailId", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              type="email"
              className="form-control"
              placeholder="Site Email ID"
            />
            <small className="text-danger">{errors.siteEmailId?.message}</small>
          </div>

          {/* Address & Location */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Address</label>
            <textarea
              {...register("siteAddress")}
              className="form-control"
              rows="3"
              placeholder="Address"
            />
          </div>
          {/* Pincode */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Pincode</label>

            <Controller
              name="sitePincode" // Ensure this matches your form field name
              control={control}
              render={({ field }) => (
                <AsyncSelect
                  styles={customSelectStyles}
                  cacheOptions
                  defaultOptions
                  loadOptions={loadPincodes}
                  menuPortalTarget={document.body}
                  // Use the 'field' object provided by the render function
                  value={
                    field.value
                      ? {
                          value: field.value,
                          label: field.value,
                          // If your loadOptions returns objects with city/state,
                          // you should store the whole object in the form state
                        }
                      : null
                  }
                  onChange={(selected) => {
                    // Update the form field for pincode
                    field.onChange(selected?.value || "");

                    // Update other fields based on selection
                    setValue("siteCity", selected?.city || "");
                    setValue("siteState", selected?.state || "");
                    setValue("country", selected ? "India" : "");
                  }}
                />
              )}
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">City</label>
            <input
              {...register("siteCity")}
              className="form-control"
              placeholder="City"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">State</label>
            <input
              {...register("siteState")}
              className="form-control"
              placeholder="State"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Country</label>
            <input
              {...register("country")}
              className="form-control"
              placeholder="Country"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Site Zone Name</label>
            <input
              {...register("sitezonename")}
              className="form-control"
              placeholder="Site Zone Name"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Branch Name</label>
            <input
              {...register("cc_branch_name")}
              className="form-control"
              placeholder="Branch Name"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">
              Latitude <span className="text-danger">*</span>
            </label>

            <input
              {...register("latitude", {
                required: "Latitude is required",
              })}
              className={`form-control ${errors.latitude ? "is-invalid" : ""}`}
            />

            {errors.latitude && (
              <div className="invalid-feedback">{errors.latitude.message}</div>
            )}
          </div>

          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">
              Longitude <span className="text-danger">*</span>
            </label>

            <input
              {...register("longitude", {
                required: "Longitude is required",
              })}
              className={`form-control ${errors.longitude ? "is-invalid" : ""}`}
            />

            {errors.longitude && (
              <div className="invalid-feedback">{errors.longitude.message}</div>
            )}
          </div>

          {/* Billing & Sales Info */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Billing Address</label>
            <textarea
              {...register("billingAddress")}
              className="form-control"
              rows="3"
              placeholder="Billing Address"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Location Start Date</label>
            <input
              {...register("locationStartDate")}
              className="form-control"
              type="date"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Location End Date</label>
            <input
              {...register("locationEndDate")}
              className="form-control"
              type="date"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Sales Person Name</label>
            <input {...register("salesPersonName")} className="form-control" />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Sales Person Email ID</label>
            <input
              {...register("salesPersonEmailId")}
              className="form-control"
              type="email"
            />
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Sales Person Contact No</label>
            <input
              {...register("salesPersonContactNo", {
                pattern: {
                  value: /^\d{10}$/,
                  message: "Must be exactly 10 digits",
                },
                minLength: {
                  value: 10,
                  message: "Must be exactly 10 digits",
                },
                maxLength: {
                  value: 10,
                  message: "Must be exactly 10 digits",
                },
              })}
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
              }
              maxLength="10"
              className={`form-control ${errors.salesPersonContactNo ? "is-invalid" : ""}`}
            />
            {errors.salesPersonContactNo && (
              <small className="text-danger">{errors.salesPersonContactNo.message}</small>
            )}
          </div>

          {/* Selects & Tax */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Bill Cycle Date</label>
            <select {...register("billCycleDate")} className="form-select">
              <option value="">Select Bill Cycle Date</option>
              <option value="1">1st of Month</option>
              <option value="15">15th of Month</option>
            </select>
          </div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Status</label>
            <select {...register("status")} className="form-select">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          {/* CGST */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">CGST (%)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              {...register("cgst", {
                valueAsNumber: true,
                // Keep your schema validation as a fallback
                min: { value: 0, message: "Value cannot be negative" },
                max: { value: 100, message: "Value cannot exceed 100" },
              })}
              onChange={(e) => {
                let value = parseFloat(e.target.value);

                // 1. Force value to be within 0-100 range
                if (value > 100) e.target.value = 100;
                if (value < 0) e.target.value = 0;

                // 2. Trigger react-hook-form's internal change handler
                // (This ensures the form state is updated correctly)
              }}
            />
            <small className="text-danger">{errors.cgst?.message}</small>
          </div>

          {/* SGST */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">SGST (%)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              {...register("sgst", {
                valueAsNumber: true,
                // Keep your schema validation as a fallback
                min: { value: 0, message: "Value cannot be negative" },
                max: { value: 100, message: "Value cannot exceed 100" },
              })}
              onChange={(e) => {
                let value = parseFloat(e.target.value);

                // 1. Force value to be within 0-100 range
                if (value > 100) e.target.value = 100;
                if (value < 0) e.target.value = 0;

                // 2. Trigger react-hook-form's internal change handler
                // (This ensures the form state is updated correctly)
              }}
            />
            <small className="text-danger">{errors.sgst?.message}</small>
          </div>

          {/* IGST */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">IGST (%)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              {...register("igst", {
                valueAsNumber: true,
                // Keep your schema validation as a fallback
                min: { value: 0, message: "Value cannot be negative" },
                max: { value: 100, message: "Value cannot exceed 100" },
              })}
              onChange={(e) => {
                let value = parseFloat(e.target.value);

                // 1. Force value to be within 0-100 range
                if (value > 100) e.target.value = 100;
                if (value < 0) e.target.value = 0;

                // 2. Trigger react-hook-form's internal change handler
                // (This ensures the form state is updated correctly)
              }}
            />
            <small className="text-danger">{errors.igst?.message}</small>
          </div>

          {/* Expected Billing Amount */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Expected Billing Amount</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              {...register("expectedBillingAmount")}
            />
          </div>

          {/* Days for Billing */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Days for Billing</label>
            <input
              type="number"
              className="form-control"
              {...register("daysForBilling")}
            />
          </div>

          {/* PO Number */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">PO Number</label>
            <input
              type="text"
              className="form-control"
              {...register("ponumber")}
            />
          </div>
          {/* cc_site_hours */}
         
<div className="mb-3 col-md-3 col-sm-6 col-12">
  <label className="form-label">
    Site Hours <span className="text-danger">*</span>
  </label>

  <input
    type="number"
    min="0"
    max="100"
    step="any"
    className={`form-control ${
      errors.cc_site_hours ? "is-invalid" : ""
    }`}
    {...register("cc_site_hours", {
      required: "Site Hours is required",
      validate: (value) =>
        (value !== "" && value !== null && value !== undefined &&
          Number.isFinite(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 100) ||
        "Site Hours must be between 0 and 100",
    })}
  />

  {errors.cc_site_hours && (
    <div className="invalid-feedback">
      {errors.cc_site_hours.message}
    </div>
  )}
</div>

          {/* Total Man Power */}
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Total ManPower</label>
            <input
              type="number"
              className="form-control"
              onChange={(e) => {
                let value = parseFloat(e.target.value);

                // 1. Force value to be within 0-100 range
                if (value > 100) e.target.value = 100;
                if (value < 0) e.target.value = 0;

                // 2. Trigger react-hook-form's internal change handler
                // (This ensures the form state is updated correctly)
              }}
              {...register("cc_total_manpower")}
            />
          </div>

          {/* Attendance Upload Type */}
<div className="mb-3 col-md-3 col-sm-6 col-12">
  <label className="form-label">
    Attendance Upload Type <span className="text-danger">*</span>
  </label>

  <select
    {...register("attendanceUploadType", {
      required: "Attendance Upload Type is required",
    })}
    className={`form-select ${
      errors.attendanceUploadType ? "is-invalid" : ""
    }`}
  >
    <option value="">Select Attendance Type</option>
    <option value="P_A">P / A</option>
    <option value="HOURS">Hours</option>
  </select>

  {errors.attendanceUploadType && (
    <div className="invalid-feedback">
      {errors.attendanceUploadType.message}
    </div>
  )}
</div>
          <div className="mb-3 col-md-3 col-sm-6 col-12">
            <label className="form-label">Contract Attachment</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              {...register("c_attachement", {
                onChange: (e) => {
                  const file = e.target.files[0];
                  if (file) setFilePreview(URL.createObjectURL(file));
                },
              })}
            />
            {/* Preview Section */}
            {filePreview && (
              <div className="mt-2">
                {/* If it's an image, show it. Otherwise, show a generic link or icon */}
                <a href={filePreview} target="_blank" rel="noopener noreferrer">
                  <img
                    src={filePreview}
                    alt="Preview"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }} // Hide if not an image
                  />
                  <span className="ms-2">View Attachment</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Checkboxes */}
    <div className="mt-3 row">
  {[
    { name: "viewOTHours", label: "View OT Hours" },
    { name: "attachWagesSHeet", label: "Attach Wages Sheet" },
    { name: "roundOffAmount", label: "Round Off Amount" },
    { name: "billWithoutRank", label: "Bill Without Rank" },
    { name: "nonComplianceSite", label: "Apply salary template for salary generation" },
    { name: "applyLeave", label: "Apply Leave" },
  ].map((cb) => (
    <div
      key={cb.name}
      className="mb-2 col-md-3 col-sm-6 col-12"
    >
      <div className="form-check">
        <input
          {...register(cb.name)}
          type="checkbox"
          className="form-check-input"
          id={cb.name}
        />

        <label
          className="form-check-label"
          htmlFor={cb.name}
        >
          {cb.label}
        </label>
      </div>
    </div>
  ))}
</div>

        <hr />
{watch("applyLeave") && (
  <LeaveConfigurationPage />
)}
      <hr />
        <ChargesTable />
        <hr />
        <OtherChargesTable />
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-end align-items-center mt-3">
        <button
          type="button"
          className="me-2 btn btn-outline-secondary"
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          type="button"
          className="me-2 btn btn-secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleFinalSubmit}
        >
          {isEdit ? "Update" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default SiteDetailsStep;
