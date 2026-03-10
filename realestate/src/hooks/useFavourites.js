import { useState, useEffect } from "react";
import { favoritesApi } from "../api";

const USER_ID = 1;

export function useFavourites() {
  const [favourites, setFavourites] = useState([]); // property IDs

  // Load from API on mount — this is now the source of truth
  useEffect(() => {
    favoritesApi.getByUser(USER_ID)
      .then((data) => setFavourites(data.map((f) => f.property.id)))
      .catch(() => setFavourites([]));
  }, []);

  const toggle = async (id) => {
    const alreadySaved = favourites.includes(id);

    // Optimistic update
    setFavourites((prev) =>
      alreadySaved ? prev.filter((f) => f !== id) : [...prev, id]
    );

    try {
      if (alreadySaved) {
        await favoritesApi.remove(USER_ID, id);
      } else {
        await favoritesApi.add({ userId: USER_ID, propertyId: id, tag: "Saved" });
      }
    } catch (err) {
      // Roll back if API call fails
      console.error("Failed to sync favourite:", err);
      setFavourites((prev) =>
        alreadySaved ? [...prev, id] : prev.filter((f) => f !== id)
      );
    }
  };

  const isFav = (id) => favourites.includes(id);

  return { favourites, toggle, isFav };
}