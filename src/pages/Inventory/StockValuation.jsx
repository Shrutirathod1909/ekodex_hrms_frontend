import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  FaFileExcel,
  FaCalendarAlt,
  FaCalculator,
  FaFileCsv,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const StockValuation = () => {

  // =====================================================
  // STATES
  // =====================================================

  const [uptoDate, setUptoDate] =
    useState("");

  const [method, setMethod] =
    useState("Weighted Average");

  const [stockData, setStockData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchStockData = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await axios.get(

        `${API_URL}/api/inventory-report/export-json`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "API RESPONSE =>",
        response.data
      );

      const logs =
        response.data.data || [];

      // =====================================================
      // GROUP DATA
      // =====================================================

      const grouped = {};

      logs.forEach((item) => {

        const sku = item.sku_code;

        // =====================================================
        // METHOD RATE
        // =====================================================

        let rate = 0;

        let totalValue = 0;

        if (method === "FIFO") {

          rate =
            Number(item.fifo_rate || 0);

          totalValue =
            Number(item.fifo_value || 0);
        }

        else if (
          method === "Moving Average"
        ) {

          rate =
            Number(item.moving_average || 0);

          totalValue =
            Number(item.moving_value || 0);
        }

        else {

          rate =
            Number(item.weighted_average || 0);

          totalValue =
            Number(item.weighted_value || 0);
        }

        // =====================================================
        // FINAL GROUPED ROW
        // =====================================================

        grouped[sku] = {

          sku_code:
            item.sku_code,

          item_name:
            item.item_name,

          opening_qty:
            item.opening_qty,

          in_qty:
            item.in_qty,

          out_qty:
            item.out_qty,

          closing_qty:
            item.closing_qty,

          rate:
            rate.toFixed(2),

          total_value:
            Number(
              totalValue
            ).toFixed(2),
        };
      });

      const finalData =
        Object.values(grouped);

      console.log(
        "FINAL DATA =>",
        finalData
      );

      setStockData(finalData);

    } catch (error) {

      console.log(
        "FETCH ERROR =>",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    fetchStockData();

  }, [method]);

  // =====================================================
  // EXPORT EXCEL
  // =====================================================

  const handleExportExcel = () => {

    if (stockData.length === 0) {

      alert("No Data Found");

      return;
    }

    const excelData =
      stockData.map((item) => ({

        "SKU Code":
          item.sku_code,

        "Item Name":
          item.item_name,

        "Opening Qty":
          item.opening_qty,

        "In Qty":
          item.in_qty,

        "Out Qty":
          item.out_qty,

        "Closing Qty":
          item.closing_qty,

        "Rate":
          item.rate,

        "Total Value":
          item.total_value,
      }));

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      "Stock Valuation"
    );

    const excelBuffer =
      XLSX.write(workbook, {

        bookType: "xlsx",

        type: "array",
      });

    const data = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(

      data,

      `Stock_Valuation_${method}.xlsx`
    );
  };

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const handleExportCSV = () => {

    if (stockData.length === 0) {

      alert("No Data Found");

      return;
    }

    const headers = [

      "SKU Code",

      "Item Name",

      "Opening Qty",

      "In Qty",

      "Out Qty",

      "Closing Qty",

      "Rate",

      "Total Value"
    ];

    const rows =
      stockData.map((item) => [

        item.sku_code,

        item.item_name,

        item.opening_qty,

        item.in_qty,

        item.out_qty,

        item.closing_qty,

        item.rate,

        item.total_value
      ]);

    const csvContent =

      [headers, ...rows]

        .map((e) => e.join(","))

        .join("\n");

    const blob = new Blob(

      [csvContent],

      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    saveAs(

      blob,

      `Stock_Valuation_${method}.csv`
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="container-fluid p-4">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="card shadow border-0">

        <div className="card-header bg-primary text-white">

          <h4 className="mb-0">

            Latest Stock Valuation

          </h4>

        </div>

        <div className="card-body">

          <div className="row">

            {/* DATE */}

            <div className="col-md-3 mb-3">

              <label className="form-label fw-bold">

                <FaCalendarAlt className="me-2" />

                Upto Date

              </label>

              <input
                type="date"
                className="form-control"
                value={uptoDate}
                onChange={(e) =>
                  setUptoDate(
                    e.target.value
                  )
                }
              />

            </div>

            {/* METHOD */}

            <div className="col-md-3 mb-3">

              <label className="form-label fw-bold">

                <FaCalculator className="me-2" />

                Method Used

              </label>

              <select
                className="form-select"
                value={method}
                onChange={(e) =>
                  setMethod(
                    e.target.value
                  )
                }
              >

                <option>
                  Weighted Average
                </option>

                <option>
                  Moving Average
                </option>

                <option>
                  FIFO
                </option>

              </select>

            </div>

            {/* EXCEL */}

            <div className="col-md-3 d-flex align-items-end mb-3">

              <button
                className="btn btn-success w-100"
                onClick={
                  handleExportExcel
                }
              >

                <FaFileExcel className="me-2" />

                Export Excel

              </button>

            </div>

            {/* CSV */}

            <div className="col-md-3 d-flex align-items-end mb-3">

              <button
                className="btn btn-dark w-100"
                onClick={
                  handleExportCSV
                }
              >

                <FaFileCsv className="me-2" />

                Export CSV

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ===================================================== */}
      {/* TABLE */}
      {/* ===================================================== */}

      <div className="card mt-4 shadow border-0">

        <div className="card-header bg-light">

          <h5 className="mb-0">

            Stock Valuation Report

          </h5>

        </div>

        <div className="card-body table-responsive">

          {loading ? (

            <div className="text-center py-4">

              <h5>Loading...</h5>

            </div>

          ) : (

            <table className="table table-bordered table-hover">

              <thead className="table-dark">

                <tr>

                  <th>SKU Code</th>

                  <th>Item Name</th>

                  <th>Opening Qty</th>

                  <th>In Qty</th>

                  <th>Out Qty</th>

                  <th>Closing Qty</th>

                  <th>Rate</th>

                  <th>Total Value</th>

                </tr>

              </thead>

              <tbody>

                {stockData.length > 0 ? (

                  stockData.map(
                    (item, index) => (

                      <tr key={index}>

                        <td>
                          {item.sku_code}
                        </td>

                        <td>
                          {item.item_name}
                        </td>

                        <td>
                          {item.opening_qty}
                        </td>

                        <td>
                          {item.in_qty}
                        </td>

                        <td>
                          {item.out_qty}
                        </td>

                        <td>
                          {item.closing_qty}
                        </td>

                        <td>
                          ₹ {item.rate}
                        </td>

                        <td>
                          ₹ {item.total_value}
                        </td>

                      </tr>
                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="8"
                      className="text-center text-danger fw-bold"
                    >

                      No Data Found

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
};

export default StockValuation;