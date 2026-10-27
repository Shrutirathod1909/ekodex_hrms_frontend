// import React, { useState, useEffect } from "react";

// import api from "../../api/axios";

// import { Link, useNavigate } from "react-router-dom";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import Select from "react-select";

// import {
//   Form,
//   Button,
//   Container,
//   Row,
//   Col,
//   Card,
//   Image,
//   Alert,
//   InputGroup,
// } from "react-bootstrap";

// import { FaUser, FaLock, FaBuilding, FaCodeBranch } from "react-icons/fa";

// // import logo from "../../assets/images/ods_logo.jpeg";
// import logo from "../../assets/images/logo2.jpg";

// import Footer from "../../layouts/Footer";

// export default function Login() {
//   // =========================================
//   // STATES
//   // =========================================

//   const [submitted, setSubmitted] = useState(false);

//   const [email, setEmail] = useState("");

//   const [password, setPassword] = useState("");

//   const [company, setCompany] = useState();

//   const [branch, setBranch] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const [isCompaniesLoading, setIsCompaniesLoading] = useState(true);
//   const [isBranchesLoading, setIsBranchesLoading] = useState(false);
//   const [isLoginLoading, setIsLoginLoading] = useState(false);

//   const [companies, setCompanies] = useState([]);

//   const [branches, setBranches] = useState([]);

//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   // =========================================
//   // API URL CONSOLE
//   // =========================================

//   console.log("API URL =", import.meta.env.VITE_API_URL);

//   // =========================================
//   // REDIRECT IF TOKEN EXISTS
//   // =========================================

//   // =========================================
//   // CHECK TOKEN + TOKEN EXPIRY
//   // =========================================

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     // No token — already on /login, nothing to do
//     if (!token) {
//       return;
//     }

//     try {
//       // JWT TOKEN SPLIT
//       const payload = JSON.parse(atob(token.split(".")[1]));

//       // EXP TIME IN MS
//       const expiryTime = payload.exp * 1000;

//       // TOKEN EXPIRED
//       if (Date.now() >= expiryTime) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         // Stay on /login — token was bad
//       } else {
//         // Valid token → redirect to dashboard
//         navigate("/");
//       }
//     } catch (err) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       // Stay on /login — token was malformed
//     }
//   }, [navigate]);

//   useEffect(() => {
//     const fetchCompanies = async () => {
//       if (!email.trim()) {
//         setCompanies([]);
//         setCompany("");
//         setBranch("");
//         return;
//       }

//       setIsCompaniesLoading(true);

//       try {
//         const url = `${import.meta.env.VITE_API_URL}/api/auth/companies-by-email?email=${encodeURIComponent(email.trim())}`;

//         console.log("COMPANIES BY EMAIL API URL =", url);

//         const res = await api.get(url);

//         console.log("COMPANIES BY EMAIL RESPONSE =", res.data);

//         const companyData = res.data?.data || [];

//         setCompanies(Array.isArray(companyData) ? companyData : []);

//         // Email change hone par old company/branch clear
//         setCompany("");
//         setBranch("");
//         setBranches([]);
//       } catch (err) {
//         console.error("========== COMPANY API ERROR ==========");
//         console.error("MESSAGE =", err.message);
//         console.error("STATUS =", err.response?.status);
//         console.error("RESPONSE =", err.response?.data);
//         console.error("======================================");

//         setCompanies([]);
//         setCompany("");
//         setBranch("");
//         setBranches([]);
//       } finally {
//         setIsCompaniesLoading(false);
//       }
//     };

//     fetchCompanies();
//   }, [email]);

//   // =========================================
//   // FETCH BRANCHES
//   // =========================================

//   useEffect(() => {
//     if (company) {
//       const fetchBranches = async () => {
//         setIsBranchesLoading(true);
//         try {
//           const res = await api.get(
//             `${import.meta.env.VITE_API_URL}/api/branches/by-company/${company}`,
//           );

//           console.log("Branches API Response =", res.data);

//           setBranches(res.data);
//         } catch (err) {
//           console.error("Error fetching branches", err);

