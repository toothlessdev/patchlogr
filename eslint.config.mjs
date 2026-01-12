import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/.turbo/**",
            "**/coverage/**",
            "**/.coverage/**",
            "**/.yarn/**",
            "**/.pnp.*",
            "**/*.mjs",
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
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    disallowTypeAnnotations: false,
                },
            ],
        },
    },
    {
        files: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
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
                            message:
                                "Use `expect` from `vitest` instead of `node:assert`",
                        },
                        {
                            name: "assert",
                            message:
                                "Use `expect` from `vitest` instead of `node:assert`",
                        },
                    ],
                },
            ],
        },
    },
);
