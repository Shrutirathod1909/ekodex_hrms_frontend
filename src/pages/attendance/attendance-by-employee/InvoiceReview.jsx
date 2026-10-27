import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
function InvoiceReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // const { siteId, month, year, type, billingDays } = location.state || {};
  const { siteId, month, year, clientId, companyName, type, billingDays } =
    location.state || {};

  // Add this inside your component
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      if (!siteId) {
        navigate("/attendance/attendance-by-employee");
        return;
      }
      fetchInvoice();
    }
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/billing/create`,
        {
          site: siteId,
          m: month,
          y: year,
          type,
          billingDays,
          clientId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = response.data;
      console.log("Billing created data:", data);
      setInvoiceData(data);

      console.log("========== EMP WAGES PF ==========");
      console.log("Total Employees:", data?.empWagesPf?.total_nos);
      console.log("Total PF:", data?.empWagesPf?.totalpf);
      console.log("==================================");

      console.log("========== WAGES DATA ==========");

      data.wages.forEach((emp, index) => {
        console.log(`Employee ${index + 1}:`, {
          emp_code: emp.emp_code,
          emp_name: emp.emp_name,
          rank: emp.rank,
          month_days: emp.month_days,
          present_days: emp.present_days,
          net_days: emp.net_days,
          per_day_rate: emp.per_day_rate,
          emp_ctc: emp.emp_ctc,
          emp_service_charges: emp.emp_service_charges,
          emp_ictc: emp.emp_ictc,
          emp_gst: emp.emp_gst,
          emp_invoice_amount: emp.emp_invoice_amount,
        });
      });

      console.log("================================");

      const grouped = {};

      data.wages.forEach((emp) => {
        const rank = emp.rank || "Others";

        if (!grouped[rank]) {
          grouped[rank] = {
            itemDescription: rank.replace(/([A-Z])/g, " $1").trim(),
            hsn: "",
            qty: 0,
            rate: Number(emp.rank_rate || 0),
            amount: 0,
          };
        }

        // grouped[rank].qty += Number(emp.net_days || 0);
        grouped[rank].qty += Number(emp.net_days || 0);
        grouped[rank].amount += Number(emp.earned_gross || 0);
      });

      console.log("========== RANK WISE TOTAL ==========");

      Object.entries(grouped).forEach(([rank, data]) => {
        console.log(rank, {
          qty: data.qty,
          rate: data.rate,
          amount: data.amount,
        });
      });

      console.log("=====================================");

      const rows = Object.values(grouped);

      // Add PF charges below all employee/rank rows

const totalPf = (data?.wages || []).reduce(
  (sum, emp) => sum + Number(emp.emp_pf || 0),
  0
);

const totalEmployees = (data?.wages || []).filter(
  (emp) => Number(emp.emp_pf || 0) > 0
).length;

rows.push({
  itemDescription: "PF charges",
  hsn: "",
  qty: totalEmployees,
  rate: "",
  amount: totalPf.toFixed(2),
});

const bonusCount = Number(data?.empWagesBonus?.total_nos || 0);
const bonusAmount = Number(data?.empWagesBonus?.totalbonus || 0);

// Bonus amount 0 असेल तर row दाखवू नका
if (bonusAmount > 0) {
  rows.push({
    itemDescription: "Bonus charges",
    hsn: "",
    qty: bonusCount,
    rate: bonusCount > 0
      ? (bonusAmount / bonusCount).toFixed(2)
      : "",
    amount: bonusAmount.toFixed(2),
  });
}

      rows.push({
        itemDescription: "Service Charges",
        hsn: "",
        qty: data?.empWagesServiceCharges?.total_nos || 0,
        rate: "",
        amount: Number(
          data?.empWagesServiceCharges?.totalservice_charges || 0,
        ).toFixed(2),
      });

      rows.push({
        itemDescription: "PT charges",
        hsn: "",
        qty: data?.empWagesPt?.total_nos || 0,
        rate: "",
        amount: Number(data?.empWagesPt?.totalpt || 0).toFixed(2),
      });

      rows.push({
        itemDescription: "OT charges",
        hsn: "",
        qty: data?.empWagesOt?.totalotdays || 0,
        rate: data?.empWagesOt?.ot_rate || 0,
        amount: Number(data?.empWagesOt?.totalot || 0).toFixed(2),
      });

      rows.push({
        itemDescription: "ESIC charges",
        hsn: "",
        qty: data?.empWagesEsic?.total_nos ?? 0,
        rate: "",
        amount: Number(data?.empWagesEsic?.totalesic || 0).toFixed(2),
      });

      // At Actual Charges
      rows.push({
        // itemDescription: data?.atActualCharges?.charges_type || "",
        itemDescription:"Handling Charges",
        hsn: "",
        qty: "",
        rate: "",
        amount: Number(data?.atActualCharges?.total || 0).toFixed(2),
      });

      while (rows.length < 12) {
        rows.push({
          itemDescription: "",
          hsn: "",
          qty: "",
          rate: "",
          amount: "",
        });
      }

      setInvoiceRows(rows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...invoiceRows];
    updated[index][field] = value;
    setInvoiceRows(updated);
  };

  const grossAmount = useMemo(() => {
    return invoiceRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }, [invoiceRows]);

  if (loading) return <div className="container mt-5">Loading Invoice...</div>;

  if (!invoiceData)
    return <div className="container mt-5">No Invoice Data Found</div>;

  const site = invoiceData.site;
  const client = invoiceData.client;
  const billingCompany = invoiceData.billingCompany;

  const handleGenerateFinal = async () => {
    try {
      setSubmitting(true);

      const payload = {
        client_id: Number(client.client_id || client.id),
        rate_id: Number(site.site_id || site.id),

        invoice_no: invoiceData.invoice_no,
        invoice_month: month,
        invoice_year: year,

        billing_type: type,
        month_days: Number(invoiceData?.wages[0]?.month_days || 0),

        bill_title: `Manpower Services for ${month}/${year}`,

        cgst: 0,
        cgst_perc: 0,
        sgst: 0,
        sgst_perc: 0,
        igst: 0,
        igst_perc: 0,

        total_cost_without_gst: grossAmount,
        final_amount: grossAmount,

        invoice_from: `${year}-${String(month).padStart(2, "0")}-01`,
        invoice_to: new Date(year, month, 0).toISOString().split("T")[0],

        items: invoiceRows
          .filter((row) => row.itemDescription && Number(row.amount) > 0)
          .map((row) => ({
            type: row.itemDescription,
            total_nos: Number(row.qty || 0),
            cost_per_head: Number(row.rate || 0),
            total: Number(row.amount || 0),
          })),
      };

      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (key === "items") {
          formData.append("items", JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Attach files
      console.log("Files State:", files);

      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          console.log("Appending:", file.name);

          formData.append(file.name, file);
        });
      }

      const response = await axios.post(
        `${API_URL}/api/billing/generate-final`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        alert("Invoice Generated Successfully");

        navigate("/billing/billing", {
          state: {
            invoice_no: response.data.invoice_no,
            auto_no: response.data.auto_no,
          },
        });
      }
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to generate invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="container-fluid p-3"
      style={{
        background: "#eef2f5",
        minHeight: "100vh",
      }}
    >
      {/* Buttons */}

      <div className="d-flex justify-content-end gap-2 mb-3">
        <button
          className="btn btn-primary"
          onClick={handleGenerateFinal}
          disabled={submitting}
        >
          {submitting ? "Generating..." : "Generate Final"}
        </button>
        <button className="btn btn-success" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>

      {/* Invoice Card */}

      <div className="card shadow-sm border-0">
        <div className="card-body p-2">
          {/* Header */}

          <h3 className="text-center fw-bold">TAX INVOICE</h3>

          <h1
            className="text-center text-danger fw-bold"
            style={{ fontSize: "42px" }}
          >
            {billingCompany?.company_name || "Company Name Not Found"}
          </h1>

          <div
            className="border p-1 text-center mb-1"
            style={{ fontSize: "12px" }}
          >
            SPECIALISED IN PROVIDING ALL TYPES OF SKILLED AND UNSKILLED LABOUR
            SUPPLIER IN MIDC & WAREHOUSE AREAS AT PAN INDIA LEVEL SINCE 12 YRS
          </div>

          <div className="border mb-1">
            <div
              className="text-center fw-bold p-1"
              style={{ fontSize: "13px", backgroundColor: "#e9ecef" }}
            >
              {billingCompany?.address || "Address Not Found"}
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div className="fw-bold p-1" style={{ fontSize: "13px" }}>
                E-mail : {billingCompany?.email_id || ""}
              </div>

              <div className="fw-bold p-1" style={{ fontSize: "13px" }}>
                Ph.: {billingCompany?.phone || ""}
              </div>
            </div>

            <div
              className="text-center fw-bold p-1 "
              style={{ fontSize: "13px", backgroundColor: "#e9ecef" }}
            >
              GSTIN: {billingCompany?.gst_no || ""}
            </div>
          </div>

          {/* Attach Supportings Section */}
          <div className="row mb-3">
            <div className="col-lg-12">
              <div className="form-group border p-2">
                <label className="fw-bold mb-1">Attach Supportings</label>
                <input
                  type="file"
                  name="userfile[]"
                  id="image_file"
                  accept=".png,.jpg,.jpeg,.gif,.pdf"
                  multiple
                  className="form-control"
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
            </div>
          </div>

          {/* Client Details */}

          <div className="row">
            <div className="col-md-8">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th colSpan="2" className="text-center">
                      Billing Client Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td width="120">
                      <strong>Name</strong>
                    </td>
                    <td>{client?.company_name || ""}</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>Address</strong>
                    </td>
                    <td>{client?.client_add || ""}</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>GSTIN</strong>
                    </td>
                    <td>{client?.client_gst_no || "N/A"}</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>ATTN</strong>
                    </td>
                    <td>{client?.contact_person || "Authorized Person"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-md-4">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th colSpan="2" className="text-center">
                      Invoice Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Invoice No</td>
                    <td>{invoiceData.invoice_no}</td>
                  </tr>

                  <tr>
                    <td>Invoice Date</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>

                  <tr>
                    <td>Invoice Type</td>
                    <td>State</td>
                  </tr>

                  <tr>
                    <td>Site Name</td>
                    <td>{site.site_name}</td>
                  </tr>

                  <tr>
                    <td>Service Period</td>
                    <td>
                      {month}/{year}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Table */}

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th width="70">Sr.</th>
                  <th>Item Description</th>
                  <th width="120">HSN/SAC</th>
                  <th width="140">QTY/DAY</th>
                  <th width="140">Rate</th>
                  <th width="180">Net Amount</th>
                </tr>
              </thead>

              <tbody>
                {invoiceRows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    <td>
                      <input
                        className="form-control"
                        value={row.itemDescription || ""}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "itemDescription",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={row.hsn || ""}
                        onChange={(e) =>
                          handleRowChange(index, "hsn", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={row.qty ?? ""}
                        onChange={(e) =>
                          handleRowChange(index, "qty", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={row.rate ?? ""}
                        onChange={(e) =>
                          handleRowChange(index, "rate", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={row.amount || ""}
                        onChange={(e) =>
                          handleRowChange(index, "amount", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}

          <div className="row justify-content-end">
            <div className="col-md-4">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Summary</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>

                  
                  <tr className="fw-bold">
                    <td>Grand Total</td>
                    <td>
                      ₹
                      {grossAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceReview;
