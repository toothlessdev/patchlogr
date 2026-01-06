import { describe, expect, test } from "vitest";
import { CanonicalSchema } from "@patchlogr/types";

import { canonicalizeOASV3 } from "../canonicalizeOASV3";
import { docV3 } from "../__fixtures__/docV3";

describe("canonicalizeOASV3", () => {
    test("Map 'info' property correctly", () => {
        const spec = canonicalizeOASV3(docV3);
        expect(spec.info).toEqual(docV3.info);
    });

    test("Generate correct operation keys", () => {
        const spec = canonicalizeOASV3(docV3);
        const keys = Object.keys(spec.operations);
        expect(keys).toContain("GET /pets/{petId}");
        expect(keys).toContain("PUT /pets/{petId}");
        expect(keys).toContain("POST /pets/upload");
    });

    test("Merge path-level and operation-level parameters", () => {
        const spec = canonicalizeOASV3(docV3);
        const op = spec.operations["GET /pets/{petId}"];
        expect(op).toBeDefined();

        const petIdParam = op?.request.params.find((p) => p.name === "petId");
        expect(petIdParam).toBeDefined();
        expect(petIdParam?.in).toBe("path");
        expect(petIdParam?.required).toBe(true);

        const includeParam = op?.request.params.find(
            (p) => p.name === "include",
        );
        expect(includeParam).toBeDefined();
        expect(includeParam?.in).toBe("query");
    });

    test("Transform body parameter correctly", () => {
        const spec = canonicalizeOASV3(docV3);
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();

        expect(op?.request.body).toBeDefined();
        expect(op?.request.body?.required).toBe(true);

        expect(op?.request.body?.content["application/json"]).toBeDefined();
        expect(
            op?.request?.body?.content?.["application/json"]?.schema,
        ).toHaveProperty("type", "object");
    });

    test("Transform formData (multipart) to body correctly", () => {
        const spec = canonicalizeOASV3(docV3);
        const op = spec.operations["POST /pets/upload"];
        expect(op).toBeDefined();

        expect(
            op?.request?.body?.content?.["multipart/form-data"],
        ).toBeDefined();

        const schema = op?.request?.body?.content?.["multipart/form-data"]
            ?.schema as CanonicalSchema;
        expect(schema).toBeDefined();

        expect(schema?.properties?.["image"]).toHaveProperty("required", true);
        expect(schema?.properties?.["description"]).toHaveProperty(
            "required",
            false,
        );
        expect(schema!).not.toHaveProperty("required");
    });

    test("Map responses and dereference logic", () => {
        const spec = canonicalizeOASV3(docV3);
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();
        const successResponse = op?.responses["200"];

        expect(successResponse).toBeDefined();
        expect(successResponse?.content?.["application/json"]).toBeDefined();

        const schema = successResponse?.content?.["application/json"]
            ?.schema as any;
        expect(schema).toHaveProperty("type", "object");
        expect(schema?.properties?.["id"]).toHaveProperty("required", true);
        expect(schema?.properties?.["name"]).toHaveProperty("required", true);
        expect(schema).not.toHaveProperty("required"); // Array removed
        expect(schema).not.toHaveProperty("$ref");
    });

    test("Map operation metadata", () => {
        const spec = canonicalizeOASV3(docV3);
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();
        expect(op?.operationId).toBe("updatePetV2");
        expect(op?.summary).toBe("Updates a pet");
    });
});
