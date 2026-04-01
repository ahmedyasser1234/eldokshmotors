import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FleetManagement from './pages/FleetManagement';
import DriverDashboard from './pages/DriverDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserPayments from './pages/UserPayments';
import UserPurchases from './pages/UserPurchases';
import UserSales from './pages/UserSales';
import NotFound from './pages/NotFound';

import ProtectedRoute from './components/ProtectedRoute';

import AdminBookings from './pages/AdminBookings';
import AdminSoldVehicles from './pages/AdminSoldVehicles';
import AdminUsers from './pages/AdminUsers';
import SellCar from './pages/SellCar';
import AdminPurchaseRequests from './pages/AdminPurchaseRequests';
import AdminManualPayments from './pages/AdminManualPayments';
import ProfileSettings from './pages/ProfileSettings';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Sitemap from './pages/Sitemap';
import UserChat from './pages/UserChat';
import AdminChat from './pages/AdminChat';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AppContent: React.FC = () => {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/driver') ||
    location.pathname === '/admin/settings';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      {!isDashboard && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sell-car" element={<SellCar />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Routes */}
          <Route path="/checkout/:id" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={['customer']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/payment-success" element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/purchases" element={
            <ProtectedRoute roles={['customer']}>
              <UserPurchases />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/sales" element={
            <ProtectedRoute roles={['customer']}>
              <UserSales />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/payments" element={
            <ProtectedRoute roles={['customer']}>
              <UserPayments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/messages" element={
            <ProtectedRoute roles={['customer']}>
              <UserChat />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute roles={['customer']}>
              <ProfileSettings />
            </ProtectedRoute>
          } />
          <Route path="/driver/dashboard" element={
            <ProtectedRoute roles={['driver', 'admin']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/fleet" element={
            <ProtectedRoute roles={['admin']}>
              <FleetManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/manual-payments" element={
            <ProtectedRoute roles={['admin']}>
              <AdminManualPayments />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute roles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/sold-vehicles" element={
            <ProtectedRoute roles={['admin']}>
              <AdminSoldVehicles />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/sell-offers" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPurchaseRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute roles={['admin']}>
              <AdminChat />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          } />

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/sitemap" element={<Sitemap />} />

          {/* Catch-all Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isDashboard && <Footer />}
    </div>
  );
};

import { Toaster } from 'react-hot-toast';
import NotificationListener from './components/NotificationListener';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <NotificationListener />
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
