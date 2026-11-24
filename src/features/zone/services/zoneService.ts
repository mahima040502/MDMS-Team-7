import API from "../../../services/http";
import type { Customer, Meter, Reading, Zone, ZoneAlert, ZoneSettings } from "../types/zone";

// Because Phase 1 has no sign-in, all zone pages use the same demo zone.
const demoZoneId = 1;
export const pageSize = 8;
type Query = Record<string, number | string | string[] | undefined>;

async function getCollection<T>(path: string, signal: AbortSignal, filters: Query = {}) {
  const response = await API.get<T[]>(path, { signal, params: { ...filters, zoneId: demoZoneId }, paramsSerializer: { indexes: null } });
  return response.data;
}

async function getPage<T>(path: string, signal: AbortSignal, page: number, filters: Query) {
  const response = await API.get<T[]>(path, {
    signal,
    params: { ...filters, zoneId: demoZoneId, _page: page, _limit: pageSize },
  });
  return { rows: response.data, total: Number(response.headers["x-total-count"] ?? response.data.length) };
}

export async function getZone(signal: AbortSignal) {
  const response = await API.get<Zone>("/zones/" + demoZoneId, { signal });
  return response.data;
}

export function getMeters(signal: AbortSignal, filters?: Query) {
  return getCollection<Meter>("/meters", signal, filters);
}

export function getMeterPage(signal: AbortSignal, page: number, search: string, status: string) {
  return getPage<Meter>("/meters", signal, page, {
    q: search || undefined, status: status || undefined, _sort: "meterNumber",
  });
}

export function getCustomers(signal: AbortSignal, filters?: Query) {
  return getCollection<Customer>("/users", signal, { ...filters, role: "Customer", _sort: "name" });
}

export function getCustomerPage(signal: AbortSignal, page: number, search: string) {
  return getPage<Customer>("/users", signal, page, {
    q: search || undefined, role: "Customer", _sort: "name",
  });
}

export function getReadings(signal: AbortSignal, filters?: Query) {
  return getCollection<Reading>("/billDays", signal, { ...filters, _sort: "date" });
}

export function getAlerts(signal: AbortSignal, filters?: Query) {
  return getCollection<ZoneAlert>("/alerts", signal, filters);
}

export function getAlertPage(signal: AbortSignal, page: number, severity: string, status: string) {
  return getPage<ZoneAlert>("/alerts", signal, page, {
    severity: severity || undefined, status: status || undefined, _sort: "createdAt", _order: "desc",
  });
}

export async function getSettings(signal: AbortSignal) {
  const [settings] = await getCollection<ZoneSettings>("/settings", signal);
  if (!settings) throw new Response("Zone settings were not found.", { status: 404 });
  return settings;
}
