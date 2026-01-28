import { describe, it, expect } from "vitest";
import { toCanonicalSchemaV2 } from "../toCanonicalSchemaV2";
import type { OpenAPIV2 } from "openapi-types";

describe("toCanonicalSchemaV2", () => {
    it("string schema를 canonical schema로 변환한다", () => {
        const input: OpenAPIV2.SchemaObject = {
            type: "string",
        };
        const output = toCanonicalSchemaV2(input);
        expect(output).toEqual({
            type: "string",
        });
    });

    it("required fields를 canonical schema로 변환한다", () => {
        const input: OpenAPIV2.SchemaObject = {
            type: "object",
            required: ["id"],
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
            },
        };
        const output = toCanonicalSchemaV2(input);
        expect(output.properties?.id?.required).toBe(true);
        expect(output.properties?.name?.required).toBe(false);
    });

    it("nullable을 canonical schema로 변환한다", () => {
        const input: OpenAPIV2.SchemaObject = {
            type: "string",
            "x-nullable": true,
        };
        const output = toCanonicalSchemaV2(input);
        expect(output["x-nullable"]).toBe(true);
    });
});
