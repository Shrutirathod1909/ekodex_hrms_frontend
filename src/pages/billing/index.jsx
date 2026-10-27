import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Stack,
  Collapse,
  Form,
  Table,
  Modal,
  Dropdown,
    Alert,
} from "react-bootstrap";
import { useContext } from "react";

import { PermissionsContext } from "../../components/context/PermissionsContext";
import {
  FaPlus,
  FaMinus,
  FaSearch,
  FaFileInvoice,
  FaTruck,
  FaDownload,
  FaUpload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/loader/LoadingScreen";

// Styles to make react-select match Bootstrap 'sm' inputs
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "31px",
    height: "31px",
    fontSize: "0.875rem",
    borderRadius: "0.25rem",
  }),
  valueContainer: (provided) => ({ ...provided, padding: "0 8px" }),
  indicatorsContainer: (provided) => ({ ...provided, height: "30px" }),
};

const API_URL = import.meta.env.VITE_API_URL;

const Billing = () => {
  const { permissions, getPermissionsByModule, getPermissionsByModuleId } =
    useContext(PermissionsContext);
const [searchSuggestions, setSearchSuggestions] = useState({});
const [activeSearchIndex,setActiveSearchIndex] = useState(null);
  const billingPerms = getPermissionsByModuleId(11);
  console.log("billingPerms", billingPerms, permissions);
  const navigate = useNavigate();
const [showReceiveModal, setShowReceiveModal] = useState(false);
const [showInvoiceModal, setShowInvoiceModal] = useState(false);
const [gstType, setGstType] = useState("all");
const [selectedBill, setSelectedBill] = useState(null);
const totalAmount = Number(selectedBill?.final_amount || 0);

const paidAmount = Number(selectedBill?.paid_amount || 0);

const dueAmount = Number(selectedBill?.balance_amount || 0);

const billingTitle =
  gstType === "gst"
    ? "View GST Bills"
    : gstType === "non-gst"
    ? "View Non GST Bills"
    : "Billing Dashboard";
const [invoiceChangeData, setInvoiceChangeData] = useState({
  auto_no: "",
  invoice_no: "",
  invoice_date: "",
  invoice_from: "",
  invoice_to: "",
});
const [receiveData, setReceiveData] = useState({
  bill_no: "",
  amount: "",
    payment_date: new Date().toISOString().split("T")[0],
  transaction_type: "",
  transaction_id: "",
  bank_name: "",
});
  // const resetFilters = () => {
  //   const defaultYear = {
  //     value: currentYear,
  //     label: String(currentYear),
  //   };

  //   const defaultMonth = allMonths[currentMonth - 1];

  //   setFilters([
  //     {
  //       field: null,
  //       keyword: "",
  //     },
  //   ]);

  //   setSelectedYear(defaultYear);
  //   setSelectedMonth(defaultMonth);
  // };

  // Add this state

  const [showUploadModal, setShowUploadModal] = useState(false);
const [page, setPage] = useState(0);
const [paymentHistory, setPaymentHistory] = useState([]);

const [totalRows, setTotalRows] = useState(0);
const perPage = 10;
const totalPages = Math.ceil(totalRows / perPage);
const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
const [selectedBillNo, setSelectedBillNo] = useState("");
const [paymentHistoryData, setPaymentHistoryData] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
  // Add this handler
  const handleUploadClick = () => setShowUploadModal(true);

  // State for visibility toggle
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState([
    {
      field: null,
      keyword: "",
    },
  ]);

  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;


  const allMonths = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
const [selectedYear, setSelectedYear] = useState({
  value: currentYear,
  label: String(currentYear),
});

const [selectedMonth, setSelectedMonth] = useState(
  allMonths[currentMonth - 1]
);
const fieldOptions = [
  { value: "invoice_no", label: "Invoice No" },
  { value: "billing_company", label: "Billing Company" },
  { value: "billing_branch", label: "Billing Branch" },
  { value: "client_name", label: "Client Name" },
  { value: "site_name", label: "Site Name" },
  { value: "x_client_code", label: "Client Code" },
];

const handleFieldChange = (selectedOption, index) => {
  const updated = [...filters];

  updated[index].field = selectedOption;
  updated[index].keyword = "";

  setFilters(updated);

  setSearchSuggestions((prev) => ({
    ...prev,
    [index]: [],
  }));
};
const handleInvoiceChange = (e) => {
  setInvoiceChangeData({
    ...invoiceChangeData,
    [e.target.name]: e.target.value,
  });
};
const handleKeywordChange = (e, index) => {

  const value = e.target.value;

  console.log("Typed Value:", value);

  const updated = [...filters];

  updated[index].keyword = value;

  setFilters(updated);


  const selectedField = updated[index].field?.value;

  console.log("Selected Field:", selectedField);


  if (selectedField) {

    fetchSearchSuggestions(
      selectedField,
      value,
      index
    );

  } else {
    console.log("Field not selected");
  }

};

  const yearOptions = Array.from({ length: 8 }, (_, i) => ({
    value: currentYear - i,
    label: String(currentYear - i),
  }));

  const monthOptions =
    selectedYear?.value === currentYear
      ? allMonths.filter((month) => month.value <= currentMonth)
      : allMonths;

  const getAvailableOptions = (currentIndex) => {
    const selectedValues = filters
      .filter((_, idx) => idx !== currentIndex)
      .map((item) => item.field?.value);

    return fieldOptions.filter(
      (option) => option.value === "" || !selectedValues.includes(option.value),
    );
  };

  const [summary, setSummary] = useState({
    totalBills: 0,
    totalAmount: 0,
    totalReceived: 0,
    balanceAmount: 0,
  });

  const addFilter = () =>
    setFilters([...filters, { field: null, keyword: "" }]);
  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);

    setFilters(updated);
  };
const fetchPaymentHistory = async (invoiceNo) => {

  try {

    setHistoryLoading(true);

    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_URL}/api/billing/payment-history`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        },
        params:{
          invoice_no: invoiceNo
        }
      }
    );


    if(response.data.success){

      setPaymentHistoryData(response.data.data || []);

    }else{

      setPaymentHistoryData([]);

    }


  } catch(error){

    console.log("Payment History Error:",error);
    setPaymentHistoryData([]);

  } finally{

    setHistoryLoading(false);

  }

};
const fetchSearchSuggestions = async (field, keyword, index) => {

  if (!field || keyword.length < 2) {
    setSearchSuggestions(prev => ({
      ...prev,
      [index]: []
    }));
    return;
  }

  try {

    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_URL}/api/billing/search-suggestions`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        },
        params:{
          field,
          keyword
        }
      }
    );


    console.log("Suggestion API Response:", response.data);


    if(response.data.success){

      setSearchSuggestions(prev => ({
        ...prev,
        [index]: response.data.data || []
      }));

    }

  } catch(error){

    console.log("Suggestion Error:", error);

  }

};

