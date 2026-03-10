const LOCATIONS = ["Mumbai", "Bangalore", "Delhi", "Pune", "Hyderabad", "Chennai"];

export default function LocationSelector({ value, onChange }) {
  return (
    <div className="selector-wrap">
      <label className="selector-label">
        <span className="selector-icon">📍</span>
        Location
      </label>
      <div className="custom-select-wrap">
        <select
          className="custom-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="all">All Cities</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <span className="select-arrow">▾</span>
      </div>
    </div>
  );
}
