import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: false,
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,

        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        exclude: ["**/dist/**", "**/build/**"],

        coverage: {
            enabled: false,
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
        },
    },
});
