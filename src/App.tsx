import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { RestaurantPage } from './pages/Restaurant';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { useAppStore } from './store/useAppStore';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'customer' | 'admin' | 'super_admin' }) => {
  const currentUser = useAppStore(state => state.currentUser);
  
  if (!currentUser) return <Navigate to="/" />;
  if (role && currentUser.role !== role) return <Navigate to="/" />;

  return (
    <div className="app-container">
      <Navbar />
      {children}
    </div>
  );
};

function App() {
  const fetchData = useAppStore(state => state.fetchData);

  useEffect(() => {
    // 1. Listen for cross-tab syncs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dood-eats-storage-v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.state) {
            useAppStore.setState(parsed.state);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // 2. Fetch fresh DB state on app load
    fetchData();

    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Customer Routes */}
        <Route path="/customer" element={<ProtectedRoute role="customer"><Home /></ProtectedRoute>} />
        <Route path="/restaurant/:id" element={<ProtectedRoute role="customer"><RestaurantPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute role="customer"><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="customer"><Orders /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        
        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<ProtectedRoute role="super_admin"><SuperAdminDashboard /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