//           setError("Failed to load branches");
//         } finally {
//           setIsBranchesLoading(false);
//         }
//       };

//       fetchBranches();
//     } else {
//       setBranches([]);
//     }
//   }, [company]);

//   // =========================================
//   // DEBUG CONSOLE
//   // =========================================

//   useEffect(() => {
//     console.log("Selected Company =", company);
//   }, [company]);

//   useEffect(() => {
//     console.log("Selected Branch =", branch);
//   }, [branch]);

//   // =========================================
//   // LOGIN SUBMIT
//   // =========================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setSubmitted(true);
//     setError("");

//     if (!email || !password || !company || !branch) {
//       setError("All fields are required");
//       return;
//     }

//     setIsLoginLoading(true);
//     try {
//       const res = await api.post(
//         `${import.meta.env.VITE_API_URL}/api/auth/login`,
//         {
//           email,
//           password,
//           company,
//           branch,
//         },
//       );

//       console.log("Login Response =", res.data);

//       // =========================
//       // SAVE TOKEN + USER
//       // =========================
//       localStorage.setItem("token", res.data.token);

//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       const role = res.data.user.role;
//       const token = res.data.token;

//       // =========================
//       // FETCH PERMISSIONS
//       // =========================
//       const permRes = await api.get(
//         `${import.meta.env.VITE_API_URL}/api/permissions/Admin`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       localStorage.setItem(
//         "permissions",
//         JSON.stringify(permRes.data.detailedPermissions || []),
//       );

//       console.log("Permissions Loaded =", permRes.data.detailedPermissions);

//       // =========================
//       // NAVIGATE
//       // =========================
//       navigate("/");
//     } catch (err) {
//       console.error("Login Error =", err.response?.data);

//       setError(err.response?.data?.msg || "Invalid credentials.");
//     } finally {
//       setIsLoginLoading(false);
//     }
//   };

//   // =========================================
//   // JSX
//   // =========================================

//   return (
//     <div
//       className="d-flex flex-column min-vh-100"
//       style={{
//         background: "linear-gradient(to right, #f8f9fa, #eef1ff)",
//       }}
//     >
//       {/* MAIN SECTION */}

//       <div
//         className="
//     flex-grow-1
//     d-flex
//     align-items-center
//     justify-content-center
//     py-3
//     py-md-4
//     px-2
//     "
//       >
//         <Container fluid>
//           <Card
//             className="
//         shadow-lg
//         border-0
//         mx-auto
//         w-100
//         "
//             style={{
//               maxWidth: "950px",
//               borderRadius: "20px",
//               overflow: "hidden",
//             }}
//           >
//             <Row className="g-0">
//               {/* ========================================= */}
//               {/* LEFT SIDE */}
//               {/* ========================================= */}

//               <Col
//                 xs={12}
//                 lg={6}
//                 className="
//             bg-white
//             p-3
//             p-sm-4
//             p-md-5
//             d-flex
//             flex-column
//             justify-content-center
//             "
//               >
//                 {/* HEADING */}

//                 <div className="text-center mb-4">
//                   <h2
//                     className="
//                 fw-bold
//                 fs-3
//                 fs-md-2
//                 "
//                     style={{
//                       color: "#2f2d69",
//                     }}
//                   >
//                     Welcome to HRMS
//                   </h2>

//                   <p
//                     className="
//                 text-muted
//                 small
//                 "
//                   >
//                     Please login to continue
//                   </p>
//                 </div>

//                 {/* FORM */}

//                 <Form onSubmit={handleSubmit}>
//                   {/* EMAIL */}

//                   <Form.Group className="mb-3">
//                     <InputGroup>
//                       <InputGroup.Text>
//                         <FaUser />
//                       </InputGroup.Text>

//                       <Form.Control
//                         type="email"
//                         placeholder="Username / Email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         isInvalid={submitted && !email}
//                         className="py-2"
//                       />
//                     </InputGroup>

//                     {submitted && !email && (
//                       <small className="text-danger">Email is required</small>
//                     )}
//                   </Form.Group>

//                   {/* PASSWORD */}

