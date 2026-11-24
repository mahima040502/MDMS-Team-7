import { Link, useLoaderData } from "react-router-dom";
import { Select } from "../../../shared/components/forms/Fields";
import { DataTable, PageHeader, StatusBadge } from "../../../shared/components/DataViews";
import { Filters, Pagination } from "../components/ZoneViews";
import { options } from "../components/formatting";
import { alertsLoader } from "../services/zoneLoaders";

export default function Alerts() {
  const { rows, total, page, status, severity } = useLoaderData<typeof alertsLoader>();
  return (
    <div className="md-stack">
      <PageHeader title="Alerts" description="Review alerts for meters in your zone." />
      <Filters key={status + "|" + severity}>
        <Select name="severity" label="Severity" defaultValue={severity}
          options={[{ value: "", label: "All severities" }, ...options(["Critical", "High", "Medium", "Low"])]} />
        <Select name="status" label="Status" defaultValue={status}
          options={[{ value: "", label: "All statuses" }, ...options(["Open", "In Progress", "Resolved"])]} />
      </Filters>
      <DataTable label="Alerts" rows={rows} columns={[
        { label: "Alert", cell: (alert) => <span title={alert.description}>{alert.title}</span> },
        { label: "Meter ID", cell: (alert) => <Link to={"/zone/meters/" + alert.meterId}>{alert.meterId}</Link> },
        { label: "Severity", cell: (alert) => <StatusBadge value={alert.severity} /> },
        { label: "Status", cell: (alert) => <StatusBadge value={alert.status} /> },
        { label: "Date", cell: (alert) => alert.createdAt.slice(0, 10) },
      ]} />
      <Pagination page={page} total={total} />
    </div>
  );
}
