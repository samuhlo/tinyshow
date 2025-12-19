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

const PARAM_ID = "id";
const CACHE_MAX_AGE = 60 * 60; // 1 hour
const NO_CACHE = 0;

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;

export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, PARAM_ID);

    if (!id) {
      throw createError({
        statusCode: HTTP_BAD_REQUEST,
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
          statusCode: HTTP_NOT_FOUND,
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
        statusCode: HTTP_INTERNAL_ERROR,
        statusMessage: "Internal Server Error",
        message: error.message,
      });
    }
  },
  {
    maxAge: import.meta.dev ? NO_CACHE : CACHE_MAX_AGE, // 1 hour in prod, 0 in dev
    swr: !import.meta.dev, // Disable SWR in dev
    name: "project-detail",
    getKey: (event) => {
      const id = getRouterParam(event, PARAM_ID);
      return `project:${id}`;
    },
  }
);
