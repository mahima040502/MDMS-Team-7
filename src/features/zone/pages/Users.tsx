import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { Input } from "../../../shared/components/forms/Fields";
import { customersLoader } from "../services/zoneLoaders";
import { DataTable, PageHeader, StatusBadge } from "../../../shared/components/DataViews";
import { Filters, Pagination } from "../components/ZoneViews";

export default function Users() {
  const { rows, total, search, page, customer, meters } = useLoaderData<typeof customersLoader>();
  const [current] = useSearchParams();

  function customerLink(id?: number) {
    const next = new URLSearchParams(current);
    if (id) next.set("customer", String(id));
    else next.delete("customer");
    return "?" + next.toString();
  }

  return (
    <div className="md-stack">
      <PageHeader title="User management" description="Review customers and their meters within your zone." />
      <Filters key={search}>
        <Input name="q" label="Search customers" type="search" defaultValue={search} />
      </Filters>
      <DataTable label="Customers" rows={rows} columns={[
        { label: "ID", cell: (person) => person.id },
        { label: "Name", cell: (person) => person.name },
        { label: "Email", cell: (person) => person.email },
        { label: "Phone", cell: (person) => person.phone },
        { label: "Meters", cell: (person) => meters.filter((meter) => meter.ownerId === person.id).length },
        { label: "Status", cell: (person) => <StatusBadge value={person.status} /> },
        { label: "Actions", cell: (person) => (
          <Link aria-label={"View " + person.name} to={customerLink(person.id)}>View</Link>
        ) },
      ]} />
      <Pagination page={page} total={total} />
      {customer && (
        <section className="md-panel md-stack" aria-label="Customer details">
          <div className="md-actions md-between">
            <h2>{customer.name}</h2>
            <Link to={customerLink()}>Close details</Link>
          </div>
          <dl className="md-detail-grid">
            <div><dt>Email</dt><dd>{customer.email}</dd></div>
            <div><dt>Phone</dt><dd>{customer.phone}</dd></div>
            <div><dt>Status</dt><dd><StatusBadge value={customer.status} /></dd></div>
          </dl>
          <h3>Customer meters</h3>
          <DataTable label="Customer meters" rows={meters.filter((meter) => meter.ownerId === customer.id)} columns={[
            { label: "Meter ID", cell: (meter) => <Link to={"/zone/meters/" + meter.id}>{meter.meterNumber}</Link> },
            { label: "Status", cell: (meter) => <StatusBadge value={meter.status} /> },
          ]} />
        </section>
      )}
    </div>
  );
}
