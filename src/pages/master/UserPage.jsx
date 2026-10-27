    import React, { useState, useEffect } from "react";
    import Select from "react-select";
    import { useNavigate, useLocation } from "react-router-dom";
    import api from "../../api/axios";
    import clientLogger from "../../utils/clientLogger";
    import SearchPanel from "../../utils/FilterPanel";
    import LoadingScreen from "../../components/loader/LoadingScreen";
    import { useContext } from "react";
    import { PermissionsContext } from "../../components/context/PermissionsContext";
    import {
      FaPen,
      FaTrashAlt,
      FaEye,
      FaPlus,
      FaSearch,
      FaUndo,
    } from "react-icons/fa"; // Added FaPlus, FaSearch
    import {
      Alert,
      Button,
      Card,
      Col,
      Form,
      Image,
      Modal,
      Row,
      Table,
      Dropdown,
      Pagination,
      Badge,
    } from "react-bootstrap";
    import defaultImg from "./download.jfif";
    const API_URL = import.meta.env.VITE_API_URL;
    const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
    import AuditTrail from "../../components/common/AuditTrail";

    const UserPage = () => {
      const navigate = useNavigate();

      // Current logged in user & role access
      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
          return {};
        }
      })();

      const isSuperAdmin =
        currentUser?.is_superadmin === true ||
        Number(currentUser?.id) === 1 ||
        String(currentUser?.role).toUpperCase() === "SUPERADMIN" ||
        String(currentUser?.role).toUpperCase() === "SUPER ADMIN";
  const currentUserId = String(currentUser?.id ?? "").trim();

  const currentCompanyId = String(
    currentUser?.company_id ?? currentUser?.companyId ?? ""
  ).trim();

  const currentRole = String(currentUser?.role ?? "")
    .trim()
    .toUpperCase();

  const isEmployee =
    currentUser?.is_employee === true ||
    currentUser?.is_employee === 1 ||
    currentUser?.is_employee === "1" ||
    currentUser?.is_employee === "true" ||
    currentRole === "EMPLOYEE";

  const isAdmin = !isSuperAdmin && !isEmployee;


  

const getSelectedIds = (value) => {
  if (value == null || value === "") return [];

  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [value];

  return values
    .map((item) => {
      if (item && typeof item === "object") {
        return item.value ?? item.id ?? item._id;
      }
      return item;
    })
    .filter((id) => id != null && String(id).trim() !== "")
    .map((id) => String(id).trim());
};


      const {
        permissions,
        getPermissionsByModule,
        getPermissionsByModuleId,
        refetch,
      } = useContext(PermissionsContext);
      const userPerms = getPermissionsByModule("Users");
      console.log("userPerms", userPerms);
      const location = useLocation();
      const [users, setUsers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [showForm, setShowForm] = useState(false);
      const [allClients, setAllClients] = useState([]);
      const [showSearch, setShowSearch] = useState(false);
      const [isEditing, setIsEditing] = useState(null);
      const [validationErrors, setValidationErrors] = useState({});
      const [logoPreview, setLogoPreview] = useState(null);
      const [currentPage, setCurrentPage] = useState(1);
      const usersPerPage = 50;
      const indexOfLastUser = currentPage * usersPerPage;
      const indexOfFirstUser = indexOfLastUser - usersPerPage;
      const [pincodes, setPincodes] = useState([]);
      const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
      const [showPincodeList, setShowPincodeList] = useState(false);
      const [activeStatus, setActiveStatus] = useState(0);

      const [showPassword, setShowPassword] = useState(false);

      const isUserActive = (val) => {
        if (val === undefined || val === null) return true;
        const s = String(val).trim();
        return s === "0" || s === "";
      };

      const activeCount = users.filter((u) => isUserActive(u.active)).length;
      const inactiveCount = users.filter((u) => !isUserActive(u.active)).length;
      const filteredUsers = users.filter((u) =>
        activeStatus === 0 ? isUserActive(u.active) : !isUserActive(u.active),
      );
      const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
      const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
      // Dropdown and Form state
      const [roles, setRoles] = useState([]);
      const [companies, setCompanies] = useState([]);
      const [clients, setClients] = useState([]);
      const [sites, setSites] = useState([]);
      const [branches, setBranches] = useState([]);
      const [profileImageFile, setProfileImageFile] = useState(null);
      const initialFormData = {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        role: "",
        address: "",
        city: "",
        pincode: "",
        company_id: "",
        branch_id: "",
        is_employee: true,
        face_enable: false,
        tracking_app_access: false,
          employee_login_coordinates: false,
            login_coordinates_type: "",
        client_id: [],
        client_name: [],
        site_id: [],
        source: "WEB",
      };
      const [formData, setFormData] = useState(initialFormData);
      const [viewUser, setViewUser] = useState(null); // For the view modal
      const fetchPincodes = async () => {
        try {
          const res = await api.get(`${API_URL}/api/pincodes`, getAuthHeaders());
          console.log("📦 RAW PINCODE RESPONSE:", res);
          console.log("📦 RES.DATA:", res.data);
          setPincodes(res.data || []);
        } catch (err) {
          console.log("PINCODE ERROR:", err);
        }
      };

      const handlePincodeChange = (e) => {
        const value = e.target.value;

        console.log("📍 PINCODE INPUT VALUE:", value);

        setFormData((prev) => ({
          ...prev,
          pincode: value,
        }));

        if (!value) {
          console.log("⚠️ Pincode empty - clearing suggestions");
          setPincodeSuggestions([]);
          setShowPincodeList(false);
          return;
        }

        const filtered = (pincodes || []).filter((p) => {
          const pin = String(p.pincode || "");
          return pin.startsWith(value);
        });

        console.log("🔎 FILTERED PINCODES:", filtered);
        console.log("📊 TOTAL MATCH:", filtered.length);

        setPincodeSuggestions(filtered.slice(0, 10));
        setShowPincodeList(true);
      };

      const handleSelectPincode = (p) => {
        console.log("PIN DATA =", p);

        setFormData((prev) => ({
          ...prev,
          pincode: p.pincode || "",
          city: p.city || p.city_name || "",
          regionState: p.state || p.state_name || "",
          country: p.country || p.country_name || "India",
        }));

        setShowPincodeList(false);
        setPincodeSuggestions([]);
      };
      // Dual list box state
      const [availableClients, setAvailableClients] = useState([]);
      const [selectedClients, setSelectedClients] = useState([]);
      const [selectedAvailable, setSelectedAvailable] = useState([]);
      const [selectedAssigned, setSelectedAssigned] = useState([]);

      // Search Panel State
      const [searchFields, setSearchFields] = useState([
        { field: "fullname", keyword: "" },
      ]);
      const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
      const userSearchOptions = [
          { value: "fullname", label: "Full Name" },
          { value: "email", label: "Email" },
          { value: "phone", label: "Contact No" },
          { value: "company_name", label: "Company Name" },
          { value: "branch_name", label: "Branch" },
        // { value: "created_on", label: "Created Date" },
      ];

      // Helper to get auth headers
      const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      };
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      const validSearch = searchFields.filter(
        (f) => f.field && f.keyword
      );

      if (validSearch.length > 0) {
        params.searchFields = JSON.stringify(validSearch);
      }

      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      const res = await api.get(`${API_BASE_URL}/users`, {
        params,
        ...getAuthHeaders(),
      });

      const allUsers = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

