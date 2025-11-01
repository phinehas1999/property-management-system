import { pgTable, serial, text, numeric, varchar, timestamp, integer, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const propertyStatus = pgEnum("property_status", ['available', 'occupied', 'under_maintenance'])


export const properties = pgTable("properties", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	address: text().notNull(),
	rentAmount: numeric("rent_amount", { precision: 10, scale:  2 }).notNull(),
	status: propertyStatus().default('available').notNull(),
	tenantId: varchar("tenant_id", { length: 255 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tenants = pgTable("tenants", {
	id: serial().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	rent: integer().notNull(),
	status: varchar({ length: 50 }).notNull(),
	moveIn: date("move_in").notNull(),
	moveOut: date("move_out").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});
