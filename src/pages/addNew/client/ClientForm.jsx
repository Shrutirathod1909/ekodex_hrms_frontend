import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import ClientDetailsStep from "./ClientDetailsStep";
import BankDetailsStep from "./BankDetailsStep";
import SiteDetailsStep from "./SiteDetailsStep";
import StepIndicator from "./StepIndicator";
import ExistingSitesTab from "./ExistingSitesTab";
import { useNavigate } from "react-router-dom";
import ClientTable from "./ClientTable"; // Import your list component
import { useLocation } from "react-router-dom";

const AddClient = () => {
  const location = useLocation();

  const { clientId } = location.state || {};

  // first i am using searchParams but the id is visibal in url so i use another why to pass id using location state
  // const clientId = searchParams.get("clientId");

  const [step, setStep] = useState(location.state?.step || 1);
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const defaultValues = {
    // =========================
    // STEP 1 - CLIENT DETAILS
    // =========================
    companyName: "",
    clientcode: "",
    contactNo: "",
    emailId: "",
    contactPersonName: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    gstStateCode: "",
    gstNo: "",
    sacCode: "",
    billingCompany: "",
    billingBranch: "",
billingBranchName: "",
    companyBankName: "",
    otherInfo: "",
    termsAndConditions: "",

    // =========================
    // STEP 2 - BANK DETAILS
    // =========================
    bankName: "",
    accountNo: "",
    ifscCode: "",
    branch: "",
    bankCity: "",
    micrCode: "",

    // =========================
    // STEP 3 - SITE DETAILS
    // =========================
    siteName: "",
    site_id: "",
    workOrderNo: "",
    siteContactPerson: "",
    siteContactNo: "",
    siteAddress: "",

    address2: "",
    billingAddress: "",

    pincode2: "",

    city2: "",
    state2: "",

    country: "",

    sitezonename: "",
    cc_branch_name: "",
    cc_site_hours: "",
    cc_total_manpower: "",
    attendanceUploadType: "",

    latitude: "",
    longitude: "",

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

    ponumber: "",

    c_attachement: null,

    // =========================
    // CHECKBOXES
    // =========================
    viewOTHours: false,
    attachWagesSHeet: false,
    roundOffAmount: false,
    billWithoutRank: false,
    nonComplianceSite: false,
    applyLeave: false,
leaveConfiguration: [
  {
    financialYear: "",
    from_year: "",
    to_year: "",
    leaveType: "",
    totalLeaves: "",
  },
],
    // =========================
    // CHARGES BY RANK
    // =========================
    rates: [
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

        gross: "",

        serviceChargeType: "",
        serviceCharge: "",

        perDayRate: "",
        otRate: "",

        leaveWages: "",
        uniformWashing: "",
        anyOther: "",
      },
    ],

    otherCharges: [
      {
        serviceType: "",
        chargesType: "",
        charges: "",
        calculateOn: "",
        condition: "",
        amountRange: "",
      },
    ],
  };
  const methods = useForm({
    defaultValues,
  });

  const { reset } = methods;

  useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/clients/${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("CLIENT DATA", res.data);

        const client = res.data.data || res.data;

        const site = client.sites?.[0] || {};

        reset({
          companyName: client.companyName || "",
          clientcode: client.clientcode || "",
          contactNo: client.contactNo || "",
          emailId: client.emailId || "",
          contactPersonName: client.contactPersonName || "",
          address: client.address || "",
          pincode: client.pincode || "",
          city: client.city || "",
          state: client.state || "",
          gstStateCode: client.gstStateCode || "",
          gstNo: client.gstNo || "",
          sacCode: client.sacCode || "",
          billingCompany: client.billingCompany?.id || client.billingCompany || "",
          billingBranch:
  client.billingBranchId ??
  client.billing_branch_id ??
  "",

billingBranchName:
  client.billingBranchName ??
  client.billing_branch ??
  "",
          companyBankName: client.company_bank_name || client.companyBankName || "",
          
          otherInfo: client.otherInfo || "",
          termsAndConditions: client.termsAndConditions || "",

          // ---- SITE FIELDS ----
          siteName: site.siteName || "",
          site_id: site.site_id || "",
          workOrderNo: site.workOrderNo || "",
          siteContactPerson: site.siteContactPerson || "",
          siteContactNo: site.siteContactNo || "",
          siteEmailId: site.siteEmailId || "",
          siteAddress: site.siteAddress || "",
          sitePincode: site.sitePincode || "",
          siteCity: site.siteCity || "",
          siteState: site.siteState || "",
          billingAddress: site.billingAddress || "",
          country: site.country || "",
          sitezonename: site.sitezonename || "",
          cc_branch_name: site.cc_branch_name || "",
          cc_site_hours: site.cc_site_hours || "",
          cc_total_manpower: site.cc_total_manpower || "",
          attendanceUploadType: site.attendanceUploadType || "",
          latitude: site.latitude || "",
          longitude: site.longitude || "",
          locationStartDate: site.locationStartDate || "",
          locationEndDate: site.locationEndDate || "",
          salesPersonName: site.salesPersonName || "",
          salesPersonEmailId: site.salesPersonEmailId || "",
          salesPersonContactNo: site.salesPersonContactNo || "",
          billCycleDate: site.billCycleDate || "",
          status: site.status || "Active",
          ponumber: site.ponumber || "",
          cgst: site.cgst || "",
          sgst: site.sgst || "",
          igst: site.igst || "",
          expectedBillingAmount: site.expectedBillingAmount || "",
          daysForBilling: site.daysForBilling || "",
          viewOTHours: site.viewOTHours || false,
          attachWagesSHeet: site.attachWagesSHeet || false,
          roundOffAmount: site.roundOffAmount || false,
          billWithoutRank: site.billWithoutRank || false,
          nonComplianceSite: site.nonComplianceSite || false,
          applyLeave: site.applyLeave || false,

          // ---- BANK FIELDS ----
          bankName: client.bankDetails?.bankName || client.bankName || "",
          accountNo: client.bankDetails?.accountNo || client.accountNo || "",
          ifscCode: client.bankDetails?.ifsc || client.ifscCode || "",
          branch: client.bankDetails?.branch || client.branch || "",
          bankCity: client.bankDetails?.bankCity || client.bankCity || "",
          micrCode: client.bankDetails?.micrCode || client.micrCode || "",

          // ---- RATES ----
          rates:
            site.rates?.length > 0
              ? site.rates.map((r) => ({
                id: r.id || "",
                empType: r.empType || "",
                hours: (r.hours && parseInt(r.hours).toString()) || "",
                nos: r.nos || "",
                basic: r.basic || "",
                hra: r.hra || "",
                da: r.da || "",
                specialAllowance: r.specialAllowance || "",
                otherAllowance: r.otherAllowance || "",
                lww: r.lww || "",
                bonus: r.bonus || "",
                gross: r.gross || "",
                serviceChargeType: r.serviceChargeType || "",
                serviceCharge: r.serviceCharge || "",
                perDayRate: r.perDayRate || "",
                otRate: r.otRate || "",
                leaveWages: r.leaveWages || "",
                uniformWashing: r.uniformWashing || "",
                anyOther: r.anyOther || "",
              }))
              : [{ empType: "", hours: "", nos: "", basic: "", hra: "", da: "", specialAllowance: "", otherAllowance: "", lww: "", bonus: "", gross: "", serviceChargeType: "", serviceCharge: "", perDayRate: "", otRate: "", leaveWages: "", uniformWashing: "", anyOther: "" }],

          // ---- OTHER CHARGES ----
          otherCharges:
            site.otherCharges?.length > 0
              ? site.otherCharges.map((c) => ({
                id: c.id || "",
                serviceType: c.serviceType || "",
                chargesType: c.chargesType || "Rs",
                charges: c.charges || "",
                calculateOn: c.calculateOn || "",
                condition: c.condition || "",
                amountRange: c.amountRange || "",
              }))
              : [{ serviceType: "", chargesType: "Rs", charges: "", calculateOn: "", condition: "", amountRange: "" }],
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchClient();
  }, [clientId, reset]);

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setStep((prev) => prev - 1);
  };

  const toUpperCaseData = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map((item) => toUpperCaseData(item));
    }

    if (obj !== null && typeof obj === "object") {
      const newObj = {};

      Object.keys(obj).forEach((key) => {
        newObj[key] = toUpperCaseData(obj[key]);
      });

      return newObj;
    }

    // Don't touch files
    if (obj instanceof File) {
      return obj;
    }

    // Convert strings to uppercase
    if (typeof obj === "string") {
      return obj.trim().toUpperCase();
    }

    return obj;
  };

