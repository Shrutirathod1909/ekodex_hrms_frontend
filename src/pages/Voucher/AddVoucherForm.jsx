import React, { useState, useEffect } from "react";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL;
const CLIENTS_API = import.meta.env.VITE_VOUCHER_CLIENTS_API;
const SITES_API = import.meta.env.VITE_VOUCHER_SITES_API;

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "31px",
    height: "31px",
    fontSize: "12px",
  }),
  valueContainer: (base) => ({
    ...base,
    minHeight: "31px",
    padding: "0 8px",
    fontSize: "12px",
  }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  option: (base) => ({ ...base, fontSize: "12px" }),
  placeholder: (base) => ({ ...base, fontSize: "12px" }),
  singleValue: (base) => ({ ...base, fontSize: "12px" }),
  indicatorsContainer: (base) => ({ ...base, height: "31px" }),
};

// Handle common API response formats
const getArray = (data) => {
  if (Array.isArray(data)) return data;

  const candidates = [
    data?.data,
    data?.data?.data,
    data?.companies,
    data?.branches,
    data?.clients,
    data?.sites,
    data?.user,
    data?.results,
  ];

  return candidates.find(Array.isArray) || [];
};

// Format date for HTML date input
const formatDate = (value) => {
  if (!value) return "";

  const date = String(value);
  return date.includes("T") ? date.split("T")[0] : date.slice(0, 10);
};

