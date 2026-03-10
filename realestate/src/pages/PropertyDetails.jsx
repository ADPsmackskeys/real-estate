import { useParams, Link } from "react-router-dom";
import propertiesData from "../data/properties.json";
import agentsData from "../data/agents.json";
import AgentCard from "../components/AgentCard";

export default function PropertyDetails({ isFav, onToggleFav }) {
  const { id } = useParams();
  const property = propertiesData.find((p) => p.id === id);
  const agent = property ? agentsData.find((a) => a.id === property.agentId) : null;

  if (!property) {
    return (
      <div className="not-found">
        <h2>Property not found</h2>
        <Link to="/" className="back-link">← Back to listings</Link>
      </div>
    );
  }

  const PLACEHOLDER_COLORS = ["#e8f4f0","#f0e8f4","#f4f0e8","#e8ecf4","#f4e8ec"];
  const bgColor = PLACEHOLDER_COLORS[parseInt(property.id.replace("p","")) % PLACEHOLDER_COLORS.length];

  return (
    <main className="detail-page">
      <div className="detail-inner">
        {/* Back */}
        <Link to="/" className="back-link">← Back to listings</Link>

        <div className="detail-layout">
          {/* Left: property info */}
          <div className="detail-main">
            {/* Image */}
            <div className="detail-img-wrap" style={{ background: bgColor }}>
              {property.images?.length > 0 ? (
                <img src={property.images[0]} alt={property.title} className="detail-img" />
              ) : (
                <div className="detail-img-placeholder">
                  <span className="placeholder-icon-lg">
                    {property.type === "commercial" ? "🏢" : "🏠"}
                  </span>
                  <span className="placeholder-sublabel">No photos yet</span>
                </div>
              )}
              <span className={`card-status ${property.status}`}>
                {property.status === "for-sale" ? "For Sale" : "For Lease"}
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
                <div className="detail-location">📍 {property.neighbourhood}, {property.location}</div>
              </div>
              <div className="detail-price">{property.priceLabel}</div>
            </div>

            {/* Stats */}
            <div className="detail-stats">
              {property.bedrooms != null && (
                <div className="dstat"><span className="dstat-val">{property.bedrooms}</span><span className="dstat-label">Bedrooms</span></div>
              )}
              {property.bathrooms && (
                <div className="dstat"><span className="dstat-val">{property.bathrooms}</span><span className="dstat-label">Bathrooms</span></div>
              )}
              <div className="dstat"><span className="dstat-val">{property.area.toLocaleString()}</span><span className="dstat-label">sq.ft</span></div>
              {property.parking && (
                <div className="dstat"><span className="dstat-val">{property.parking}</span><span className="dstat-label">Parking</span></div>
              )}
            </div>

            {/* Description */}
            <div className="detail-section">
              <h3>About this property</h3>
              <p className="detail-desc">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="detail-section">
                <h3>Amenities</h3>
                <div className="amenity-list">
                  {property.amenities.map((a) => (
                    <span key={a} className="amenity-tag">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {property.tags?.length > 0 && (
              <div className="detail-section">
                <div className="tag-list">
                  {property.tags.map((t) => (
                    <span key={t} className="prop-tag">{t}</span>
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
                <p>Contact {agent.name.split(" ")[0]} to schedule a viewing at your convenience.</p>
                <a href={`https://wa.me/${agent.whatsapp}?text=Hi, I'm interested in ${encodeURIComponent(property.title)} — can we schedule a site visit?`}
                  target="_blank" rel="noreferrer" className="visit-btn">
                  💬 Book via WhatsApp
                </a>
                <a href={`mailto:${agent.email}?subject=Site Visit Request: ${property.title}`}
                  className="visit-btn secondary">
                  ✉ Send Email
                </a>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
