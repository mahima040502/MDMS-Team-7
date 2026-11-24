import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { UsagePoint } from "../types/zone";
import type { ReactNode } from "react";
import { usageFormat } from "./formatting";

export default function UsageChart({ title, usage, children }: {
  title: string; usage: UsagePoint[]; children?: ReactNode;
}) {
  return (
    <section className="md-panel md-chart">
      <div className="md-actions md-between"><h2>{title}</h2>{children}</div>
      {usage.length ? (
        <div className="md-chart-area">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={usage} accessibilityLayer margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--md-line)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(5)} stroke="var(--md-muted)" />
              <YAxis width={54} stroke="var(--md-muted)" unit=" kWh" />
              <Tooltip formatter={(value) => usageFormat.format(Number(value)) + " kWh"} />
              <Line dataKey="consumption" name="Consumption" stroke="var(--md-chart)" strokeWidth={2}
                dot={usage.length === 1} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="md-empty">No readings are available for this view.</p>}
    </section>
  );
}
