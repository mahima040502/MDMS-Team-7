import { useState } from "react";
import { Outlet, useNavigation } from "react-router-dom";
import type { Role } from "../layout/roleMenus";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Loader from "./Loader";

export default function Layout({ role }: { role: Role }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

  return (
    <div className="app-layout">
      <Sidebar role={role} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="main-content">
        <Header role={role} menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
        <main className="page-content" aria-busy={navigation.state !== "idle"}>
          {navigation.state !== "idle" && <Loader label="Loading data…" />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
