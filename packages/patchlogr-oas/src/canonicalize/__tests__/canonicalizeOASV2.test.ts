import { describe, expect, test } from "vitest";
import { canonicalizeOASV2 } from "../canonicalizeOASV2";
import { docV2 } from "../__fixtures__/docV2";

describe("canonicalizeOASV2", () => {
    const spec = canonicalizeOASV2(docV2);

    test("Map 'info' property correctly", () => {
        expect(spec.info).toEqual(docV2.info);
    });

    test("Generate correct operation keys", () => {
        const keys = Object.keys(spec.operations);
        expect(keys).toContain("GET /pets/{petId}");
        expect(keys).toContain("PUT /pets/{petId}");
        expect(keys).toContain("POST /pets/upload");
    });

    test("Merge path-level and operation-level parameters", () => {
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
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();

        expect(op?.request.body).toBeDefined();
        expect(op?.request.body?.required).toBe(true);

        expect(op?.request.body?.content["application/json"]).toBeDefined();
        expect(
            op?.request?.body?.content?.["application/json"]?.schema,
        ).toHaveProperty("type", "object");
    });

    test("Transform formData to body with correct content-type", () => {
        const op = spec.operations["POST /pets/upload"];
        expect(op).toBeDefined();

        expect(
            op?.request?.body?.content?.["multipart/form-data"],
        ).toBeDefined();

        const schema =
            op?.request?.body?.content?.["multipart/form-data"]?.schema;
        expect(schema).toBeDefined();
        expect(schema).toBeDefined();

        expect(schema!.properties?.["image"]).toHaveProperty("required", true);
        expect(schema!.properties?.["description"]).toHaveProperty(
            "required",
            false,
        );

        expect(schema!).not.toHaveProperty("required");
    });

    test("Map responses and inherit produces", () => {
        const op = spec.operations["GET /pets/{petId}"];
        expect(op).toBeDefined();
        const successResponse = op?.responses["200"];

        expect(successResponse).toBeDefined();
        expect(successResponse?.content?.["application/json"]).toBeDefined();
        expect(
            successResponse?.content?.["application/json"]?.schema,
        ).toHaveProperty("type", "object");
    });

    test("Map operation metadata", () => {
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();
        expect(op?.operationId).toBe("updatePetV2");
        expect(op?.summary).toBe("Updates a pet");
    });
});
