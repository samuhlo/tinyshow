import { prisma } from "../../utils/prisma";

/**
 * [API] :: GET /api/projects
 * ----------------------------------------------------------------------
 * Endpoint para listar proyectos del portfolio.
 * Soporta filtrado por tecnología principal y búsqueda simple.
 *
 * @queries
 * - primary_tech? (string) - Filtrar por tecnología principal (ej: 'Nuxt')
 * - limit? (number) - Limitar número de resultados (default: 50)
 *
 * @returns {Promise<Project[]>} - Lista de proyectos
 * ----------------------------------------------------------------------
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const primaryTech = query.primary_tech as string | undefined;
  // Default to 50 to avoid massive payloads, but allow override
  const limit = query.limit ? parseInt(query.limit as string) : 50;

  try {
    const whereClause: any = {};
    if (primaryTech) {
      whereClause.primary_tech = {
        equals: primaryTech,
        mode: "insensitive", // Case insensitive search
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        updatedAt: "desc", // Show most recently updated first
      },
    });

    return projects;
  } catch (error: any) {
    console.error("[API] :: projects/index :: Error fetching projects", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: error.message,
    });
  }
});
