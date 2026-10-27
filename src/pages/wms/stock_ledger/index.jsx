import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { FaSearch, FaSyncAlt, FaFileExcel } from "react-icons/fa";

const StockLedger = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [ledgerData, setLedgerData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLedger();
  }, [currentPage, rowsPerPage]);

  const fetchLedger = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stock-ledger`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        params: { search: searchTerm, page: currentPage, limit: rowsPerPage },
      });
      setLedgerData(res.data.data || []);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching ledger:", err);
    }
  };

  return (
    <div className="container-fluid p-0 min-vh-100">
      {/* HEADER BLOCK */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          Stock Ledger
          <span className="text-success fw-semibold">({totalCount})</span>
        </h3>
      </div>

      {/* SEARCH PANEL */}
      <div
        className="card border-0 shadow-sm p-3 mb-4 bg-white"
        style={{ borderRadius: "12px" }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div
            className="d-flex align-items-center flex-grow-1"
            style={{ maxWidth: "550px" }}
          >
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by Product or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLedger()}
              />
              <button className="btn btn-primary" onClick={fetchLedger}>
                <FaSearch />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  fetchLedger();
                }}
              >
                <FaSyncAlt />
              </button>
              <button className="btn btn-success" title="Export Excel">
                <FaFileExcel />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="card border-0 shadow-sm p-0 rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>In</th>
                <th>Out</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.length > 0 ? (
                ledgerData.map((item, index) => (
                  <tr key={index}>
                    <td className="text-muted">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="fw-bold">{item.product_name}</td>
                    <td>
                      <span
                        className={`badge ${item.type === "IN" ? "bg-success" : "bg-danger"}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td>{item.in_qty}</td>
                    <td>{item.out_qty}</td>
                    <td className="fw-bold">{item.balance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="d-flex justify-content-between align-items-center mt-3 p-3">
        <div>
          Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount}{" "}
          entries
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0">Rows:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: "90px" }}
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            <li
              className={`page-item ${currentPage >= Math.ceil(totalCount / rowsPerPage) ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default StockLedger;
