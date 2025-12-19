/**
 * [API] :: GET_PROJECTS
 * ----------------------------------------------------------------------
 * Endpoint para listar proyectos del portfolio.
 * Soporta filtrado por tecnología principal y búsqueda simple.
 *
 * @module    server/api/projects
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { prisma } from "../../utils/prisma";

// =====================================================================
// [SECTION] :: ENDPOINT HANDLER
// =====================================================================

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const primaryTech = query.primary_tech as string | undefined;
    const limit = query.limit ? parseInt(query.limit as string) : 50;

    try {
      const whereClause: any = {};
      if (primaryTech) {
        whereClause.primary_tech = {
          equals: primaryTech,
          mode: "insensitive",
        };
      }

      const projects = await prisma.project.findMany({
        where: whereClause,
        take: limit,
        orderBy: {
          updatedAt: "desc",
        },
      });

      return projects;
    } catch (error: any) {
      console.error(
        "[API] :: projects/index :: Error fetching projects",
        error
      );
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: error.message,
      });
    }
  },
  {
    maxAge: import.meta.dev ? 0 : 60 * 60, // 1 hour in prod, 0 in dev
    swr: !import.meta.dev, // Disable SWR in dev
    name: "projects-list",
    getKey: (event) => {
      const query = getQuery(event);
      const tech = query.primary_tech || "all";
      const limit = query.limit || "50";
      return `projects:${tech}:${limit}`;
    },
  }
);
