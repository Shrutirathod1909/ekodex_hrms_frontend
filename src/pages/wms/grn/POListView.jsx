import React, {
  useState,
  useEffect,
} from "react";

import Select from "react-select";

import {
  FaSave,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

const POListView = ({
  orderInfo,
  onBack,
  onSuccess,
}) => {

  const [rows, setRows] =
    useState([]);

  const [editMode, setEditMode] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);

  // ===============================
  // WAREHOUSE
  // ===============================
  const [warehouseOptions, setWarehouseOptions] =
    useState([]);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL;

  // ===============================
  // LOAD PRODUCTS
  // ===============================
  useEffect(() => {

    if (orderInfo?.products) {

      const formatted =
        orderInfo.products.map((item) => ({
          ...item,
          received_qty:
            item.received_qty ?? "",
        }));

      setRows(formatted);
    }

  }, [orderInfo]);

  // ===============================
  // FETCH WAREHOUSE
  // ===============================
  const fetchWarehouses =
    async () => {

      try {

        const response =
          await fetch(
            `${API_URL}/api/warehouse`,
            {
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem(
                    "token"
                  )}`,
              },
            }
          );

        const data =
          await response.json();

        const options =
          data.map((item) => ({
            value: item.id,

            label:
              item.client_code ? `${item.warehouse_name} (${item.client_code})` : item.warehouse_name,

            warehouse_name:
              item.warehouse_name,

            warehouse_id:
              item.id,
          }));

        setWarehouseOptions(options);

      } catch (error) {

        console.error(
          "Warehouse Fetch Error",
          error
        );
      }
    };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // ===============================
  // HANDLE CHANGE
  // ===============================
  const handleChange = (
    index,
    value
  ) => {

    setRows((prevRows) => {

      const updated = [...prevRows];

      const qty = Number(
        updated[index].qty
      );

      const inputVal =
        value === ""
          ? ""
          : Number(value);

      if (
        inputVal !== "" &&
        inputVal < 0
      ) {
        return prevRows;
      }

      if (
        inputVal !== "" &&
        inputVal > qty
      ) {
        return prevRows;
      }

      updated[index] = {
        ...updated[index],

        received_qty: value,
      };

      return updated;
    });
  };

  // ===============================
  // SAVE
  // ===============================
  const handleSave = async () => {

    // VALIDATION
    if (!selectedWarehouse) {

      alert("Please Select Warehouse");

      return;
    }

    setLoading(true);

    try {

      const userData =
        JSON.parse(
          localStorage.getItem("user")
        );

      const payload =
        rows.map((item) => ({

          po_no:
            orderInfo?.invoice_no,

          po_date:
            orderInfo?.order_date,

          supplier:
            orderInfo?.supplier_name,

          product_name:
            item.product_name,

          sku_code:
            item.sku,

          order_qty:
            item.qty,

          received_qty:
            Number(
              item.received_qty || 0
            ),

          total_amount:
            item.total_amount || 0,

          received_date:
            new Date().toISOString(),

          // ===============================
          // WAREHOUSE
          // ===============================
          warehouse_id:
            selectedWarehouse?.warehouse_id,

          warehouse_name:
            selectedWarehouse?.warehouse_name,

          // ===============================
          // USER
          // ===============================
          received_by:
            userData?.id,

          received_by_name:
            userData?.name,

          created_by:
            userData?.id,

          created_by_name:
            userData?.name,

          created_on:
            new Date().toISOString(),

          order_no:
            orderInfo?.order_no,
        }));

      const res = await fetch(
        `${API_URL}/api/good-received/insert`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${localStorage.getItem(
                "token"
              )}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await res.json();

      if (res.ok) {

        alert(
          "✅ Good Received Saved Successfully"
        );

        setEditMode(false);

        setIsSuccess(true);

        if (onSuccess) {
          onSuccess();
        }

      } else {

        alert(
          data.message ||
            "❌ Save Failed"
        );
      }

    } catch (error) {

      console.error(error);

      alert("❌ Server Error");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="container-fluid mt-3">

      {/* HEADER */}
      <div className="card shadow-sm border-0 mb-3">

        <div className="card-body py-3">

          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">

            {/* LEFT */}
            <div>

              <h5 className="mb-1">
                📦 PO Details
              </h5>

              <div
                style={{
                  fontSize: "14px",
                }}
              >
                <strong>PO:</strong>
                {" "}
                {orderInfo?.invoice_no}

                {" "}
                |

                {" "}
                <strong>
                  Supplier:
                </strong>

                {" "}
                {orderInfo?.supplier_name}
              </div>

            </div>

            {/* RIGHT */}
            <div className="d-flex gap-2 flex-wrap">

              <button
                className="btn btn-secondary btn-sm"
                onClick={onBack}
              >
                <FaArrowLeft />
                {" "}
                Back
              </button>

              <button
                className={`btn btn-sm ${
                  editMode
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                onClick={() =>
                  setEditMode(
                    !editMode
                  )
                }
              >
                <FaCheckCircle />
                {" "}
                {editMode
                  ? "ON"
                  : "Receive"}
              </button>

              {editMode && (

                <button
                  className="btn btn-primary btn-sm"
                  onClick={
                    handleSave
                  }
                  disabled={
                    loading
                  }
                >
                  <FaSave />
                  {" "}

                  {loading
                    ? "Saving..."
                    : "Save"}
                </button>
              )}

            </div>

          </div>

          {/* WAREHOUSE */}
          <div className="row mt-3">

            <div className="col-md-4">

              <label className="form-label fw-semibold">
                Warehouse
              </label>

              <Select
                options={
                  warehouseOptions
                }

                value={
                  selectedWarehouse
                }

                onChange={
                  setSelectedWarehouse
                }

                placeholder="Search Warehouse..."

                isSearchable
              />

            </div>

          </div>

        </div>

      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">

        <div className="card-body p-2">

          <div className="table-responsive">

            <table className="table table-bordered table-sm align-middle mb-0">

              <thead className="table-dark">

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Order Qty
                  </th>

                  <th>
                    Received Qty
                  </th>

                  <th>
                    Balance
                  </th>

                  <th>
                    Price
                  </th>

                </tr>

              </thead>

              <tbody>

                {rows.map(
                  (
                    item,
                    index
                  ) => (

                    <tr key={index}>

                      <td>
                        {
                          item.product_name
                        }
                      </td>

                      <td>
                        {item.sku}
                      </td>

                      <td>
                        {item.qty}
                      </td>

                      <td>

                        {editMode ? (

                          <input
                            type="number"
                            className="form-control form-control-sm"

                            value={
                              item.received_qty
                            }

                            onChange={(
                              e
                            ) =>
                              handleChange(
                                index,
                                e.target.value
                              )
                            }
                          />

                        ) : (
                          item.received_qty || 0
                        )}

                      </td>

                      <td>

                        {Number(
                          item.qty
                        ) -
                          Number(
                            item.received_qty || 0
                          )}

                      </td>

                      <td>
                        {
                          item.purchase_price
                        }
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default POListView;