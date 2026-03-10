import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AgentCard from "../components/AgentCard";
import { propertiesApi } from "../api";

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

const PLACEHOLDER_COLORS = ["#e8f4f0", "#f0e8f4", "#f4f0e8", "#e8ecf4", "#f4e8ec"];

export default function PropertyDetails({ isFav, onToggleFav }) {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    propertiesApi.getById(id)
      .then(setProperty)
      .catch(() => setError("Property not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="not-found"><p>Loading…</p></div>;

  if (error || !property) {
    return (
      <div className="not-found">
        <h2>Property not found</h2>
        <Link to="/" className="back-link">← Back to listings</Link>
      </div>
    );
  }

  const agent      = property.agent;
  const amenities  = parseAmenities(property.amenitiesJson);
  const bgColor    = PLACEHOLDER_COLORS[property.id % PLACEHOLDER_COLORS.length];

  return (
    <main className="detail-page">
      <div className="detail-inner">
        <Link to="/" className="back-link">← Back to listings</Link>

        <div className="detail-layout">
          {/* Left: property info */}
          <div className="detail-main">

            {/* Image */}
            <div className="detail-img-wrap" style={{ background: bgColor }}>
              <div className="detail-img-placeholder">
                <span className="placeholder-icon-lg">
                  {["Office", "Shop", "Warehouse"].includes(property.type) ? "🏢" : "🏠"}
                </span>
                <span className="placeholder-sublabel">No photos yet</span>
              </div>
              <span className={`card-status ${property.status?.toLowerCase()}`}>
                {property.status}
              </span>
              <button
                className={`fav-btn detail-fav ${isFav(property.id) ? "active" : ""}`}
                onClick={() => onToggleFav(property.id)}
              >
                {isFav(property.id) ? "♥ Saved" : "♡ Save"}
              </button>
            </div>

            {/* Title & price */}
            <div className="detail-title-row">
              <div>
                <h1 className="detail-title">{property.title}</h1>
                <div className="detail-location">
                  📍 {property.locality}, {property.city}
                </div>
                <div className="detail-location" style={{ marginTop: 2 }}>
                  {property.address}
                </div>
              </div>
              <div className="detail-price">{formatPrice(property.price)}</div>
            </div>

            {/* Stats */}
            <div className="detail-stats">
              {property.bedrooms > 0 && (
                <div className="dstat">
                  <span className="dstat-val">{property.bedrooms}</span>
                  <span className="dstat-label">Bedrooms</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="dstat">
                  <span className="dstat-val">{property.bathrooms}</span>
                  <span className="dstat-label">Bathrooms</span>
                </div>
              )}
              <div className="dstat">
                <span className="dstat-val">{property.areaSqFt?.toLocaleString()}</span>
                <span className="dstat-label">sq.ft</span>
              </div>
              <div className="dstat">
                <span className="dstat-val">{property.viewCount}</span>
                <span className="dstat-label">Views</span>
              </div>
            </div>

            {/* Description */}
            <div className="detail-section">
              <h3>About this property</h3>
              <p className="detail-desc">{property.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="detail-section">
                <h3>Amenities</h3>
                <div className="amenity-list">
                  {amenities.map((a) => (
                    <span key={a} className="amenity-tag">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: agent */}
          {agent && (
            <aside className="detail-sidebar">
              <h3 className="sidebar-heading">Listed by</h3>
              <AgentCard agent={agent} />
              <div className="site-visit-box">
                <h4>Book a Site Visit</h4>
                <p>Contact {agent.name.split(" ")[0]} to schedule a viewing.</p>
                <a
                  href={`mailto:${agent.email}?subject=Site Visit Request: ${property.title}`}
                  className="visit-btn"
                >
                  ✉ Send Email
                </a>
                <a
                  href={`tel:${agent.phone}`}
                  className="visit-btn secondary"
                >
                  📞 Call Agent
                </a>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}