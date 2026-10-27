import React, { useEffect, useState } from "react";
import {
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import axios from "axios";

const LeaveConfigurationPage = () => {

  // =====================================================
  // CURRENT YEAR
  // =====================================================

  const currentYear = new Date().getFullYear();

  const financialYears = Array.from(
    { length: 4 },
    (_, i) => {

      const startYear =
        currentYear + i;

      return {
        label:
          `${startYear}-${String(
            startYear + 1
          ).slice(-2)}`,

        from_year:
          startYear,

        to_year:
          startYear + 1,
      };
    }
  );


  const defaultYear =
    financialYears[0];


  // =====================================================
  // FORM
  // =====================================================

  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();


  // =====================================================
  // FIELD ARRAY
  // =====================================================

  const {
    fields,
    append,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: "leaveConfiguration",
  });


  // =====================================================
  // WATCH
  // =====================================================

  const leaveConfiguration =
    watch("leaveConfiguration") || [];


  // =====================================================
  // SITE ID
  //
  // IMPORTANT:
  // Parent form मध्ये site_id असणे आवश्यक आहे.
  // =====================================================

  const siteId =
    watch("site_id");


  // =====================================================
  // STATES
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [loadedFromDatabase, setLoadedFromDatabase] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");


  // =====================================================
  // API URL
  // =====================================================

  const API_URL =
    import.meta.env.VITE_API_URL;


  // =====================================================
  // DEFAULT ROW
  // =====================================================

  const getDefaultRow = () => ({
    financialYear:
      defaultYear.label,

    from_year:
      defaultYear.from_year,

    to_year:
      defaultYear.to_year,

    leaveType:
      "",

    totalLeaves:
      "",
  });


  // =====================================================
  // GET SITE LEAVE CONFIGURATION
  // =====================================================

  const fetchLeaveConfiguration =
    async (selectedSiteId) => {

      if (
        selectedSiteId === undefined ||
        selectedSiteId === null ||
        selectedSiteId === ""
      ) {

        replace([]);

        setLoadedFromDatabase(false);

        return;
      }


      try {

        setLoading(true);

        setLoadError("");


        console.log(
          "======================================"
        );

        console.log(
          "GET LEAVE CONFIGURATION"
        );

        console.log(
          "SITE ID:",
          selectedSiteId
        );

        console.log(
          "======================================"
        );


        const response =
          await axios.get(
            `${API_URL}/api/employee-leaves/configuration/${selectedSiteId}`
          );


        console.log(
          "LEAVE CONFIGURATION RESPONSE:",
          response.data
        );


        if (
          response.data?.success
        ) {

          const configurations =
            response.data?.data
              ?.configurations || [];


          // =================================================
          // DATABASE DATA -> FORM DATA
          // =================================================

          const rows =
            configurations.map(
              (item) => ({

                financialYear:
                  item.financial_year || "",

                from_year:
                  item.from_year || "",

                to_year:
                  item.to_year || "",

                leaveType:
                  item.leave_type || "",

                totalLeaves:
                  item.total_leaves ?? "",

                // database id
                id:
                  item.id,
                    siteId:
                Number(selectedSiteId),
              })
            );


          console.log(
            "ROWS FOR FRONTEND:",
            rows
          );


          // =================================================
          // SHOW DATABASE DATA
          // =================================================

          if (rows.length > 0) {

            replace(rows);

            setLoadedFromDatabase(true);

          } else {

            // No configuration in DB
            replace([
              getDefaultRow()
            ]);

            setLoadedFromDatabase(false);
          }

        } else {

          replace([
            getDefaultRow()
          ]);

          setLoadedFromDatabase(false);
        }


      } catch (error) {

        console.error(
          "GET LEAVE CONFIGURATION ERROR:",
          error
        );


        setLoadError(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load leave configuration"
        );


        replace([
          getDefaultRow()
        ]);

        setLoadedFromDatabase(false);

      } finally {

        setLoading(false);
      }
    };


  // =====================================================
  // LOAD WHEN SITE CHANGES
  // =====================================================

  useEffect(() => {

    fetchLeaveConfiguration(
      siteId
    );

  }, [siteId]);

// =====================================================
// DELETE LEAVE CONFIGURATION
// =====================================================

const handleDeleteLeave = async (index) => {

    const row =
        leaveConfiguration?.[index];


    if (!row) {
        return;
    }


    // =================================================
    // CONFIRM
    // =================================================

    const confirmed =
        window.confirm(
            `Remove ${getLeaveTypeLabel(
                row.leaveType
            )} configuration for ${
                row.financialYear
            }?`
        );


    if (!confirmed) {
        return;
    }


    // =================================================
    // DATABASE RECORD
    // =================================================

    if (row.id) {

        try {

            setLoading(true);

            console.log(
                "DELETE LEAVE CONFIGURATION ID:",
                row.id
            );


            const response =
                await axios.post(
                    `${API_URL}/api/employee-leaves/configuration/${row.siteId}/${row.id}`
                );


            console.log(
                "DELETE RESPONSE:",
                response.data
            );


            if (
                response.data?.success
            ) {

                // Remove from frontend
                remove(index);

            } else {

                alert(
                    response.data?.message ||
                    "Failed to remove leave configuration"
                );
            }


        } catch (error) {

            console.error(
                "DELETE LEAVE CONFIGURATION ERROR:",
                error
            );


            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to remove leave configuration"
            );

        } finally {

            setLoading(false);
        }


        return;
    }


    // =================================================
    // NEW ROW
    // No database ID
    // Just remove from frontend
    // =================================================

    remove(index);
};
  // =====================================================
  // ADD LEAVE ROW
  // =====================================================

  const addLeaveRow = () => {

    append(
      getDefaultRow()
    );
  };


  // =====================================================
  // FINANCIAL YEAR CHANGE
  // =====================================================

  const handleFinancialYearChange =
    (index, value) => {

      const selectedYear =
        financialYears.find(
          (item) =>
            item.label === value
        );


      if (!selectedYear) {

        setValue(
          `leaveConfiguration.${index}.financialYear`,
          ""
        );

        setValue(
          `leaveConfiguration.${index}.from_year`,
          ""
        );

        setValue(
          `leaveConfiguration.${index}.to_year`,
          ""
        );

        return;
      }


      setValue(
        `leaveConfiguration.${index}.financialYear`,
        selectedYear.label,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );


      setValue(
        `leaveConfiguration.${index}.from_year`,
        selectedYear.from_year,
        {
          shouldDirty: true,
        }
      );


      setValue(
        `leaveConfiguration.${index}.to_year`,
        selectedYear.to_year,
        {
          shouldDirty: true,
        }
      );
    };


  // =====================================================
  // LEAVE TYPE LABEL
  // =====================================================

  const getLeaveTypeLabel =
    (type) => {

      switch (
        String(type || "").toUpperCase()
      ) {

        case "CL":
          return "Casual Leave (CL)";

        case "SL":
          return "Sick Leave (SL)";

        case "PL":
          return "Privilege Leave (PL)";

        case "ML":
          return "Medical Leave (ML)";

        case "HALF_DAY":
          return "Half Day";

        default:
          return type || "-";
      }
    };


  return (
    <div className="mt-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-3">

        <div>

          <h5
            className="mb-1"
            style={{
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            LEAVE CONFIGURATION
          </h5>


          {/* {loading && (
            <small className="text-primary">
              Loading existing configuration...
            </small>
          )}


          {!loading &&
            loadedFromDatabase && (
              <small className="text-success">
                Existing site configuration loaded
              </small>
            )} */}

        </div>


        <button
          type="button"
          className="btn btn-primary"
          onClick={addLeaveRow}
        >
          + Add Leave
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {/* {loadError && (
        <div
          className="alert alert-danger py-2"
          role="alert"
        >
          {loadError}
        </div>
      )} */}


      {/* =================================================
          NO SITE
      ================================================= */}

      {!siteId && (
        <div className="alert alert-info">
          Please select a site to view leave configuration.
        </div>
      )}


      {/* =================================================
          TABLE
      ================================================= */}

      {siteId && (
        <div className="table-responsive">

          <table
            className="table table-bordered align-middle mb-0"
          >

            <thead className="table-light">

              <tr>

                <th>
                  FINANCIAL YEAR
                </th>

                <th>
                  LEAVE TYPE
                </th>

                <th>
                  TOTAL LEAVES
                </th>

                <th
                  style={{
                    width: "120px",
                  }}
                >
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {fields.map(
                (row, index) => {

                  const rowError =
                    errors
                      ?.leaveConfiguration
                      ?. [index];


                  return (
                    <tr
                      key={row.id}
                    >

                      {/* =================================
                          FINANCIAL YEAR
                      ================================= */}

                      <td>

                        <select
                          className={`form-select ${
                            rowError?.financialYear
                              ? "is-invalid"
                              : ""
                          }`}
                          value={
                            leaveConfiguration?.[index]
                              ?.financialYear || ""
                          }
                          onChange={(e) =>
                            handleFinancialYearChange(
                              index,
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Select Financial Year
                          </option>


                          {financialYears.map(
                            (year) => (

                              <option
                                key={
                                  year.label
                                }
                                value={
                                  year.label
                                }
                              >
                                {year.label}
                              </option>

                            )
                          )}

                        </select>


                        <input
                          type="hidden"
                          {...register(
                            `leaveConfiguration.${index}.financialYear`,
                            {
                              required:
                                "Financial Year is required",
                            }
                          )}
                        />


                        <input
                          type="hidden"
                          {...register(
                            `leaveConfiguration.${index}.from_year`
                          )}
                        />


                        <input
                          type="hidden"
                          {...register(
                            `leaveConfiguration.${index}.to_year`
                          )}
                        />


                        {rowError?.financialYear && (
                          <div className="text-danger small">
                            {
                              rowError
                                .financialYear
                                .message
                            }
                          </div>
                        )}

                      </td>


                      {/* =================================
                          LEAVE TYPE
                      ================================= */}

                      <td>

                        <select
                          {...register(
                            `leaveConfiguration.${index}.leaveType`,
                            {
                              required:
                                "Leave Type is required",
                            }
                          )}
                          className={`form-select ${
                            rowError?.leaveType
                              ? "is-invalid"
                              : ""
                          }`}
                        >

                          <option value="">
                            Select Leave Type
                          </option>


                          <option value="CL">
                            Casual Leave (CL)
                          </option>


                          <option value="SL">
                            Sick Leave (SL)
                          </option>


                          <option value="PL">
                            Privilege Leave (PL)
                          </option>


                          <option value="ML">
                            Medical Leave (ML)
                          </option>


                          <option value="HALF_DAY">
                            Half Day
                          </option>

                        </select>


                        {rowError?.leaveType && (
                          <div className="invalid-feedback">
                            {
                              rowError
                                .leaveType
                                .message
                            }
                          </div>
                        )}

                      </td>


                      {/* =================================
                          TOTAL LEAVES
                      ================================= */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="TOTAL LEAVES"
                          {...register(
                            `leaveConfiguration.${index}.totalLeaves`,
                            {
                              required:
                                "Total Leaves is required",

                              min: {
                                value: 0,
                                message:
                                  "Total Leaves cannot be negative",
                              },

                              valueAsNumber: true,
                            }
                          )}
                          className={`form-control ${
                            rowError?.totalLeaves
                              ? "is-invalid"
                              : ""
                          }`}
                        />


                        {rowError?.totalLeaves && (
                          <div className="invalid-feedback">
                            {
                              rowError
                                .totalLeaves
                                .message
                            }
                          </div>
                        )}

                      </td>


                      {/* =================================
                          ACTION
                      ================================= */}

                      <td className="text-center">


                        {fields.length > 1 && (

    <button
        type="button"
        className="btn btn-sm btn-danger"
        onClick={() =>
            handleDeleteLeave(index)
        }
        disabled={loading}
    >
        Remove
    </button>

)}

                      </td>

                    </tr>
                  );
                }
              )}


              {/* =========================================
                  EMPTY
              ========================================= */}

              {!loading &&
                fields.length === 0 && (

                  <tr>

                    <td
                      colSpan="4"
                      className="text-center text-muted py-4"
                    >
                      No leave configuration found.
                    </td>

                  </tr>

                )}

            </tbody>

          </table>

        </div>
      )}


      {/* =================================================
          DATABASE PREVIEW
      ================================================= */}

      {siteId &&
        loadedFromDatabase &&
        leaveConfiguration.length > 0 && (

          <div className="mt-3">

            <small className="text-muted">

              {leaveConfiguration.length} leave
              configuration record(s) loaded from
              database.

            </small>

          </div>

        )}

    </div>
  );
};


export default LeaveConfigurationPage;

