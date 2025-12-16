import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        "off-white": "#F8F8F8",
        "deep-black": "#141414",
        "industrial-peach": "#F95C4B",
      },
      fontFamily: {
        "archivo-black": ["Archivo Black", "sans-serif"],
        "space-mono": ["Space Mono", "monospace"],
      },
    },
  },
};
