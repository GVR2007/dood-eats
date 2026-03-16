import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ChefHat, ShoppingBag, Box, Database, Plus, X } from 'lucide-react';

export const SuperAdminDashboard = () => {
  const { currentUser, orders, menuItems, restaurants, users, fetchData } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'global_orders' | 'users'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newRestName, setNewRestName] = useState('');
  const [newRestImage, setNewRestImage] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminLogin, setNewAdminLogin] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser?.role !== 'super_admin') return <div>Unauthorized Access</div>;

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const rid = `r_${Date.now()}`;
    const uid = `u_${Date.now()}`;

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rid,
          name: newRestName,
          image: newRestImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
          adminId: uid,
          adminName: newAdminName,
          adminLoginId: newAdminLogin,
          adminPassword: newAdminPass
        })
      });

      if (res.ok) {
        await fetchData();
        setShowAddModal(false);
        // Clear form
        setNewRestName(''); setNewRestImage(''); setNewAdminName('');
        setNewAdminLogin(''); setNewAdminPass('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <div className="tabs">
      <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
        <Database size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> 
        Overview
      </div>
      <div className={`tab ${activeTab === 'restaurants' ? 'active' : ''}`} onClick={() => setActiveTab('restaurants')}>
        <ChefHat size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> 
        All Restaurants ({restaurants.length})
      </div>
      <div className={`tab ${activeTab === 'global_orders' ? 'active' : ''}`} onClick={() => setActiveTab('global_orders')}>
        <ShoppingBag size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> 
        Global Orders ({orders.length})
      </div>
      <div className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
        <Box size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> 
        System Users ({users.length})
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Super Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Master Database View. Review every user, order, and restaurant strictly.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Add Restaurant
        </button>
      </div>

      {renderTabs()}

      {activeTab === 'overview' && (
        <div className="grid">
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '48px', margin: 0, color: 'var(--primary)' }}>
              ${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Total Gross System Revenue</p>
          </div>
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '48px', margin: 0 }}>{orders.length}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Total System Orders</p>
          </div>
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '48px', margin: 0, color: 'var(--success)' }}>{menuItems.length}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Total Menu Items Tracked</p>
          </div>
        </div>
      )}

      {activeTab === 'restaurants' && (
        <div className="grid">
          {restaurants.map(rest => {
            const admin = users.find(u => u.id === rest.adminId);
            const items = menuItems.filter(m => m.restaurantId === rest.id);
            const rOrders = orders.filter(o => o.restaurantId === rest.id);

            return (
              <div key={rest.id} className="card">
                <img src={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'} alt={rest.name} className="card-img" style={{ height: '120px' }} />
                <div className="card-content">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{rest.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                    Admin: <strong>{admin?.name || 'Unknown'}</strong> ({admin?.loginId})
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <span>Items: {items.length}</span>
                    <span>Total Orders: {rOrders.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'global_orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No orders placed yet in the global system.
            </div>
          ) : (
            orders.map(order => {
              const r = restaurants.find(x => x.id === order.restaurantId);
              const c = users.find(x => x.id === order.customerId);

              return (
                <div key={order.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
                    <strong>{r?.name || 'Unknown Restaurant'}</strong>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <span>Customer: {c?.name} ({c?.loginId})</span>
                    <span>Amount: ${(order.total * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map(u => (
            <div key={u.id} className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>{u.name}</h3>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '12px' }}>Login ID: {u.loginId}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  background: u.role === 'super_admin' ? 'var(--primary)' : 'var(--card-bg)', 
                  border: '1px solid var(--border-color)',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold',
                  color: u.role === 'super_admin' ? '#fff' : 'inherit'
                }}>
                  {u.role}
                </span>
                {u.restaurantId && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Restaurant ID: {u.restaurantId}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', overflow: 'hidden' }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ChefHat className="color-primary" /> New Restaurant
              </h2>

              <form onSubmit={handleAddRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label>Restaurant Name</label>
                  <input required className="input" value={newRestName} onChange={e => setNewRestName(e.target.value)} placeholder="e.g. Taco Bell" />
                </div>
                <div className="input-group">
                  <label>Image URL</label>
                  <input className="input" value={newRestImage} onChange={e => setNewRestImage(e.target.value)} placeholder="https://..." />
                </div>
                
                <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', color: 'var(--primary)' }}>Create Branch Admin</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="input-group">
                      <label>Admin Full Name</label>
                      <input required className="input" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label>Login ID</label>
                        <input required className="input" value={newAdminLogin} onChange={e => setNewAdminLogin(e.target.value)} placeholder="john_admin" />
                      </div>
                      <div className="input-group">
                        <label>Password</label>
                        <input required type="password" className="input" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} placeholder="••••" />
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '12px', width: '100%', padding: '14px' }}>
                  {loading ? 'Processing...' : 'Provision Restaurant & Admin'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
