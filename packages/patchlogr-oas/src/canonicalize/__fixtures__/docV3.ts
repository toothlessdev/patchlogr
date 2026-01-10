import { OpenAPIV3 } from "openapi-types";

export const docV3: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: { title: "Legacy API", version: "1.0.0" },
    servers: [{ url: "https://api.example.com/v1" }],

    paths: {
        "/pets/{petId}": {
            parameters: [
                {
                    name: "petId",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            get: {
                operationId: "getPetV2",
                parameters: [
                    {
                        name: "include",
                        in: "query",
                        required: false,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "ok",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            put: {
                operationId: "updatePetV2",
                summary: "Updates a pet",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    age: { type: "integer" },
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
                                    // Manually dereferenced Pet definition
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                    },
                                    required: ["id", "name"],
                                },
                            },
                        },
                    },
                },
            },
        },

        "/pets/upload": {
            post: {
                operationId: "uploadImage",
                parameters: [
                    {
                        name: "petId",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    image: { type: "string", format: "binary" },
                                    description: { type: "string" },
                                },
                                required: ["image"],
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
                                        url: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },

    components: {
        schemas: {
            Pet: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                },
                required: ["id", "name"],
            },
        },
    },
};
