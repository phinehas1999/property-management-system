import {
  pgTable,
  serial,
  text,
  varchar,
  numeric,
  timestamp,
  integer,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

// 🧱 Define enum first
export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "occupied",
  "under_maintenance",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "Pending",
  "In Progress",
  "Done",
]);

// 🧍 Tenants table first (so properties can reference it)
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  rent: integer("rent").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  moveIn: date("move_in").notNull(),
  moveOut: date("move_out").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 🏠 Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }).notNull(),
  status: propertyStatusEnum("status").default("available").notNull(),

  // ✅ Proper foreign key link to tenants.id (integer → integer)
  tenantId: integer("tenant_id").references(() => tenants.id, {
    onDelete: "set null",
  }), // prevents delete crash

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  datePaid: date("date_paid").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  task: text("task").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  status: maintenanceStatusEnum("status").default("Pending").notNull(),
  dueDate: date("due_date"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});