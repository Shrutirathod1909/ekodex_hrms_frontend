import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  FaArrowLeft,
  FaFilePdf,
} from "react-icons/fa";

import html2canvas from "html2canvas";

import { jsPDF } from "jspdf";

import InvoiceTemplate from "../InvoiceTemplate";

const InvoiceView = ({
  data,
  onBack,
}) => {

  const invoiceRef = useRef();

  const [companyData, setCompanyData] =
    useState(null);

  const [supplierData, setSupplierData] =
    useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL;

  // COMPANY API
  useEffect(() => {
    fetchCompany();
  }, []);

  // SUPPLIER API
  useEffect(() => {

    if (data?.supplier_name) {
      fetchSupplier(
        data.supplier_name
      );
    }

  }, [data]);

  // COMPANY
  const fetchCompany = async () => {

    try {

      const response =
        await axios.get(
          `${API_URL}/api/invoice-company`
        );

      console.log(
        "COMPANY API:",
        response.data
      );

      setCompanyData(
        response.data
      );

    } catch (error) {

      console.error(
        "COMPANY API ERROR:",
        error
      );

    }

  };

  // SUPPLIER
  const fetchSupplier = async (
    supplierName
  ) => {

    try {

      const response =
        await axios.get(
          `${API_URL}/api/invoice-company/supplier/${supplierName}`
        );

      console.log(
        "SUPPLIER API:",
        response.data
      );

      setSupplierData(
        response.data
      );

    } catch (error) {

      console.error(
        "SUPPLIER API ERROR:",
        error
      );

    }

  };

  // PDF
  const handleDownloadPDF =
    async () => {

      const element =
        invoiceRef.current;

      const canvas =
        await html2canvas(
          element,
          {
            scale: 2,
            useCORS: true,
          }
        );

      const imgData =
        canvas.toDataURL(
          "image/jpeg",
          1.0
        );

      const pdf = new jsPDF(
        "p",
        "mm",
        "a4"
      );

      const imgWidth = 210;

      const pageHeight = 295;

      const imgHeight =
        (canvas.height *
          imgWidth) /
        canvas.width;

      let heightLeft =
        imgHeight;

      let position = 0;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -=
        pageHeight;

      while (
        heightLeft > 0
      ) {

        position =
          heightLeft -
          imgHeight;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -=
          pageHeight;

      }

      pdf.save(
        `Invoice_${data?.invoice_no || "ODS"}.pdf`
      );

    };

  return (
    <div className="container p-0 min-vh-100">

      {/* TOP BUTTONS */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded-3">

        <button
          className="btn btn-outline-dark"
          onClick={onBack}
        >
          <FaArrowLeft className="me-2" />
          Back
        </button>

        <button
          className="btn btn-danger"
          onClick={
            handleDownloadPDF
          }
        >
          <FaFilePdf className="me-2" />
          Download PDF
        </button>

      </div>

      {/* TEMPLATE */}
      <InvoiceTemplate
        ref={invoiceRef}
        data={data}
        companyData={
          companyData
        }
        supplierData={
          supplierData
        }
      />

    </div>
  );

};

export default InvoiceView;