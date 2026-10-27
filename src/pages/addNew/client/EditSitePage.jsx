import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import SiteDetailsStep from "./SiteDetailsStep";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
function EditSitePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { site } = location.state || {};
  const [clientId, setClientId] = useState(site.clientId);
  console.log("site:", site, clientId);

  const methods = useForm({
    defaultValues: {
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
    },
  });

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

  const { reset } = methods;

  useEffect(() => {
    if (!site) return;

    reset({
      siteName: site.siteName,
      site_id: site.siteId,
      clientcode: site.clientCode,
      workOrderNo: site.workOrderNo,
      siteContactPerson: site.contactPerson,
      siteContactNo: site.contactNo,
      siteEmailId: site.emailId,
      siteAddress: site.address,
      sitePincode: site.pincode || site.sitePincode || "",
      siteCity: site.city,
      siteState: site.state,
      country: site.country,
      sitezonename: site.locationName,
      cc_branch_name: site.cc_branch_name,
      cc_site_hours: site.cc_site_hours,
      cc_total_manpower: site.cc_total_manpower,
      attendanceUploadType: site.attendanceUploadType || "",

      latitude: site.officeLatitude,
      longitude: site.officeLongitude,
      billingAddress: site.billingAddress,
      locationStartDate: site.locationStartDate,
      locationEndDate: site.locationEndDate,
      salesPersonName: site.salesPerson,
      salesPersonEmailId: site.salesPersonEmail,
      salesPersonContactNo: site.salesPersonPhone,
      billCycleDate: site.billCycleDate,
      expectedBillingAmount: site.estimatedBillingAmount,
      daysForBilling: site.billingNoDays,
      cgst: site.cgst,
      sgst: site.sgst,
      igst: site.igst,
      ponumber: site.poNumber,

      // Fix: DB se integer (1/0) ya boolean aata hai, string "1" se compare nahi karna
      viewOTHours: Number(site.displayOT) === 1 || site.displayOT === true,
      attachWagesSHeet:
        Number(site.attachWages) === 1 || site.attachWages === true,
      roundOffAmount:
        Number(site.convertDecimal) === 1 || site.convertDecimal === true,
      billWithoutRank:
        Number(site.billWithoutRank) === 1 || site.billWithoutRank === true,
      nonComplianceSite:
        Number(site.nonCompliance) === 1 || site.nonCompliance === true,
      applyLeave: Number(site.applyLeave) === 1 || site.applyLeave === true,

      rates: (site.rates || []).map((rate) => ({
        id: rate.id || "",
        empType: rate.empType || "",
        // Fix: DB me Decimal(18,2) format me 8.00 store hai, parseInt se "8" bnega jo dropdown se match hoga
        hours: rate.hours ? String(parseInt(Number(rate.hours))) : "",
        nos: rate.nos || "",
        basic: rate.basic || "",
        hra: rate.hra || "",
        da: rate.da || "",
        specialAllowance: rate.specialAllowance || "",
        otherAllowance: rate.otherAllowance || "",
        lww: rate.lww || "",
        bonus: rate.bonus || "",
        gross: rate.gross || "",
        serviceChargeType: rate.serviceChargeType || "",
        serviceCharge: rate.serviceCharge || "",
        perDayRate: rate.perDayRate || "",
        otRate: rate.otRate || "",
        leaveWages: rate.leaveWages || "",
        uniformWashing: rate.uniformWashing || "",
        anyOther: rate.anyOther || "",
      })),

      otherCharges: (site.additionalCharges || site.otherCharges || []).map(
        (charge) => ({
          id: charge.id || "",
          serviceType: charge.typeOfService || charge.serviceType || "",
          chargesType: charge.countServices || charge.chargesType || "Rs",
          charges: charge.chargesServices ?? charge.charges ?? "",
          calculateOn: charge.calculateOn || "",
          condition: charge.operator || charge.condition || "",
          amountRange: charge.compareValue || charge.amountRange || "",
        }),
      ),
    });
  }, [site, reset]);

  // const onUpdateSite = async (data) => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     const upperData = toUpperCaseData(data);

  //     const formData = new FormData();

  //     formData.append("id", site.id);
  //     formData.append("clientId", site.clientId);

  //     formData.append("siteName", upperData.siteName || "");
  //     formData.append("siteId", upperData.site_id || "");
  //     formData.append("workOrderNo", upperData.workOrderNo || "");

  //     formData.append("contactPerson", upperData.siteContactPerson || "");

  //     formData.append("contactNo", upperData.siteContactNo || "");

  //     formData.append("emailId", upperData.siteEmailId || "");

  //     formData.append("address", upperData.siteAddress || "");

  //     formData.append("city", upperData.siteCity || "");

  //     formData.append("state", upperData.siteState || "");

  //     formData.append("country", upperData.country || "");

  //     formData.append("pincode", upperData.sitePincode || "");

  //     formData.append("locationName", upperData.sitezonename || "");
  //     formData.append("cc_branch_name", upperData.cc_branch_name || "");
  //     formData.append("cc_site_hours", upperData.cc_site_hours || "");
  //     formData.append("cc_total_manpower", upperData.cc_total_manpower || "");

  //     formData.append("officeLatitude", upperData.latitude || "");

  //     formData.append("officeLongitude", upperData.longitude || "");

  //     formData.append("billingAddress", upperData.billingAddress || "");

  //     formData.append("locationStartDate", upperData.locationStartDate || "");

  //     formData.append("locationEndDate", upperData.locationEndDate || "");

  //     formData.append("salesPerson", upperData.salesPersonName || "");

  //     formData.append("salesPersonEmail", upperData.salesPersonEmailId || "");

  //     formData.append("salesPersonPhone", upperData.salesPersonContactNo || "");

  //     formData.append("billCycleDate", upperData.billCycleDate || "");

  //     formData.append(
  //       "estimatedBillingAmount",
  //       upperData.expectedBillingAmount || 0,
  //     );

  //     formData.append("billingNoDays", upperData.daysForBilling || 0);

  //     formData.append("cgst", upperData.cgst || 0);

  //     formData.append("sgst", upperData.sgst || 0);

  //     formData.append("igst", upperData.igst || 0);

  //     formData.append("poNumber", upperData.ponumber || "");

  //     // Guarantee that gross is correctly calculated before submitting
  //     const cleanedRates = (upperData.rates || []).map((rate) => {
  //       const gross =
  //         (parseFloat(rate.basic) || 0) +
  //         (parseFloat(rate.hra) || 0) +
  //         (parseFloat(rate.da) || 0) +
  //         (parseFloat(rate.specialAllowance) || 0) +
  //         (parseFloat(rate.otherAllowance) || 0) +
  //         (parseFloat(rate.lww) || 0) +
  //         (parseFloat(rate.bonus) || 0);
  //       return {
  //         ...rate,
  //         gross: gross,
  //       };
  //     });
  //     formData.append("rates", JSON.stringify(cleanedRates));

  //     // Fix: otherCharges me react-select ka {value, label} object hai,
  //     // backend ke liye plain string extract karke bhejte hain
  //     const cleanedOtherCharges = (data.otherCharges || []).map((charge) => ({
  //       id: charge.id || "",
  //       serviceType: charge.serviceType?.value || charge.serviceType || "",
  //       chargesType: charge.chargesType || "Rs",
  //       charges: charge.charges || "",
  //       calculateOn: charge.calculateOn?.value || charge.calculateOn || "",
  //       condition: charge.condition?.value || charge.condition || "",
  //       amountRange: charge.amountRange || "",
  //     }));
  //     formData.append("otherCharges", JSON.stringify(cleanedOtherCharges));

  //     // Fix: toUpperCaseData boolean ko "TRUE"/"FALSE" string bana deta hai
  //     // Backend sql.Bit ke liye "1"/"0" string chahiye
  //     formData.append("viewOTHours", data.viewOTHours ? "1" : "0");
  //     formData.append("attachWagesSHeet", data.attachWagesSHeet ? "1" : "0");
  //     formData.append("roundOffAmount", data.roundOffAmount ? "1" : "0");
  //     formData.append("billWithoutRank", data.billWithoutRank ? "1" : "0");
  //     formData.append("nonComplianceSite", data.nonComplianceSite ? "1" : "0");
  //     formData.append("applyLeave", data.applyLeave ? "1" : "0");

  //     if (data.c_attachement?.[0]) {
  //       formData.append("c_attachement", data.c_attachement[0]);
  //     }

  //     console.log("update site");

  //     await axios.put(
  //       `${API_URL}/api/clients/update-sites/${site.id}`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );

  //     alert("Site Updated Successfully");

  //     navigate(`/client/add`, { state: { clientId, step: 4 } });
  //   } catch (err) {
  //     console.error(err);

  //     alert(err.response?.data?.message || "Failed To Update Site");
  //   }
  // };
  const onUpdateSite = async (data) => {
    try {
      const token = localStorage.getItem("token");

      console.log("========== EDIT SITE UPDATE START ==========");

      // 1. Location state se aaya hua complete site object
      console.log("1. site object from location.state:", site);

      console.log("2. site.id (API route ID):", site?.id);
      console.log("3. site.clientId:", site?.clientId);
      console.log("4. site.siteId (DB new_site_id):", site?.siteId);
      console.log("5. site.siteName:", site?.siteName);

      // 2. Form submit hone ke baad ka original data
      console.log("6. Original form data:", data);

      // 3. Uppercase/trim ke baad ka data
      const upperData = toUpperCaseData(data);

      console.log("7. Uppercase form data:", upperData);

      // 4. Important IDs before FormData
      console.log("8. FormData id will be:", site?.id);
      console.log("9. FormData clientId will be:", site?.clientId);
      console.log("10. FormData siteId will be:", upperData?.site_id);

      const formData = new FormData();

      formData.append("id", site.id);
      formData.append("clientId", site.clientId);

      formData.append("siteName", upperData.siteName || "");
      formData.append("siteId", upperData.site_id || "");
      formData.append("workOrderNo", upperData.workOrderNo || "");

      formData.append("contactPerson", upperData.siteContactPerson || "");
      formData.append("contactNo", upperData.siteContactNo || "");
      formData.append("emailId", upperData.siteEmailId || "");
      formData.append("address", upperData.siteAddress || "");
      formData.append("city", upperData.siteCity || "");
      formData.append("state", upperData.siteState || "");
      formData.append("country", upperData.country || "");
      formData.append("pincode", upperData.sitePincode || "");

      formData.append("locationName", upperData.sitezonename || "");
      formData.append("cc_branch_name", upperData.cc_branch_name || "");
      formData.append("cc_site_hours", upperData.cc_site_hours || "");
      formData.append("cc_total_manpower", upperData.cc_total_manpower || "");
      formData.append(
  "attendanceUploadType",
  upperData.attendanceUploadType || "",
);

      formData.append("officeLatitude", upperData.latitude || "");
      formData.append("officeLongitude", upperData.longitude || "");

      formData.append("billingAddress", upperData.billingAddress || "");
      formData.append("locationStartDate", upperData.locationStartDate || "");
      formData.append("locationEndDate", upperData.locationEndDate || "");

      formData.append("salesPerson", upperData.salesPersonName || "");
      formData.append("salesPersonEmail", upperData.salesPersonEmailId || "");
      formData.append("salesPersonPhone", upperData.salesPersonContactNo || "");

      formData.append("billCycleDate", upperData.billCycleDate || "");

      formData.append(
        "estimatedBillingAmount",
        upperData.expectedBillingAmount || 0,
      );

      formData.append("billingNoDays", upperData.daysForBilling || 0);

      formData.append("cgst", upperData.cgst || 0);
      formData.append("sgst", upperData.sgst || 0);
      formData.append("igst", upperData.igst || 0);

      formData.append("poNumber", upperData.ponumber || "");

      const cleanedRates = (upperData.rates || []).map((rate) => {
        const gross =
          (parseFloat(rate.basic) || 0) +
          (parseFloat(rate.hra) || 0) +
          (parseFloat(rate.da) || 0) +
          (parseFloat(rate.specialAllowance) || 0) +
          (parseFloat(rate.otherAllowance) || 0) +
          (parseFloat(rate.lww) || 0) +
          (parseFloat(rate.bonus) || 0);

        return {
          ...rate,
          gross: gross,
        };
      });

      formData.append("rates", JSON.stringify(cleanedRates));

      const cleanedOtherCharges = (data.otherCharges || []).map((charge) => ({
        id: charge.id || "",
        serviceType: charge.serviceType?.value || charge.serviceType || "",
        chargesType: charge.chargesType || "Rs",
        charges: charge.charges || "",
        calculateOn: charge.calculateOn?.value || charge.calculateOn || "",
        condition: charge.condition?.value || charge.condition || "",
        amountRange: charge.amountRange || "",
      }));

      formData.append("otherCharges", JSON.stringify(cleanedOtherCharges));

      formData.append("viewOTHours", data.viewOTHours ? "1" : "0");
      formData.append("attachWagesSHeet", data.attachWagesSHeet ? "1" : "0");
      formData.append("roundOffAmount", data.roundOffAmount ? "1" : "0");
      formData.append("billWithoutRank", data.billWithoutRank ? "1" : "0");
      formData.append("nonComplianceSite", data.nonComplianceSite ? "1" : "0");
      formData.append("applyLeave", data.applyLeave ? "1" : "0");

      if (data.c_attachement?.[0]) {
        formData.append("c_attachement", data.c_attachement[0]);
      }

      // ==========================================
      // FINAL API REQUEST DEBUG
      // ==========================================

      const updateUrl = `${API_URL}/api/clients/update-sites/${site.id}`;

      console.log("========== FINAL API REQUEST ==========");
      console.log("11. HTTP Method:", "PUT");
      console.log("12. API URL:", updateUrl);
      console.log("13. Route site.id:", site.id);
      console.log("14. FormData id:", formData.get("id"));
      console.log("15. FormData clientId:", formData.get("clientId"));
      console.log("16. FormData siteId:", formData.get("siteId"));
      console.log("17. FormData siteName:", formData.get("siteName"));
      console.log("18. FormData workOrderNo:", formData.get("workOrderNo"));
      console.log("19. FormData rates:", formData.get("rates"));
      console.log("20. FormData otherCharges:", formData.get("otherCharges"));

      console.log("========== COMPLETE FORMDATA ==========");

      for (const [key, value] of formData.entries()) {
        if (key === "c_attachement") {
          console.log(key, value?.name || value);
        } else {
          console.log(key, value);
        }
      }

      console.log("========== SENDING API REQUEST ==========");

      await axios.put(updateUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("========== API UPDATE SUCCESS ==========");
      console.log("Site updated successfully.");
      console.log("Updated route ID:", site.id);
      console.log("Updated Site ID:", formData.get("siteId"));

      alert("Site Updated Successfully");

      // navigate(`/client/add`, { state: { clientId, step: 4 } });
      navigate("/client/add", {
        state: {
          clientId,
          step: 3,
        },
      });
    } catch (err) {
      console.error("========== API UPDATE ERROR ==========");
      console.error("Error:", err);
      console.error("Response:", err.response);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      console.error("Response message:", err.response?.data?.message);

      alert(err.response?.data?.message || "Failed To Update Site");
    }
  };

  if (!site) {
    return <div className="alert alert-danger">Site data not found.</div>;
  }

  return (
    <div className="card form-panel">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onUpdateSite)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
        >
          <SiteDetailsStep
            isEdit={true}
            siteId={site.id}
            previousStep={() => window.history.back()}
            onCancel={() =>
              navigate("/client/add", { state: { clientId, step: 3 } })
            }
          />
          <button
            id="clientFormSubmit"
            type="submit"
            style={{ display: "none" }}
          >
            Update
          </button>
        </form>
      </FormProvider>
    </div>
  );
}

export default EditSitePage;
