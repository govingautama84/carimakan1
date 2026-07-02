import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages - Auth
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages - Customer
import RestaurantListPage from './pages/customer/RestaurantListPage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import ReservationPage from './pages/customer/ReservationPage';
import ServiceTypePage from './pages/customer/ServiceTypePage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderTrackPage from './pages/customer/OrderTrackPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';

// Pages - Restaurant Dashboard
import RestaurantLayout from './components/RestaurantLayout';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantReservationPage from './pages/restaurant/RestaurantReservationPage';
import RestaurantMenuPage from './pages/restaurant/RestaurantMenuPage';
import RestaurantOrderPage from './pages/restaurant/RestaurantOrderPage';
import RestaurantProfilePage from './pages/restaurant/RestaurantProfilePage';
import RestaurantReportPage from './pages/restaurant/RestaurantReportPage';

// Pages - Admin Dashboard
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/AdminUserManagement';
import AdminRestaurantPage from './pages/admin/AdminRestaurantManagement';
import AdminTransactionPage from './pages/admin/PesananPage';
import LaporanPage from './pages/admin/LaporanPage';

function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            {/* Public Auth & Landing */}
            <Route path="/" element={<CustomerLayout><LandingPage /></CustomerLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/restaurants" element={<CustomerLayout><RestaurantListPage /></CustomerLayout>} />
            <Route path="/restaurant/:id" element={<CustomerLayout><RestaurantDetailPage /></CustomerLayout>} />

            {/* Customer Routes (Protected) */}
            <Route path="/restaurant/:id/reserve" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><ReservationPage /></CustomerLayout></ProtectedRoute>} />
            <Route path="/reservation/:id/service" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><ServiceTypePage /></CustomerLayout></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><CartPage /></CustomerLayout></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><CheckoutPage /></CustomerLayout></ProtectedRoute>} />
            <Route path="/order/:orderNumber/track" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'RESTAURANT', 'ADMIN']}><CustomerLayout><OrderTrackPage /></CustomerLayout></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><OrderHistoryPage /></CustomerLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout><ProfilePage /></CustomerLayout></ProtectedRoute>} />

            {/* Restaurant Dashboard (Protected) */}
            <Route path="/restaurant-dashboard" element={<ProtectedRoute allowedRoles={['RESTAURANT']}><RestaurantLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="reservations" element={<RestaurantReservationPage />} />
              <Route path="menus" element={<RestaurantMenuPage />} />
              <Route path="orders" element={<RestaurantOrderPage />} />
              <Route path="profile" element={<RestaurantProfilePage />} />
              <Route path="reports" element={<RestaurantReportPage />} />
            </Route>

            {/* Admin Dashboard (Protected) */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="restaurants" element={<AdminRestaurantPage />} />
              <Route path="transactions" element={<AdminTransactionPage />} />
              <Route path="reports" element={<LaporanPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
