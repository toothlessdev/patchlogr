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
    test("info 프로퍼티를 올바르게 매핑한다", () => {
        const spec = canonicalizeOASV3(docV3);
        expect(spec.info).toEqual(docV3.info);
    });

    test("operation 키를 올바르게 생성한다", () => {
        const spec = canonicalizeOASV3(docV3);
        const keys = Object.keys(spec.operations);
        expect(keys).toContain("GET /pets/{petId}");
        expect(keys).toContain("PUT /pets/{petId}");
        expect(keys).toContain("POST /pets/upload");
    });

    test("path-level과 operation-level 파라미터를 병합한다", () => {
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

    test("body 파라미터를 올바르게 변환한다", () => {
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

    test("multipart/form-data를 body로 변환한다", () => {
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

    test("응답과 dereference 로직을 매핑한다", () => {
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

    test("operation 메타데이터를 매핑한다", () => {
        const spec = canonicalizeOASV3(docV3);
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();
        expect(op?.doc?.operationId).toBe("updatePetV2");
        expect(op?.doc?.summary).toBe("Updates a pet");
    });

    test("전체 canonical spec을 생성한다", () => {
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
        test("파라미터를 정규화한다", () => {
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
        test("request body를 정규화한다", () => {
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
        test("응답을 처리한다", () => {
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
        test("문서 메타데이터를 추출한다", () => {
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
