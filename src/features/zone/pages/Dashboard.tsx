import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { dashboardLoader } from "../services/zoneLoaders";
import { PageHeader, StatCard } from "../../../shared/components/DataViews";
import { usageFormat } from "../components/formatting";
import UsageChart from "../components/UsageChart";

export default function Dashboard() {
  const { zone, activeCount, pendingCount, usage } = useLoaderData<typeof dashboardLoader>();
  const [range, setRange] = useState<"Week" | "Month">("Week");

  const latestMonth = usage.at(-1)?.date.slice(0, 7);
  const currentMonth = usage.filter((point) => point.date.startsWith(latestMonth ?? ""));
  const average = usage.length ? usage.reduce((sum, point) => sum + point.consumption, 0) / usage.length : 0;
  const currentAverage = currentMonth.length
    ? currentMonth.reduce((sum, point) => sum + point.consumption, 0) / currentMonth.length : 0;
  const comparison = average ? Math.round(((currentAverage - average) / average) * 100) : 0;

  return (
    <div className="md-stack">
      <PageHeader title="Zone dashboard" description={zone.name}>
        <Link className="md-secondary" to="/zone/meters?add=1">Add meter</Link>
        <Link className="md-button" to="/zone/reports?generate=1">Generate report</Link>
      </PageHeader>
      <div className="md-stats">
        <StatCard label="Active meters" value={activeCount} hint="Meters currently online" />
        <StatCard label="Average daily usage" value={usage.length ? usageFormat.format(currentAverage) + " kWh" : "—"}
          hint={usage.length ? (comparison >= 0 ? "+" : "") + comparison + "% this month vs. the available daily average" : "No readings available"} />
        <StatCard label="Pending alerts" value={pendingCount} hint="Open or in progress" />
      </div>
      <UsageChart title="Zone consumption" usage={usage.slice(range === "Week" ? -7 : -30)}>
        <div className="md-actions" aria-label="Consumption time range" role="group">
          <button type="button" className="md-secondary" aria-pressed={range === "Week"} onClick={() => setRange("Week")}>Week</button>
          <button type="button" className="md-secondary" aria-pressed={range === "Month"} onClick={() => setRange("Month")}>Month</button>
        </div>
      </UsageChart>
    </div>
  );
}
