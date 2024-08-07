import { defineConfig } from 'drizzle-kit';

const config: any = defineConfig({
  schema: './database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST as string, 
    user: process.env.DB_USER as string, 
    password: process.env.DB_PASSWORD as string, 
    database: process.env.DB_NAME as string, 
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
});

export default config;