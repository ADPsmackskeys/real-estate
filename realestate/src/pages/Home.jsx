import { useState, useEffect, useCallback } from "react";
import LocationSelector from "../components/LocationSelector";
import PropertyTypeSelector from "../components/PropertyTypeSelector";
import Filters from "../components/Filters";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import { search, filterProperties } from "../services/searchService";
import propertiesData from "../data/properties.json";
import agentsData from "../data/agents.json";

const DEFAULT_FILTERS = {
  status: "all",
  minBeds: 0,
  furnished: "all",
};

export default function Home({ favourites, onToggleFav, isFav }) {
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState(propertiesData);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const agentMap = Object.fromEntries(agentsData.map((a) => [a.id, a]));

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    const preFiltered = filterProperties(propertiesData, {
      location,
      type,
      ...filters,
    });
    const searched = await search(preFiltered, q, { useAI: false });
    setResults(searched);
    setLoading(false);
  }, [location, type, filters]);

  // Re-run whenever location/type/filters change
  useEffect(() => {
    runSearch(activeQuery);
  }, [location, type, filters, activeQuery, runSearch]);

  const handleSearch = (q) => {
    setActiveQuery(q);
  };

  return (
    <main className="home-page">
      {/* Hero search panel */}
      <section className="search-section">
        <div className="search-section-inner">
          <h1 className="hero-title">
            Find your next<br />
            <span className="hero-accent">property.</span>
          </h1>

          <div className="search-controls">
            <div className="selectors-row">
              <LocationSelector value={location} onChange={setLocation} />
              <PropertyTypeSelector value={type} onChange={setType} />
            </div>

            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              loading={loading}
            />

            <div className="filter-toggle-row">
              <button
                className={`filter-toggle ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters((s) => !s)}
              >
                ⚙ Filters {showFilters ? "▲" : "▼"}
              </button>
              {(filters.status !== "all" || filters.minBeds > 0 || filters.furnished !== "all") && (
                <button
                  className="filter-reset"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  Reset filters
                </button>
              )}
            </div>

            {showFilters && (
              <Filters filters={filters} onChange={setFilters} propertyType={type} />
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="results-section">
        <div className="results-header">
          <span className="results-count">
            {loading ? "Searching…" : `${results.length} propert${results.length !== 1 ? "ies" : "y"} found`}
          </span>
        </div>

        {results.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No properties found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="property-grid">
            {results.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isFav={isFav(p.id)}
                onToggleFav={onToggleFav}
                agent={agentMap[p.agentId]}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
