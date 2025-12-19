import { z } from "zod";

export const LocalizedText = z.object({
  en: z.string(),
  es: z.string(),
});

export const ProjectSchema = z.object({
  id: z.string().describe("Generated from repo name"),
  title: z.string().describe("Punchy, short title"),
  tagline: LocalizedText.describe("One-liner vendor in EN and ES"),
  description: LocalizedText.describe(
    "Emotional summary of the project in EN and ES"
  ),
  tech_stack: z.array(z.string()).describe("e.g. Vue, Tailwind"),
  primary_tech: z
    .string()
    .describe("Main technology: e.g. Astro > TS, Nuxt > Vue, Next > React"),
  img_url: z.string().nullish().describe("Project image URL"),
  repo_url: z.string(),
  demo_url: z.string().nullish(),
  origin: z
    .object({
      is_course: z
        .boolean()
        .describe("true if the project is from a course, bootcmp, or tutorial"),
      name: z.string().nullish().describe("Name of the course/bootcamp"),
      author: z.string().nullish().describe("platform or instructor name"),
      url: z.string().nullish().describe("URL to the course"),
    })
    .nullish()
    .describe("Origin of the project if it's from a course"),
});

export type Project = z.infer<typeof ProjectSchema>;
