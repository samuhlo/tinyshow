import { prisma } from "../../utils/prisma";

/**
 * [API] :: GET /api/projects/techs
 * ----------------------------------------------------------------------
 * Endpoint auxiliar para obtener la lista de tecnologías principales.
 * Útil para poblar menús de filtrado en el frontend.
 *
 * @returns {Promise<string[]>} - Lista de tecnologías únicas ordenadas
 * ----------------------------------------------------------------------
 */
export default defineCachedEventHandler(
  async (event) => {
    try {
      // Group by primary_tech to get unique values efficienty
      const groups = await prisma.project.groupBy({
        by: ["primary_tech"],
        _count: {
          primary_tech: true,
        },
        orderBy: {
          primary_tech: "asc", // Alphabetical order
        },
      });

      // Extract just the strings
      return groups.map((g) => g.primary_tech);
    } catch (error: any) {
      console.error("[API] :: projects/techs :: Error fetching techs", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: error.message,
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 hour
    swr: true,
    name: "projects-techs",
    getKey: () => "techs",
  }
);
