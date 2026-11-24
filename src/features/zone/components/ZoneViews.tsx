import type { ReactNode } from "react";
import { Form, Link, useNavigation, useSearchParams } from "react-router-dom";
import { pageSize } from "../services/zoneService";

export function Filters({ children, id }: { children: ReactNode; id?: string }) {
  const navigation = useNavigation();
  return (
    <Form id={id} method="get" className="md-filters">
      {children}
      <button className="md-secondary" type="submit" disabled={navigation.state !== "idle"}>Apply filters</button>
    </Form>
  );
}

export function Pagination({ page, total }: { page: number; total: number }) {
  const [currentParams] = useSearchParams();
  const last = Math.max(1, Math.ceil(total / pageSize));
  function toPage(target: number) {
    const params = new URLSearchParams(currentParams);
    params.set("page", String(target));
    return "?" + params.toString();
  }
  if (last <= 1 && page === 1) return null;
  return (
    <nav className="md-actions md-pagination" aria-label="Pagination">
      {page > 1 && <Link to={toPage(Math.min(last, page - 1))}>Previous</Link>}
      <span>Page {page} of {last}</span>
      {page < last && <Link to={toPage(page + 1)}>Next</Link>}
    </nav>
  );
}
