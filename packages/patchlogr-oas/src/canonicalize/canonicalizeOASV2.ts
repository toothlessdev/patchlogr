import {
    CanonicalOperation,
    CanonicalParam,
    CanonicalSpec,
    HTTPMethod,
    OperationKey,
    CanonicalResponse,
    CanonicalBody,
} from "@patchlogr/types";
import { OpenAPIV2 } from "openapi-types";
import { toCanonicalSchema } from "../utils/toCanonicalSchema";

const HTTP_METHODS = [
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
] as const;

export function canonicalizeOASV2(doc: OpenAPIV2.Document): CanonicalSpec {
    const operations: Record<OperationKey, CanonicalOperation> = {};

    if (doc.paths) {
        for (const [path, pathItem] of Object.entries(doc.paths)) {
            if (!pathItem) continue;

            const pathParams = (pathItem.parameters ||
                []) as OpenAPIV2.ParameterObject[];

            for (const method of HTTP_METHODS) {
                const operation = pathItem[method] as OpenAPIV2.OperationObject;
                if (!operation) continue;

                const operationKey: OperationKey = `${method.toUpperCase() as HTTPMethod} ${path}`;

                const operationParams = (operation.parameters ||
                    []) as OpenAPIV2.ParameterObject[];
                const allParams = [...pathParams, ...operationParams];

                const requestParams: CanonicalParam[] = [];
                let requestBody: CanonicalBody | undefined;
                const formDataParams: OpenAPIV2.GeneralParameterObject[] = [];
                for (const param of allParams) {
                    if ("$ref" in param) continue;

                    if (param.in === "body") {
                        const bodyParam =
                            param as OpenAPIV2.InBodyParameterObject;
                        requestBody = {
                            required: bodyParam.required || false,
                            content: {
                                [doc.consumes?.[0] || "application/json"]: {
                                    schema: toCanonicalSchema(bodyParam.schema),
                                },
                            },
                        };
                    } else if (param.in === "formData") {
                        formDataParams.push(
                            param as OpenAPIV2.GeneralParameterObject,
                        );
                    } else {
                        const generalParam =
                            param as OpenAPIV2.GeneralParameterObject;

                        const paramObj: CanonicalParam = {
                            name: generalParam.name,
                            in: generalParam.in as CanonicalParam["in"],
                            required: generalParam.required || false,
                        };

                        if (generalParam.description !== undefined) {
                            paramObj.description = generalParam.description;
                        }

                        paramObj.schema = {
                            type: generalParam.type as string,
                        };
                        if (generalParam.format !== undefined)
                            paramObj.schema.format = generalParam.format;
                        if (generalParam.items !== undefined)
                            paramObj.schema.items = generalParam.items as any;
                        if (generalParam.enum !== undefined)
                            paramObj.schema.enum = generalParam.enum;
                        if (generalParam.default !== undefined)
                            paramObj.schema.default = generalParam.default;

                        requestParams.push(paramObj);
                    }
                }

                if (formDataParams.length > 0) {
                    const properties: Record<string, any> = {};
                    const required: string[] = [];

                    for (const param of formDataParams) {
                        properties[param.name] = {
                            type: param.type,
                            format: param.format,
                            items: param.items,
                        };
                        if (param.required) {
                            required.push(param.name);
                        }
                    }

                    const contentType =
                        operation.consumes?.[0] ||
                        doc.consumes?.[0] ||
                        "application/x-www-form-urlencoded";

                    requestBody = {
                        required: formDataParams.some((p) => p.required),
                        content: {
                            [contentType]: {
                                schema: {
                                    type: "object",
                                    properties,
                                } as any,
                            },
                        },
                    };

                    const constructedSchema =
                        requestBody?.content?.[contentType]?.schema;
                    if (constructedSchema) {
                        const requiredSet = new Set(required);
                        for (const propKey of Object.keys(properties)) {
                            properties[propKey].required =
                                requiredSet.has(propKey);
                        }

                        if (!requestBody?.content?.[contentType]?.schema) {
                            throw new Error("Invalid schema");
                        }

                        requestBody.content[contentType].schema =
                            constructedSchema;
                    }
                }

                const responses: Record<string, CanonicalResponse> = {};
                for (const [code, response] of Object.entries(
                    operation.responses,
                )) {
                    if (!response || "$ref" in response) continue;
                    const resObj = response as OpenAPIV2.ResponseObject;

                    const responseContent: CanonicalBody["content"] = {};
                    if (resObj.schema) {
                        const contentType =
                            operation.produces?.[0] ||
                            doc.produces?.[0] ||
                            "application/json";
                        responseContent[contentType] = {
                            schema: toCanonicalSchema(resObj.schema),
                        };
                    }

                    const canonicalResponse: CanonicalResponse = {};
                    if (resObj.description !== undefined) {
                        canonicalResponse.description = resObj.description;
                    }
                    if (Object.keys(responseContent).length > 0) {
                        canonicalResponse.content = responseContent;
                    }

                    responses[code] = canonicalResponse;
                }

                const canonicalOp: CanonicalOperation = {
                    key: operationKey,
                    method: method.toUpperCase() as HTTPMethod,
                    path,
                    request: {
                        params: requestParams,
                    },
                    responses,
                };

                if (operation.operationId !== undefined)
                    canonicalOp.operationId = operation.operationId;
                if (operation.summary !== undefined)
                    canonicalOp.summary = operation.summary;
                if (operation.description !== undefined)
                    canonicalOp.description = operation.description;
                if (operation.tags !== undefined)
                    canonicalOp.tags = operation.tags;
                if (operation.deprecated !== undefined)
                    canonicalOp.deprecated = operation.deprecated;
                if (operation.security !== undefined)
                    canonicalOp.security = operation.security;
                if (requestBody !== undefined)
                    canonicalOp.request.body = requestBody;

                operations[operationKey] = canonicalOp;
            }
        }
    }

    return {
        info: doc.info,
        operations,
    };
}
