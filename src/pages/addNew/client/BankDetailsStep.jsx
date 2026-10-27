import React from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const BankDetailsStep = ({ nextStep, previousStep, clientId }) => {
  const {
    register,
    formState: { errors },
    watch,
    s,
  } = useFormContext();
  const navigate = useNavigate();

  const handleCancel = async () => {
    console.log("cancel");
    navigate("/add-new/client");
  };

  const handleUpdateBankDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = watch();

      const payload = {
        bankName: formData.bankName,
        accountNo: formData.accountNo,
        ifscCode: formData.ifscCode,
        branch: formData.branch,
        bankCity: formData.bankCity,
        micrCode: formData.micrCode,
      };

      const res = await axios.put(
        `${API_URL}/api/clients/${clientId}/bank-details-update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        alert("Bank Details Updated Successfully");
      }
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to update bank details");
    }
  };

  return (
    <>
      <div
        style={{
          fontSize: "13px",
        }}
      >
        <div className="card-header p-0">
          <h2 className="form-title card-header">Bank Details</h2>
        </div>

        <div className="card-body">
          <div className="row">
            {/* Bank Name */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Bank Name"
                {...register("bankName")}
              />
              <small className="text-danger">{errors.bankName?.message}</small>
            </div>

            {/* Account Number */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Account Number</label>
              <input
                type="text" // Keep as text, but control the input
                className="form-control"
                placeholder="Account Number"
                onInput={(e) => {
                  // This removes any character that is not a number
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                {...register("accountNo", {
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Account number must contain only digits",
                  },
                })}
              />
              <small className="text-danger">{errors.accountNo?.message}</small>
            </div>

            {/* IFSC */}
            <div className="col-md-3 mb-3">
              <label className="form-label">IFSC Code</label>
              <input // You were missing this
                type="text"
                className="form-control"
                placeholder="IFSC Code"
                {...register("ifscCode", {
                  pattern: {
                    value: /^[A-Z]{4}0[A-Z0-9]{6}$/i,
                    message: "Invalid IFSC Code",
                  },
                })}
              />
              <small className="text-danger">{errors.ifscCode?.message}</small>
            </div>

            {/* Branch */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Branch</label>
              <input
                type="text"
                className="form-control"
                placeholder="Branch"
                {...register("branch")}
              />
            </div>

            {/* Bank City */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Bank City</label>
              <input
                type="text"
                className="form-control"
                placeholder="Bank City"
                {...register("bankCity")}
              />
            </div>

            {/* MICR */}
            <div className="col-md-3 mb-3">
              <label className="form-label">MICR Code</label>
              <input // You were missing this
                type="text"
                className="form-control"
                placeholder="MICR Code"
                {...register("micrCode", {
                  pattern: {
                    value: /^[0-9]{9}$/,
                    message: "MICR must be 9 digits",
                  },
                })}
              />
              <small className="text-danger">{errors.micrCode?.message}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className="btn btn-outline-secondary me-2"
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
        {clientId && (
          <button
            type="button"
            className="me-2 btn btn-success"
            onClick={handleUpdateBankDetails}
          >
            Update
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          Next
        </button>
      </div>
    </>
  );
};

export default BankDetailsStep;
