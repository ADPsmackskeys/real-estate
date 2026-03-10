import { Heart, MapPin, Maximize2, BedDouble, Bath, Phone } from "lucide-react";

function formatPrice(price) {
  if (!price) return "Price on request";
  if (price >= 10_000_000) return `₹ ${(price / 10_000_000).toFixed(1)} Cr`;
  if (price >= 100_000)    return `₹ ${(price / 100_000).toFixed(0)} L`;
  return `₹ ${price.toLocaleString()}`;
}

function parseAmenities(json) {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

export default function PropertyCard({ property, agent, isFavourite, onToggleFavourite, onViewDetails }) {
  const amenities = parseAmenities(property.amenitiesJson);

  return (
    <div className="property-card" onClick={() => onViewDetails(property)} style={{ cursor: "pointer" }}>

      {/* Image area */}
      <div className="card-img-wrap">
        <div className="card-img-placeholder" style={{ background: "#EEF4F1" }}>
          <span className="placeholder-icon">
            {["Office", "Shop", "Warehouse"].includes(property.type) ? "🏢" : "🏠"}
          </span>
          <span className="placeholder-label">{property.type}</span>
        </div>

        {/* Status badge */}
        <span className={`card-status ${property.status === "Available" ? "for-sale" : "for-lease"}`}>
          {property.status}
        </span>

        {/* Favourite button */}
        <button
          className={`fav-btn ${isFavourite ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(property.id); }}
          title={isFavourite ? "Remove from saved" : "Save property"}
        >
          <Heart size={16} fill={isFavourite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Card body */}
      <div className="card-body">

        {/* Price */}
        <div className="card-price">{formatPrice(property.price)}</div>

        {/* Title */}
        <span className="card-title">{property.title}</span>

        {/* Location */}
        <div className="card-location">
          <MapPin size={12} className="loc-icon" />
          <span>{property.locality}, {property.city}</span>
        </div>

        {/* Stats */}
        <div className="card-meta">
          <span className="meta-item"><Maximize2 size={11} /> {property.areaSqFt} sq ft</span>
          {property.bedrooms > 0 && (
            <span className="meta-item"><BedDouble size={11} /> {property.bedrooms} BHK</span>
          )}
          {property.bathrooms > 0 && (
            <span className="meta-item"><Bath size={11} /> {property.bathrooms} Bath</span>
          )}
        </div>

        {/* Amenity tags */}
        {amenities.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
            {amenities.slice(0, 3).map((tag) => (
              <span key={tag} className="amenity-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Agent row */}
        {agent && (
          <div className="card-agent">
            <div className="agent-avatar-sm">
              {agent.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <span className="agent-name-sm" style={{ flex: 1 }}>
              {agent.name}
              {agent.agency && (
                <span style={{ display: "block", fontSize: "11px", color: "var(--charcoal-30)" }}>
                  {agent.agency}
                </span>
              )}
            </span>
            <a
              href={`tel:${agent.phone}`}
              className="agent-call-sm"
              onClick={(e) => e.stopPropagation()}
              title="Call agent"
            >
              <Phone size={11} style={{ display: "inline", marginRight: "3px" }} />
              Call
            </a>
          </div>
        )}
      </div>
    </div>
  );
}