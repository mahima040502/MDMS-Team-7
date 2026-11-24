import { faker } from "@faker-js/faker";
import fs from "node:fs";
import { addZoneDemoData } from "./add-zone-demo-data.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

faker.seed(2026);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "..", "db.json");

const randomItem = (items) => faker.helpers.arrayElement(items);

const randomDate = (daysAgo = 90) =>
  faker.date.recent({ days: daysAgo }).toISOString();

const today = new Date();

// =====================================
// 1. ZONES
// =====================================

const zoneNames = [
  "North Zone",
  "South Zone",
  "East Zone",
  "West Zone",
  "Central Zone",
  "Urban Zone",
  "Rural Zone",
  "Industrial Zone",
  "Residential Zone",
  "Commercial Zone",
];

const zones = zoneNames.map((name, index) => ({
  id: index + 1,
  zoneCode: `ZN${String(index + 1).padStart(3, "0")}`,
  name,
  city: faker.location.city(),
  state: faker.location.state(),
  country: "India",
  address: faker.location.streetAddress(),
  totalMeters: 0,
  status: randomItem(["Active", "Active", "Inactive"]),
  createdAt: randomDate(),
}));

// =====================================
// 2. USERS
// =====================================

const users = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  phone: faker.phone.number(),
  role: randomItem(["Admin", "Manager", "Operator", "Viewer"]),
  zoneId: randomItem(zones).id,
  status: randomItem(["Active", "Active", "Inactive"]),
  createdAt: randomDate(),
}));

// =====================================
// 3. METERS
// =====================================

const meters = Array.from({ length: 80 }, (_, index) => ({
  id: index + 1,
  meterNumber: `MDMS${String(index + 1).padStart(5, "0")}`,
  serialNumber: faker.string.alphanumeric(12).toUpperCase(),
  zoneId: randomItem(zones).id,
  consumerName: faker.person.fullName(),
  meterType: randomItem(["Smart", "Digital", "Prepaid"]),
  communicationType: randomItem(["GPRS", "RF", "NB-IoT", "4G"]),
  reading: faker.number.float({
    min: 100,
    max: 10000,
    fractionDigits: 2,
  }),
  status: randomItem(["Online", "Online", "Offline", "Maintenance"]),
  installationDate: randomDate(365),
  lastCommunication: randomDate(7),
}));

// Calculate zone meter counts

zones.forEach((zone) => {
  zone.totalMeters = meters.filter((meter) => meter.zoneId === zone.id).length;
});

// =====================================
// 4. BILLS
// =====================================

const bills = meters.map((meter, index) => {
  const units = faker.number.int({
    min: 50,
    max: 500,
  });

  const rate = 7;

  return {
    id: index + 1,
    billNumber: `BILL${String(index + 1).padStart(5, "0")}`,
    meterId: meter.id,
    zoneId: meter.zoneId,
    unitsConsumed: units,
    ratePerUnit: rate,
    amount: units * rate,
    billDate: randomDate(60),
    dueDate: faker.date.future().toISOString(),
    paymentStatus: randomItem(["Paid", "Pending", "Overdue"]),
  };
});

// =====================================
// 5. BILL DAYS
// =====================================

const billDays = [];

meters.forEach((meter) => {
  for (let day = 29; day >= 0; day--) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);

    billDays.push({
      id: billDays.length + 1,
      meterId: meter.id,
      zoneId: meter.zoneId,
      date: date.toISOString().split("T")[0],
      consumption: faker.number.float({
        min: 2,
        max: 30,
        fractionDigits: 2,
      }),
      unit: "kWh",
    });
  }
});

// =====================================
// 6. CHART SERIES
// =====================================

const chartSeries = Array.from({ length: 90 }, (_, index) => {
  const date = new Date(today);

  date.setDate(date.getDate() - (89 - index));

  return {
    id: index + 1,
    date: date.toISOString().split("T")[0],
    consumption: faker.number.int({
      min: 1000,
      max: 10000,
    }),
    revenue: faker.number.int({
      min: 10000,
      max: 100000,
    }),
    activeMeters: faker.number.int({
      min: 50,
      max: 80,
    }),
  };
});

// =====================================
// 7. ALERTS
// =====================================

const alerts = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  title: randomItem([
    "Meter Offline",
    "High Energy Consumption",
    "Communication Failure",
    "Low Voltage",
    "Tampering Detected",
    "Abnormal Reading",
  ]),
  description: faker.lorem.sentence(),
  meterId: randomItem(meters).id,
  zoneId: randomItem(zones).id,
  severity: randomItem(["Critical", "High", "Medium", "Low"]),
  status: randomItem(["Open", "In Progress", "Resolved"]),
  createdAt: randomDate(),
}));

// =====================================
// 8. NOTIFICATIONS
// =====================================

const notifications = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  userId: randomItem(users).id,
  title: randomItem([
    "New Bill Generated",
    "Meter Status Updated",
    "New Alert Received",
    "Zone Updated",
    "Payment Received",
  ]),
  message: faker.lorem.sentence(),
  isRead: faker.datatype.boolean(),
  createdAt: randomDate(),
}));

// =====================================
// 9. AUDIT LOGS
// =====================================

const auditLogs = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  userId: randomItem(users).id,
  userName: randomItem(users).name,
  action: randomItem(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"]),
  module: randomItem(["Zones", "Meters", "Users", "Bills", "Settings"]),
  description: faker.lorem.sentence(),
  ipAddress: faker.internet.ip(),
  timestamp: randomDate(),
}));

// =====================================
// 10. SETTINGS
// =====================================

const settings = [
  {
    id: 1,
    companyName: "MDMS Enterprise",
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD-MM-YYYY",
    language: "English",
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  },
];

// =====================================
// FINAL DATABASE
// =====================================

// Existing End-user services still use these three collections.
const dailyData = [
  {"id":"1","date":"2026-11-01","units":12.5},
  {"id":"2","date":"2026-11-02","units":14.2},
  {"id":"3","date":"2026-11-03","units":11.8},
];

const weeklyData = [
  {"id":"1","week":"Week 1","units":85.4},
  {"id":"2","week":"Week 2","units":92.1},
];

const monthlyData = [
  {"id":"1","month":"October","units":370.6},
  {"id":"2","month":"November","units":348.9},
];

const database = {
  dailyData,
  weeklyData,
  monthlyData,
  zones,
  users,
  meters,
  bills,
  billDays,
  chartSeries,
  alerts,
  notifications,
  auditLogs,
  settings,
};

addZoneDemoData(database);

// Write data into db.json

fs.writeFileSync(outputPath, JSON.stringify(database, null, 2), "utf-8");

console.log("=================================");
console.log("MDMS DATABASE GENERATED SUCCESSFULLY");
console.log("=================================");

Object.entries(database).forEach(([key, value]) => {
  console.log(`${key}: ${value.length} records`);
});

console.log("Database saved at:", outputPath);
