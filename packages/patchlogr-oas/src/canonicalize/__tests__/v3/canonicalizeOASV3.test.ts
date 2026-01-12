import { describe, expect, test } from "vitest";
import type { CanonicalSchema } from "@patchlogr/types";

import {
    canonicalizeOASV3,
    normalizeParameters,
    normalizeRequestBody,
    processResponses,
    extractDocMetadata,
} from "../../v3";
import { docV3 } from "../../__fixtures__/docV3";

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

        const schema = successResponse?.content?.["application/json"]?.schema;
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
        expect(op?.doc?.operationId).toBe("updatePetV2");
        expect(op?.doc?.summary).toBe("Updates a pet");
    });

    test("Produce full canonical spec matching expected output", () => {
        const spec = canonicalizeOASV3(docV3);
        expect(spec).toEqual({
            info: {
                title: "Legacy API",
                version: "1.0.0",
            },
            operations: {
                "GET /pets/{petId}": {
                    key: "GET /pets/{petId}",
                    method: "GET",
                    path: "/pets/{petId}",
                    doc: {
                        operationId: "getPetV2",
                    },
                    request: {
                        params: [
                            {
                                name: "petId",
                                in: "path",
                                required: true,
                                schema: {
                                    type: "string",
                                },
                            },
                            {
                                name: "include",
                                in: "query",
                                required: false,
                                schema: {
                                    type: "string",
                                },
                            },
                        ],
                    },
                    responses: {
                        "200": {
                            description: "ok",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "string",
                                                required: false,
                                            },
                                            name: {
                                                type: "string",
                                                required: false,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "PUT /pets/{petId}": {
                    key: "PUT /pets/{petId}",
                    method: "PUT",
                    path: "/pets/{petId}",
                    doc: {
                        operationId: "updatePetV2",
                        summary: "Updates a pet",
                    },
                    request: {
                        params: [
                            {
                                name: "petId",
                                in: "path",
                                required: true,
                                schema: {
                                    type: "string",
                                },
                            },
                        ],
                        body: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            name: {
                                                type: "string",
                                                required: false,
                                            },
                                            age: {
                                                type: "integer",
                                                required: false,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "updated",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "string",
                                                required: true,
                                            },
                                            name: {
                                                type: "string",
                                                required: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "POST /pets/upload": {
                    key: "POST /pets/upload",
                    method: "POST",
                    path: "/pets/upload",
                    doc: {
                        operationId: "uploadImage",
                    },
                    request: {
                        params: [
                            {
                                name: "petId",
                                in: "query",
                                required: true,
                                schema: {
                                    type: "string",
                                },
                            },
                        ],
                        body: {
                            required: true,
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            image: {
                                                type: "string",
                                                format: "binary",
                                                required: true,
                                            },
                                            description: {
                                                type: "string",
                                                required: false,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "uploaded",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            url: {
                                                type: "string",
                                                required: false,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    });
});

describe("canonicalizeOASV3 Helpers", () => {
    describe("normalizeParameters", () => {
        test("should normalize parameters", () => {
            const params: any[] = [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ];
            const result = normalizeParameters(params);
            expect(result).toEqual([
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ]);
        });
    });

    describe("normalizeRequestBody", () => {
        test("should normalize request body", () => {
            const body: any = {
                required: true,
                content: {
                    "application/json": {
                        schema: { type: "object" },
                    },
                },
            };
            const result = normalizeRequestBody(body);
            expect(result).toEqual({
                required: true,
                content: {
                    "application/json": {
                        schema: { type: "object" },
                    },
                },
            });
        });
    });

    describe("processResponses", () => {
        test("should process responses", () => {
            const responses: any = {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: { type: "string" },
                        },
                    },
                },
            };
            const result = processResponses(responses);
            expect(result["200"]).toEqual({
                description: "OK",
                content: {
                    "application/json": {
                        schema: { type: "string" },
                    },
                },
            });
        });
    });

    describe("extractDocMetadata", () => {
        test("should extract documentation metadata", () => {
            const op: any = {
                operationId: "op1",
                summary: "summary",
                description: "desc",
                tags: ["tag1"],
            };
            const result = extractDocMetadata(op);
            expect(result).toEqual({
                operationId: "op1",
                summary: "summary",
                description: "desc",
                tags: ["tag1"],
            });
        });
    });
});