const onSubmit = async (data) => {
  try {
    const token = localStorage.getItem("token");

    // =====================================================
    // RAW DATA
    // =====================================================

    const rawRates = data.rates || [];
    const rawOtherCharges = data.otherCharges || [];

    const leaveConfiguration =
      data.leaveConfiguration || [];

    console.log("==========================================");
    console.log("FINAL FORM DATA:", data);
    console.log("LEAVE CONFIGURATION:", leaveConfiguration);
    console.log("==========================================");

    // =====================================================
    // UPPERCASE
    // =====================================================

    const upperData = toUpperCaseData(data);

    const formData = new FormData();

    // =====================================================
    // CLIENT DATA
    // =====================================================

    formData.append(
      "companyName",
      upperData.companyName || ""
    );

    formData.append(
      "clientcode",
      upperData.clientcode || ""
    );

    formData.append(
      "contactPersonName",
      upperData.contactPersonName || ""
    );

    formData.append(
      "contactNo",
      upperData.contactNo || ""
    );

    formData.append(
      "emailId",
      upperData.emailId || ""
    );

    formData.append(
      "address",
      upperData.address || ""
    );

    formData.append(
      "city",
      upperData.city || ""
    );

    formData.append(
      "state",
      upperData.state || ""
    );

    formData.append(
      "pincode",
      upperData.pincode || ""
    );

    formData.append(
      "gstStateCode",
      upperData.gstStateCode || ""
    );

    formData.append(
      "gstNo",
      upperData.gstNo || ""
    );

    formData.append(
      "sacCode",
      upperData.sacCode || ""
    );

    formData.append(
      "billingCompany",
      upperData.billingCompany || ""
    );
formData.append(
  "billingBranch",
  upperData.billingBranch || ""
);

formData.append(
  "billingBranchName",
  upperData.billingBranchName || ""
);
    formData.append(
      "companyBankName",
      upperData.companyBankName || ""
    );

    formData.append(
      "otherInfo",
      upperData.otherInfo || ""
    );

    formData.append(
      "termsAndConditions",
      upperData.termsAndConditions || ""
    );

    // =====================================================
    // BANK DETAILS
    // =====================================================

    formData.append(
      "bankName",
      upperData.bankName || ""
    );

    formData.append(
      "accountNo",
      upperData.accountNo || ""
    );

    formData.append(
      "ifscCode",
      upperData.ifscCode || ""
    );

    formData.append(
      "micrCode",
      upperData.micrCode || ""
    );

    formData.append(
      "branch",
      upperData.branch || ""
    );

    formData.append(
      "bankCity",
      upperData.bankCity || ""
    );

    // =====================================================
    // SITE DATA
    // =====================================================

    const sites = [
      {
        siteName: upperData.siteName || "",

        site_id: upperData.site_id || "",

        workOrderNo:
          upperData.workOrderNo || "",

        siteContactPerson:
          upperData.siteContactPerson || "",

        siteContactNo:
          upperData.siteContactNo || "",

        siteEmailId:
          upperData.siteEmailId || "",

        siteAddress:
          upperData.siteAddress || "",

        sitePincode:
          upperData.sitePincode || "",

        siteCity:
          upperData.siteCity || "",

        siteState:
          upperData.siteState || "",

        latitude:
          upperData.latitude || "",

        longitude:
          upperData.longitude || "",

        country:
          upperData.country || "",

        sitezonename:
          upperData.sitezonename || "",

        cc_branch_name:
          upperData.cc_branch_name || "",

        cc_site_hours:
          upperData.cc_site_hours || "",

        cc_total_manpower:
          upperData.cc_total_manpower || "",
        attendanceUploadType:
  upperData.attendanceUploadType || "",

        billingAddress:
          upperData.billingAddress || "",

        locationStartDate:
          upperData.locationStartDate || null,

        locationEndDate:
          upperData.locationEndDate || null,

        salesPersonName:
          upperData.salesPersonName || "",

        salesPersonEmailId:
          upperData.salesPersonEmailId || "",

        salesPersonContactNo:
          upperData.salesPersonContactNo || "",

        billCycleDate:
          upperData.billCycleDate || "",

        status:
          upperData.status || "ACTIVE",

        cgst:
          upperData.cgst || 0,

        sgst:
          upperData.sgst || 0,

        igst:
          upperData.igst || 0,

        expectedBillingAmount:
          upperData.expectedBillingAmount || 0,

        daysForBilling:
          upperData.daysForBilling || 0,

        ponumber:
          upperData.ponumber || "",

        viewOTHours:
          upperData.viewOTHours || false,

        attachWagesSHeet:
          upperData.attachWagesSHeet || false,

        roundOffAmount:
          upperData.roundOffAmount || false,

        billWithoutRank:
          upperData.billWithoutRank || false,

        nonComplianceSite:
          upperData.nonComplianceSite || false,

        applyLeave:
          upperData.applyLeave || false,

        // =================================================
        // RATES
        // =================================================

        rates: rawRates.map((r) => {

          const gross =
            (parseFloat(r.basic) || 0) +
            (parseFloat(r.hra) || 0) +
            (parseFloat(r.da) || 0) +
            (parseFloat(r.specialAllowance) || 0) +
            (parseFloat(r.otherAllowance) || 0) +
            (parseFloat(r.lww) || 0) +
            (parseFloat(r.bonus) || 0);

          return {
            ...r,

            gross,

            serviceChargeType:
              r.serviceChargeType?.value ??
              r.serviceChargeType ??
              "",
          };
        }),

        // =================================================
        // OTHER CHARGES
        // =================================================

        otherCharges:
          rawOtherCharges.map((c) => ({
            ...c,

            serviceType:
              c.serviceType?.value ??
              c.serviceType ??
              "",

            chargesType:
              c.chargesType ?? "Rs",
          })),
      },
    ];

    console.log(
      "SITES BEFORE API:",
      JSON.stringify(sites, null, 2)
    );
    console.log(
  "ATTENDANCE UPLOAD TYPE BEFORE API:",
  sites?.[0]?.attendanceUploadType
);

    // =====================================================
    // APPEND SITE
    // =====================================================

    formData.append(
      "sites",
      JSON.stringify(sites)
    );

    // =====================================================
    // FILE
    // =====================================================

    if (data.c_attachement?.[0]) {

      formData.append(
        "c_attachement",
        data.c_attachement[0]
      );
    }

    // =====================================================
    // SAVE CLIENT
    // =====================================================

    let response;

    if (clientId) {

      response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/clients/update-client/${clientId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

    } else {

      response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/clients`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }

    // =====================================================
    // IMPORTANT DEBUG
    // =====================================================

    console.log(
      "CLIENT API FULL RESPONSE:",
      response.data
    );

    // =====================================================
    // GET SITE ID
    // =====================================================

    let savedSiteId =
      response?.data?.site_id ??
      response?.data?.siteId ??
      response?.data?.data?.site_id ??
      response?.data?.data?.siteId ??
      response?.data?.data?.site?.id ??
      response?.data?.data?.site?.site_id ??
      response?.data?.site?.id ??
      response?.data?.site?.site_id ??
      null;

    // =====================================================
    // IF UPDATE API DOES NOT RETURN SITE ID
    // GET IT FROM FORM DATA
    // =====================================================

    if (!savedSiteId) {

      savedSiteId =
        data.site_id ||
        sites?.[0]?.site_id ||
        null;
    }

    console.log(
      "=========================================="
    );

    console.log(
      "FINAL SAVED SITE ID:",
      savedSiteId
    );

    console.log(
      "=========================================="
    );

    // =====================================================
    // VALIDATE SITE ID
    // =====================================================

  const hasSiteId =
  savedSiteId !== null &&
  savedSiteId !== undefined &&
  String(savedSiteId).trim() !== "" &&
  String(savedSiteId) !== "undefined" &&
  String(savedSiteId) !== "null";

    // =====================================================
    // PREPARE LEAVE CONFIGURATION
    // =====================================================

    const validLeaves =
      leaveConfiguration
        .filter((leave) => {

          return (
            leave.financialYear &&
            leave.from_year &&
            leave.to_year &&
            leave.leaveType &&
            leave.totalLeaves !== "" &&
            leave.totalLeaves !== null &&
            leave.totalLeaves !== undefined
          );

        })
        .map((leave) => ({

          financialYear:
            String(leave.financialYear),

          from_year:
            Number(leave.from_year),

          to_year:
            Number(leave.to_year),

          leaveType:
            String(leave.leaveType).toUpperCase(),

          totalLeaves:
            Number(leave.totalLeaves),

        }));

    console.log(
      "=========================================="
    );

    console.log(
      "VALID LEAVE CONFIGURATION:"
    );

    console.log(
      JSON.stringify(
        validLeaves,
        null,
        2
      )
    );

    console.log(
      "=========================================="
    );

    // =====================================================
    // APPLY LEAVE CONFIGURATION
    // =====================================================

    if (validLeaves.length > 0) {

      try {

        const leavePayload = {

          site_id:
            Number(savedSiteId),

          leaves:
            validLeaves,

        };

        console.log(
          "LEAVE API PAYLOAD:",
          JSON.stringify(
            leavePayload,
            null,
            2
          )
        );

        const leaveResponse =
          await axios.post(

            `${import.meta.env.VITE_API_URL}/api/employee-leaves/apply-site-leaves`,

            leavePayload,

            {
              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",

              },
            }

          );

        console.log(
          "=========================================="
        );

        console.log(
          "LEAVE API RESPONSE:",
          leaveResponse.data
        );

        console.log(
          "=========================================="
        );

      } catch (leaveError) {

        console.error(
          "=========================================="
        );

        console.error(
          "LEAVE API ERROR:",
          leaveError
        );

        console.error(
          "LEAVE API ERROR RESPONSE:",
          leaveError.response?.data
        );

        console.error(
          "LEAVE API ERROR STATUS:",
          leaveError.response?.status
        );

        console.error(
          "=========================================="
        );

        alert(
          leaveError.response?.data?.message ||
          "Client saved, but Leave Configuration failed."
        );

        return;
      }

    } else {

      console.warn(
        "NO VALID LEAVE CONFIGURATION FOUND."
      );

    }

    // =====================================================
    // SUCCESS
    // =====================================================

    alert(
      clientId
        ? "Client Updated Successfully"
        : "Client Created Successfully"
    );

    navigate("/add-new/client");

  } catch (err) {

    console.error(
      "SAVE CLIENT ERROR:",
      err
    );

    console.error(
      "SERVER ERROR:",
      err.response?.data
    );

    alert(
      err.response?.data?.message ||
      "Failed To Save Client"
    );
  }
};



  const handleAddNewSite = () => {
    // Keep client details, reset site details
    reset({
      ...methods.getValues(),
      siteName: "",
      site_id: "",
      workOrderNo: "",
      siteContactPerson: "",
      siteContactNo: "",
      siteEmailId: "",
      siteAddress: "",
      sitePincode: "",
      siteCity: "",
      siteState: "",
      billingAddress: "",
      country: "",
      sitezonename: "",
      cc_branch_name: "",
      cc_site_hours: "",
      cc_total_manpower: "",
      attendanceUploadType: "",
      latitude: "",
      longitude: "",
      locationStartDate: "",
      locationEndDate: "",
      salesPersonName: "",
      salesPersonEmailId: "",
      salesPersonContactNo: "",
      billCycleDate: "",
      status: "Active",
      ponumber: "",
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
      rates: [{ empType: "", hours: "", nos: "", basic: "", hra: "", da: "", specialAllowance: "", otherAllowance: "", lww: "", bonus: "", gross: "", serviceChargeType: "", serviceCharge: "", perDayRate: "", otRate: "", leaveWages: "", uniformWashing: "", anyOther: "" }],
      otherCharges: [{ serviceType: "", chargesType: "Rs", charges: "", calculateOn: "", condition: "", amountRange: "" }],
    });
    setStep(4);
  };

  if (isSubmitted) {
    navigate("add-new/client");
  }

  return (
    <div
      className="card form-panel"
      style={{
        fontSize: "13px",
      }}
    >
      <FormProvider {...methods}>
        <StepIndicator step={step} setStep={setStep} clientId={clientId} />

        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          {step === 1 && (
            <ClientDetailsStep nextStep={nextStep} clientId={clientId} />
          )}

          {step === 2 && (
            <BankDetailsStep
              nextStep={nextStep}
              clientId={clientId}
              previousStep={previousStep}
            />
          )}

          {(step === 3 && !clientId) && <SiteDetailsStep previousStep={previousStep} />}

          {(step === 3 && clientId) && (
            <ExistingSitesTab clientId={clientId} previousStep={previousStep} onAddNewSite={handleAddNewSite} />
          )}

          {step === 4 && clientId && <SiteDetailsStep previousStep={() => setStep(3)} />}

          <button
            id="clientFormSubmit"
            type="submit"
            style={{ display: "none" }}
          >
            Submit
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddClient;
