import { integer, varchar } from "drizzle-orm/pg-core";
import {pgTable} from "drizzle-orm/pg-core/table";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
