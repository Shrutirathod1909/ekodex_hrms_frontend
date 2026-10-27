import React, { useEffect, useState } from "react";
import axios from "axios";
import InvoiceView from "../PurchaseOrder/InvoiceView";
import POListView from "./POListView";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaFileExcel,
  FaTrash,
  FaFilter,
} from "react-icons/fa";

const GoodReceivedList = ({
  onAdd,
  onEdit,
  onView,
}) => {
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
const [showPaymentModal, setShowPaymentModal] =
  useState(false);
const [selectedInvoice, setSelectedInvoice] =
  useState(null);
const [paymentData, setPaymentData] = useState({
  po_no: "",
  amount: "",
  transaction_type: "Cash",
  txn_no: "",
  cheque_no: "",
  bank_name: "",
});
const API_URL = import.meta.env.VITE_API_URL || "";
const token = localStorage.getItem("token") || "";

  const [goodsReceived, setGoodsReceived] =
    useState([]);
const [poResult, setPoResult] = useState(null);
const [loading, setLoading] = useState(false);


  // SHOW / HIDE SEARCH
  const [showSearch, setShowSearch] =
    useState(false);

  // DIRECT PO SEARCH
  const [directPONumber, setDirectPONumber] =
    useState("");

  // SEARCH ROWS
  const [searchRows, setSearchRows] =
    useState([
      {
        search_by: "",
        keyword: "",
      },
    ]);

  // FILTERS
  const [filters, setFilters] =
    useState({
      date_filter: "",
      from_date: "",
      to_date: "",
    });

const fetchGoodsReceived = async () => {
  try {
    setLoading(true);

    const res = await axios.get(
      `${API_URL}/api/good-received/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

   setGoodsReceived(
  Array.isArray(res.data)
    ? res.data
    : res.data?.data || []
);// ✅ FIX HERE
  } catch (error) {
    console.log(error);
    setGoodsReceived([]);
  } finally {
    setLoading(false);
  }
};
  // FETCH DATA


  // INITIAL LOAD
  useEffect(() => {
    fetchGoodsReceived();
  }, []);

const fetchPOView = async () => {

  // EMPTY CHECK
  if (!directPONumber) {
    alert("Please Enter PO Number");
    return;
  }

  // CHECK ALREADY RECEIVED
  const alreadyReceived = goodsReceived.find(
    (item) =>
      String(item.po_no).trim() ===
      String(directPONumber).trim()
  );

  // IF FOUND
  if (alreadyReceived) {
    alert("PO Already Received");
    return;
  }

  try {

    setLoading(true);

    const res = await axios.get(
      `${API_URL}/api/grn/${directPONumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPoResult(res.data);

    // HIDE LIST
    setGoodsReceived([]);

  } catch (error) {

    console.log("PO Fetch Error:", error);

    alert("PO Not Found");

    setPoResult(null);

  } finally {

    setLoading(false);

  }

};


const openPaymentPopup = (item) => {

  setPaymentData({
    po_no: item.po_no || "",
    amount:
      Number(item.total_amount || 0) -
      Number(item.paid_amount || 0),
    transaction_type: "Cash",
    txn_no: "",
    cheque_no: "",
    bank_name: "",
  });

  setShowPaymentModal(true);

};
const submitPayment = async () => {

  try {

    // ================= VALIDATION =================

    // AMOUNT
    if (!paymentData.amount) {
      alert("Please Enter Amount");
      return;
    }

    // ONLINE VALIDATION
    if (
      paymentData.transaction_type === "Online" &&
      !paymentData.txn_no
    ) {
      alert("Please Enter Transaction Number");
      return;
    }

    // CHEQUE VALIDATION
    if (
      paymentData.transaction_type === "Cheque"
    ) {

      if (!paymentData.cheque_no) {
        alert("Please Enter Cheque Number");
        return;
      }

      if (!paymentData.bank_name) {
        alert("Please Enter Bank Name");
        return;
      }
    }

    // ================= CURRENT ITEM =================

    const currentItem = goodsReceived.find(
      (x) =>
        String(x.po_no).trim() ===
        String(paymentData.po_no).trim()
    );

    if (!currentItem) {
      alert("PO Data Not Found");
      return;
    }

    // ================= CALCULATIONS =================

    const totalAmount = Number(
      currentItem?.total_amount || 0
    );

    const oldPaid = Number(
      currentItem?.paid_amount || 0
    );

    const newPaid = Number(
      paymentData.amount || 0
    );

    // EXTRA VALIDATION
    if (newPaid <= 0) {
      alert("Amount Must Be Greater Than 0");
      return;
    }

    if (newPaid > (totalAmount - oldPaid)) {
      alert("Payment Amount Exceeds Balance");
      return;
    }

    const balance = Math.max(
      0,
      totalAmount - (oldPaid + newPaid)
    );

    // ================= PAYLOAD =================

    const payload = {

      po_no: paymentData.po_no,

      supplier_name:
        currentItem?.supplier_name ||
        currentItem?.supplier ||
        "",

      total: totalAmount,

      paid: newPaid,

      balance: balance,

      payment_date: new Date(),

      // DYNAMIC PAYMENT TYPE
      payment_type:
        paymentData.transaction_type,

      // ONLINE TXN NO
      transaction_no:
        paymentData.transaction_type === "Online"
          ? paymentData.txn_no
          : "",

      invoice_no:
        currentItem?.invoice_no || "",

      // CHEQUE DETAILS
      bank_name:
        paymentData.transaction_type === "Cheque"
          ? paymentData.bank_name
          : "",

      cheque_no:
        paymentData.transaction_type === "Cheque"
          ? paymentData.cheque_no
          : "",

      created_by:
        Number(
          localStorage.getItem("user_id")
        ) || 1,

      created_by_name:
        localStorage.getItem("user_name") ||
        "Admin",
    };

    console.log("PAYLOAD => ", payload);

    // ================= API CALL =================

    const res = await axios.post(
      `${API_URL}/api/grn-payment`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(res.data);

    alert("Payment Submitted Successfully");

    // ================= RESET =================

    setShowPaymentModal(false);

    setPaymentData({
      po_no: "",
      amount: "",
      transaction_type: "Cash",
      txn_no: "",
      cheque_no: "",
      bank_name: "",
    });

    // ================= REFRESH =================

    fetchGoodsReceived();

  } catch (error) {

    console.log(error);

    alert(
      error?.response?.data?.message ||
      "Payment Failed"
    );

  }

};
  // ADD SEARCH ROW
  const addSearchRow = () => {

    setSearchRows([
      ...searchRows,
      {
        search_by: "",
        keyword: "",
      },
    ]);

  };

  // UPDATE SEARCH ROW
  const updateSearchRow = (
    index,
    field,
    value
  ) => {

    const updatedRows = [
      ...searchRows,
    ];

    updatedRows[index][field] =
      value;

    setSearchRows(updatedRows);

  };

  // REMOVE SEARCH ROW
  const removeSearchRow = (
    index
  ) => {

    const updatedRows =
      searchRows.filter(
        (_, i) => i !== index
      );

    setSearchRows(updatedRows);

  };

  // RESET
  const handleReset = () => {

    setDirectPONumber("");

    setSearchRows([
      {
        search_by: "",
        keyword: "",
      },
    ]);

    setFilters({
      date_filter: "",
      from_date: "",
      to_date: "",
    });

    setTimeout(() => {
      fetchGoodsReceived();
    }, 100);

  };
// SEARCH + FILTER
// FILTERED DATA
const filteredData = goodsReceived.filter(
  (item) => {

    let isMatch = true;

    // SEARCH FILTER
    searchRows.forEach((row) => {

      if (
        row.search_by &&
        row.keyword
      ) {

   let fieldValue = "";

// DATE FIELD
if (
  row.search_by === "po_date" ||
  row.search_by === "received_date"
) {

  fieldValue = item[row.search_by]
    ? new Date(item[row.search_by])
        .toLocaleDateString("en-CA") // YYYY-MM-DD
    : "";

} else {

  fieldValue = String(
    item[row.search_by] || ""
  )
    .toLowerCase()
    .trim();

}

        const keyword = row.keyword
          .toLowerCase()
          .trim();

        if (
          !fieldValue.includes(keyword)
        ) {
          isMatch = false;
        }
      }

    });

    // DATE FILTER
// DATE FILTER USING created_on
if (
  filters.from_date &&
  filters.to_date
) {

  const itemDate = new Date(
    item.created_on
  );

  const fromDate = new Date(
    filters.from_date
  );

  const toDate = new Date(
    filters.to_date
  );

  // REMOVE TIME
  itemDate.setHours(0,0,0,0);
  fromDate.setHours(0,0,0,0);
  toDate.setHours(0,0,0,0);

  // CHECK RANGE
  if (
    itemDate < fromDate ||
    itemDate > toDate
  ) {
    isMatch = false;
  }

}

    return isMatch;

  }
);
const grandTotalAmount = filteredData.reduce(
  (sum, item) => sum + Number(item.total_amount || 0),
  0
);

const grandPaidAmount = filteredData.reduce(
  (sum, item) => sum + Number(item.paid_amount || 0),
  0
);

const grandBalanceAmount = grandTotalAmount - grandPaidAmount;
  // EXCEL
 const downloadExcel = () => {
  const data = filteredData.map((item, index) => ({
    "Sr No": index + 1,
    "PO Number": item.po_no,
    "Supplier": item.supplier,
    "Order Qty": item.order_qty,
    "Received Qty": item.received_qty,
    "Balance Qty": (item.order_qty || 0) - (item.received_qty || 0),
    "Total Amount": item.total_amount,
    "Paid Amount": item.paid_amount,
    "Balance Amount":
      (item.total_amount || 0) - (item.paid_amount || 0),
    "PO Date": item.po_date
      ? new Date(item.po_date).toLocaleDateString()
      : "",
    "Received Date": item.received_date
      ? new Date(item.received_date).toLocaleDateString()
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "GRN Data");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(file, "Goods_Received_List.xlsx");
};
  if (selectedInvoice) {
  return (
    <InvoiceView
      data={selectedInvoice}
      onBack={() =>
        setSelectedInvoice(null)
      }
    />
  );
}
 return (
  <div className="container-fluid mt-2">

   {
  poResult ? (
  <POListView
  poData={poResult?.items || []}
  orderInfo={poResult}
  onBack={() => {
    setPoResult(null);
    fetchGoodsReceived();
  }}
  onSuccess={() => {
    setShowSuccessScreen(true);
    setPoResult(null);
    fetchGoodsReceived(); 
  }}
/>
    ) : (
      <>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">

          <div className="d-flex align-items-center gap-2 flex-wrap">

            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: "17px" }}>
                Goods Received List
              </h5>

              <small className="text-muted" style={{ fontSize: "11px" }}>
                Manage GRN Records
              </small>
            </div>

            {/* PO SEARCH */}
            <div className="d-flex align-items-center gap-1 ms-2">

              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: "220px", height: "32px", fontSize: "12px" }}
                placeholder="Search PO Number..."
                value={directPONumber}
                onChange={(e) => setDirectPONumber(e.target.value)}
              />

              <button className="btn btn-primary btn-sm" onClick={fetchPOView}>
                <FaSearch />
              </button>

            </div>

          </div>

          {/* FILTER BUTTON */}
          <div className="d-flex gap-1">
            <button
              className="btn btn-light btn-sm border"
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaFilter className="me-1" />
              {showSearch ? "Hide Search" : "Show Search"}
            </button>
          </div>

        </div>

        {/* SEARCH PANEL */}
  {/* SEARCH PANEL */}
{showSearch && (
  <div className="card border-0 shadow-sm mb-2">
    <div className="card-body p-2">

      {/* SEARCH ROWS */}
      {searchRows.map((row, index) => (
        <div className="row g-2 mb-2 align-items-center" key={index}>

          {/* SEARCH BY */}
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={row.search_by}
              onChange={(e) =>
                updateSearchRow(index, "search_by", e.target.value)
              }
            >
              <option value="">Search By</option>
              <option value="supplier">Supplier</option>
              <option value="po_no">PO No</option>
              <option value="po_date">PO Date</option>
              <option value="received_date">Received Date</option>
            </select>
          </div>

          {/* KEYWORD WITH ICON */}
          <div className="col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Keyword"
                value={row.keyword}
                onChange={(e) =>
                  updateSearchRow(index, "keyword", e.target.value)
                }
              />
            </div>
          </div>

          {/* ADD / DELETE BUTTONS */}
          <div className="col-md-2 d-flex gap-1">

            <button
              className="btn btn-success btn-sm"
              onClick={addSearchRow}
            >
              +
            </button>

            {index !== 0 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeSearchRow(index)}
              >
                🗑
              </button>
            )}

          </div>

        </div>
      ))}

      {/* DATE FILTER + ACTIONS */}
      <div className="row g-2 align-items-center">

        {/* FROM DATE */}
        <div className="col-md-2">
          <div className="input-group input-group-sm">
            <span className="input-group-text">📅</span>
            <input
              type="date"
              className="form-control"
              value={filters.from_date}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  from_date: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* TO DATE */}
        <div className="col-md-2">
          <div className="input-group input-group-sm">
            <span className="input-group-text">📅</span>
            <input
              type="date"
              className="form-control"
              value={filters.to_date}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  to_date: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="col-md-4 d-flex gap-1">

          <button className="btn btn-primary btn-sm">
            🔍
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
          >
            🔄
          </button>

          <button
            className="btn btn-success btn-sm"
            onClick={downloadExcel}
          >
            📊
          </button>

        </div>

      </div>

    </div>
  </div>
)}

        {/* TABLE */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">

            <div
  className="rounded shadow-sm border bg-white"
  style={{
    overflow: "hidden", // SCROLL REMOVE
  }}
>
<div className="row mb-2 g-2">

  <div className="col-4">
    <div className="p-2 text-center bg-primary text-white rounded">
      <small>Total</small>
      <div className="fw-bold">
        ₹ {grandTotalAmount.toFixed(2)}
      </div>
    </div>
  </div>

  <div className="col-4">
    <div className="p-2 text-center bg-success text-white rounded">
      <small>Paid</small>
      <div className="fw-bold">
        ₹ {grandPaidAmount.toFixed(2)}
      </div>
    </div>
  </div>

  <div className="col-4">
    <div className="p-2 text-center bg-danger text-white rounded">
      <small>Balance</small>
      <div className="fw-bold">
        ₹ {grandBalanceAmount.toFixed(2)}
      </div>
    </div>
  </div>

</div>
  <table
    className="table table-hover table-bordered align-middle mb-0"
    style={{
      fontSize: "13px",
      marginBottom: 0,
    }}
  >

    {/* HEADER */}
    <thead
      className="text-center"
      style={{
        background: "#212529",
        color: "#fff",
      }}
    >
      <tr>
        <th>#</th>
        <th>PO Number</th>
        <th>Supplier Name</th>
        <th>Order Qty</th>
        <th>Received Qty</th>
        <th>Balance Qty</th>
        <th>Total Amount</th>
        <th>Paid Amount</th>
        <th>Balance Amount</th>
        <th>PO Date</th>
        <th>Received Date</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>

    {/* BODY */}
    <tbody>

      {loading ? (
        <tr>
          <td colSpan="13" className="text-center p-4">
            Loading...
          </td>
        </tr>
      ) : filteredData.length === 0 ? (
        <tr>
          <td colSpan="13" className="text-center p-4">
            No Data Found
          </td>
        </tr>
      ) : (
      (Array.isArray(filteredData)
  ? filteredData
  : []).map(
          (item, index) => {

            const orderQty = Number(item.order_qty || 0);
            const receivedQty = Number(item.received_qty || 0);
            const balanceQty = orderQty - receivedQty;

            const totalAmount = Number(item.total_amount || 0);
            const paidAmount = Number(item.paid_amount || 0);
            const balanceAmount = totalAmount - paidAmount;
// FILTERED DATA

            return (
              
              <tr key={index} className="text-center">

                <td>{index + 1}</td>

                <td>
                  <span className="badge bg-primary">
                    {item.po_no}
                  </span>
                </td>

                <td className="fw-semibold">
                  {item.supplier}
                </td>

                <td>{orderQty}</td>

                <td>
                  <span className="badge bg-success">
                    {receivedQty}
                  </span>
                </td>

                <td>
                  <span
                    className={`badge ${
                      balanceQty > 0
                        ? "bg-warning text-dark"
                        : "bg-success"
                    }`}
                  >
                    {balanceQty}
                  </span>
                </td>

                <td className="text-primary fw-bold">
                  ₹ {totalAmount.toFixed(2)}
                </td>

                <td className="text-success fw-bold">
                  ₹ {paidAmount.toFixed(2)}
                </td>

                <td className="text-danger fw-bold">
                  ₹ {balanceAmount.toFixed(2)}
                </td>

                <td>
                  {item.po_date
                    ? new Date(item.po_date)
                        .toLocaleDateString("en-GB")
                    : "-"}
                </td>

                <td>
                  {item.received_date
                    ? new Date(item.received_date)
                        .toLocaleDateString("en-GB")
                    : "-"}
                </td>

                <td>
                  <span
                    className={`badge ${
                      balanceQty === 0
                        ? "bg-success"
                        : receivedQty > 0
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {balanceQty === 0
                      ? "Completed"
                      : receivedQty > 0
                      ? "Partial"
                      : "Pending"}
                  </span>
                </td>

                <td>

                  <div className="dropdown">

                    <button
                      className="btn btn-dark btn-sm dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      Action
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">


                      <li>
                        <button
                          className="dropdown-item"
                          
                          onClick={() => openPaymentPopup(item)}
                          
                        >
                          💰 Payment
                        </button>
                      </li>

                  <li>
  <button
    className="dropdown-item"
onClick={async () => {

  try {

    const res = await axios.get(
      `${API_URL}/api/grn/${item.po_no}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("FULL INVOICE => ", res.data);

    setSelectedInvoice(res.data);

  } catch (error) {

    console.log(error);

    alert("Invoice Data Not Found");

  }

}}
  >
    🖨 Print Invoice
  </button>
</li>

                    </ul>

                  </div>

                </td>

              </tr>
            );
          }
        )
      )}

    </tbody>

  </table>

</div>

          </div>
        </div>
{/* PAYMENT MODAL */}
{showPaymentModal && (

  <div
    className="modal d-block"
    tabIndex="-1"
    style={{
      background: "rgba(0,0,0,0.5)",
    }}
  >

    <div className="modal-dialog modal-dialog-centered">

      <div className="modal-content border-0 shadow">

        {/* HEADER */}
        <div className="modal-header bg-dark text-white">

          <h5 className="modal-title">
            Payment Entry
          </h5>

          <button
            className="btn-close btn-close-white"
            onClick={() =>
              setShowPaymentModal(false)
            }
          ></button>

        </div>

        {/* BODY */}
        <div className="modal-body">

          {/* PO NUMBER */}
          <div className="mb-2">

            <label className="form-label fw-bold">
              PO Number
            </label>

            <input
              type="text"
              className="form-control"
              value={paymentData.po_no}
              readOnly
            />

          </div>

          {/* AMOUNT */}
          <div className="mb-2">

            <label className="form-label fw-bold">
              Amount
            </label>

            <input
              type="number"
              className="form-control"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  amount: e.target.value,
                })
              }
            />

          </div>

          {/* TRANSACTION TYPE */}
          <div className="mb-2">

            <label className="form-label fw-bold">
              Transaction Type
            </label>

            <select
              className="form-select"
              value={paymentData.transaction_type}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  transaction_type:
                    e.target.value,
                })
              }
            >

              <option value="Cash">
                Cash
              </option>

              <option value="Online">
                Online
              </option>

              <option value="Cheque">
                Cheque
              </option>

            </select>

          </div>

          {/* TXN NO */}
          {paymentData.transaction_type ===
            "Online" && (

            <div className="mb-2">

              <label className="form-label fw-bold">
                Transaction No
              </label>

              <input
                type="text"
                className="form-control"
                value={paymentData.txn_no}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    txn_no:
                      e.target.value,
                  })
                }
              />

            </div>

          )}

          {/* CHEQUE */}
          {paymentData.transaction_type ===
            "Cheque" && (
            <>

              <div className="mb-2">

                <label className="form-label fw-bold">
                  Cheque No
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={paymentData.cheque_no}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      cheque_no:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="mb-2">

                <label className="form-label fw-bold">
                  Bank Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={paymentData.bank_name}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      bank_name:
                        e.target.value,
                    })
                  }
                />

              </div>

            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="modal-footer">

          <button
            className="btn btn-secondary"
            onClick={() =>
              setShowPaymentModal(false)
            }
          >
            Cancel
          </button>

          <button
            className="btn btn-success"
            onClick={submitPayment}
          >
            Submit
          </button>

        </div>

      </div>

    </div>

  </div>

)}
      </>
    )}

  </div>
  
);

};

export default GoodReceivedList;