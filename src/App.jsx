// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// toast container
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Layout
import MainLayout from "./layouts/MainLayout";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// Pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import PrintAttendanceWithTime from "./pages/attendance/attendance-by-employee/PrintAttendanceWithTime";

// master - pages
import CompanyPage from "./pages/master/CompanyPage";
import BranchPage from "./pages/master/BranchPage";
import UserRole from "./pages/master/UserRole";
import UserPage from "./pages/master/UserPage";
import UserDetailPage from "./pages/master/UserDetailPage";
import ZoneMasterPage from "./pages/master/ZoneMasterPage";
import HolidayMaster from "./pages/Master/HolidayMaster";

import RaiseTicket from "./pages/master/RaiseTicket";
import EmployeeDocumentList from "./pages/dashboard/EmployeeDocumentList";
import Createbill from "./pages/billing/Createbill";
import CreateTransportBill from "./pages/billing/CreateTransportBill";
import PrintInvoice from "./pages/billing/printinvoice";
import BillingPages from "./pages/billing/index";
import EmployeePages from "./pages/employee/EmployeePages";
import AddEmployee from "./components/employee/employeePage/AddEmployee";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundCancellationPolicy from "./pages/RefundCancellationPolicy";
import EmployeeTypePage from "./pages/employee/EmployeeTypePage";

import Holiday from "./pages/addNew/Holiday";
import TrainingVideoPage from "./pages/master/TrainingVideoPage";
import ApplyLeave from "./pages/leaves/ApplyLeave";
import LeaveList from "./pages/leaves/LeaveList";

// Attendance
import AttendancePage from "./pages/attendance/attendance-by-employee/AttendancePage";
import InvoiceReview from "./pages/attendance/attendance-by-employee/InvoiceReview";
import AttendanceByEmployee from "./pages/attendance/attendance-by-employee";
import PrintAttendance from "./pages/attendance/attendance-by-employee/PrintAttendance";
import TimeBasedAttendance from "./pages/attendance/time-based-attendance";

// WMS
import Supplier from "./pages/wms/supplier";
import Product from "./pages/wms/product";
import GRN from "./pages/wms/grn/index";
import StockLedger from "./pages/wms/stock_ledger/index";
// import PurchaseOrder from "./pages/wms/purchase_order";
import PurchaseOrder from "./pages/wms/PurchaseOrder/PurchaseOrder";

// import SalaryTemplatePage from "./pages/addNew/SalaryTemplatePage";
import EmployeeView from "./components/employee/employeePage/EmployeeView";

import UserAccessPage from "./components/userAccess/UserAccess";

// Client
import ClientTable from "./pages/addNew/client/ClientTable";
import ClientForm from "./pages/addNew/client/ClientForm";
import ClientSiteEdit from "./pages/addNew/client/EditSitePage";
import WagesSettings from "./components/addNew/clientPage/WagesSettings.jsx"

// Equipment Type
import EquipmentTypeMasterPage from "./pages/addNew/EquipmentMasterPage";
import MISPage from "./pages/reports/MISPage";
import Ledger from "./pages/reports/Ledger";

// work-order
import ClientWorkOrder from "./pages/WorkOrder/ClientWorkOrder";
import CreateGangWorkOrder from "./pages/WorkOrder/CreateGangWorkOrder";
import GangWorkOrderUI from "./pages/WorkOrder/GangWorkOrder";
// vouchers
import Vouchers from "./pages/Voucher/Vouchers";
import ChargesType from "./pages/addNew/ChargesType";

// import NewJoineeList from "./pages/employee/New_Joinee";
import AddNewJoinee from "./pages/employee/New_Joinee_from";
import GoodReceivedList from "./pages/wms/grn/GoodReceivedList";
import UniformMaster from "./pages/unifrom/UniformMaster";
import StockValuation from "./pages/Inventory/StockValuation";
import EmployeeWiseUniformIssued from "./pages/Inventory/EmployeeWiseUniformIssued";
import Order from "./pages/order/order";
import WarehouseList from "./pages/warehouse/WarehouseList";
import WarehouseForm from "./pages/warehouse/WarehouseForm";
import AttendanceDetails from "./pages/dashboard/AttendanceDetails";

import UpdateEmployeeSalary from "./pages/employee/UpdateEmployeeSalary";
import SalaryTemplatePage from "./pages/addNew/SalaryTemplatePage";
import ClientAttendance from "./pages/reports/ClientAttendance";
import SalarySlip from "./pages/Salary/SalarySlip";
import PrintSalarySheet from "./pages/Salary/PrintSalarySheet";
import PrintSalaryByEmployee from "./pages/Salary/PrintSalaryByEmployee";
import SalaryBySite from "./pages/Salary/SalaryBySite";