// Check whether a user is Super Admin
const isUserSuperAdmin = (u) => {
  const role = String(u.role ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s_-]/g, "");

  return (
    u.is_superadmin === true ||
    Number(u.is_superadmin) === 1 ||
    role === "SUPERADMIN"
  );
};
const isDeletedBySuperAdmin = (u) => {
  return (
    Number(u.disabled_by) === 1 ||
    String(u.disabled_by_name ?? "")
      .trim()
      .toUpperCase()
      .replace(/[\s_-]/g, "") === "SUPERADMIN" ||
    String(u.superadmin_status) === "1"
  );
};

let visibleUsers = [];

// Super Admin: सर्व users दिसतील
if (isSuperAdmin) {
  visibleUsers = allUsers;
}

// Admin आणि Employee: Super Admin ने delete केलेले users दिसणार नाहीत
else {
  const allowedUsers = allUsers.filter(
    (u) => !isDeletedBySuperAdmin(u)
  );

  // Employee: फक्त स्वतःची entry
  if (isEmployee) {
    visibleUsers = allowedUsers.filter(
      (u) =>
        String(u.id) === currentUserId &&
        !isUserSuperAdmin(u)
    );
  }

  // Admin: स्वतःच्या company मधील users
  else {
    visibleUsers = allowedUsers.filter((u) => {
      if (isUserSuperAdmin(u)) {
        return false;
      }

      const userCompanyIds = getSelectedIds(
        u.company_id ?? u.companyId
      );

      return (
        currentCompanyId !== "" &&
        userCompanyIds.includes(currentCompanyId)
      );
    });
  }
}

setUsers(visibleUsers);
setCurrentPage(1);
console.log("Logged-in user:", currentUser);
console.log("All users:", allUsers);
console.log("Visible users:", visibleUsers);

      setUsers(visibleUsers);
      setCurrentPage(1);

      console.log("Logged-in user:", currentUser);
      console.log("All users:", allUsers);
      console.log("Visible users:", visibleUsers);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        const msg = clientLogger.error(
          "UserPage.fetchUsers",
          error
        );
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };
      useEffect(() => {
        fetchPincodes();
      }, []);
      // Single useEffect for all initial data
      useEffect(() => {
     

const fetchInitialData = async () => {
  setLoading(true);

  try {
    const companiesRes = await api.get(
      `${API_BASE_URL}/companies`,
      getAuthHeaders()
    );

    const companyData = Array.isArray(companiesRes.data?.data)
      ? companiesRes.data.data
      : Array.isArray(companiesRes.data)
        ? companiesRes.data
        : [];

    setCompanies(companyData);

    const rolesRes = await api.get(
      `${API_BASE_URL}/users/roles`,
      getAuthHeaders()
    );

    const clientsRes = await api.get(
      `${API_BASE_URL}/users/clients`,
      getAuthHeaders()
    );

    const clientData = Array.isArray(clientsRes.data?.data)
      ? clientsRes.data.data
      : Array.isArray(clientsRes.data)
        ? clientsRes.data
        : [];

    console.log("CLIENT DATA =", clientData);

    clientData.forEach((client) => {
      console.log(
        "CLIENT ID =", client.id,
        "BILLING COMPANY ID =", client.billing_company_id
      );
    });

    setRoles(rolesRes.data);
    setAllClients(clientData);
    setClients([]);
    setAvailableClients(clientData);

  } catch (error) {
    const msg = clientLogger.error(
      "UserPage.fetchInitialData",
      error
    );

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      setError(msg);
    }
  } finally {
    setLoading(false);
  }
};


        fetchInitialData();
        // console.log(clients, availableClients);
      }, []);

      useEffect(() => {
        const ids = selectedClients.map((c) => c.id);

        const names = selectedClients.map((c) => c.company_name);

        console.log("CLIENT IDS =", ids);
        // getSitesByClientsIds(ids);
        console.log("CLIENT NAMES =", names);

        setFormData((prev) => ({
          ...prev,
          client_id: ids,
          client_name: names,
        }));

        // Trigger API call if there are selected clients
        if (ids.length > 0) {
          fetchSiteNamesByClientIds(ids);
        } else {
          setSites([]); // Clear sites if no clients are selected
        }
      }, [selectedClients]);

      const fetchSiteNamesByClientIds = async (clientIds) => {
        try {
          console.log("clientIds for API:", clientIds);

          // Ensure clientIds is an array and join them
          const idList = Array.isArray(clientIds) ? clientIds.join(",") : clientIds;

          const config = {
            ...getAuthHeaders(), // Ensure this returns { headers: { Authorization: '...' } }
            params: { clientIds: idList }, // This sends ?clientIds=1,2,3
          };

          const res = await api.get(
            `${API_BASE_URL}/clients/get-sites-by-clients-ids`,
            config,
          );

          console.log("Site data:", res.data);
          setSites(res.data.data || res.data); // Adjust based on your backend response structure
        } catch (error) {
          console.error("Error fetching sites:", error);
        }
      };
   

// const getSelectedIds = (value) => {
//   if (value == null || value === "") return [];

//   const values = Array.isArray(value) ? value : [value];

//   return values
//     .map((item) => {
//       if (item && typeof item === "object") {
//         return item.value ?? item.id ?? item._id;
//       }
//       return item;
//     })
//     .filter((id) => id != null && id !== "")
//     .map(String);
// };



