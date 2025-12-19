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

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error("NEON_DATABASE_URL is not defined in .env");
}

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
