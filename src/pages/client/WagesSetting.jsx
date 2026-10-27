import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./WagesSetting.css";

const WagesSetting = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // SITE DATA
  // =====================================================

  const site = location.state?.site || {};

  const siteId =
    site.rateId ||
    site.site_id ||
    site.id ||
    "";

  const companyName =
    site.companyName ||
    site.company_name ||
    site.clientName ||
    site.client_name ||
    "Company";

  const siteName =
    site.siteName ||
    site.site_name ||
    "Site";

  // =====================================================
  // DEFAULT SETTINGS
  // IMPORTANT: ALL CHECKBOXES FALSE
  // =====================================================

  const defaultSettings = {
    // Top options
    multipleOT: false,
    uniformCharges: false,
    earnedGrossWithoutOT: false,

    // Dropdowns
    pfWages: "",
    esicWages: "",
    ctcCalculate: "",

    // =================================================
    // PRIMARY DETAIL
    // =================================================

    primary: {
      slNo: false,
      name: false,
      aadhaar: false,
      pan: false,
      ifsc: false,
      doj: false,
      pf: false,
      uan: false,
      presentDays: false,
      absentDays: false,
      paidLeaves: false,
      halfDay: false,
      dob: false,
      bankName: false,
      designation: false,
      esicIp: false,
      otDay: false,
      totalSalaryDays: false,
      mobileNo: false,
      acNo: false,
      empCode: false,
      monthDay: false,
      weeklyOff: false,
    },

    // =================================================
    // FIX GROSS COMPONENTS
    // =================================================

    fixGross: {
      basic: false,
      vda: false,
      hra: false,
      specialAllowance: false,
      otherAllowance: false,
      otRate: false,
      lww: false,
      bonus: false,
      leaveWages: false,
      rateDay: false,
      anyOther: false,
      totalGross: false,
    },

    // =================================================
    // EARNED COMPONENTS
    // =================================================

    earned: {
      basic: false,
      vda: false,
      hra: false,
      specialAllowance: false,
      otherAllowance: false,
      otAmount: false,
      lww: false,
      bonus: false,
      leaveWages: false,
      anyOther: false,
      totalEarned: false,
    },

    // =================================================
    // WAGES
    // =================================================

    wagesForPF: false,
    wagesForESIC: false,

    // =================================================
    // DEDUCTIONS
    // =================================================

    deductions: {
      epf: false,
      esic: false,
      pt: false,
      mlwf: false,
      advance: false,
      loan: false,
      uniform: false,
      id: false,
      recovery: false,
      installments: false,
      anyOther: false,
      totalDeduction: false,
    },

    // =================================================
    // NET SALARY
    // =================================================

    netSalary: false,

    // =================================================
    // ARREARS
    // =================================================

    arrears: false,

    // =================================================
    // SALARY PAYABLE
    // =================================================

    salaryPayable: false,

    // =================================================
    // CONTRIBUTIONS
    // =================================================

    contributions: {
      epf: false,
      esic: false,
      mlwf: false,
      uniform: false,
      subTotal: false,
    },

    // =================================================
    // SERVICE CHARGES
    // =================================================

    serviceCharges: false,

    // =================================================
    // TAX
    // =================================================

    taxValueBeforeTax: false,
    cgst: false,
    sgst: false,
    igst: false,
    taxInvoiceValue: false,
  };

  // =====================================================
  // STATE
  // =====================================================

  const [settings, setSettings] = useState(defaultSettings);

  // =====================================================
  // LOAD SITE SETTINGS
  // =====================================================

  useEffect(() => {
    if (!siteId) {
      setSettings(defaultSettings);
      return;
    }

    const storageKey = `wages_setting_${siteId}`;

    const savedSettings =
      localStorage.getItem(storageKey);

    if (!savedSettings) {
      setSettings(defaultSettings);
      return;
    }

    try {
      const parsedSettings =
        JSON.parse(savedSettings);

      setSettings({
        ...defaultSettings,

        ...parsedSettings,

        primary: {
          ...defaultSettings.primary,
          ...(parsedSettings.primary || {}),
        },

        fixGross: {
          ...defaultSettings.fixGross,
          ...(parsedSettings.fixGross || {}),
        },

        earned: {
          ...defaultSettings.earned,
          ...(parsedSettings.earned || {}),
        },

        deductions: {
          ...defaultSettings.deductions,
          ...(parsedSettings.deductions || {}),
        },

        contributions: {
          ...defaultSettings.contributions,
          ...(parsedSettings.contributions || {}),
        },
      });
    } catch (error) {
      console.error(
        "Error loading Wages Setting:",
        error
      );

      setSettings(defaultSettings);
    }
  }, [siteId]);

  // =====================================================
  // INDIVIDUAL SECTION CHECKBOX
  // =====================================================

  const handleCheckbox = (
    section,
    field
  ) => {
    setSettings((prev) => ({
      ...prev,

      [section]: {
        ...prev[section],

        [field]:
          !prev[section][field],
      },
    }));
  };

  // =====================================================
  // TOP CHECKBOX
  // =====================================================

  const handleTopCheckbox = (
    field
  ) => {
    setSettings((prev) => ({
      ...prev,

      [field]: !prev[field],
    }));
  };

  // =====================================================
  // DROPDOWN
  // =====================================================

  const handleSelect = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  // =====================================================
  // CHECK IF ALL SECTION CHECKBOXES SELECTED
  // =====================================================

  const isSectionChecked = (
    section
  ) => {
    if (!settings[section]) {
      return false;
    }

    const values =
      Object.values(
        settings[section]
      );

    if (values.length === 0) {
      return false;
    }

    return values.every(
      (value) => value === true
    );
  };

  // =====================================================
  // SELECT / UNSELECT COMPLETE SECTION
  // =====================================================

  const toggleSection = (
    section
  ) => {
    if (!settings[section]) {
      return;
    }

    const allSelected =
      isSectionChecked(section);

    const updatedSection = {};

    Object.keys(
      settings[section]
    ).forEach((key) => {
      updatedSection[key] =
        !allSelected;
    });

    setSettings((prev) => ({
      ...prev,

      [section]:
        updatedSection,
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = () => {
    if (!siteId) {
      alert(
        "Site ID not found."
      );
      return;
    }

    const payload = {
      site_id: siteId,

      site_name: siteName,

      company_name:
        companyName,

      settings: settings,
    };

    console.log(
      "Wages Setting Payload:",
      payload
    );

    // =============================================
    // SITE-WISE LOCAL STORAGE
    // =============================================

    const storageKey =
      `wages_setting_${siteId}`;

    localStorage.setItem(
      storageKey,
      JSON.stringify(settings)
    );

    alert(
      "Wages Setting Saved Successfully"
    );
  };

  // =====================================================
  // RESET SETTINGS
  // =====================================================

  const handleReset = () => {
    if (!siteId) {
      setSettings(
        defaultSettings
      );

      return;
    }

    const confirmReset =
      window.confirm(
        "Are you sure you want to reset all Wages Settings?"
      );

    if (!confirmReset) {
      return;
    }

    localStorage.removeItem(
      `wages_setting_${siteId}`
    );

    setSettings(
      defaultSettings
    );
  };

  // =====================================================
  // CHECKBOX COMPONENT
  // =====================================================

  const Check = ({
    label,
    section,
    field,
  }) => {
    return (
      <label className="wage-checkbox">

        <input
          type="checkbox"
          checked={
            Boolean(
              settings?.[
                section
              ]?.[field]
            )
          }
          onChange={() =>
            handleCheckbox(
              section,
              field
            )
          }
        />

        <span>
          {label}
        </span>

      </label>
    );
  };

  // =====================================================
  // SECTION COMPONENT
  // =====================================================

  const Section = ({
    title,
    section,
    children,
  }) => {
    return (
      <div className="wage-section">

        <div className="wage-section-title">

          <input
            type="checkbox"
            checked={isSectionChecked(
              section
            )}
            onChange={() =>
              toggleSection(
                section
              )
            }
          />

          <span>
            {title}
          </span>

        </div>

        <div className="wage-grid">
          {children}
        </div>

      </div>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="wages-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="wages-header">

        <h3>
          Wages Setting - (
          {companyName}
          ) - {siteName}
          {siteId
            ? ` (${siteId})`
            : ""}
        </h3>

        <button
          type="button"
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          Go Back
        </button>

      </div>

      {/* =================================================
          TOP OPTIONS
      ================================================= */}

      <div className="top-options">

        <label>

          <input
            type="checkbox"
            checked={
              settings.multipleOT
            }
            onChange={() =>
              handleTopCheckbox(
                "multipleOT"
              )
            }
          />

          Multiply OT wages with working hours

        </label>

        <label>

          <input
            type="checkbox"
            checked={
              settings.uniformCharges
            }
            onChange={() =>
              handleTopCheckbox(
                "uniformCharges"
              )
            }
          />

          Calculate uniform/other charges based on days

        </label>

        <label>

          <input
            type="checkbox"
            checked={
              settings.earnedGrossWithoutOT
            }
            onChange={() =>
              handleTopCheckbox(
                "earnedGrossWithoutOT"
              )
            }
          />

          Calculate earned gross without OT

        </label>

      </div>

      {/* =================================================
          DROPDOWNS
      ================================================= */}

      <div className="select-row">

        {/* PF */}

        <div>

          <label>
            PF Wages Calculated On
          </label>

          <select
            value={
              settings.pfWages
            }
            onChange={(e) =>
              handleSelect(
                "pfWages",
                e.target.value
              )
            }
          >

            <option value="">
              Select
            </option>

            <option value="basic">
              Basic
            </option>

            <option value="gross">
              Gross
            </option>

            <option value="earned">
              Earned
            </option>

          </select>

        </div>

        {/* ESIC */}

        <div>

          <label>
            ESIC Wages Calculated On
          </label>

          <select
            value={
              settings.esicWages
            }
            onChange={(e) =>
              handleSelect(
                "esicWages",
                e.target.value
              )
            }
          >

            <option value="">
              Select
            </option>

            <option value="basic">
              Basic
            </option>

            <option value="gross">
              Gross
            </option>

            <option value="earned">
              Earned
            </option>

          </select>

        </div>

        {/* CTC */}

        <div>

          <label>
            CTC Calculate=
          </label>

          <select
            value={
              settings.ctcCalculate
            }
            onChange={(e) =>
              handleSelect(
                "ctcCalculate",
                e.target.value
              )
            }
          >

            <option value="">
              Select
            </option>

            <option value="gross">
              Gross
            </option>

            <option value="earned">
              Earned
            </option>

            <option value="salary_payable">
              Salary Payable
            </option>

          </select>

        </div>

      </div>

      {/* =================================================
          PRIMARY DETAIL
      ================================================= */}

      <Section
        title="Primary Detail"
        section="primary"
      >

        <Check
          section="primary"
          field="slNo"
          label="SL.NO."
        />

        <Check
          section="primary"
          field="name"
          label="NAME OF EMPLOYEE"
        />

        <Check
          section="primary"
          field="dob"
          label="DOB"
        />

        <Check
          section="primary"
          field="mobileNo"
          label="MOBILE NO"
        />

        <Check
          section="primary"
          field="aadhaar"
          label="AADHAR"
        />

        <Check
          section="primary"
          field="pan"
          label="PAN"
        />

        <Check
          section="primary"
          field="bankName"
          label="BANK NAME"
        />

        <Check
          section="primary"
          field="acNo"
          label="AC NO"
        />

        <Check
          section="primary"
          field="ifsc"
          label="IFSC"
        />

        <Check
          section="primary"
          field="doj"
          label="DOJ"
        />

        <Check
          section="primary"
          field="designation"
          label="DESIGNATION"
        />

        <Check
          section="primary"
          field="empCode"
          label="EMP CODE"
        />

        <Check
          section="primary"
          field="pf"
          label="PF"
        />

        <Check
          section="primary"
          field="uan"
          label="UAN"
        />

        <Check
          section="primary"
          field="esicIp"
          label="ESIC IP"
        />

        <Check
          section="primary"
          field="monthDay"
          label="MONTH DAY"
        />

        <Check
          section="primary"
          field="presentDays"
          label="PRESENT DAYS"
        />

        <Check
          section="primary"
          field="absentDays"
          label="ABSENT DAYS"
        />

        <Check
          section="primary"
          field="otDay"
          label="OT DAY"
        />

        <Check
          section="primary"
          field="weeklyOff"
          label="WEEKLY OFF"
        />

        <Check
          section="primary"
          field="paidLeaves"
          label="PAID LEAVES"
        />

        <Check
          section="primary"
          field="halfDay"
          label="HALF DAY"
        />

        <Check
          section="primary"
          field="totalSalaryDays"
          label="TOTAL SALARY DAYS"
        />

      </Section>

      {/* =================================================
          FIX GROSS COMPONENTS
      ================================================= */}

      <Section
        title="FIX GROSS COMPONENTS"
        section="fixGross"
      >

        <Check
          section="fixGross"
          field="basic"
          label="BASIC"
        />

        <Check
          section="fixGross"
          field="vda"
          label="VDA"
        />

        <Check
          section="fixGross"
          field="hra"
          label="HRA"
        />

        <Check
          section="fixGross"
          field="specialAllowance"
          label="SPECIAL ALLOWANCE"
        />

        <Check
          section="fixGross"
          field="otherAllowance"
          label="OTHER ALLOWANCE"
        />

        <Check
          section="fixGross"
          field="otRate"
          label="OT RATE"
        />

        <Check
          section="fixGross"
          field="lww"
          label="LWW"
        />

        <Check
          section="fixGross"
          field="bonus"
          label="BONUS"
        />

        <Check
          section="fixGross"
          field="leaveWages"
          label="LEAVE WAGES"
        />

        <Check
          section="fixGross"
          field="rateDay"
          label="RATE/DAY"
        />

        <Check
          section="fixGross"
          field="anyOther"
          label="ANY OTHER"
        />

        <Check
          section="fixGross"
          field="totalGross"
          label="TOTAL GROSS"
        />

      </Section>

      {/* =================================================
          EARNED COMPONENTS
      ================================================= */}

      <Section
        title="EARNED COMPONENTS"
        section="earned"
      >

        <Check
          section="earned"
          field="basic"
          label="BASIC"
        />

        <Check
          section="earned"
          field="vda"
          label="VDA"
        />

        <Check
          section="earned"
          field="hra"
          label="HRA"
        />

        <Check
          section="earned"
          field="specialAllowance"
          label="SPECIAL ALLOWANCE"
        />

        <Check
          section="earned"
          field="otherAllowance"
          label="OTHER ALLOWANCE"
        />

        <Check
          section="earned"
          field="otAmount"
          label="OT AMOUNT"
        />

        <Check
          section="earned"
          field="lww"
          label="LWW"
        />

        <Check
          section="earned"
          field="bonus"
          label="BONUS"
        />

        <Check
          section="earned"
          field="leaveWages"
          label="LEAVE WAGES"
        />

        <Check
          section="earned"
          field="anyOther"
          label="ANY OTHER"
        />

        <Check
          section="earned"
          field="totalEarned"
          label="TOTAL EARNED"
        />

      </Section>

      {/* =================================================
          WAGES FOR PF
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.wagesForPF
          }
          onChange={() =>
            handleTopCheckbox(
              "wagesForPF"
            )
          }
        />

        <span>
          WAGES FOR PF
        </span>

      </div>

      {/* =================================================
          WAGES FOR ESIC
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.wagesForESIC
          }
          onChange={() =>
            handleTopCheckbox(
              "wagesForESIC"
            )
          }
        />

        <span>
          WAGES FOR ESIC
        </span>

      </div>

      {/* =================================================
          DEDUCTIONS
      ================================================= */}

      <Section
        title="DEDUCTIONS"
        section="deductions"
      >

        <Check
          section="deductions"
          field="epf"
          label="EPF"
        />

        <Check
          section="deductions"
          field="esic"
          label="ESIC"
        />

        <Check
          section="deductions"
          field="pt"
          label="PT"
        />

        <Check
          section="deductions"
          field="mlwf"
          label="MLWF"
        />

        <Check
          section="deductions"
          field="advance"
          label="ADVANCE"
        />

        <Check
          section="deductions"
          field="loan"
          label="LOAN"
        />

        <Check
          section="deductions"
          field="uniform"
          label="UNIFORM"
        />

        <Check
          section="deductions"
          field="id"
          label="ID"
        />

        <Check
          section="deductions"
          field="recovery"
          label="RECOVERY"
        />

        <Check
          section="deductions"
          field="installments"
          label="INSTALLMENTS"
        />

        <Check
          section="deductions"
          field="anyOther"
          label="ANY OTHER"
        />

        <Check
          section="deductions"
          field="totalDeduction"
          label="TOTAL DEDUCTION"
        />

      </Section>

      {/* =================================================
          NET SALARY
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.netSalary
          }
          onChange={() =>
            handleTopCheckbox(
              "netSalary"
            )
          }
        />

        <span>
          NET SALARY
        </span>

      </div>

      {/* =================================================
          ARREARS
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.arrears
          }
          onChange={() =>
            handleTopCheckbox(
              "arrears"
            )
          }
        />

        <span>
          ARREARS PAYABLE IF ANY
        </span>

      </div>

      {/* =================================================
          SALARY PAYABLE
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.salaryPayable
          }
          onChange={() =>
            handleTopCheckbox(
              "salaryPayable"
            )
          }
        />

        <span>
          SALARY PAYABLE
        </span>

      </div>

      {/* =================================================
          CONTRIBUTIONS
      ================================================= */}

      <Section
        title="CONTRIBUTIONS"
        section="contributions"
      >

        <Check
          section="contributions"
          field="epf"
          label="EPF"
        />

        <Check
          section="contributions"
          field="esic"
          label="ESIC"
        />

        <Check
          section="contributions"
          field="mlwf"
          label="MLWF"
        />

        <Check
          section="contributions"
          field="uniform"
          label="Uniform/Helmet/TShirt/Any Other"
        />

        <Check
          section="contributions"
          field="subTotal"
          label="SUB TOTAL"
        />

      </Section>

      {/* =================================================
          SERVICE CHARGES
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.serviceCharges
          }
          onChange={() =>
            handleTopCheckbox(
              "serviceCharges"
            )
          }
        />

        <span>
          SERVICE CHARGES
        </span>

      </div>

      {/* =================================================
          TAX VALUE BEFORE TAX
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.taxValueBeforeTax
          }
          onChange={() =>
            handleTopCheckbox(
              "taxValueBeforeTax"
            )
          }
        />

        <span>
          TAX VALUE BEFORE TAX
        </span>

      </div>

      {/* =================================================
          CGST
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.cgst
          }
          onChange={() =>
            handleTopCheckbox(
              "cgst"
            )
          }
        />

        <span>
          CGST
        </span>

      </div>

      {/* =================================================
          SGST
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.sgst
          }
          onChange={() =>
            handleTopCheckbox(
              "sgst"
            )
          }
        />

        <span>
          SGST
        </span>

      </div>

      {/* =================================================
          IGST
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.igst
          }
          onChange={() =>
            handleTopCheckbox(
              "igst"
            )
          }
        />

        <span>
          IGST
        </span>

      </div>

      {/* =================================================
          TAX INVOICE VALUE
      ================================================= */}

      <div className="simple-row">

        <input
          type="checkbox"
          checked={
            settings.taxInvoiceValue
          }
          onChange={() =>
            handleTopCheckbox(
              "taxInvoiceValue"
            )
          }
        />

        <span>
          TAX INVOICE VALUE
        </span>

      </div>

      {/* =================================================
          BUTTONS
      ================================================= */}

      <div className="wages-buttons">

        <button
          type="button"
          className="submit-btn"
          onClick={
            handleSubmit
          }
        >
          Submit
        </button>

        <button
          type="button"
          className="reset-btn"
          onClick={
            handleReset
          }
        >
          Reset
        </button>

        <button
          type="button"
          className="cancel-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          Cancel
        </button>

      </div>

    </div>
  );
};

export default WagesSetting;