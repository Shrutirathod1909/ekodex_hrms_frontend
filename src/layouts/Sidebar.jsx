import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../api/axios";

import {
  FaTachometerAlt,
  FaThLarge,
  FaLayerGroup,
  FaUser,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaTicketAlt,
  FaChartBar,
  FaPlus,
  FaClipboard,
  FaStore,
  FaEnvelopeOpenText,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// import logo from "../assets/images/ods_logo.jpeg";
import logo from "../assets/images/logo2.jpg";

import "./Sidebar.css";

const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar }) => {
  const location = useLocation(); // चालू असलेला URL ट्रॅक करण्यासाठी

  // =========================================
  // MODULE ICONS
  // =========================================
  const moduleIcons = {
    Home: <FaThLarge />,
    Master: <FaLayerGroup />,
    "Add New": <FaPlus />,
    Employee: <FaUser />,
    Attendance: <FaCalendarCheck />,
    Billing: <FaFileInvoiceDollar />,
    Salary: <FaMoneyBillWave />,
    Vouchers: <FaTicketAlt />,
    "Work Order": <FaClipboard />,
    Vendor: <FaStore />,
    "Raise Ticket": <FaEnvelopeOpenText />,
    Reports: <FaChartBar />,
  };

  // =========================================
  // STATES
  // =========================================
  const [menuItems, setMenuItems] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // FETCH MENU
  // =========================================
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Sidebar Token:", token);

        const { data } = await api.get(`${API_URL}/api/permissions/mymenu`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Menu API Response:", data);

        const menuData = data?.menu || data || [];
        setMenuItems(menuData);
        localStorage.setItem("menuItems", JSON.stringify(menuData));
        setError("");
      } catch (err) {
        console.log("Sidebar Error:", err.response?.data);
        setError(
          err.response?.data?.message || err.message || "Failed to load menu",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // =========================================
  // TOGGLE MODULE
  // =========================================
  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  // =========================================
  // CHECK ACTIVE MODULE (FOR BLUE BORDER)
  // =========================================
  const isModuleActive = (module, validSubmodules) => {
    const modulePath = `/${module.moduleName.toLowerCase().replace(/\s+/g, "-")}`;

    // जर सब-मॉड्यूल नसतील तर थेट पाथ चेक करा
    if (validSubmodules.length === 0) {
      return location.pathname === modulePath;
    }

    // जर सब-मॉड्यूल असतील तर त्यापैकी कोणताही एक ॲक्टिव्ह आहे का ते चेक करा
    return validSubmodules.some((sub) => {
      const subPath = `${modulePath}/${sub.moduleName.toLowerCase().replace(/\s+/g, "-")}`;
      return location.pathname === subPath;
    });
  };

  return (
    <nav
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      {/* LOGO */}
      <div className="sidebar-logo-container">
        <NavLink to="/" onClick={() => isMobileOpen && closeSidebar()}>
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </NavLink>
      </div>

      {/* MENU */}
      <ul className="menu-list">
        {/* LOADING & ERROR STATES */}
        {loading && <li className="loading-text">Loading Menu...</li>}
        {error && <li className="error-text">{error}</li>}

        {/* DASHBOARD */}
        <li>
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
            onClick={() => isMobileOpen && closeSidebar()}
            end
          >
            <FaTachometerAlt className="menu-icon" />
            {!isCollapsed && <span className="menu-text">Dashboard</span>}
          </NavLink>
        </li>

        {/* DYNAMIC MODULES */}
        {menuItems
          .filter((module) => {
            if (module.moduleName === "Home") return true;

            return true;
          })
          .map((module) => {
            const validSubmodules =
              module.submodules?.filter(
                (sub) => sub.moduleName && sub.moduleName.trim() !== "",
              ) || [];

            const hasValidSubmodules = validSubmodules.length > 0;
            const isActiveMenu = isModuleActive(module, validSubmodules);
            const moduleSlug = module.moduleName
              .toLowerCase()
              .replace(/\s+/g, "-");

            // ---------------------------------------------------------------
            // केस १: जर सब-मॉड्यूल नसतील (उदा. Vouchers), थेट NavLink रेंडर करा
            // ---------------------------------------------------------------
            if (!hasValidSubmodules) {
              return (
                <li key={module.moduleName}>
                  <NavLink
                    to={`/${moduleSlug}`}
                    className={({ isActive }) =>
                      isActive ? "menu-link active" : "menu-link"
                    }
                    onClick={() => isMobileOpen && closeSidebar()}
                  >
                    <span className="menu-icon">
                      {moduleIcons[module.moduleName] || <FaThLarge />}
                    </span>
                    {!isCollapsed && (
                      <span className="menu-text">{module.moduleName}</span>
                    )}
                  </NavLink>
                </li>
              );
            }

            // ---------------------------------------------------------------
            // केस २: जर सब-मॉड्यूल असतील (उदा. Salary), तरच ड्रॉपडाउन लेआउट दाखवा
            // ---------------------------------------------------------------
            return (
              <li key={module.moduleName}>
                <div
                  className={`menu-link clickable ${isActiveMenu ? "active" : ""}`}
                  onClick={() => toggleModule(module.moduleName)}
                >
                  <span className="menu-icon">
                    {moduleIcons[module.moduleName] || <FaThLarge />}
                  </span>

                  {!isCollapsed && (
                    <>
                      <span className="menu-text">{module.moduleName}</span>
                      <span className="dropdown-icon">
                        {expandedModules[module.moduleName] ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* SUBMODULES LIST */}
                {expandedModules[module.moduleName] && !isCollapsed && (
                  <ul className="submenu-list">
                    {validSubmodules.map((sub) => (
                      <li key={sub.moduleId}>
                        <NavLink
                          to={`/${moduleSlug}/${sub.moduleName
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className={({ isActive }) =>
                            isActive ? "submenu-link active" : "submenu-link"
                          }
                          onClick={() => isMobileOpen && closeSidebar()}
                          style={{ textDecoration: "none" }}
                        >
                          {sub.moduleName}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
      </ul>
    </nav>
  );
};

export default Sidebar;
