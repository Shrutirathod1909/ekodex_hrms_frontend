import React from "react";
import "./TermsAndConditions.css";
// import termsImg from "../assets/images/terms.png";
import Footer from "../layouts/Footer";

const TermsAndConditions = () => {
  return (
    <>
    <div className="terms-page">

      {/* Hero Section */}

      <div className="terms-hero">
        {/* <img
          src={termsImg}
          alt="Terms & Conditions"
          className="terms-hero-image"
        /> */}

        <div className="terms-overlay"></div>

        <div className="terms-content">
         

          <h1>Terms & Conditions</h1>

          <p>Secure, Transparent & Trusted Policies</p>
        </div>
      </div>

      {/* Content */}

      <div className="terms-container">
        <div className="terms-card">

          <PolicySection title="Account Terms">
            <ul className="terms-list">
              <li>You must be 18 years or older to use this service.</li>
              <li>You must provide accurate account information.</li>
              <li>You are responsible for maintaining account security.</li>
              <li>EKODEX  is not responsible for unauthorized access.</li>
              <li>Illegal or unauthorized use is prohibited.</li>
              <li>You are responsible for all uploaded content.</li>
              <li>Uploading harmful files or viruses is prohibited.</li>
              <li>Violation of terms may result in account termination.</li>
            </ul>
          </PolicySection>

          <PolicySection title="General Conditions">
            <ul className="terms-list">
              <li>You must agree to all policies before using the service.</li>
              <li>We may modify or discontinue services without notice.</li>
              <li>We reserve the right to refuse service.</li>
              <li>Services are provided "as is".</li>
              <li>We do not guarantee uninterrupted service.</li>
              <li>Illegal content may be removed at any time.</li>
              <li>We are not liable for indirect damages.</li>
              <li>Technical support is available for paid users.</li>
              <li>Abuse toward staff may result in termination.</li>
            </ul>
          </PolicySection>

          <PolicySection title="Payment of Fees">
            <ul className="terms-list">
              <li>Payments must follow billing cycles.</li>
              <li>Invoices should be paid within 7 days.</li>
              <li>Taxes are the responsibility of the user.</li>
              <li>No refunds are provided after payment.</li>
            </ul>
          </PolicySection>

          <PolicySection title="Cancellation & Termination">
            <ul className="terms-list">
              <li>Cancellation may result in permanent data deletion.</li>
              <li>Fraudulent activities may lead to account suspension.</li>
            </ul>
          </PolicySection>

          <PolicySection title="Modifications">
            <ul className="terms-list">
              <li>Prices may change with prior notice.</li>
              <li>Services may be updated anytime.</li>
            </ul>
          </PolicySection>

          <PolicySection title="Prohibited Activities">
            <ul className="terms-list">
              <li>Illegal trade of goEKODEX is prohibited.</li>
              <li>Restricted items include narcotics and weapons.</li>
              <li>Hosting prohibited content may terminate the account.</li>
            </ul>
          </PolicySection>

          <div className="contact-box">
            <p>
              For any queries contact:
              <b> help@EKODEX.in</b>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}

    

    </div>
    <Footer/>
  </>  );
};

export default TermsAndConditions;

function PolicySection({ title, children }) {
  return (
    <div className="terms-section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}