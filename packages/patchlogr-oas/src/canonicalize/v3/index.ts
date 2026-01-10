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
import { toCanonicalSchema } from "../../utils/toCanonicalSchema";

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

/**
 * OpenAPI 3.0 문서를 CanonicalSpec으로 변환합니다.
 * - paths, operation을 순회하며 정규화된 포맷으로 변환합니다.
 * - 파라미터, 바디, 응답 등을 표준화된 형태로 정리합니다.
 *
 * @param {OpenAPIV3.Document} doc - 변환할 OpenAPI 3.0 문서 객체
 * @returns {CanonicalSpec} 정규화된 API 명세 (CanonicalSpec)
 *
 * @example
 * const oas3 = {
 *   openapi: "3.0.0",
 *   info: { title: "API", version: "1.0" },
 *   paths: {
 *     "/users": {
 *       get: {
 *         summary: "List users",
 *         responses: { "200": { description: "OK" } }
 *       }
 *     }
 *   }
 * };
 *
 * const canonical = canonicalizeOASV3(oas3);
 * // Result:
 * // {
 * //   info: { title: "API", version: "1.0" },
 * //   operations: {
 * //     "GET /users": {
 * //       method: "GET",
 * //       path: "/users",
 * //       ...
 * //     }
 * //   }
 * // }
 */
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

/**
 * 단일 Operation 객체를 CanonicalOperation으로 변환
 * - path params와 operation params를 합쳐서 정규화
 * - request body, responses, metadata 등을 추출하여 정규화
 *
 * @example
 * const op = createCanonicalOperation("get", "/users/{id}", operationObj, pathParams);
 * // Result:
 * // {
 * //   key: "GET /users/{id}",
 * //   method: "GET",
 * //   path: "/users/{id}",
 * //   request: { params: [...], body: ... },
 * //   responses: { ... },
 * //   doc: { ... }
 * // }
 */
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

/**
 * 파라미터(Parameter) 목록을 CanonicalParam 배열로 변환
 * - $ref가 없는 파라미터만 처리 (dereferenced 가정)
 * - name, in, required, schema 등을 매핑
 *
 * @example
 * const params = [{ name: "id", in: "path", required: true, schema: { type: "string" } }];
 * const canonical = normalizeParameters(params);
 * // Result
 * [{ name: "id", in: "path", required: true, schema: { type: "string" } }]
 */
export function normalizeParameters(
    allParams: OpenAPIV3.ParameterObject[],
): CanonicalParam[] {
    const requestParams: CanonicalParam[] = [];

    for (const param of allParams) {
        const paramObj: CanonicalParam = {
            name: param.name,
            in: param.in as CanonicalParam["in"],
            required: param.required || false,
        };

        if (param.description) {
            paramObj.description = param.description;
        }

        if (param.schema) {
            paramObj.schema = toCanonicalSchema(param.schema);
        }

        if (param.deprecated) {
            paramObj.deprecated = param.deprecated;
        }

        requestParams.push(paramObj);
    }
    return requestParams;
}

/**
 * RequestBody 객체를 정규화
 * - content 맵을 순회하며 미디어 타입별 스키마를 CanonicalSchema로 변환
 *
 * @example
 * const requestBody = {
 *      content: { "application/json": { schema: { type: "object" } } },
 *      required: true
 * };
 * const canonical = normalizeRequestBody(requestBody);
 * // Result
 * // {
 * //      required: true,
 * //      content: { "application/json": { schema: { type: "object" } } }
 * // }
 */
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

/**
 * 응답 목록(Responses)을 정규화
 * - 상태 코드별로 normalizeResponse를 호출
 *
 * @example
 * const responses = { "200": { description: "OK" } };
 * const canonical = processResponses(responses);
 * // Result
 * // { "200": { description: "OK" } }
 */
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

/**
 * 개별 응답 객체를 정규화
 * - content 맵을 순회하며 미디어 타입별 스키마를 변환
 *
 * @example
 * const resObj = { description: "OK", content: { "application/json": { schema: { type: "string" } } } };
 * const canonical = normalizeResponse(resObj);
 * // Result
 * // { description: "OK", content: { "application/json": { schema: { type: "string" } } } }
 */
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

/**
 * 문서화용 메타데이터(operationId, summary, description, tags)를 추출
 *
 * @example
 * const op = { operationId: "op1", summary: "summary" };
 * const meta = extractDocMetadata(op);
 * // Result: { operationId: "op1", summary: "summary" }
 */
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
