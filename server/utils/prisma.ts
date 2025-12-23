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
 * Obtener cadena de conexión desde runtime config o process.env.
 * Permite que el cliente funcione tanto en servidor Nuxt como en scripts independientes.
 */
function getConnectionString(): string {
  // Intentar Nuxt runtime config primero (contexto servidor)
  try {
    if (typeof useRuntimeConfig === "function") {
      const config = useRuntimeConfig();
      if (config?.neonDatabaseUrl) {
        return config.neonDatabaseUrl;
      }
    }
  } catch {
    // No en contexto Nuxt, pasar a variables de entorno
  }

  // Fallback a process.env para scripts independientes
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

// Neon requiere SSL. Asegurar que esté habilitado.
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
  var _prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis._prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis._prisma = prisma;
}
