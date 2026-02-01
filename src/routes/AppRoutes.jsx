import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { AuthGuard, TenantGuard, SubscriptionGuard, FeatureGuard } from '../core/guards';
import { SuperAdminOnly } from '../core/guards/RoleGuard';
import Loader from '../shared/components/Loader';
import BottomNav from '../shared/components/BottomNav';
import { isDemoMode } from '../core/demo/demoManager';

// Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import BusinessSetup from '../pages/BusinessSetup';
import PendingApproval from '../pages/PendingApproval';
import Home from '../pages/Home';

// Support Module
import MyTickets from '../modules/support/pages/MyTickets';
import CreateTicket from '../modules/support/pages/CreateTicket';
import TicketChat from '../modules/support/pages/TicketChat';
import AdminDashboard from '../modules/support/pages/AdminDashboard';
import AdminTicketDetail from '../modules/support/pages/AdminTicketDetail';

// POS Module
import PosDashboard from '../modules/pos/pages/PosDashboard';
import NewBill from '../modules/pos/pages/NewBill';
import Cart from '../modules/pos/pages/Cart';
import Checkout from '../modules/pos/pages/Checkout';
import BillSuccess from '../modules/pos/pages/BillSuccess';
import BillHistory from '../modules/pos/pages/BillHistory';
import CreatePrescription from '../modules/pos/pages/CreatePrescription';
import PatientDetails from '../modules/pos/pages/PatientDetails';
import { CartProvider } from '../modules/pos/context/CartContext';


// Inventory Module
import InventoryDashboard from '../modules/inventory/pages/InventoryDashboard';
import AddProduct from '../modules/inventory/pages/AddProduct';
import ProductDetail from '../modules/inventory/pages/ProductDetail';
import StockHistory from '../modules/inventory/pages/StockHistory';
import { StockInPage, StockOutPage } from '../modules/inventory/pages/StockAdjust';

// Reports Module
import ReportsDashboard from '../modules/reports/pages/ReportsDashboard';

// Settings Module
import SettingsPage from '../modules/settings/pages/SettingsPage';

// Staff Module
import StaffDashboard from '../modules/staff/pages/StaffDashboard';
import StaffDetails from '../modules/staff/pages/StaffDetails';
import AddStaff from '../modules/staff/pages/AddStaff';

// Invoices Module
import InvoiceDashboard from '../modules/invoices/pages/InvoiceDashboard';
import AddInvoice from '../modules/invoices/pages/AddInvoice';
import InvoiceDetails from '../modules/invoices/pages/InvoiceDetails';
import SupplierList from '../modules/invoices/pages/SupplierList';


import FeatureFlags from '../admin/pages/FeatureFlags';

// New Admin Panel Components
import AdminLayout from '../admin/layout/AdminLayout';
import Dashboard from '../admin/pages/Dashboard';
import Tenants from '../admin/pages/Tenants';
import Modules from '../admin/pages/Modules';
import MasterData from '../admin/pages/MasterData';
import Security from '../admin/pages/Security';
import Communication from '../admin/pages/Communication';
import Payments from '../admin/pages/Payments';
import Revenue from '../admin/pages/Revenue';
import UserManagement from '../admin/pages/UserManagement';
import AdminSettings from '../admin/pages/AdminSettings';
import SeedData from '../admin/pages/SeedData';

// Subscription Module
import UpgradePage from '../modules/subscription/pages/UpgradePage';

// Lab Module
import LabDashboard from '../modules/lab/pages/LabDashboard';
import CreateLabReport from '../modules/lab/pages/CreateLabReport';
import LabReportDetail from '../modules/lab/pages/LabReportDetail';
import LabResultEntry from '../modules/lab/pages/LabResultEntry';

// Patients Module
import PatientsPage from '../modules/patients/pages/PatientsPage';
import AddPatient from '../modules/patients/pages/AddPatient';

// Appointments Module
import AppointmentsPage from '../modules/appointments/pages/AppointmentsPage';
import BookAppointment from '../modules/appointments/pages/BookAppointment';

