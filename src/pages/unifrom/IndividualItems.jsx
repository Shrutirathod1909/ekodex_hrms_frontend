import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const IndividualItems = ({ filters = {} }) => {
  const [items, setItems] = useState([]);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/uniform`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data =
        res.data?.recordset ||
        res.data?.data ||
        res.data ||
        [];

      // ================= FILTER ONLY INDIVIDUAL ITEMS =================
      let filtered = data.filter(
        (item) =>
          (item.type_issued || "").trim().toUpperCase() ===
          "ISSUED TO INDIVIDUAL ITEMS"
      );

      // ================= SEARCH =================
      if (filters.keyword) {
        filtered = filtered.filter((item) => {
          const keyword = filters.keyword.toLowerCase();

          if (filters.searchBy === "employee") {
            return (item.employee_name || "")
              .toLowerCase()
              .includes(keyword);
          }

          if (filters.searchBy === "code") {
            return (item.employee_code || "")
              .toLowerCase()
              .includes(keyword);
          }

          if (filters.searchBy === "item") {
            return (item.item_name || "")
              .toLowerCase()
              .includes(keyword);
          }

          return true;
        });
      }

      // ================= DATE FILTER =================
      if (filters.fromDate && filters.toDate) {
        filtered = filtered.filter((item) => {
          if (!item.issue_date) return false;

          const issueDate = new Date(item.issue_date);
          const from = new Date(filters.fromDate);
          const to = new Date(filters.toDate);

          // END DATE FULL DAY
          to.setHours(23, 59, 59, 999);

          return issueDate >= from && issueDate <= to;
        });
      }

      setItems(filtered);

    } catch (err) {
      console.log("API Error:", err.response?.data || err.message);
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
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>{item.employee_name}</td>

                    <td>{item.employee_code}</td>

                    <td>{item.item_name}</td>

                    <td>{item.sku_code}</td>

                    <td>{item.qty}</td>

                    <td>
                      {item.issue_date
                        ? new Date(item.issue_date).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                    <td>{item.transfer_by}</td>

                    <td>{item.client_name}</td>

                    <td>{item.site_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No Data Found
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

export default IndividualItems;