//                   <Form.Group className="mb-3">
//                     <InputGroup>
//                       <InputGroup.Text>
//                         <FaLock />
//                       </InputGroup.Text>

//                       <Form.Control
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         isInvalid={submitted && !password}
//                         className="py-2"
//                       />

//                       <InputGroup.Text
//                         style={{ cursor: "pointer" }}
//                         onClick={() => setShowPassword(!showPassword)}
//                       >
//                         {showPassword ? <FaEyeSlash /> : <FaEye />}
//                       </InputGroup.Text>
//                     </InputGroup>

//                     {submitted && !password && (
//                       <small className="text-danger">
//                         Password is required
//                       </small>
//                     )}
//                   </Form.Group>
//                   {/* COMPANY */}

//                   <Form.Group className="mb-3">
//                     <InputGroup>
//                       <InputGroup.Text>
//                         <FaBuilding />
//                       </InputGroup.Text>

//                       <div
//                         style={{
//                           flex: 1,
//                           width: "100%",
//                         }}
//                       >
//                         <Select
//                           options={companies.map((c) => ({
//                             value: String(c.id),
//                             label: c.company_name,
//                           }))}
//                           value={
//                             companies
//                               .map((c) => ({
//                                 value: String(c.id),
//                                 label: c.company_name,
//                               }))
//                               .find((c) => c.value === company) || null
//                           }
//                           onChange={(selectedOption) => {
//                             setCompany(String(selectedOption?.value || ""));

//                             setBranch("");
//                           }}
//                           placeholder="Select Company"
//                           isSearchable
//                           isLoading={isCompaniesLoading}
//                           menuPortalTarget={document.body}
//                           menuPosition="fixed"
//                           styles={{
//                             menuPortal: (base) => ({
//                               ...base,
//                               zIndex: 9999,
//                             }),

//                             control: (provided) => ({
//                               ...provided,
//                               minHeight: "42px",
//                               fontSize: "14px",
//                               borderTopLeftRadius: 0,
//                               borderBottomLeftRadius: 0,
//                               borderColor:
//                                 submitted && !company
//                                   ? "red"
//                                   : provided.borderColor,
//                             }),
//                           }}
//                         />
//                       </div>
//                     </InputGroup>

//                     {submitted && !company && (
//                       <small className="text-danger">Company is required</small>
//                     )}
//                   </Form.Group>

//                   {/* BRANCH */}

//                   <Form.Group className="mb-4">
//                     <InputGroup>
//                       <InputGroup.Text>
//                         <FaCodeBranch />
//                       </InputGroup.Text>

//                       <div
//                         style={{
//                           flex: 1,
//                           width: "100%",
//                         }}
//                       >
//                         <Select
//                           options={branches.map((b) => ({
//                             value: String(b.id),
//                             label: b.branch_name,
//                           }))}
//                           value={
//                             branches
//                               .map((b) => ({
//                                 value: String(b.id),
//                                 label: b.branch_name,
//                               }))
//                               .find((b) => b.value === branch) || null
//                           }
//                           onChange={(selectedOption) => {
//                             setBranch(String(selectedOption?.value || ""));
//                           }}
//                           placeholder="Select Branch"
//                           isSearchable
//                           isLoading={isBranchesLoading}
//                           isDisabled={!company || isCompaniesLoading}
//                           menuPortalTarget={document.body}
//                           menuPosition="fixed"
//                           styles={{
//                             menuPortal: (base) => ({
//                               ...base,
//                               zIndex: 9999,
//                             }),

//                             control: (provided) => ({
//                               ...provided,
//                               minHeight: "42px",
//                               fontSize: "14px",
//                               borderTopLeftRadius: 0,
//                               borderBottomLeftRadius: 0,
//                               borderColor:
//                                 submitted && !branch
//                                   ? "red"
//                                   : provided.borderColor,
//                             }),
//                           }}
//                         />
//                       </div>
//                     </InputGroup>

//                     {submitted && !branch && (
//                       <small className="text-danger">Branch is required</small>
//                     )}
//                   </Form.Group>

