import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LocationSelector from "../components/LocationSelector";
import Filters from "../components/Filters";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import { search } from "../services/searchService";
import { propertiesApi } from "../api";

const DEFAULT_FILTERS = {
  status: "all",
  minBeds: 0,
  furnished: "all",
};

export default function Home({ favourites, onToggleFav, isFav }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = {
        ...(location !== "all"       && { city: location }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.minBeds > 0      && { minBedrooms: filters.minBeds }),
        ...(filters.minPrice         && { minPrice: filters.minPrice }),
        ...(filters.maxPrice         && { maxPrice: filters.maxPrice }),
      };

      const data = await propertiesApi.getAll(apiFilters);
      const searched = q.trim() ? await search(data, q, { useAI: false }) : data;
      setResults(searched);
    } catch (err) {
      setError("Could not load properties. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [location, filters]);

  useEffect(() => {
    runSearch(activeQuery);
  }, [location, filters, activeQuery, runSearch]);

  const handleSearch = (q) => setActiveQuery(q);

  return (
    <main className="home-page">
      <section className="search-section">
        <div className="search-section-inner">
          <h1 className="hero-title">
            Find your next<br />
            <span className="hero-accent">property.</span>
          </h1>

          <div className="search-controls">
            <div className="selectors-row">
              <LocationSelector value={location} onChange={setLocation} />
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
              <Filters filters={filters} onChange={setFilters} />
            )}
          </div>
        </div>
      </section>

      <section className="results-section">
        <div className="results-header">
          <span className="results-count">
            {loading
              ? "Searching…"
              : `${results.length} propert${results.length !== 1 ? "ies" : "y"} found`}
          </span>
        </div>

        {error && (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!error && results.length === 0 && !loading ? (
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
                isFavourite={isFav(p.id)}
                onToggleFavourite={onToggleFav}
                onViewDetails={(prop) => navigate(`/property/${prop.id}`)}
                agent={p.agent}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}