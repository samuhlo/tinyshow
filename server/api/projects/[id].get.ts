import { prisma } from "../../utils/prisma";

/**
 * [API] :: GET /api/projects/:id
 * ----------------------------------------------------------------------
 * Endpoint para obtener el detalle de un proyecto específico.
 * Busca por el ID (slug) del proyecto.
 *
 * @param {string} id - Slug del proyecto (ej: 'tinyshow-v2')
 *
 * @returns {Promise<Project>} - Objeto del proyecto
 * @throws {404} - Si el proyecto no existe
 * ----------------------------------------------------------------------
 */
export default defineEventHandler(async (event) => {
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
});
