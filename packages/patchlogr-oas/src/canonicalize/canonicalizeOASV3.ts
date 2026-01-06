import {
    CanonicalOperation,
    CanonicalParam,
    CanonicalSpec,
    HTTPMethod,
    OperationKey,
    CanonicalResponse,
    CanonicalBody,
} from "@patchlogr/types";
import { OpenAPIV3 } from "openapi-types";
import { toCanonicalSchema } from "../utils/toCanonicalSchema";

const HTTP_METHODS = [
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
    "trace",
] as const;

export function canonicalizeOASV3(doc: OpenAPIV3.Document): CanonicalSpec {
    const operations: Record<OperationKey, CanonicalOperation> = {};

    if (doc.paths) {
        for (const [path, pathItem] of Object.entries(doc.paths)) {
            if (!pathItem) continue;

            const pathParams = (pathItem.parameters ||
                []) as OpenAPIV3.ParameterObject[];

            for (const method of HTTP_METHODS) {
                const operation = pathItem[method] as OpenAPIV3.OperationObject;
                if (!operation) continue;

                const operationKey: OperationKey = `${method.toUpperCase() as HTTPMethod} ${path}`;

                const operationParams = (operation.parameters ||
                    []) as OpenAPIV3.ParameterObject[];
                const allParams = [...pathParams, ...operationParams];

                const requestParams: CanonicalParam[] = [];

                for (const param of allParams) {
                    if ("$ref" in param) continue;

                    const paramObj: CanonicalParam = {
                        name: param.name,
                        in: param.in as CanonicalParam["in"],
                        required: param.required || false,
                    };

                    if (param.description) {
                        paramObj.description = param.description;
                    }

                    if (param.schema) {
                        paramObj.schema = param.schema as any;
                    }

                    if (param.deprecated) {
                        paramObj.deprecated = param.deprecated;
                    }

                    requestParams.push(paramObj);
                }

                let requestBody: CanonicalBody | undefined;
                if (operation.requestBody) {
                    if (!("$ref" in operation.requestBody)) {
                        const reqBodyObj =
                            operation.requestBody as OpenAPIV3.RequestBodyObject;
                        requestBody = {
                            required: reqBodyObj.required || false,
                            content: {},
                        };

                        for (const [mediaType, mediaTypeObj] of Object.entries(
                            reqBodyObj.content,
                        )) {
                            requestBody.content[mediaType] = {
                                schema: toCanonicalSchema(mediaTypeObj.schema),
                            };
                        }
                    }
                }

                const responses: Record<string, CanonicalResponse> = {};
                if (operation.responses) {
                    for (const [code, response] of Object.entries(
                        operation.responses,
                    )) {
                        if ("$ref" in response) continue;

                        const resObj = response as OpenAPIV3.ResponseObject;
                        const canonicalResponse: CanonicalResponse = {};

                        if (resObj.description) {
                            canonicalResponse.description = resObj.description;
                        }

                        if (resObj.content) {
                            canonicalResponse.content = {};
                            for (const [
                                mediaType,
                                mediaTypeObj,
                            ] of Object.entries(resObj.content)) {
                                canonicalResponse.content[mediaType] = {
                                    schema: toCanonicalSchema(
                                        mediaTypeObj.schema,
                                    ),
                                };
                            }
                        }

                        responses[code] = canonicalResponse;
                    }
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

                if (requestBody) {
                    canonicalOp.request.body = requestBody;
                }

                if (operation.operationId)
                    canonicalOp.operationId = operation.operationId;
                if (operation.summary) canonicalOp.summary = operation.summary;
                if (operation.description)
                    canonicalOp.description = operation.description;
                if (operation.tags) canonicalOp.tags = operation.tags;
                if (operation.deprecated)
                    canonicalOp.deprecated = operation.deprecated;
                if (operation.security)
                    canonicalOp.security = operation.security;

                operations[operationKey] = canonicalOp;
            }
        }
    }

    return {
        info: doc.info,
        operations,
    };
}
