import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ChefHat } from 'lucide-react';

export const Home = () => {
  const { restaurants } = useAppStore();

  return (
    <div>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <ChefHat size={32} color="var(--primary)" />
        Available Restaurants
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Choose from our excellent selection of partner restaurants.
      </p>

      <div className="grid">
        {restaurants.map(rest => (
          <Link to={`/restaurant/${rest.id}`} key={rest.id} className="card">
            <img src={rest.image} alt={rest.name} className="card-img" />
            <div className="card-content">
              <h2 className="card-title">{rest.name}</h2>
              <div className="card-actions">
                <span className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }}>View Menu</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
