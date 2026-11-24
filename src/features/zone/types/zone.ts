export type Zone = { id: number; name: string };
export type MeterStatus = "Online" | "Offline" | "Maintenance";

export type Meter = {
  id: number;
  meterNumber: string;
  zoneId: number;
  ownerId: number;
  consumerName: string;
  status: MeterStatus;
  reading: number;
  installationDate: string;
  tariffCategory: string;
  address: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
};

export type Reading = {
  id: number;
  meterId: number;
  date: string;
  reading: number;
  consumption: number;
};

export type ZoneAlert = {
  id: number;
  title: string;
  description: string;
  meterId: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
};

export type ZoneSettings = {
  id: number;
  highConsumption: number;
  lowConsumption: number;
  abnormalReadingsPerDay: number;
  inactiveMeterHours: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export type UsagePoint = { date: string; consumption: number };
