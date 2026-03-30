import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#100706",
        light: "#faf5f5",
        accent: "#f01e0e",
        green: "#0ff216",
        grey: "#434343",
        muted: "#524442",
      },
      fontFamily: {
        righteous: ["var(--font-righteous)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        redhat: ["var(--font-red-hat-display)", "sans-serif"],
      },
      backgroundImage: {
        "cta-gradient":
          "linear-gradient(90deg, rgb(233, 55, 37) 12%, rgb(233, 54, 77) 34%, rgb(233, 54, 131) 60%, rgb(233, 56, 201) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
