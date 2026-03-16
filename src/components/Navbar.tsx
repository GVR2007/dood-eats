import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ShoppingBag, ShoppingCart, LogOut, LayoutDashboard, Utensils } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, cart, clearCart, setCurrentUser } = useAppStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    setCurrentUser(null);
    clearCart();
    navigate('/');
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="navbar">
      <Link to={currentUser.role === 'customer' ? '/customer' : currentUser.role === 'super_admin' ? '/superadmin' : '/admin'} className="brand">
        <Utensils className="icon" size={28} />
        Dood Eats
      </Link>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)' }}>Hello, {currentUser.name}</span>
        
        {currentUser.role === 'customer' && (
          <>
            <Link to="/orders" className="btn btn-secondary" title="My Orders">
              <ShoppingBag size={20} />
            </Link>
            <Link to="/cart" className="btn btn-primary" title="Cart" style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px', 
                  background: '#fff', color: 'var(--primary)', 
                  borderRadius: '50%', width: '20px', height: '20px', 
                  fontSize: '12px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </>
        )}

        {currentUser.role === 'admin' && (
          <Link to="/admin" className="btn btn-primary">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
        )}

        {currentUser.role === 'super_admin' && (
          <Link to="/superadmin" className="btn btn-primary">
            <LayoutDashboard size={20} /> Portal Console
          </Link>
        )}

        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </nav>
  );
};
