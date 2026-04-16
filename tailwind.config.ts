import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-dim": "#131313",
        "surface": "#131313",
        "primary": "#ffb4a2",
        "primary-container": "#ff562c",
        "on-primary": "#621100",
        "on-primary-fixed": "#3c0700",
        "secondary": "#ffd65b",
        "secondary-container": "#e7b900",
        "on-secondary": "#3d2f00",
        "tertiary": "#76dc83",
        "tertiary-container": "#3da452",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#e4beb5",
        "outline": "#ab8981",
        "outline-variant": "#5b403a",
        "editorial-pink": "#F2A7C3",
        "ink-black": "#000000",
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "9999px",
      },
      fontFamily: {
        headline: ["Space Grotesk", "sans-serif"],
        body: ["Work Sans", "sans-serif"],
        label: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
