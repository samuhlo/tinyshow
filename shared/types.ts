import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().describe("Generated from repo name"),
  title: z.string().describe("Punchy, short title"),
  tagline: z.string().describe("One-liner vendor"),
  description: z.string().describe("Emotional summary of the project"),
  tech_stack: z.array(z.string()).describe("e.g. Vue, Tailwind"),
  img_url: z.string().nullish().describe("Project image URL"),
  repo_url: z.string(),
  demo_url: z.string().nullish(),
});

export type Project = z.infer<typeof ProjectSchema>;
