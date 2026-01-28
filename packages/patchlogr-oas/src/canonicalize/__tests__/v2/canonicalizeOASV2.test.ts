import { describe, expect, test } from "vitest";
import {
    canonicalizeOASV2,
    categorizeParameters,
    normalizeGeneralParam,
    processRequestBody,
    processFormData,
    processResponses,
    extractDocMetadata,
} from "../../v2";
import { docV2 } from "../../__fixtures__/docV2";

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

describe("categorizeParameters", () => {
    test("요청 파라미터, form data, body 파라미터를 분리한다", () => {
        const params = [
            { name: "id", in: "path", required: true, type: "string" },
            { name: "field", in: "formData", type: "string" },
            { name: "body", in: "body", schema: {} },
        ];
        const { requestParams, formDataParams, bodyParam } =
            categorizeParameters(params);

        expect(requestParams).toHaveLength(1);
        expect(requestParams[0]?.name).toBe("id");
        expect(formDataParams).toHaveLength(1);
        expect(formDataParams[0]?.name).toBe("field");
        expect(bodyParam).toBeDefined();
    });
});

describe("normalizeGeneralParam", () => {
    test("일반 파라미터를 정규화한다", () => {
        const param = {
            name: "id",
            in: "path",
            required: true,
            type: "string",
            description: "ID",
            default: "1",
        };
        const result = normalizeGeneralParam(param);
        expect(result).toEqual({
            name: "id",
            in: "path",
            required: true,
            description: "ID",
            schema: {
                type: "string",
                default: "1",
            },
        });
    });

    test("array 타입의 파라미터에 collectionFormat을 포함한다", () => {
        const param = {
            name: "tags",
            in: "query",
            required: false,
            type: "array",
            items: { type: "string" },
            collectionFormat: "csv",
        };
        const result = normalizeGeneralParam(param);
        expect(result.schema?.collectionFormat).toBe("csv");
    });
});

describe("processRequestBody", () => {
    test("body 파라미터를 처리한다", () => {
        const doc: any = { consumes: ["application/json"] };
        const op: any = {};
        const bodyParam: any = {
            required: true,
            schema: { type: "object" },
        };
        const result = processRequestBody(doc, op, bodyParam, []);
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

describe("processFormData", () => {
    test("form data를 처리한다", () => {
        const doc: any = {};
        const op: any = {
            consumes: ["application/x-www-form-urlencoded"],
        };
        const formDataParams: any[] = [
            { name: "field", type: "string", required: true },
        ];
        const result = processFormData(doc, op, formDataParams);

        expect(result.required).toBe(true);

        const schema =
            result.content["application/x-www-form-urlencoded"]?.schema;
        expect(schema?.properties?.field).toEqual({
            type: "string",
            required: true,
        });
    });

    test("form data의 추가 프로퍼티 (default, enum)을 유지하고 items를 정규화한다", () => {
        const doc: any = {};
        const op: any = {
            consumes: ["application/x-www-form-urlencoded"],
        };
        const formDataParams: any[] = [
            {
                name: "status",
                type: "string",
                enum: ["available", "pending", "sold"],
                default: "available",
                required: true,
            },
            {
                name: "tags",
                type: "array",
                items: {
                    type: "string",
                    default: "new",
                },
                collectionFormat: "multi",
                required: false,
            },
        ];

        const result = processFormData(doc, op, formDataParams);
        const schema =
            result.content["application/x-www-form-urlencoded"]?.schema;

        expect(schema).toEqual({
            type: "object",
            properties: {
                status: {
                    type: "string",
                    enum: ["available", "pending", "sold"],
                    default: "available",
                    required: true,
                },
                tags: {
                    type: "array",
                    items: {
                        type: "string",
                        default: "new",
                    },
                    collectionFormat: "multi",
                    required: false,
                },
            },
        });
    });
});

describe("processResponses", () => {
    test("응답을 처리한다", () => {
        const doc: any = { produces: ["application/json"] };
        const responses: any = {
            "200": {
                description: "OK",
                schema: { type: "string" },
            },
        };
        const result = processResponses(doc, responses);
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
