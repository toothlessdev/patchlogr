import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        swc.vite({
            module: { type: "es6" },
        }),
    ],
    test: {
        globals: false,
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,
        passWithNoTests: true,
        include: ["src/**/*.spec.ts"],
        exclude: ["**/dist/**"],
        coverage: {
            enabled: false,
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./.coverage",
        },
    },
});
