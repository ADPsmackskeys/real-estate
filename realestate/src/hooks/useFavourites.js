import { useState, useEffect } from "react";

const KEY = "re_favourites";

export function useFavourites() {
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favourites));
  }, [favourites]);

  const toggle = (id) =>
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  const isFav = (id) => favourites.includes(id);

  return { favourites, toggle, isFav };
}
