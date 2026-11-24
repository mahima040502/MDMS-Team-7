import type { LoaderFunctionArgs } from "react-router-dom";
import { getAlertPage, getAlerts, getCustomerPage, getCustomers, getMeterPage, getMeters,
  getReadings, getSettings, getZone, pageSize } from "./zoneService";
import type { Reading } from "../types/zone";

function listParams(request: Request) {
  const query = new URL(request.url).searchParams;
  const requestedPage = Number(query.get("page"));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  return { query, page, search: query.get("q")?.trim() ?? "" };
}

export function dailyUsage(readings: Reading[]) {
  const totals = new Map<string, number>();
  for (const reading of readings) {
    totals.set(reading.date, (totals.get(reading.date) ?? 0) + reading.consumption);
  }
  return Array.from(totals, ([date, consumption]) => ({ date, consumption: Number(consumption.toFixed(2)) }));
}

export async function dashboardLoader({ request }: LoaderFunctionArgs) {
  const { signal } = request;
  const [zone, meters, alerts, readings] = await Promise.all([
    getZone(signal), getMeters(signal, { status: "Online" }),
    getAlerts(signal, { status_ne: "Resolved" }), getReadings(signal),
  ]);
  return { zone, activeCount: meters.length, pendingCount: alerts.length, usage: dailyUsage(readings) };
}

export async function metersLoader({ request }: LoaderFunctionArgs) {
  const { query, page, search } = listParams(request);
  const { signal } = request;
  const status = query.get("status") ?? "";
  const editId = query.get("edit");
  const showingForm = query.has("add") || Boolean(editId);
  const [results, customers, editing] = await Promise.all([
    getMeterPage(signal, page, search, status),
    showingForm ? getCustomers(signal) : [],
    editId ? getMeters(signal, { id: editId }) : [],
  ]);
  if (editId && !editing.length) throw new Response("Meter not found.", { status: 404 });
  return { ...results, customers, editing: editing[0], showingForm, page, search, status };
}

export async function meterDetailLoader({ request, params }: LoaderFunctionArgs) {
  const { signal } = request;
  const [meter] = await getMeters(signal, { id: params.meterId });
  if (!meter) throw new Response("Meter not found.", { status: 404 });
  const readings = await getReadings(signal, { meterId: meter.id });
  return { meter, readings };
}

export async function customersLoader({ request }: LoaderFunctionArgs) {
  const { query, page, search } = listParams(request);
  const { signal } = request;
  const customerId = query.get("customer");
  const [results, selected] = await Promise.all([
    getCustomerPage(signal, page, search),
    customerId ? getCustomers(signal, { id: customerId }) : [],
  ]);
  if (customerId && !selected.length) throw new Response("Customer not found.", { status: 404 });
  const customer = selected[0];
  const ownerIds = new Set(results.rows.map((row) => String(row.id)));
  if (customer) ownerIds.add(String(customer.id));
  const meters = ownerIds.size ? await getMeters(signal, { ownerId: [...ownerIds] }) : [];
  return { ...results, customer, meters, page, search };
}

function dateParam(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

export async function reportsLoader({ request }: LoaderFunctionArgs) {
  const { query } = listParams(request);
  const { signal } = request;
  const start = dateParam(query.get("start"));
  const end = dateParam(query.get("end"));
  const meterId = query.get("meter") ?? "";
  const dateError = start && end && start > end ? "End date must be on or after the start date." : "";
  const [meters, readings] = await Promise.all([
    getMeters(signal, { _sort: "meterNumber" }),
    dateError ? [] : getReadings(signal, { date_gte: start || undefined, date_lte: end || undefined,
      meterId: meterId || undefined }),
  ]);
  return { meters, readings, usage: dailyUsage(readings), start, end, meterId, dateError };
}

export async function alertsLoader({ request }: LoaderFunctionArgs) {
  const { query, page } = listParams(request);
  const severity = query.get("severity") ?? "";
  const status = query.get("status") ?? "";
  const results = await getAlertPage(request.signal, page, severity, status);
  return { ...results, page, severity, status };
}

export function settingsLoader({ request }: LoaderFunctionArgs) {
  return getSettings(request.signal);
}

export { pageSize };
