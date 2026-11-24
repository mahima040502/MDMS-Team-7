export type Role = "zone" | "enterprise" | "user";

export const roleTitles: Record<Role, string> = {
  zone: "Zone admin",
  enterprise: "Enterprise",
  user: "End-user",
};

export const roleMenus: Record<Role, [string, string][]> = {
  zone: [
    ["Dashboard", "/zone/dashboard"],
    ["Meter Management", "/zone/meters"],
    ["User Management", "/zone/users"],
    ["Reports & Analytics", "/zone/reports"],
    ["Alerts", "/zone/alerts"],
    ["Settings", "/zone/settings"],
  ],
  enterprise: [
    ["Dashboard", "/enterprise/dashboard"],
    ["Zone Management", "/enterprise/zones"],
    ["Meter Management", "/enterprise/meters"],
    ["User & Role Management", "/enterprise/users"],
    ["Reports & Analytics", "/enterprise/reports"],
    ["Alerts", "/enterprise/alerts"],
    ["Audit Logs", "/enterprise/audit-logs"],
    ["Settings", "/enterprise/settings"],
  ],
  user: [["Dashboard", "/user/dashboard"]],
};
