/**
 * [API] :: GET_PROJECT_DETAILS
 * ----------------------------------------------------------------------
 * Endpoint para obtener el detalle de un proyecto específico.
 * Busca por el ID (slug) generado a partir del nombre del repositorio.
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
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing project ID",
      });
    }

    try {
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw createError({
          statusCode: 404,
          statusMessage: "Not Found",
          message: `Project with ID '${id}' not found`,
        });
      }

      return project;
    } catch (error: any) {
      // If it's already an H3 error, rethrow it
      if (error.statusCode) throw error;

      console.error(`[API] :: projects/${id} :: Error fetching project`, error);
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
    name: "project-detail",
    getKey: (event) => {
      const id = getRouterParam(event, "id");
      return `project:${id}`;
    },
  }
);
