import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const SupplierForm = ({
  editId,
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  resetForm,
  setLogo,
  updateFormData,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const IMG_URL = import.meta.env.VITE_FRONTEND_FOLDER;
  const [pincodeOptions, setPincodeOptions] = useState([]);

  const [selectedPincode, setSelectedPincode] = useState(null);

  // ================= VALIDATION =================
  const handleInputChange = (e) => {
    let { name, value } = e.target;

    const textFields = [
      "supplier_name",
      "contact_person_name",
      "state",
      "city",
      "bank_name",
      "account_type",
    ];

    const numberFields = ["phone", "account_no", "micr_no", "pincode"];

    // TEXT ONLY
    if (textFields.includes(name)) {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    // NUMBER ONLY
    if (numberFields.includes(name)) {
      value = value.replace(/\D/g, "");
    }

    // PHONE LIMIT
    if (name === "phone") {
      value = value.slice(0, 10);
    }

    // PINCODE LIMIT
    if (name === "pincode") {
      value = value.slice(0, 6);
    }

    handleChange({
      target: { name, value },
    });
  };

  // ================= FETCH PINCODE =================
  const fetchPincode = async (input) => {
    if (!input || input.length < 2) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/pincodes-dropdown/search?q=${input}`,
      );

      const options = response.data.map((item) => ({
        value: String(item.pincode),
        label: `${item.pincode} - ${item.city_name}`,
        city: item.city_name,
        state: item.state_name,
      }));

      setPincodeOptions(options);
    } catch (err) {
      console.log("PINCODE ERROR:", err);
    }
  };

  // ================= SELECT PINCODE =================
  const handlePincodeSelect = (selected) => {
    console.log("SELECTED:", selected);

    setSelectedPincode(selected);

    updateFormData({
      pincode: selected?.value || "",
      city: selected?.city || "",
      state: selected?.state || "",
    });
  };

  // ================= EDIT MODE =================
  useEffect(() => {
    if (formData.pincode) {
      setSelectedPincode({
        value: String(formData.pincode),
        label: `${formData.pincode} - ${formData.city}`,
        city: formData.city,
        state: formData.state,
      });
    } else {
      setSelectedPincode(null);
    }
  }, [formData.pincode, formData.city, formData.state]);

  return (
    <div className="card shadow-lg border-0 rounded-3 bg-white">
      {/* HEADER */}
      <div className="card-header bg-white d-flex justify-content-between py-3 align-items-center border-bottom-0">
        <h4 className="mb-0 fw-bold text-dark">
          {editId
            ? "Update Supplier Parameters"
            : "Create New Supplier Profile"}
        </h4>

        <button
          type="button"
          className="btn btn-outline-secondary px-4 rounded-pill"
          onClick={resetForm}
        >
          Back
        </button>
      </div>

      <div className="card-body p-4 pt-2">
        <form onSubmit={handleSubmit}>
          {/* BASIC DETAILS */}
          <div className="p-3 border rounded-3 mb-4 bg-light">
            <h6 className="text-primary fw-bold mb-3">Basic Details</h6>

            <div className="row">
              {/* TEXT FIELDS */}
              {["supplier_name", "contact_person_name", "phone", "email"].map(
                (key) => (
                  <div className="col-md-3 mb-3" key={key}>
                    <label className="form-label fw-medium text-capitalize">
                      {key.replaceAll("_", " ")}
                      <span className="text-danger"> *</span>
                    </label>

                    <input
                      type={key === "email" ? "email" : "text"}
                      name={key}
                      className="form-control"
                      value={formData[key] || ""}
                      onChange={handleInputChange}
                      required
                    />

                    {/* PHONE VALIDATION */}
                    {key === "phone" &&
                      formData.phone?.length > 0 &&
                      formData.phone?.length < 10 && (
                        <small className="text-danger">
                          Phone must be 10 digits
                        </small>
                      )}
                  </div>
                ),
              )}

              {/* PINCODE */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-medium">
                  Pincode
                </label>

                <Select
                  options={pincodeOptions}
                  value={selectedPincode}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  onInputChange={(value, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      fetchPincode(value);
                    }
                  }}
                  onChange={handlePincodeSelect}
                  placeholder="Search Pincode"
                  isClearable
                />

                {/* NOT REQUIRED FOR REACT SELECT */}
                <input type="hidden" value={formData.pincode || ""} />
              </div>

              {/* STATE */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-medium">State</label>

                <input
                  type="text"
                  name="state"
                  className="form-control"
                  value={formData.state || ""}
                  readOnly
                />
              </div>

              {/* CITY */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-medium">City</label>

                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city || ""}
                  readOnly
                />
              </div>

              {/* LOGO */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-medium">
                  Supplier Logo
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files[0])}
                />

                {/* EXISTING IMAGE */}
                {formData.logo_url && (
                  <div className="mt-2">
                    <img
                      src={`${IMG_URL ?? ""}/api/${formData.logo_url}`}
                      alt="supplier-logo"
                      width="100"
                      height="100"
                      style={{
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}

                {/* HIDDEN OLD LOGO */}
                <input
                  type="hidden"
                  name="old_logo"
                  value={formData.logo_url || ""}
                />
              </div>

              {/* ADDRESS */}
              <div className="col-md-12">
                <label className="form-label fw-medium">
                  Address
                </label>

                <textarea
                  name="address"
                  className="form-control"
                  rows="2"
                  value={formData.address || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* BANK DETAILS */}
          <div className="p-3 border rounded-3 mb-4 bg-light">
            <h6 className="text-success fw-bold mb-3">Bank Details</h6>

            <div className="row">
              {[
                "bank_name",
                "account_no",
                "account_type",
                "ifsc_code",
                "swift_code",
                "micr_no",
              ].map((key) => (
                <div className="col-md-3 mb-3" key={key}>
                  <label className="form-label fw-medium text-capitalize">
                    {key.replaceAll("_", " ")}
                  </label>

                  <input
                    name={key}
                    className="form-control"
                    value={formData[key] || ""}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-success px-5 rounded-pill shadow-sm fw-medium"
          >
            {isSubmitting
              ? "Processing..."
              : editId
                ? "Update Supplier"
                : "Save Supplier"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
