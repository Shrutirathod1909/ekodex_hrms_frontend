import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import Select from "react-select";
import FilterPanel from "../../utils/FilterPanel";
import { Overlay } from "react-bootstrap";
import { FaPen, FaMinus, FaPlus, FaSearch, FaTrashAlt } from "react-icons/fa";

import { PermissionsContext } from "../../components/context/PermissionsContext";

import { Button, Card, Col, Form, Row, Table, Dropdown,  Modal } from "react-bootstrap";

const API_URL = import.meta.env.VITE_API_URL;

const TEMPLATE_API = `${API_URL}/api/salary-templates`;
const EARNING_API = `${API_URL}/api/salary-earning`;
const DEDUCTION_API = `${API_URL}/api/salary-deduction`;

export default function SalaryTemplatePage() {
  const { permissions, userData, getPermissionsByModule } =
    useContext(PermissionsContext);
  const [showAction, setShowAction] = useState(null);
  const actionRefs = useRef({});
  const salaryTempPerms = getPermissionsByModule("Salary Template");

  console.log("salaryTempPerms", salaryTempPerms, permissions);

  // =====================================================
  // STATES
  // =====================================================

  const [templates, setTemplates] = useState([]);
  const [charges, setCharges] = useState([]);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
const [viewTemplate, setViewTemplate] = useState(null);
const [viewEarnings, setViewEarnings] = useState([]);
const [viewDeductions, setViewDeductions] = useState([]);
const [viewLoading, setViewLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const isSuperAdmin =
    userData?.is_superadmin === true ||
    Number(userData?.id) === 1 ||
    String(userData?.role).trim().toUpperCase() === "SUPER ADMIN" ||
    String(userData?.role).trim().toUpperCase() === "SUPERADMIN";

  const [showSearch, setShowSearch] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  // =====================================================
  // EMPTY ROW
  // =====================================================

  const emptyEarningRow = () => ({
    id: null,
    name: "",
    rate: "",
    amount: "",
    from: "",
    to: "",
    calculateOn: "",
    select: "",
    compare: "",
  });

  const emptyDeductionRow = () => ({
    id: null,
    name: "",
    rate: "",
    amount: "",
    from: "",
    to: "",
    calculateOn: "",
    select: "",
    compare: "",
  });

  // =====================================================
  // INITIAL FORM
  // =====================================================

  const createInitialFormData = () => ({
    templateName: "",
    rank: "",
    company_id: "",
    branch_id: "",

    grossSalary: "",
    basicSalary: "",
    perDaySalary: "",
    hra: "",

    earnings: [emptyEarningRow()],

    deductions: [emptyDeductionRow()],
  });

  const [formData, setFormData] = useState(createInitialFormData());

  // =====================================================
  // SEARCH
  // =====================================================

  const [searchFields, setSearchFields] = useState([
    {
      field: "templateName",
      keyword: "",
    },
  ]);

  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

  // =====================================================
  // AUTH
  // =====================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =====================================================
  // HANDLE API ERROR
  // =====================================================

  const handleApiError = (err) => {
    console.error("API ERROR:", err);

    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong";

    alert(message);
  };

  // =====================================================
  // SEARCH OPTIONS
  // =====================================================

  const searchOptions = [
    {
      value: "templateName",
      label: "Template Name",
    },
     {
    value: "company",
    label: "Company",
  },
  {
    value: "branch",
    label: "Branch",
  },
    {
      value: "rank",
      label: "Rank",
    },
    {
      value: "grossSalary",
      label: "Gross Salary",
    },
    {
      value: "basicSalary",
      label: "Basic Salary",
    },
  ];

  // =====================================================
  // DOWNLOAD EXCEL
  // SEARCH AS PER FILTER
  // =====================================================

  const handleDownloadExcel = async () => {
    try {
      const params = {};

      // =========================================
      // SEARCH FIELDS
      // =========================================

      const validSearch = searchFields.filter(
        (f) => f.field && f.keyword && String(f.keyword).trim() !== "",
      );

      if (validSearch.length > 0) {
        params.searchFields = JSON.stringify(
          validSearch.map((item) => ({
            field: item.field,
            keyword: String(item.keyword).trim(),
          })),
        );
      }

      // =========================================
      // DATE FILTER
      // =========================================

      if (dateFilter?.from && dateFilter?.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      console.log("EXPORT PARAMS:", params);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(`${TEMPLATE_API}/export`, {
        params,

        headers: {
          Authorization: `Bearer ${token}`,
        },

        responseType: "blob",
      });

      // =========================================
      // DOWNLOAD FILE
      // =========================================

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "salary_templates.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("DOWNLOAD EXCEL ERROR:", err);

      // Blob response असल्यास actual backend error मिळवणे
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();

          console.error("Excel Error Response:", text);
        } catch (e) {
          console.error(e);
        }
      }

      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      alert("Failed to download Excel.");
    }
  };
  // =====================================================
  // FETCH TEMPLATES
  // =====================================================
  const fetchTemplates = async (
    customSearchFields = searchFields,
    customDateFilter = dateFilter,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      // =========================================
      // SEARCH FIELDS
      // =========================================

      const validSearch = customSearchFields.filter(
        (f) => f.field && f.keyword && String(f.keyword).trim() !== "",
      );

      if (validSearch.length > 0) {
        params.searchFields = JSON.stringify(
          validSearch.map((item) => ({
            field: item.field,
            keyword: String(item.keyword).trim(),
          })),
        );
      }

      // =========================================
      // DATE FILTER
      // =========================================

      if (customDateFilter?.from && customDateFilter?.to) {
        params.fromDate = customDateFilter.from;
        params.toDate = customDateFilter.to;
      }

      console.log("=================================");
      console.log("SALARY TEMPLATE SEARCH PARAMS:");
      console.log(params);
      console.log("SEARCH FIELDS:", validSearch);
      console.log("DATE FILTER:", customDateFilter);
      console.log("=================================");

      const response = await axios.get(TEMPLATE_API, {
        params,
        ...getAuthHeaders(),
      });

      console.log("Templates Search Response:", response.data);

      const templateData = response.data?.data || response.data || [];

      setTemplates(Array.isArray(templateData) ? templateData : []);
    } catch (err) {
      console.error("Fetch templates error:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to fetch templates.",
      );
    } finally {
      setLoading(false);
    }
  };
  // =====================================================
  // FETCH ROLES
  // =====================================================

  // const fetchRoles = async () => {
  //   setRolesLoading(true);

  //   try {
  //     const response = await axios.get(
  //       `${API_URL}/api/roles`,
  //       getAuthHeaders(),
  //     );

  //     console.log("Roles Response:", response.data);

  //     const roleData = response.data?.data || response.data || [];

  //     const roleOptions = roleData.map((role) => ({
  //       value: role.id ?? role.role_id ?? role.name ?? role.role_name,

  //       label: role.name ?? role.role_name ?? role.role ?? "",
  //     }));

  //     console.log("ROLE OPTIONS:", roleOptions);

  //     setRoles(roleOptions);
  //   } catch (err) {
  //     console.error("Fetch roles error:", err);

  //     handleApiError(err);

  //     setRoles([]);
  //   } finally {
  //     setRolesLoading(false);
  //   }
  // };
