import { describe, expect, test } from "vitest";
import { canonicalizeOASV2 } from "./canonicalizeOASV2";
import { docV2 } from "./__fixtures__/docV2";

describe("canonicalizeOASV2", () => {
    const spec = canonicalizeOASV2(docV2);

    test("'info' 를 올바르게 매핑한다", () => {
        expect(spec.info).toEqual(docV2.info);
    });

    test("올바른 operation 키를 생성한다", () => {
        const keys = Object.keys(spec.operations);
        expect(keys).toContain("GET /pets/{petId}");
        expect(keys).toContain("PUT /pets/{petId}");
        expect(keys).toContain("POST /pets/upload");
    });

    test("path-level 및 operation-level parameter를 병합한다", () => {
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

    test("body parameter를 올바르게 변환한다", () => {
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();

        expect(op?.request.body).toBeDefined();
        expect(op?.request.body?.required).toBe(true);

        expect(op?.request.body?.content["application/json"]).toBeDefined();
        expect(
            op?.request?.body?.content?.["application/json"]?.schema,
        ).toHaveProperty("type", "object");
    });

    test("formData를 올바른 content-type으로 body로 변환한다", () => {
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

    test("응답과 produces를 올바르게 매핑한다", () => {
        const op = spec.operations["GET /pets/{petId}"];
        expect(op).toBeDefined();
        const successResponse = op?.responses["200"];

        expect(successResponse).toBeDefined();
        expect(successResponse?.content?.["application/json"]).toBeDefined();
        expect(
            successResponse?.content?.["application/json"]?.schema,
        ).toHaveProperty("type", "object");
    });

    test("operation 메타데이터를 올바르게 매핑한다", () => {
        const op = spec.operations["PUT /pets/{petId}"];
        expect(op).toBeDefined();
        expect(op?.doc?.operationId).toBe("updatePetV2");
        expect(op?.doc?.summary).toBe("Updates a pet");
    });

    test("전체 canonical spec을 올바르게 생성한다", () => {
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
                                                type: "file",
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
