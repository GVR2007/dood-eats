import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Package, Utensils, History, ClipboardList, Plus, X } from 'lucide-react';
import type { OrderStatus, MenuItem } from '../types';

export const AdminDashboard = () => {
  const { currentUser, orders, menuItems, restaurants, updateOrderStatus, updateMenuItem, addMenuItem } = useAppStore();
  const [activeTab, setActiveTab] = useState<'menu' | 'incoming' | 'history' | 'inventory'>('incoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Catch the install prompt event
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('To install: Click the "Install" icon in your browser address bar (top right)!');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser?.restaurantId) return <div>No restaurant assigned</div>;

  const restaurant = restaurants.find(r => r.id === currentUser.restaurantId);
  const myItems = menuItems.filter(m => m.restaurantId === currentUser.restaurantId);
  
  const myOrders = orders.filter(o => o.restaurantId === currentUser.restaurantId);
  const incomingOrders = myOrders.filter(o => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status)).sort((a,b) => b.createdAt - a.createdAt);
  const orderHistory = myOrders.filter(o => ['READY', 'DELIVERED', 'REJECTED'].includes(o.status)).sort((a,b) => b.createdAt - a.createdAt);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const handleStockChange = (itemId: string, newQty: number) => {
    if (newQty < 0) return;
    updateMenuItem(itemId, { qty: newQty });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.restaurantId) return;
    setLoading(true);

    const newItem: MenuItem = {
      id: `m_${Date.now()}`,
      restaurantId: currentUser.restaurantId,
      name: newItemName,
      price: parseFloat(newItemPrice) || 0,
      qty: parseInt(newItemQty) || 0,
      image: newItemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
    };

    try {
      await addMenuItem(newItem);
      setShowAddModal(false);
      // Clear form
      setNewItemName(''); setNewItemPrice(''); setNewItemQty(''); setNewItemImage('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <div className="tabs" style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
      <button 
        style={{ 
          padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: activeTab === 'incoming' ? 'var(--primary)' : 'transparent',
          color: activeTab === 'incoming' ? 'white' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
        }}
        onClick={() => setActiveTab('incoming')}
      >
        <ClipboardList size={20}/> Incoming ({incomingOrders.length})
      </button>

      <button 
        style={{ 
          padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: activeTab === 'menu' ? 'var(--primary)' : 'transparent',
          color: activeTab === 'menu' ? 'white' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
        }}
        onClick={() => setActiveTab('menu')}
      >
        <Utensils size={20}/> Menu Manager
      </button>

      <button 
        style={{ 
          padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: activeTab === 'inventory' ? 'var(--primary)' : 'transparent',
          color: activeTab === 'inventory' ? 'white' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
        }}
        onClick={() => setActiveTab('inventory')}
      >
        <Package size={20}/> Inventory
      </button>

      <button 
        style={{ 
          padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
          color: activeTab === 'history' ? 'white' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
        }}
        onClick={() => setActiveTab('history')}
      >
        <History size={20}/> History
      </button>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--primary)' }}>{restaurant?.name} Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Manage your menu, inventory, and orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleInstall}>
             Download App
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add Item
          </button>
        </div>
      </div>

      {renderTabs()}

      {activeTab === 'incoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {incomingOrders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No incoming orders right now.</p> : null}
          {incomingOrders.map(order => (
            <div key={order.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              <div style={{ marginBottom: '24px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', marginBottom: '8px' }}>
                    <span>{item.qty}x {item.name}</span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                {order.status === 'PENDING' && (
                  <>
                    <button className="btn btn-primary" onClick={() => handleStatusChange(order.id, 'ACCEPTED')}>Accept</button>
                    <button className="btn btn-secondary" onClick={() => handleStatusChange(order.id, 'REJECTED')}>Reject</button>
                  </>
                )}
                {order.status === 'ACCEPTED' && (
                  <button className="btn btn-primary" onClick={() => handleStatusChange(order.id, 'PREPARING')}>Start Preparing</button>
                )}
                {order.status === 'PREPARING' && (
                  <button className="btn btn-primary" onClick={() => handleStatusChange(order.id, 'READY')}>Mark as Ready</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orderHistory.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No order history.</p> : null}
          {orderHistory.map(order => (
            <div key={order.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                    <span>{item.qty}x {item.name}</span>
                  </div>
                ))}
              </div>
              {order.status === 'READY' && (
                <button className="btn btn-primary" onClick={() => handleStatusChange(order.id, 'DELIVERED')}>Mark as Delivered</button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {myItems.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No items in your menu. Add some!</p> : null}
          {myItems.map(item => (
            <div key={item.id} className="card" style={{ opacity: item.qty === 0 ? 0.6 : 1 }}>
              <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'} alt={item.name} className="card-img" style={{ height: '160px' }} />
              <div className="card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <span className="price">${item.price.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }}>Edit Item</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myItems.map(item => (
            <div key={item.id} className="list-item" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>{item.name}</h3>
                  <p style={{ margin: 0, color: item.qty === 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    Current Stock: <strong>{item.qty}</strong>
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => handleStockChange(item.id, item.qty - 1)}>-</button>
                <input 
                  type="number" 
                  value={item.qty}
                  onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                  style={{ width: '60px', padding: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                />
                <button className="btn btn-secondary" onClick={() => handleStockChange(item.id, item.qty + 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Utensils className="color-primary" /> New Menu Item
              </h2>

              <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label>Item Name</label>
                  <input required className="input" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g. Cheese Burger" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label>Price ($)</label>
                    <input required type="number" step="0.01" className="input" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="9.99" />
                  </div>
                  <div className="input-group">
                    <label>Initial Stock</label>
                    <input required type="number" className="input" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} placeholder="20" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Image URL</label>
                  <input className="input" value={newItemImage} onChange={e => setNewItemImage(e.target.value)} placeholder="https://..." />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '12px', width: '100%', padding: '14px' }}>
                  {loading ? 'Adding...' : 'Add to Menu'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
