/**
 * [MODULE] :: PRISMA_CLIENT
 * ----------------------------------------------------------------------
 * Configuración y exportación del cliente Prisma.
 * Gestiona la conexión con Neon PostgreSQL usando el adaptador nativo.
 *
 * @module    server/utils/prisma
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// =====================================================================
// [SECTION] :: DATABASE CONNECTION
// =====================================================================

/**
 * Get connection string from either Nuxt runtime config or process.env.
 * This allows the client to work both inside Nuxt server and in standalone scripts.
 */
function getConnectionString(): string {
  // Try Nuxt runtime config first (server context)
  try {
    if (typeof useRuntimeConfig === "function") {
      const config = useRuntimeConfig();
      if (config?.neonDatabaseUrl) {
        return config.neonDatabaseUrl;
      }
    }
  } catch {
    // Not in Nuxt context, fall through to env vars
  }

  // Fallback to process.env for standalone scripts
  const envUrl =
    process.env.NEON_DATABASE_URL || process.env.NUXT_NEON_DATABASE_URL;
  if (envUrl) {
    return envUrl;
  }

  throw new Error(
    "Database URL not found. Set NEON_DATABASE_URL in .env or NUXT_NEON_DATABASE_URL in nuxt.config.ts"
  );
}

const connectionString = getConnectionString();

// Neon requires SSL. Ensure it's enabled.
const pool = new Pool({
  connectionString,
  ssl: true,
});
const adapter = new PrismaPg(pool);

// =====================================================================
// [SECTION] :: CLIENT SINGLETON
// =====================================================================

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
