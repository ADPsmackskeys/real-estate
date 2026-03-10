import { Heart, MapPin, Maximize2, BedDouble, Bath, Car, Phone } from "lucide-react";

export default function PropertyCard({ property, agent, isFavourite, onToggleFavourite, onViewDetails }) {
  const categoryColor = property.category === "commercial" ? "chip--commercial" : "chip--residential";

  return (
    <div className="property-card" onClick={() => onViewDetails(property)}>
      <div className="property-card-img">
        <div className="property-img-placeholder">
          <span className="property-img-type">{property.type}</span>
        </div>
        <button
          className={`fav-btn ${isFavourite ? "fav-btn--active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(property.id); }}
          title={isFavourite ? "Remove from saved" : "Save property"}
        >
          <Heart size={16} fill={isFavourite ? "currentColor" : "none"} />
        </button>
        <span className={`category-chip ${categoryColor}`}>
          {property.category}
        </span>
      </div>

      <div className="property-card-body">
        <div className="property-card-top">
          <h3 className="property-title">{property.title}</h3>
          <span className="property-price">{property.priceLabel}</span>
        </div>

        <div className="property-location">
          <MapPin size={13} />
          <span>{property.location}, {property.city}</span>
        </div>

        <div className="property-stats">
          <span className="stat"><Maximize2 size={12} />{property.area} sq ft</span>
          {property.bedrooms > 0 && (
            <span className="stat"><BedDouble size={12} />{property.bedrooms} BHK</span>
          )}
          {property.bathrooms > 0 && (
            <span className="stat"><Bath size={12} />{property.bathrooms}</span>
          )}
          {property.parking > 0 && (
            <span className="stat"><Car size={12} />{property.parking}</span>
          )}
        </div>

        <div className="property-tags">
          {property.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        {agent && (
          <div className="property-agent-row">
            <div className="agent-avatar-sm">
              {agent.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="agent-info-sm">
              <span className="agent-name-sm">{agent.name}</span>
              <span className="agent-agency-sm">{agent.agency}</span>
            </div>
            <a
              href={`tel:${agent.phone}`}
              className="agent-call-btn"
              onClick={(e) => e.stopPropagation()}
              title="Call agent"
            >
              <Phone size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
