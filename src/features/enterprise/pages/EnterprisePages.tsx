
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

import API from "../../../services/http";

type Row = { id: string | number } & Record<string, string | number | boolean | undefined>;

async function getData<T>(endpoint: string, signal?: AbortSignal) {
  const response = await API.get<T>(endpoint, { signal });
  return response.data;
}

function useCollection(endpoint: string) {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getData<Row[]>(endpoint, controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setData(rows);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("Unable to load data. Check whether JSON Server is running.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint, revision]);

  function refresh() {
    setLoading(true);
    setError("");
    setRevision((value) => value + 1);
  }

  return { data, loading, error, refresh };
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "24px",
    color: "#1e293b",
    fontFamily: "Arial, sans-serif"
  },
  heading: {
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "6px"
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "24px"
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "20px"
  },
  value: {
    fontSize: "27px",
    fontWeight: 700,
    marginTop: "10px"
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px"
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    minWidth: "200px"
  },
  button: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white"
  },
  th: {
    padding: "13px",
    textAlign: "left",
    background: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0"
  },
  td: {
    padding: "13px",
    borderBottom: "1px solid #e2e8f0"
  }
};

function PageHeader({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h1 style={styles.heading}>{title}</h1>
      <p style={styles.subtitle}>{description}</p>
    </>
  );
}

function StatCard({
  title,
  value,
  color = "#2563eb"
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div style={styles.card}>
      <div style={{ color: "#64748b", fontSize: "14px" }}>
        {title}
      </div>
      <div style={{ ...styles.value, color }}>{value}</div>
    </div>
  );
}

function Status({ value }: { value: Row[string] }) {
  const text = String(value ?? "Unknown");
  const active = ["active", "online", "resolved", "paid"].includes(
    text.toLowerCase()
  );

  return (
    <span
      style={{
        padding: "5px 10px",
        borderRadius: "20px",
        background: active ? "#dcfce7" : "#fef3c7",
        color: active ? "#166534" : "#92400e",
        fontSize: "12px"
      }}
    >
      {text}
    </span>
  );
}

