import React, { useEffect, useState } from "react";
import { Table, Dropdown, Badge, Card, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ExistingSitesTab = ({ clientId, previousStep, onAddNewSite }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (clientId) {
      getSites();
    }
  }, [clientId]);

  const getSites = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/clients/${clientId}/sites?t=${new Date().getTime()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const activeSites = (res.data.data || []).filter(
        (site) => Number(site.active) === 0,
      );

      setSites(activeSites);

      console.log("Active = 0 Sites:", activeSites);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleCancel = async () => {
    console.log("cancel");
    navigate("/add-new/client");
  };

  const onViewSite = (site) => {
    console.log("VIEW SITE", site);
  };

  const onEditSite = (site) => {
    console.log("EDIT SITE", site);
    navigate(`/client/edit-site`, { state: { site } });
    // open modal
    // OR navigate to edit site page
  };

  // wages setting navigate
  console.log("WAGES SETTING clientId :",clientId);
  const onWagesSetting = (site) => {
  console.log("WAGES SETTING SITE:", site);

  navigate("/client/wages-setting", {
    state: {
      site,
      clientId,
    },
  });
};

  const onDeleteSite = async (site) => {
    console.log("🗑️ SITE RECEIVED:", site);

    if (!site) {
      alert("Site data not found");
      return;
    }

    // IMPORTANT: id first
    const deleteId =
      site.id ?? site.rateId ?? site.rate_id ?? site.siteId ?? site.site_id;

    console.log("🆔 DELETE ID:", deleteId);

    if (!deleteId) {
      alert("Site ID not found");
      return;
    }

    if (!window.confirm("Delete this site?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/clients/deleteClientSite/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Site deleted successfully");

      getSites();
    } catch (err) {
      console.error("❌ DELETE ERROR:", err);

      alert(err.response?.data?.message || "Failed to delete site");
    }
  };

  return (
    <>
      <Card className="shadow-sm border-0 p-0">
        <div className="card-header p-0">
          <h2 className="form-title card-header">Existing Sites</h2>
        </div>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table bordered hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th width="25%">Location Detail</th>
                  <th width="20%">Sales Person Detail</th>
                  <th width="20%">Billing Detail</th>
                  <th width="25%">Total Cost</th>
                  <th width="15%">Total ManPower</th>
                  <th width="10%">Action</th>
                </tr>
              </thead>

              <tbody>
                {sites.length > 0 ? (
                  sites.map((site) => (
                    <tr key={site.rateId}>
                      <td>
                        <div>
                          <strong>Site :</strong> {site.siteName}
                        </div>

                        <div>
                          <strong>contactPerson :</strong> {site.contactPerson}
                        </div>

                        <div>
                          <strong>Contact :</strong> {site.contactNo}
                        </div>

                        <div>
                          <strong>Address :</strong> {site.address}
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>Name :</strong> {site.salesPerson || "-"}
                        </div>

                        <div>
                          <strong>Contact :</strong>{" "}
                          {site.salesPersonPhone || "-"}
                        </div>

                        <div>
                          <strong>Email :</strong>{" "}
                          {site.salesPersonEmail || "-"}
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>Bill Cycle :</strong>{" "}
                          {site.billCycleDate || "-"}
                        </div>

                        <div>
                          <strong>Status :</strong>{" "}
                          <Badge
                            bg={
                              site.status?.toUpperCase() === "ACTIVE"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {site.status}
                          </Badge>
                        </div>

                        <div>
                          <strong>Start :</strong>{" "}
                          {formatDate(site.locationStartDate)}
                        </div>

                        <div>
                          <strong>End :</strong> {formatDate(site.expectedDate)}
                        </div>
                      </td>

                      <td>
                        {site.rates?.length > 0 ? (
                          site.rates.map((rate, index) => (
                            <div
                              key={index}
                              className="mb-2 border-bottom pb-1"
                            >
                              <strong>{rate.empType}</strong>
                              {" ("}
                              {rate.hours}
                              {" Hours) | Nos: "}
                              {rate.nos}
                              {" | Cost Per Head: ₹"}
                              {Number(rate.gross || 0).toLocaleString()}

                              <br />

                              <small>
                                Service Charge : ₹
                                {Number(
                                  rate.serviceCharge || 0,
                                ).toLocaleString()}
                              </small>
                            </div>
                          ))
                        ) : (
                          <span>No Rates Added</span>
                        )}
                      </td>
                      <td>{site.cc_total_manpower}</td>
                      <td className="text-center">
                        <Dropdown align="end">
                          <Dropdown.Toggle variant="info" size="sm">
                            Action
                          </Dropdown.Toggle>
                          <Dropdown.Menu
                            renderOnMount
                            popperConfig={{ strategy: "fixed" }}
                          >
                            <Dropdown.Item onClick={() => onEditSite(site)}>
                              Edit
                            </Dropdown.Item>

                            {site.contractAttachment && (
                              <Dropdown.Item
                                href={
                                  site.contractAttachment.startsWith("http")
                                    ? site.contractAttachment
                                    : `${import.meta.env.VITE_FRONTEND_FOLDER || ""}/api/${site.contractAttachment.replace(/^\//, "")}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>View Contract</span>
                              </Dropdown.Item>
                            )}

                            <Dropdown.Item onClick={() => onWagesSetting(site)}>
                              Wages Setting
                            </Dropdown.Item>

                            <Dropdown.Divider />

                            <Dropdown.Item
                              className="text-danger"
                              onClick={() => {
                                console.log("🗑️ DELETE CLICKED SITE:", site);
                                onDeleteSite(site);
                              }}
                            >
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No Sites Available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      {/* Actions */}
      <div className="d-flex justify-content-end align-items-center mt-3">
        <button
          type="button"
          className="me-2 btn btn-outline-secondary"
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          type="button"
          className="me-2 btn btn-secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>
        {clientId && onAddNewSite && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddNewSite}
          >
            Add New Site
          </button>
        )}
      </div>
    </>
  );
};

export default ExistingSitesTab;
