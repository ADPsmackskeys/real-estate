export default function AgentCard({ agent, listingCount }) {
  const initials = agent.name.split(" ").map((n) => n[0]).join("");

  return (
    <div className="agent-card">
      <div className="agent-header">
        <div className="agent-avatar">{initials}</div>
        <div className="agent-info">
          <div className="agent-name">{agent.name}</div>
          <div className="agent-agency">{agent.agency}</div>
        </div>
      </div>

      {/* Bio */}
      {agent.bio && (
        <p className="agent-bio">{agent.bio}</p>
      )}

      {/* Stats */}
      {listingCount != null && (
        <div className="agent-stats">
          <div className="stat">
            <span className="stat-num">{listingCount}</span>
            <span className="stat-label">Listings</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="agent-actions">
        <a href={`tel:${agent.phone}`} className="agent-btn primary">
          📞 Call
        </a>
        <a href={`mailto:${agent.email}`} className="agent-btn secondary">
          ✉ Email
        </a>
      </div>
    </div>
  );
}