const downloadExcel = async()=>{

try{

const token = localStorage.getItem("token");

const response = await axios.get(
`${API_URL}/api/billing/download-excel`,
{
headers:{
Authorization:`Bearer ${token}`
},

params:{
  gstType: gstType   // ADD THIS
},

responseType:"blob"

});

const url = window.URL.createObjectURL(
new Blob([response.data])
);

const link = document.createElement("a");

link.href=url;


let fileName = "Billing_Report.xlsx";

if(gstType === "gst"){
  fileName = "GST_Billing_Report.xlsx";
}
else if(gstType === "non-gst"){
  fileName = "Non_GST_Billing_Report.xlsx";
}

link.download=fileName;


document.body.appendChild(link);

link.click();

link.remove();


}
catch(error){

console.log(error);

alert("Excel Download Failed");

}

};

const fetchBillingData = async (
  currentPage = page,
  searchFilters = filters
) => {

  try {

    setLoading(true);

    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/api/billing`, {

      headers:{
        Authorization:`Bearer ${token}`,
      },

      params:{
        page: currentPage,
        perPage,
        month: selectedMonth?.value || "",
        year: selectedYear?.value || "",
        filters: JSON.stringify(searchFilters),
          gstType: gstType
      }

    });


    if(response.data.success){

      setBillingData(response.data.data || []);
      setTotalRows(response.data.totalRows || 0);

      setSummary(
        response.data.summary || {
          totalBills:0,
          totalAmount:0,
          totalReceived:0,
          balanceAmount:0
        }
      );

    }


  } catch(error){

    console.log(error);

  } finally{

    setLoading(false);

  }

};

useEffect(() => {

  fetchBillingData(page);

}, [
  page,
  selectedMonth,
  selectedYear,
  gstType
]);

  const handleYearChange = (year) => {
    setSelectedYear(year);

    if (year.value === currentYear) {
      const currentMonthObj = allMonths[currentMonth - 1];

      setSelectedMonth(currentMonthObj);
    } else {
      setSelectedMonth(allMonths[0]);
    }
  };

  const handleReceiveChange = (e) => {

  const { name, value } = e.target;

  // Amount Validation
  if (name === "amount") {

    const entered = Number(value);

    if (entered > dueAmount) {
      alert("Amount cannot be greater than Due Amount");
      return;
    }
  }

  // Transaction Type Change
  if (name === "transaction_type") {

    setReceiveData((prev) => ({
      ...prev,
      transaction_type: value,
      transaction_id: "",
      bank_name: value === "Cash" ? "" : "",
    }));

    return;
  }

  setReceiveData((prev) => ({
    ...prev,
    [name]: value,
  }));

};
const handleReceiveSubmit = async () => {

  // Amount Required
  if (!receiveData.amount || Number(receiveData.amount) <= 0) {
    return alert("Please Enter Amount");
  }

  // Amount > Due Amount
  if (Number(receiveData.amount) > dueAmount) {
    return alert("Entered Amount cannot be greater than Due Amount");
  }

  // Payment Date Required
  if (!receiveData.payment_date) {
    return alert("Please Select Payment Date");
  }

  // Transaction Type Required
  if (!receiveData.transaction_type) {
    return alert("Please Select Transaction Type");
  }

  // Cash सोडून बाकी सर्व Type साठी Bank Name Required
  if (
    receiveData.transaction_type !== "Cash" &&
    !receiveData.bank_name.trim()
  ) {
    return alert("Please Enter Bank Name");
  }

  // Cheque Number Required
  if (
    receiveData.transaction_type === "Cheque" &&
    !receiveData.transaction_id.trim()
  ) {
    return alert("Please Enter Cheque Number");
  }

  // UPI / RTGS / NEFT / IMPS Transaction ID Required
  if (
    ["UPI", "RTGS", "NEFT", "IMPS"].includes(receiveData.transaction_type) &&
    !receiveData.transaction_id.trim()
  ) {
    return alert("Please Enter Transaction ID");
  }

  try {

    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/api/billing/receive-payment`,
      receiveData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {

      alert("Payment Received Successfully");

      setShowReceiveModal(false);

      // Reset Form
      setReceiveData({
        bill_no: "",
        amount: "",
        payment_date: new Date().toISOString().split("T")[0],
        transaction_type: "",
        transaction_id: "",
        bank_name: "",
      });

      fetchBillingData();

    } else {

      alert(response.data.message || "Payment Receive Failed");

    }

  } catch (err) {

    console.log(err);

    alert("Payment Receive Failed");

  }

};
  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/billing/download-template`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for file downloads
        },
      );

      // Create a URL for the blob and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Wages_Template.xlsx"); // Or your file extension
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download Error:", error);
      alert("Failed to download template.");
    }
  };

  const removeBill = async (autoNo, billingType) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(`${API_URL}/api/billing/remove`, {
        params: {
          autoNo,
          billingType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message);
      fetchBillingData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete bill");
    }
  };
const handleSearch = () => {
  const searchFilters = filters.map((filter) => {
    let updatedField = filter.field;

    if (filter.field?.value === "client_name") {
      updatedField = {
        ...filter.field,
        value: "company_name",
      };
    }

    return {
      ...filter,
      field: updatedField,
    };
  });

  setPage(0);
  fetchBillingData(0, searchFilters);
};
const resetFilters = async () => {

  const resetFilterData = [
    {
      field: null,
      keyword: "",
    },
  ];

  setFilters(resetFilterData);
  setSelectedYear(null);
  setSelectedMonth(null);
  setPage(0);

  try {

    setLoading(true);

    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/api/billing`, {
      headers:{
        Authorization:`Bearer ${token}`,
      },
      params:{
        page:0,
        perPage,
        month:"",
        year:"",
        filters: JSON.stringify(resetFilterData),
      }
    });


    if(response.data.success){

      setBillingData(response.data.data || []);

      setTotalRows(response.data.totalRows || 0);

      setSummary(
        response.data.summary || {
          totalBills:0,
          totalAmount:0,
          totalReceived:0,
          balanceAmount:0
        }
      );

    }

  } catch(error){
    console.log(error);
  }
  finally{
    setLoading(false);
  }

};
const formatDate = (date) => {
  if (!date) return "-";

  const [year, month, day] = date.split("T")[0].split("-");

  return `${day}/${month}/${year}`;
};

