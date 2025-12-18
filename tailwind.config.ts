import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        dark: "#141414",
        light: "#F8F8F8",
        accent: "#F95C4B",
      },
      fontFamily: {
        display: ["Archivo Black", "sans-serif"],
        sans: ["Archivo", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
    },
  },
};
