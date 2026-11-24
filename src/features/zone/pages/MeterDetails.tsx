import { Link, useLoaderData } from "react-router-dom";
import { dailyUsage, meterDetailLoader } from "../services/zoneLoaders";
import { DataTable, PageHeader, StatusBadge } from "../../../shared/components/DataViews";
import { usageFormat } from "../components/formatting";
import UsageChart from "../components/UsageChart";

export default function MeterDetails() {
  const { meter, readings } = useLoaderData<typeof meterDetailLoader>();
  return (
    <div className="md-stack">
      <PageHeader title={meter.meterNumber} description="Meter details">
        <Link className="md-secondary" to="/zone/meters">Back to meters</Link>
      </PageHeader>
      <dl className="md-panel md-detail-grid">
        <div><dt>Owner</dt><dd>{meter.consumerName}</dd></div>
        <div><dt>Installation address</dt><dd>{meter.address}</dd></div>
        <div><dt>Status</dt><dd><StatusBadge value={meter.status} /></dd></div>
        <div><dt>Installed date</dt><dd>{meter.installationDate.slice(0, 10)}</dd></div>
        <div><dt>Tariff category</dt><dd>{meter.tariffCategory}</dd></div>
        <div><dt>Last reading</dt><dd>{usageFormat.format(meter.reading)} kWh</dd></div>
      </dl>
      <UsageChart title="Daily meter usage" usage={dailyUsage(readings)} />
      <h2>Recent readings</h2>
      <DataTable label="Readings" rows={readings.slice(-10).reverse()} columns={[
        { label: "Date", cell: (reading) => reading.date },
        { label: "Cumulative reading (kWh)", cell: (reading) => usageFormat.format(reading.reading) },
        { label: "Usage (kWh)", cell: (reading) => usageFormat.format(reading.consumption) },
      ]} />
    </div>
  );
}
