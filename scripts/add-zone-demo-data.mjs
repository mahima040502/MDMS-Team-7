const demoCustomers = [
  "Aditi Rao", "Kiran Shetty", "Neha Bhat", "Rohan Pai", "Diya Hegde", "Arjun Nayak",
  "Maya Kamath", "Nikhil Prabhu", "Isha Shenoy", "Varun Kini", "Ananya Acharya", "Dev Poojary",
];

// Enrich the team's seed data without replacing its IDs or existing collections.
export function addZoneDemoData(database) {
  const { zones, users, meters, billDays, alerts, settings } = database;
  let nextUserId = Math.max(...users.map((user) => user.id)) + 1;
  let nextMeterId = Math.max(...meters.map((meter) => meter.id)) + 1;
  let nextReadingId = Math.max(...billDays.map((day) => day.id)) + 1;
  let nextSettingId = Math.max(...settings.map((setting) => setting.id)) + 1;
  const sampleDays = billDays.filter((day) => day.meterId === meters[0].id);

  for (const zone of zones) {
    const zoneMeters = meters.filter((meter) => meter.zoneId === zone.id);
    while (zoneMeters.length < 13) {
      const template = zoneMeters[0] ?? meters[0];
      const id = nextMeterId++;
      const meter = {
        ...template,
        id,
        zoneId: zone.id,
        meterNumber: "MDMS" + String(id).padStart(5, "0"),
        serialNumber: "ZONEDEMO" + String(id).padStart(4, "0"),
        reading: 720 + id * 13,
        status: "Online",
      };
      meters.push(meter);
      zoneMeters.push(meter);
      for (const day of sampleDays) {
        billDays.push({
          ...day,
          id: nextReadingId++,
          meterId: id,
          zoneId: zone.id,
          consumption: Number((day.consumption * (0.75 + (id % 8) / 10)).toFixed(2)),
        });
      }
    }
    zone.totalMeters = zoneMeters.length;

    const customers = demoCustomers.map((name, index) => ({
      id: nextUserId++,
      name,
      email: "customer-" + zone.id + "-" + (index + 1) + "@example.com",
      phone: "+91 90000 " + String(zone.id * 100 + index).padStart(5, "0"),
      role: "Customer",
      zoneId: zone.id,
      status: index === 10 ? "Inactive" : "Active",
      createdAt: zone.createdAt,
    }));
    users.push(...customers);

    const admin = users.find((user) => user.zoneId === zone.id && user.role === "Admin");
    if (admin) zone.adminId = admin.id;
    else {
      const id = nextUserId++;
      users.push({
        id, name: zone.name + " Admin", email: "zone-admin-" + zone.id + "@example.com",
        phone: "+91 90001 " + String(zone.id).padStart(5, "0"),
        role: "Admin", zoneId: zone.id, status: "Active", createdAt: zone.createdAt,
      });
      zone.adminId = id;
    }

    zoneMeters.forEach((meter, index) => {
      const owner = customers[index % customers.length];
      meter.ownerId = owner.id;
      meter.consumerName = owner.name;
      meter.address = (index + 1) + " " + zone.address;
      meter.tariffCategory = index % 5 === 4 ? "Commercial" : "Residential";

      // Walk back from the latest cumulative reading using each day's usage.
      const days = billDays.filter((day) => day.meterId === meter.id)
        .sort((first, second) => second.date.localeCompare(first.date));
      const usage = days.reduce((total, day) => total + day.consumption, 0);
      meter.reading = Math.max(meter.reading, Math.ceil(usage));
      let reading = meter.reading;
      for (const day of days) {
        day.reading = Number(reading.toFixed(2));
        reading -= day.consumption;
      }
    });

    settings.push({
      id: nextSettingId++, zoneId: zone.id, highConsumption: 30, lowConsumption: 2,
      abnormalReadingsPerDay: 3, inactiveMeterHours: 24,
      emailNotifications: true, smsNotifications: false,
    });
  }

  const meterById = new Map(meters.map((meter) => [meter.id, meter]));
  for (const alert of alerts) {
    const meter = meterById.get(alert.meterId);
    if (meter) alert.zoneId = meter.zoneId;
  }
}
