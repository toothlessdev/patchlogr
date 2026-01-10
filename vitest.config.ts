import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: false,
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,

        passWithNoTests: true,

        include: [
            "src/**/*.{test,spec}.{ts,tsx}",
            "packages/**/src/**/*.{test,spec}.{ts,tsx}",
        ],
        exclude: ["**/dist/**", "**/build/**"],

        coverage: {
            enabled: false,
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
        },
        reporters: ["default", "junit", "json", "html"],
        outputFile: {
            junit: "./.coverage/junit.xml",
            json: "./.coverage/json.json",
            html: "./.coverage/report.html",
        },
    },
});
