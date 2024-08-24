import { defineConfig } from "drizzle-kit";

const config: any = defineConfig({
  schema: "./database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT || "5432", 10),
  },
});

export default config;
