import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BuyerHome from './pages/BuyerHome';
import SellerDashboard from './pages/SellerDashboard';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          <Route path="/" element={<BuyerHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute allowedRole="buyer">
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller" 
            element={
              <ProtectedRoute allowedRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400 mt-auto">
        <div className="container mx-auto px-4">
          <p className="font-medium text-emerald-600 dark:text-emerald-400">Neighbour Market &copy; 2026</p>
          <p className="text-xs mt-1">Connecting Local Shops & Communities in Bangalore, India</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
