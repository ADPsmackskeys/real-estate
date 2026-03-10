import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import PropertyDetails from "./pages/PropertyDetails";
import Agents from "./pages/Agents";
import Favourites from "./pages/Favourites";
import { useFavourites } from "./hooks/useFavourites";

export default function App() {
  const { favourites, toggle, isFav } = useFavourites();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout favouriteCount={favourites.length} />}>
          <Route path="/" element={
            <Home favourites={favourites} onToggleFav={toggle} isFav={isFav} />
          } />
          <Route path="/property/:id" element={
            <PropertyDetails isFav={isFav} onToggleFav={toggle} />
          } />
          <Route path="/agents" element={<Agents />} />
          <Route path="/favourites" element={
            <Favourites favourites={favourites} onToggleFav={toggle} isFav={isFav} />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
