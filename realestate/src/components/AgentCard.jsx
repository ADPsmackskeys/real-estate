export default function AgentCard({ agent, listingCount }) {
  const stars = "★".repeat(Math.round(agent.rating)) + "☆".repeat(5 - Math.round(agent.rating));

  return (
    <div className="agent-card">
      <div className="agent-header">
        <div className="agent-avatar">{agent.name.split(" ").map(n => n[0]).join("")}</div>
        <div className="agent-info">
          <div className="agent-name">{agent.name}</div>
          <div className="agent-title">{agent.title}</div>
          <div className="agent-agency">{agent.agency}</div>
        </div>
      </div>

      <div className="agent-stats">
        <div className="stat">
          <span className="stat-num">{agent.listings}</span>
          <span className="stat-label">Listings</span>
        </div>
        <div className="stat">
          <span className="stat-num">{agent.experience}y</span>
          <span className="stat-label">Experience</span>
        </div>
        <div className="stat">
          <span className="stat-num rating-stars">{agent.rating}</span>
          <span className="stat-label">Rating</span>
        </div>
      </div>

      <div className="agent-locs">
        {agent.locations.map((l) => (
          <span key={l} className="loc-tag">{l}</span>
        ))}
      </div>

      <div className="agent-specs">
        {agent.specializations.map((s) => (
          <span key={s} className="spec-tag">{s}</span>
        ))}
      </div>

      <div className="agent-actions">
        <a href={`tel:${agent.phone}`} className="agent-btn primary">
          📞 Call
        </a>
        <a href={`https://wa.me/${agent.whatsapp}`} target="_blank" rel="noreferrer"
          className="agent-btn whatsapp">
          💬 WhatsApp
        </a>
        <a href={`mailto:${agent.email}`} className="agent-btn secondary">
          ✉ Email
        </a>
      </div>
    </div>
  );
}
