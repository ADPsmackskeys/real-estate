const STATUS_FILTERS = [
  { value: "all",       label: "All" },
  { value: "for-sale",  label: "For Sale" },
  { value: "for-lease", label: "For Lease" },
];

const FURNISHED_FILTERS = [
  { value: "all",       label: "Any" },
  { value: "fully",     label: "Fully Furnished" },
  { value: "semi",      label: "Semi Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
  { value: "bare-shell", label: "Bare Shell" },
];

const BED_FILTERS = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

export default function Filters({ filters, onChange, propertyType }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="filters-panel">
      <div className="filter-group">
        <span className="filter-group-label">Status</span>
        <div className="filter-pills">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`pill ${filters.status === f.value ? "active" : ""}`}
              onClick={() => set("status", f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {propertyType !== "commercial" && (
        <div className="filter-group">
          <span className="filter-group-label">Bedrooms</span>
          <div className="filter-pills">
            {BED_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`pill ${filters.minBeds === f.value ? "active" : ""}`}
                onClick={() => set("minBeds", f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-group">
        <span className="filter-group-label">Furnished</span>
        <div className="filter-pills">
          {FURNISHED_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`pill ${filters.furnished === f.value ? "active" : ""}`}
              onClick={() => set("furnished", f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
