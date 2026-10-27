import React, { useState } from "react";
import POList from "./POList";
import POForm from "./POForm";
import InvoiceView from "./InvoiceView";

const PurchaseOrder = () => {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);

  return (
    <div className="container-fluid p-0 min-vh-100">
      {viewInvoice ? (
        <InvoiceView data={viewInvoice} onBack={() => setViewInvoice(null)} />
      ) : showForm ? (
        <POForm
          editData={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
        />
      ) : (
        <POList
          onAdd={() => setShowForm(true)}
          onEdit={(item) => {
            console.log("EDIT DATA:", item);

            setEditData(item);

            setShowForm(true);
          }}
          onView={(item) => {
            console.log("VIEW INVOICE DATA:", item);

            setViewInvoice(item);
          }}
        />
      )}
    </div>
  );
};

export default PurchaseOrder;