// PRIVATE ROUTE
const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT & AUTH */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* PUBLIC PAGES */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/refund" element={<RefundCancellationPolicy />} />

        {/* PRIVATE LAYOUT */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />

            {/* MASTER */}
            <Route path="master/companies" element={<CompanyPage />} />
            <Route path="master/branches" element={<BranchPage />} />
            <Route path="master/role-master" element={<UserRole />} />
            <Route path="master/users" element={<UserPage />} />
            <Route path="master/users/:id" element={<UserDetailPage />} />
            <Route
              path="master/user-role-access"
              element={<UserAccessPage />}
            />
            <Route path="master/zone-master" element={<ZoneMasterPage />} />
            <Route path="master/holiday-master" element={<HolidayMaster />} />
            <Route
              path="master/training-videos"
              element={<TrainingVideoPage />}
            />
            <Route path="raise-ticket" element={<RaiseTicket />} />

            {/* CLIENT */}
            <Route path="client/add" element={<ClientForm />} />
            <Route path="client/edit-site" element={<ClientSiteEdit />} />
            <Route path="/client/wages-setting" element={<WagesSettings />} />
            <Route path="add-new/client" element={<ClientTable />} />
            <Route path="add-new/holidays" element={<Holiday />} />
            <Route
              path="reports/clientwise-attendance"
              element={<ClientAttendance />}
            />

            <Route
              path="add-new/equipment-type"
              element={<EquipmentTypeMasterPage />}
            />
            <Route path="add-new/charges-type" element={<ChargesType />} />

            {/* EMPLOYEE */}
            <Route
              path="employee/employee-type"
              element={<EmployeeTypePage />}
            />
            <Route path="employee/employee" element={<EmployeePages />} />
            <Route path="employee/new-joinee" element={<AddNewJoinee />} />
            <Route path="employee/view/:id" element={<EmployeeView />} />
            <Route path="employees/add" element={<AddEmployee />} />

            {/* WMS */}
            <Route path="wms/product" element={<Product />} />
            <Route path="wms/purchase-order" element={<PurchaseOrder />} />
            <Route path="wms/supplier" element={<Supplier />} />
            {/* <Route path="wms/good-recivied-note(grn)" element={<GRN />} /> */}
            <Route
              path="wms/good-recivied-note(grn)"
              element={<GoodReceivedList />}
            />

            <Route path="wms/stock-ledger" element={<StockLedger />} />

            <Route path="wms/uniform" element={<UniformMaster />} />
            <Route path="/stock-valuation" element={<StockValuation />} />
            <Route path="/warehouse-list" element={<WarehouseList />} />
            <Route path="/warehouse-form" element={<WarehouseForm />} />
            <Route path="/warehouse-form/:id" element={<WarehouseForm />} />
            <Route
              path="/employee-wise-uniform-issued"
              element={<EmployeeWiseUniformIssued />}
            />
            <Route path="orders/orders" element={<Order />} />

            {/* ATTENDANCE */}
            <Route
              path="attendance/attendance-by-employee"
              element={<AttendanceByEmployee />}
            />
            <Route
              path="attendance/attendance-by-employee/PrintAttendance"
              element={<PrintAttendance />}
            />
            <Route
              path="attendance/attendance-by-employee/invoice-review"
              element={<InvoiceReview />}
            />
            <Route
              path="attendance/time/rokada-based-attendance"
              element={<TimeBasedAttendance />}
            />
            <Route
              path="attendance/add-attendance"
              element={<AttendancePage />}
            />

            {/* BILLING */}
            <Route path="/billing" element={<BillingPages />} />
            <Route path="billing/create-bill" element={<Createbill />} />
            <Route
              path="billing/create-transport-bill"
              element={<CreateTransportBill />}
            />
            <Route
              path="attendance/attendance-by-employee/PrintAttendanceWithTime"
              element={<PrintAttendanceWithTime />}
            />
            <Route
              path="billing/print-invoice/:autoNo"
              element={<PrintInvoice />}
            />

            <Route path="/billing/edit-bill/:autoNo" element={<Createbill />} />

            <Route
              path="/billing/edit-transport-bill/:autoNo"
              element={<CreateTransportBill />}
            />

            <Route
              path="/employee/update-salary/:id"
              element={<UpdateEmployeeSalary />}
            />
            <Route
              path="add-new/salary-template"
              element={<SalaryTemplatePage />}
            />

            <Route path="salary/salary-by-employee" element={<SalarySlip />} />
            <Route
              path="/salary/print-by-employee"
              element={<PrintSalaryByEmployee />}
            />
            <Route
              path="/salary_slip/printbysite"
              element={<PrintSalarySheet />}
            />
            <Route path="/salary/salary-by-site" element={<SalaryBySite />} />

            {/* WORK ORDER */}
            <Route
              path="work-order/client-work-order"
              element={<ClientWorkOrder />}
            />
            <Route
              path="work-order/gang-work-order"
              element={<GangWorkOrderUI />}
            />

            <Route path="/attendance-details" element={<AttendanceDetails />} />

            <Route
              path="/employee/document-list/:documentType"
              element={<EmployeeDocumentList />}
            />

            {/* VOUCHERS & REPORTS */}
            <Route path="vouchers" element={<Vouchers />} />
            <Route path="reports/mis" element={<MISPage />} />
            <Route path="reports/ledger" element={<Ledger />} />

            <Route path="/leaves/apply" element={<ApplyLeave />} />
            <Route path="/leaves/edit/:id" element={<ApplyLeave />} />

            <Route path="Leaves/leaves" element={<LeaveList />} />

   <Route path="/leaves/apply" element={<ApplyLeave />} />
            <Route path="/leaves/edit/:id" element={<ApplyLeave />} />

            <Route path="Leaves-management" element={<LeaveList />} />
          </Route>
        </Route>

        {/* INVALID */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
       <ToastContainer position="top-right" autoClose={5000} />
    </BrowserRouter>
  );
}
