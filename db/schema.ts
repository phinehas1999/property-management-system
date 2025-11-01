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
