import React, { useRef } from "react";
import { FaArrowLeft, FaFilePdf } from "react-icons/fa";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoiceTemplate from "./InvoiceTemplate";

const InvoiceView = ({ data, onBack }) => {
  const invoiceRef = useRef();

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;

    // Captures the component layout cleanly into a high-res image canvas canvas snapshot
    const canvas = await html2canvas(element, {
      scale: 2, // Enhances text crispness inside the document rendering
      useCORS: true, // Safeguards image loaders like logos
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    // Creates standard portrait standard document dimensions layout matching international rules
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // Standard A4 Width in mm
    const pageHeight = 295; // Standard A4 Height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Appends screenshot asset into formal pdf page block elements safely
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handles automatic multi-page splitting if the invoice grows long
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Direct download action triggers
    pdf.save(`Tax_Invoice_${data?.invoice_no || "ODS"}.pdf`);
  };

  return (
    <div className="container p-0 min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded-3">
        <button
          className="btn btn-outline-dark rounded-pill px-4 fw-semibold"
          onClick={onBack}
        >
          <FaArrowLeft size={12} className="me-2" /> Back
        </button>
        <button
          className="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold"
          onClick={handleDownloadPDF}
        >
          <FaFilePdf size={13} /> Download PDF Invoice
        </button>
      </div>

      <div ref={invoiceRef} className="mx-auto border p-1 bg-white">
        <InvoiceTemplate data={data} />
      </div>
    </div>
  );
};

export default InvoiceView;