const fetchClientsByCompany = (companyIds, assignedClientIds = []) => {
  const selectedCompanyIds = getSelectedIds(companyIds).map(String);
  const assignedIds = new Set(
    getSelectedIds(assignedClientIds).map(String)
  );

  const filteredClients = (allClients || []).filter((client) => {
    const billingCompanyId = String(client.billing_company_id ?? "");

    return selectedCompanyIds.includes(billingCompanyId);
  });

  setClients(filteredClients);

  // आधीपासून assigned असलेले clients available list मधून वगळा
  setAvailableClients(
    filteredClients.filter(
      (client) => !assignedIds.has(String(client.id))
    )
  );
};



      // Fetch branches only when the selected company changes
      // Fetch branches when selected company changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!formData.company_id) {
        setBranches([]);
        setFormData((prev) => ({
          ...prev,
          branch_id: "",
        }));
        return;
      }

      try {
        console.log("SELECTED COMPANY =>", formData.company_id);

        const res = await api.get(
          `${API_BASE_URL}/branches/by-company/0`,
          {
            params: {
              company_id: formData.company_id,
            },
            ...getAuthHeaders(),
          }
        );

        console.log("BRANCH API RESPONSE =>", res.data);

        // Handle both response formats
        const newBranches = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        console.log("BRANCH ARRAY =>", newBranches);

        setBranches(newBranches);

        // Keep only valid selected branch IDs
        const validBranchIds = new Set(
          newBranches.map((b) => String(b.id))
        );

        setFormData((prev) => {
          const currentSelected = getSelectedIds(prev.branch_id);

          return {
            ...prev,
            branch_id: currentSelected
              .filter((id) => validBranchIds.has(id))
              .join(","),
          };
        });
      } catch (error) {
        console.error(
          "BRANCH FETCH ERROR =>",
          error.response?.data || error.message
        );

        setBranches([]);
      }
    };

    fetchBranches();
  }, [formData.company_id]);
      // --- Form Handlers ---

      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        console.log("FIELD =>", name);
        console.log("VALUE =>", type === "checkbox" ? checked : value);

        const noCaps = ["password", "profile_image"];
        let finalValue = value;

        if (type === "checkbox") {
          finalValue = checked;
        } else if (typeof value === "string" && !noCaps.includes(name)) {
          finalValue = value.toUpperCase();
        }

        setFormData((prev) => ({
          ...prev,
          [name]: finalValue,
        }));
      };

      const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setProfileImageFile(file);

        setLogoPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
      };

      const resetForm = () => {
        setFormData(initialFormData);
        setIsEditing(null);
        setLogoPreview(null);
        setValidationErrors({});
        setSelectedClients([]);
        setProfileImageFile(null);
        setAvailableClients(clients);
      };

      const validateForm = () => {
        const newErrors = {};

        // First Name
        if (!formData.first_name.trim()) {
          newErrors.first_name = "First name is required";
        }

        // Email
        // Email Optional
        if (!formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = "Invalid email format";
        }

        // Password
        if (!isEditing && !formData.password) {
          newErrors.password = "Password is required";
        }

        // Phone
        if (!formData.phone && !/^\d{10}$/.test(formData.phone)) {
          newErrors.phone = "Contact number must be 10 digits";
        }

        // Role
        if (!formData.role) {
          newErrors.role = "Role is required";
        }

        // Company
        if (!formData.company_id) {
          newErrors.company_id = "Company is required";
        }

        // Branch
        if (!formData.branch_id) {
          newErrors.branch_id = "Branch is required";
        }

        // Pincode
        const pincodeRegex = /^[1-9][0-9]{5}$/;

        if (formData.pincode && !pincodeRegex.test(formData.pincode)) {
          newErrors.pincode = "Please enter valid 6 digit pincode";
        }

        setValidationErrors(newErrors);

        return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(selectedAssigned);
        if (!validateForm()) {
          alert("Please fix validation errors");
          return;
        }

        console.log("clients", formData.client_id, "sites", sites);

        try {
          const data = new FormData();

          Object.keys(formData).forEach((key) => {
            if (Array.isArray(formData[key])) {
              data.append(key, JSON.stringify(formData[key]));
            } else {
              data.append(key, formData[key]);
            }
          });
          console.log(
  "Login Coordinates Type:",
  formData.login_coordinates_type
);

console.log(
  "FormData Value:",
  data.get("login_coordinates_type")
);

          if (profileImageFile) {
            data.append("profileImage", profileImageFile);
          }

          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
              ...getAuthHeaders().headers,
            },
          };

          if (isEditing) {
            await api.post(
              `${API_BASE_URL}/users/update/${isEditing.id}`,
              data,
              config,
            );

            alert("User updated successfully");
          } else {
            await api.post(`${API_BASE_URL}/users`, data, config);

            alert("User created successfully");
          }

          setShowForm(false);

          resetForm();

          fetchUsers();
        } catch (error) {
          clientLogger.error("UserPage.handleSubmit", error);
          alert(
            error.response?.data?.message || error.message || "Failed to save user",
          );
        }
      };

    
      const handleEdit = (user) => {
        console.log("EDIT USER =>", user);
console.log("EDIT USER OBJECT:", user);
console.log("Login Coordinates Type:", user.login_coordinates_type);
console.log("E  :", user.employee_login_coordinates);
        setIsEditing(user);
        setBranches([]); // BUG-11 FIX: Clear stale branches before loading new user's data

        // ================= PARSE CLIENTS =================

        let parsedClientIds = [];
        let parsedClientNames = [];
        let parsedSiteIds = [];

        try {
          if (user.site_id) {
            parsedSiteIds = user.site_id.includes("[")
              ? JSON.parse(user.site_id)
              : String(user.site_id).split(",");
          }
        } catch (err) {
          console.log("SITE PARSE ERROR =", err);
        }
        try {
          if (user.client_id) {
            parsedClientIds = user.client_id.includes("[")
              ? JSON.parse(user.client_id)
              : String(user.client_id).split(",");
          }
          if (user.client_name) {
            parsedClientNames = user.client_name.includes("[")
              ? JSON.parse(user.client_name)
              : String(user.client_name).split(",");
          }
        } catch (err) {
          console.log("CLIENT PARSE ERROR =", err);
        }

        // ================= SET SELECTED CLIENTS =================

const userCompanyIds = getSelectedIds(
  user.company_id ?? user.companyId
);

const companyClients = (allClients || []).filter((client) =>
  userCompanyIds.includes(String(client.billing_company_id))
);

const matchedClients = companyClients.filter((client) =>
  parsedClientIds.map(String).includes(String(client.id))
);

setSelectedClients(matchedClients);

setAvailableClients(
  companyClients.filter(
    (client) =>
      !parsedClientIds.map(String).includes(String(client.id))
  )
);

setSelectedAvailable([]);
setSelectedAssigned([]);
        // setSelectedAvailable([]);
        // setSelectedAssigned([]);

        // ================= FORM DATA =================

        setFormData({
          first_name: user.first_name || "",
          source: user.source || "WEB",
          middle_name: user.middle_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          password: "", // blank password on edit
          phone: user.phone || "",
          role: user.role || "",
          address: user.address || "",
          city: user.city || "",
          pincode: user.pincode || "",
          company_id: user.company_id ? String(user.company_id) : "",
          branch_id: user.branch_id ? String(user.branch_id) : "",
          is_employee:
            user.is_employee === 1 ||
            user.is_employee === "1" ||
            user.is_employee === true ||
            user.is_employee === "true",
          face_enable: user.face_enable == "1" || user.face_enable === true,
          tracking_app_access:
            user.tracking_app_access == "1" || user.tracking_app_access === true,
employee_login_coordinates:
  user.employee_login_coordinates === 1 ||
  user.employee_login_coordinates === "1" ||
  user.employee_login_coordinates === true,
login_coordinates_type: String(
  user.employee_login_coordinates_type ?? ""
).trim().toLowerCase(),
  login_company:
  user.login_company === 1 ||
  user.login_company === "1" ||
  user.login_company === true ||
  user.login_company === "true",
          client_id: parsedClientIds,
          client_name: parsedClientNames,
          site_id: parsedSiteIds, // ADD THIS
        });
console.log(
  "Employee Login Coordinates:",
  user.employee_login_coordinates
);

console.log(
  "Login Coordinates Type:",
  user.login_coordinates_type
);
        // ================= IMAGE =================

        setLogoPreview(
          user.profile_image
            ? user.profile_image.startsWith("http") ||
              user.profile_image.startsWith("blob:") ||
              user.profile_image.startsWith("data:")
              ? user.profile_image
              : `${import.meta.env.VITE_FRONTEND_FOLDER || ""}/api/${user.profile_image.replace(/\\/g, "/").replace(/^\//, "")}`
            : null,
        );

        setShowForm(true);
      };

      const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
          try {
            await api.delete(`/api/users/${id}`, getAuthHeaders());
            alert("User deleted successfully");
            fetchUsers();
          } catch (error) {
            if (error.response?.status === 401) {
              localStorage.removeItem("token");
              window.location.href = "/login";
            } else {
              const msg = clientLogger.error("UserPage.handleDelete", error);
              alert(`❌ Delete Failed:\n${msg}`);
            }
          }
        }
      };

      const handleRestore = async (id) => {
        if (window.confirm("Are you sure you want to restore this user?")) {
          try {
            await api.put(`/api/users/restore/${id}`, {}, getAuthHeaders());
            alert("User restored successfully");
            fetchUsers();
          } catch (error) {
            if (error.response?.status === 401) {
              localStorage.removeItem("token");
              window.location.href = "/login";
            } else {
              const msg = clientLogger.error("UserPage.handleRestore", error);
              alert(`❌ Restore Failed:\n${msg}`);
            }
          }
        }
      };

      const handleView = (user) => {
        navigate(`/master/users/${user.id}`);
      };

      // --- Search and Dual List Box Handlers ---
      const handleSearch = () => {
        fetchUsers();
      };

      useEffect(() => {
        fetchUsers();
      }, [searchFields, dateFilter]);

      const resetSearch = () => {
        setSearchFields([{ field: "fullname", keyword: "" }]);
        setDateFilter({ from: "", to: "" });
      };

      const handleDownloadExcel = async () => {
        try {
          const params = {};
          params.active = activeStatus;
          const validSearch = searchFields.filter((f) => f.field && f.keyword);
          if (validSearch.length > 0)
            params.searchFields = JSON.stringify(validSearch);

          if (dateFilter.from && dateFilter.to) {
            params.fromDate = dateFilter.from;
            params.toDate = dateFilter.to;
          }

          const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

          const response = await api.get(
            `${import.meta.env.VITE_API_URL}/api/users/export`,
            {
              params,
              responseType: "blob", // IMPORTANT
              ...getAuthHeaders(),
            },
          );

          // Create Excel File
          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = `Users_${randomNumber}.xlsx`;
          link.click();
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }
          const msg = clientLogger.error("UserPage.downloadExcel", error);
          alert(`❌ Excel Download Failed:\n${msg}`);
        }
      };

      const moveItems = (source, dest, setSource, setDest, itemIds) => {
        const itemsToMove = source.filter((item) =>
          itemIds.includes(String(item.id)),
        );

        const remainingSource = source.filter(
          (item) => !itemIds.includes(String(item.id)),
        );

        setSource(remainingSource);

        setDest(
          [...dest, ...itemsToMove].sort((a, b) =>
            (a.company_name || "").localeCompare(b.company_name || ""),
          ),
        );
      };
      const handleSelectClients = async (all = false) => {
        const selectedIds = all
          ? availableClients.map((c) => String(c.id))
          : selectedAvailable;
        moveItems(
          availableClients,
          selectedClients,
          setAvailableClients,
          setSelectedClients,
          selectedIds,
        );
        if (!all) setSelectedAvailable([]);

        if (selectedIds.length > 0) {
          try {
            const idList = selectedIds.join(",");
            const config = {
              ...getAuthHeaders(),
              params: { clientIds: idList },
            };
            const res = await api.get(
              `${API_BASE_URL}/clients/get-sites-by-clients-ids`,
              config,
            );
            const fetchedSites = res.data.data || res.data;
            const newSiteIds = fetchedSites.map((s) => String(s.id));

            setFormData((prev) => ({
              ...prev,
              client_id: [...new Set([...prev.client_id, ...selectedIds])],
              site_id: [...new Set([...prev.site_id, ...newSiteIds])],
            }));
          } catch (error) {
            console.error("Error auto-fetching sites for new clients:", error);
            // Fallback
            const clientSiteIds = sites
              .filter((s) => selectedIds.includes(String(s.client_id)))
              .map((s) => String(s.id));
            setFormData((prev) => ({
              ...prev,
              client_id: [...new Set([...prev.client_id, ...selectedIds])],
              site_id: [...new Set([...prev.site_id, ...clientSiteIds])],
            }));
          }
        }
      };
      const handleDeselectClients = (all = false) => {
        const selectedIds = all
          ? selectedClients.map((c) => String(c.id))
          : selectedAssigned;
        moveItems(
          selectedClients,
          availableClients,
          setSelectedClients,
          setAvailableClients,
          selectedIds,
        );
        if (!all) setSelectedAssigned([]);

        const clientSiteIds = sites
          .filter((s) => selectedIds.includes(String(s.client_id)))
          .map((s) => String(s.id));
        setFormData((prev) => ({
          ...prev,
          client_id: prev.client_id.filter(
            (id) => !selectedIds.includes(String(id)),
          ),
          site_id: prev.site_id.filter((id) => !clientSiteIds.includes(String(id))),
        }));
      };

      const handleSiteToggle = (siteId, checked) => {
        setFormData((prev) => ({
          ...prev,
          site_id: checked
            ? [...prev.site_id, String(siteId)]
            : prev.site_id.filter((id) => id !== String(siteId)),
        }));
      };

      const handleSelectAllSites = () => {
        const allClientIds = selectedClients.map((c) => String(c.id));
        const allSiteIds = sites.map((s) => String(s.id));
        setFormData((prev) => ({
          ...prev,
          client_id: allClientIds,
          site_id: allSiteIds,
        }));
      };

      const handleDeselectAllSites = () => {
        setFormData((prev) => ({
          ...prev,
          client_id: [],
          site_id: [],
        }));
      };

      // === FETCH SITES BY SELECTED CLIENTS ===
      // const fetchSitesByClientIds = async (selectedClientList) => {
      //   if (!selectedClientList || selectedClientList.length === 0) {
      //     console.log("No clients selected for site fetch.");
      //     return [];
      //   }

      //   try {
      //     const clientIds = selectedClientList.map((c) => c.id);
      //     const res = await api.post(
      //       `${API_BASE_URL}/clients/get-sites-by-clients-ids`,
      //       { clientIds },
      //       getAuthHeaders(),
      //     );
      //     // console.log("Fetched Sites:", res.data.data);
      //     return res.data.data;
      //   } catch (error) {
      //     clientLogger.error("UserPage.fetchSitesByClientIds", error);
      //     if (error.response?.status === 401) {
      //       localStorage.removeItem("token");
      //       window.location.href = "/login";
      //     }
      //     return [];
      //   }
      // };

      // Inside handleSelectClients or handleDeselectClients
      // useEffect(() => {
      //   const fetchSites = async () => {
      //     try {
      //       const sites = await fetchSitesByClientIds(selectedClients);
      //       // console.log("Sites for selected clients:", sites);
      //       setSites(sites);
      //     } catch (error) {
      //       clientLogger.error("UserPage.fetchSitesEffect", error);
      //       if (error.response?.status === 401) {
      //         localStorage.removeItem("token");
      //         window.location.href = "/login";
      //       }
      //     }
      //   };

      //   if (selectedClients.length > 0) {
      //     fetchSites();
      //   }
      // }, [selectedClients]);
      // Add this to your state declarations
      const [expandedClients, setExpandedClients] = useState({});
      const toggleClientSites = (clientId) => {
        setExpandedClients((prev) => ({
          ...prev,
          [clientId]: !prev[clientId],
        }));
      };

      const handleClientToggle = (clientId, checked) => {
        const clientSiteIds = sites
          .filter((s) => Number(s.client_id) === Number(clientId))
          .map((s) => String(s.id));

        setFormData((prev) => {
          let newClientIds = checked
            ? [...prev.client_id, String(clientId)]
            : prev.client_id.filter((id) => id !== String(clientId));

          let newSiteIds = checked
            ? [...new Set([...prev.site_id, ...clientSiteIds])]
            : prev.site_id.filter((id) => !clientSiteIds.includes(String(id)));

          return {
            ...prev,
            client_id: newClientIds,
            site_id: newSiteIds,
          };
        });
      };

      const handleUpdateClientSites = async () => {
        try {
          if (!isEditing) return;
          // console.log(formData);
          const selectedSiteNames = sites
            .filter((s) => formData.site_id.includes(String(s.id)))
            .map((s) => s.site_name);

          await api.post(
            `${API_BASE_URL}/users/update-client-sites/${isEditing.id}`,
            {
              client_id: formData.client_id,
              site_id: formData.site_id,
              client_name: formData.client_name,
              site_name: selectedSiteNames,
            },
            getAuthHeaders(),
          );

          alert("Client & Sites updated successfully");
        } catch (error) {
          console.error(error);
          alert("Failed to update");
        }
      };

      if (userPerms.length <= 0) {
        refetch();
        return <LoadingScreen />;
      }

      // --- RENDER ---
      return (
        <div
          className="page-container"
          style={{
            fontSize: "13px",
          }}
        >
          {/* PAGE HEADER — hides when form is open */}
          {!showForm && (
            <div className="page-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <h1 className="page-title mb-0">
                  User Management{" "}
                  <span className="text-success">({users.length})</span>
                </h1>
              </div>

              <div className="page-actions">
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <FaSearch /> {showSearch ? "Hide Search" : "Search"}
                </button>
                {userPerms.add_access === 1 && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetForm();
                      setIsEditing(null);
                      setShowForm(true);
                      setShowSearch(false);
                    }}
                  >
                    <FaPlus /> Create New
                  </button>
                )}
              </div>
            </div>
          )}

          {showSearch && (
            <SearchPanel
              searchFields={searchFields}
              setSearchFields={setSearchFields}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onSearch={handleSearch}
              onReset={resetSearch}
              onDownloadExcel={handleDownloadExcel}
              searchOptions={userSearchOptions}
              showDownload={userPerms?.export_access === 1}
            />
          )}

          {showForm && (
            <Card className="shadow-sm border-0">
              <h2 className="page-title mb-3 p-3">
                {isEditing ? (
                  <span>
                    Edit User - {isEditing.fullname || isEditing.first_name}
                  </span>
                ) : (
                  "Create New User"
                )}
              </h2>
              {Object.keys(validationErrors).length > 0 && (
                <Alert variant="danger">
                  Please fix the validation errors below.
                </Alert>
              )}
              <Card.Body>
                <Form
                  className="user-form master-form"
                  onSubmit={handleSubmit}
                  autoComplete="off"
                >
                  <Row className="g-1">
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="first_name">
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control
                          size="sm"
                          name="first_name"
                          placeholder="Enter first name"
                          value={formData.first_name || ""}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.first_name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.first_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="middle_name">
                        <Form.Label>Middle Name</Form.Label>
                        <Form.Control
                          size="sm"
                          name="middle_name"
                          placeholder="Enter middle name"
                          value={formData.middle_name || ""}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="last_name">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          size="sm"
                          name="last_name"
                          placeholder="Enter last name"
                          value={formData.last_name || ""}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="email">
                        <Form.Label>Email ID*</Form.Label>
                        <Form.Control
                          name="email"
                          placeholder="Email"
                          type="text"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.email}
                          autoComplete="off"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="password">
                        <Form.Label>
                          {isEditing ? "New password (optional)" : "Password *"}
                        </Form.Label>

                        <div style={{ position: "relative" }}>
                          <Form.Control
                            name="password"
                            placeholder={
                              isEditing
                                ? "Enter new password (optional)"
                                : "Password"
                            }
                            type={showPassword ? "text" : "password"}
                            value={formData.password || ""}
                            onChange={handleInputChange}
                            isInvalid={!isEditing && !!validationErrors.password}
                            autoComplete="new-password"
                            style={{
                              paddingRight: "42px",
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              border: "none",
                              background: "transparent",
                              padding: "2px",
                              margin: 0,
                              cursor: "pointer",
                              color: "#6c757d",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 10,
                            }}
                          >
                            {showPassword ? (
                              <FaEye size={16} />
                            ) : (
                              <span
                                style={{
                                  position: "relative",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FaEye size={16} />

                                <span
                                  style={{
                                    position: "absolute",
                                    width: "20px",
                                    height: "2px",
                                    backgroundColor: "#6c757d",
                                    transform: "rotate(-45deg)",
                                    borderRadius: "2px",
                                  }}
                                />
                              </span>
                            )}
                          </button>
                        </div>

                        <Form.Control.Feedback type="invalid">
                          {validationErrors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="contactNo">
                        <Form.Label>Contact No *</Form.Label>

                        <Form.Control
                          name="phone"
                          placeholder="Contact No"
                          value={formData.phone || ""}
                          isInvalid={!!validationErrors.phone}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "") // only numbers
                              .slice(0, 10); // max 10 digits

                            setFormData({
                              ...formData,
                              phone: value,
                            });
                          }}
                          maxLength={10}
                        />

                        <Form.Control.Feedback type="invalid">
                          {validationErrors.phone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          name="address"
                          as={"textarea"}
                          placeholder="Address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          rows="3"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="pincode">
                        <Form.Label>Pincode</Form.Label>

                        <div style={{ position: "relative" }}>
                          <Form.Control
                            name="pincode"
                            placeholder="Pincode"
                            value={formData.pincode || ""}
                            onChange={handlePincodeChange}
                            onFocus={() => setShowPincodeList(true)}
                            isInvalid={!!validationErrors.pincode}
                            autoComplete="off"
                          />

                          {/* DROPDOWN */}
                          {showPincodeList && pincodeSuggestions.length > 0 && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                background: "#ffffe0",
                                border: "1px solid #ddd",
                                zIndex: 999,
                                maxHeight: "200px",
                                overflowY: "auto",
                                backgroundColor: "lightyellow",
                                borderRadius: "6px",
                              }}
                            >
                              {pincodeSuggestions.map((p, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleSelectPincode(p)}
                                  style={{
                                    padding: "8px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #eee",
                                  }}
                                  onMouseOver={(e) =>
                                    (e.currentTarget.style.background = "#f5f5f5")
                                  }
                                  onMouseOut={(e) =>
                                    (e.currentTarget.style.background = "#ffffe0")
                                  }
                                  onMouseDown={(e) => e.preventDefault()} // prevents blur issue
                                >
                                  {p.pincode} - {p.city || p.city_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Form.Control.Feedback type="invalid">
                          {validationErrors.pincode}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          name="city"
                          placeholder="City"
                          value={formData.city || ""}
                          onChange={handleInputChange}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    {/* <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="roleId">
                        <Form.Label>Role *</Form.Label>
                        <Form.Select
                          name="role"
                          value={formData.role || ""}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.role}
                        >
                          <option value="">Select Role</option>

                          {roles.map((role) => (
                            <option key={role.id} value={role.role_name}>
                              {role.role_name}
                            </option>
                          ))}
                        </Form.Select>

                        <Form.Control.Feedback type="invalid">
                          {validationErrors.role}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col> */}

                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="roleId">
                        <Form.Label>Role *</Form.Label>
                        <Select
                          name="role"
                          placeholder="Select Role"
                          isSearchable
                          isClearable
                          options={roles
                            .filter(
                              (r) =>
                                Number(r.active) === 0 &&
                                !["SUPER ADMIN", "SUPERADMIN"].includes(
                                  String(r.role_name).trim().toUpperCase(),
                                ),
                            )
                            .map((r) => ({
                              value: r.role_name.toUpperCase(),
                              label: r.role_name,
                            }))}
                          value={
                            roles
                              .map((r) => ({
                                value: r.role_name.toUpperCase(),
                                label: r.role_name,
                              }))
                              .find((opt) => opt.value === formData.role) || null
                          }
                          onChange={(selected) =>
                            handleInputChange({
                              target: {
                                name: "role",
                                value: selected ? selected.value : "",
                              },
                            })
                          }
                          className={validationErrors.role ? "is-invalid" : ""}
                        />
                        {validationErrors.role && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.role}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="company">
                        <Form.Label>Company *</Form.Label>
                        <Select
                          name="company_id"
                          placeholder="Select Company (Multiple)"
                          isMulti
                          isSearchable
                          isClearable
                          options={
                            Array.isArray(companies)
                              ? companies
                                  .filter((c) => Number(c.active) === 0)
                                  .map((c) => ({
                                    value: c.id,
                                    label: c.company_name,
                                  }))
                              : []
                          }
                          value={
                            Array.isArray(companies)
                              ? companies
                                  .filter((c) =>
                                    getSelectedIds(formData.company_id).includes(
                                      String(c.id),
                                    ),
                                  )
                                  .map((c) => ({
                                    value: c.id,
                                    label: c.company_name,
                                  }))
                              : []
                          }
onChange={(selected) => {
  const ids = selected
    ? selected.map((s) => String(s.value))
    : [];

  const assignedClientIds = getSelectedIds(formData.client_id);

  setFormData((prev) => ({
    ...prev,
    company_id: ids.join(","),
    branch_id: "",
    // client_id, client_name आणि site_id reset करू नको
  }));

  fetchClientsByCompany(ids, assignedClientIds);
}}
                          className={
                            validationErrors.company_id ? "is-invalid" : ""
                          }
                        />
                        {validationErrors.company_id && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.company_id}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="branch">
                        <Form.Label>Branch *</Form.Label>
                        <Select
                          name="branch_id"
                          placeholder="Select Branch (Multiple)"
                          isMulti
                          isSearchable
                          isClearable
                          options={branches.map((b) => ({
                            value: b.id,
                            label:
                              b.branch_name +
                              (b.parent_company_name
                                ? ` (${b.parent_company_name})`
                                : ""),
                          }))}
                          value={branches
                            .filter((b) =>
                              getSelectedIds(formData.branch_id).includes(
                                String(b.id),
                              ),
                            )
                            .map((b) => ({
                              value: b.id,
                              label:
                                b.branch_name +
                                (b.parent_company_name
                                  ? ` (${b.parent_company_name})`
                                  : ""),
                            }))}
                          onChange={(selected) => {
                            const ids = selected
                              ? selected.map((s) => s.value).join(",")
                              : "";
                            setFormData((prev) => ({
                              ...prev,
                              branch_id: ids,
                            }));
                          }}
                          className={validationErrors.branch_id ? "is-invalid" : ""}
                        />
                        {validationErrors.branch_id && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.branch_id}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="mb-3">
                      <Form.Group controlId="profileImage">
                        <Form.Label>Profile Image</Form.Label>

                        <Form.Control
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          name="logo"
                          onChange={handleFileChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6} md={4} className="mb-3">
                      {logoPreview && (
                        <div style={{ marginTop: "10px" }}>
                          <img
                            src={logoPreview}
                            alt="logo preview"
                            onLoad={() =>
                              clientLogger.success(
                                "UserPage.ProfilePreview",
                                "Profile image loaded:",
                                logoPreview,
                              )
                            }
                            onError={(e) => {
                              clientLogger.imgError(
                                "UserPage.ProfilePreview",
                                logoPreview,
                              );
                              e.target.src =
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                            }}
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "10px",
                              objectFit: "cover",
                              border: "1px solid #ddd",
                              padding: "4px",
                              background: "#fff",
                            }}
                          />
                        </div>
                      )}
                    </Col>

                    {/* Add the New Checkbox Section */}
                    <Col
                      xs={12}
                      sm={6}
                      md={4}
                      className="mb-3 d-flex align-items-end"
                    >
                      <Form.Group controlId="is_employee" className="mb-2">
                        <Form.Check
                          type="checkbox"
                          label="Add in Employee"
                          name="is_employee"
                          checked={!!formData.is_employee}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              is_employee: e.target.checked,
                            }))
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      sm={6}
                      md={4}
                      className="mb-3 d-flex align-items-end"
                    >
                      <Form.Group controlId="face_enable" className="mb-2">
                        <Form.Check
                          type="checkbox"
                          label="Eligible for Face recognition"
                          name="face_enable"
                          checked={!!formData.face_enable}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              face_enable: e.target.checked,
                            }))
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      sm={6}
                      md={4}
                      className="mb-3 d-flex align-items-end"
                    >
                      <Form.Group controlId="tracking_app_access" className="mb-2">
                        <Form.Check
                          type="checkbox"
                          label="Eligible for Route Tracking app"
                          name="tracking_app_access"
                          checked={!!formData.tracking_app_access}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tracking_app_access: e.target.checked,
                            }))
                          }
                        />
                      </Form.Group>
                    </Col>
                    
