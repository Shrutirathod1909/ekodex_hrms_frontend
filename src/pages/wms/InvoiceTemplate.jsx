import React, { forwardRef } from "react";
import odsLogo from "../../assets/images/logo2.jpg";

const InvoiceTemplate = forwardRef(
  (
    {
      data,
      companyData,
      supplierData,
    },
    ref
  ) => {

    // =========================
    // COMPANY
    // =========================
    const company =
      companyData?.data?.[0] || {};

    // =========================
    // SUPPLIER
    // =========================
    const supplier =
      supplierData?.data?.[0] || {};

    // =========================
    // INVOICE
    // =========================
    const invoiceNo =
      data?.invoice_no ||
      data?.po_number ||
      "-";

    // =========================
    // DATE
    // =========================
    const poDateObj =
      data?.order_date
        ? new Date(
            data.order_date
          )
        : null;

    const invoiceDate =
      poDateObj
        ? poDateObj
            .toISOString()
            .split("T")[0]
        : "-";

    // =========================
    // BILL MONTH
    // =========================
    const billMonth =
      poDateObj
        ? poDateObj.toLocaleString(
            "en-US",
            {
              month: "long",
              year: "numeric",
            }
          ).toUpperCase()
        : "-";

    // =========================
    // PERIOD
    // =========================
    const lastDate =
      poDateObj
        ? new Date(
            poDateObj.getFullYear(),
            poDateObj.getMonth() + 1,
            0
          ).getDate()
        : "";

    const poPeriod =
      poDateObj
        ? `01 ${poDateObj.toLocaleString(
            "en-US",
            {
              month: "short",
            }
          ).toUpperCase()} ${poDateObj.getFullYear()}
          TO ${lastDate} ${poDateObj.toLocaleString(
            "en-US",
            {
              month: "short",
            }
          ).toUpperCase()} ${poDateObj.getFullYear()}`
        : "-";

    // =========================
    // ITEMS
    // =========================
  const lineItems =
  data?.products ||
  data?.items ||
  [];

    // =========================
    // TOTALS
    // =========================
    const subTotal =
      lineItems.reduce(
        (acc, item) =>
          acc +
          Number(
            item.qty || 0
          ) *
            Number(
              item.purchase_price ||
                item.mrp ||
                0
            ),
        0
      );

    const totalGst =
      lineItems.reduce(
        (acc, item) => {

          const rate =
            Number(
              item.purchase_price ||
                item.mrp ||
                0
            );

          const qty =
            Number(
              item.qty || 0
            );

          const amount =
            qty * rate;

          return (
            acc +
            (
              Number(
                item.total_amount ||
                  0
              ) - amount
            )
          );

        },
        0
      );

    const grandTotal =
      subTotal + totalGst;

    const cgst =
      totalGst / 2;

    const sgst =
      totalGst / 2;

    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          background: "#f2f2f2",
          padding: "20px",
          fontFamily: "Arial",
          color: "#000",
        }}
      >

        {/* MAIN */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #000",
            padding: "25px",
          }}
        >

          {/* ORIGINAL */}
          <div
            style={{
              textAlign: "right",
              fontSize: "10px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            (ORIGINAL)
          </div>

          {/* HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >

            {/* LOGO */}
            <div
              style={{
                width: "15%",
              }}
            >
              <img
                src={odsLogo}
                alt="logo"
                style={{
                  width: "240px",
                  height: "200px",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* COMPANY */}
            <div
              style={{
                width: "75%",
                textAlign: "center",
              }}
            >

              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                }}
              >
                PURCHASE ORDER INVOICE
              </h2>

              <div
                style={{
                  fontSize: "10px",
                  marginTop: "3px",
                }}
              >
                ISSUED UNDER SECTION 31(1) OF GST ACT 2017
              </div>

              <h3
                style={{
                  margin: "10px 0 5px",
                  fontSize: "20px",
                }}
              >
                {
                  company.company_name
                }
              </h3>

              <div
                style={{
                  fontSize: "11px",
                  lineHeight: "18px",
                }}
              >
                {
                  company.address
                }

                <br />

                MOBILE:
                {" "}
                {
                  company.phone
                }

                {" | "}

                EMAIL:
                {" "}
                {
                  company.email_id
                }

                <br />

                GST NO:
                {" "}
                {
                  company.gst_no
                }

              </div>

            </div>

          </div>

          {/* TOP DETAILS */}
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              marginBottom: "0px",
            }}
          >

            <tbody>

              <tr>

                <td style={tdStyle}>
                  <strong>
                    PO NO:
                  </strong>
                </td>

                <td style={tdStyle}>
                  {
                    invoiceNo
                  }
                </td>

                <td style={tdStyle}>
                  <strong>
                    BILL FOR MONTH:
                  </strong>
                </td>

                <td style={tdStyle}>
                  {
                    billMonth
                  }
                </td>

              </tr>

              <tr>

                <td style={tdStyle}>
                  <strong>
                    PO DATE:
                  </strong>
                </td>

                <td style={tdStyle}>
                  {
                    invoiceDate
                  }
                </td>

                <td style={tdStyle}>
                  <strong>
                    PO PERIOD:
                  </strong>
                </td>

                <td style={tdStyle}>
                  {
                    poPeriod
                  }
                </td>

              </tr>

            </tbody>

          </table>

          {/* FROM / BILL TO */}
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              marginBottom: "0px",
            }}
          >

            <tbody>

              <tr>

                {/* FROM */}
                <td
                  style={{
                    ...tdStyle,
                    width: "50%",
                    verticalAlign:
                      "top",
                  }}
                >

                  <strong>
                    FROM:
                  </strong>

                  <hr />

                  <strong>
                    {
                      company.company_name
                    }
                  </strong>

                  <br />

                  {
                    company.address
                  }

                </td>

                {/* BILL TO */}
                <td
                  style={{
                    ...tdStyle,
                    width: "50%",
                    verticalAlign:
                      "top",
                  }}
                >

                  <strong>
                    BILL TO:
                  </strong>

                  <hr />

                  <strong>
                    {supplier
                      ?.supplier_name ||
                      data?.supplier_name ||
                      "-"}

                  </strong>

                  <br />

                  {
                    supplier.address
                  }

                  <br />

                  GST NO:
                  {" "}
                  {
                    supplier.gst_no
                  }

                </td>

              </tr>

            </tbody>

          </table>

          {/* ITEM TABLE */}
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  SR.
                  NO.
                </th>

                <th style={thStyle}>
                  PARTICULARS
                </th>

                <th style={thStyle}>
                  HSN/SAC
                </th>

                <th style={thStyle}>
                  QTY
                </th>

                <th style={thStyle}>
                  RATE
                </th>

                <th style={thStyle}>
                  AMOUNT
                </th>

                <th style={thStyle}>
                  CGST
                </th>

                <th style={thStyle}>
                  SGST
                </th>

                <th style={thStyle}>
                  TOTAL
                </th>

              </tr>

            </thead>

            <tbody>

              {lineItems.map(
                (
                  item,
                  index
                ) => {

                  const rate =
                    Number(
                      item.purchase_price ||
                        item.mrp ||
                        0
                    );

                  const qty =
                    Number(
                      item.qty || 0
                    );

                  const amount =
                    qty * rate;

                  const gstAmount =
                    Number(
                      item.total_amount ||
                        0
                    ) - amount;

                  return (
                    <tr
                      key={index}
                    >

                      <td style={tdCenter}>
                        {index + 1}
                      </td>

                      <td style={tdStyle}>
                        {
                          item.product_name
                        }
                      </td>

                      <td style={tdCenter}>
                        {
                          item.sku
                        }
                      </td>

                      <td style={tdCenter}>
                        {
                          item.qty
                        }
                      </td>

                      <td style={tdCenter}>
                        ₹
                        {" "}
                        {rate}
                      </td>

                      <td style={tdCenter}>
                        ₹
                        {" "}
                        {amount.toFixed(
                          2
                        )}
                      </td>

                      <td style={tdCenter}>
                        ₹
                        {" "}
                        {(
                          gstAmount / 2
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td style={tdCenter}>
                        ₹
                        {" "}
                        {(
                          gstAmount / 2
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td style={tdCenter}>
                        ₹
                        {" "}
                        {Number(
                          item.total_amount ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>

                    </tr>
                  );

                }
              )}

              {/* TOTAL */}
              <tr>

                <td
                  colSpan="5"
                  style={{
                    ...tdStyle,
                    textAlign:
                      "center",
                    fontWeight:
                      "bold",
                  }}
                >
                  TOTAL
                </td>

                <td style={tdCenter}>
                  ₹
                  {" "}
                  {subTotal.toFixed(
                    2
                  )}
                </td>

                <td style={tdCenter}>
                  ₹
                  {" "}
                  {cgst.toFixed(
                    2
                  )}
                </td>

                <td style={tdCenter}>
                  ₹
                  {" "}
                  {sgst.toFixed(
                    2
                  )}
                </td>

                <td style={tdCenter}>
                  ₹
                  {" "}
                  {grandTotal.toFixed(
                    2
                  )}
                </td>

              </tr>

            </tbody>

          </table>

          {/* BANK + TOTAL */}
          <div
            style={{
              display: "flex",
              border:
                "1px solid #000",
              borderTop: "none",
            }}
          >

            {/* BANK */}
            <div
              style={{
                width: "55%",
                padding: "10px",
                borderRight:
                  "1px solid #000",
              }}
            >

              <strong>
                BANK DETAILS
              </strong>

              <br />

              BANK NAME:
              {" "}
              {
                supplier.bank_name
              }

              <br />

              ACCOUNT NO:
              {" "}
              {
                supplier.account_no
              }

              <br />

              IFSC CODE:
              {" "}
              {
                supplier.ifsc_code
              }

            </div>

            {/* TOTAL */}
            <div
              style={{
                width: "45%",
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                }}
              >

                <tbody>

                  <tr>

                    <td style={tdStyle}>
                      NET TOTAL
                    </td>

                    <td style={tdCenter}>
                      ₹
                      {" "}
                      {subTotal.toFixed(
                        2
                      )}
                    </td>

                  </tr>

                  <tr>

                    <td style={tdStyle}>
                      GST TOTAL
                    </td>

                    <td style={tdCenter}>
                      ₹
                      {" "}
                      {totalGst.toFixed(
                        2
                      )}
                    </td>

                  </tr>

                  <tr>

                    <td
                      style={{
                        ...tdStyle,
                        fontWeight:
                          "bold",
                      }}
                    >
                      GRAND TOTAL
                    </td>

                    <td
                      style={{
                        ...tdCenter,
                        fontWeight:
                          "bold",
                      }}
                    >
                      ₹
                      {" "}
                      {grandTotal.toFixed(
                        2
                      )}
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

          {/* FOOTER */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-end",
            }}
          >

            <div
              style={{
                fontSize: "10px",
                lineHeight:
                  "18px",
              }}
            >
              <strong>
                INVOICE TERMS:
              </strong>

              <br />

              1. ALL PAYMENTS TO BE MADE WITHIN 7 DAYS.

              <br />

              2. GOODS ONCE SOLD WILL NOT BE TAKEN BACK.

              <br />

              3. SUBJECT TO MUMBAI JURISDICTION.

            </div>

            <div
              style={{
                textAlign:
                  "center",
                fontSize: "11px",
              }}
            >

              FOR
              {" "}
              {supplier
                ?.supplier_name ||
                "-"}

              <br />
              <br />
              <br />

              <strong>
                AUTHORISED
                SIGNATORY
              </strong>

            </div>

          </div>

        </div>

      </div>
    );

  }
);

const thStyle = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "center",
  fontSize: "10px",
  background: "#f3f3f3",
};

const tdStyle = {
  border: "1px solid #000",
  padding: "8px",
  fontSize: "10px",
};

const tdCenter = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "center",
  fontSize: "10px",
};

InvoiceTemplate.displayName =
  "InvoiceTemplate";

export default InvoiceTemplate;