//                   {/* ERROR */}

//                   {error && <Alert variant="danger">{error}</Alert>}

//                   {/* BUTTON */}

//                   <div className="d-grid mb-3">
//                     <Button
//                       type="submit"
//                       disabled={isLoginLoading}
//                       className="
//                   py-2
//                   py-md-3
//                   fw-bold
//                   "
//                       style={{
//                         backgroundColor: "#2f2d69",
//                         border: "none",
//                       }}
//                     >
//                       {isLoginLoading ? "LOGGING IN..." : "LOGIN"}
//                     </Button>
//                   </div>

//                   {/* FORGOT PASSWORD */}

//                   <div className="text-center">
//                     <Link
//                       to="/forgot-password"
//                       className="
//                   text-decoration-none
//                   small
//                   "
//                       style={{
//                         color: "#2f2d69",
//                       }}
//                     >
//                       Forgot password?
//                     </Link>
//                   </div>
//                 </Form>
//               </Col>

//               {/* ========================================= */}
//               {/* RIGHT SIDE */}
//               {/* ========================================= */}

//               <Col
//                 xs={12}
//                 lg={6}
//                 className="
//             d-flex
//             align-items-center
//             justify-content-center
//             bg-light
//             p-3
//             p-md-4
//             "
//               >
//                 <Image
//                   src={logo}
//                   alt="Company Logo"
//                   fluid
//                   rounded
//                   style={{
//                     width: "100%",
//                     maxWidth: "320px",
//                     objectFit: "contain",
//                   }}
//                 />
//               </Col>
//             </Row>
//           </Card>
//         </Container>
//       </div>

//       <Footer />
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Select from "react-select";

import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Image,
  Alert,
  InputGroup,
} from "react-bootstrap";

import {
  FaUser,
  FaLock,
  FaBuilding,
  FaCodeBranch,
} from "react-icons/fa";

import logo from "../../assets/images/logo2.jpg";
import Footer from "../../layouts/Footer";

