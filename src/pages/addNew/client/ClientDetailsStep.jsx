import Select from "react-select";
import AsyncSelect from "react-select/async";
import { useFormContext, Controller } from "react-hook-form";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";

import ClientTable from "./ClientTable";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const COMPANIES_API_URL = `${API_URL}/api/companies/allotted`;
const BRANCHES_API_URL = `${API_URL}/api/branches`;

const ClientDetailsStep = ({ nextStep, clientId }) => {
  const otherInfoEditor = useRef(null);
  const termsEditor = useRef(null);
  const navigate = useNavigate();
const [pincodeInput, setPincodeInput] = useState("");
const [selectedPincodeOption, setSelectedPincodeOption] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [billingCompanyBanks, setBillingCompanyBanks] = useState([]);
  const [billingBranches, setBillingBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    watch,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useFormContext();

  const config = {
    readonly: false,
    height: 200,
    placeholder: "Enter Terms & Conditions...",
    zIndex: 0,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "align",
      "undo",
      "redo",
    ],
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==============================
  // FETCH COMPANIES
  // ==============================
  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get(
        COMPANIES_API_URL,
        getAuthHeaders()
      );

      const list = data.data || data || [];
      setCompanies(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      console.error("Failed to fetch companies:", err);
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.id,
        label:
          company.company_name ||
          company.name ||
          company.companyName ||
          `Company ${company.id}`,
      })),
    [companies]
  );

  // Auto-select company if the user has only one allotted company.
  useEffect(() => {
    if (companies.length !== 1 || clientId || watch("billingCompany")) {
      return;
    }

    const company = companies[0];

    setValue("billingCompany", String(company.id));
    setValue(
      "billingCompanyName",
      company.company_name || company.name || company.companyName || ""
    );
  }, [companies, clientId, setValue]);

  // ==============================
  // FETCH COMPANY BANKS
  // ==============================
  const getCompanyBanks = async (companyId) => {
    if (!companyId) {
      setBillingCompanyBanks([]);
      return;
    }

    try {
      setBankLoading(true);

      const res = await axios.get(
        `${API_URL}/api/clients/company-banks/${companyId}`,
        getAuthHeaders()
      );

      if (res.data.success) {
        setBillingCompanyBanks(res.data.data || []);
      } else {
        setBillingCompanyBanks([]);
      }
    } catch (err) {
      console.error("Failed to fetch company banks:", err);
      setBillingCompanyBanks([]);
    } finally {
      setBankLoading(false);
    }
  };

  const bankOptions = useMemo(
    () =>
      billingCompanyBanks.map((bank) => ({
        value: bank.id,
        label: bank.bank_name || bank.bankName || `Bank ${bank.id}`,
      })),
    [billingCompanyBanks]
  );

  // ==============================
  // FETCH COMPANY BRANCHES
  // ==============================
const getCompanyBranches = async (companyId) => {
  try {
    setBranchLoading(true);

    const res = await axios.get(
      `${BRANCHES_API_URL}/by-company/${companyId}`,
      { headers: getAuthHeaders() }
    );

    console.log("Branch API response:", res.data);

    const branches = Array.isArray(res.data)
      ? res.data
      : res.data?.data || [];

    console.log("Branches:", branches);

    setBillingBranches(branches);
  } catch (error) {
    console.error(
      "Branch API error:",
      error.response?.data || error.message
    );
    setBillingBranches([]);
  } finally {
    setBranchLoading(false);
  }
};

  const branchOptions = useMemo(
    () =>
      billingBranches.map((branch) => ({
        value: branch.id,
        label:
          branch.branch_name ||
          branch.branchName ||
          branch.name ||
          `Branch ${branch.id}`,
      })),
    [billingBranches]
  );

  // ==============================
  // PINCODE SEARCH
  // ==============================
  const loadPincodes = async (inputValue) => {
    try {
      if (!inputValue || inputValue.length < 2) {
        return [];
      }

      const res = await axios.get(
        `${API_URL}/api/pincodes-dropdown/search?q=${encodeURIComponent(
          inputValue
        )}`,
        getAuthHeaders()
      );

      return (res.data || []).map((item) => ({
        value: item.pincode,
        label: `${item.pincode} - ${item.area_name}, ${item.city_name}`,
        city: item.city_name,
        state: item.state_name,
        area: item.area_name,
      }));
    } catch (err) {
      console.error("Failed to fetch pincodes:", err);
      return [];
    }
  };

  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "#ffffe0"
        : state.isSelected
          ? "#f0f0c0"
          : "#ffffe0",
      color: "black",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#ffffe0",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

 const selectedCompany = watch("billingCompany");
const selectedPincode = watch("pincode");

