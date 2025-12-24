import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        desktop: "1124px",
      },
    },
  },
  safelist: [
    "hidden",
    "sticky",
    "backdrop-blur",
    "bg-background/95",
    "supports-[backdrop-filter]:bg-background/60",
    "desktop:hidden",
    "desktop:flex",
    "desktop:grid",
    "desktop:grid-cols-2",
    "desktop:grid-cols-4",
    "desktop:gap-6",
    "aspect-[4/5]",
    "aspect-[16/9]",
    "aspect-[4/3]",
  ],
};

export default config;