export default function Login() {
  // =========================================
  // STATES
  // =========================================

  const [submitted, setSubmitted] = useState(false);
const [preferredBranchId, setPreferredBranchId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [company, setCompany] = useState("");
  const [branch, setBranch] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isCompaniesLoading, setIsCompaniesLoading] = useState(false);
  const [isBranchesLoading, setIsBranchesLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);

  const [error, setError] = useState("");

  const [fetchStatus, setFetchStatus] = useState("");
  const [fetchStatusType, setFetchStatusType] = useState("");
const [loginCompany, setLoginCompany] = useState(0);

const autoSelectCompany =
  loginCompany === true ||
  String(loginCompany).trim() === "1" ||
  String(loginCompany).trim().toLowerCase() === "true";
  // Role returned by the companies-by-email API, if available.
  const [userRole, setUserRole] = useState("");

  const navigate = useNavigate();

  const isSuperAdmin =
    userRole.trim().toLowerCase().replace(/[\s_-]/g, "") ===
    "superadmin";

  const requiresCompanyAndBranch = !isSuperAdmin;

  console.log("API URL =", import.meta.env.VITE_API_URL);

  // =========================================
  // CHECK TOKEN + TOKEN EXPIRY
  // =========================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000;

      if (Date.now() >= expiryTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
      } else {
        navigate("/");
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
    }
  }, [navigate]);

  // =========================================
  // FETCH COMPANIES BY EMAIL
  // =========================================

  useEffect(() => {
    let cancelled = false;

 
const fetchCompanies = async () => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    setCompanies([]);
    setCompany("");
    setBranch("");
    setBranches([]);
    setPreferredBranchId("");
    setUserRole("");
      setLoginCompany(0);
    setError("");
    setFetchStatus("");
    setFetchStatusType("");
    setIsCompaniesLoading(false);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    setCompanies([]);
    setCompany("");
    setBranch("");
    setBranches([]);
    setPreferredBranchId("");
      setLoginCompany(0);
    setUserRole("");
    setError("");
    setFetchStatus("");
    setFetchStatusType("");
    setIsCompaniesLoading(false);
    return;
  }

  setIsCompaniesLoading(true);
  setFetchStatus("Fetching company...");
  setFetchStatusType("loading");

  setCompany("");
  setBranch("");
  setBranches([]);
  setPreferredBranchId("");
  setLoginCompany(0);
  setUserRole("");
  setError("");

  try {
    const url =
      `${import.meta.env.VITE_API_URL}` +
      `/api/auth/companies-by-email?email=${encodeURIComponent(
        trimmedEmail
      )}`;

    console.log("COMPANIES API URL =", url);

    const res = await api.get(url);
const loginCompanyValue =
  res.data?.user?.login_company ??
  res.data?.login_company ??
  0;

setLoginCompany(loginCompanyValue);

console.log("LOGIN COMPANY =", loginCompanyValue);
const autoSelectCompany =
  loginCompanyValue === true ||
  String(loginCompanyValue).trim() === "1" ||
  String(loginCompanyValue).trim().toLowerCase() === "true";

console.log("LOGIN COMPANY VALUE =", loginCompanyValue);
console.log("LOGIN COMPANY TYPE =", typeof loginCompanyValue);
console.log("AUTO SELECT COMPANY =", autoSelectCompany);
    if (cancelled) return;

    console.log("COMPANIES RESPONSE =", res.data);

    const companyData = Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    const roleFromResponse =
      res.data?.user?.role ||
      res.data?.role ||
      "";

  const selectedCompanyId =
  res.data?.selectedCompanyId ?? null;

const selectedBranchId =
  res.data?.selectedBranchId ?? null;

setUserRole(String(roleFromResponse));

setPreferredBranchId(
  selectedBranchId != null
    ? String(selectedBranchId)
    : ""
);

    setUserRole(String(roleFromResponse));

    // Save branch ID returned by API
    setPreferredBranchId(
      selectedBranchId !== null
        ? String(selectedBranchId)
        : ""
    );

    console.log("USER ROLE =", roleFromResponse);
    console.log("COMPANIES FOUND =", companyData.length);
    console.log("PREFERRED BRANCH ID =", selectedBranchId);

    setCompanies(companyData);

    const normalizedRole = String(roleFromResponse)
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, "");

    if (normalizedRole === "superadmin") {
      setCompany("");
      setBranch("");
      setBranches([]);
      setPreferredBranchId("");
      setError("");
      setFetchStatus("");
      setFetchStatusType("");
      return;
    }

  if (companyData.length === 0) {
  setCompany("");
  setBranch("");
  setBranches([]);
  setError("No company assigned to this user");
} else if (selectedCompanyId != null) {
  const matchedCompany = companyData.find(
    (c) => String(c.id) === String(selectedCompanyId)
  );

  if (matchedCompany) {
    setCompany(String(matchedCompany.id));
    setError("");
  } else if (companyData.length === 1) {
    setCompany(String(companyData[0].id));
    setError("");
  } else {
    setCompany("");
    setBranch("");
    setError("");
  }
} else if (companyData.length === 1) {
  setCompany(String(companyData[0].id));
  setError("");
} else {
  // Existing behaviour: multiple companies require manual selection
  setCompany("");
  setBranch("");
  setError("");
}

    setFetchStatus("");
    setFetchStatusType("");
  } catch (err) {
    if (cancelled) return;

    console.error(
      "COMPANY API ERROR =",
      err.response?.data || err
    );

    setCompanies([]);
    setCompany("");
    setBranch("");
    setBranches([]);
    setPreferredBranchId("");
    setUserRole("");

    setError(
      err.response?.data?.msg || "Failed to load companies"
    );
    setFetchStatus("Failed to load company");
    setFetchStatusType("error");
  } finally {
    if (!cancelled) {
      setIsCompaniesLoading(false);
    }
  }
};


    const timer = setTimeout(fetchCompanies, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email]);

  // =========================================
  // FETCH BRANCHES
  // =========================================

