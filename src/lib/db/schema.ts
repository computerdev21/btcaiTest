import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Define your existing notes table
export const $notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  imageUrl: text("imageUrl"),
  userId: text("user_id").notNull(),
  editorState: text("editor_state"),
});

// Define the new exchangeSecrets table
export const $exchangeSecrets = pgTable("exchange_secrets", {
  id: serial("id").primaryKey(),  // Unique identifier for the entry
  userId: text("user_id").notNull(),  // Reference to the user
  apiKey: text("api_key").notNull(),  // Coinbase API key
  apiSecret: text("api_secret").notNull(),  // Coinbase API secret
  createdAt: timestamp("created_at").notNull().defaultNow(),  // Timestamp for creation
});

// Define the types for the tables
export type NoteType = typeof $notes.$inferInsert;
export type ExchangeSecretType = typeof $exchangeSecrets.$inferInsert;
