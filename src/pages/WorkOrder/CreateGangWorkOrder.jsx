import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CreateGangWorkOrder({ onClose }) {
  const initialRows = Array.from({ length: 15 }, (_, i) => ({
    srNo: i + 1,
    serviceDescription: "",
    rate: "",
    netAmount: ""
  }));

  const [rows, setRows] = useState(initialRows);
  const [clientCompany, setClientCompany] = useState("");
  const [selectSite, setSelectSite] = useState("");
  const [workOrderDate, setWorkOrderDate] = useState("2026-06-16");
  const [workOrderNo, setWorkOrderNo] = useState("");

  const colors = {
    primaryTheme: "#00a2c2",
    searchDark: "#1a4080"
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  return (
    <div
      className="container-fluid bg-light px-3 py-2"
      style={{
        minHeight: "100vh",
        fontSize: "11px"
      }}
    >

      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0" style={{ fontSize: "15px" }}>
          Create Gang Work Order
        </h5>

        <button
          className="btn btn-sm text-white"
          style={{ backgroundColor: colors.primaryTheme }}
          onClick={onClose}
        >
          Go Back
        </button>
      </div>

      {/* ================= FORM ================= */}
      <div className="bg-white p-3 border rounded mb-3">
        <div className="row g-3">

          <div className="col-md-3">
            <label className="form-label">Client/Company</label>
            <select
              className="form-select form-select-sm"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
            >
              <option>Select</option>
              <option>Client 1</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Select Site</label>
            <select
              className="form-select form-select-sm"
              value={selectSite}
              onChange={(e) => setSelectSite(e.target.value)}
            >
              <option>Select</option>
              <option>Site 1</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Work Order Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={workOrderDate}
              onChange={(e) => setWorkOrderDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Work Order No</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={workOrderNo}
              onChange={(e) => setWorkOrderNo(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* ================= TABLE (NO SCROLL) ================= */}
      <div className="bg-white border rounded">
        <table className="table table-sm table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "60px" }}>Sr No</th>
              <th>Service Description</th>
              <th>Rate</th>
              <th>Net Amount</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={row.srNo}>
                <td>{row.srNo}</td>

                <td>
                  <input
                    className="form-control form-control-sm"
                    value={row.serviceDescription}
                    onChange={(e) =>
                      handleInputChange(index, "serviceDescription", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="form-control form-control-sm"
                    value={row.rate}
                    onChange={(e) =>
                      handleInputChange(index, "rate", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="form-control form-control-sm"
                    value={row.netAmount}
                    onChange={(e) =>
                      handleInputChange(index, "netAmount", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="d-flex justify-content-center gap-2 mt-3">
        <button
          className="btn btn-sm text-white"
          style={{ backgroundColor: colors.searchDark }}
        >
          Create Gang Work Order
        </button>

        <button
          className="btn btn-sm text-white"
          style={{ backgroundColor: colors.primaryTheme }}
        >
          Cancel
        </button>
      </div>

    </div>
  );
}