import { Link, useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import propertiesData from "../data/properties.json";
import agentsData from "../data/agents.json";

export default function Favourites({ favourites, onToggleFav, isFav }) {
  const navigate = useNavigate();
  const agentMap = Object.fromEntries(agentsData.map((a) => [a.id, a]));
  const saved = propertiesData.filter((p) => favourites.includes(p.id));

  return (
    <main className="favourites-page">
      <div className="page-inner">
        <div className="page-header">
          <h1 className="page-title">Saved Properties</h1>
          <p className="page-subtitle">
            {saved.length === 0
              ? "You haven't saved any properties yet."
              : `${saved.length} propert${saved.length !== 1 ? "ies" : "y"} saved`}
          </p>
        </div>

        {saved.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">♡</div>
            <h3>No saved properties</h3>
            <p>Tap the heart icon on any listing to save it here.</p>
            <Link to="/" className="cta-btn">Browse Listings</Link>
          </div>
        ) : (
          <div className="property-grid">
            {saved.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isFavourite={isFav(p.id)}
                onToggleFavourite={onToggleFav}
                onViewDetails={(prop) => navigate(`/property/${prop.id}`)}
                agent={agentMap[p.agentId]}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