useEffect(() => {
  let cancelled = false;

  if (!company || isSuperAdmin) {
    setBranches([]);
    setBranch("");
    setIsBranchesLoading(false);
    setFetchStatus("");
    setFetchStatusType("");

    return () => {
      cancelled = true;
    };
  }

  const fetchBranches = async () => {
    setIsBranchesLoading(true);
    setFetchStatus("Fetching branch...");
    setFetchStatusType("loading");
    setBranch("");
    setBranches([]);
    setError("");

    try {
      const url =
        `${import.meta.env.VITE_API_URL}` +
        `/api/branches/by-company/${encodeURIComponent(company)}`;

      const res = await api.get(url);

      if (cancelled) return;

      const branchData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      // Remove duplicate branches using branch ID
      const uniqueBranches = Array.from(
        new Map(
          branchData.map((item) => [
            String(item.id ?? item.branch_id ?? ""),
            item,
          ])
        ).values()
      );

      const getBranchId = (item) =>
        String(item.id ?? item.branch_id ?? "").trim();

      const preferredId = String(
        preferredBranchId ?? ""
      ).trim();

      const matchedBranch = uniqueBranches.find(
        (item) =>
          preferredId !== "" &&
          getBranchId(item) === preferredId
      );

      console.log("COMPANY ID:", company);
      console.log("BRANCH API RESPONSE:", res.data);
      console.log("UNIQUE BRANCHES:", uniqueBranches);
      console.log("PREFERRED BRANCH ID:", preferredId);
      console.log("MATCHED BRANCH:", matchedBranch);

 if (matchedBranch) {
  setBranches(uniqueBranches);
  setBranch(getBranchId(matchedBranch));
  setError("");
} else {
  setBranches(uniqueBranches);

  if (uniqueBranches.length === 1) {
    setBranch(getBranchId(uniqueBranches[0]));
    setError("");
  } else if (uniqueBranches.length > 1) {
    setBranch("");
    setError("");
  } else {
    setBranch("");
    setError("No branch assigned to this company");
  }
}

      setFetchStatus("");
      setFetchStatusType("");
    } catch (err) {
      if (cancelled) return;

      console.error(
        "BRANCH API ERROR:",
        err.response?.data || err
      );

      setBranches([]);
      setBranch("");
      setError(
        err.response?.data?.msg || "Failed to load branches"
      );
      setFetchStatus("Failed to load branch");
      setFetchStatusType("error");
    } finally {
      if (!cancelled) {
        setIsBranchesLoading(false);
      }
    }
  };

  fetchBranches();

  return () => {
    cancelled = true;
  };
}, [company, isSuperAdmin, preferredBranchId]);

  // =========================================
  // DEBUG CONSOLE
  // =========================================

  useEffect(() => {
    console.log("Selected Company =", company);
  }, [company]);

  useEffect(() => {
    console.log("Selected Branch =", branch);
  }, [branch]);

  // =========================================
  // LOGIN SUBMIT
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitted(true);
    setError("");

    if (isCompaniesLoading || isBranchesLoading) {
      setError("Please wait while company and branch details load.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    // Normal users must select/resolve company and branch.
    if (requiresCompanyAndBranch && (!company || !branch)) {
      setError("Please select company and branch");
      return;
    }

    setIsLoginLoading(true);

    try {
      const loginPayload = {
        email: email.trim(),
        password,
      };

      // Send company/branch only for non-SuperAdmin users.
      if (requiresCompanyAndBranch) {
        loginPayload.company = company;
        loginPayload.branch = branch;
      }

      const res = await api.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        loginPayload
      );

      console.log("LOGIN RESPONSE =", res.data);

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role || "Admin";

      // =========================================
      // FETCH PERMISSIONS
      // =========================================

      try {
        const permRes = await api.get(
          `${import.meta.env.VITE_API_URL}/api/permissions/${encodeURIComponent(role)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem(
          "permissions",
          JSON.stringify(permRes.data?.detailedPermissions || [])
        );

        console.log(
          "PERMISSIONS LOADED =",
          permRes.data?.detailedPermissions
        );
      } catch (permissionError) {
        console.error(
          "PERMISSION API ERROR =",
          permissionError.response?.data || permissionError
        );

        localStorage.setItem("permissions", JSON.stringify([]));
      }

      // =========================================
      // NAVIGATE
      // =========================================

      navigate("/");
    } catch (err) {
      console.error("LOGIN ERROR =", err.response?.data || err);

      setError(
        err.response?.data?.msg ||
          err.message ||
          "Invalid credentials."
      );
    } finally {
      setIsLoginLoading(false);
    }
  };

  // =========================================
  // REACT SELECT STYLES
  // =========================================

  const selectStyles = (hasError) => ({
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "40px",
      height: "40px",
      fontSize: "14px",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderColor: hasError ? "red" : provided.borderColor,
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "38px",
      padding: "0 8px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
  });

  // =========================================
  // JSX
  // =========================================

  return (
    <div
      className="d-flex flex-column"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f8f9fa, #eef1ff)",
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center px-2"
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          flex: "1 0 auto",
        }}
      >
        <Container fluid>
          <Card
            className="shadow-lg border-0 mx-auto w-100"
            style={{
              maxWidth: "900px",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <Row className="g-0">
              {/* LEFT SIDE */}

              <Col
                xs={12}
                lg={6}
                className="bg-white d-flex flex-column justify-content-center"
                style={{
                  padding: "22px 28px",
                }}
              >
                <div
                  className="text-center"
                  style={{ marginBottom: "18px" }}
                >
                  <h2
                    className="fw-bold mb-1"
                    style={{
                      color: "#2f2d69",
                      fontSize: "25px",
                    }}
                  >
                    Welcome to HRMS
                  </h2>

                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "12px" }}
                  >
                    Please login to continue
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* EMAIL */}

                  <Form.Group className="mb-2">
                    <InputGroup>
                      <InputGroup.Text
                        style={{
                          minWidth: "42px",
                          justifyContent: "center",
                          padding: "6px 10px",
                        }}
                      >
                        <FaUser />
                      </InputGroup.Text>

                      <Form.Control
                        type="email"
                        placeholder="Username / Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isInvalid={submitted && !email.trim()}
                        autoComplete="username"
                        style={{
                          height: "40px",
                          fontSize: "14px",
                        }}
                      />
                    </InputGroup>

                    {submitted && !email.trim() && (
                      <small className="text-danger">
                        Email is required
                      </small>
                    )}

                    {/* FETCH STATUS */}

                    {fetchStatus && (
                      <small
                        className={
                          fetchStatusType === "error"
                            ? "text-danger d-flex align-items-center gap-1 mt-1"
                            : "text-muted d-flex align-items-center gap-1 mt-1"
                        }
                        style={{ fontSize: "11px" }}
                      >
                        {fetchStatusType === "loading" && (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                            style={{
                              width: "11px",
                              height: "11px",
                              borderWidth: "2px",
                            }}
                          />
                        )}

                        {fetchStatusType === "error" && (
                          <span style={{ fontWeight: "600" }}>
                            ✕
                          </span>
                        )}

                        {fetchStatus}
                      </small>
                    )}
                  </Form.Group>

                  {/* PASSWORD */}

                  <Form.Group className="mb-2">
                    <InputGroup>
                      <InputGroup.Text
                        style={{
                          minWidth: "42px",
                          justifyContent: "center",
                          padding: "6px 10px",
                        }}
                      >
                        <FaLock />
                      </InputGroup.Text>

                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={submitted && !password}
                        autoComplete="current-password"
                        style={{
                          height: "40px",
                          fontSize: "14px",
                        }}
                      />

                      <InputGroup.Text
                        role="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        style={{
                          cursor: "pointer",
                          padding: "6px 12px",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>

                    {submitted && !password && (
                      <small className="text-danger">
                        Password is required
                      </small>
                    )}
                  </Form.Group>

                  {/* COMPANY - HIDE FOR SUPERADMIN */}

                {!isSuperAdmin &&
  !autoSelectCompany &&
  companies.length > 1 && (
                    <Form.Group className="mb-2">
                      <InputGroup>
                        <InputGroup.Text
                          style={{
                            minWidth: "42px",
                            justifyContent: "center",
                            padding: "6px 10px",
                          }}
                        >
                          <FaBuilding />
                        </InputGroup.Text>

                        <div style={{ flex: 1, width: "100%" }}>
                          <Select
                            options={companies.map((c) => ({
                              value: String(c.id),
                              label: c.company_name,
                            }))}
                            value={
                              companies
                                .map((c) => ({
                                  value: String(c.id),
                                  label: c.company_name,
                                }))
                                .find((c) => c.value === company) || null
                            }
                            onChange={(selectedOption) => {
                              setCompany(
                                String(selectedOption?.value || "")
                              );
                              setBranch("");
                              setError("");
                            }}
                            placeholder="Select Company"
                            isSearchable
                            isLoading={isCompaniesLoading}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={selectStyles(submitted && !company)}
                          />
                        </div>
                      </InputGroup>

                      {submitted && !company && (
                        <small className="text-danger">
                          Company is required
                        </small>
                      )}
                    </Form.Group>
                  )}

                  {/* BRANCH - HIDE FOR SUPERADMIN */}
{/* BRANCH - SHOW ONLY WHEN MULTIPLE BRANCHES EXIST */}
{!isSuperAdmin &&
  !autoSelectCompany &&
  branches.length > 1 && (
  <Form.Group className="mb-2">
    <InputGroup>
      <InputGroup.Text
        style={{
          minWidth: "42px",
          justifyContent: "center",
          padding: "6px 10px",
        }}
      >
        <FaCodeBranch />
      </InputGroup.Text>

      <div style={{ flex: 1, width: "100%" }}>
        <Select
          options={branches.map((b) => ({
            value: String(b.id ?? b.branch_id),
            label: b.branch_name,
          }))}
          value={
            branches
              .map((b) => ({
                value: String(b.id ?? b.branch_id),
                label: b.branch_name,
              }))
              .find((b) => b.value === String(branch)) || null
          }
          onChange={(selectedOption) => {
            setBranch(String(selectedOption?.value || ""));
            setError("");
          }}
          placeholder="Select Branch"
          isSearchable
          isLoading={isBranchesLoading}
          isDisabled={!company || isCompaniesLoading}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={selectStyles(submitted && !branch)}
        />
      </div>
    </InputGroup>

    {submitted && !branch && (
      <small className="text-danger">
        Branch is required
      </small>
    )}
  </Form.Group>
)}

                  {/* ERROR */}

                  {error && (
                    <Alert
                      variant="danger"
                      className="py-2 px-3 mb-2"
                      style={{ fontSize: "13px" }}
                    >
                      {error}
                    </Alert>
                  )}

                  {/* LOGIN BUTTON */}

                  <div
                    className="d-grid"
                    style={{
                      marginTop: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <Button
                      type="submit"
                      disabled={
                        isLoginLoading ||
                        isCompaniesLoading ||
                        isBranchesLoading ||
                        !email.trim() ||
                        !password ||
                        (requiresCompanyAndBranch &&
                          (!company || !branch))
                      }
                      className="fw-bold"
                      style={{
                        height: "42px",
                        backgroundColor: "#2f2d69",
                        border: "none",
                        fontSize: "14px",
                      }}
                    >
                      {isLoginLoading ? "LOGGING IN..." : "LOGIN"}
                    </Button>
                  </div>

                  {/* FORGOT PASSWORD */}

                  <div className="text-center">
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none"
                      style={{
                        color: "#2f2d69",
                        fontSize: "12px",
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                </Form>
              </Col>

              {/* RIGHT SIDE */}

              <Col
                xs={12}
                lg={6}
                className="d-flex align-items-center justify-content-center bg-light"
                style={{
                  padding: "20px",
                  minHeight: "280px",
                }}
              >
                <Image
                  src={logo}
                  alt="Company Logo"
                  fluid
                  rounded
                  style={{
                    width: "100%",
                    maxWidth: "250px",
                    maxHeight: "250px",
                    objectFit: "contain",
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Container>
      </div>

      {/* FOOTER */}

      <Footer />
    </div>
  );
}
