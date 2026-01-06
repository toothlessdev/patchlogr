import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tseslint.config(
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/.turbo/**",
            "**/coverage/**",
            "**/.yarn/**",
            "**/.pnp.*",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierRecommended,
    {
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.node,
                ...globals.es2020,
            },
            parserOptions: {
                project: ["./tsconfig.base.json", "./packages/*/tsconfig.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-function-return-type": "off",
        },
    },
    {
        files: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "node:test",
                            message: "Use vitest test instead of node:test.",
                        },
                        {
                            name: "node:assert",
                            message: "Use vitest test instead of node:assert",
                        },
                        {
                            name: "assert",
                            message: "Use vitest test instead of node:assert",
                        },
                    ],
                },
            ],
        },
    },
);
