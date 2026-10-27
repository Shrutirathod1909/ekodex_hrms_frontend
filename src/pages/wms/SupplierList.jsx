import React from "react";
import {
  FaSearch,
  FaSyncAlt,
  FaFileExcel,
  FaPlus,
  FaUpload,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaTrashRestore,
  FaUndo,
} from "react-icons/fa";

const SupplierList = ({
  suppliers,
  totalCount,
  currentPage,
  itemsPerPage,
  onPageChange,
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleReset,
  handleExport,
  handleEdit,
  handleDelete,
  handleRestore,
  setShowForm,
  statusTab,
  handleTabChange,
  handleDownloadTemplate,
  fileInputRef,
}) => {
  return (
    <>
      {/* HEADER */}
      <style>{`.table-responsive{
          overflow: clip;
      }`}</style>
      <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="page-title m-0">
          Supplier Management{" "}
          <span className="text-success fw-semibold">({totalCount})</span>
        </h3>

        <div className="d-flex gap-2">
          {/* DOWNLOAD TEMPLATE */}
          <button
            className="btn btn-warning btn-sm"
            onClick={handleDownloadTemplate}
          >
            Download Template
          </button>

          {/* BULK UPLOAD */}
          <button
            className="btn btn-info btn-sm"
            onClick={() => fileInputRef.current.click()}
          >
            <FaUpload className="me-1" />
            Bulk Upload
          </button>

          {/* ADD SUPPLIER */}
          <button
            className="btn btn-dark rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <FaPlus size={12} />
            Add Supplier
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="input-group" style={{ maxWidth: "550px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
                handleSearch();
              }}
            />

            <button className="btn btn-primary" onClick={handleSearch}>
              <FaSearch />
            </button>

            <button className="btn btn-secondary" onClick={handleReset}>
              <FaSyncAlt />
            </button>

            <button className="btn btn-success" onClick={handleExport}>
              <FaFileExcel />
            </button>
          </div>

          {/* STATUS BUTTONS */}
          <div className="d-flex gap-2">
            <button
              className={`btn ${
                statusTab === "active" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => handleTabChange("active")}
            >
              Active
            </button>

            <button
              className={`btn ${
                statusTab === "inactive" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => handleTabChange("inactive")}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="table-dark">
              <tr>
                <th>Sr. No</th>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th width="80">Action</th>
              </tr>
            </thead>

            <tbody>
              {suppliers?.length > 0 ? (
                suppliers.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>{item.supplier_name}</td>

                    <td>{item.contact_person_name}</td>

                    <td>{item.phone}</td>

                    <td>{item.email}</td>

                    <td>{item.city}</td>

                    {/* DROPDOWN ACTION */}
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-primary btn-sm dropdown-toggle px-3"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Action
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2"
                              onClick={() => handleEdit(item)}
                            >
                              <FaEdit className="text-primary" />
                              Edit
                            </button>
                          </li>
                          {item.active == 0 && (
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <FaTrash />
                                Delete
                              </button>
                            </li>
                          )}
                          {item.active == 1 && (
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                onClick={() => handleRestore(item.id)}
                              >
                                <FaTrashRestore className="me-2" />
                                Restore
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No Suppliers Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* PAGINATION CONTROLS */}
        {suppliers.length > 0 && (
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination pagination-sm">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(currentPage - 1)}
                >
                  Prev
                </button>
              </li>

              {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }).map(
                (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => onPageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ),
              )}

              <li
                className={`page-item ${currentPage === Math.ceil(totalCount / itemsPerPage) ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
};

export default SupplierList;