const fetchRoles = async (companyIds = []) => {
  setRolesLoading(true);

  try {
    const response = await axios.get(
      `${API_URL}/api/employee-types`,
      getAuthHeaders(),
    );

    console.log("Employee Type Response:", response.data);

    const employeeTypeData = response.data?.data || [];

    const filteredEmployeeTypes = employeeTypeData.filter((empType) => {
      // Company select nasel tar rank show karu naka
      if (companyIds.length === 0) return false;

      // API response madhil company ID nusar filter
      const empCompanyId =
        empType.company_id ?? empType.company?.id;

      return companyIds.some(
        (id) => String(id) === String(empCompanyId),
      );
    });

    const employeeTypeOptions = filteredEmployeeTypes.map((empType) => ({
      value: empType.id,
      label: empType.emp_type,
    }));

    setRoles(employeeTypeOptions);
  } catch (err) {
    console.error("Fetch employee type error:", err);
    handleApiError(err);
    setRoles([]);
  } finally {
    setRolesLoading(false);
  }
};

  const fetchCharges = async () => {
    setChargesLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/charges`,
        getAuthHeaders(),
      );

      console.log("================================");
      console.log("CHARGES API RESPONSE:", response.data);

      const chargeData = response.data?.data || response.data || [];

      console.log("RAW CHARGES DATA:", chargeData);

      const chargeOptions = chargeData.map((charge) => ({
        value: charge.id ?? charge.charge_id,

        // DB मध्ये हाच name पाठवायचा
        label:
          charge.label_display ||
          charge.charges_master ||
          charge.name ||
          charge.charge_name ||
          "",
      }));

      console.log("CHARGE OPTIONS:", chargeOptions);

      setCharges(chargeOptions);
    } catch (err) {
      console.error("Fetch charges error:", err);

      handleApiError(err);

      setCharges([]);
    } finally {
      setChargesLoading(false);
    }
  };
  // =====================================================
  // FETCH EARNINGS
  // =====================================================

  const fetchEarnings = async (tmplId) => {
    try {
      const response = await axios.get(
        `${EARNING_API}/template/${tmplId}`,
        getAuthHeaders(),
      );

      console.log("Earning Response:", response.data);

      return response.data?.data || [];
    } catch (err) {
      console.error("Fetch earnings error:", err);

      handleApiError(err);

      return [];
    }
  };

  // =====================================================
  // FETCH DEDUCTIONS
  // =====================================================

  const fetchDeductions = async (tmplId) => {
    try {
      const response = await axios.get(
        `${DEDUCTION_API}/template/${tmplId}`,
        getAuthHeaders(),
      );

      console.log("Deduction Response:", response.data);

      return response.data?.data || [];
    } catch (err) {
      console.error("Fetch deductions error:", err);

      handleApiError(err);

      return [];
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
useEffect(() => {
  const companyIds = selectedCompanies.map((company) => company.value);

  // Company change zalyavar junya company cha rank clear kar
  setFormData((prev) => ({
    ...prev,
    rank: "",
  }));

  setRoles([]);

  if (companyIds.length > 0) {
    fetchRoles(companyIds);
  }
}, [selectedCompanies]);
  useEffect(() => {
    fetchTemplates();
    fetchCharges();

    const fetchCompanies = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/companies/allotted`,
          getAuthHeaders()
        );
        const compList = res.data?.data || res.data || [];
        setCompanies(Array.isArray(compList) ? compList : []);
      } catch (err) {
        console.warn("Failed to fetch allotted companies:", err);
      }
    };

  const fetchAllBranches = async () => {
  try {
    const res = await axios.get(
      `${API_URL}/api/branches`,
      getAuthHeaders()
    );

    console.log("Branches API Response:", res.data);

    setAllBranches(
      Array.isArray(res.data)
        ? res.data
        : res.data?.data || []
    );
  } catch (err) {
    console.error(
      "Failed to fetch all branches:",
      err.response?.data || err.message
    );
  }
};

    fetchCompanies();
    fetchAllBranches();
  }, []);

  // Auto-select single company if available
  useEffect(() => {
    if (companies.length === 1 && !editingTemplate && selectedCompanies.length === 0) {
      setSelectedCompanies([
        {
          value: companies[0].id,
          label: companies[0].company_name || companies[0].name,
        },
      ]);
    }
  }, [companies, editingTemplate]);

  // Fetch branches when selectedCompanies change
  useEffect(() => {
    if (!selectedCompanies || selectedCompanies.length === 0) {
      setBranches([]);
      setSelectedBranches([]);
      return;
    }

    
const fetchBranchesForSelected = async () => {
  try {
    const compIds = selectedCompanies
      .map((c) => c.value)
      .join(",");

    // Company select नसेल तर branches clear करा
    if (!compIds) {
      setBranches([]);
      setSelectedBranches([]);
      return;
    }

    // Selected companies च्या branches fetch करा
    const res = await axios.get(
      `${API_URL}/api/branches/by-company/0?company_id=${compIds}`,
      getAuthHeaders()
    );

    const branchList = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    console.log("Selected Company IDs:", compIds);
    console.log("API Branch List:", branchList);

    // API मधून आलेल्या सर्व branches दाखवा
    setBranches(branchList);

    // आधी निवडलेल्या branches अजून उपलब्ध असतील तर त्या ठेवा
    setSelectedBranches((prev) => {
      const valid = prev.filter((sb) =>
        branchList.some(
          (b) => String(b.id) === String(sb.value)
        )
      );

      // फक्त एकच branch असल्यास ती auto-select करा
      if (branchList.length === 1 && valid.length === 0) {
        return [
          {
            value: branchList[0].id,
            label:
              branchList[0].branch_name ||
              branchList[0].name ||
              `Branch ${branchList[0].id}`,
          },
        ];
      }

      return valid;
    });
  } catch (err) {
    console.error(
      "Failed to fetch branches:",
      err.response?.data || err.message
    );

    setBranches([]);
    setSelectedBranches([]);
  }
};

    fetchBranchesForSelected();
  }, [selectedCompanies, userData]);

  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.company_name || c.name || c.companyName,
  }));

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: b.branch_name || b.name,
  }));

  const formatCompanyNames = (companyIdStr) => {
    if (!companyIdStr) return "All";
    const ids = String(companyIdStr).split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return "All";
    return ids
      .map((id) => {
        const found = companies.find((c) => String(c.id) === String(id));
        return found ? (found.company_name || found.name) : id;
      })
      .join(", ");
  };

  const formatBranchNames = (branchIdStr) => {
    if (!branchIdStr) return "All";
    const ids = String(branchIdStr).split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return "All";
    return ids
      .map((id) => {
        const found = allBranches.find((b) => String(b.id) === String(id));
        return found ? found.branch_name : id;
      })
      .join(", ");
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    fetchTemplates(searchFields, dateFilter);
  };
  const handleReset = async () => {
    const resetSearchFields = [
      {
        field: "templateName",
        keyword: "",
      },
    ];

    const resetDateFilter = {
      from: "",
      to: "",
    };

    setSearchFields(resetSearchFields);
    setDateFilter(resetDateFilter);

    await fetchTemplates(resetSearchFields, resetDateFilter);
  };
  // =====================================================
  // ADD EARNING
  // =====================================================

  const addEarningRow = () => {
    setFormData((prev) => ({
      ...prev,

      earnings: [...prev.earnings, emptyEarningRow()],
    }));
  };

  // =====================================================
  // ADD DEDUCTION
  // =====================================================

  const addDeductionRow = () => {
    setFormData((prev) => ({
      ...prev,

      deductions: [...prev.deductions, emptyDeductionRow()],
    }));
  };

  // =====================================================
  // REMOVE EARNING
  // =====================================================

  const removeEarningRow = async (idx) => {
    const row = formData.earnings[idx];

    // Existing DB record
    if (row?.id) {
      if (!window.confirm("Are you sure you want to delete this earning?")) {
        return;
      }

      try {
        await axios.post(
          `${EARNING_API}/delete/${row.id}`,
          {},
          getAuthHeaders(),
        );

        alert("Earning deleted successfully.");
      } catch (err) {
        console.error("DELETE EARNING ERROR:", err);

        handleApiError(err);

        return;
      }
    }

    // Remove from UI
    setFormData((prev) => ({
      ...prev,

      earnings: prev.earnings.filter((_, i) => i !== idx),
    }));
  };

  // =====================================================
  // REMOVE DEDUCTION
  // =====================================================
  const removeDeductionRow = async (idx) => {
    const row = formData.deductions[idx];

    // Existing DB record
    if (row?.id) {
      if (!window.confirm("Are you sure you want to delete this deduction?")) {
        return;
      }

      try {
        await axios.post(
          `${DEDUCTION_API}/delete/${row.id}`,
          {},
          getAuthHeaders(),
        );

        alert("Deduction deleted successfully.");
      } catch (err) {
        console.error("DELETE DEDUCTION ERROR:", err);

        handleApiError(err);

        return;
      }
    }

    // Remove from UI
    setFormData((prev) => ({
      ...prev,

      deductions: prev.deductions.filter((_, i) => i !== idx),
    }));
  };

  // =====================================================
  // MAIN FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // ROW CHANGE
  // =====================================================

  const handleRowChange = (arr, idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev[arr]];

      updated[idx] = {
        ...updated[idx],
        [field]: value,
      };

      return {
        ...prev,
        [arr]: updated,
      };
    });
  };

  // =====================================================
  // PER DAY SALARY
  // =====================================================

  useEffect(() => {
    const gross = parseFloat(formData.grossSalary) || 0;

    if (gross > 0) {
      const perDay = gross / 30;

      setFormData((prev) => ({
        ...prev,
        perDaySalary: perDay.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        perDaySalary: "",
      }));
    }
  }, [formData.grossSalary]);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setEditingTemplate(null);

    setValidationErrors({});

    setFormData(createInitialFormData());

    if (companies.length === 1) {
      setSelectedCompanies([
        {
          value: companies[0].id,
          label: companies[0].company_name || companies[0].name,
        },
      ]);
    } else {
      setSelectedCompanies([]);
    }
    setSelectedBranches([]);
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const errors = {};

    if (companies.length > 0 && selectedCompanies.length === 0) {
      errors.company = "Company is required";
    }

    if (!formData.templateName.trim()) {
      errors.templateName = "Template Name is required";
    }

    if (!formData.rank.trim()) {
      errors.rank = "Rank is required";
    }

    if (!formData.grossSalary) {
      errors.grossSalary = "Gross Salary is required";
    }

    if (!formData.basicSalary) {
      errors.basicSalary = "Basic Salary is required";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // TEMPLATE PAYLOAD
  // =====================================================

  const getTemplatePayload = () => ({
    template_name: formData.templateName,

    rank: formData.rank,

    company_id: selectedCompanies.map((c) => c.value).join(",") || null,

    branch_id: selectedBranches.map((b) => b.value).join(",") || null,

    gross_salary: formData.grossSalary,

    gross_salary_type: "Monthly",

    basic_salary: formData.basicSalary,

    basic_salary_type: "Monthly",

    perday_salary: formData.perDaySalary,

    hra: formData.hra,
  });

  // =====================================================
  // EARNING PAYLOAD
  // =====================================================

  const getEarningPayload = (earning, tmplId) => ({
    tmpl_id: tmplId,

    earning_name: earning.name,

    earning_rate: earning.rate,

    earning_amount: earning.amount,

    ea_from_date: earning.from || null,

    ea_to_date: earning.to || null,

    ea_calculateon: earning.calculateOn,

    ea_operator: earning.select,

    ea_comp_operator: earning.compare,
  });

  // =====================================================
  // DEDUCTION PAYLOAD
  // =====================================================

  const getDeductionPayload = (deduction, tmplId) => ({
    tmpl_id: tmplId,

    deduction_name: deduction.name,

    deduction_rate: deduction.rate,

    deduction_amount: deduction.amount,

    from_date: deduction.from || null,

    to_date: deduction.to || null,

    dd_calculateon: deduction.calculateOn,

    dd_operator: deduction.select,

    dd_comp_operator: deduction.compare,
  });

  // =====================================================
  // CREATE EARNING
  // IMPORTANT:
  // POST /api/salary-earning
  // NOT /create
  // =====================================================

  const createEarning = async (earning, tmplId) => {
    if (!earning.name) return;

    const payload = getEarningPayload(earning, tmplId);

    console.log("CREATE EARNING:", payload);

    await axios.post(EARNING_API, payload, getAuthHeaders());
  };

  // =====================================================
  // UPDATE EARNING
  // IMPORTANT:
  // POST /api/salary-earning/:id
  // NOT /update/:id
  // =====================================================

  const updateEarning = async (earning, tmplId) => {
    if (!earning.id) return;

    const payload = getEarningPayload(earning, tmplId);

    console.log("UPDATE EARNING:", earning.id, payload);
    await axios.post(
      `${EARNING_API}/update/${earning.id}`,
      payload,
      getAuthHeaders(),
    );
  };

  // =====================================================
  // CREATE DEDUCTION
  // =====================================================

  const createDeduction = async (deduction, tmplId) => {
    if (!deduction.name) return;

    const payload = getDeductionPayload(deduction, tmplId);

    console.log("CREATE DEDUCTION:", payload);

    await axios.post(DEDUCTION_API, payload, getAuthHeaders());
  };

  // =====================================================
  // UPDATE DEDUCTION
  // =====================================================

  const updateDeduction = async (deduction, tmplId) => {
    if (!deduction.id) return;

    const payload = getDeductionPayload(deduction, tmplId);

    console.log("UPDATE DEDUCTION:", deduction.id, payload);

    await axios.post(
      `${DEDUCTION_API}/update/${deduction.id}`,
      payload,
      getAuthHeaders(),
    );
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // =================================================
      // CREATE TEMPLATE
      // =================================================

      if (!editingTemplate) {
        const payload = getTemplatePayload();

        console.log("CREATE TEMPLATE:", payload);

        const templateResponse = await axios.post(
          TEMPLATE_API,
          payload,
          getAuthHeaders(),
        );

        console.log("Template Response:", templateResponse.data);

        const tmplId = templateResponse.data?.data?.id;

        if (!tmplId) {
          throw new Error("Template ID not returned from server.");
        }

        console.log("Created Template ID:", tmplId);

        // =============================================
        // CREATE EARNINGS
        // =============================================

        for (const earning of formData.earnings) {
          if (!earning.name) continue;

          await createEarning(earning, tmplId);
        }

        // =============================================
        // CREATE DEDUCTIONS
        // =============================================

        for (const deduction of formData.deductions) {
          if (!deduction.name) continue;

          await createDeduction(deduction, tmplId);
        }

        alert("Salary Template created successfully!");
      }

      // =================================================
      // UPDATE TEMPLATE
      // =================================================
      else {
        const templateId = editingTemplate.id;

        const payload = getTemplatePayload();

        console.log("UPDATE TEMPLATE:", templateId, payload);

        await axios.post(
          `${TEMPLATE_API}/update/${templateId}`,
          payload,
          getAuthHeaders(),
        );

        // =============================================
        // UPDATE / CREATE EARNINGS
        // =============================================

        for (const earning of formData.earnings) {
          if (!earning.name) continue;

          if (earning.id) {
            await updateEarning(earning, templateId);
          } else {
            await createEarning(earning, templateId);
          }
        }

        // =============================================
        // UPDATE / CREATE DEDUCTIONS
        // =============================================

        for (const deduction of formData.deductions) {
          if (!deduction.name) continue;

          if (deduction.id) {
            await updateDeduction(deduction, templateId);
          } else {
            await createDeduction(deduction, templateId);
          }
        }

        alert("Salary Template updated successfully!");
      }

      // =================================================
      // RESET
      // =================================================

      setShowForm(false);

      resetForm();

      await fetchTemplates();
    } catch (err) {
      console.error("SAVE SALARY TEMPLATE ERROR:", err);

      handleApiError(err);
    }
  };

  // =====================================================
  // EDIT TEMPLATE
  // =====================================================

  
