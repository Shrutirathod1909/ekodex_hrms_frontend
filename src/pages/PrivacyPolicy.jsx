PrivacyPolicy.jsx

import React from "react";
import "./PrivacyPolicy.css";
// import privacyImg from "../assets/images/PrivacyPolicy.png";
import Footer from "../layouts/Footer";

export default function PrivacyPolicy() {
  return (
    <>
    <div className="privacy-page">

      {/* Hero Section */}

      <div className="privacy-hero">
        {/* <img
          src={privacyImg}
          alt="Privacy Policy"
          className="privacy-hero-image"
        /> */}

        <div className="privacy-overlay"></div>

        <div className="privacy-content">
        

          <h1>Privacy Policy</h1>

          <p>Your Privacy Is Our Priority</p>
        </div>
      </div>

      {/* Content */}

      <div className="privacy-container">
        <div className="privacy-card">

          <div className="privacy-section">
            <h2>Introduction</h2>

            <p>
              This privacy policy outlines EKODEX 's commitment to protecting
              your personal information. It details the types of data we
              collect, how we use it, and the measures we take to ensure its
              security.
            </p>

            <p>
              This policy applies to all users of EKODEX 's services,
              including customers, partners, and employees who interact
              with our platforms and systems.
            </p>

            <p>
              Understanding this policy is essential to your experience
              with EKODEX , and we encourage you to carefully review the
              complete document.
            </p>

            <p>
              We are dedicated to transparent data handling practices and
              your right to privacy.
            </p>
          </div>

          <div className="privacy-section">
            <h2>Information Collected</h2>

            <p>
              EKODEX  collects various types of information to provide
              and improve its services.
            </p>

            <h3>Personal Information</h3>

            <ul>
              <li>Contact Information: Name, email, phone number and address.</li>
              <li>Account Information: Username, password and login credentials.</li>
              <li>Payment Information: Credit/debit card and bank details.</li>
              <li>Government Identification: PAN or Aadhaar details with consent.</li>
            </ul>

            <h3>Transactional Data</h3>

            <ul>
              <li>Shipping Information</li>
              <li>Order Information</li>
              <li>Payment Transaction Details</li>
            </ul>

            <h3>Device Information</h3>

            <ul>
              <li>IP Address</li>
              <li>Device Type</li>
              <li>Location Data</li>
            </ul>

            <h3>Usage Data</h3>

            <ul>
              <li>Website Activity</li>
              <li>Application Usage</li>
              <li>Communication Data</li>
            </ul>

            <h3>Cookies and Similar Technologies</h3>

            <p>
              EKODEX  uses cookies to improve user experience,
              personalize services and analyze website usage.
            </p>
          </div>

          <div className="privacy-section">
            <h2>How Information is Used</h2>

            <h3>Providing Services</h3>

            <p>
              Personal and transactional data helps process orders,
              deliveries and support requests.
            </p>

            <h3>Improving User Experience</h3>

            <p>
              Cookies and usage data help improve functionality and
              personalize the platform.
            </p>

            <h3>Marketing and Communication</h3>

            <p>
              With your consent, EKODEX  may send promotional updates
              and important notifications.
            </p>
          </div>

          <div className="privacy-section">
            <h2>Data Sharing and Disclosure</h2>

            <p>
              EKODEX  may share information with trusted third-party
              providers for:
            </p>

            <ul>
              <li>Payment Processing</li>
              <li>Shipping Logistics</li>
              <li>Data Analytics</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>Data Security</h2>

            <ul>
              <li>Encryption of sensitive information.</li>
              <li>Role-based access control.</li>
              <li>Firewalls and intrusion detection systems.</li>
              <li>Regular audits and employee security training.</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>User Rights and Choices</h2>

            <ul>
              <li>Access your personal information.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion where applicable.</li>
              <li>Restrict processing of information.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>Changes to the Privacy Policy</h2>

            <p>
              EKODEX  may update this Privacy Policy from time to time.
              The latest version will always be available on our website.
            </p>

            <p>
              We recommend reviewing this page periodically to stay
              informed about our data practices.
            </p>
          </div>

        </div>
      </div>

    </div>
  <Footer />
  </>
  );
}

