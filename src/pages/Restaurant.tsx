import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Plus, Minus, ArrowLeft } from 'lucide-react';

export const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { restaurants, menuItems, addToCart, cart, updateCartQty } = useAppStore();
  
  const restaurant = restaurants.find(r => r.id === id);
  const items = menuItems.filter(m => m.restaurantId === id);

  if (!restaurant) return <div>Restaurant not found</div>;

  const getCartItemQty = (itemId: string) => {
    return cart.find(i => i.menuItem.id === itemId)?.qty || 0;
  };

  return (
    <div>
      <button onClick={() => navigate('/customer')} className="btn btn-secondary" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Restaurants
      </button>

      <div style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${restaurant.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '48px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {restaurant.name}
        </h1>
        <p style={{ color: 'var(--text-main)', opacity: 0.9 }}>Menu Items</p>
      </div>

      <div className="grid">
        {items.map(item => {
          const cartQty = getCartItemQty(item.id);

          return (
            <div key={item.id} className="card" style={{ opacity: item.qty === 0 ? 0.6 : 1 }}>
              <img src={item.image} alt={item.name} className="card-img" />
              <div className="card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h2 className="card-title" style={{ margin: 0 }}>{item.name}</h2>
                  <span className="price">${item.price.toFixed(2)}</span>
                </div>
                
                <p className="card-desc">
                  {item.qty > 0 ? <span style={{ color: 'var(--success)' }}>In Stock: {item.qty}</span> : <span style={{ color: 'var(--primary)' }}>Out of Stock</span>}
                </p>

                <div className="card-actions" style={{ marginTop: '16px' }}>
                  {cartQty > 0 ? (
                    <div className="qty-control">
                      <button className="btn btn-secondary qty-btn" onClick={() => updateCartQty(item.id, cartQty - 1)}>
                        <Minus size={16} />
                      </button>
                      <span style={{ fontWeight: 600 }}>{cartQty}</span>
                      <button 
                        className="btn btn-primary qty-btn" 
                        onClick={() => addToCart(item)}
                        disabled={cartQty >= item.qty}
                        style={{ opacity: cartQty >= item.qty ? 0.5 : 1 }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      onClick={() => addToCart(item)}
                      disabled={item.qty === 0}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
