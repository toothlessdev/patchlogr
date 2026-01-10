import { describe, expect, test } from "vitest";
import {
    canonicalizeOASV2,
    categorizeParameters,
    normalizeGeneralParam,
    processRequestBody,
    processFormData,
    processResponses,
    extractDocMetadata,
} from "../canonicalizeOASV2";
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
        expect(op?.doc?.operationId).toBe("updatePetV2");
        expect(op?.doc?.summary).toBe("Updates a pet");
    });

    test("Produce full canonical spec matching expected output", () => {
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
    test("should separate request params, form data, and body param", () => {
        const params: any[] = [
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
    test("should normalize general parameter", () => {
        const param: any = {
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
});

describe("processRequestBody", () => {
    test("should process body param correctly", () => {
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
    test("should process form data correctly", () => {
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
});

describe("processResponses", () => {
    test("should process responses correctly", () => {
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
