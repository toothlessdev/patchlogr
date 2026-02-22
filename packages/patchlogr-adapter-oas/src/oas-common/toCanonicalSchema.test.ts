import { describe, test, expect } from "vitest";
import { toCanonicalSchema } from "./toCanonicalSchema";
import type { OpenAPISchemaObjectWithItems } from "./schemaGuards";

describe("toCanonicalSchema", () => {
    test("schema를 canonical schema로 변환한다", () => {
        const input = {
            type: "object",
            required: ["id"],
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
            },
        };

        expect(toCanonicalSchema(input)).toEqual({
            type: "object",
            properties: {
                id: {
                    type: "integer",
                    required: true,
                },
                name: {
                    type: "string",
                    required: false,
                },
            },
        });
    });

    test("nested properties를 canonical schema로 변환한다", () => {
        const input = {
            type: "object",
            properties: {
                metadata: {
                    type: "object",
                    required: ["created_at"],
                    properties: {
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
            },
        };

        expect(toCanonicalSchema(input)).toEqual({
            type: "object",
            properties: {
                metadata: {
                    type: "object",
                    required: false,
                    properties: {
                        created_at: {
                            type: "string",
                            format: "date-time",
                            required: true,
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                            required: false,
                        },
                    },
                },
            },
        });
    });

    test("nested arrays를 canonical schema로 변환한다", () => {
        const input = {
            type: "object",
            properties: {
                tags: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["label"],
                        properties: {
                            label: { type: "string" },
                            count: { type: "integer" },
                        },
                    },
                },
            },
        };

        expect(toCanonicalSchema(input)).toEqual({
            type: "object",
            properties: {
                tags: {
                    type: "array",
                    required: false,
                    items: {
                        type: "object",
                        properties: {
                            label: {
                                type: "string",
                                required: true,
                            },
                            count: {
                                type: "integer",
                                required: false,
                            },
                        },
                    },
                },
            },
        });
    });

    test("tuple items (array of schemas)를 canonical schema로 변환한다", () => {
        const input: OpenAPISchemaObjectWithItems = {
            type: "array",
            items: [{ type: "string" }, { type: "integer" }],
        };

        expect(toCanonicalSchema(input)).toEqual({
            type: "array",
            items: [{ type: "string" }, { type: "integer" }],
        });
    });
});
