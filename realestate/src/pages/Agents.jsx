import { useState, useEffect } from "react";
import AgentCard from "../components/AgentCard";
import { agentsApi } from "../api";

export default function Agents() {
  const [agents, setAgents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    agentsApi.getAll()
      .then(setAgents)
      .catch(() => setError("Could not load agents. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="agents-page">
        <div className="page-inner"><p>Loading agents…</p></div>
      </main>
    );
  }

  return (
    <main className="agents-page">
      <div className="page-inner">
        <div className="page-header">
          <h1 className="page-title">Our Agents</h1>
          <p className="page-subtitle">
            Connect with experienced property consultants for site visits and expert guidance.
          </p>
          {error && <p className="error-msg">{error}</p>}
        </div>

        <div className="agents-grid">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              listingCount={agent.listingCount}
            />
          ))}
        </div>
      </div>
    </main>
  );
}