<Col
  xs={12}
  sm={6}
  md={4}
  className="mb-3 d-flex align-items-end"
>
  <Form.Group
    controlId="employee_login_coordinates"
    className="mb-2"
  >
    <Form.Check
  type="checkbox"
  label="Employee Login Coordinates"
  name="employee_login_coordinates"
  checked={!!formData.employee_login_coordinates}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      employee_login_coordinates: e.target.checked,
      login_coordinates_type: e.target.checked
        ? prev.login_coordinates_type
        : "",
    }))
  }
/>
  </Form.Group>
</Col>
{/* Employee Login Coordinates Type */}
<Row className="gy-1">
 {formData.employee_login_coordinates && (
  <Col xs={12} sm={6} md={4}>
    <Form.Group controlId="login_coordinates_type">
      <Form.Label>Login Coordinates Type *</Form.Label>

      <Form.Select
        name="login_coordinates_type"
        value={formData.login_coordinates_type || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            login_coordinates_type: e.target.value,
          }))
        }
        size="sm"
        required={formData.employee_login_coordinates}
      >
        <option value="">Select Type</option>
        <option value="site">Site Coordinates</option>
        <option value="employee">Employee Coordinates</option>
      </Form.Select>
    </Form.Group>
  </Col>
)}

  <Col xs={12} sm={6} md={4} className="d-flex align-items-end">
    <Form.Group controlId="login_company" className="mb-2">
      <Form.Check
        type="checkbox"
        label="Login Company"
        name="login_company"
        checked={!!formData.login_company}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            login_company: e.target.checked,
          }))
        }
      />
    </Form.Group>
  </Col>
