import { Link } from "react-router-dom";
import { roleTitles } from "../layout/roleMenus";
import type { Role } from "../layout/roleMenus";

export default function Header({ role, menuOpen, toggleMenu }: {
  role: Role; menuOpen: boolean; toggleMenu: () => void;
}) {
  return (
    <header className="header">
      <div className="md-actions">
        <button className="md-secondary md-menu-button" type="button" aria-expanded={menuOpen}
          aria-controls="role-sidebar" onClick={toggleMenu}>Menu</button>
        <div><h3>MDMS</h3><p>Meter Data Management System</p></div>
      </div>
      <Link className="header-profile" to="/login" aria-label={roleTitles[role] + ", switch demo role"}>
        {roleTitles[role]}
      </Link>
    </header>
  );
}
