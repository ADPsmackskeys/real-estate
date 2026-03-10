const TYPES = [
  { value: "all", label: "All Types" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

export default function PropertyTypeSelector({ value, onChange, disabled = false }) {
  return (
    <div className="type-selector">
      {TYPES.map((t) => (
        <button
          key={t.value}
          className={`type-btn ${value === t.value ? "active" : ""}`}
          onClick={() => onChange(t.value)}
          disabled={disabled}
        >
          <span className="type-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
