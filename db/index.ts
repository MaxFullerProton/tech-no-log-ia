import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  // The public Vercel deployment does not configure a D1 binding. Keep this
  // adapter explicit so private operational storage is never silently used.
  const binding = undefined as D1Database | undefined;
  if (!binding) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(binding, { schema });
}
