import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import Select from "react-select";
import axios from "axios";
import { useEffect, useState } from "react";

const OtherChargesTable = () => {
  const { control, register } = useFormContext();
  const [chargesMaster, setChargesMaster] = useState([]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "otherCharges",
  });

  // Helper to format options for react-select
  const options = (list) => list.map((item) => ({ value: item, label: item }));

  useEffect(() => {
    const fetchChargesMaster = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/charges/charges-master`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (response.data?.success) {
          setChargesMaster(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch charges master:", error);
      }
    };

    fetchChargesMaster();
  }, []);

  const serviceOptions = chargesMaster.map((item) => ({
    label: item.label_display,
    value: item.charges_master,
  }));

  // const serviceOptions = options([
  //   "BONUS",
  //   "CMP ESIC",
  //   "CMP PF",
  //   "EMP ESIC",
  //   "EMP PF",
  //   "OT",
  //   "P.F.",
  //   "P.T.",
  // ]);
  const calcOptions = options([
    "Select",
    "On Gross Salary",
    "On calculated salary by days",
    "BASIC",
    "HRA",
    "OT DAYS",
    "AT ACTUAL",
    "PF Wages",
    "ESIC Wages",
    "Amount to compare",
    "GROSS-OTHER+OT AMT",
    "GROSS-HRA",
    "GROSS-HRA-BONUS",
    "BASIC+SPECIAL ALLOW",
    "GROSS-OTHER ALLOW",
    "BASIC+DA",
    "BASIC+DA+HRA",
    "BASIC+DA+BONUS",
    "BASIC+HRA",
    "BASIC+DA+SPECIAL ALLOW+OTHER ALLOW",
    "GROSS/8 hours",
    "GROSS/9 hours",
    "GROSS/12 hours",
  ]); // Add others as needed

  // 1. Add this list to your component
  const conditionOptions = options([
    "equal to",
    "greater than",
    "greater than or equal to",
    "less than",
    "less than or equal to",
    "between",
    "Divide by present days",
    "Multiply by present days",
    "Divide by month days",
    "Multiply by month days",
    "Divide by night days",
    "Multiply by night days",
    "Divide by month day present",
    "Multiply by month day present",
  ]);

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center mb-2"
        style={{ width: "100%", marginTop: "20px" }}
      >
        <h6> Other Charges</h6>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            append({
              serviceType: "",
              chargesType: "",
              charges: "",
              calculateOn: "",
              condition: "",
              amountRange: "",
            })
          }
        >
          + Add New Row
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Action</th>
              <th style={{ width: "200px" }}>Type of services</th>
              <th style={{ width: "200px" }}>Charges Type</th>
              <th style={{ width: "200px" }}>Charges</th>
              <th style={{ width: "200px" }}>Calculate On</th>
              <th style={{ width: "200px" }}>Select</th>
              <th style={{ width: "200px" }}>
                Amount to compare
                <br /> <small>(enter two values with '-')</small>
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id}>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(index)}
                  >
                    -
                  </button>
                </td>
                {/* Searchable Service Type */}
                <td>
                  <Controller
                    name={`otherCharges.${index}.serviceType`}
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        inputRef={ref}
                        value={
                          serviceOptions.find(
                            (c) =>
                              c.value?.toUpperCase() === value?.toUpperCase(),
                          ) || null
                        }
                        onChange={(val) => onChange(val?.value)}
                        options={serviceOptions}
                        isClearable
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
                  <select
                    {...register(`otherCharges.${index}.chargesType`)}
                    className="form-control"
                  >
                    <option value="Rs">Rs</option>
                    <option value="%">%</option>
                  </select>
                </td>
                <td>
                  <input
                    {...register(`otherCharges.${index}.charges`)}
                    className="form-control"
                  />
                </td>
                {/* Searchable Calculate On */}
                <td>
                  <Controller
                    name={`otherCharges.${index}.calculateOn`}
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        inputRef={ref}
                        value={
                          calcOptions.find(
                            (c) =>
                              c.value?.toUpperCase() === value?.toUpperCase(),
                          ) || null
                        }
                        onChange={(val) => onChange(val?.value)}
                        options={calcOptions}
                        isClearable
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
                  <Controller
                    name={`otherCharges.${index}.condition`}
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        inputRef={ref}
                        value={
                          conditionOptions.find(
                            (c) =>
                              c.value?.toUpperCase() === value?.toUpperCase(),
                          ) || null
                        }
                        onChange={(val) => onChange(val?.value)}
                        options={conditionOptions}
                        isClearable
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
                    {...register(`otherCharges.${index}.amountRange`)}
                    className="form-control"
                    placeholder="e.g. 7000-10000"
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

export default OtherChargesTable;
