import { Link, NavLink } from "react-router-dom";
import { roleMenus } from "../layout/roleMenus";
import type { Role } from "../layout/roleMenus";

export default function Sidebar({ role, open, onNavigate }: {
  role: Role; open: boolean; onNavigate: () => void;
}) {
  return (
    <aside className={"sidebar" + (open ? " sidebar-open" : "")} id="role-sidebar">
      <h2>MDMS</h2>
      <p className="sidebar-subtitle">Meter Data Management</p>
      <nav aria-label="Portal navigation">
        {roleMenus[role].map(([name, path]) => (
          <NavLink key={path} to={path} onClick={onNavigate}
            className={({ isActive }) => isActive ? "active" : ""}>{name}</NavLink>
        ))}
        <Link to="/login" onClick={onNavigate}>Switch demo role</Link>
      </nav>
    </aside>
  );
}
