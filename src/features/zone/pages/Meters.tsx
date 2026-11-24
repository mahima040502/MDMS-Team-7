import { useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { Input, Select } from "../../../shared/components/forms/Fields";
import { metersLoader } from "../services/zoneLoaders";
import { DataTable, PageHeader, StatusBadge } from "../../../shared/components/DataViews";
import { Filters, Pagination } from "../components/ZoneViews";
import { options, usageFormat } from "../components/formatting";
import MeterForm from "../components/MeterForm";
import type { Meter } from "../types/zone";

export default function Meters() {
  const { rows, total, customers, editing, showingForm, page, search, status } = useLoaderData<typeof metersLoader>();
  const [params, setParams] = useSearchParams();
  const [notice, setNotice] = useState("");

  function editLink(name: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete("add");
    next.delete("edit");
    next.set(name, value);
    return "?" + next.toString();
  }

  function closeForm() {
    const next = new URLSearchParams(params);
    next.delete("add");
    next.delete("edit");
    setParams(next, { replace: true });
  }

  function previewStatus(meter: Meter) {
    if (window.confirm((meter.status === "Online" ? "Preview deactivation for " : "Preview activation for ")
      + meter.meterNumber + "?")) {
      setNotice("Status change previewed for " + meter.meterNumber + ". The current status is " + meter.status + ".");
    }
  }

  return (
    <div className="md-stack">
      <PageHeader title="Meter management" description="Find and review meters in your zone.">
        <Link className="md-button" to={editLink("add", "1")}>Add meter</Link>
      </PageHeader>
      <Filters key={search + "|" + status}>
        <Input name="q" label="Search meters" type="search" defaultValue={search} />
        <Select name="status" label="Status" defaultValue={status}
          options={[{ value: "", label: "All statuses" }, ...options(["Online", "Offline", "Maintenance"])]} />
      </Filters>
      {notice && <p role="status">{notice}</p>}
      <DataTable label="Meters" rows={rows} columns={[
        { label: "Meter ID", cell: (meter) => meter.meterNumber },
        { label: "Owner", cell: (meter) => meter.consumerName },
        { label: "Status", cell: (meter) => <StatusBadge value={meter.status} /> },
        { label: "Last reading", cell: (meter) => usageFormat.format(meter.reading) + " kWh" },
        { label: "Actions", cell: (meter) => (
          <details className="md-row-actions">
            <summary aria-label={"Actions for " + meter.meterNumber}>Actions</summary>
            <Link to={"/zone/meters/" + meter.id}>View details</Link>
            <Link to={editLink("edit", String(meter.id))}>Edit</Link>
            <button type="button" onClick={() => previewStatus(meter)}>
              {meter.status === "Online" ? "Deactivate" : "Activate"}
            </button>
          </details>
        ) },
      ]} />
      <Pagination page={page} total={total} />
      {showingForm && <MeterForm key={editing?.id ?? "add"} meter={editing} customers={customers} close={closeForm} />}
    </div>
  );
}
