import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import { favoritesApi } from "../api";

// Swap for real userId from auth context when auth is ready
const USER_ID = 1;

export default function Favourites({ onToggleFav, isFav }) {
  const navigate = useNavigate();
  const [saved, setSaved]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    favoritesApi.getByUser(USER_ID)
      .then(setSaved)
      .catch(() => setError("Could not load saved properties."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="favourites-page">
        <div className="page-inner">
          <p>Loading saved properties…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="favourites-page">
      <div className="page-inner">
        <div className="page-header">
          <h1 className="page-title">Saved Properties</h1>
          <p className="page-subtitle">
            {error
              ? error
              : saved.length === 0
                ? "You haven't saved any properties yet."
                : `${saved.length} propert${saved.length !== 1 ? "ies" : "y"} saved`}
          </p>
        </div>

        {saved.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-icon">♡</div>
            <h3>No saved properties</h3>
            <p>Tap the heart icon on any listing to save it here.</p>
            <Link to="/" className="cta-btn">Browse Listings</Link>
          </div>
        ) : (
          <div className="property-grid">
            {saved.map(({ property, tag, note }) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavourite={isFav(property.id)}
                onToggleFavourite={onToggleFav}
                onViewDetails={(prop) => navigate(`/property/${prop.id}`)}
                agent={property.agent}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}