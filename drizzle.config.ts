import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_DATABASE,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
