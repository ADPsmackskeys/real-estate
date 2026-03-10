/**
 * searchService.js
 * Fuzzy + semantic search over properties.
 * Hard filtering is now handled by the backend API.
 * This file only handles client-side text search on top of API results.
 */

// ---------------------------------------------------------------------------
// Local fuzzy helpers
// ---------------------------------------------------------------------------

function normalize(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

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

function tokenMatch(token, target) {
  const t = normalize(target);
  const tk = normalize(token);
  if (!tk) return false;
  if (t.includes(tk)) return 1;
  return bigramSimilarity(tk, t);
}

function localScore(property, query) {
  if (!query.trim()) return 1;

  const tokens = normalize(query).split(/\s+/).filter(Boolean);

  // Field names now match what the API returns
  const fields = [
    { value: property.title,                            weight: 3   },
    { value: property.city,                             weight: 3   },
    { value: property.locality,                         weight: 2.5 },
    { value: property.type,                             weight: 2   },
    { value: property.status,                           weight: 1.5 },
    { value: property.description,                      weight: 1   },
    { value: String(property.bedrooms ?? ""),           weight: 1.5 },
    { value: property.amenitiesJson ?? "",              weight: 1   },
    { value: property.agent?.name ?? "",                weight: 1   },
    { value: property.agent?.agency ?? "",              weight: 1   },
  ];

  const maxPerToken = Math.max(...fields.map((f) => f.weight));
  let weightedScore = 0;

  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      const s = tokenMatch(token, field.value ?? "") * field.weight;
      if (s > best) best = s;
    }
    weightedScore += best;
  }

  return weightedScore / (tokens.length * maxPerToken);
}

// ---------------------------------------------------------------------------
// Claude API semantic search
// ---------------------------------------------------------------------------

async function claudeSemanticSearch(properties, query) {
  const slim = properties.map(({ id, title, type, city, locality,
    price, bedrooms, bathrooms, areaSqFt, status, description }) => ({
    id, title, type, city, locality,
    price, bedrooms, bathrooms, areaSqFt, status, description
  }));

  const prompt = `You are a real estate search engine.

Given this search query from a user: "${query}"

Score each property 0.0–1.0 based on relevance. Be tolerant of spelling errors,
abbreviations, and natural language queries. Return ONLY a JSON array like:
[{"id":1,"score":0.9}, {"id":2,"score":0.2}, ...]

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
    return JSON.parse(clean); // [{ id, score }]
  } catch {
    return null; // fall back to local
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * search(properties, query, { useAI = false, minScore = 0.15 })
 * Accepts properties already returned from the backend API.
 * Returns filtered + sorted by relevance.
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

  // Local fuzzy fallback
  return properties
    .map((p) => ({ ...p, _score: localScore(p, query) }))
    .filter((p) => p._score >= minScore)
    .sort((a, b) => b._score - a._score);
}