const AddVoucherForm = ({ onBack, editData }) => {
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [banks, setBanks] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [chargesTypeList, setChargesTypeList] = useState([]);

  const [type, setType] = useState("");

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);

  const modeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Online", label: "Online" },
    { value: "GPAY", label: "GPAY" },
    { value: "PhonePay", label: "PhonePay" },
    { value: "UPI Payment", label: "UPI Payment" },
    { value: "Cheque", label: "Cheque" },
  ];

  const [formData, setFormData] = useState({
    client_id: "",
    site_id: "",
    emp_id: "",
    emp_name: "",
    emp_code: "",
    company_id: "",
    company_name: "",
    branch_id: "",
    branch_name: "",
    site_name: "",
    adv_date: "",
    payment_date: "",
    amount: "",
    type: "",
    mode: "",
    from_bank: null,
    to_bank: null,
    client_bank: null,
    beneficiary_name: "",
    bank_name: "",
    bank_ac_no: "",
    ifsc_code: "",
    bank_branch: "",
    remark: "",
    gang_name: "",
    particular: [],
    payment_detail: "",
    voucher_no: "",
    cheque_no: "",
    credited_to: "",
    status: 0,
    schedule_date: "",
    created_by: "",
    created_by_name: "",
    from_bank_acno: "",
    from_bank_ifsc: "",
    from_bank_branch: "",
    from_bank_holder: "",
    to_bank_acno: "",
    to_bank_ifsc: "",
    to_bank_branch: "",
    to_bank_holder: "",
  });

  const [particulars, setParticulars] = useState(
    Array.from({ length: 10 }, () => ({
      particular: "",
      amount: "",
    }))
  );

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // Common API helpers
  // --------------------------------------------------

  const fetchJson = async (url, options = {}) => {
    if (!url) {
      throw new Error("API endpoint configure केलेला नाही.");
    }

    const response = await fetch(url, options);

    const text = await response.text();
    let result = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("API कडून valid JSON response मिळाला नाही.");
    }

    if (!response.ok || result?.error) {
      throw new Error(
        result?.message || `Request failed (${response.status})`
      );
    }

    return result;
  };

  const postForm = async (url, values) => {
    return fetchJson(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: new URLSearchParams(
        Object.entries(values).reduce((acc, [key, value]) => {
          acc[key] = value == null ? "" : String(value);
          return acc;
        }, {})
      ),
    });
  };

  const getCompanyId = (company) =>
    company?.id ?? company?.company_id;

  const getBranchId = (branch) =>
    branch?.id ?? branch?.branch_id;

  const getClientId = (client) =>
    client?.id ?? client?.client_id;

  const getSiteId = (site) =>
    site?.id ?? site?.site_id;

  const getCompanyLabel = (company) =>
    company?.company_name ??
    company?.title ??
    company?.name ??
    String(getCompanyId(company) ?? "");

  const getBranchLabel = (branch) =>
    branch?.branch_name ??
    branch?.title ??
    branch?.name ??
    String(getBranchId(branch) ?? "");

  const getClientLabel = (client) =>
    client?.client_name ??
    client?.client_title ??
    client?.title ??
    client?.name ??
    String(getClientId(client) ?? "");

  const getSiteLabel = (site) =>
    site?.site_name ??
    site?.title ??
    site?.name ??
    String(getSiteId(site) ?? "");

  const makeBankOption = (bank) => ({
    ...bank,
    value: bank.bank_id ?? bank.id,
    label: `${bank.bank_name || ""} - ${
      bank.client_acc_no || bank.acc_no || ""
    }`,
    bank_name: bank.bank_name || "",
    client_acc_no: bank.client_acc_no || bank.acc_no || "",
    ifsc_code: bank.ifsc_code || bank.ifsc || "",
    bank_branch: bank.bank_city || bank.branch || "",
    ac_holder_name: bank.ac_holder_name || "",
  });

  // --------------------------------------------------
  // 1. Load all companies
  // API: GET /api/companies/all
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadCompanies = async () => {
      setLoadingCompanies(true);

      try {
        const result = await fetchJson(
          `${API_URL}/api/companies/all`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const rows = getArray(result);

        if (!cancelled) {
          setCompanies(
            rows.map((company) => ({
              ...company,
              value: getCompanyId(company),
              label: getCompanyLabel(company),
            }))
          );
        }
      } catch (error) {
        console.error("Companies Error:", error);

        if (!cancelled) {
          setCompanies([]);
          alert(error.message || "Companies load झाले नाहीत.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCompanies(false);
        }
      }
    };

    loadCompanies();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // 2. Load voucher types
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadTypes = async () => {
      try {
        const result = await fetchJson(
          `${API_URL}/api/vouchers/charges-type`
        );

        if (!cancelled && result.success) {
          setChargesTypeList(
            Array.isArray(result.data) ? result.data : []
          );
        }
      } catch (error) {
        console.error("Charges Type Error:", error);
      }
    };

    loadTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // 3. Load branches by company
  // API: GET /api/branches/by-company/{companyId}
  // --------------------------------------------------

  const loadBranches = async (companyId) => {
    if (!companyId) {
      setBranches([]);
      return [];
    }

    setLoadingBranches(true);

    try {
      const result = await fetchJson(
        `${API_URL}/api/branches/by-company/${encodeURIComponent(
          companyId
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const rows = getArray(result);

      const options = rows.map((branch) => ({
        ...branch,
        value: getBranchId(branch),
        label: getBranchLabel(branch),
      }));

      setBranches(options);
      return options;
    } catch (error) {
      console.error("Branches Error:", error);
      setBranches([]);
      alert(error.message || "Branches load झाले नाहीत.");
      return [];
    } finally {
      setLoadingBranches(false);
    }
  };

  // --------------------------------------------------
  // 4. Load clients for selected branch
  // Uses VITE_VOUCHER_CLIENTS_API
  // --------------------------------------------------
// --------------------------------------------------
// Load clients using getAllCompanies API
// --------------------------------------------------

const loadClients = async (companyId) => {
  if (!companyId) {
    setClients([]);
    return [];
  }

  setLoadingClients(true);

  try {
    const result = await postForm(
      `${API_URL}/api/vouchers/getAllCompanies`,
      {
        company_id: companyId,
      }
    );

    const rows = getArray(result);

    const options = rows.map((client) => ({
      ...client,
      value: getClientId(client),
      label: getClientLabel(client),
    }));

    setClients(options);
    return options;
  } catch (error) {
    console.error("Clients Error:", error);
    setClients([]);
    alert(error.message || "Failed to load clients.");
    return [];
  } finally {
    setLoadingClients(false);
  }
};


// --------------------------------------------------
// Load sites using getAllBranches API
// --------------------------------------------------

const loadSites = async (clientId) => {
  if (!clientId) {
    setSites([]);
    return [];
  }

  setLoadingSites(true);

  try {
    const result = await postForm(
      `${API_URL}/api/vouchers/getAllBranches`,
      {
        client_id: clientId,
      }
    );

    const rows = getArray(result);

    const options = rows.map((site) => ({
      ...site,
      value: getSiteId(site),
      label: getSiteLabel(site),
    }));

    setSites(options);
    return options;
  } catch (error) {
    console.error("Sites Error:", error);
    setSites([]);
    alert(error.message || "Failed to load sites.");
    return [];
  } finally {
    setLoadingSites(false);
  }
};

  // --------------------------------------------------
  // 6. Load employees by client and site
  // --------------------------------------------------

  const loadEmployees = async (clientId, siteId) => {
    if (!clientId || !siteId) {
      setEmployeeList([]);
      setSelectedEmployee(null);
      return [];
    }

    setLoadingEmployees(true);

    try {
      const result = await fetchJson(
        `${API_URL}/api/vouchers/employees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            client_id: clientId,
            site_id: siteId,
          }),
        }
      );

      const rows = getArray(result);
      setEmployeeList(rows);
      return rows;
    } catch (error) {
      console.error("Employee Error:", error);
      setEmployeeList([]);
      return [];
    } finally {
      setLoadingEmployees(false);
    }
  };

  // --------------------------------------------------
  // 7. Company change
  // --------------------------------------------------

  const handleCompanyChange = async (selected) => {
    setSelectedCompany(selected);
    setSelectedBranch(null);
    setSelectedClient(null);
    setSelectedSite(null);
    setSelectedEmployee(null);

    setBranches([]);
    setClients([]);
    setSites([]);
    setEmployeeList([]);

    const company = companies.find(
      (item) =>
        String(getCompanyId(item)) === String(selected?.value)
    );

    const companyBanks = company?.banks || [];
    setBanks(companyBanks);

    setFormData((prev) => ({
      ...prev,
      company_id: selected?.value || "",
      company_name: selected?.label || "",
      branch_id: "",
      branch_name: "",
      client_id: "",
      site_id: "",
      site_name: "",
      emp_id: "",
      emp_name: "",
      emp_code: "",
      from_bank: null,
      to_bank: null,
      from_bank_acno: "",
      from_bank_ifsc: "",
      from_bank_branch: "",
      from_bank_holder: "",
      to_bank_acno: "",
      to_bank_ifsc: "",
      to_bank_branch: "",
      to_bank_holder: "",
      client_bank: company?.client_bank || null,
      bank_name: company?.client_bank?.bank_name || "",
      bank_ac_no:
        company?.client_bank?.acc_no ||
        company?.client_bank?.bank_ac_no ||
        "",
      ifsc_code:
        company?.client_bank?.ifsc ||
        company?.client_bank?.ifsc_code ||
        "",
      bank_branch: company?.client_bank?.branch || "",
    }));

    if (selected?.value) {
      await loadBranches(selected.value);
    }
  };

  // --------------------------------------------------
  // 8. Branch change
  // --------------------------------------------------

  const handleBranchChange = async (selected) => {
    setSelectedBranch(selected);
    setSelectedClient(null);
    setSelectedSite(null);
    setSelectedEmployee(null);

    setClients([]);
    setSites([]);
    setEmployeeList([]);

    setFormData((prev) => ({
      ...prev,
      branch_id: selected?.value || "",
      branch_name: selected?.label || "",
      client_id: "",
      site_id: "",
      site_name: "",
      emp_id: "",
      emp_name: "",
      emp_code: "",
    }));

    if (selected?.value) {
      await loadClients(selected.value);
    }
  };

  // --------------------------------------------------
  // 9. Client change
  // --------------------------------------------------

  const handleClientChange = async (selected) => {
    setSelectedClient(selected);
    setSelectedSite(null);
    setSelectedEmployee(null);

    setSites([]);
    setEmployeeList([]);

    setFormData((prev) => ({
      ...prev,
      client_id: selected?.value || "",
      site_id: "",
      site_name: "",
      emp_id: "",
      emp_name: "",
      emp_code: "",
    }));

    if (selected?.value) {
      await loadSites(selected.value);
    }
  };

  // --------------------------------------------------
  // 10. Site change
  // --------------------------------------------------

  const handleSiteChange = async (selected) => {
    setSelectedSite(selected);
    setSelectedEmployee(null);

    setEmployeeList([]);

    setFormData((prev) => ({
      ...prev,
      site_id: selected?.value || "",
      site_name: selected?.label || "",
      emp_id: "",
      emp_name: "",
      emp_code: "",
    }));

    if (selected?.value && selectedClient?.value) {
      await loadEmployees(
        selectedClient.value,
        selected.value
      );
    }
  };

  // --------------------------------------------------
  // 11. Restore dropdowns and form fields in edit mode
  // --------------------------------------------------

  useEffect(() => {
    if (!editData || companies.length === 0) return;

    let cancelled = false;

    const restoreEdit = async () => {
      const companyId =
        editData.company_id ??
        editData.company?.id ??
        editData.company?.company_id;

      const company = companies.find(
        (item) =>
          String(getCompanyId(item)) === String(companyId)
      );

      if (!company || cancelled) return;

      const companyOption = {
        ...company,
        value: getCompanyId(company),
        label: getCompanyLabel(company),
      };

      setSelectedCompany(companyOption);
      setBanks(company.banks || []);

      setFormData((prev) => ({
        ...prev,
        client_id: editData.client_id || "",
        site_id: editData.site_id || "",
        company_id: getCompanyId(company),
        company_name: companyOption.label,
        branch_id: editData.branch_id || "",
        branch_name: editData.branch_name || "",
        emp_id: editData.emp_id || "",
        emp_name: editData.emp_name || "",
        emp_code: editData.emp_code || "",
        amount: editData.amount ?? "",
        mode: editData.mode || "",
        payment_date: formatDate(editData.payment_date),
        adv_date: formatDate(editData.adv_date),
        type: editData.type || "",
        voucher_no: editData.voucher_no || "",
        remark: editData.remark || "",
        payment_detail:
          editData.payment_detail ||
          editData.transaction_detail ||
          "",
        schedule_date: formatDate(editData.schedule_date),
        beneficiary_name: editData.beneficiary_name || "",
        bank_name: editData.bank_name || "",
        bank_ac_no: editData.bank_ac_no || "",
        ifsc_code: editData.ifsc_code || "",
        bank_branch: editData.bank_branch || "",
        gang_name: editData.gang_name || "",
        cheque_no: editData.cheque_no || "",
        credited_to: editData.credited_to || "",
        client_bank: company.client_bank || null,
      }));

      const companyBanks = company.banks || [];

      const mapBank = (bankId) => {
        if (
          bankId &&
          typeof bankId === "object" &&
          bankId.value !== undefined
        ) {
          return bankId;
        }

        const bank = companyBanks.find(
          (item) =>
            String(item.bank_id ?? item.id) === String(bankId)
        );

        return bank ? makeBankOption(bank) : null;
      };

      setFormData((prev) => ({
        ...prev,
        from_bank: mapBank(editData.from_bank),
        to_bank: mapBank(editData.to_bank),
        from_bank_acno: editData.from_bank_acno || "",
        from_bank_ifsc: editData.from_bank_ifsc || "",
        from_bank_branch: editData.from_bank_branch || "",
        from_bank_holder: editData.from_bank_holder || "",
        to_bank_acno: editData.to_bank_acno || "",
        to_bank_ifsc: editData.to_bank_ifsc || "",
        to_bank_branch: editData.to_bank_branch || "",
        to_bank_holder: editData.to_bank_holder || "",
      }));

      const branchOptions = await loadBranches(
        getCompanyId(company)
      );

      if (cancelled) return;

      const branch = branchOptions.find(
        (item) =>
          String(item.value) === String(editData.branch_id)
      );

      if (branch) {
        setSelectedBranch(branch);

        const clientOptions = await loadClients(branch.value);

        if (cancelled) return;

        const client = clientOptions.find(
          (item) =>
            String(item.value) === String(editData.client_id)
        );

        if (client) {
          setSelectedClient(client);

          const siteOptions = await loadSites(client.value);

          if (cancelled) return;

          const site = siteOptions.find(
            (item) =>
              String(item.value) === String(editData.site_id)
          );

          if (site) {
            setSelectedSite(site);

            const employees = await loadEmployees(
              client.value,
              site.value
            );

            if (cancelled) return;

            const employee = employees.find(
              (item) =>
                String(item.id ?? item.emp_id) ===
                String(editData.emp_id)
            );

            if (employee) {
              setSelectedEmployee({
                ...employee,
                value: employee.id ?? employee.emp_id,
                label:
                  employee.emp_full_name ||
                  employee.name ||
                  editData.emp_name ||
                  "",
                employee_code:
                  employee.employee_code ||
                  employee.emp_code ||
                  editData.emp_code ||
                  "",
              });
            } else if (editData.emp_id) {
              setSelectedEmployee({
                value: editData.emp_id,
                label: editData.emp_name || String(editData.emp_id),
                employee_code: editData.emp_code || "",
              });
            }
          }
        }
      }

      if (editData.mode) {
        setSelectedMode({
          value: editData.mode,
          label: editData.mode,
        });
      }

      if (editData.type) {
        setSelectedType({
          value: editData.type,
          label: editData.type,
        });
        setType(editData.type);
      }

      try {
        const rows =
          typeof editData.particular === "string"
            ? JSON.parse(editData.particular || "[]")
            : editData.particular;

        if (Array.isArray(rows)) {
          setParticulars([
            ...rows.map((row) => ({
              particular: row.particular || "",
              amount: row.amount ?? "",
            })),
            ...Array.from(
              { length: Math.max(0, 10 - rows.length) },
              () => ({ particular: "", amount: "" })
            ),
          ]);
        }
      } catch (error) {
        console.error("Particular Parse Error:", error);
      }
    };

    restoreEdit();

    return () => {
      cancelled = true;
    };
  }, [editData, companies]);

  // --------------------------------------------------
  // Bank dropdown options
  // --------------------------------------------------

  const bankOptions = banks.map(makeBankOption);

  // --------------------------------------------------
  // Particular change
  // --------------------------------------------------

  const handleParticularChange = (index, field, value) => {
    setParticulars((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  // --------------------------------------------------
  // Submit voucher
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!selectedCompany) {
      alert("Please Select Company");
      return;
    }

    if (!selectedBranch) {
      alert("Please Select Branch");
      return;
    }

    if (!selectedClient) {
      alert("Please Select Client");
      return;
    }

    if (!selectedSite) {
      alert("Please Select Site");
      return;
    }

    if (!selectedType) {
      alert("Please Select Type");
      return;
    }

    if (!selectedMode) {
      alert("Please Select Payment Mode");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please Enter Valid Amount");
      return;
    }

    if (!selectedEmployee) {
      alert("Please Select Employee");
      return;
    }

    if (!formData.beneficiary_name?.trim()) {
      alert("Please Enter Beneficiary Name");
      return;
    }

    if (!formData.bank_name?.trim()) {
      alert("Please Enter Bank Name");
      return;
    }

    if (!formData.bank_ac_no?.trim()) {
      alert("Please Enter Bank Account Number");
      return;
    }

    if (
      selectedMode.value !== "Cash" &&
      !formData.from_bank
    ) {
      alert("Please Select From Bank");
      return;
    }

    if (
      selectedMode.value !== "Cash" &&
      !formData.to_bank
    ) {
      alert("Please Select To Bank");
      return;
    }

    const validParticulars = particulars.filter(
      (row) =>
        row.particular?.trim() !== "" &&
        row.amount !== "" &&
        row.amount != null &&
        Number(row.amount) >= 0
    );

    if (validParticulars.length === 0) {
      alert("Please Add At Least One Particular");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const payload = {
      client_id: selectedClient?.value || "",
      site_id: selectedSite?.value || "",
      site_name: selectedSite?.label || "",

      company_id: selectedCompany?.value || "",
      company_name: selectedCompany?.label || "",

      branch_id: selectedBranch?.value || "",
      branch_name: selectedBranch?.label || "",

      emp_id: selectedEmployee?.value || "",
      emp_name: selectedEmployee?.label || "",
      emp_code:
        selectedEmployee?.employee_code ||
        selectedEmployee?.emp_code ||
        formData.emp_code ||
        editData?.emp_code ||
        "",

      from_bank: formData.from_bank?.value || "",
      from_bank_acno: formData.from_bank_acno || "",
      from_bank_ifsc: formData.from_bank_ifsc || "",
      from_bank_branch: formData.from_bank_branch || "",
      from_bank_holder: formData.from_bank_holder || "",

      to_bank: formData.to_bank?.value || "",
      to_bank_acno: formData.to_bank_acno || "",
      to_bank_ifsc: formData.to_bank_ifsc || "",
      to_bank_branch: formData.to_bank_branch || "",
      to_bank_holder: formData.to_bank_holder || "",

      payment_date: formData.payment_date || today,
      adv_date: formData.adv_date || today,
      schedule_date: formData.schedule_date || "",

      payment_detail: formData.payment_detail || "voucher",
      amount: Number(formData.amount) || 0,

      bank_name: formData.bank_name || "",
      bank_ac_no: formData.bank_ac_no || "",
      client_bank:
        formData.client_bank?.value ??
        formData.client_bank?.id ??
        formData.client_bank?.bank_id ??
        "",

      client_name: selectedClient?.label || "",
      client_code:
        selectedClient?.client_code ||
        selectedCompany?.client_code ||
        "",

      ifsc_code: formData.ifsc_code || "",
      beneficiary_name: formData.beneficiary_name || "",
      bank_branch:
        formData.from_bank_branch ||
        formData.bank_branch ||
        "",
      ac_holder_name: formData.from_bank_holder || "",

      actual_voucher_amt: formData.actual_voucher_amt || 0,
      paid_amt: formData.paid_amt || 0,
      commission_paid: formData.commission_paid || 0,
      vendor_comm: formData.vendor_comm || 0,
      vendor_id: formData.vendor_id || "",
      vendor_name: formData.vendor_name || "",

      remark: formData.remark || "",
      source: formData.source || "Website",
      type: selectedType?.value || type || "",
      mode: selectedMode?.value || "",
      cheque_no: formData.cheque_no || "",
      credited_to: formData.credited_to || "",
      gang_name: formData.gang_name || "",
      status: formData.status ?? 0,
      proof_images: formData.proof_images || "",

      particular: JSON.stringify(validParticulars),

      created_by: user?.id || "",
      created_by_name: user?.name || "",
      modified_by: user?.id || "",
      modified_by_name: user?.name || "",
      created_on: today,
      modified_on: today,
    };

    setSaving(true);

    try {
      const isEdit = Boolean(editData);

      const url = isEdit
        ? `${API_URL}/api/vouchers/update-voucher/${editData.id}`
        : `${API_URL}/api/vouchers/create`;

      const result = await fetchJson(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (result.success) {
        alert(
          isEdit
            ? "Voucher Updated Successfully"
            : "Voucher Created Successfully"
        );

        if (typeof onBack === "function") {
          onBack(true);
        }
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Voucher Submit Error:", error);
      alert(error.message || "Voucher save झाला नाही.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="container-fluid bg-light min-vh-100 p-0">
      <div className="bg-white border-bottom d-flex justify-content-between align-items-center px-4 py-2">
        <h5 className="mb-0 text-secondary fw-semibold">
          {editData ? "Edit Voucher" : "Add Voucher"}
        </h5>

        <button
          type="button"
          className="btn btn-info text-white"
          onClick={() => onBack?.()}
        >
          Back
        </button>
      </div>

      <div className="p-2 mx-auto">
        <div className="bg-white border rounded shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            {/* Company -> Branch -> Client -> Site */}

            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Company *
                </label>

                <Select
                  styles={selectStyles}
                  options={companies}
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  placeholder={
                    loadingCompanies
                      ? "Loading Companies..."
                      : "Select Company"
                  }
                  isLoading={loadingCompanies}
                  isDisabled={loadingCompanies}
                  isSearchable
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Branch *
                </label>

                <Select
                  styles={selectStyles}
                  options={branches}
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  placeholder={
                    loadingBranches
                      ? "Loading Branches..."
                      : "Select Branch"
                  }
                  isDisabled={!selectedCompany || loadingBranches}
                  isLoading={loadingBranches}
                  isSearchable
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Client *
                </label>

                <Select
                  styles={selectStyles}
                  options={clients}
                  value={selectedClient}
                  onChange={handleClientChange}
                  placeholder={
                    loadingClients
                      ? "Loading Clients..."
                      : "Select Client"
                  }
                  isDisabled={!selectedBranch || loadingClients}
                  isLoading={loadingClients}
                  isSearchable
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Site *
                </label>

                <Select
                  styles={selectStyles}
                  options={sites}
                  value={selectedSite}
                  onChange={handleSiteChange}
                  placeholder={
                    loadingSites
                      ? "Loading Sites..."
                      : "Select Site"
                  }
                  isDisabled={!selectedClient || loadingSites}
                  isLoading={loadingSites}
                  isSearchable
                />
              </div>
            </div>

            {/* Type, Date, Mode, Amount */}

            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Type *
                </label>

                <Select
                  styles={selectStyles}
                  options={chargesTypeList.map((item) => ({
                    value: item.charges_master,
                    label: item.charges_master,
                  }))}
                  value={selectedType}
                  onChange={(selected) => {
                    setSelectedType(selected);
                    setType(selected?.value || "");

                    setFormData((prev) => ({
                      ...prev,
                      type: selected?.value || "",
                    }));
                  }}
                  placeholder="Select Type"
                  isSearchable
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Date
                </label>

                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={formData.adv_date || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      adv_date: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Select Mode *
                </label>

                <Select
                  styles={selectStyles}
                  options={modeOptions}
                  value={selectedMode}
                  onChange={(selected) => {
                    setSelectedMode(selected);

                    setFormData((prev) => ({
                      ...prev,
                      mode: selected?.value || "",
                    }));
                  }}
                  placeholder="Select Mode"
                  isSearchable
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">
                  Amount *
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm"
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Edit-only fields */}

            {editData && (
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Transaction Detail
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.payment_detail || ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_detail: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Schedule Date
                  </label>

                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={formData.schedule_date || ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        schedule_date: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Bank selection */}

            {selectedMode && (
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    From Bank
                  </label>

                  <Select
                    styles={selectStyles}
                    options={bankOptions}
                    value={formData.from_bank}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        from_bank: selected,
                        from_bank_acno:
                          selected?.client_acc_no || "",
                        from_bank_ifsc:
                          selected?.ifsc_code || "",
                        from_bank_branch:
                          selected?.bank_branch || "",
                        from_bank_holder:
                          selected?.ac_holder_name || "",
                      }))
                    }
                    placeholder="Select From Bank"
                    isSearchable
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    To Bank
                  </label>

                  <Select
                    styles={selectStyles}
                    options={bankOptions}
                    value={formData.to_bank}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        to_bank: selected,
                        to_bank_acno:
                          selected?.client_acc_no || "",
                        to_bank_ifsc:
                          selected?.ifsc_code || "",
                        to_bank_branch:
                          selected?.bank_branch || "",
                        to_bank_holder:
                          selected?.ac_holder_name || "",
                      }))
                    }
                    placeholder="Select To Bank"
                    isSearchable
                  />
                </div>
              </div>
            )}

            {/* Employee and beneficiary */}

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-secondary">
                  Select Employee *
                </label>

                <Select
                  styles={selectStyles}
                  options={employeeList.map((employee) => ({
                    ...employee,
                    value: employee.id ?? employee.emp_id,
                    label:
                      employee.emp_full_name ||
                      employee.name ||
                      String(employee.id ?? employee.emp_id ?? ""),
                    employee_code:
                      employee.employee_code ||
                      employee.emp_code ||
                      "",
                  }))}
                  value={selectedEmployee}
                  onChange={(selected) => {
                    setSelectedEmployee(selected);

                    setFormData((prev) => ({
                      ...prev,
                      emp_id: selected?.value || "",
                      emp_name: selected?.label || "",
                      emp_code: selected?.employee_code || "",
                    }));
                  }}
                  placeholder={
                    loadingEmployees
                      ? "Loading Employees..."
                      : selectedSite
                        ? "Select Employee"
                        : "Select Client and Site first"
                  }
                  isDisabled={!selectedSite || loadingEmployees}
                  isLoading={loadingEmployees}
                  isSearchable
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-secondary">
                  Beneficiary Name *
                </label>

                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.beneficiary_name || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      beneficiary_name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-secondary">
                  Bank Name *
                </label>

                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.bank_name || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      bank_name: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Account number and IFSC */}

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-secondary">
                  Bank Account Number *
                </label>

                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.bank_ac_no || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      bank_ac_no: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-secondary">
                  IFSC Code
                </label>

                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.ifsc_code || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      ifsc_code: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Client bank */}

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">
                Client Bank
              </label>

              <div className="small">
                {formData.client_bank?.bank_name || "No Bank Found"}
              </div>
            </div>

            {/* Remark */}

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">
                Remark
              </label>

              <textarea
                className="form-control form-control-sm"
                rows="2"
                value={formData.remark || ""}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    remark: event.target.value,
                  }))
                }
              />
            </div>

            {/* Particulars */}

            <div className="row g-2 mb-1">
              <div className="col-6">
                <label className="form-label small fw-bold text-secondary">
                  Particular
                </label>
              </div>

              <div className="col-6">
                <label className="form-label small fw-bold text-secondary">
                  Amount
                </label>
              </div>
            </div>

            {particulars.map((row, index) => (
              <div className="row g-2 mb-2" key={index}>
                <div className="col-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={row.particular}
                    onChange={(event) =>
                      handleParticularChange(
                        index,
                        "particular",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="col-6">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-control form-control-sm"
                    value={row.amount}
                    onChange={(event) =>
                      handleParticularChange(
                        index,
                        "amount",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}

            {/* Submit */}

            <div className="d-flex justify-content-center mt-4 gap-2">
              <button
                type="button"
                className="btn btn-sm btn-secondary px-4 py-2"
                onClick={() => onBack?.()}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-sm px-4 py-2 text-white fw-semibold"
                style={{ backgroundColor: "#1d3557" }}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editData
                    ? "Update Voucher"
                    : "Add Voucher"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVoucherForm;