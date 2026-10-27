import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Col, Form, Row, Table, Spinner } from "react-bootstrap";
import { useContext } from "react";
import { PermissionsContext } from "../../components/context/PermissionsContext";
import { FaSearch, FaPrint, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./ledger.css";

const Ledger = () => {
  const { permissions, getPermissionsByModule, getPermissionsByModuleId } =
    useContext(PermissionsContext);
  const ledgerPerms = getPermissionsByModule("Ledger");
  console.log("ledgerPerms", ledgerPerms);
  const printRef = useRef();

  const [searchFields, setSearchFields] = useState({
    clientId: "",
    siteId: "",
    fromDate: "",
    toDate: "",
  });
  const [showPrint, setShowPrint] = useState(false);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // ================= CLIENTS =================
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/vouchers/getAllCompanies`,
        {},
        getAuthHeaders(),
      );
      setClients(res.data.user || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SITES =================
  const handleClientChange = async (e) => {
    const clientId = e.target.value;

    setSearchFields((p) => ({ ...p, clientId, siteId: "" }));
    setSites([]);

    if (!clientId) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/vouchers/getAllBranches`,
        { client_id: clientId },
        getAuthHeaders(),
      );
      setSites(res.data.user || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSiteChange = (e) => {
    setSearchFields((p) => ({ ...p, siteId: e.target.value }));
  };

  // ================= LEDGER =================
  const fetchLedger = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/ledger`, {
        params: {
          client_id: searchFields.clientId,
          site_id: searchFields.siteId,
          from_date: searchFields.fromDate,
          to_date: searchFields.toDate,
        },
        ...getAuthHeaders(),
      });

      setLedgerData(res.data.bill_details || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setSearchFields({
      clientId: "",
      siteId: "",
      fromDate: "",
      toDate: "",
    });
    setSites([]);
    setLedgerData([]);
  };

  // ================= PRINT =================
  const handlePrint = () => {
    window.print();
  };
  // ================= EXCEL EXPORT =================
  const exportExcel = () => {
    const data = ledgerData.map((item) => ({
      Date: item.invoice_date?.split("T")[0],
      Invoice: item.invoice_no,
      Description: item.description || "Bill Entry",
      Amount: item.final_amount,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "ledger_report.xlsx");
  };

  // ================= TOTAL =================
  const totalAmount = ledgerData.reduce(
    (acc, i) => acc + Number(i.final_amount || 0),
    0,
  );

  return (
    <div
      className="container-fluid p-0"
      style={{
        fontSize: "13px",
      }}
    >
      <h5 className="mb-3">Ledger Report</h5>

      {/* ================= FILTER ================= */}
      <Card
        className="p-3 mb-3"
        style={{
          fontSize: "13px",
        }}
      >
        <Row className="g-3">
          <Col md={3}>
            <Form.Label>Client</Form.Label>
            <Form.Select
              value={searchFields.clientId}
              onChange={handleClientChange}
            >
              <option value="">Select</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Site</Form.Label>
            <Form.Select
              value={searchFields.siteId}
              onChange={handleSiteChange}
            >
              <option value="">Select</option>
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_id}>
                  {s.site_name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>From</Form.Label>
            <Form.Control
              type="date"
              value={searchFields.fromDate}
              onChange={(e) =>
                setSearchFields((p) => ({ ...p, fromDate: e.target.value }))
              }
            />
          </Col>

          <Col md={3}>
            <Form.Label>To</Form.Label>
            <Form.Control
              type="date"
              value={searchFields.toDate}
              onChange={(e) =>
                setSearchFields((p) => ({ ...p, toDate: e.target.value }))
              }
            />
          </Col>
        </Row>

        <div className="mt-3 d-flex gap-2 flex-wrap">
          <Button onClick={fetchLedger}>
            <FaSearch /> Search
          </Button>

          <Button variant="secondary" onClick={resetForm}>
            Reset
          </Button>

          {ledgerPerms?.export_access === 1 && (
            <Button variant="success" onClick={exportExcel}>
              <FaFileExcel /> Excel
            </Button>
          )}
          {ledgerPerms?.export_access === 1 && (
            <Button variant="dark" onClick={handlePrint}>
              <FaPrint /> Print
            </Button>
          )}
        </div>
      </Card>

      {/* ================= PRINT AREA ================= */}
      <Card ref={printRef} className="p-4 ledger-print">
        <div className="text-center border-bottom pb-2 mb-3">
          <h6>LEDGER REPORT</h6>
          <small>
            {searchFields.fromDate || "-"} to {searchFields.toDate || "-"}
          </small>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <div>
            <strong>Client:</strong>{" "}
            {clients.find((c) => c.id === searchFields.clientId)?.title || "-"}
          </div>

          <div>
            <strong>Site:</strong>{" "}
            {sites.find((s) => s.site_id === searchFields.siteId)?.site_name ||
              "-"}
          </div>
        </div>

        <div className="table-responsive">
          <Table bordered hover>
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    <Spinner animation="border" size="sm" /> Loading...
                  </td>
                </tr>
              ) : ledgerData.length ? (
                ledgerData.map((item, i) => (
                  <tr key={i}>
                    <td>{item.invoice_date?.split("T")[0]}</td>
                    <td>{item.invoice_no}</td>
                    <td>{item.description || "Bill Entry"}</td>
                    <td style={{ textAlign: "right" }}>
                      ₹ {Number(item.final_amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* TOTAL */}
        <div className="d-flex justify-content-end mt-3">
          <div className="border p-2 px-4">
            <h6 className="mb-0">Total: ₹ {totalAmount.toFixed(2)}</h6>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Ledger;