const handleInvoiceSave = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/api/billing/change-invoice`,
      invoiceChangeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      alert(response.data.message);
      setShowInvoiceModal(false);
      fetchBillingData();
    }
  } catch (err) {
    console.log(err);
    alert("Failed to Update Invoice");
  }
};
if (loading) {
  return <LoadingScreen />;
}
//   return (
//     <div
//       className="container-fluid p-0"
//       style={{
//         fontSize: "13px",
//       }}
//     >
//       {/* 1. Header */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h4 className="fw-bold text-dark">Billing Dashboard</h4>
//         <div>
//           {billingPerms?.add_access === 1 && (
//             <Button
//               variant="primary"
//               size="sm"
//               className="me-2"
//               onClick={() => navigate(`/billing/create-bill`)}
//             >
//               <FaFileInvoice className="me-1" /> New Bill
//             </Button>
//           )}

//           {billingPerms?.add_access === 1 && (
//             <Button
//               variant="dark"
//               size="sm"
//               onClick={() => navigate(`/billing/create-transport-bill`)}
//             >
//               <FaTruck className="me-1" /> New Transporter Bill
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* 3. Filter Card (Smoothly Collapsible) */}
//       <Collapse in={showFilters}>
//         <div className="">
//           <Card className="border-0 shadow-sm mb-4">
//             <Card.Body>
//               <Row>
//                 <Col md={8}>
//                   <div className="g-2 mb-2 row">
//                     <div className="col-md-4">Select Search Field</div>
//                     <div className="col-md-4">Enter Keyword</div>
//                   </div>
//                   {filters.map((filter, index) => (
//                     <Row key={index} className="g-2 mb-2">
//                       <Col md={4}>
//                   <Select
//  value={filter.field || null}
//  options={getAvailableOptions(index)}
//  styles={customSelectStyles}
//  placeholder="Select Field..."
//  onChange={(selected)=>
//     handleFieldChange(selected,index)
//  }
// />
//                       </Col>
//                       <Col md={6}>
//                     <Form.Control
//  value={filter.keyword || ""}
//  onChange={(e)=>handleKeywordChange(e,index)}
// />
//                       </Col>
//                       <Col md={2}>
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={addFilter}
//                           disabled={
//                             !filter.field ||
//                             filters.length >= fieldOptions.length - 1
//                           }
//                         >
//                           <FaPlus />
//                         </Button>
//                         {filters.length > 1 && (
//                           <Button
//                             variant="outline-danger"
//                             size="sm"
//                             className="ms-1"
//                             onClick={() => removeFilter(index)}
//                           >
//                             <FaMinus />
//                           </Button>
//                         )}
//                       </Col>
//                     </Row>
//                   ))}
//                 </Col>
//                 <Col md={4} className="border-start ps-3">
//                   <Row className="g-2">
//                     <Col>
//                   <Select
//  value={selectedMonth}
//  options={monthOptions}
//  styles={customSelectStyles}
//  placeholder="Select Month"
//  onChange={(selected)=>setSelectedMonth(selected)}
// />
//                     </Col>
//                     <Col>
//                       <Select
//                         value={selectedYear}
//                         options={yearOptions}
//                         styles={customSelectStyles}
//                         placeholder="Select Year"
//                         isSearchable
//                         onChange={handleYearChange}
//                       />
//                     </Col>
//                   </Row>

//                   <div className="d-flex gap-2 mt-2">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       className="flex-fill"
//                       onClick={handleSearch}
//                     >
//                       <FaSearch className="me-1" />
//                       Search
//                     </Button>

//                     <Button variant="danger" size="sm" onClick={resetFilters}>
//                       Reset
//                     </Button>
//                   </div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </div>
//       </Collapse>

//       {/* 5. Table */}
//       <div className="">
//         <Card className="border-0 shadow-sm">
//           {/* 2. Secondary Action Bar */}
//           <div className="d-flex flex-wrap gap-2 mb-3 p-3 align-items-center justify-content-between border-bottom">
//             <h5 className="mb-0 me-3 fw-bold">All Billing Summary</h5>
//             <div className="d-flex gap-1">
//                 {gstType !== "all" && (
//     <Button
//       variant="secondary"
//       size="sm"
//       onClick={()=>{
//         setPage(0);
//         setGstType("all");
//       }}
//     >
//       View All Bills
//     </Button>
//   )}

//           <Button
//   variant="primary"
//   size="sm"
//   onClick={()=>{
//     setPage(0);
//     setGstType("gst");
//   }}
// >
//   View GST Bills
// </Button>
//            <Button
//   variant="info"
//   size="sm"
//   className="text-white"
//   onClick={()=>{
//     setPage(0);
//     setGstType("non-gst");
//   }}
// >
//   View Non GST Bills
// </Button>
//               <Button
//                 variant="danger"
//                 size="sm"
//                 onClick={() => setShowFilters(!showFilters)}
//               >
//                 {showFilters ? "Hide Search" : "Click Here To Search"}
//               </Button>
//               {billingPerms?.export_access === 1 && (
//                 <Button variant="success" size="sm" onClick={downloadExcel}>
//                   <FaDownload /> Download Report
//                 </Button>
//               )}
//               {billingPerms?.add_access === 1 && (
//                 <Button
//                   variant="info"
//                   size="sm"
//                   className="text-white"
//                   onClick={handleUploadClick}
//                 >
//                   <FaUpload /> Wages Bulk Upload
//                 </Button>
//               )}
//             </div>
//           </div>

//           {/* 4. Metrics Bar */}
//           <div className="mb-4 px-3">
//             <h6 className="fw-bold mb-0">
//               Total Bills Generated:
//               <span className="text-success">{summary.totalBills}</span>
//               {" | "}
//               Billing Amount:
//               <span className="text-success">
//                 {Number(summary.totalAmount || 0).toLocaleString()}
//               </span>
//               {" | "}
//               Payment Received:
//               <span className="text-success">
//                 {Number(summary.totalReceived || 0).toLocaleString()}
//               </span>
//               {" | "}
//               <span className="text-danger">
//                 Payment Not Received:
//                 {Number(summary.balanceAmount || 0).toLocaleString()}
//               </span>
//             </h6>
//           </div>

//           <Table hover responsive className="align-middle mb-0 ">
//             <thead className="bg-light">
//               <tr>
//                 <th className="text-muted small px-3">INVOICE</th>
//                 <th className="text-muted small">CLIENT</th>
//                 <th className="text-muted small text-end">TOTAL</th>
//                 <th className="text-muted small text-end">PAID</th>
//                 <th className="text-muted small text-end">DUE</th>
//                 <th className="text-muted small text-center">ACTION</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="6" className="text-center py-4">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : billingData.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="text-center py-4">
//                     No Records Found
//                   </td>
//                 </tr>
//               ) : (
//                 billingData.map((row, i) => (
//                   <tr key={row.id}>
//                     <td className="px-3">
//                       <div className="fw-bold text-primary">
//                         {row.invoice_no}
//                       </div>
// <small className="text-muted">
//   {formatDate(row.invoice_date)}
// </small>
//                     </td>

//                     <td>
//                       <div className="fw-semibold">{row.company_name}</div>

//                       <small className="text-muted">
//                         Site: {row.site_name || "-"}
//                         {" • "}
//                      Code: {row.x_client_code || "-"}
//                       </small>
//                     </td>

//                     <td className="text-end fw-bold">
//                       {Number(row.final_amount || 0).toLocaleString()}
//                     </td>

//                     <td className="text-end text-success">
//                       {Number(row.paid_amount || 0).toLocaleString()}
//                     </td>

//                     <td className="text-end text-danger fw-bold">
//                       {Number(row.balance_amount || 0).toLocaleString()}
//                     </td>

//                     <td className="text-center">
//                       <Dropdown align="end">
//                         <Dropdown.Toggle
//                           variant="link"
//                           size="sm"
//                           className="text-decoration-none"
//                         >
//                           Action
//                         </Dropdown.Toggle>
//                         <Dropdown.Menu
//                           className="shadow-sm border-0"
//                           popperConfig={{ strategy: "fixed" }}
//                         >
//                          <Dropdown.Item
//  onClick={()=>{
//     setReceiveData({
//       ...receiveData,
//       bill_no: row.invoice_no
//     });

//     setShowReceiveModal(true);
//  }}
// >
//  Receive Amt
// </Dropdown.Item>
//                       <Dropdown.Item
// onClick={()=>{

//   setSelectedBillNo(row.invoice_no);

//   fetchPaymentHistory(row.invoice_no);

//   setShowPaymentHistoryModal(true);

// }}
// >
//  Payment History
// </Dropdown.Item>
//                           <Dropdown.Item
//                             onClick={() =>
//                               navigate(`/billing/print-invoice/${row.auto_no}`)
//                             }
//                           >
//                             Print
//                           </Dropdown.Item>
//                         <Dropdown.Item
//   onClick={() => {
//     setInvoiceChangeData({
//       auto_no: row.auto_no,
//       invoice_no: row.invoice_no,
//       invoice_date: row.invoice_date
//         ? row.invoice_date.split("T")[0]
//         : "",
//       invoice_from: row.invoice_from
//         ? row.invoice_from.split("T")[0]
//         : "",
//       invoice_to: row.invoice_to
//         ? row.invoice_to.split("T")[0]
//         : "",
//     });

//     setShowInvoiceModal(true);
//   }}
// >
//   Inv. Change
// </Dropdown.Item>
// <Dropdown.Item
//   onClick={() => {
//     console.log("Billing Type:", row.billing_type);

//     if (row.billing_type === "Transporter") {
//       navigate(`/billing/edit-transport-bill/${row.auto_no}`);
//     } else {
//       navigate(`/billing/edit-bill/${row.auto_no}`);
//     }
//   }}
// >
//   Edit
// </Dropdown.Item>
//                           {/* <Dropdown.Divider /> */}
//                           <Dropdown.Item
//                             className="text-danger"
//                             onClick={() =>
//                               removeBill(row.auto_no, row.billing_type)
//                             }
//                           >
//                             Delete
//                           </Dropdown.Item>
//                         </Dropdown.Menu>
//                       </Dropdown>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//           <div className="d-flex justify-content-between align-items-center p-3">

//   <span>
//     Showing {billingData.length} of {totalRows} records
//   </span>

//   <div>

//     <Button
//       size="sm"
//       variant="secondary"
//       disabled={page === 0}
//       onClick={() => setPage(page - 1)}
//     >
//       Previous
//     </Button>

//     <span className="mx-3">
//       Page {page + 1} of {totalPages}
//     </span>

//     <Button
//       size="sm"
//       variant="secondary"
//       disabled={page + 1 >= totalPages}
//       onClick={() => setPage(page + 1)}
//     >
//       Next
//     </Button>

//   </div>

// </div>
//         </Card>
//       </div>
//       {/* Import Excel Modal */}
//       <Modal
//         show={showUploadModal}
//         onHide={() => setShowUploadModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Import Excel</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Excel Sheet:</Form.Label>
//             <Form.Control type="file" size="sm" />
//             <Form.Text className="text-muted">
//               Please Upload Excel Sheet Only.
//             </Form.Text>
//           </Form.Group>
//           <div className="text-danger fw-bold mb-3">Attach file to upload.</div>
//         </Modal.Body>
//         <Modal.Footer className="justify-content-start">
//           <Button variant="info" className="text-white">
//             Upload
//           </Button>
//           <Button variant="primary" onClick={handleDownloadTemplate}>
//             Download Template
//           </Button>
//         </Modal.Footer>
//       </Modal>


//       <Modal
//  show={showReceiveModal}
//  onHide={()=>setShowReceiveModal(false)}
//  centered
// >

// <Modal.Header closeButton>
//  <Modal.Title>Receive Amount</Modal.Title>
// </Modal.Header>


// <Modal.Body>


// <Form.Group className="mb-2">
// <Form.Label>Bill No</Form.Label>
// <Form.Control
//  name="bill_no"
//  value={receiveData.bill_no}
//  onChange={handleReceiveChange}
// />
// </Form.Group>


// <Form.Group className="mb-2">
// <Form.Label>Amount</Form.Label>
// <Form.Control
//  type="number"
//  name="amount"
//  value={receiveData.amount}
//  onChange={handleReceiveChange}
// />
// </Form.Group>

// <Form.Group className="mb-2">
//   <Form.Label>Payment Date</Form.Label>

//   <Form.Control
//     type="date"
//     name="payment_date"
//     value={receiveData.payment_date}
//     max={new Date().toISOString().split("T")[0]}
//     onChange={handleReceiveChange}
//   />

// </Form.Group>



// <Form.Group className="mb-2">
// <Form.Label>Transaction Type</Form.Label>

// <Form.Select
//  name="transaction_type"
//  value={receiveData.transaction_type}
//  onChange={handleReceiveChange}
// >

// <option value="">Select</option>
// <option value="Cash">Cash</option>
// <option value="Cheque">Cheque</option>

// <option value="UPI">UPI</option>

// </Form.Select>

// </Form.Group>



// <Form.Group className="mb-2">
// <Form.Label>
// Transaction ID / Cheque No
// </Form.Label>

// <Form.Control
//  name="transaction_id"
//  value={receiveData.transaction_id}
//  onChange={handleReceiveChange}
// />

// </Form.Group>



// <Form.Group className="mb-2">
// <Form.Label>Bank Name</Form.Label>

// <Form.Control
//  name="bank_name"
//  value={receiveData.bank_name}
//  onChange={handleReceiveChange}
// />

// </Form.Group>


// </Modal.Body>


// <Modal.Footer>

// <Button
// variant="secondary"
// onClick={()=>setShowReceiveModal(false)}
// >
// Cancel
// </Button>


// <Button
// variant="success"
// onClick={handleReceiveSubmit}
// >
// Submit
// </Button>


// </Modal.Footer>


// </Modal>   
// <Modal
// show={showPaymentHistoryModal}
// onHide={()=>setShowPaymentHistoryModal(false)}
// size="lg"
// centered
// >

// <Modal.Header closeButton>
// <Modal.Title>
// Payment History - {selectedBillNo}
// </Modal.Title>
// </Modal.Header>


// <Modal.Body>

// {
// historyLoading ?

// <div className="text-center">
// Loading...
// </div>

// :

// paymentHistoryData.length === 0 ?

// <div className="text-center text-muted">
// No Payment History Found
// </div>

// :

// <Table bordered hover size="sm">

// <thead className="bg-light">

// <tr>

// <th>#</th>
// <th>Date</th>
// <th>Amount</th>
// <th>Mode</th>
// <th>Transaction ID</th>
// <th>Bank</th>

// </tr>

// </thead>


// <tbody>

// {
// paymentHistoryData.map((item,index)=>(

// <tr key={item.id || index}>

// <td>{index+1}</td>

// <td>
// {formatDate(item.payment_date)}
// </td>


// <td>
// ₹ {Number(item.paid_amount || 0).toLocaleString("en-IN")}
// </td>


// <td>
// {item.transaction_type || "-"}
// </td>


// <td>
// {item.transaction_id || "-"}
// </td>


// <td>
// {item.bank_name || "-"}
// </td>


// </tr>

// ))
// }


// </tbody>


// </Table>

// }


// </Modal.Body>


// <Modal.Footer>

// <Button
// variant="secondary"
// onClick={()=>setShowPaymentHistoryModal(false)}
// >
// Close
// </Button>

// </Modal.Footer>


// </Modal>

// <Modal
//   show={showInvoiceModal}
//   onHide={() => setShowInvoiceModal(false)}
//   centered
// >
//   <Modal.Header closeButton>
//     <Modal.Title>
//       Invoice no: {invoiceChangeData.invoice_no}
//     </Modal.Title>
//   </Modal.Header>

//   <Modal.Body>
//     <Row>
//       <Col md={6}>
//         <Form.Group className="mb-3">
//           <Form.Label>New Invoice No</Form.Label>
//           <Form.Control
//             name="invoice_no"
//             value={invoiceChangeData.invoice_no}
//             onChange={handleInvoiceChange}
//           />
//         </Form.Group>
//       </Col>

//       <Col md={6}>
//         <Form.Group className="mb-3">
//           <Form.Label>Invoice Date</Form.Label>
//           <Form.Control
//             type="date"
//             name="invoice_date"
//             value={invoiceChangeData.invoice_date}
//             onChange={handleInvoiceChange}
//           />
//         </Form.Group>
//       </Col>

//       <Col md={6}>
//         <Form.Group className="mb-3">
//           <Form.Label>Invoice From</Form.Label>
//           <Form.Control
//             type="date"
//             name="invoice_from"
//             value={invoiceChangeData.invoice_from}
//             onChange={handleInvoiceChange}
//           />
//         </Form.Group>
//       </Col>

//       <Col md={6}>
//         <Form.Group className="mb-3">
//           <Form.Label>Invoice To</Form.Label>
//           <Form.Control
//             type="date"
//             name="invoice_to"
//             value={invoiceChangeData.invoice_to}
//             onChange={handleInvoiceChange}
//           />
//         </Form.Group>
//       </Col>
//     </Row>
//   </Modal.Body>

//   <Modal.Footer>
//     <Button
//       variant="primary"
//       onClick={handleInvoiceSave}
//     >
//       Save Changes
//     </Button>
//   </Modal.Footer>
// </Modal>
//     </div>
//   );

return (
  <Container
    fluid
    className="p-0"
    style={{ fontSize: "13px" }}
  >
    {/* ============================
          HEADER
    ============================ */}

    <Row className="align-items-center justify-content-between mb-4">

      <Col md={4}>
  <h4 className="fw-bold text-dark mb-0">
  {billingTitle}
</h4>
      </Col>

      <Col
        md={8}
        className="d-flex justify-content-md-end justify-content-start mt-3 mt-md-0"
      >

        <Stack
          direction="horizontal"
          gap={2}
          className="flex-wrap"
        >

          {billingPerms?.add_access === 1 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate("/billing/create-bill")
              }
            >
              <FaFileInvoice className="me-1" />
              New Bill
            </Button>
          )}

          {billingPerms?.add_access === 1 && (
            <Button
              variant="dark"
              size="sm"
              onClick={() =>
                navigate(
                  "/billing/create-transport-bill"
                )
              }
            >
              <FaTruck className="me-1" />
              New Transporter Bill
            </Button>
          )}

        </Stack>

      </Col>

    </Row>

     {/* =========================
        FILTER SECTION
    ========================= */}

    <Collapse in={showFilters}>
      <div>

        <Card className="border-0 shadow-sm mb-4">

          <Card.Body>

            <Row>

              {/* Left Side */}
              <Col lg={8} md={12}>

                <Row className="mb-2 fw-bold text-muted small">

                  <Col md={4}>
                    Select Search Field
                  </Col>

                  <Col md={6}>
                    Enter Keyword
                  </Col>

                  <Col md={2}></Col>

                </Row>

                {filters.map((filter, index) => (

                  <Row
                    key={index}
                    className="g-2 mb-2 align-items-center"
                  >

                    {/* Search Field */}
                    <Col md={4}>

                      <Select
                        value={filter.field || null}
                        options={getAvailableOptions(index)}
                        styles={customSelectStyles}
                        placeholder="Select Field..."
                        onChange={(selected) =>
                          handleFieldChange(selected, index)
                        }
                      />

                    </Col>

                    {/* Keyword */}
                    <Col md={6}>
<><Select
  inputValue={filter.keyword || ""}
  value={null}
  options={(searchSuggestions[index] || []).map((item) => ({
    label: item,
    value: item,
  }))}
  placeholder="Search keyword..."
  isClearable
  isSearchable
  styles={customSelectStyles}
  noOptionsMessage={() => "No Suggestions"}

  onInputChange={(value, actionMeta) => {
    if (actionMeta.action === "input-change") {
      handleKeywordChange(
        { target: { value } },
        index
      );
    }
  }}

  onChange={(selected) => {
    const updated = [...filters];

    updated[index].keyword = selected?.value || "";

    setFilters(updated);

    setSearchSuggestions((prev) => ({
      ...prev,
      [index]: [],
    }));
  }}
/>
</>

                    </Col>

                    {/* Add / Remove */}
                    <Col md={2}>

                      <Stack
                        direction="horizontal"
                        gap={1}
                      >

                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={addFilter}
                          disabled={
                            !filter.field ||
                            filters.length >=
                              fieldOptions.length - 1
                          }
                        >
                          <FaPlus />
                        </Button>

                        {filters.length > 1 && (

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              removeFilter(index)
                            }
                          >
                            <FaMinus />
                          </Button>

                        )}

                      </Stack>

                    </Col>

                  </Row>

                ))}

              </Col>

              {/* ========= Right Side starts in Part 1B-2 ========= */}

              <Col
                lg={4}
                md={12}
                className="border-start ps-lg-3 mt-3 mt-lg-0"
              >
                                {/* Month / Year */}

                <Row className="g-2">

                  <Col md={6}>

                    <Select
                      value={selectedMonth}
                      options={monthOptions}
                      styles={customSelectStyles}
                      placeholder="Month"
                      onChange={(selected) =>
                        setSelectedMonth(selected)
                      }
                    />

                  </Col>

                  <Col md={6}>

                    <Select
                      value={selectedYear}
                      options={yearOptions}
                      styles={customSelectStyles}
                      placeholder="Year"
                      isSearchable
                      onChange={handleYearChange}
                    />

                  </Col>

                </Row>

                {/* Buttons */}

                <Stack
                  direction="horizontal"
                  gap={2}
                  className="mt-3"
                >

                  <Button
                    variant="success"
                    size="sm"
                    className="flex-fill"
                    onClick={handleSearch}
                  >
                    <FaSearch className="me-1" />
                    Search
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>

                </Stack>

              </Col>

            </Row>

          </Card.Body>

        </Card>

      </div>

    </Collapse>

    {/* =========================
        TABLE CARD STARTS HERE
        (Part 2)
    ========================= */}

      {/* =========================
        BILLING TABLE CARD
    ========================= */}

    <Card className="border-0 shadow-sm">

      {/* Header */}

      <Card.Header className="bg-white border-bottom">

        <Row className="align-items-center">

          <Col lg={4}>
            <h5 className="fw-bold mb-0">
              All Billing Summary
            </h5>
          </Col>

          <Col
            lg={8}
            className="d-flex justify-content-lg-end mt-3 mt-lg-0"
          >

            <Stack
              direction="horizontal"
              gap={2}
              className="flex-wrap"
            >

              {gstType !== "all" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPage(0);
                    setGstType("all");
                  }}
                >
                  View All Bills
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setPage(0);
                  setGstType("gst");
                }}
              >
                View GST Bills
              </Button>

              <Button
                variant="info"
                size="sm"
                className="text-white"
                onClick={() => {
                  setPage(0);
                  setGstType("non-gst");
                }}
              >
                View Non GST Bills
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  setShowFilters(!showFilters)
                }
              >
                {showFilters
                  ? "Hide Search"
                  : "Click Here To Search"}
              </Button>

              {billingPerms?.export_access === 1 && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={downloadExcel}
                >
                  <FaDownload className="me-1" />
                  Download Report
                </Button>
              )}

              {/* {billingPerms?.add_access === 1 && (
                <Button
                  variant="info"
                  size="sm"
                  className="text-white"
                  onClick={handleUploadClick}
                >
                  <FaUpload className="me-1" />
                  Wages Bulk Upload
                </Button>
              )} */}

            </Stack>

          </Col>

        </Row>

      </Card.Header>

      {/* Summary */}

      <Card.Body className="pb-2">

        <Row>

          <Col>

            <h6 className="fw-bold mb-0">

              Total Bills Generated :
              <span className="text-success ms-1">
                {summary.totalBills}
              </span>

              {" | "}

              Billing Amount :
              <span className="text-success ms-1">
                {Number(
                  summary.totalAmount || 0
                ).toLocaleString("en-IN")}
              </span>

              {" | "}

              Payment Received :
              <span className="text-success ms-1">
                {Number(
                  summary.totalReceived || 0
                ).toLocaleString("en-IN")}
              </span>

              {" | "}

              <span className="text-danger">

                Payment Not Received :

                {" "}

                {Number(
                  summary.balanceAmount || 0
                ).toLocaleString("en-IN")}

              </span>

            </h6>

          </Col>

        </Row>

      </Card.Body>

      {/* Table */}
<Card className="border-0 shadow-sm overflow-visible">

  <Card.Body className="p-0 overflow-visible">
    <Table
  hover
  className="align-middle mb-0"
>

        <thead className="table-light">

          <tr>

            <th className="px-3">
              INVOICE
            </th>
<th>
  BILLING COMPANY / BRANCH
</th>
            <th>
              CLIENT
            </th>

            <th className="text-end">
              TOTAL
            </th>

            <th className="text-end">
              PAID
            </th>

            <th className="text-end">
              DUE
            </th>

            <th className="text-center">
              ACTION
            </th>

          </tr>

        </thead>

      <tbody>

  {loading ? (

    <tr>
      <td
        colSpan={6}
        className="text-center py-4"
      >
        Loading...
      </td>
    </tr>

  ) : billingData.length === 0 ? (

    <tr>
      <td
        colSpan={6}
        className="text-center py-4"
      >
        No Records Found
      </td>
    </tr>

  ) : (

    billingData.map((row) => (

      <tr key={row.id}>

        {/* Invoice */}

        <td className="px-3">

          <div className="fw-bold text-primary">
            {row.invoice_no}
          </div>

          <small className="text-muted">
            {formatDate(row.invoice_date)}
          </small>

        </td>
<td>
  {/* Billing Company */}
  <div className="fw-semibold text-primary">
    {row.billing_company || "-"}
  </div>

  
  {/* Billing Branch */}
  <div className="mt-2">
    <span className="text-muted">Branch: </span>
    <span className="fw-semibold">
      {row.billing_branch || "-"}
    </span>
  </div>
  </td>
        {/* Client */}

        <td>

          <div className="fw-semibold">
            {row.company_name}
          </div>

          <small className="text-muted">

            Site : {row.site_name || "-"}

            {" • "}

            Code : {row.x_client_code || "-"}

          </small>

        </td>

        {/* Total */}

        <td className="text-end fw-bold">

          {Number(
            row.final_amount || 0
          ).toLocaleString("en-IN")}

        </td>

        {/* Paid */}

        <td className="text-end text-success">

          {Number(
            row.paid_amount || 0
          ).toLocaleString("en-IN")}

        </td>

        {/* Due */}

        <td className="text-end text-danger fw-bold">

          {Number(
            row.balance_amount || 0
          ).toLocaleString("en-IN")}

        </td>

        {/* Action */}

    <td
  className="text-center"
  style={{
    position: "relative",
    overflow: "visible",
  }}
>

      <Dropdown align="end">
  <Dropdown.Toggle
    variant="link"
    size="sm"
    className="text-decoration-none"
  >
    Action
  </Dropdown.Toggle>

  <Dropdown.Menu
    align="end"
    renderOnMount
    container="body"
  >
                            {/* Receive Amount */}
<Dropdown.Item
  onClick={() => {

    setSelectedBill(row);

    setReceiveData({
      bill_no: row.invoice_no,
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      transaction_type: "",
      transaction_id: "",
      bank_name: "",
    });

    setShowReceiveModal(true);
  }}
>
  Receive Amt
</Dropdown.Item>


              {/* Payment History */}

              <Dropdown.Item
                onClick={() => {

                  setSelectedBillNo(row.invoice_no);

                  fetchPaymentHistory(
                    row.invoice_no
                  );

                  setShowPaymentHistoryModal(true);

                }}
              >
                Payment History
              </Dropdown.Item>


              {/* Print */}

              <Dropdown.Item
                onClick={() =>
                  navigate(
                    `/billing/print-invoice/${row.auto_no}`
                  )
                }
              >
                Print
              </Dropdown.Item>


              {/* Invoice Change */}

              <Dropdown.Item
                onClick={() => {

                  setInvoiceChangeData({

                    auto_no: row.auto_no,

                    invoice_no:
                      row.invoice_no,

                    invoice_date:
                      row.invoice_date
                        ? row.invoice_date.split("T")[0]
                        : "",

                    invoice_from:
                      row.invoice_from
                        ? row.invoice_from.split("T")[0]
                        : "",

                    invoice_to:
                      row.invoice_to
                        ? row.invoice_to.split("T")[0]
                        : "",

                  });


                  setShowInvoiceModal(true);

                }}
              >
                Inv. Change
              </Dropdown.Item>


              {/* Edit */}

              <Dropdown.Item
                onClick={() => {

                  if (
                    row.billing_type === "Transporter"
                  ) {

                    navigate(
                      `/billing/edit-transport-bill/${row.auto_no}`
                    );

                  } else {

                    navigate(
                      `/billing/edit-bill/${row.auto_no}`
                    );

                  }

                }}
              >
                Edit
              </Dropdown.Item>


              <Dropdown.Divider />


              {/* Delete */}

              <Dropdown.Item
                className="text-danger"
                onClick={() =>
                  removeBill(
                    row.auto_no,
                    row.billing_type
                  )
                }
              >
                Delete
              </Dropdown.Item>


            </Dropdown.Menu>

          </Dropdown>

        </td>


      </tr>

    ))

  )}

</tbody>

</Table>

  </Card.Body>

</Card>

{/* Pagination */}

<Row className="align-items-center p-3">

  <Col>

    <span>
      Showing {billingData.length} of {totalRows} records
    </span>

  </Col>


  <Col className="text-end">

    <Stack
      direction="horizontal"
      gap={3}
      className="justify-content-end"
    >

      <Button
        size="sm"
        variant="secondary"
        disabled={page === 0}
        onClick={() =>
          setPage(page - 1)
        }
      >
        Previous
      </Button>


      <span>
        Page {page + 1} of {totalPages}
      </span>


      <Button
        size="sm"
        variant="secondary"
        disabled={
          page + 1 >= totalPages
        }
        onClick={() =>
          setPage(page + 1)
        }
      >
        Next
      </Button>


    </Stack>

  </Col>

</Row>


</Card>
{/* ============================
    IMPORT EXCEL MODAL
============================ */}

<Modal
  show={showUploadModal}
  onHide={() => setShowUploadModal(false)}
  centered
>

  <Modal.Header closeButton>

    <Modal.Title>
      Import Excel
    </Modal.Title>

  </Modal.Header>


  <Modal.Body>

    <Form.Group className="mb-3">

      <Form.Label>
        Excel Sheet:
      </Form.Label>


      <Form.Control
        type="file"
        size="sm"
      />


      <Form.Text className="text-muted">

        Please Upload Excel Sheet Only.

      </Form.Text>


    </Form.Group>


    <Alert
      variant="danger"
      className="fw-bold mb-0"
    >
      Attach file to upload.
    </Alert>


  </Modal.Body>


  <Modal.Footer
    className="justify-content-start"
  >

    <Button
      variant="info"
      className="text-white"
    >
      Upload
    </Button>


    <Button
      variant="primary"
      onClick={handleDownloadTemplate}
    >
      Download Template
    </Button>


  </Modal.Footer>


</Modal>
{/* ============================
    RECEIVE AMOUNT MODAL
============================ */}

<Modal
  show={showReceiveModal}
  onHide={() => setShowReceiveModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Receive Amount</Modal.Title>
  </Modal.Header>

  <Modal.Body>

    {selectedBill && (
      <Table bordered size="sm" className="mb-3">
        <tbody>
          <tr>
            <th width="40%">Bill No</th>
            <td>{selectedBill.invoice_no}</td>
          </tr>

          <tr>
            <th>Bill Date</th>
            <td>{formatDate(selectedBill.invoice_date)}</td>
          </tr>

          <tr>
            <th>Total Amount</th>
            <td className="text-primary fw-bold">
              ₹ {Number(selectedBill.final_amount).toLocaleString("en-IN")}
            </td>
          </tr>

          <tr>
            <th>Paid Amount</th>
            <td className="text-success fw-bold">
              ₹ {Number(selectedBill.paid_amount).toLocaleString("en-IN")}
            </td>
          </tr>

          <tr>
            <th>Due Amount</th>
            <td className="text-danger fw-bold">
              ₹ {Number(selectedBill.balance_amount).toLocaleString("en-IN")}
            </td>
          </tr>
        </tbody>
      </Table>
    )}

    {/* Amount */}

    <Form.Group className="mb-3">
      <Form.Label>Amount</Form.Label>

      <Form.Control
        type="number"
        name="amount"
        max={dueAmount}
        value={receiveData.amount}
        onChange={handleReceiveChange}
      />

      <small className="text-danger">
        Maximum Amount : ₹ {dueAmount.toLocaleString("en-IN")}
      </small>
    </Form.Group>

    {/* Payment Date */}

    <Form.Group className="mb-3">
      <Form.Label>Payment Date</Form.Label>

      <Form.Control
        type="date"
        name="payment_date"
        value={receiveData.payment_date}
        max={new Date().toISOString().split("T")[0]}
        onChange={handleReceiveChange}
      />
    </Form.Group>

    {/* Transaction Type */}

    <Form.Group className="mb-3">
      <Form.Label>Transaction Type</Form.Label>

      <Form.Select
        name="transaction_type"
        value={receiveData.transaction_type}
        onChange={handleReceiveChange}
      >
        <option value="">Select</option>
        <option value="Cash">Cash</option>
        <option value="Cheque">Cheque</option>
        <option value="UPI">UPI</option>
       
      </Form.Select>
    </Form.Group>

    {/* Cash असेल तर काहीही दाखवू नको */}

    {receiveData.transaction_type !== "Cash" &&
      receiveData.transaction_type !== "" && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>
              {receiveData.transaction_type === "Cheque"
                ? "Cheque No"
                : "Transaction ID"}
            </Form.Label>

            <Form.Control
              name="transaction_id"
              value={receiveData.transaction_id}
              onChange={handleReceiveChange}
              placeholder={
                receiveData.transaction_type === "Cheque"
                  ? "Enter Cheque No"
                  : "Enter Transaction ID"
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bank Name</Form.Label>

            <Form.Control
              name="bank_name"
              value={receiveData.bank_name}
              onChange={handleReceiveChange}
              placeholder="Enter Bank Name"
            />
          </Form.Group>
        </>
      )}

  </Modal.Body>

  <Modal.Footer>

    <Button
      variant="secondary"
      onClick={() => setShowReceiveModal(false)}
    >
      Cancel
    </Button>

    <Button
      variant="success"
      onClick={handleReceiveSubmit}
    >
      Receive Payment
    </Button>

  </Modal.Footer>
</Modal>
{/* ============================
    PAYMENT HISTORY MODAL
============================ */}

<Modal
  show={showPaymentHistoryModal}
  onHide={() => setShowPaymentHistoryModal(false)}
  size="lg"
  centered
>

  <Modal.Header closeButton>

    <Modal.Title>
      Payment History - {selectedBillNo}
    </Modal.Title>

  </Modal.Header>


  <Modal.Body>


    {historyLoading ? (

      <div className="text-center">

        Loading...

      </div>


    ) : paymentHistoryData.length === 0 ? (


      <div className="text-center text-muted">

        No Payment History Found

      </div>


    ) : (


      <Table
        bordered
        hover
        size="sm"
        responsive
      >

        <thead className="table-light">

          <tr>

            <th>
              #
            </th>

            <th>
              Date
            </th>

            <th>
              Amount
            </th>

            <th>
              Mode
            </th>

            <th>
              Transaction ID
            </th>

            <th>
              Bank
            </th>

          </tr>

        </thead>


        <tbody>


          {paymentHistoryData.map(
            (item, index) => (

              <tr
                key={
                  item.id || index
                }
              >

                <td>
                  {index + 1}
                </td>


                <td>
                  {formatDate(
                    item.payment_date
                  )}
                </td>


                <td>

                  ₹{" "}
                  {Number(
                    item.paid_amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}

                </td>


                <td>

                  {item.transaction_type || "-"}

                </td>


                <td>

                  {item.transaction_id || "-"}

                </td>


                <td>

                  {item.bank_name || "-"}

                </td>


              </tr>

            )
          )}


        </tbody>


      </Table>


    )}


  </Modal.Body>


  <Modal.Footer>


    <Button
      variant="secondary"
      onClick={() =>
        setShowPaymentHistoryModal(false)
      }
    >

      Close

    </Button>


  </Modal.Footer>


</Modal>
{/* ============================
    INVOICE CHANGE MODAL
============================ */}

<Modal
  show={showInvoiceModal}
  onHide={() => setShowInvoiceModal(false)}
  centered
>

  <Modal.Header closeButton>

    <Modal.Title>
      Invoice No: {invoiceChangeData.invoice_no}
    </Modal.Title>

  </Modal.Header>


  <Modal.Body>

    <Row>


      <Col md={6}>

        <Form.Group className="mb-3">

          <Form.Label>
            New Invoice No
          </Form.Label>


          <Form.Control

            name="invoice_no"

            value={
              invoiceChangeData.invoice_no
            }

            onChange={
              handleInvoiceChange
            }

          />


        </Form.Group>


      </Col>



      <Col md={6}>

        <Form.Group className="mb-3">

          <Form.Label>
            Invoice Date
          </Form.Label>


          <Form.Control

            type="date"

            name="invoice_date"

            value={
              invoiceChangeData.invoice_date
            }

            onChange={
              handleInvoiceChange
            }

          />


        </Form.Group>


      </Col>




      <Col md={6}>

        <Form.Group className="mb-3">

          <Form.Label>
            Invoice From
          </Form.Label>


          <Form.Control

            type="date"

            name="invoice_from"

            value={
              invoiceChangeData.invoice_from
            }

            onChange={
              handleInvoiceChange
            }

          />


        </Form.Group>


      </Col>




      <Col md={6}>

        <Form.Group className="mb-3">

          <Form.Label>
            Invoice To
          </Form.Label>


          <Form.Control

            type="date"

            name="invoice_to"

            value={
              invoiceChangeData.invoice_to
            }

            onChange={
              handleInvoiceChange
            }

          />


        </Form.Group>


      </Col>


    </Row>


  </Modal.Body>



  <Modal.Footer>


    <Button

      variant="primary"

      onClick={
        handleInvoiceSave
      }

    >

      Save Changes

    </Button>


  </Modal.Footer>


</Modal>


{/* ============================
    END CONTAINER
============================ */}

  </Container>
);
};

export default Billing;
