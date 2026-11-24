import type { ReactNode } from "react";

export function PageHeader({ title, description, children }: {
  title: string; description?: string; children?: ReactNode;
}) {
  return (
    <header className="md-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="md-actions">{children}</div>}
    </header>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return <section className="md-panel md-stat"><h2>{label}</h2><strong>{value}</strong>{hint && <p>{hint}</p>}</section>;
}

export function StatusBadge({ value }: { value: string }) {
  const tone = ["Online", "Active", "Resolved"].includes(value) ? "good"
    : ["Offline", "Critical"].includes(value) ? "bad" : "neutral";
  return <span className={"md-badge md-badge-" + tone}>{value}</span>;
}

type Column<T> = { label: string; cell: (row: T) => ReactNode };

export function DataTable<T extends { id: number }>({ rows, columns, label }: {
  rows: T[]; columns: Column<T>[]; label: string;
}) {
  if (!rows.length) return <div className="md-panel md-empty">No {label.toLowerCase()} match this view.</div>;
  return (
    <div className="md-table-wrap" tabIndex={0} role="region" aria-label={label}>
      <table aria-label={label}>
        <thead><tr>{columns.map((column) => <th scope="col" key={column.label}>{column.label}</th>)}</tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>{columns.map((column) => <td key={column.label}>{column.cell(row)}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}