const handleView = async (template) => {
  setViewTemplate(template);
  setShowViewModal(true);
  setViewLoading(true);
  setViewEarnings([]);
  setViewDeductions([]);

  try {
    const [earnings, deductions] = await Promise.all([
      fetchEarnings(template.id),
      fetchDeductions(template.id),
    ]);

    setViewEarnings(earnings);
    setViewDeductions(deductions);
  } catch (err) {
    console.error("VIEW TEMPLATE ERROR:", err);
    handleApiError(err);
  } finally {
    setViewLoading(false);
  }
};

  const handleEdit = async (template) => {
    try {
      setLoading(true);

      const [earnings, deductions] = await Promise.all([
        fetchEarnings(template.id),
        fetchDeductions(template.id),
      ]);

      console.log("EDIT EARNINGS:", earnings);

      console.log("EDIT DEDUCTIONS:", deductions);

      setEditingTemplate(template);

      let initialSelectedComp = [];
      if (template.company_id) {
        const compIds = String(template.company_id)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        initialSelectedComp = compIds.map((id) => {
          const found = companies.find((c) => String(c.id) === String(id));
          return found
            ? { value: found.id, label: found.company_name || found.name }
            : { value: id, label: `Company ${id}` };
        });
      } else if (companies.length === 1) {
        initialSelectedComp = [
          {
            value: companies[0].id,
            label: companies[0].company_name || companies[0].name,
          },
        ];
      }
      setSelectedCompanies(initialSelectedComp);

      if (initialSelectedComp.length > 0) {
        try {
          const compIds = initialSelectedComp.map((c) => c.value).join(",");
          const res = await axios.get(
            `${API_URL}/api/branches/by-company/0?company_id=${compIds}`,
            getAuthHeaders()
          );
        
const branchList = Array.isArray(res.data)
  ? res.data
  : Array.isArray(res.data?.data)
    ? res.data.data
    : [];

setBranches(branchList);

if (template.branch_id) {
  const bIds = String(template.branch_id)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const selB = bIds
    .map((id) => {
      const found = branchList.find(
        (b) => String(b.id) === String(id)
      );

      if (!found) {
        console.warn(
          "Branch ID not found in API response:",
          id,
          branchList
        );
        return null;
      }

      return {
        value: found.id,
        label:
          found.branch_name ||
          found.name ||
          `Branch ${found.id}`,
      };
    })
    .filter(Boolean);

  setSelectedBranches(selB);
} else {
  setSelectedBranches([]);
}
} catch (e) {
          console.error("Failed to load branches on edit:", e);
        }
      } else {
        setSelectedBranches([]);
      }

      setFormData({
        templateName: template.template_name || "",

        rank: template.rank || "",

        company_id: template.company_id || "",

        branch_id: template.branch_id || "",

        grossSalary: template.gross_salary || "",

        basicSalary: template.basic_salary || "",

        perDaySalary: template.perday_salary || "",

        hra: template.hra || "",

        earnings:
          earnings.length > 0
            ? earnings.map((e) => ({
                id: e.id,

                name: e.earning_name || "",

                rate: e.earning_rate ?? "",

                amount: e.earning_amount ?? "",

                from: e.ea_from_date ? e.ea_from_date.split("T")[0] : "",

                to: e.ea_to_date ? e.ea_to_date.split("T")[0] : "",

                calculateOn: e.ea_calculateon || "",

                select: e.ea_operator || "",

                compare: e.ea_comp_operator || "",
              }))
            : [emptyEarningRow()],

        deductions:
          deductions.length > 0
            ? deductions.map((d) => ({
                id: d.id,

                name: d.deduction_name || "",

                rate: d.deduction_rate ?? "",

                amount: d.deduction_amount ?? "",

                from: d.from_date ? d.from_date.split("T")[0] : "",

                to: d.to_date ? d.to_date.split("T")[0] : "",

                calculateOn: d.dd_calculateon || "",

                select: d.dd_operator || "",

                compare: d.dd_comp_operator || "",
              }))
            : [emptyDeductionRow()],
      });

      setShowForm(true);

      setShowSearch(false);
    } catch (err) {
      console.error("EDIT TEMPLATE ERROR:", err);

      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE TEMPLATE
  // =====================================================

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await axios.delete(`${TEMPLATE_API}/${id}`, getAuthHeaders());

      alert("Template deleted successfully!");

      await fetchTemplates();
    } catch (err) {
      console.error("DELETE TEMPLATE ERROR:", err);

      handleApiError(err);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    setShowForm(false);

    resetForm();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="page-container">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">
        <h1 className="page-title">
          Salary Template{" "}
          <span className="text-success">({templates.length})</span>
        </h1>

        <div className="page-actions">
          <button
            className="search-btn"
            type="button"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch />

            {showSearch ? " Hide Search" : " Search"}
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setShowSearch(false);

              resetForm();

              if (companies.length === 1) {
                setSelectedCompanies([
                  {
                    value: companies[0].id,
                    label: companies[0].company_name || companies[0].name,
                  },
                ]);
              }

              setShowForm(true);
            }}
          >
            <FaPlus />
            Add New
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && <div className="error-message">{error}</div>}

      {/* =================================================
          SEARCH
      ================================================= */}

      {showSearch && (
        <div id="salary-search-panel">
          <FilterPanel
            searchFields={searchFields}
            setSearchFields={setSearchFields}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onSearch={handleSearch}
            onReset={handleReset}
            onDownloadExcel={handleDownloadExcel}
            searchOptions={searchOptions}
          />
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      {showForm ? (
        <Card>
          <h2 className="card-header mb-4">
            {editingTemplate
              ? `Edit Salary Template - ${formData.templateName}`
              : "Add New Salary Template"}
          </h2>

          <Form onSubmit={handleSubmit} className="salary-template-form">
            {/* =========================================
                BASIC TEMPLATE INFORMATION
            ========================================= */}

            <Row>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Company *</Form.Label>
                  <Select
                    isMulti
                    options={companyOptions}
                    value={selectedCompanies}
                    onChange={(selected) => {
                      setSelectedCompanies(selected || []);
                      if (validationErrors.company) {
                        setValidationErrors((prev) => ({ ...prev, company: "" }));
                      }
                    }}
                    placeholder="Select Company"
                    className={validationErrors.company ? "is-invalid" : ""}
                    classNamePrefix="company-select"
                  />
                  {validationErrors.company && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.company}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Select
                    isMulti
                    options={branchOptions}
                    value={selectedBranches}
                    onChange={(selected) => setSelectedBranches(selected || [])}
                    placeholder="Select Branch (All if empty)"
                    isDisabled={selectedCompanies.length === 0}
                    classNamePrefix="branch-select"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Template Name *</Form.Label>

                  <Form.Control
                    name="templateName"
                    value={formData.templateName}
                    onChange={handleChange}
                    placeholder="Template Name"
                    isInvalid={!!validationErrors.templateName}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.templateName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Rank *</Form.Label>

                <Select
  options={roles}
  isLoading={rolesLoading}
  isSearchable
  isClearable
  placeholder={
    selectedCompanies.length > 0
      ? "Search / Select Rank"
      : "First Select Company"
  }
  isDisabled={selectedCompanies.length === 0}
  value={
    roles.find(
      (role) => String(role.label) === String(formData.rank),
    ) || null
  }
  onChange={(selected) => {
    setFormData((prev) => ({
      ...prev,
      rank: selected ? selected.label : "",
    }));

    setValidationErrors((prev) => ({
      ...prev,
      rank: "",
    }));
  }}
  classNamePrefix="rank-select"
/>

                  {validationErrors.rank && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.rank}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Gross Salary *</Form.Label>

                  <Form.Control
                    name="grossSalary"
                    type="number"
                    min="0"
                    value={formData.grossSalary}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (Number(value) < 0) return;

                      handleChange(e);
                    }}
                    placeholder="Gross Salary"
                    isInvalid={!!validationErrors.grossSalary}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.grossSalary}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Basic Salary *</Form.Label>

                  <Form.Control
                    name="basicSalary"
                    type="number"
                    min="0"
                    value={formData.basicSalary}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (Number(value) < 0) return;

                      handleChange(e);
                    }}
                    placeholder="Basic Salary"
                    isInvalid={!!validationErrors.basicSalary}
                  />

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.basicSalary}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Per Day Salary</Form.Label>

                  <Form.Control
                    name="perDaySalary"
                    type="number"
                    value={formData.perDaySalary}
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>HRA</Form.Label>
                  <Form.Control
                    name="hra"
                    type="number"
                    min="0"
                    value={formData.hra}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (Number(value) < 0) return;

                      handleChange(e);
                    }}
                    placeholder="HRA"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* =========================================
                SALARY SUMMARY
            ========================================= */}

            <div className="p-3 mb-3">
              <Row className="align-items-center text-center">
                <Col md={4} xs={12} className="mb-2">
                  <strong>Gross Salary:</strong> {formData.grossSalary || 0}
                </Col>

                <Col md={4} xs={12} className="mb-2">
                  <strong>Basic Salary:</strong> {formData.basicSalary || 0}
                </Col>

                <Col md={4} xs={12}>
                  <strong>Balance:</strong>{" "}
                  {(
                    parseFloat(formData.grossSalary || 0) -
                    parseFloat(formData.basicSalary || 0)
                  ).toFixed(2)}
                </Col>
              </Row>
            </div>

            {/* =================================================
                EARNINGS
            ================================================= */}

            <div>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-subtitle mt-3 mb-4">Earnings</h5>

                <Button
                  type="button"
                  className="d-flex align-items-center gap-2 add-earning-row"
                  onClick={addEarningRow}
                >
                  <FaPlus />

                  <span>Add Earning Row</span>
                </Button>
              </div>

              <Table hover bordered responsive>
                <thead className="table-secondary">
                  <tr>
                    <th style={{ minWidth: "250px", width: "250px" }}>Name</th>

                    <th>Rate (%)</th>

                    <th>Amount</th>

                    {/* <th>From</th>

                    <th>To</th> */}

                    <th>Calculate On</th>

                    <th>Select</th>

                    <th>Amount to Compare</th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {formData.earnings.map((row, idx) => (
                    <tr key={row.id || `earning-${idx}`}>
                      <td>
                        <Select
                          options={charges}
                          isLoading={chargesLoading}
                          isSearchable
                          isClearable
                          placeholder="Search Charge"
                          value={
                            charges.find(
                              (charge) =>
                                String(charge.label) === String(row.name),
                            ) || null
                          }
                          onChange={(selected) =>
                            handleRowChange(
                              "earnings",
                              idx,
                              "name",
                              selected ? selected.label : "",
                            )
                          }
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          classNamePrefix="charge-select"
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          step="any"
                          value={row.rate}
                          placeholder="Rate (%)"
                          onChange={(e) => {
                            const value = e.target.value;

                            if (Number(value) < 0) return;

                            handleRowChange("earnings", idx, "rate", value);
                          }}
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          value={row.amount}
                          placeholder="Amount"
                          onChange={(e) => {
                            const value = e.target.value;

                            if (Number(value) < 0) return;

                            handleRowChange("earnings", idx, "amount", value);
                          }}
                        />
                      </td>

                      {/* <td>
                        <Form.Control
                          type="date"
                          value={row.from}
                          onChange={(e) =>
                            handleRowChange(
                              "earnings",
                              idx,
                              "from",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="date"
                          value={row.to}
                          onChange={(e) =>
                            handleRowChange(
                              "earnings",
                              idx,
                              "to",
                              e.target.value,
                            )
                          }
                        />
                      </td> */}

                      <td>
                            <Form.Select
                                                      value={
                                                        row.calculateOn
                                                      }
                                                      onChange={(e) =>
                                                        handleRowChange(
                                                          "earnings",
                                                          idx,
                                                          "calculateOn",
                                                          e.target.value
                                                        )
                                                      }
                                                    >
                        
                                                    <option value="">
                          Select
                        </option>
                        
                        <option value="on Gross Salary">
                         On Gross Salary
                        </option>
                        
                        <option value="Calculated Salary By Days">
                          Calculated Salary by Days
                        </option>
                        
                        <option value="on Basic salary">
                          Basic 
                        </option>
                        
                        <option value="HRA">
                          HRA
                        </option>
                        
                        <option value="OTDays">
                          OT Days
                        </option>
                        
                        <option value="AT Actual">
                          AT Actual
                        </option>
                        
                                                    </Form.Select>
                      </td>

                      <td>
                         <Form.Select
                                                value={
                                                  row.select
                                                }
                                                onChange={(e) =>
                                                  handleRowChange(
                                                    "earnings",
                                                    idx,
                                                    "select",
                                                    e.target.value
                                                  )
                                                }
                                              >
                  
                                                <option value="">
                    Select
                  </option>
                  
                  <option value="Equal">
                    Equal
                  </option>
                  
                  <option value="GreaterThan">
                    Greater Than
                  </option>
                  
                  <option value="GreaterThanOrEqual">
                    Greater Than or Equal To
                  </option>
                  
                  <option value="LessThan">
                    Less Than
                  </option>
                  
                  <option value="LessThanOrEqual">
                    Less Than or Equal To
                  </option>
                  
                  <option value="Between">
                    Between
                  </option>
                  
                                              </Form.Select>
                      </td>

                      <td>
                    
<Form.Control
  type="text"
  value={row.compare}
  placeholder="e.g. 1000 or 1000-2000"
  onChange={(e) => {
    const value = e.target.value;

    // Allow numbers and one optional range separator
    if (/^\d*(?:-\d*)?$/.test(value)) {
      handleRowChange("earnings", idx, "compare", value);
    }
  }}
/>

                      </td>

                      <td>
                        <button
                          type="button"
                          className="icon-btn delete"
                          title="Delete"
                          onClick={() => removeEarningRow(idx)}
                        >
                          <FaMinus />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* =================================================
                DEDUCTIONS
            ================================================= */}

            <div>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-subtitle mt-3 mb-4">Deductions</h5>

                <Button
                  type="button"
                  className="d-flex align-items-center gap-2 add-deduction-row"
                  onClick={addDeductionRow}
                >
                  <FaPlus />

                  <span>Add Deduction Row</span>
                </Button>
              </div>

              <Table hover bordered responsive>
                <thead className="table-secondary">
                  <tr>
                    <th style={{ minWidth: "250px", width: "250px" }}>Name</th>

                    <th>Rate (%)</th>

                    <th>Amount</th>

                    {/* <th>From</th>

                    <th>To</th> */}

                    <th>Calculate On</th>

                    <th>Select</th>

                    <th>Amount to Compare</th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {formData.deductions.map((row, idx) => (
                    <tr key={row.id || `deduction-${idx}`}>
                      <td>
                        <Select
                          options={charges}
                          isLoading={chargesLoading}
                          isSearchable
                          isClearable
                          placeholder="Search Charge"
                          value={
                            charges.find(
                              (charge) =>
                                String(charge.label) === String(row.name),
                            ) || null
                          }
                          onChange={(selected) =>
                            handleRowChange(
                              "deductions",
                              idx,
                              "name",
                              selected ? selected.label : "",
                            )
                          }
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          classNamePrefix="charge-select"
                        />
                      </td>

                      <td>
                        {/* <Form.Control
  type="number"
  min="0"
  value={row.rate}
  placeholder="Rate (%)"
  onChange={(e) => {
    const value = e.target.value;

    if (Number(value) < 0) return;

    handleRowChange("deductions", idx, "rate", value);
  }}
/> */}
                        <Form.Control
                          type="number"
                          min="0"
                          step="any"
                          value={row.rate}
                          placeholder="Rate (%)"
                          onChange={(e) => {
                            const value = e.target.value;

                            if (Number(value) < 0) return;

                            handleRowChange("deductions", idx, "rate", value);
                          }}
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          value={row.amount}
                          placeholder="Amount"
                          onChange={(e) => {
                            const value = e.target.value;

                            if (Number(value) < 0) return;

                            handleRowChange("deductions", idx, "amount", value);
                          }}
                        />
                      </td>

                      {/* <td>
                        <Form.Control
                          type="date"
                          value={row.from}
                          onChange={(e) =>
                            handleRowChange(
                              "deductions",
                              idx,
                              "from",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="date"
                          value={row.to}
                          onChange={(e) =>
                            handleRowChange(
                              "deductions",
                              idx,
                              "to",
                              e.target.value,
                            )
                          }
                        />
                      </td> */}

                      <td>
                         <Form.Select
                                                 value={
                                                   row.calculateOn
                                                 }
                                                 onChange={(e) =>
                                                   handleRowChange(
                                                     "deductions",
                                                     idx,
                                                     "calculateOn",
                                                     e.target.value
                                                   )
                                                 }
                                               >
                     
                                                                   <option value="">
                       Select
                     </option>
                     
                     <option value="on Gross Salary">
                      On Gross Salary
                     </option>
                     
                     <option value="Calculated Salary By Days">
                       Calculated Salary by Days
                     </option>
                     
                     <option value="on Basic salary">
                       Basic 
                     </option>
                     
                     <option value="HRA">
                       HRA
                     </option>
                     
                     <option value="OTDays">
                       OT Days
                     </option>
                     
                     <option value="AT Actual">
                       AT Actual
                     </option>
                     
                     
                                               </Form.Select>
                      </td>

                      <td>
                      <Form.Select
                                               value={
                                                 row.select
                                               }
                                               onChange={(e) =>
                                                 handleRowChange(
                                                   "deductions",
                                                   idx,
                                                   "select",
                                                   e.target.value
                                                 )
                                               }
                                             >
                   
                                            
                                                 <option value="">
                     Select
                   </option>
                   
                   <option value="Equal">
                     Equal
                   </option>
                   
                   <option value="GreaterThan">
                     Greater Than
                   </option>
                   
                   <option value="GreaterThanOrEqual">
                     Greater Than or Equal To
                   </option>
                   
                   <option value="LessThan">
                     Less Than
                   </option>
                   
                   <option value="LessThanOrEqual">
                     Less Than or Equal To
                   </option>
                   
                   <option value="Between">
                     Between
                   </option>
                   
                                             </Form.Select>
                      </td>

                      <td>
                   
<Form.Control
  type="text"
  value={row.compare}
  placeholder="e.g. 1000 or 1000-2000"
  onChange={(e) => {
    const value = e.target.value;

    if (/^\d*(?:-\d*)?$/.test(value)) {
      handleRowChange("deductions", idx, "compare", value);
    }
  }}
/>

                      </td>

                      <td>
                        <button
                          type="button"
                          className="icon-btn delete"
                          title="Delete"
                          onClick={() => removeDeductionRow(idx)}
                        >
                          <FaMinus />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="form-actions d-flex justify-content-end">
              <Button
                type="button"
                variant="secondary"
                className="me-2"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button type="submit" className="primary">
                {editingTemplate ? "Update" : "Submit"}
              </Button>
            </div>
          </Form>
        </Card>
      ) : (
        /* =================================================
           TEMPLATE LIST
        ================================================= */

        <Card>
          <div className="table-responsive">
            {loading ? (
              <div className="loading-cell">Loading templates...</div>
            ) : (
              <div
                className="salary-table-wrapper"
                style={{
                  width: "100%",
                  position: "relative",
                }}
              >
                <Table
                  hover
                  bordered
                  className="salary-detail-table"
                  style={{
                    minWidth: "950px",
                    marginBottom: 0,
                  }}
                >
                  <thead className="table-secondary">
                    <tr>
                      <th>Sr No.</th>
                      <th>Template Name</th>
                      <th>Rank</th>
                      <th>Company</th>
                      <th>Branch</th>
                      <th>Gross Salary</th>
                      <th>Basic Salary</th>
                      <th>Per day salary</th>

                      <th
                        style={{
                          minWidth: "100px",
                          width: "100px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {templates.length > 0 ? (
                      templates.map((template, index) => (
                        <tr key={template.id}>
                          <td>{index + 1}</td>

                          <td>{template.template_name || "-"}</td>

                          <td>{template.rank || "-"}</td>

                          <td>{formatCompanyNames(template.company_id)}</td>

                          <td>{formatBranchNames(template.branch_id)}</td>

                          <td>
                            {template.gross_salary
                              ? `${template.gross_salary} Per month`
                              : "-"}
                          </td>

                          <td>
                            {template.basic_salary
                              ? `${template.basic_salary} (Rs.)`
                              : "-"}
                          </td>

                          <td>{template.perday_salary || "-"}</td>

                          {/* ACTION COLUMN */}
                          <td
                            style={{
                              minWidth: "100px",
                              width: "100px",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <Button
                              ref={(element) => {
                                actionRefs.current[template.id] = element;
                              }}
                              variant="secondary"
                              size="sm"
                              className="border-0 shadow-none"
                              onClick={() => {
                                setShowAction(
                                  showAction === template.id
                                    ? null
                                    : template.id,
                                );
                              }}
                            >
                              Action
                            </Button>

                            <Overlay
                              target={actionRefs.current[template.id]}
                              show={showAction === template.id}
                              placement="top"
                              rootClose
                              onHide={() => setShowAction(null)}
                              container={document.body}
                            >
                              {({
                                placement,
                                arrowProps,
                                show: overlayShow,
                                popper,
                                ...props
                              }) => (
                                <div
                                  {...props}
                                  style={{
                                    ...props.style,

                                    zIndex: 999999,

                                    minWidth: "140px",

                                    backgroundColor: "#ffffff",

                                    border: "1px solid #dee2e6",

                                    borderRadius: "6px",

                                    boxShadow:
                                      "0px 5px 15px rgba(0, 0, 0, 0.2)",

                                    padding: "5px",

                                    position: "fixed",
                                  }}
                                >
                                  
{/* VIEW */}
<Button
  variant="light"
  size="sm"
  className="w-100 text-start border-0"
  onClick={() => {
    handleView(template);
    setShowAction(null);
  }}
>
  <FaSearch className="me-2 text-success" />
  View
</Button>

                                  {/* EDIT */}
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="w-100 text-start border-0"
                                    onClick={() => {
                                      handleEdit(template);
                                      setShowAction(null);
                                    }}
                                  >
                                    <FaPen className="me-2 text-primary" />
                                    Edit
                                  </Button>

                                  {/* DELETE */}
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="w-100 text-start border-0 text-danger"
                                    onClick={() => {
                                      handleDelete(template.id);
                                      setShowAction(null);
                                    }}
                                  >
                                    <FaTrashAlt className="me-2" />
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </Overlay>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="no-data-cell"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          No templates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      )}
      
{/* ================= VIEW SALARY TEMPLATE MODAL ================= */}

<Modal
  show={showViewModal}
  onHide={() => setShowViewModal(false)}
  size="xl"
  centered
  scrollable
>
  <Modal.Header closeButton>
    <Modal.Title>
      Salary Template Details
      {viewTemplate?.template_name
        ? ` - ${viewTemplate.template_name}`
        : ""}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {viewLoading ? (
      <div className="text-center py-5">
        Loading salary template details...
      </div>
    ) : viewTemplate ? (
      <>
        {/* BASIC INFORMATION */}
        <h5 className="mb-3">Basic Information</h5>

        <Table bordered responsive>
          <tbody>
            <tr>
              <th>Template Name</th>
              <td>{viewTemplate.template_name || "-"}</td>
              <th>Rank</th>
              <td>{viewTemplate.rank || "-"}</td>
            </tr>

            <tr>
              <th>Company</th>
              <td>
                {formatCompanyNames(viewTemplate.company_id)}
              </td>
              <th>Branch</th>
              <td>
                {formatBranchNames(viewTemplate.branch_id)}
              </td>
            </tr>

            <tr>
              <th>Gross Salary</th>
              <td>
                {viewTemplate.gross_salary ?? "-"}
              </td>
              <th>Basic Salary</th>
              <td>
                {viewTemplate.basic_salary ?? "-"}
              </td>
            </tr>

            <tr>
              <th>Per Day Salary</th>
              <td>
                {viewTemplate.perday_salary ?? "-"}
              </td>
              <th>HRA</th>
              <td>{viewTemplate.hra ?? "-"}</td>
            </tr>
          </tbody>
        </Table>

        {/* SALARY SUMMARY */}
        <div className="p-3 mb-4 border rounded">
          <Row className="text-center">
            <Col md={4} xs={12} className="mb-2">
              <strong>Gross Salary</strong>
              <div>{viewTemplate.gross_salary ?? 0}</div>
            </Col>

            <Col md={4} xs={12} className="mb-2">
              <strong>Basic Salary</strong>
              <div>{viewTemplate.basic_salary ?? 0}</div>
            </Col>

            <Col md={4} xs={12}>
              <strong>Balance</strong>
              <div>
                {(
                  (Number(viewTemplate.gross_salary) || 0) -
                  (Number(viewTemplate.basic_salary) || 0)
                ).toFixed(2)}
              </div>
            </Col>
          </Row>
        </div>

        {/* EARNINGS */}
        <h5 className="mb-3">Earnings</h5>

        <Table bordered hover responsive>
          <thead className="table-secondary">
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Rate (%)</th>
              <th>Amount</th>
              <th>Calculate On</th>
              <th>Operator</th>
              <th>Amount to Compare</th>
            </tr>
          </thead>

          <tbody>
            {viewEarnings.length > 0 ? (
              viewEarnings.map((earning, index) => (
                <tr key={earning.id || index}>
                  <td>{index + 1}</td>
                  <td>{earning.earning_name || "-"}</td>
                  <td>{earning.earning_rate ?? "-"}</td>
                  <td>{earning.earning_amount ?? "-"}</td>
                  <td>{earning.ea_calculateon || "-"}</td>
                  <td>{earning.ea_operator || "-"}</td>
                  <td>{earning.ea_comp_operator || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No earnings found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* DEDUCTIONS */}
        <h5 className="mb-3 mt-4">Deductions</h5>

        <Table bordered hover responsive>
          <thead className="table-secondary">
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Rate (%)</th>
              <th>Amount</th>
              <th>Calculate On</th>
              <th>Operator</th>
              <th>Amount to Compare</th>
            </tr>
          </thead>

          <tbody>
            {viewDeductions.length > 0 ? (
              viewDeductions.map((deduction, index) => (
                <tr key={deduction.id || index}>
                  <td>{index + 1}</td>
                  <td>{deduction.deduction_name || "-"}</td>
                  <td>{deduction.deduction_rate ?? "-"}</td>
                  <td>{deduction.deduction_amount ?? "-"}</td>
                  <td>{deduction.dd_calculateon || "-"}</td>
                  <td>{deduction.dd_operator || "-"}</td>
                  <td>{deduction.dd_comp_operator || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No deductions found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </>
    ) : (
      <div className="text-center py-3">
        No template details available.
      </div>
    )}
  </Modal.Body>

  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => setShowViewModal(false)}
    >
      Close
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
}