useEffect(() => {
  let active = true;

  const initializePincode = async () => {
    if (
      selectedPincode === undefined ||
      selectedPincode === null ||
      selectedPincode === ""
    ) {
      setSelectedPincodeOption(null);
      return;
    }

    const pin = String(selectedPincode);

    // जुना pincode लगेच दाखव
    setSelectedPincodeOption((current) => {
      if (current && String(current.value) === pin) {
        return current;
      }

      return {
        value: pin,
        label: pin,
      };
    });

    try {
      const options = await loadPincodes(pin);

      if (!active) return;

      const matched = options.find(
        (option) => String(option.value) === pin
      );

      if (matched) {
        setSelectedPincodeOption(matched);
      }
    } catch (error) {
      console.error("Pincode initialization failed:", error);
    }
  };

  initializePincode();

  return () => {
    active = false;
  };
}, [selectedPincode]);

console.log("Pincode:", watch("pincode"));

  // Load banks and branches when the selected company changes.
  useEffect(() => {
    if (!selectedCompany) {
      setBillingCompanyBanks([]);
      setBillingBranches([]);
      return;
    }

    getCompanyBanks(selectedCompany);
    getCompanyBranches(selectedCompany);
  }, [selectedCompany]);

  // Set city and state from the selected pincode.
  // The AsyncSelect below updates these fields directly.
  useEffect(() => {
    if (!selectedPincode) {
      return;
    }
  }, [selectedPincode]);

  // ==============================
  // NEXT STEP
  // ==============================
  const handleNext = async () => {
    const isValid = await trigger(["companyName", "clientcode"]);

    if (isValid) {
      nextStep();
      return;
    }

    const firstErrorField = document.querySelector(".is-invalid");

    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      firstErrorField.focus();
    }
  };

  // ==============================
  // UPDATE CLIENT
  // ==============================
  const handleUpdateClient = async () => {
    try {
      const isValid = await trigger();

      if (!isValid) {
        return;
      }

      const formData = watch();

      const payload = {
        companyName: formData.companyName,
        clientcode: formData.clientcode,
        contactNo: formData.contactNo,
        emailId: formData.emailId,
        contactPersonName: formData.contactPersonName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gstStateCode: formData.gstStateCode,
        gstNo: formData.gstNo,
        sacCode: formData.sacCode,
        otherInfo: formData.otherInfo,
        termsAndConditions: formData.termsAndConditions,
        billingCompany: formData.billingCompany,
        billingCompanyName: formData.billingCompanyName,
        billingBranch: formData.billingBranch,
        billingBranchName: formData.billingBranchName,
        companyBankName: formData.companyBankName,
        companyBankDisplayName: formData.companyBankDisplayName,
      };

      const res = await axios.put(
        `${API_URL}/api/clients/update-client-data/${clientId}`,
        payload,
        getAuthHeaders()
      );

      if (res.data.success) {
        alert("Client Updated Successfully");
      }
    } catch (err) {
      console.error("Failed to update client:", err);

      alert(
        err.response?.data?.message || "Failed to update client"
      );
    }
  };

  if (isSubmitted) {
    return <ClientTable />;
  }

  return (
    <div className="form-panel">
      <h2 className="form-title card-header">
        {clientId ? "Edit Client" : "Add New Client"}
      </h2>

      <div className="multi-step-form">
        <div className="form-content p-2">
          <div className="row">
            {/* Client Name */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">
                Client Name <span className="text-danger">*</span>
              </label>

              <input
                {...register("companyName", {
                  required: "Client Name is required",
                })}
                className={`form-control ${
                  errors.companyName ? "is-invalid" : ""
                }`}
                placeholder="Client Name"
              />

              {errors.companyName && (
                <div className="invalid-feedback">
                  {errors.companyName.message}
                </div>
              )}
            </div>

            {/* Client Code */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">
                Client Code <span className="text-danger">*</span>
              </label>

              <input
                {...register("clientcode", {
                  required: "Client Code is required",
                })}
                className={`form-control ${
                  errors.clientcode ? "is-invalid" : ""
                }`}
                placeholder="Client Code"
              />

              {errors.clientcode && (
                <div className="invalid-feedback">
                  {errors.clientcode.message}
                </div>
              )}
            </div>

            {/* Contact Number */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">Contact No</label>
              <input
                {...register("contactNo")}
                className="form-control"
                placeholder="Contact No"
                maxLength="10"
              />
            </div>

            {/* Email */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">Email ID</label>
              <input
                {...register("emailId")}
                className="form-control"
                type="email"
                placeholder="Email ID"
              />
            </div>

            {/* Contact Person */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">Contact Person Name</label>
              <input
                {...register("contactPersonName")}
                className="form-control"
                placeholder="Contact Person Name"
              />
            </div>

            {/* Address */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">Address</label>
              <textarea
                {...register("address")}
                className="form-control"
                placeholder="Address"
                rows="1"
              />
            </div>

            {/* Pincode */}

{/* Pincode */}
<div className="mb-3 col-md-3 col-sm-6 col-12">
  <label className="form-label">Pincode</label>

  <Controller
    name="pincode"
    control={control}
    render={({ field }) => (
      <AsyncSelect
        ref={field.ref}
        name={field.name}
        styles={customSelectStyles}
        cacheOptions
        defaultOptions
        isClearable
        isSearchable
        loadOptions={loadPincodes}
        menuPortalTarget={document.body}

        value={selectedPincodeOption}
        inputValue={pincodeInput}

        onInputChange={(input, meta) => {
          if (meta.action === "input-change") {
            setPincodeInput(input);
          }
          return input;
        }}

        onChange={(selected) => {
          setSelectedPincodeOption(selected);
          field.onChange(
            selected ? String(selected.value) : ""
          );

          setPincodeInput("");

          setValue("city", selected?.city || "");
          setValue("state", selected?.state || "");
        }}

        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => String(option.value)}

        placeholder="Search pincode..."
      />
    )}
  />
</div>

            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">City</label>
              <input
                {...register("city")}
                className="form-control"
                placeholder="City"
              />
            </div>

            {/* State */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">State</label>
              <input
                {...register("state")}
                className="form-control"
                placeholder="State"
              />
            </div>

            {/* GST State Code */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">GST State Code</label>
              <input
                {...register("gstStateCode")}
                className="form-control"
                placeholder="GST State Code"
              />
            </div>

            {/* GST Number */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">GST No</label>
              <input
                {...register("gstNo")}
                className="form-control"
                placeholder="GST No"
              />
            </div>

            {/* SAC Code */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">SAC Code</label>
              <input
                {...register("sacCode")}
                className="form-control"
                placeholder="SAC Code"
              />
            </div>

            {/* Billing Company */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">Billing Company</label>

              <Controller
                name="billingCompany"
                control={control}
                render={({ field }) => (
                  <Select
                    options={companyOptions}
                    placeholder="Select Billing Company"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    value={
                      companyOptions.find(
                        (option) =>
                          String(option.value) === String(field.value)
                      ) || null
                    }
                    onChange={(selected) => {
                      const companyId = selected?.value || "";

                      field.onChange(companyId);

                      setValue(
                        "billingCompanyName",
                        selected?.label || ""
                      );

                      // Reset dependent selections.
                      setValue("billingBranch", "");
                      setValue("billingBranchName", "");
                      setValue("companyBankName", "");
                      setValue("companyBankDisplayName", "");

                      setBillingBranches([]);
                      setBillingCompanyBanks([]);
                    }}
                  />
                )}
              />
            </div>

            {/* Billing Branch */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">Billing Branch</label>

              <Controller
                name="billingBranch"
                control={control}
                render={({ field }) => (
                  <Select
                    options={branchOptions}
                    placeholder={
                      !selectedCompany
                        ? "Select Billing Company First"
                        : branchLoading
                          ? "Loading branches..."
                          : "Select Billing Branch"
                    }
                    isDisabled={!selectedCompany || branchLoading}
                    isLoading={branchLoading}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    value={
                      branchOptions.find(
                        (option) =>
                          String(option.value) === String(field.value)
                      ) || null
                    }
                    onChange={(selected) => {
                      field.onChange(selected?.value || "");

                      setValue(
                        "billingBranchName",
                        selected?.label || ""
                      );
                    }}
                  />
                )}
              />
            </div>

            {/* Bank Detail */}
            <div className="mb-3 col-md-3 col-sm-6 col-12">
              <label className="form-label">
                Display Bank Detail On Invoice
              </label>

              <Controller
                name="companyBankName"
                control={control}
                render={({ field }) => (
                  <Select
                    options={bankOptions}
                    placeholder={
                      !selectedCompany
                        ? "Select Billing Company First"
                        : bankLoading
                          ? "Loading banks..."
                          : "Select Bank"
                    }
                    isDisabled={!selectedCompany || bankLoading}
                    isLoading={bankLoading}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    value={
                      bankOptions.find(
                        (option) =>
                          String(option.value) === String(field.value)
                      ) || null
                    }
                    onChange={(selected) => {
                      field.onChange(selected?.value || "");

                      setValue(
                        "companyBankDisplayName",
                        selected?.label || ""
                      );
                    }}
                  />
                )}
              />
            </div>
          </div>

          <div className="row">
            {/* Other Info */}
            <div className="mb-3 col-md-12">
              <label className="form-label">Other Info</label>

              <Controller
                name="otherInfo"
                control={control}
                render={({ field }) => (
                  <JoditEditor
                    ref={otherInfoEditor}
                    value={field.value || ""}
                    config={config}
                    onBlur={(newContent) => field.onChange(newContent)}
                  />
                )}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="mb-3 col-md-12">
              <label className="form-label">Terms And Conditions</label>

              <Controller
                name="termsAndConditions"
                control={control}
                render={({ field }) => (
                  <JoditEditor
                    ref={termsEditor}
                    value={field.value || ""}
                    config={config}
                    onBlur={(newContent) => field.onChange(newContent)}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions d-flex justify-content-end align-items-center mt-3">
        <button
          type="button"
          className="me-2 btn btn-secondary"
          onClick={() => {
            if (window.location.pathname.includes("/client/edit-site")) {
              navigate(-1);
            } else {
              navigate("/add-new/client");
            }
          }}
        >
          Cancel
        </button>

        {clientId && (
          <button
            type="button"
            className="me-2 btn btn-success"
            onClick={handleUpdateClient}
          >
            Update
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClientDetailsStep;