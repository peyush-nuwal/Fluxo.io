import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../models/index.model.js";

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, { schema });

export { sql, db };