const AppRoutes = () => {
    const { loading, user, tenant } = useAuth();
    const isAuthenticated = !!user || isDemoMode();
    const isSetupComplete = !!tenant || isDemoMode(); // Demo mode implies setup complete

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader text="Loading..." />
            </div>
        );
    }

    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to={isSetupComplete ? "/app" : "/setup"} replace /> : <Login />}
                />
                <Route
                    path="/signup"
                    element={isAuthenticated ? <Navigate to={isSetupComplete ? "/app" : "/setup"} replace /> : <Signup />}
                />

                {/* Business Setup (Authenticated but no tenant) */}
                <Route
                    path="/setup"
                    element={
                        <AuthGuard>
                            <BusinessSetup />
                        </AuthGuard>
                    }
                />

                {/* Protected App Routes */}
                <Route
                    path="/app"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <Home />
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* POS Module Routes */}
                <Route
                    path="/app/pos"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <PosDashboard />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/new"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <CartProvider>
                                        <NewBill />
                                    </CartProvider>
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/cart"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <CartProvider>
                                        <Cart />
                                    </CartProvider>
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/checkout"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <CartProvider>
                                        <Checkout />
                                    </CartProvider>
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/success/:billId"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <BillSuccess />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/history"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <BillHistory />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/prescription/:visitId/:patientId"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="clinic">
                                    <CreatePrescription />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/patient/:id"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <PatientDetails />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/pos/bill/:billId"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="pos">
                                    <BillSuccess />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Inventory Module Routes */}
                <Route
                    path="/app/inventory"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="inventory">
                                    <InventoryDashboard />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/inventory/add"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="inventory">
                                    <AddProduct />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/inventory/stock-in"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="inventory">
                                    <StockInPage />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/inventory/stock-out"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="inventory">
                                    <StockOutPage />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/inventory/product/:productId"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="inventory">
                                    <ProductDetail />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/inventory/history"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="inventory">
                                    <StockHistory />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Reports Module Routes */}
                <Route
                    path="/app/reports"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="reports">
                                    <ReportsDashboard />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Lab Module Routes */}
                <Route
                    path="/app/lab"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="lab_module">
                                    <LabDashboard />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/lab/new"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="lab_module">
                                    <CreateLabReport />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/lab/:id"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="lab_module">
                                    <LabReportDetail />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/lab/:id/results"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="lab_module">
                                    <LabResultEntry />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Patients Module Routes */}
                <Route
                    path="/app/patients"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="patients">
                                    <PatientsPage />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/patients/new"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="patients">
                                    <AddPatient />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Appointments Module Routes */}
                <Route
                    path="/app/appointments"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="appointments">
                                    <AppointmentsPage />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/appointments/new"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="appointments">
                                    <BookAppointment />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Support Module Routes */}
                <Route
                    path="/app/support"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="support">
                                    <MyTickets />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/support/new"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="support">
                                    <CreateTicket />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/support/tickets/:id"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="support">
                                    <TicketChat />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Settings */}
                <Route
                    path="/app/settings"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <SettingsPage />
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* New Admin Panel Routes */}
                <Route
                    path="/admin"
                    element={
                        <AuthGuard>
                            {/* <SuperAdminOnly> */}
                            <AdminLayout />
                            {/* </SuperAdminOnly> */}
                        </AuthGuard>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="modules" element={<Modules />} />
                    <Route path="master-data" element={<MasterData />} />
                    <Route path="security" element={<Security />} />
                    <Route path="security" element={<Security />} />
                    <Route path="communication" element={<Communication />} />
                    <Route path="tickets" element={<AdminDashboard />} />
                    <Route path="tickets/:id" element={<AdminTicketDetail />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="revenue" element={<Revenue />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="features" element={<FeatureFlags />} />
                    <Route path="seed" element={<SeedData />} />
                </Route>


                {/* Subscription Routes */}
                <Route
                    path="/app/subscription/plans"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <UpgradePage />
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Staff Module Routes */}
                <Route
                    path="/app/staff"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="staff">
                                    <StaffDashboard />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/staff/add"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="staff">
                                    <AddStaff />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/staff/:id"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="staff">
                                    <StaffDetails />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Invoices Module Routes */}
                <Route
                    path="/app/invoices"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="invoices">
                                    <InvoiceDashboard />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/invoices/new"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="invoices">
                                    <AddInvoice />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/invoices/:id"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="invoices">
                                    <InvoiceDetails />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/app/suppliers"
                    element={
                        <AuthGuard>
                            <TenantGuard>
                                <FeatureGuard feature="invoices">
                                    <SupplierList />
                                </FeatureGuard>
                            </TenantGuard>
                        </AuthGuard>
                    }
                />

                {/* Default Redirects */}

                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Bottom Navigation - show when authenticated */}
            {isAuthenticated && <BottomNav />}
        </>
    );
};

export default AppRoutes;
