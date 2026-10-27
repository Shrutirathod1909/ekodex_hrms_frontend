import React from "react";
import { Link, useNavigate } from "react-router-dom";
// import logo from "../assets/images/ods_logo.jpeg";
import logo from "../assets/images/logo2.jpg";


export default function Footer() {
   const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/login");
    window.scrollTo(0, 0);
  };

  return (

    <footer
      style={{
        background: "#ffffff",
        color: "#1f2937",
        padding: "18px 0",
        marginTop: "auto",
        borderTop: "1px solid #e5e7eb",
      }}
    >

      <div className="container-fluid px-3 px-md-4 px-lg-5">

        <div
          className="
          row
          align-items-center
          justify-content-between
          gy-3
          "
        >

          {/* ===================================== */}
          {/* LEFT - LOGO */}
          {/* ===================================== */}

          <div
            className="
            col-12
            col-lg-3
            d-flex
            align-items-center
            justify-content-center
            justify-content-lg-start
            gap-2
            "
          >

       <img
              src={logo}
              alt="EKODEX Logo"
              onClick={handleLogoClick}
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "40px",
                objectFit:'contain',
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            />

            <div>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  lineHeight: "18px",
                }}
              >
            EKODEX TECHNOLOGIES PVT LTD
              </div>

              <small
                style={{
                  color: "#6b7280",
                  fontSize: "11px",
                }}
              >
                Security & Facility Management
              </small>

            </div>

          </div>

          {/* ===================================== */}
          {/* CENTER - LINKS */}
          {/* ===================================== */}

          <div
            className="
            col-12
            col-lg-6
            "
          >

            <div
              className="
              d-flex
              align-items-center
              justify-content-center
              flex-wrap
              gap-2
              gap-md-3
              "
            >

              {[
                {
                  name:
                    "Refund & Cancellation Policy",
                  path: "/refund",
                },
                {
                  name: "Privacy Policy",
                  path: "/privacy",
                },
                {
                  name: "Terms of Service",
                  path: "/terms",
                },
              ].map((item, i) => (

<Link
  key={i}
  to={item.path}
  onClick={() => {
    window.scrollTo(0, 0);

    const el = document.querySelector(".main-content");
    if (el) el.scrollTop = 0;
  }}
  style={{
    color: "#374151",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "500",
    padding: "5px 10px",
    borderRadius: "6px",
    transition: "0.2s",
    whiteSpace: "nowrap",
  }}
>
  {item.name}
</Link>

              ))}

            </div>

          </div>

          {/* ===================================== */}
          {/* RIGHT - COPYRIGHT */}
          {/* ===================================== */}

          <div
            className="
            col-12
            col-lg-3
            text-center
            text-lg-end
            "
          >

            <small
              style={{
                color: "#6b7280",
                fontSize: "12px",
              }}
            >
              © {new Date().getFullYear()} EKODEX Pvt Ltd
            </small>

          </div>

        </div>

      </div>

    </footer>
  );
}