function DataTable({
  endpoint,
  title,
  description,
  columns,
  searchable = true,
  addable = false
}: {
  endpoint: string;
  title: string;
  description: string;
  columns: string[];
  searchable?: boolean;
  addable?: boolean;
}) {
  const { data, loading, error, refresh } = useCollection(endpoint);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(columns[0]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("all");

  const pageSize = 8;

  const filtered = data.filter((item) => {
    const matchesSearch = !searchable ||
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase());

    const status = String(item.status ?? item.severity ?? "").toLowerCase();
    const matchesFilter = filter === "all" || status === filter;

    return matchesSearch && matchesFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    const x = String(a[sort] ?? "").toLowerCase();
    const y = String(b[sort] ?? "").toLowerCase();
    return order === "asc" ? x.localeCompare(y) : y.localeCompare(x);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);

  const [preview, setPreview] = useState("");

  function addRecord() {
    const name = window.prompt("Enter name:");
    if (name?.trim()) setPreview("Add preview ready for " + name.trim() + ".");
  }

  return (
    <div style={styles.page}>
      <PageHeader title={title} description={description} />

      <div style={styles.toolbar}>
        {searchable && (
          <input
            style={styles.input}
            placeholder="Search records..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        )}

        <select
          style={styles.input}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Records</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button
          style={styles.button}
          onClick={() => {
            setOrder(order === "asc" ? "desc" : "asc");
          }}
        >
          Sort: {order}
        </button>

        {addable && (
          <button style={styles.button} onClick={addRecord}>
            + Add New
          </button>
        )}

        <button style={styles.button} onClick={refresh}>
          Refresh
        </button>
      </div>

      {preview && <p role="status">{preview}</p>}
      {loading && <p>Loading records...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      style={{ ...styles.th, cursor: "pointer" }}
                      onClick={() => {
                        if (sort === column) {
                          setOrder(order === "asc" ? "desc" : "asc");
                        } else {
                          setSort(column);
                          setOrder("asc");
                        }
                      }}
                    >
                      {column.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visible.map((item, index) => (
                  <tr key={item.id ?? index}>
                    {columns.map((column) => (
                      <td key={column} style={styles.td}>
                        {column.toLowerCase().includes("status") ||
                        column.toLowerCase().includes("severity") ? (
                          <Status value={item[column]} />
                        ) : (
                          String(item[column] ?? "-")
                        )}
                      </td>
                    ))}

                  </tr>
                ))}

                {visible.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={columns.length}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ ...styles.toolbar, marginTop: "18px" }}>
            <span>
              Showing {visible.length} of {filtered.length} records
            </span>

            <button
              style={styles.button}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span>Page {page} of {totalPages}</span>

            <button
              style={styles.button}
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 1. DASHBOARD

export function Dashboard() {
  const zones = useCollection("zones");
  const meters = useCollection("meters");
  const users = useCollection("users");
  const alerts = useCollection("alerts");
  const bills = useCollection("bills");

  const consumption = bills.data.reduce(
    (sum, bill) => sum + Number(bill.consumption ?? bill.units ?? 0),
    0
  );

  const chartData = [
    { name: "Zones", value: zones.data.length },
    { name: "Meters", value: meters.data.length },
    { name: "Users", value: users.data.length },
    { name: "Alerts", value: alerts.data.length }
  ];

  const meterStatus = [
    {
      name: "Online",
      value: meters.data.filter(
        (m) => String(m.status).toLowerCase() === "online"
      ).length
    },
    {
      name: "Offline",
      value: meters.data.filter(
        (m) => String(m.status).toLowerCase() === "offline"
      ).length
    }
  ];

  const COLORS = ["#2563eb", "#f97316"];

  return (
    <div style={styles.page}>
      <PageHeader
        title="Enterprise Dashboard"
        description="Monitor your entire Meter Data Management System."
      />

      <div style={styles.cards}>
        <StatCard title="Total Zones" value={zones.data.length} />
        <StatCard title="Total Meters" value={meters.data.length} color="#16a34a" />
        <StatCard title="Total Users" value={users.data.length} color="#9333ea" />
        <StatCard title="Total Alerts" value={alerts.data.length} color="#dc2626" />
        <StatCard title="Total Consumption" value={`${consumption.toLocaleString()} kWh`} />
      </div>

      {[zones, meters, users, alerts, bills].some((item) => item.loading) && (
        <p>Loading dashboard...</p>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
        gap: "20px"
      }}>
        <div style={styles.card}>
          <h3>Enterprise Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3>Meter Connectivity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={meterStatus}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {meterStatus.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// 2. ZONE MANAGEMENT

export function Zones() {
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useCollection("zones");

  return (
    <div style={styles.page}>
      <PageHeader
        title="Zone Management"
        description="Manage geographical zones and their associated meters."
      />

      <div style={styles.cards}>
        <StatCard title="Total Zones" value={data.length} />
        <StatCard
          title="Active Zones"
          value={data.filter(z => String(z.status).toLowerCase() === "active").length}
          color="#16a34a"
        />
      </div>

      <button style={styles.button} onClick={refresh}>Refresh</button>

      {loading && <p>Loading zones...</p>}
      {error && <p>{error}</p>}

      <div style={{ overflowX: "auto", marginTop: "18px" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["id", "name", "city", "status", "actions"].map(c => (
                <th style={styles.th} key={c}>{c.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(zone => (
              <tr key={zone.id}>
                <td style={styles.td}>{zone.id}</td>
                <td style={styles.td}>{zone.name}</td>
                <td style={styles.td}>{zone.city ?? zone.location ?? "-"}</td>
                <td style={styles.td}><Status value={zone.status} /></td>
                <td style={styles.td}>
                  <button
                    style={styles.button}
                    onClick={() => navigate(`/enterprise/zones/${zone.id}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. ZONE DETAILS

export function ZoneDetails() {
  const { id } = useParams();
  const [zone, setZone] = useState<Row | null>(null);
  const [meters, setMeters] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [zoneData, meterData] = await Promise.all([
          getData<Row>(`zones/${id}`),
          getData<Row[]>(`meters?zoneId=${id}`)
        ]);
        setZone(zoneData);
        setMeters(meterData);
      } catch {
        setZone(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div style={styles.page}>Loading zone details...</div>;

  if (!zone) {
    return <div style={styles.page}>Zone not found.</div>;
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title={String(zone.name ?? "Zone Details")}
        description={`Detailed information for Zone ID: ${id}`}
      />

      <div style={styles.cards}>
        <StatCard title="Zone ID" value={zone.id} />
        <StatCard title="City" value={String(zone.city ?? zone.location ?? "-")} />
        <StatCard title="Status" value={String(zone.status ?? "Unknown")} />
        <StatCard title="Associated Meters" value={meters.length} />
      </div>

      <h3>Zone Information</h3>
      <div style={styles.card}>
        {Object.entries(zone).map(([key, value]) => (
          <p key={key}>
            <strong>{key}:</strong> {String(value ?? "-")}
          </p>
        ))}
      </div>

      <h3>Associated Meters</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["id", "serialNumber", "status", "type"].map(c => (
                <th style={styles.th} key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meters.map(meter => (
              <tr key={meter.id}>
                {["id", "serialNumber", "status", "type"].map(c => (
                  <td style={styles.td} key={c}>
                    {String(meter[c] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 4. METER MANAGEMENT

export function Meters() {
  return (
    <DataTable
      endpoint="meters"
      title="Meter Management"
      description="Monitor, search and manage smart meters."
      columns={["id", "serialNumber", "zoneId", "status", "type"]}
      addable
    />
  );
}

// 5. USER AND ROLE MANAGEMENT

export function Users() {
  return (
    <DataTable
      endpoint="users"
      title="User & Role Management"
      description="Manage enterprise users and their access roles."
      columns={["id", "name", "email", "role", "status"]}
      addable
    />
  );
}

// 6. REPORTS AND ANALYTICS

export function Reports() {
  const bills = useCollection("bills");
  const days = useCollection("billDays");
  const chartSeries = useCollection("chartSeries");

  const totalRevenue = bills.data.reduce(
    (sum, bill) => sum + Number(bill.amount ?? bill.totalAmount ?? 0), 0
  );

  const totalConsumption = bills.data.reduce(
    (sum, bill) => sum + Number(bill.consumption ?? bill.units ?? 0), 0
  );

  const seriesData = chartSeries.data.map((item) => ({
    name: item.name ?? item.date ?? item.label ?? "Data",
    consumption: Number(item.consumption ?? item.value ?? 0),
    revenue: Number(item.revenue ?? 0)
  }));

  const dailyData = days.data.map((item) => ({
    name: item.date ?? item.day ?? item.id,
    consumption: Number(item.consumption ?? item.units ?? 0)
  }));

  return (
    <div style={styles.page}>
      <PageHeader
        title="Reports & Analytics"
        description="Analyze billing, energy consumption and business performance."
      />

      <div style={styles.cards}>
        <StatCard title="Total Bills" value={bills.data.length} />
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="#16a34a" />
        <StatCard title="Total Consumption" value={`${totalConsumption.toLocaleString()} kWh`} />
        <StatCard title="Daily Records" value={days.data.length} />
      </div>

      <div style={styles.card}>
        <h3>Energy Consumption Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData.length ? dailyData : seriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ ...styles.card, marginTop: "20px" }}>
        <h3>Revenue Analytics</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={seriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 7. ALERT MANAGEMENT

export function Alerts() {
  return (
    <DataTable
      endpoint="alerts"
      title="Alerts Management"
      description="Track critical notifications and system alerts."
      columns={["id", "title", "severity", "status"]}
    />
  );
}

// 8. AUDIT LOGS

export function AuditLogs() {
  return (
    <DataTable
      endpoint="auditLogs"
      title="Audit Logs"
      description="Track user actions and maintain an activity history."
      columns={["id", "user", "action", "timestamp"]}
    />
  );
}

// 9. SETTINGS

export function Settings() {
  const { data, loading, error } = useCollection("settings?id=1");
  const [draft, setDraft] = useState<Partial<Row>>({});
  const [validated, setValidated] = useState(false);
  const values = { ...data[0], ...draft };

  function handleChange(key: string, value: string) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setValidated(false);
  }

  if (loading) return <div style={styles.page}>Loading settings...</div>;
  if (error) return <div style={styles.page}>{error}</div>;

  return (
    <div style={styles.page}>
      <PageHeader
        title="System Settings"
        description="Configure your MDMS enterprise application."
      />

      <div style={{ ...styles.card, maxWidth: "650px" }}>
        <h3>General Configuration</h3>

        {Object.entries(values)
          .filter(([key]) => key !== "id")
          .map(([key, value]) => (
            <div key={key} style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", marginBottom: "7px" }}>
                {key}
              </label>
              <input
                style={{ ...styles.input, width: "90%" }}
                value={String(value ?? "")}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}

        <button style={styles.button} onClick={() => setValidated(true)}>
          Preview settings
        </button>
        {validated && <p role="status">Settings preview ready.</p>}
      </div>
    </div>
  );
}
