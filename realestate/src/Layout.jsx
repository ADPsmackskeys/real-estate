import { Outlet } from "react-router-dom";
import TopBar from "./components/TopBar";

export default function Layout({ favouriteCount }) {
  return (
    <div className="app-shell">
      <TopBar favouriteCount={favouriteCount} />
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
}
