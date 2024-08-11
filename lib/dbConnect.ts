
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/database/schema';



// Disable prefetch as it is not supported for "Transaction" pool mode
const connectionString = process.env.DATABASE_URL as string;
// Disable prefetch as it is not supported for "Transaction" pool mode 
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, {schema});