/**
 * [API] :: GET_TECHS
 * ----------------------------------------------------------------------
 * Endpoint auxiliar para obtener la lista de tecnologías principales.
 * Útil para poblar menús de filtrado en el frontend.
 *
 * @module    server/api/projects
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { prisma } from "../../utils/prisma";

// =====================================================================
// [SECTION] :: ENDPOINT HANDLER
// =====================================================================

const CACHE_MAX_AGE = 60 * 60; // 1 hora
const NO_CACHE = 0;
const HTTP_INTERNAL_ERROR = 500;

export default defineCachedEventHandler(
  async (event) => {
    try {
      // Agrupar por primary_tech para obtener valores únicos eficientemente
      const groups = await prisma.project.groupBy({
        by: ["primary_tech"],
        _count: {
          primary_tech: true,
        },
        orderBy: {
          primary_tech: "asc",
        },
      });

      // Extraer solo las cadenas
      const allTechs = groups.map((g) => g.primary_tech);

      // Verificar que cada tech tenga proyectos visibles usando el mismo criterio que la lista
      const validTechs: string[] = [];

      for (const tech of allTechs) {
        const count = await prisma.project.count({
          where: {
            primary_tech: {
              equals: tech,
              mode: "insensitive",
            },
          },
        });

        if (count > 0) {
          validTechs.push(tech);
        }
      }

      return validTechs;
    } catch (error: any) {
      console.error("[API] :: projects/techs :: Error fetching techs", error);
      throw createError({
        statusCode: HTTP_INTERNAL_ERROR,
        statusMessage: "Internal Server Error",
        message: error.message,
      });
    }
  },
  {
    maxAge: import.meta.dev ? NO_CACHE : CACHE_MAX_AGE, // 1 hora en prod, 0 en dev
    swr: !import.meta.dev, // Deshabilitar SWR en dev
    name: "projects-techs",
    getKey: () => "techs",
  }
);
