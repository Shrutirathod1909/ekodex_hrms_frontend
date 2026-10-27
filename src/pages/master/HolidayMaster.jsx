import React, { useEffect, useMemo, useRef, useState } from "react";

import api from "../../api/axios";
import LoadingScreen from "../../components/loader/LoadingScreen";

import {
  FaPlus,
  FaPen,
  FaTrashAlt,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";

import SearchPanel from "../../utils/FilterPanel";

import {
  Alert,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Pagination,
  Row,
  Table,
} from "react-bootstrap";

import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const HolidayMaster = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [holidays, setHolidays] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [sitesByClient, setSitesByClient] = useState({});

  // One company can have multiple clients.
  // Each client row can have multiple sites.
  const [clientSiteRows, setClientSiteRows] = useState([
    { rowId: Date.now(), client_id: null, site_ids: [] },
  ]);
  const [clientsByCompany, setClientsByCompany] = useState({});

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState(null);

  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [isEditing, setIsEditing] = useState(null);

  // 0 = Active
  // 1 = Inactive
  const [activeStatus, setActiveStatus] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const datePickerRef = useRef(null);

  // ============================================================
  // FORM DATA
  // ============================================================

  const initialFormData = {
    financial_year: "",
    holiday_date: "",
    holiday_name: "",
    company_id: null,
    client_id: null,
    site_ids: [],
    description: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [validationErrors, setValidationErrors] = useState({});

  // ============================================================
  // SEARCH
  // ============================================================

  const [searchFields, setSearchFields] = useState([
    {
      field: "holidayName",
      keyword: "",
    },
  ]);

  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ============================================================
  // UNAUTHORIZED
  // ============================================================

  const handleUnauthorized = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return true;
    }

    return false;
  };

  // ============================================================
  // DATE HELPERS
  // ============================================================

  // DD-MM-YYYY -> YYYY-MM-DD
  const convertToISODate = (date) => {
    if (!date) return "";

    const value = String(date).trim();

    // Already ISO date / datetime
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.substring(0, 10);
    }

    // DD-MM-YYYY
    if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      return "";
    }

    const [day, month, year] = value.split("-");

    return `${year}-${month}-${day}`;
  };

  // YYYY-MM-DD / ISO datetime -> DD-MM-YYYY
  const convertToDisplayDate = (date) => {
    if (!date) return "";

    const value = String(date).trim();

    // Already DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      return value;
    }

    // Handles:
    // 2026-09-14
    // 2026-09-14T00:00:00.000Z
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const [, year, month, day] = match;

      return `${day}-${month}-${year}`;
    }

    return "";
  };

  // ============================================================
  // DATE VALIDATION
  // ============================================================

  const isValidDateFormat = (date) => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      return false;
    }

    const [day, month, year] = date.split("-").map(Number);

    const parsedDate = new Date(year, month - 1, day);

    return (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    );
  };

  // ============================================================
  // FINANCIAL YEAR OPTIONS
  // ============================================================

  const financialYearOptions = useMemo(() => {
    const options = [];

    for (let year = 2000; year <= 2035; year++) {
      const nextShortYear = String(year + 1).slice(-2);

      options.push({
        value: `${year}-${nextShortYear}`,
        label: `${year}-${nextShortYear}`,
      });
    }

    return options;
  }, []);

  // ============================================================
  // COMPANY OPTIONS
  // ============================================================

  const companyOptions = useMemo(() => {
    return companies.map((company) => ({
      value: company.id,
      label: company.company_name,
    }));
  }, [companies]);

  // ============================================================
  // FETCH COMPANIES
  // ============================================================

  const fetchCompanies = async () => {
    try {
      const response = await api.get(
        `${API_URL}/api/holiday-master/companies`,
        getAuthHeaders(),
      );

      setCompanies(response.data?.data || response.data || []);
    } catch (err) {
      console.error("FETCH COMPANIES ERROR:", err);

      if (handleUnauthorized(err)) return;

      setError(err.response?.data?.message || "Failed to fetch companies.");
    }
  };

  // ============================================================
  // FETCH CLIENTS BY COMPANY
  // ============================================================

  const fetchClients = async (companyId) => {
    if (!companyId) return [];

    if (clientsByCompany[companyId]) {
      return clientsByCompany[companyId];
    }

    try {
      const response = await api.get(
        `${API_URL}/api/holiday-master/clients/${companyId}`,
        getAuthHeaders(),
      );

      const data = response.data?.data || response.data || [];
      const clientList = Array.isArray(data) ? data : [];

      setClientsByCompany((prev) => ({
        ...prev,
        [companyId]: clientList,
      }));

      setClients(clientList);
      return clientList;
    } catch (err) {
      console.error("FETCH CLIENTS ERROR:", err);
      if (handleUnauthorized(err)) return [];
      toast.error(err.response?.data?.message || "Failed to fetch clients.");
      return [];
    }
  };

  // ============================================================
  // FETCH SITES BY CLIENT
  // ============================================================

  const fetchSites = async (clientId) => {
    if (!clientId) return [];

    if (sitesByClient[clientId]) {
      return sitesByClient[clientId];
    }

    try {
      const response = await api.get(
        `${API_URL}/api/holiday-master/sites/${clientId}`,
        getAuthHeaders(),
      );

      const data = response.data?.data || response.data || [];
      const siteList = Array.isArray(data) ? data : [];

      setSitesByClient((prev) => ({
        ...prev,
        [clientId]: siteList,
      }));

      return siteList;
    } catch (err) {
      console.error("FETCH SITES ERROR:", err);
      if (handleUnauthorized(err)) return [];
      toast.error(err.response?.data?.message || "Failed to fetch sites.");
      return [];
    }
  };

  // ============================================================
  // FETCH HOLIDAYS
  // ============================================================

  const fetchHolidays = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `${API_URL}/api/holiday-master/holidays`,
        getAuthHeaders(),
      );

      const data = response.data?.data || response.data || [];

      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH HOLIDAYS ERROR:", err);

      if (handleUnauthorized(err)) return;

      setError(err.response?.data?.message || "Failed to fetch holidays.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCompanies();
    fetchHolidays();
  }, []);

  // ============================================================
  // RESET PAGE
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [holidays]);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setFormData(initialFormData);
    setClients([]);
    setSitesByClient({});
    setClientSiteRows([
      { rowId: Date.now(), client_id: null, site_ids: [] },
    ]);
    setValidationErrors({});
    setIsEditing(null);
  };

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = () => {
    resetForm();
    setShowSearch(false);
    setShowForm(true);
  };

  // ============================================================
  // CANCEL FORM
  // ============================================================

  const handleCancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  // ============================================================
  // COMPANY CHANGE
  // ============================================================

  const handleCompanyChange = async (selectedOption) => {
    const companyId = selectedOption?.value ? Number(selectedOption.value) : null;

    setFormData((prev) => ({
      ...prev,
      company_id: companyId,
      client_id: null,
      site_ids: [],
    }));

    setClients([]);
    setClientSiteRows([
      { rowId: Date.now(), client_id: null, site_ids: [] },
    ]);

    setValidationErrors((prev) => ({
      ...prev,
      company_id: "",
      client_id: "",
      site_ids: "",
      clientSiteRows: "",
    }));

    if (companyId) {
      await fetchClients(companyId);
    }
  };

  // ============================================================
  // CLIENT CHANGE
  // ============================================================

  const handleClientChange = async (rowId, selectedOption) => {
    const clientId = selectedOption?.value ? Number(selectedOption.value) : null;

    setClientSiteRows((prev) =>
      prev.map((row) =>
        row.rowId === rowId
          ? { ...row, client_id: clientId, site_ids: [] }
          : row,
      ),
    );

    setValidationErrors((prev) => ({
      ...prev,
      clientSiteRows: "",
    }));

    if (clientId) {
      await fetchSites(clientId);
    }
  };

  // ============================================================
  // SITE CHANGE
  // ============================================================

  const handleSiteChange = (rowId, selectedOptions) => {
    const siteIds = (selectedOptions || []).map((option) => Number(option.value));

    setClientSiteRows((prev) =>
      prev.map((row) =>
        row.rowId === rowId ? { ...row, site_ids: siteIds } : row,
      ),
    );

    setValidationErrors((prev) => ({
      ...prev,
      clientSiteRows: "",
    }));
  };

  // ============================================================
  // SELECT ALL SITES
  // ============================================================

  const handleSelectAllSites = (rowId, checked) => {
    setClientSiteRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;

        const rowSites = row.client_id
          ? sitesByClient[row.client_id] || []
          : [];

        return {
          ...row,
          site_ids: checked
            ? rowSites.map((site) => Number(site.site_id ?? site.id))
            : [],
        };
      }),
    );

    setValidationErrors((prev) => ({
      ...prev,
      clientSiteRows: "",
    }));
  };

  // ============================================================
  // ADD / REMOVE CLIENT ROW
  // ============================================================

  const addClientRow = () => {
    setClientSiteRows((prev) => [
      ...prev,
      {
        rowId: Date.now() + Math.random(),
        client_id: null,
        site_ids: [],
      },
    ]);
  };

  const removeClientRow = (rowId) => {
    setClientSiteRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((row) => row.rowId !== rowId);
    });

    setValidationErrors((prev) => ({
      ...prev,
      clientSiteRows: "",
    }));
  };

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ============================================================
  // DATE INPUT
  // ============================================================

  const handleHolidayDateChange = (e) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "");

    if (value.length > 2 && value.length <= 4) {
      value = value.substring(0, 2) + "-" + value.substring(2);
    }

    if (value.length > 4) {
      value =
        value.substring(0, 2) +
        "-" +
        value.substring(2, 4) +
        "-" +
        value.substring(4, 8);
    }

    setFormData((prev) => ({
      ...prev,
      holiday_date: value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      holiday_date: "",
    }));
  };

  // ============================================================
  // OPEN CALENDAR
  // ============================================================

  const openCalendar = () => {
    if (datePickerRef.current?.showPicker) {
      datePickerRef.current.showPicker();
    } else {
      datePickerRef.current?.click();
    }
  };

  // ============================================================
  // NATIVE CALENDAR CHANGE
  // ============================================================

  const handleNativeDateChange = (e) => {
    const isoDate = e.target.value;

    if (!isoDate) return;

    setFormData((prev) => ({
      ...prev,
      holiday_date: convertToDisplayDate(isoDate),
    }));

    setValidationErrors((prev) => ({
      ...prev,
      holiday_date: "",
    }));
  };

  // ============================================================
  // FY DATE VALIDATION
  // ============================================================

  const isDateInsideFinancialYear = (financialYear, holidayDate) => {
    if (!financialYear || !holidayDate) {
      return false;
    }

    const isoDate = convertToISODate(holidayDate);

    if (!isoDate) return false;

    const [fromYear] = financialYear.split("-");

    const startYear = Number(fromYear);

    const startDate = new Date(`${startYear}-04-01T00:00:00`);

    const endDate = new Date(`${startYear + 1}-03-31T23:59:59`);

    const selectedDate = new Date(`${isoDate}T00:00:00`);

    return selectedDate >= startDate && selectedDate <= endDate;
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    const errors = {};

    if (!formData.financial_year) {
      errors.financial_year = "Financial Year is required.";
    }

    if (!formData.holiday_date) {
      errors.holiday_date = "Holiday Date is required.";
    } else if (!isValidDateFormat(formData.holiday_date)) {
      errors.holiday_date = "Date must be in DD-MM-YYYY format.";
    } else if (
      formData.financial_year &&
      !isDateInsideFinancialYear(formData.financial_year, formData.holiday_date)
    ) {
      errors.holiday_date =
        "Holiday date must be inside selected financial year.";
    }

    if (!formData.holiday_name?.trim()) {
      errors.holiday_name = "Holiday Name is required.";
    }

    if (!formData.company_id) {
      errors.company_id = "Company is required.";
    }

    if (!clientSiteRows.length) {
      errors.clientSiteRows = "At least one client is required.";
    } else {
      const incompleteRow = clientSiteRows.some(
        (row) => !row.client_id || !row.site_ids?.length,
      );

      if (incompleteRow) {
        errors.clientSiteRows =
          "Please select a client and at least one site in every row.";
      }

      const duplicateRows = new Set();

      for (const row of clientSiteRows) {
        if (!row.client_id || !row.site_ids?.length) continue;

        for (const siteId of row.site_ids) {
          const key = `${row.client_id}-${siteId}`;

          if (duplicateRows.has(key)) {
            errors.clientSiteRows =
              "The same client and site cannot be selected more than once.";
            break;
          }

          duplicateRows.add(key);
        }
      }
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // CURRENT USER
  // ============================================================

  const getCurrentUser = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      localStorage.getItem("id");

    const userName =
      localStorage.getItem("userName") ||
      localStorage.getItem("user_name") ||
      localStorage.getItem("name") ||
      "";

    return {
      id: userId ? Number(userId) : null,
      name: userName,
    };
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormLoading(true);

    try {
      if (isEditing) {
        const row = clientSiteRows[0];

        const payload = {
          financial_year: formData.financial_year,
          holiday_date: formData.holiday_date,
          holiday_name: formData.holiday_name.trim(),
          company_id: Number(formData.company_id),
          client_id: Number(row.client_id),
          site_id: Number(row.site_ids[0]),
          description: formData.description?.trim() || null,
          active: Number(isEditing.active),
        };

        await api.put(
          `${API_URL}/api/holiday-master/holidays/${isEditing.id}`,
          payload,
          getAuthHeaders(),
        );

        toast.success("Holiday updated successfully.");
      } else {
        // Backend accepts one client + multiple sites per request.
        // Therefore send one request for each selected client row.
        for (const row of clientSiteRows) {
          const payload = {
            financial_year: formData.financial_year,
            holiday_date: formData.holiday_date,
            holiday_name: formData.holiday_name.trim(),
            company_id: Number(formData.company_id),
            client_id: Number(row.client_id),
            site_ids: row.site_ids.map(Number),
            description: formData.description?.trim() || null,
          };

          await api.post(
            `${API_URL}/api/holiday-master/holidays`,
            payload,
            getAuthHeaders(),
          );
        }

        toast.success("Holiday created successfully for selected clients and sites.");
      }

      resetForm();
      setShowForm(false);
      setCurrentPage(1);
      await fetchHolidays();
    } catch (err) {
      console.error("HOLIDAY SAVE ERROR:", err);

      if (handleUnauthorized(err)) return;

      if (err.response?.status === 409) {
        toast.error(
          err.response?.data?.message ||
            "This holiday already exists for the selected site.",
        );
      } else {
        toast.error(err.response?.data?.message || "Failed to save holiday.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = async (holiday) => {
    setValidationErrors({});
    setIsEditing(holiday);

    const companyId = holiday.company_id ? Number(holiday.company_id) : null;
    const clientId = holiday.client_id ? Number(holiday.client_id) : null;
    const siteId = holiday.site_id ? Number(holiday.site_id) : null;

    setFormData({
      financial_year: holiday.financial_year || "",
      holiday_date: convertToDisplayDate(holiday.holiday_date),
      holiday_name: holiday.holiday_name || "",
      company_id: companyId,
      client_id: clientId,
      site_ids: siteId ? [siteId] : [],
      description: holiday.description || "",
    });

    setClientSiteRows([
      {
        rowId: Date.now(),
        client_id: clientId,
        site_ids: siteId ? [siteId] : [],
      },
    ]);

    setShowSearch(false);
    setShowForm(true);

    if (companyId) {
      const clientList = await fetchClients(companyId);
      if (clientId) {
        setClients(clientList);
        const siteList = await fetchSites(clientId);
        }
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this holiday?",
    );

    if (!confirmed) return;

    try {
      const currentUser = getCurrentUser();

      await api.delete(`${API_URL}/api/holiday-master/holidays/${id}`, {
        ...getAuthHeaders(),

        data: {
          modified_by: currentUser.id,

          modified_by_name: currentUser.name,
        },
      });

      toast.success("Holiday deleted successfully.");

      // Refresh immediately
      await fetchHolidays();

      setCurrentPage(1);
    } catch (err) {
      console.error("DELETE HOLIDAY ERROR:", err);

      if (handleUnauthorized(err)) return;

      toast.error(err.response?.data?.message || "Failed to delete holiday.");
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchFields([
      {
        field: "holidayName",
        keyword: "",
      },
    ]);

    setDateFilter({
      from: "",
      to: "",
    });

    setCurrentPage(1);
  };

  // ============================================================
  // SEARCH OPTIONS
  // ============================================================

  const searchOptions = [
    {
      value: "holidayName",
      label: "Holiday Name",
    },
    {
      value: "clientName",
      label: "Client",
    },
    {
      value: "siteName",
      label: "Site",
    },
    {
      value: "companyName",
      label: "Company",
    },
    {
      value: "financialYear",
      label: "Financial Year",
    },
  ];

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const searchedHolidays = useMemo(() => {
    let result = [...holidays];

    const validSearch = searchFields.filter(
      (field) => field.field && field.keyword?.trim(),
    );

    if (validSearch.length > 0) {
      result = result.filter((holiday) => {
        return validSearch.every((search) => {
          const keyword = search.keyword.trim().toLowerCase();

          let value = "";

          switch (search.field) {
            case "holidayName":
              value = holiday.holiday_name || "";
              break;

            case "clientName":
              value = holiday.client_name || "";
              break;

            case "siteName":
              value = holiday.site_name || "";
              break;

            case "companyName":
              value = holiday.company_name || "";
              break;

            case "financialYear":
              value = holiday.financial_year || "";
              break;

            default:
              value = "";
          }

          return String(value).toLowerCase().includes(keyword);
        });
      });
    }

    // Date range search
    if (dateFilter.from && dateFilter.to) {
      result = result.filter((holiday) => {
        const holidayISO = convertToISODate(holiday.holiday_date);

        if (!holidayISO) return false;

        return holidayISO >= dateFilter.from && holidayISO <= dateFilter.to;
      });
    }

    return result;
  }, [holidays, searchFields, dateFilter]);

  // ============================================================
  // ACTIVE / INACTIVE
  // ============================================================

  const isItemActive = (value) => {
    if (value === undefined || value === null) {
      return true;
    }

    const stringValue = String(value).trim();

    return stringValue === "0" || stringValue === "";
  };

  const activeCount = holidays.filter((holiday) =>
    isItemActive(holiday.active),
  ).length;

  const inactiveCount = holidays.filter(
    (holiday) => !isItemActive(holiday.active),
  ).length;

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const filteredHolidays = searchedHolidays.filter((holiday) => {
    if (activeStatus === 0) {
      return isItemActive(holiday.active);
    }

    return !isItemActive(holiday.active);
  });

  // ============================================================
  // PAGINATION
  // ============================================================

  const indexOfLastItem = currentPage * itemsPerPage;

  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentHolidays = filteredHolidays.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHolidays.length / itemsPerPage),
  );

  // ============================================================
  // KEEP PAGE VALID
  // ============================================================

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (loading && !showForm) {
    return <LoadingScreen />;
  }

  // ============================================================
  // JSX
  // ============================================================

  return (
    <div
      className="page-container"
      style={{
        fontSize: "13px",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      {/* ======================================================
          HEADER
      ====================================================== */}

      {!showForm && (
        <div className="page-header mb-3">
          <h3 className="page-title m-0">
            Holiday Master{" "}
            <span className="text-success">
              ({activeStatus === 0 ? activeCount : inactiveCount})
            </span>
          </h3>

          <div className="page-actions">
            {/* SEARCH
                Icon removed intentionally
            */}

            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? "Hide Search" : "Search"}
            </button>

            {/* CREATE */}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreate}
            >
              <FaPlus /> Create New
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          SEARCH PANEL
      ====================================================== */}

      {!showForm && showSearch && (
        <SearchPanel
          searchFields={searchFields}
          setSearchFields={setSearchFields}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onSearch={handleSearch}
          onReset={handleReset}
          searchOptions={searchOptions}
          showDownload={false}
        />
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      {showForm && (
        <Card className="shadow-sm border-0">
          <h2 className="page-title mb-3 p-3">
            {isEditing
              ? `Edit Holiday - ${isEditing.holiday_name || ""}`
              : "Create New Holiday"}
          </h2>

          <Card.Body>
            <Form onSubmit={handleSubmit} className="master-form">
              <Row className="g-4">
                {/* FINANCIAL YEAR */}

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Financial Year *</Form.Label>

                    <Select
                      options={financialYearOptions}
                      value={
                        financialYearOptions.find(
                          (option) => option.value === formData.financial_year,
                        ) || null
                      }
                      onChange={(option) => {
                        setFormData((prev) => ({
                          ...prev,
                          financial_year: option?.value || "",
                        }));

                        setValidationErrors((prev) => ({
                          ...prev,
                          financial_year: "",
                        }));
                      }}
                      placeholder="Select Financial Year"
                      isClearable
                    />

                    {validationErrors.financial_year && (
                      <div className="text-danger mt-1">
                        {validationErrors.financial_year}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* HOLIDAY DATE */}

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Holiday Date *</Form.Label>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <Form.Control
                        type="text"
                        value={formData.holiday_date}
                        onChange={handleHolidayDateChange}
                        placeholder="DD-MM-YYYY"
                        maxLength={10}
                        style={{
                          paddingRight: "40px",
                        }}
                      />

                      <button
                        type="button"
                        onClick={openCalendar}
                        style={{
                          position: "absolute",
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#555",
                        }}
                        title="Select Date"
                      >
                        <FaCalendarAlt />
                      </button>

                      <input
                        ref={datePickerRef}
                        type="date"
                        value={convertToISODate(formData.holiday_date)}
                        onChange={handleNativeDateChange}
                        style={{
                          position: "absolute",
                          width: "1px",
                          height: "1px",
                          opacity: 0,
                          pointerEvents: "none",
                        }}
                      />
                    </div>

                    <small className="text-muted">Format: DD-MM-YYYY</small>

                    {validationErrors.holiday_date && (
                      <div className="text-danger mt-1">
                        {validationErrors.holiday_date}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* HOLIDAY NAME */}

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Holiday Name *</Form.Label>

                    <Form.Control
                      type="text"
                      name="holiday_name"
                      value={formData.holiday_name}
                      onChange={handleInputChange}
                      placeholder="Enter Holiday Name"
                    />

                    {validationErrors.holiday_name && (
                      <div className="text-danger mt-1">
                        {validationErrors.holiday_name}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* COMPANY */}

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Company *</Form.Label>
                    <Select
                      options={companyOptions}
                      value={
                        companyOptions.find(
                          (option) => Number(option.value) === Number(formData.company_id),
                        ) || null
                      }
                      onChange={handleCompanyChange}
                      placeholder="Select Company"
                      isClearable
                      isDisabled={!!isEditing}
                    />
                    {validationErrors.company_id && (
                      <div className="text-danger mt-1">
                        {validationErrors.company_id}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* CLIENT + SITE */}

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Client & Site *</Form.Label>

                    <div
                      style={{
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        padding: "12px",
                        background: "#fff",
                      }}
                    >
                      <div className="row g-2 align-items-start">
                        <div className="col-md-4">
                          <small className="text-muted d-block mb-1" style={{ fontSize: "11px" }}>
                            Client
                          </small>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted d-block mb-1" style={{ fontSize: "11px" }}>
                            Site
                          </small>
                        </div>
                        <div className="col-md-2 text-center">
                          <small className="text-muted d-block mb-1" style={{ fontSize: "11px" }}>
                            Action
                          </small>
                        </div>
                      </div>

                      {clientSiteRows.map((row, index) => {
                        const rowSites = row.client_id
                          ? sitesByClient[row.client_id] || []
                          : [];

                        const clientOptions = clients.map((client) => ({
                          value: client.client_id ?? client.id,
                          label: client.client_name ?? client.company_name,
                        }));

                        const siteOptions = rowSites.map((site) => ({
                          value: site.site_id ?? site.id,
                          label: site.site_name,
                        }));

                        const selectedClient =
                          clientOptions.find(
                            (option) => Number(option.value) === Number(row.client_id),
                          ) || null;

                        const selectedSites = siteOptions.filter((option) =>
                          (row.site_ids || []).some(
                            (siteId) => Number(siteId) === Number(option.value),
                          ),
                        );

                        const allSitesSelected =
                          siteOptions.length > 0 &&
                          selectedSites.length === siteOptions.length;

                        return (
                          <div
                            key={row.rowId}
                            className="row g-2 align-items-start mb-2"
                          >
                            <div className="col-md-4">
                              <Select
                                options={clientOptions}
                                value={selectedClient}
                                onChange={(option) =>
                                  handleClientChange(row.rowId, option)
                                }
                                placeholder={
                                  formData.company_id
                                    ? "Select Client"
                                    : "Select Company First"
                                }
                                isClearable
                                isDisabled={!formData.company_id || !!isEditing}
                              />
                            </div>

                            <div className="col-md-6">
                              {row.client_id && siteOptions.length > 0 && (
                                <div
                                  className="mb-1"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "7px",
                                    fontSize: "11px",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={allSitesSelected}
                                    onChange={(e) =>
                                      handleSelectAllSites(row.rowId, e.target.checked)
                                    }
                                    disabled={!!isEditing}
                                  />
                                  <span>Select All Sites</span>
                                </div>
                              )}

                              <Select
                                isMulti
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                options={siteOptions}
                                value={selectedSites}
                                onChange={(options) =>
                                  handleSiteChange(row.rowId, options)
                                }
                                placeholder={
                                  row.client_id
                                    ? "Select Sites"
                                    : "Select Client First"
                                }
                                isClearable
                                isDisabled={!row.client_id}
                                components={{
                                  Option: ({
                                    children,
                                    isSelected,
                                    innerRef,
                                    innerProps,
                                  }) => (
                                    <div
                                      ref={innerRef}
                                      {...innerProps}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "8px 10px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                        style={{ cursor: "pointer" }}
                                      />
                                      <span>{children}</span>
                                    </div>
                                  ),
                                }}
                              />
                            </div>

                            <div className="col-md-2 d-flex justify-content-center align-items-center">
                              {!isEditing &&
                                (index === 0 ? (
                                  <button
                                    type="button"
                                    onClick={addClientRow}
                                    title="Add Client"
                                    disabled={formLoading || !formData.company_id}
                                    aria-label="Add Client"
                                    style={{
                                      width: "34px",
                                      height: "34px",
                                      padding: 0,
                                      border: "1px solid #28a745",
                                      borderRadius: "4px",
                                      background: "#fff",
                                      color: "#28a745",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "15px",
                                      cursor: formLoading ? "not-allowed" : "pointer",
                                      opacity: formLoading ? 0.6 : 1,
                                    }}
                                  >
                                    <FaPlus />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => removeClientRow(row.rowId)}
                                    title="Remove client"
                                    disabled={formLoading}
                                    aria-label="Remove client"
                                    style={{
                                      width: "34px",
                                      height: "34px",
                                      padding: 0,
                                      border: "1px solid #dc3545",
                                      borderRadius: "4px",
                                      background: "#fff",
                                      color: "#dc3545",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "18px",
                                      fontWeight: 600,
                                      cursor: formLoading ? "not-allowed" : "pointer",
                                      opacity: formLoading ? 0.6 : 1,
                                    }}
                                  >
                                    <span style={{ lineHeight: 1 }}>−</span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <small className="text-muted">
                      Select multiple clients using +. For each client, select sites one-by-one or use Select All Sites.
                    </small>

                    {validationErrors.clientSiteRows && (
                      <div className="text-danger mt-1">
                        {validationErrors.clientSiteRows}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* DESCRIPTION */}

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* FORM BUTTONS */}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelForm}
                  disabled={formLoading}
                >
                  <FaTimes className="me-1" />
                  Cancel
                </Button>

                <Button type="submit" variant="primary" disabled={formLoading}>
                  {formLoading
                    ? "Saving..."
                    : isEditing
                      ? "Update Holiday"
                      : "Create Holiday"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* ======================================================
          LIST
      ====================================================== */}

      {!showForm && (
        <Card>
          {/* ACTIVE / INACTIVE */}

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
              {
                label: "Active",
                value: 0,
              },
              {
                label: "Inactive",
                value: 1,
              },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveStatus(tab.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "3px 16px",
                  borderRadius: "20px",
                  border: "1.5px solid",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
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

          {/* ERROR */}

          {error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
            <Table
              bordered
              hover
              responsive
              className="list-table"
              style={{
                fontSize: "11px",
              }}
            >
              {/* TABLE HEADER */}

              <thead className="table-secondary">
                <tr>
                  <th>SR</th>
                  <th>Date</th>
                  <th>Holiday Name</th>
                  <th>Client</th>
                  <th>Site</th>
                  <th>Action</th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {currentHolidays.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={6}>No data found</td>
                  </tr>
                ) : (
                  currentHolidays.map((holiday, index) => (
                    <tr key={holiday.id}>
                      {/* SR */}

                      <td>{indexOfFirstItem + index + 1}</td>

                      {/* DATE */}

                      <td>
                        {convertToDisplayDate(holiday.holiday_date) || "-"}
                      </td>

                      {/* HOLIDAY NAME */}

                      <td>{holiday.holiday_name || "-"}</td>

                      {/* CLIENT */}

                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {holiday.client_name || "-"}
                        </div>
                        <small style={{ color: "#888", fontSize: "10px" }}>
                          {holiday.company_name || "-"}
                        </small>
                      </td>

                      {/* SITE */}

                      <td>{holiday.site_name || "-"}</td>

                      {/* ACTION */}

                      <td>
                        {/* IMPORTANT:
                              Inactive record:
                              Action completely hidden
                          */}

                        {activeStatus === 0 && (
                          <Dropdown>
                            <Dropdown.Toggle variant="secondary" size="sm">
                              Actions
                            </Dropdown.Toggle>

                            <Dropdown.Menu
                              renderOnMount={true}
                              popperConfig={{
                                strategy: "fixed",
                              }}
                            >
                              {/* EDIT */}

                              <Dropdown.Item
                                onClick={() => handleEdit(holiday)}
                              >
                                <FaPen className="me-2 text-primary" />
                                Edit
                              </Dropdown.Item>

                              {/* DELETE */}

                              <Dropdown.Item
                                onClick={() => handleDelete(holiday.id)}
                              >
                                <FaTrashAlt className="me-2 text-danger" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}

          {/* ====================================================
              PAGINATION
          ==================================================== */}

          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              />

              {totalPages > 1 &&
                [...Array(totalPages)]
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

              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              />
            </Pagination>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HolidayMaster;
