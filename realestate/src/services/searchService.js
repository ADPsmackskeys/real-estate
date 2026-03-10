/**
 * searchService.js
 * Fuzzy + semantic search over properties using the Claude API.
 * Falls back to a lightweight local Fuse.js-style score if the API is unavailable.
 */

// ---------------------------------------------------------------------------
// Local fuzzy helpers (no external deps)
// ---------------------------------------------------------------------------

function normalize(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/** Simple bigram-based similarity between two strings (0–1) */
function bigramSimilarity(a, b) {
  const bigrams = (s) => {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const setA = bigrams(normalize(a));
  const setB = bigrams(normalize(b));
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  setA.forEach((b) => { if (setB.has(b)) inter++; });
  return (2 * inter) / (setA.size + setB.size);
}

/** Check whether token appears (fuzzy) somewhere in the target string */
function tokenMatch(token, target) {
  const t = normalize(target);
  const tk = normalize(token);
  if (!tk) return false;
  if (t.includes(tk)) return 1;
  return bigramSimilarity(tk, t);
}

/**
 * Local score for a property given a raw query string.
 * Returns 0–1 where 1 = perfect match.
 */
function localScore(property, query) {
  if (!query.trim()) return 1; // empty query → show all

  const tokens = normalize(query).split(/\s+/).filter(Boolean);

  const fields = [
    { value: property.title,        weight: 3 },
    { value: property.location,     weight: 3 },
    { value: property.neighbourhood,weight: 2.5 },
    { value: property.type,         weight: 2 },
    { value: property.subtype,      weight: 2 },
    { value: property.status,       weight: 1.5 },
    { value: property.furnished,    weight: 1 },
    { value: (property.tags || []).join(" "), weight: 2 },
    { value: property.description,  weight: 1 },
    { value: property.priceLabel,   weight: 1.5 },
    { value: String(property.bedrooms ?? ""), weight: 1.5 },
    { value: (property.amenities || []).join(" "), weight: 1 },
  ];

  let totalWeight = fields.reduce((s, f) => s + f.weight, 0);
  let weightedScore = 0;

  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      const s = tokenMatch(token, field.value ?? "") * field.weight;
      if (s > best) best = s;
    }
    weightedScore += best;
  }

  // Divide by (tokens × max possible weight per token) to normalise
  const maxPerToken = Math.max(...fields.map((f) => f.weight));
  return weightedScore / (tokens.length * maxPerToken);
}

// ---------------------------------------------------------------------------
// Claude API semantic search
// ---------------------------------------------------------------------------

async function claudeSemanticSearch(properties, query) {
  const slim = properties.map(({ id, title, type, subtype, location,
    neighbourhood, priceLabel, bedrooms, bathrooms, area,
    furnished, status, tags, description }) => ({
    id, title, type, subtype, location, neighbourhood,
    priceLabel, bedrooms, bathrooms, area, furnished, status, tags, description
  }));

  const prompt = `You are a real estate search engine.

Given this search query from a user: "${query}"

Score each property 0.0–1.0 based on relevance. Be tolerant of spelling errors,
abbreviations, and natural language queries. Return ONLY a JSON array like:
[{"id":"p1","score":0.9}, {"id":"p2","score":0.2}, ...]

Properties:
${JSON.stringify(slim, null, 2)}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.map((b) => b.text || "").join("") ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const scores = JSON.parse(clean);
    return scores; // [{id, score}]
  } catch {
    return null; // fall back to local
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * search(properties, query, { useAI = false, minScore = 0.15 })
 * Returns filtered + sorted properties.
 */
export async function search(properties, query, { useAI = false, minScore = 0.15 } = {}) {
  if (!query.trim()) return properties;

  if (useAI) {
    const aiScores = await claudeSemanticSearch(properties, query);
    if (aiScores) {
      const map = new Map(aiScores.map(({ id, score }) => [id, score]));
      return properties
        .map((p) => ({ ...p, _score: map.get(p.id) ?? 0 }))
        .filter((p) => p._score >= minScore)
        .sort((a, b) => b._score - a._score);
    }
  }

  // Local fallback
  return properties
    .map((p) => ({ ...p, _score: localScore(p, query) }))
    .filter((p) => p._score >= minScore)
    .sort((a, b) => b._score - a._score);
}

/**
 * filterProperties(properties, filters)
 * Hard filters applied before/after search.
 * filters: { location, type, status, minPrice, maxPrice, minBeds, furnished }
 */
export function filterProperties(properties, filters = {}) {
  return properties.filter((p) => {
    if (filters.location && filters.location !== "all" &&
        normalize(p.location) !== normalize(filters.location)) return false;
    if (filters.type && filters.type !== "all" &&
        p.type !== filters.type) return false;
    if (filters.status && filters.status !== "all" &&
        p.status !== filters.status) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.minBeds && (p.bedrooms ?? 0) < filters.minBeds) return false;
    if (filters.furnished && filters.furnished !== "all" &&
        p.furnished !== filters.furnished) return false;
    return true;
  });
}
