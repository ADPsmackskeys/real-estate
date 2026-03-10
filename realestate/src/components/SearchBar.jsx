import { useState, useRef } from "react";

export default function SearchBar({ value, onChange, onSearch, loading }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleKey = (e) => {
    if (e.key === "Enter") onSearch(value);
  };

  return (
    <div className={`search-bar-wrap ${focused ? "focused" : ""}`}>
      <span className="search-icon">
        {loading ? (
          <span className="spinner" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        )}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder='Try "3 bed apartment in Bandra" or "office space BKC"…'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button className="search-clear" onClick={() => { onChange(""); onSearch(""); }}>
          ✕
        </button>
      )}
      <button className="search-btn" onClick={() => onSearch(value)}>
        Search
      </button>
    </div>
  );
}
