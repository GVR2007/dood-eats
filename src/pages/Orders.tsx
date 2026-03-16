import { useAppStore } from '../store/useAppStore';
import { Package, Clock } from 'lucide-react';
import type { OrderStatus } from '../types';

export const Orders = () => {
  const { orders, currentUser, restaurants } = useAppStore();

  const myOrders = orders.filter(o => o.customerId === currentUser?.id).sort((a, b) => b.createdAt - a.createdAt);

  if (myOrders.length === 0) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '60px' }}>
        <Package size={64} color="var(--border-color)" style={{ marginBottom: '24px' }} />
        <h2>No orders yet</h2>
        <p style={{ color: 'var(--text-muted)' }}>Looks like you haven't placed any orders.</p>
      </div>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'status-PENDING';
      case 'ACCEPTED': return 'status-ACCEPTED';
      case 'PREPARING': return 'status-PREPARING';
      case 'READY': return 'status-READY';
      case 'DELIVERED': return 'status-DELIVERED';
      case 'REJECTED': return 'status-REJECTED';
      default: return '';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'Awaiting confirmation';
      case 'ACCEPTED': return 'Order accepted';
      case 'PREPARING': return 'Food is being prepared';
      case 'READY': return 'Ready for pickup / delivery';
      case 'DELIVERED': return 'Delivered';
      case 'REJECTED': return 'Order rejected';
      default: return status;
    }
  };

  return (
    <div>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Clock size={32} color="var(--primary)" />
        Order History
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {myOrders.map(order => {
          const restaurant = restaurants.find(r => r.id === order.restaurantId);

          return (
            <div key={order.id} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{restaurant?.name || 'Unknown Restaurant'}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Order #{order.id} • {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '20px', color: 'var(--success)' }}>
                    ${(order.total * 1.1).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span>{item.qty}x {item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
