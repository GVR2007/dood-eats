import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

export const Cart = () => {
  const { cart, removeFromCart, updateCartQty, cartTotal, placeOrder } = useAppStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    placeOrder();
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '60px' }}>
        <ShoppingCart size={64} color="var(--border-color)" style={{ marginBottom: '24px' }} />
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Looks like you haven't added anything to your cart yet.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/customer')}>
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <ShoppingCart size={32} color="var(--primary)" />
        Review Your Cart
      </h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          {cart.map((item) => (
            <div key={item.menuItem.id} className="list-item">
              <img 
                src={item.menuItem.image} 
                alt={item.menuItem.name} 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
              />
              
              <div style={{ flex: '1' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{item.menuItem.name}</h3>
                <p style={{ color: 'var(--success)', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                  ${item.menuItem.price.toFixed(2)}
                </p>
              </div>

              <div className="qty-control">
                <button className="btn btn-secondary qty-btn" onClick={() => updateCartQty(item.menuItem.id, item.qty - 1)}>
                  <Minus size={16} />
                </button>
                <span style={{ fontWeight: 600, width: '24px', textAlign: 'center' }}>{item.qty}</span>
                <button 
                  className="btn btn-secondary qty-btn" 
                  onClick={() => updateCartQty(item.menuItem.id, item.qty + 1)}
                  disabled={item.qty >= item.menuItem.qty}
                  style={{ opacity: item.qty >= item.menuItem.qty ? 0.5 : 1 }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button 
                className="btn" 
                style={{ color: 'var(--primary)', padding: '8px' }}
                onClick={() => removeFromCart(item.menuItem.id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ width: '400px', background: 'var(--card-bg)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', alignSelf: 'flex-start' }}>
          <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>${cartTotal().toFixed(2)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)' }}>
            <span>Taxes & Fees</span>
            <span>${(cartTotal() * 0.1).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', fontSize: '24px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>${(cartTotal() * 1.1).toFixed(2)}</span>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '32px', padding: '16px', fontSize: '18px' }}
            onClick={handleCheckout}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};
