import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import GlobalDialogs from './components/GlobalDialogs';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import ActivityPage from './pages/ActivityPage';
import VideoPage from './pages/VideoPage';
import MentoringPage from './pages/MentoringPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotificationPage from './pages/NotificationPage';
import TutorSchedulePage from './pages/TutorSchedulePage';
import AdminWithdrawPage from './pages/AdminWithdrawPage';

import EditProfilePage from './pages/EditProfilePage';
import WalletHistoryPage from './pages/WalletHistoryPage';
import ReviewsPage from './pages/ReviewsPage';

function ProtectedRoute({ children }) {
  const { user } = useApp();
  if (!user || !user.name) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <AppProvider>
      <GlobalDialogs />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Routes with Sidebar/BottomBar */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/mentoring" element={<MentoringPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationPage />} />
          </Route>

          {/* Standalone Pages (Full Screen) */}
          <Route path="/order" element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          } />
          <Route path="/payment/:id" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/chat/:orderId" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <TutorSchedulePage />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/wallet-history" element={
            <ProtectedRoute>
              <WalletHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/reviews" element={
            <ProtectedRoute>
              <ReviewsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/withdraw" element={
            <ProtectedRoute>
              <AdminWithdrawPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
