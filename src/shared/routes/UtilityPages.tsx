import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

function UtilityPage({ code, title, description }: { code: string; title: string; description: string }) {
  return (
    <main className="md-center">
      <section className="md-panel md-stack">
        <strong className="md-brand">{code}</strong>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="md-button" to="/login">Back to login</Link>
      </section>
    </main>
  );
}

export function NotFound() {
  return <UtilityPage code="404" title="Page not found" description="Check the address or return to login." />;
}

export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return <UtilityPage code="500" title="Something went wrong"
    description="Reload this page to try again. For data pages, check that JSON Server is running." />;
}

export function Maintenance() {
  return <UtilityPage code="MDMS" title="Scheduled maintenance" description="Please check back later." />;
}

export function AccessDenied() {
  return <UtilityPage code="403" title="Access denied" description="Return to login to choose a demo role." />;
}