</Row>
                  </Row>

                  <Row
                    className="d-flex justify-content-center align-items-center text-center"
                    // style={{ minHeight: "250px" }}
                  >
                    <Col
                      xs={12}
                      md={5}
                      className="d-flex justify-content-center align-items-center"
                    >
                      <Card className="shadow-sm border-0 w-100 p-3">
                        <Form.Label>Available Clients</Form.Label>
                        <Form.Select
                          id="availableClients"
                          multiple
                          className="dual-list-select"
                          value={selectedAvailable}
                          onChange={(e) =>
                            setSelectedAvailable(
                              Array.from(e.target.selectedOptions).map(
                                (o) => o.value,
                              ),
                            )
                          }
                        >
                          {availableClients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.client_code
                                ? `${c.client_code} - ${c.company_name}`
                                : c.company_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Card>
                    </Col>
                    <Col
                      // md={2}
                      className="d-flex flex-column mb-3 gap-2 align-items-center justify-content-center"
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-100"
                        onClick={() => handleSelectClients(true)}
                      >
                        &gt;&gt;
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-100"
                        onClick={() => handleSelectClients(false)}
                      >
                        &gt;
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-100"
                        onClick={() => handleDeselectClients(false)}
                      >
                        &lt;
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-100"
                        onClick={() => handleDeselectClients(true)}
                      >
                        &lt;&lt;
                      </Button>
                    </Col>
                    <Col
                      xs={12}
                      md={5}
                      className="d-flex justify-content-center align-items-center"
                    >
                      <Card className="user-card  w-100 p-3">
                        <Form.Label>Assigned Clients</Form.Label>
                        <Form.Select
                          id="assignedClients"
                          multiple
                          className="dual-list-select"
                          value={selectedAssigned}
                          onChange={(e) =>
                            setSelectedAssigned(
                              Array.from(e.target.selectedOptions).map(
                                (o) => o.value,
                              ),
                            )
                          }
                        >
                          {selectedClients
                            .filter((c) => c)
                            .map((c) => (
                              <option key={c?.id} value={c?.id}>
                                {c.client_code
                                  ? `${c.client_code} - ${c.company_name}`
                                  : c.company_name}
                              </option>
                            ))}
                        </Form.Select>
                      </Card>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-center gap-3 mt-5">
                    <Button
                      type="button"
                      variant="secondary"
                      className="me-2"
                      onClick={() => {
                        setShowForm(false);
                        setIsEditing(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="success">
                      {isEditing ? "Update User" : "Save User"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
{getSelectedIds(formData.company_id).length > 0 && (
              <div className="mt-4 p-3 border rounded row">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Form.Label className="fw-bold m-0">
                    Assign Clients & Sites
                  </Form.Label>
                  <div>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={handleSelectAllSites}
                    >
                      Select All Client & Sites
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={handleDeselectAllSites}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                {selectedClients.map((client) => (
                  <div key={client.id} className="mb-3 col-5">
                    {/* Client Checkbox */}
                    <div
                      className="d-flex align-items-center gap-2"
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        onClick={() => toggleClientSites(client.id)}
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          width: "20px",
                          display: "inline-block",
                        }}
                      >
                        {expandedClients[client.id] ? "" : ""}
                      </span>

                      <Form.Check
                        type="checkbox"
                        checked={formData.client_id.includes(String(client.id))}
                        onChange={(e) =>
                          handleClientToggle(client.id, e.target.checked)
                        }
                        label={
                          <span
                            onClick={() => toggleClientSites(client.id)}
                            style={{
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {expandedClients[client.id] ? "▼ " : "▶ "}
                            {client.company_name}
                          </span>
                        }
                      />
                    </div>

                    {/* Sites List */}
                    {expandedClients[client.id] && (
                      <div className="ms-4 mt-2 border-start ps-3">
                        {sites
                          .filter(
                            (site) => Number(site.client_id) === Number(client.id),
                          )
                          .map((site) => (
                            <Form.Check
                              key={site.id}
                              type="checkbox"
                              label={site.site_name}
                              checked={formData.site_id?.includes(String(site.id))}
                              onChange={(e) =>
                                handleSiteToggle(site.id, e.target.checked)
                              }
                            />
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
              <div className="text-center mt-4">
                <Button variant="success" onClick={handleUpdateClientSites}>
                  Update Client & Sites
                </Button>
              </div>
            </Card>
          )}

          {!showForm && (
            <Card className="shadow-sm border-0">
              <Card.Header
                style={{
                  background: "#fff",
                  padding: "8px 16px",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "44px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#888",
                    marginRight: "4px",
                  }}
                >
                  Status:
                </span>
                {[
                  { label: "Active", value: 0 },
                  { label: "Inactive", value: 1 },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveStatus(tab.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "3px 14px",
                      borderRadius: "20px",
                      border: "1.5px solid",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      lineHeight: "1.6",
                      borderColor:
                        activeStatus === tab.value
                          ? tab.value === 0
                            ? "#28a745"
                            : "#dc3545"
                          : "#ccc",
                      backgroundColor:
                        activeStatus === tab.value
                          ? tab.value === 0
                            ? "#28a745"
                            : "#dc3545"
                          : "#fff",
                      color: activeStatus === tab.value ? "#fff" : "#666",
                    }}
                  >
                    {tab.label} ({tab.value === 0 ? activeCount : inactiveCount})
                  </button>
                ))}
              </Card.Header>
              {loading ? (
                // <Alert variant="warning" className="mb-0 text-center">
                //   Loading...
                // </Alert>
                <LoadingScreen />
              ) : error ? (
                <Alert variant="danger" className="mb-0 text-center">
                  {error}
                </Alert>
              ) : (
                <Table responsive bordered hover className="list-table">
                  <thead className="table-secondary">
                    <tr>
                      <th style={{ width: "70px" }}>Sr No</th>
                      <th style={{ width: "60px" }}>Profile</th>
                      <th>Name / Email</th>
                      <th>Role</th>
                      <th>Branch</th>
                      <th>Contact No</th>

                      {/* ONE BOX */}
                      <th style={{ minWidth: "180px" }}>Tracking Details</th>

                      <th style={{ width: "120px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr className="text-center">
                        <td colSpan={7}>No data found</td>
                      </tr>
                    ) : (
                      currentUsers.map((user, index) => (
                        <tr key={user.id}>
                          {/* SR NO */}
                          <td className="text-center">
                            {indexOfFirstUser + index + 1}
                          </td>

                          {/* PROFILE */}
                          <td className="text-center">
                            <img
                              src={
                                user?.profile_image
                                  ? user.profile_image.startsWith("http") ||
                                    user.profile_image.startsWith("data:") ||
                                    user.profile_image.startsWith("blob:")
                                    ? user.profile_image
                                    : `${import.meta.env.VITE_FRONTEND_FOLDER || ""}/api/${user.profile_image.replace(/\\/g, "/").replace(/^\//, "")}`
                                  : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                              }
                              alt="Profile"
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                              }}
                            />
                          </td>

                          {/* NAME + EMAIL merged */}
                          <td>
                            <div>
                              <div
                                className="fw-semibold d-flex align-items-center flex-wrap"
                                style={{ fontSize: "12px" }}
                              >
                                <span>{user.fullname || user.first_name}</span>
                              </div>
                              <small
                                className="text-muted"
                                style={{ fontSize: "11px" }}
                              >
                                {user.email || ""}
                              </small>
                            </div>
                          </td>

                          {/* ROLE */}
                          <td>{user.role || "N/A"}</td>

                          {/* BRANCH */}
                          <td>
                            {user.branch_name_actual || user.branch_name || "N/A"}
                          </td>

                          {/* PHONE */}
                          <td>{user.phone || "N/A"}</td>

                          {/* TRACKING */}
                          <td>
                            <AuditTrail
                              createdOn={user.created_on}
                              createdByName={user.created_by_name}
                              modifiedOn={user.modified_on}
                              modifiedByName={user.modified_by_name}
                              disabledOn={user.disabled_on}
                              disabledByName={user.disabled_by_name}
                              isActive={activeStatus === 0}
                            />
                          </td>

                          {/* ACTIONS */}
                          <td>
                            {(() => {
                              const isCreatedBySuperAdmin =
                                Number(user.created_by) === 1 ||
                                String(user.created_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                                String(user.created_by_name).trim().toUpperCase() === "SUPERADMIN";
                              const isLockedBySuperAdmin =
                                String(user.superadmin_status) === "1" ||
                                Number(user.disabled_by) === 1 ||
                                String(user.disabled_by_name).trim().toUpperCase() === "SUPER ADMIN" ||
                                String(user.disabled_by_name).trim().toUpperCase() === "SUPERADMIN";
                              const canModify = isSuperAdmin || !isCreatedBySuperAdmin;

                              return (
                                <Dropdown>
                                  <Dropdown.Toggle
                                    variant="secondary"
                                    size="sm"
                                    id={`dropdown-${user.id}`}
                                  >
                                    Actions
                                  </Dropdown.Toggle>

                                  <Dropdown.Menu
                                    renderOnMount={true}
                                    popperConfig={{ strategy: "fixed" }}
                                  >
                                    <Dropdown.Item onClick={() => handleView(user)}>
                                      <FaEye className="me-2" />
                                      View
                                    </Dropdown.Item>

                                    {activeStatus === 0 &&
                                      canModify &&
                                      (isSuperAdmin || userPerms?.edit_access === 1) && (
                                        <Dropdown.Item onClick={() => handleEdit(user)}>
                                          <FaPen className="me-2" />
                                          Edit
                                        </Dropdown.Item>
                                      )}

                                    {activeStatus === 0 &&
                                      canModify &&
                                      (isSuperAdmin || userPerms?.delete_access === 1) && (
                                        <Dropdown.Item
                                          className="text-danger"
                                          onClick={() => handleDelete(user.id)}
                                        >
                                          <FaTrashAlt className="me-2" />
                                          Delete
                                        </Dropdown.Item>
                                      )}

                                    {activeStatus === 1 &&
                                      (isSuperAdmin || (!isLockedBySuperAdmin && userPerms?.delete_access === 1)) && (
                                        <Dropdown.Item
                                          className="text-success"
                                          onClick={() => handleRestore(user.id)}
                                        >
                                          <FaUndo className="me-2" />
                                          Restore
                                        </Dropdown.Item>
                                      )}
                                  </Dropdown.Menu>
                                </Dropdown>
                              );
                            })()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-3">
                  <Pagination>
                    {/* PREVIOUS */}
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />

                    {/* PAGE NUMBERS */}
                    {[...Array(totalPages)]
                      .map((_, index) => index + 1)
                      .filter((page) => {
                        let startPage = Math.max(1, currentPage - 1);
                        let endPage = startPage + 3;
                        if (endPage > totalPages) {
                          endPage = totalPages;
                          startPage = Math.max(1, endPage - 3);
                        }
                        return page >= startPage && page <= endPage;
                      })
                      .map((page) => (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}

                    {/* NEXT */}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </Card>
          )}
        </div>
      );
    };

    export default UserPage;
