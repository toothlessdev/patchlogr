import { OpenAPIV2 } from "openapi-types";

export const docV2: OpenAPIV2.Document = {
    swagger: "2.0",
    info: { title: "Legacy API", version: "1.0.0" },
    host: "api.example.com",
    basePath: "/v1",
    schemes: ["https"],
    consumes: ["application/json"],
    produces: ["application/json"],

    paths: {
        "/pets/{petId}": {
            parameters: [
                {
                    name: "petId",
                    in: "path",
                    required: true,
                    type: "string",
                },
            ],
            get: {
                operationId: "getPetV2",
                parameters: [
                    {
                        name: "include",
                        in: "query",
                        required: false,
                        type: "string",
                    },
                ],
                responses: {
                    "200": {
                        description: "ok",
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

            put: {
                operationId: "updatePetV2",
                summary: "Updates a pet",
                parameters: [
                    {
                        name: "body",
                        in: "body",
                        required: true,
                        schema: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                age: { type: "integer" },
                            },
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "updated",
                        schema: {
                            // Dereferenced Pet definition
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

        "/pets/upload": {
            post: {
                operationId: "uploadImage",
                consumes: ["multipart/form-data"],
                parameters: [
                    {
                        name: "petId",
                        in: "query",
                        required: true,
                        type: "string",
                    },
                    {
                        name: "image",
                        in: "formData",
                        type: "file",
                        required: true,
                    },
                    {
                        name: "description",
                        in: "formData",
                        type: "string",
                        required: false,
                    },
                ],
                responses: {
                    "200": {
                        description: "uploaded",
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

    definitions: {
        Pet: {
            type: "object",
            properties: { id: { type: "string" }, name: { type: "string" } },
            required: ["id", "name"],
        },
    },
};
