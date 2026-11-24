import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, Navigate, Outlet, redirect, RouterProvider } from "react-router-dom";

import Layout from "../shared/components/Layout";
import Loader from "../shared/components/Loader";
import { AccessDenied, Maintenance, NotFound, RouteError } from "../shared/routes/UtilityPages";
import { alertsLoader, customersLoader, dashboardLoader, meterDetailLoader, metersLoader,
  reportsLoader, settingsLoader } from "../features/zone/services/zoneLoaders";

const Login = lazy(() => import("../features/auth/pages/AuthPages").then((pages) => ({ default: pages.Login })));
const ForgotPassword = lazy(() => import("../features/auth/pages/AuthPages").then((pages) => ({ default: pages.ForgotPassword })));
const ResetPassword = lazy(() => import("../features/auth/pages/AuthPages").then((pages) => ({ default: pages.ResetPassword })));

const ZoneDashboard = lazy(() => import("../features/zone/pages/Dashboard"));
const ZoneMeters = lazy(() => import("../features/zone/pages/Meters"));
const MeterDetails = lazy(() => import("../features/zone/pages/MeterDetails"));
const ZoneUsers = lazy(() => import("../features/zone/pages/Users"));
const ZoneReports = lazy(() => import("../features/zone/pages/Reports"));
const ZoneAlerts = lazy(() => import("../features/zone/pages/Alerts"));
const ZoneSettings = lazy(() => import("../features/zone/pages/Settings"));

const EnterpriseDashboard = lazy(() => import("../features/enterprise/pages/Dashboard"));
const Zones = lazy(() => import("../features/enterprise/pages/Zones"));
const ZoneDetails = lazy(() => import("../features/enterprise/pages/ZoneDetails"));
const EnterpriseMeters = lazy(() => import("../features/enterprise/pages/Meters"));
const EnterpriseUsers = lazy(() => import("../features/enterprise/pages/Users"));
const EnterpriseReports = lazy(() => import("../features/enterprise/pages/Reports"));
const EnterpriseAlerts = lazy(() => import("../features/enterprise/pages/Alerts"));
const AuditLogs = lazy(() => import("../features/enterprise/pages/AuditLogs"));
const EnterpriseSettings = lazy(() => import("../features/enterprise/pages/Settings"));

const UserDashboard = lazy(() => import("../features/end-user/pages/Dashboard"));

function loadPage(element: ReactNode) {
  return <Suspense fallback={<Loader />}>{element}</Suspense>;
}

function AuthLayout() {
  return (
    <main className="md-center">
      <section className="md-panel md-stack md-auth">
        <p className="md-brand">MDMS <span>Meter Data Management System</span></p>
        <Outlet />
      </section>
    </main>
  );
}

const enterprisePages = [
  { path: "dashboard", element: loadPage(<EnterpriseDashboard />) },
  { path: "zones", element: loadPage(<Zones />) },
  { path: "zones/:id", element: loadPage(<ZoneDetails />) },
  { path: "meters", element: loadPage(<EnterpriseMeters />) },
  { path: "users", element: loadPage(<EnterpriseUsers />) },
  { path: "reports", element: loadPage(<EnterpriseReports />) },
  { path: "alerts", element: loadPage(<EnterpriseAlerts />) },
  { path: "audit-logs", element: loadPage(<AuditLogs />) },
  { path: "settings", element: loadPage(<EnterpriseSettings />) },
];

const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    hydrateFallbackElement: <main className="md-center"><Loader /></main>,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: loadPage(<Login />) },
          { path: "forgot-password", element: loadPage(<ForgotPassword />) },
          { path: "reset-password/:token", element: loadPage(<ResetPassword />) },
        ],
      },
      {
        path: "zone",
        element: <Layout role="zone" />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", loader: dashboardLoader, element: loadPage(<ZoneDashboard />) },
          { path: "meters", loader: metersLoader, element: loadPage(<ZoneMeters />) },
          { path: "meters/:meterId", loader: meterDetailLoader, element: loadPage(<MeterDetails />) },
          { path: "users", loader: customersLoader, element: loadPage(<ZoneUsers />) },
          { path: "reports", loader: reportsLoader, element: loadPage(<ZoneReports />) },
          { path: "alerts", loader: alertsLoader, element: loadPage(<ZoneAlerts />) },
          { path: "settings", loader: settingsLoader, element: loadPage(<ZoneSettings />) },
        ],
      },
      {
        path: "enterprise",
        element: <Layout role="enterprise" />,
        children: [{ index: true, element: <Navigate to="dashboard" replace /> }, ...enterprisePages],
      },
      {
        path: "user",
        element: <Layout role="user" />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: loadPage(<UserDashboard />) },
        ],
      },
      // Keep the enterprise branch's older bookmarks working.
      ...enterprisePages.map(({ path }) => ({
        path,
        loader: ({ request }: { request: Request }) => {
          const url = new URL(request.url);
          return redirect("/enterprise" + url.pathname + url.search);
        },
      })),
      { path: "maintenance", element: <Maintenance /> },
      { path: "access-denied", element: <AccessDenied /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);


export function AppRouter() {
  return <RouterProvider router={router} />;
}
