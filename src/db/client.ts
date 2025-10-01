import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your environment variables to connect to Neon."
  );
}

const neonClient = neon(connectionString);

export const db = drizzle(neonClient, { schema });
export type DbClient = typeof db;
