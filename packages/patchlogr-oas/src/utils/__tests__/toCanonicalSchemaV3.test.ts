import { describe, it, expect } from "vitest";
import { toCanonicalSchemaV3 } from "../toCanonicalSchemaV3";
import { OpenAPIV3 } from "openapi-types";

describe("toCanonicalSchemaV3", () => {
    it("should convert a simple string schema", () => {
        const input: OpenAPIV3.SchemaObject = {
            type: "string",
        };
        const output = toCanonicalSchemaV3(input);
        expect(output).toEqual({
            type: "string",
        });
    });

    it("should handle required fields", () => {
        const input: OpenAPIV3.SchemaObject = {
            type: "object",
            required: ["id"],
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
            },
        };
        const output = toCanonicalSchemaV3(input);
        expect(output.properties?.id?.required).toBe(true);
        expect(output.properties?.name?.required).toBe(false);
    });

    it("should handle missing type (V3 allows missing type)", () => {
        const input: OpenAPIV3.SchemaObject = {
            description: "Just description",
        };
        const output = toCanonicalSchemaV3(input);
        expect(output.description).toBe("Just description");
    });

    it("should handle nullable (V3 property)", () => {
        const input: OpenAPIV3.SchemaObject = {
            type: "string",
            nullable: true,
        };
        const output = toCanonicalSchemaV3(input);
        expect(output["nullable"]).toBe(true);
    });
});
