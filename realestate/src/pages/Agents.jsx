import { useState } from "react";
import AgentCard from "../components/AgentCard";
import agentsData from "../data/agents.json";
import propertiesData from "../data/properties.json";

export default function Agents() {
  const [filter, setFilter] = useState("all");

  const locations = [...new Set(agentsData.flatMap((a) => a.locations))];

  const filtered = filter === "all"
    ? agentsData
    : agentsData.filter((a) => a.locations.includes(filter));

  const listingCount = (agentId) =>
    propertiesData.filter((p) => p.agentId === agentId).length;

  return (
    <main className="agents-page">
      <div className="page-inner">
        <div className="page-header">
          <h1 className="page-title">Our Agents</h1>
          <p className="page-subtitle">
            Connect with experienced property consultants for site visits and expert guidance.
          </p>
        </div>

        <div className="agent-filter-row">
          <button
            className={`pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Cities
          </button>
          {locations.map((l) => (
            <button
              key={l}
              className={`pill ${filter === l ? "active" : ""}`}
              onClick={() => setFilter(l)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="agents-grid">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} listingCount={listingCount(agent.id)} />
          ))}
        </div>
      </div>
    </main>
  );
}
