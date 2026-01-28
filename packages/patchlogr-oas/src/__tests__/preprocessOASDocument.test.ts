import { describe, expect, test } from "vitest";
import { preprocessOASDocument } from "../index";
import type { OpenAPIV2, OpenAPIV3 } from "openapi-types";

const docV2: OpenAPIV2.Document = {
    swagger: "2.0",
    info: { title: "Ref V2 API", version: "1.0.0" },
    paths: {
        "/users": {
            get: {
                responses: {
                    "200": {
                        description: "OK",
                        schema: {
                            $ref: "#/definitions/User",
                        },
                    },
                },
            },
        },
    },
    definitions: {
        User: {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
            },
            required: ["id"],
        },
    },
};

const docV3: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: { title: "Ref V3 API", version: "1.0.0" },
    paths: {
        "/products": {
            post: {
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Product",
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Created",
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            Product: {
                type: "object",
                properties: {
                    sku: { type: "string" },
                    price: { type: "number" },
                },
            },
        },
    },
};

describe("preprocessOASDocument Integration", () => {
    test("OAS 2.0 문서를 canonical spec으로 변환한다", async () => {
        const result = await preprocessOASDocument(docV2);

        const expectedSpec = {
            info: docV2.info,
            operations: {
                "GET /users": {
                    doc: {},
                    key: "GET /users",
                    method: "GET",
                    path: "/users",
                    request: {
                        params: [],
                    },
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "integer",
                                                required: true,
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
            },
        };

        expect(result.canonicalSpec).toEqual(expectedSpec);
    });

    test("OAS 3.0 문서를 canonical spec으로 변환한다", async () => {
        const result = await preprocessOASDocument(docV3);

        const expectedSpec = {
            info: docV3.info,
            operations: {
                "POST /products": {
                    doc: {},
                    key: "POST /products",
                    method: "POST",
                    path: "/products",
                    request: {
                        params: [],
                        body: {
                            required: false,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            sku: {
                                                type: "string",
                                                required: false,
                                            },
                                            price: {
                                                type: "number",
                                                required: false,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created",
                        },
                    },
                },
            },
        };

        expect(result.canonicalSpec).toEqual(expectedSpec);
    });
});
