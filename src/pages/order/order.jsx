import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  InputGroup,
} from "react-bootstrap";

import { FaSearch, FaSyncAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const Order = () => {
  const [productList, setProductList] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const [filters, setFilters] = useState({
    bookingType: "Purchase",
    selectionOn: "Party",
    reportType: "ALL", // 👈 CHANGED DEFAULT
    sortBy: "Date",
    fromDate: "2025-04-01",
    toDate: "2027-01-31",
    partyName: [],
    productName: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };
const exportToExcel = () => {
  const isPurchase = filters.bookingType === "Purchase";

  let exportData = [];

  if (isPurchase) {
    // ================= PURCHASE EXCEL =================
    exportData = filteredTableData.map((item) => ({
      "Order Date": item.order_date,
      "Invoice No": item.invoice_no,
      "Supplier Name": item.supplier_name,
      "Product Name": item.product_name,
      SKU: item.sku,
      Quantity: item.qty,
      Color: item.color,
      Height: item.height,
      Width: item.width,
      Length: item.length,
      Gender: item.gender,
      "Purchase Price": item.purchase_price,
      "GST Percentage": item.gst_percentage,
      Total: item.grand_total,
      "Created At": item.created_at
        ? new Date(item.created_at).toLocaleDateString("en-GB")
        : "",
    }));
  } else {
    // ================= SALES EXCEL =================
    exportData = filteredTableData.map((item) => ({
      "Supplier Name": item.supplier_name,
      "Item Name": item.item_name,
      "SKU Code": item.sku_code,
      Color: item.color,
      "HSN Code": item.hsn_code,
      Quantity: item.qty,
      MRP: item.mrp,
      "Sale Price": item.sale_price,
      "Employee Name": item.employee_name,
      "Employee Code": item.employee_code,
      "Issue Date": item.issue_date,
      "Transfer By": item.transfer_by,
      "Created On": item.created_on
        ? new Date(item.created_on).toLocaleDateString("en-GB")
        : "",
    }));
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    isPurchase ? "Purchase Report" : "Sales Report"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(
    data,
    `${isPurchase ? "purchase" : "sales"}_report_${Date.now()}.xlsx`
  );
};
  // ================= PRODUCTS =================
  const getProducts = async () => {
    const res = await axios.get(`${API_URL}/api/order/products`);
    setProductList(res.data.data || []);
  };

  // ================= SUPPLIERS =================
  const getSuppliers = async () => {
    const res = await axios.get(`${API_URL}/api/order/suppliers`);
    setPartyList(res.data.data || []);
  };

  const getUniformSale = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/order/uniform-sale`);
    setReportData(res.data.data || []);
  } catch (err) {
    console.error(err);
  }
};
  // ================= REPORT =================
  const getPendingOrders = async () => {
    setLoading(true);

    const url =
      filters.bookingType === "Purchase"
        ? `${API_URL}/api/order/pending`
        : `${API_URL}/api/order/uniform-sale`;

    const payload = {
      supplier_name: filters.partyName,
      product_name: filters.productName,

      // 👇 IMPORTANT FIX
      status: filters.reportType === "ALL" ? null : filters.reportType,

      fromDate: filters.fromDate,
      toDate: filters.toDate,
      sortBy: filters.sortBy,
    };

    try {
      const res = await axios.post(url, payload);
      setReportData(res.data.data || []);
    } catch (err) {
      console.error("API Error:", err);
      setReportData([]);
    }

    setLoading(false);
  };

  const resetFilters = () => {
    setFilters({
      bookingType: "Purchase",
      selectionOn: "Party",
      reportType: "ALL",
      sortBy: "Date",
      fromDate: "2025-04-01",
      toDate: "2027-01-31",
      partyName: [],
      productName: [],
    });

    setSupplierSearch("");
    setProductSearch("");
    setTableSearch("");
    setReportData([]);
  };

  useEffect(() => {
    getProducts();
    getSuppliers();
  }, []);

  // ================= FILTERS =================
  const filteredSuppliers = partyList.filter((p) =>
    p.supplier_name?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredProducts = productList.filter((p) =>
    p.product_name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredTableData = useMemo(() => {
    return reportData.filter((item) =>
      item.invoice_no?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.supplier_name?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [reportData, tableSearch]);

  return (
    <div className="container-fluid py-3" style={{ background: "#f4f6fb" }}>

      {/* HEADER */}
   <Card className="border-0 shadow mb-3" style={{ background: "#4f46e5", color: "#fff" }}>
  <Card.Body className="d-flex justify-content-between py-2">
    <h5 className="mb-0">Orders Dashboard</h5>
    <Badge bg="light" text="dark">
      Total: {filteredTableData.length}
    </Badge>
  </Card.Body>
</Card>

      <Row>

        {/* FILTERS */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>

              <h5>Filters</h5>

              {/* Booking Type */}
              <Form.Select
                name="bookingType"
                value={filters.bookingType}
                onChange={handleChange}
                className="mb-2"
              >
                <option value="Purchase">Purchase</option>
                <option value="Sales">Sales</option>
              </Form.Select>

              {/* Selection */}
              <Form.Select
                name="selectionOn"
                value={filters.selectionOn}
                onChange={handleChange}
                className="mb-3"
              >
                <option value="Party">Party Wise</option>
                <option value="Product">Product Wise</option>
              </Form.Select>

              {/* REPORT TYPE 👇 */}
              <Form.Select
                name="reportType"
                value={filters.reportType}
                onChange={handleChange}
                className="mb-3"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </Form.Select>

              {/* SUPPLIERS */}
              {filters.selectionOn === "Party" && (
                <div>
                  <h6>Suppliers</h6>

                  <InputGroup className="mb-2">
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <Form.Control
                      placeholder="Search supplier"
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                    />
                  </InputGroup>

                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    <Form.Check
                      label="Select All"
                      checked={
                        filteredSuppliers.length > 0 &&
                        filters.partyName.length === filteredSuppliers.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters((p) => ({
                            ...p,
                            partyName: filteredSuppliers.map((i) => i.supplier_name),
                          }));
                        } else {
                          setFilters((p) => ({ ...p, partyName: [] }));
                        }
                      }}
                    />

                    {filteredSuppliers.map((p) => (
                      <Form.Check
                        key={p.supplier_id}
                        label={p.supplier_name}
                        checked={filters.partyName.includes(p.supplier_name)}
                        onChange={() => {
                          setFilters((prev) => {
                            const exists = prev.partyName.includes(p.supplier_name);
                            return {
                              ...prev,
                              partyName: exists
                                ? prev.partyName.filter((x) => x !== p.supplier_name)
                                : [...prev.partyName, p.supplier_name],
                            };
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              {filters.selectionOn === "Product" && (
                <div>
                  <h6>Products</h6>

                  <InputGroup className="mb-2">
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <Form.Control
                      placeholder="Search product"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </InputGroup>

                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    <Form.Check
                      label="Select All"
                      checked={
                        filteredProducts.length > 0 &&
                        filters.productName.length === filteredProducts.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters((p) => ({
                            ...p,
                            productName: filteredProducts.map((i) => i.product_name),
                          }));
                        } else {
                          setFilters((p) => ({ ...p, productName: [] }));
                        }
                      }}
                    />

                    {filteredProducts.map((p) => (
                      <Form.Check
                        key={p.product_id}
                        label={p.product_name}
                        checked={filters.productName.includes(p.product_name)}
                        onChange={() => {
                          setFilters((prev) => {
                            const exists = prev.productName.includes(p.product_name);
                            return {
                              ...prev,
                              productName: exists
                                ? prev.productName.filter((x) => x !== p.product_name)
                                : [...prev.productName, p.product_name],
                            };
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

       <div className="d-flex flex-column gap-2 mt-3">

  <Button className="w-100" onClick={getPendingOrders}>
    Search
  </Button>

  <Button variant="dark" className="w-100" onClick={resetFilters}>
    <FaSyncAlt className="me-2" />
    Reset
  </Button>

  <Button
    variant="success"
    className="w-100"
    onClick={exportToExcel}
  >
    Export Excel
  </Button>

</div>
            </Card.Body>
          </Card>
        </Col>

        {/* TABLE */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>

              <InputGroup className="mb-3">
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search table..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </InputGroup>

        {filters.bookingType === "Purchase" ? (
  // ================= PURCHASE TABLE =================
  <Table bordered hover responsive>
    <thead style={{ background: "#4f46e5", color: "#fff" }}>
      <tr>
        <th>#</th>
        <th>Invoice</th>
        <th>Supplier</th>
        <th>Product</th>
        <th>Qty</th>
        <th>Total</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {filteredTableData.length > 0 ? (
        filteredTableData.map((item, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{item.invoice_no}</td>
            <td>{item.supplier_name}</td>
            <td>{item.product_name}</td>
            <td>{item.qty}</td>
            <td>₹{item.grand_total}</td>
            <td>
              <Badge
                bg={
                  item.status === "PENDING"
                    ? "warning"
                    : item.status === "COMPLETED"
                    ? "success"
                    : "secondary"
                }
              >
                {item.status}
              </Badge>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="7" className="text-center py-4">
            No Data Found
          </td>
        </tr>
      )}
    </tbody>
  </Table>
) : (
  // ================= SALES TABLE =================
  <Table bordered hover responsive>
    <thead style={{ background: "#198754", color: "#fff" }}>
      <tr>
        <th>#</th>
        <th>Supplier Name</th>
        <th>Item Name</th>
        <th>SKU Code</th>
        <th>Color</th>
        <th>HSN Code</th>
        <th>Qty</th>
        <th>MRP</th>
        <th>Sale Price</th>
        <th>Employee Name</th>
        <th>Employee Code</th>
        <th>Issue Date</th>
        <th>Transfer By</th>
        <th>Created On</th>
      </tr>
    </thead>

    <tbody>
      {filteredTableData.length > 0 ? (
        filteredTableData.map((item, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{item.supplier_name}</td>
            <td>{item.item_name}</td>
            <td>{item.sku_code}</td>
            <td>{item.color}</td>
            <td>{item.hsn_code}</td>
            <td>{item.qty}</td>
            <td>{item.mrp}</td>
            <td>{item.sale_price}</td>
            <td>{item.employee_name}</td>
            <td>{item.employee_code}</td>
            <td>{item.issue_date}</td>
            <td>{item.transfer_by}</td>
            <td>
              {item.created_on
                ? new Date(item.created_on).toLocaleDateString("en-GB")
                : ""}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="14" className="text-center py-4">
            No Data Found
          </td>
        </tr>
      )}
    </tbody>
  </Table>
)}

            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default Order;