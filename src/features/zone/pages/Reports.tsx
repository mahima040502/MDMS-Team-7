import { useLoaderData, useNavigation, useSearchParams } from "react-router-dom";
import { Input, Select } from "../../../shared/components/forms/Fields";
import { DataTable, PageHeader } from "../../../shared/components/DataViews";
import { Filters } from "../components/ZoneViews";
import { usageFormat } from "../components/formatting";
import UsageChart from "../components/UsageChart";
import { reportsLoader } from "../services/zoneLoaders";

export default function Reports() {
  const { meters, readings, usage, start, end, meterId, dateError } = useLoaderData<typeof reportsLoader>();
  const [params] = useSearchParams();
  const navigation = useNavigation();
  const summary = new Map<number, { usage: number; count: number }>();
  for (const reading of readings) {
    const previous = summary.get(reading.meterId) ?? { usage: 0, count: 0 };
    summary.set(reading.meterId, { usage: previous.usage + reading.consumption, count: previous.count + 1 });
  }
  const totals = meters.flatMap((meter) => {
    const entry = summary.get(meter.id);
    return entry ? [{ id: meter.id, number: meter.meterNumber, ...entry }] : [];
  });

  return (
    <div className="md-stack">
      <PageHeader title="Reports & analytics" description="Compare meter usage across the selected dates.">
        <button className="md-button" type="submit" form="report-filters" name="generate" value="1"
          disabled={navigation.state !== "idle"}>Generate report</button>
      </PageHeader>
      <Filters id="report-filters" key={[start, end, meterId].join("|")}>
        <Input name="start" type="date" label="Start date" defaultValue={start} />
        <Input name="end" type="date" label="End date" defaultValue={end} error={dateError || undefined} />
        <Select name="meter" label="Meter" defaultValue={meterId}
          options={[{ value: "", label: "All zone meters" },
            ...meters.map((meter) => ({ value: String(meter.id), label: meter.meterNumber }))]} />
      </Filters>
      {params.has("generate") && !dateError && (
        <p role="status">{totals.length ? "Report preview ready." : "No readings match the report filters."}</p>
      )}
      <UsageChart title="Energy usage over time" usage={usage} />
      <h2>Usage summary</h2>
      <DataTable label="Report rows" rows={totals} columns={[
        { label: "Meter ID", cell: (meter) => meter.number },
        { label: "Days with readings", cell: (meter) => meter.count },
        { label: "Total usage (kWh)", cell: (meter) => usageFormat.format(meter.usage) },
        { label: "Average daily usage (kWh)", cell: (meter) => usageFormat.format(meter.usage / meter.count) },
      ]} />
    </div>
  );
}
