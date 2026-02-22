import { describe, it, expect } from "vitest";
import { toCanonicalSchema } from "./toCanonicalSchema";
import type { OpenAPIV3 } from "openapi-types";

describe("toCanonicalSchema", () => {
    it("string schema를 canonical schema로 변환한다", () => {
        const input: OpenAPIV3.SchemaObject = {
            type: "string",
        };
        const output = toCanonicalSchema(input);
        expect(output).toEqual({
            type: "string",
        });
    });

    it("required fields를 canonical schema로 변환한다", () => {
        const input: OpenAPIV3.SchemaObject = {
            type: "object",
            required: ["id"],
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
            },
        };
        const output = toCanonicalSchema(input);
        expect(output.properties?.id?.required).toBe(true);
        expect(output.properties?.name?.required).toBe(false);
    });

    it("missing type을 canonical schema로 변환한다", () => {
        const input: OpenAPIV3.SchemaObject = {
            description: "Just description",
        };
        const output = toCanonicalSchema(input);
        expect(output.description).toBe("Just description");
    });

    it("nullable을 canonical schema로 변환한다", () => {
        const input: OpenAPIV3.SchemaObject = {
            type: "string",
            nullable: true,
        };
        const output = toCanonicalSchema(input);
        expect(output["nullable"]).toBe(true);
    });
});
