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
import type { Project, LocalizedTextType, OriginType } from "~~/shared/types";

// =====================================================================
// [SECTION] :: ENDPOINT HANDLER
// =====================================================================

const DEFAULT_LIMIT = 50;
const CACHE_MAX_AGE = 60 * 5; // 5 minutos (Balance entre velocidad y frescura)
const NO_CACHE = 0;

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const primaryTech = query.primary_tech as string | undefined;
    const limit = query.limit ? parseInt(query.limit as string) : DEFAULT_LIMIT;

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

      // Castear campos JSONB a tipos adecuados para consumo frontend
      return projects.map(
        (project): Project => ({
          id: project.id,
          title: project.title,
          primary_tech: project.primary_tech,
          tagline: project.tagline as unknown as LocalizedTextType,
          description: project.description as unknown as LocalizedTextType,
          tech_stack: project.tech_stack,
          img_url: project.img_url,
          repo_url: project.repo_url,
          demo_url: project.demo_url,
          origin: project.origin as unknown as OriginType,
        })
      );
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
    maxAge: import.meta.dev ? NO_CACHE : CACHE_MAX_AGE,
    swr: !import.meta.dev,
    name: "projects-list",
    getKey: (event) => {
      const query = getQuery(event);
      const tech = query.primary_tech || "all";
      const limit = query.limit || DEFAULT_LIMIT.toString();
      // DEV: Force distinct key to prevent "ghost" cache from file system
      const suffix = import.meta.dev ? `:${Date.now()}` : "";
      return `projects:${tech}:${limit}${suffix}`;
    },
  }
);
