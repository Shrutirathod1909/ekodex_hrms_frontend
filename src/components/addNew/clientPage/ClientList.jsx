  import React, { useState, useMemo } from "react";
  import {
    Alert,
    Card,
    Table,
    Dropdown,
    Modal,
    Button,
    Row,
    Col,
    Spinner,
    Pagination, // Add this
  } from "react-bootstrap";
  import { FaEye, FaPen, FaTrashAlt, FaUndo } from "react-icons/fa";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import LoadingScreen from "../../loader/LoadingScreen";
  import AuditTrail from "../../common/AuditTrail";
  const ClientList = ({ clientPerms, clients, loading, fetchClients, activeStatus = 0 }) => {
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const navigate = useNavigate();
  // Logged-in user ID
  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const loggedInUserId = loggedInUser?.id;
  console.log("Logged-in user:", loggedInUser);
console.log("Logged-in user ID:", loggedInUserId);

    // const handleEdit = (clientId) => {
    //   navigate(`/client/add?clientId=${clientId}`);
    // };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Calculate total pages
    const totalPages = Math.ceil(clients.length / itemsPerPage);

    // Memoize the data slice for the current page
    const paginatedData = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return clients.slice(start, start + itemsPerPage);
    }, [clients, currentPage]);

    const handleEdit = (clientId) => {
      navigate(`/client/add`, { state: { clientId } });
    };

    const handleView = async (clientId) => {
      try {
        setViewLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/clients/${clientId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        // Accessing res.data.data based on your API structure
        setSelectedClient(res.data.data);
        // console.log("selectedClient", res.data);
        setShowViewModal(true);
      } catch (error) {
        console.error(error);
        alert("Failed to load client details");
      } finally {
        setViewLoading(false);
      }
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return "N/A";

      // Split by space to get ["2026-07-02", "7:00", "40"]
      const parts = dateString.split(" ");

      // If we have at least 2 parts, return "YYYY-MM-DD HH:mm"
      if (parts.length >= 2) {
        return `${parts[0]} ${parts[1]}`;
      }

      return dateString;
    };

    const handelDelete = async (clientId) => {
      // 1. Show the confirmation dialog
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this client?",
      );

      // 2. Proceed only if the user clicked "OK"
      if (!isConfirmed) {
        return;
      }

      console.log("Deleting client:", clientId);

      try {
        const token = localStorage.getItem("token");

        // 3. Using DELETE method (recommended for deletion)
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/clients/delete-client/${clientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        alert("Client deleted successfully.");
        // Optional: Refresh your data list here
        // Now it correctly calls the prop passed from the parent
        if (typeof fetchClients === "function") {
          fetchClients();
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert(
          "Failed to delete client: " +
            (err.response?.data?.message || err.message),
        );
      }
    };

    const handleRestore = async (clientId) => {
      const isConfirmed = window.confirm(
        "Are you sure you want to restore this client?",
      );
      if (!isConfirmed) return;

      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/clients/restore/${clientId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Client restored successfully.");
        if (typeof fetchClients === "function") fetchClients();
      } catch (err) {
        console.error("Restore error:", err);
        alert("Failed to restore client: " + (err.response?.data?.message || err.message));
      }
    };

    return (
      <>
          {loading ? (
            // <Alert variant="warning" className="m-3 text-center">
            //   Loading clients...
            // </Alert>
            <LoadingScreen />
          ) : (
            <>
              <style>
                {`.table-responsive{
                  overflow: clip;
              }`}
              </style>
              <Table
                hover
                responsive
                bordered
                className="mb-0"
                style={{ overflow: "visible" }}
              >
                <thead className="table-secondary">
                  <tr>
                    <th>Sr No.</th>
                    <th>Client Name</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>City</th>
                    <th style={{ minWidth: "6rem" }}>Tracking Details</th>
                    <th>Billing Company And Branch</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody style={{ overflow: "clip" }}>
                  {paginatedData.map((client, index) => (
                    <tr key={client._id || client.id}>
                      {/* Calculate correct Serial Number */}
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        {client.companyName || "-"}.<br />
                        Code :{client.x_client_code}
                      </td>
                      <td>{client.contactPersonName || "-"}</td>
                      <td>{client.emailId || "-"}</td>
                      <td>{client.city || "-"}</td>
                        {/* TRACKING */}
                        <td>
                          <AuditTrail 
                            createdOn={client.created_on}
                            createdByName={client.created_by_name}
                            modifiedOn={client.modified_on}
                            modifiedByName={client.modified_by_name}
                            disabledOn={client.disabled_on}
                            disabledByName={client.disabled_by_name}
                            isActive={activeStatus === 0}
                          />
                        </td>
                      <td>{client.billingCompany || "-"} <br />

                        {client.billingBranch || client.billing_branch || "-"}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="secondary"
                            size="sm"
                            className="border-0 shadow-none"
                          >
                            Action
                          </Dropdown.Toggle>
                      <Dropdown.Menu>
    {/* View सर्वांना दिसेल */}
    <Dropdown.Item
      onClick={() => handleView(client._id || client.id)}
    >
      <FaEye className="me-2 text-info" /> View
    </Dropdown.Item>

    {/* Edit - फक्त logged-in user ID 1 */}
    {Number(loggedInUserId) === 1 &&
      activeStatus === 0 &&
      Number(clientPerms?.edit_access) === 1 && (
        <Dropdown.Item
          onClick={() => handleEdit(client._id || client.id)}
        >
          <FaPen className="me-2 text-primary" /> Edit
        </Dropdown.Item>
      )}

    {/* Delete - फक्त logged-in user ID 1 */}
    {Number(loggedInUserId) === 1 &&
      activeStatus === 0 &&
      Number(clientPerms?.delete_access) === 1 && (
        <Dropdown.Item
          onClick={() => handelDelete(client._id || client.id)}
        >
          <FaTrashAlt className="me-2 text-danger" /> Delete
        </Dropdown.Item>
      )}

    {/* Restore - existing condition */}
    {activeStatus === 1 &&
      Number(clientPerms?.delete_access) === 1 && (
        <Dropdown.Item
          onClick={() => handleRestore(client._id || client.id)}
        >
          <FaUndo className="me-2 text-success" /> Restore
        </Dropdown.Item>
      )}
  </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    />

                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNumber = idx + 1;

                      // Logic to show a window of pages:
                      // Always show first, last, and 2 pages around the current page
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 2 &&
                          pageNumber <= currentPage + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={pageNumber}
                            active={pageNumber === currentPage}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </Pagination.Item>
                        );
                      } else if (
                        pageNumber === currentPage - 3 ||
                        pageNumber === currentPage + 3
                      ) {
                        return <Pagination.Ellipsis key={pageNumber} />;
                      }
                      return null;
                    })}

                    <Pagination.Next
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}

        {/* Modal for viewing details */}
        <Modal
          show={showViewModal}
          style={{
            fontSize: "13px",
          }}
          onHide={() => setShowViewModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Client Details</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {viewLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : selectedClient ? (
              <div className="p-2">
                {/* 1. Client & Contact Info */}
                <Row className="mb-4">
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <h6 className="border-bottom pb-2 text-primary">
                        Company Information
                      </h6>
                      <p className="mb-1">
                        <strong>Company:</strong> {selectedClient.companyName}
                      </p>
                      <p className="mb-1">
                        <strong>Billing Co:</strong>{" "}
                        {selectedClient.billingCompany?.name || "-"}
                      </p>
                      <p className="mb-1">
                        <strong>GST No:</strong> {selectedClient.gstNo || "-"}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <h6 className="border-bottom pb-2 text-primary">
                        Contact Details
                      </h6>
                      <p className="mb-1">
                        <strong>Person:</strong>{" "}
                        {selectedClient.contactPersonName}
                      </p>
                      <p className="mb-1">
                        <strong>Email:</strong> {selectedClient.emailId}
                      </p>
                      <p className="mb-1">
                        <strong>Phone:</strong> {selectedClient.contactNo || "-"}
                      </p>
                    </div>
                  </Col>
                </Row>

                {/* 2. Bank Details */}
                <Row className="mb-4">
                  <Col md={12}>
                    <div className="p-3 bg-light rounded">
                      <h6 className="border-bottom pb-2 text-primary">
                        Bank & Compliance
                      </h6>
                      <Row>
                          <Col md={3}>
                            <p className="mb-1">
                              <strong>Bank:</strong>{" "}
                              {selectedClient.bankName || "-"}
                            </p>
                          </Col>
                          <Col md={3}>
                            <p className="mb-1">
                              <strong>Account:</strong>{" "}
                              {selectedClient.accountNo || "-"}
                            </p>
                          </Col>
                          <Col md={3}>
                            <p className="mb-1">
                              <strong>IFSC:</strong>{" "}
                              {selectedClient.ifscCode || "-"}
                            </p>
                          </Col>
                          <Col md={3}>
                            <p className="mb-1">
                              <strong>SAC Code:</strong>{" "}
                              {selectedClient.sacCode || "-"}
                            </p>
                          </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>

                {/* 3. Sites Table with more data */}
                <h6 className="text-primary mt-2">Active Site Assignments</h6>
                <Table bordered hover responsive className="text-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>Site Name</th>
                      <th>Site ID</th>
                      <th>Work Order</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>Bill Amt</th>
                      <th>contract Attachement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClient.sites?.map((site, index) => (
                      <tr key={index}>
                        <td>{site.siteName}</td>
                        <td>{site.site_id || "-"}</td>
                        <td>{site.workOrderNo || "-"}</td>
                        <td>{site.cgst}%</td>
                        <td>{site.sgst}%</td>
                        <td>{site.igst}%</td>
                        <td>{site.expectedBillingAmount}</td>
                        <td>
                          {" "}
                          {/* New Attachment Field */}
                          <p className="mb-1">
                            {site.contractAttachment ? (
                              <a
                                href={site.contractAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                              >
                                View Document
                              </a>
                            ) : (
                              "-"
                            )}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Alert variant="warning">No detailed data available.</Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  export default ClientList;
