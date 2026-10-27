
import React from "react";
import "./RefundCancellationPolicy.css";
// import refundImg from "../assets/images/refund.png";
import Footer from "../layouts/Footer";

export default function RefundCancellationPolicy() {
 return (
  <>
    <div className="refund-page">

      {/* Hero Section */}

      <div className="refund-hero">
        {/* <img
          src={refundImg}
          alt="Refund Policy"
          className="refund-hero-image"
        /> */}

        <div className="refund-overlay"></div>

        <div className="refund-content">
          <h1>Refund & Cancellation Policy</h1>
          <p>Simple, Secure & Transparent</p>
        </div>
      </div>

      {/* Content */}

      <div className="refund-container">
        <div className="refund-card">

          <div className="refund-section">
            <h2>Account Cancellation</h2>

            <p>
              You may cancel your account at any time by emailing
              <b> help@EKODEX.in</b>.
            </p>

            <p>
              After cancellation, all data will be permanently deleted
              and cannot be recovered.
            </p>
          </div>

          <div className="refund-section">
            <h2>Final Billing</h2>

            <p>
              If the service is canceled mid-month, a final invoice
              will be sent.
            </p>

            <p>
              After payment, no further charges will be applied.
            </p>
          </div>

          <div className="refund-section">
            <h2>No Refunds</h2>

            <p>
              We do not provide refunds under any circumstances,
              including partial usage or early cancellation.
            </p>
          </div>

          <div className="refund-section">
            <h2>Service Modification / Termination</h2>

            <p>
              We reserve the right to modify, suspend, or terminate
              services at any time without prior notice.
            </p>
          </div>

          <div className="refund-section">
            <h2>Fraudulent Activity</h2>

            <p>
              If fraudulent or illegal activity is detected, we may
              suspend or terminate the account immediately.
            </p>
          </div>

          <div className="refund-section">
            <h2>Support</h2>

            <p>
              By using our services, you agree to this policy.
            </p>

            <p>
              Email: <b>help@EKODEX.in</b>
            </p>
          </div>

        </div>
      </div>

    </div>

    {/* Common Footer */}
    <Footer />
  </>
);
}


