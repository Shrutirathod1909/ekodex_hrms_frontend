import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const FreeUniform = ({ filters = {} }) => {
  const [data, setData] = useState([]);

  // ✅ FILTER CHANGE ZALYAVAR FETCH
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/uniform`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const all =
        res.data?.data ||
        res.data?.recordset ||
        [];

      // ✅ ONLY FREE UNIFORM
      let filtered = all.filter(
        (i) =>
          (i.type_issued || "")
            .trim()
            .toUpperCase() === "ISSUED FREE UNIFORM"
      );

      // ================= SEARCH =================
      if (filters.keyword) {

        filtered = filtered.filter((i) => {

          // Employee Search
          if (filters.searchBy === "employee") {
            return (i.employee_name || "")
              .toLowerCase()
              .includes(filters.keyword.toLowerCase());
          }

          // Employee Code Search
          if (filters.searchBy === "code") {
            return (i.employee_code || "")
              .toLowerCase()
              .includes(filters.keyword.toLowerCase());
          }

          // Item Search
          if (filters.searchBy === "item") {
            return (i.item_name || "")
              .toLowerCase()
              .includes(filters.keyword.toLowerCase());
          }

          return true;
        });
      }

      // ================= DATE FILTER =================
      if (filters.fromDate && filters.toDate) {

        filtered = filtered.filter((i) => {

          const issueDate =
            new Date(i.issue_date)
              .toISOString()
              .split("T")[0];

          return (
            issueDate >= filters.fromDate &&
            issueDate <= filters.toDate
          );
        });
      }

      setData(filtered);

    } catch (err) {
      console.log(
        "ERROR:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">

          <table className="table table-bordered table-hover mb-0">

            <thead className="table-dark">
              <tr>
                <th>SR</th>
                <th>Employee Name</th>
                <th>Employee Code</th>
                <th>Item Name</th>
                <th>SKU Code</th>
                <th>Qty</th>
                <th>Issue Date</th>
                <th>Transfer By</th>
                <th>Client</th>
                <th>Site</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.employee_name}</td>
                    <td>{item.employee_code}</td>
                    <td>{item.item_name}</td>
                    <td>{item.sku_code}</td>
                    <td>{item.qty}</td>

                    <td>
                      {item.issue_date
                        ? new Date(
                            item.issue_date
                          ).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                    <td>{item.transfer_by}</td>
                    <td>{item.client_name}</td>
                    <td>{item.site_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center"
                  >
                    No Free Uniform Data Found
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
};

export default FreeUniform;