import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

export default defineConfig({
  dialect: 'postgresql',  // Specify the dialect
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // Use `url` for database connection
  },
  schema: './src/lib/db/schema.ts',  // Path to your schema file
  out: './drizzle/migrations',       // Directory to output migration files
});
