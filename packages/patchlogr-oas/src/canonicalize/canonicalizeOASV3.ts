import {
    CanonicalOperation,
    CanonicalParam,
    CanonicalSpec,
    HTTPMethod,
    OperationKey,
    CanonicalResponse,
    CanonicalBody,
    CanonicalOperationDoc,
    CanonicalSecurityRequirement,
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

    if (!doc.paths) {
        return {
            info: doc.info,
            operations,
        };
    }

    for (const [path, pathItem] of Object.entries(doc.paths)) {
        if (!pathItem) continue;

        const pathParams = (pathItem.parameters ||
            []) as OpenAPIV3.ParameterObject[];

        for (const method of HTTP_METHODS) {
            const operation = pathItem[method] as OpenAPIV3.OperationObject;
            if (!operation) continue;

            const canonicalOp = createCanonicalOperation(
                method,
                path,
                operation,
                pathParams,
            );
            operations[canonicalOp.key] = canonicalOp;
        }
    }

    return {
        info: doc.info,
        operations,
    };
}

export function createCanonicalOperation(
    method: string,
    path: string,
    operation: OpenAPIV3.OperationObject,
    pathParams: OpenAPIV3.ParameterObject[],
): CanonicalOperation {
    const operationKey: OperationKey = `${method.toUpperCase() as HTTPMethod} ${path}`;

    const operationParams = (operation.parameters ||
        []) as OpenAPIV3.ParameterObject[];
    const allParams = [...pathParams, ...operationParams];

    const requestParams = normalizeParameters(allParams);
    const requestBody = normalizeRequestBody(operation.requestBody);
    const responses = processResponses(operation.responses);
    const docMetadata = extractDocMetadata(operation);

    const canonicalOp: CanonicalOperation = {
        key: operationKey,
        method: method.toUpperCase() as HTTPMethod,
        path,
        request: {
            params: requestParams,
        },
        responses,
        doc: docMetadata,
    };

    if (requestBody) {
        canonicalOp.request.body = requestBody;
    }

    if (operation.deprecated) {
        canonicalOp.deprecated = operation.deprecated;
    }
    if (operation.security) {
        canonicalOp.security =
            operation.security as CanonicalSecurityRequirement[];
    }

    return canonicalOp;
}

export function normalizeParameters(
    allParams: OpenAPIV3.ParameterObject[],
): CanonicalParam[] {
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
    return requestParams;
}

export function normalizeRequestBody(
    requestBody:
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.RequestBodyObject
        | undefined,
): CanonicalBody | undefined {
    if (!requestBody || "$ref" in requestBody) {
        return undefined;
    }

    const reqBodyObj = requestBody as OpenAPIV3.RequestBodyObject;
    const content: CanonicalBody["content"] = {};

    for (const [mediaType, mediaTypeObj] of Object.entries(
        reqBodyObj.content,
    )) {
        content[mediaType] = {
            schema: toCanonicalSchema(mediaTypeObj.schema),
        };
    }

    return {
        required: reqBodyObj.required || false,
        content,
    };
}

export function processResponses(
    responses: OpenAPIV3.ResponsesObject | undefined,
): Record<string, CanonicalResponse> {
    const result: Record<string, CanonicalResponse> = {};

    if (!responses) return result;

    for (const [code, response] of Object.entries(responses)) {
        if ("$ref" in response) continue;
        const resObj = response as OpenAPIV3.ResponseObject;
        result[code] = normalizeResponse(resObj);
    }

    return result;
}

export function normalizeResponse(
    resObj: OpenAPIV3.ResponseObject,
): CanonicalResponse {
    const canonicalResponse: CanonicalResponse = {};

    if (resObj.description) {
        canonicalResponse.description = resObj.description;
    }

    if (resObj.content) {
        canonicalResponse.content = {};
        for (const [mediaType, mediaTypeObj] of Object.entries(
            resObj.content,
        )) {
            canonicalResponse.content[mediaType] = {
                schema: toCanonicalSchema(mediaTypeObj.schema),
            };
        }
    }

    return canonicalResponse;
}

export function extractDocMetadata(
    operation: OpenAPIV3.OperationObject,
): CanonicalOperationDoc {
    const docMetadata: CanonicalOperationDoc = {};
    if (operation.operationId) docMetadata.operationId = operation.operationId;
    if (operation.summary) docMetadata.summary = operation.summary;
    if (operation.description) docMetadata.description = operation.description;
    if (operation.tags) docMetadata.tags = operation.tags;

    return docMetadata;
}
