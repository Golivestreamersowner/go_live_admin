import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import Stabilization from './pages/Stabilization';
import OptimizationImpact from './pages/OptimizationImpact';
import NativeImagesMemoryLeak from './pages/NativeImagesMemoryLeak';
import LiveDeviceDetail from './pages/LiveDeviceDetail';
import CameraMicMemory from './pages/CameraMicMemory';
import UserManagement from './pages/UserManagement';
import UserDetails from './pages/UserDetails';
import SponsoredCreators from './pages/SponsoredCreators';
import PremiumSubscribers from './pages/PremiumSubscribers';
import IconRecruiterApplications from './pages/IconRecruiterApplications';
import AgencyManagement from './pages/AgencyManagement';
import AgencyDetails from './pages/AgencyDetails';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import PackageManagement from './pages/PackageManagement';
import SubscriptionManagement from './pages/SubscriptionManagement';
import SubscriptionStats from './pages/SubscriptionStats';
import QRCodeManagement from './pages/QRCodeManagement';
import VendorManagement from './pages/VendorManagement';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import OrderManagement from './pages/OrderManagement';
import ReviewManagement from './pages/ReviewManagement';
import PayoutManagement from './pages/PayoutManagement';
import ReportedUsers from './pages/ReportedUsers';
import ReportedPosts from './pages/ReportedPosts';
import CashOutRequests from './pages/CashOutRequests';
import StickerManagement from './pages/StickerManagement';
import GiftManagement from './pages/GiftManagement';
import GiftCategoryManagement from './pages/GiftCategoryManagement';
import BlogManagement from './pages/BlogManagement';
import BlogEditor from './pages/BlogEditor';
import ContestManagement from './pages/ContestManagement';
import BannerManagement from './pages/BannerManagement';
import CashoutOptionManagement from './pages/CashoutOptionManagement';
import WithdrawRequests from './pages/WithdrawRequests';
import WithdrawRequestDetails from './pages/WithdrawRequestDetails';
import WithdrawRequestStreamDetails from './pages/WithdrawRequestStreamDetails';
import TopSpenders from './pages/TopSpenders';
import FinanceOverview from './pages/FinanceOverview';
import Referrals from './pages/Referrals';
import GifterPayoutDetails from './pages/GifterPayoutDetails';
import GifterRecipientsLookup from './pages/GifterRecipientsLookup';
import StreamerRubiesList from './pages/StreamerRubiesList';
import StreamerRubiesDetail from './pages/StreamerRubiesDetail';
import UserStreamEarnings from './pages/UserStreamEarnings';
import StreamerStreamGiftsAdmin from './pages/StreamerStreamGiftsAdmin';
import LiveStreamsManagement from './pages/LiveStreamsManagement';
import SupportTickets from './pages/SupportTickets';
import SupportTicketDetail from './pages/SupportTicketDetail';
import SupportSettings from './pages/SupportSettings';
import FraudCascade from './pages/FraudCascade';
import FraudCascadeDetails from './pages/FraudCascadeDetails';
import IapManagement from './pages/IapManagement';
import FeaturesAllowed from './pages/FeaturesAllowed';
import MarketplaceProducts from './pages/MarketplaceProducts';
import MarketplaceVendors from './pages/MarketplaceVendors';
import MarketplaceSettings from './pages/MarketplaceSettings';
import MarketplaceOrders from './pages/MarketplaceOrders';
import MarketplaceEarnings from './pages/MarketplaceEarnings';
import IpBans from './pages/IpBans';

// Auth check: token + user with admin/moderator level (level >= 3 or role name)
const isAuthenticated = () => {
  const token = localStorage.getItem('adminAccessToken');
  const user = localStorage.getItem('adminUser');

  if (!token || !user) return false;

  try {
    const userData = JSON.parse(user);
    const roleName = (userData.role?.name || userData.role || '').toString().toUpperCase();
    const level = userData.role?.level;
    return level >= 3 || ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'STAFF'].includes(roleName);
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing authentication on app load
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser && isAuthenticated()) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Clear invalid user data
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    window.location.href = '/'; // Redirect to dashboard
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors position="top-right" />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stabilization/optimization-impact"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <OptimizationImpact />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stabilization/device/:userId"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <LiveDeviceDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stabilization/camera-mic-memory/device/:userId"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <LiveDeviceDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stabilization/camera-mic-memory"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CameraMicMemory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stabilization/native-images-memory-leak"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <NativeImagesMemoryLeak />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stabilization"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <Stabilization />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <UserDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sponsored-creators"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SponsoredCreators />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/icon-recruiter"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <IconRecruiterApplications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agencies"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <AgencyManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agencies/:agencyId"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <AgencyDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/topspenders"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <TopSpenders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/ruby-crown-wallet" element={<Navigate to="/topspenders" replace />} />

          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <FinanceOverview />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <Referrals />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/qr-codes"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <QRCodeManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/packages"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <PackageManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SubscriptionManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/premium-subscribers"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <PremiumSubscribers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription-stats"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SubscriptionStats />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <VendorManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ProductManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CategoryManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <OrderManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ReviewManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payouts"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <PayoutManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reported-users"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ReportedUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ip-bans"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <IpBans />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reported-posts"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ReportedPosts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cashout-requests"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CashOutRequests />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashout-email-change"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CashOutRequests />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stickers"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <StickerManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gifts"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <GiftManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gift-categories"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <GiftCategoryManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Literal /blogs/new must precede /blogs/:id/edit. */}
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <BlogManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs/new"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <BlogEditor />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs/:id/edit"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <BlogEditor />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contests"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ContestManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/banners"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <BannerManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw-requests"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <WithdrawRequests />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw-requests/:id"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <WithdrawRequestDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw-requests/:id/streams/:streamId"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <WithdrawRequestStreamDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashout-options"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CashoutOptionManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gifter-recipients"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <GifterRecipientsLookup />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/withdraw-requests/gifters/:gifterId"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <GifterPayoutDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/streamers-rubies/:streamerId/streams/:streamId"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <StreamerStreamGiftsAdmin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/streamers-rubies/:streamerId"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <StreamerRubiesDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/streamers-rubies"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <StreamerRubiesList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-stream-earnings"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <UserStreamEarnings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-streams"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <LiveStreamsManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SupportTickets />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/settings"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SupportSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/:id"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SupportTicketDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/fraud-cascade"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <FraudCascade />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/features-allowed"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <FeaturesAllowed />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/iap"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <IapManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fraud-cascade/:id"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <FraudCascadeDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace/products"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <MarketplaceProducts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/vendors"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <MarketplaceVendors />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/settings"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <MarketplaceSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/orders"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <MarketplaceOrders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/earnings"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <MarketplaceEarnings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Login */}
          <Route
            path="/login"
            element={<AdminLogin onLoginSuccess={handleLoginSuccess} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;