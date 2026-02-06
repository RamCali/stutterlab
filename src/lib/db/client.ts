import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use a placeholder during build (pages that import db but don't call it at build time)
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@placeholder/placeholder";
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
