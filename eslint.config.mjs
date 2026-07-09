import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginSecurity from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintPluginSecurity.configs.recommended,
  {
    rules: {
      // Disable overly strict React 19 compiler rules —
      // calling setState in useEffect for localStorage hydration is a valid pattern
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      // Disable noisy security rules with high false positive rates in TypeScript
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tooling/workspace patterns to ignore:
    ".claude/**",
    ".gemini/**",
    ".gsd/**",
    ".swarm/**",
    ".vercel/**",
  ]),
]);

export default eslintConfig;
