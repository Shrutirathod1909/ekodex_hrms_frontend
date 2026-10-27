import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const NewEmployee = ({ filters = {} }) => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================= FETCH =================
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/uniform`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data =
        res.data?.data ||
        res.data?.recordset ||
        (Array.isArray(res.data) ? res.data : []);

      let filtered = data.filter(
        (item) =>
          (item.type_issued || "").trim().toUpperCase() ===
          "ISSUED TO NEW EMPLOYEE"
      );

      // ================= SEARCH =================
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();

        filtered = filtered.filter((item) => {
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

          to.setHours(23, 59, 59, 999);

          return issueDate >= from && issueDate <= to;
        });
      }

      setAllData(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  return (
    <div className="container-fluid mt-3">
      <div className="card shadow-sm">
        <div className="card-body p-0">

          {loading ? (
            <div className="p-3 text-center">Loading...</div>
          ) : (
            <table className="table table-bordered mb-0">

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
                {allData.length > 0 ? (
                  allData.map((item, index) => (
                    <tr key={item.id || index}>
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
          )}

        </div>
      </div>
    </div>
  );
};

export default NewEmployee;