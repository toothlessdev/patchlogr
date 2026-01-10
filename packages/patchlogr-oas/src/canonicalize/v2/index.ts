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
import { OpenAPIV2 } from "openapi-types";
import { toCanonicalSchema } from "../../utils/toCanonicalSchema";

const HTTP_METHODS = [
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
] as const;

/**
 * OpenAPI 2.0 (Swagger) 문서를 CanonicalSpec으로 변환합니다.
 * - paths, operation을 순회하며 정규화된 포맷으로 변환합니다.
 * - 파라미터, 바디, 응답 등을 표준화된 형태로 정리합니다.
 *
 * @param {OpenAPIV2.Document} doc - 변환할 OpenAPI 2.0 문서 객체
 * @returns {CanonicalSpec} 정규화된 API 명세 (CanonicalSpec)
 *
 * @example
 * const oas2 = {
 *   swagger: "2.0",
 *   info: { title: "API", version: "1.0" },
 *   paths: {
 *     "/users": {
 *       get: {
 *         summary: "List users",
 *         responses: { 200: { description: "OK" } }
 *       }
 *     }
 *   }
 * };
 *
 * const canonical = canonicalizeOASV2(oas2);
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
export function canonicalizeOASV2(doc: OpenAPIV2.Document): CanonicalSpec {
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
            []) as OpenAPIV2.ParameterObject[];

        for (const method of HTTP_METHODS) {
            const operation = pathItem[method] as OpenAPIV2.OperationObject;
            if (!operation) continue;

            const canonicalOp = createCanonicalOperation(
                doc,
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
 * - path params와 operation params를 합침
 * - 파라미터를 위치별(query, header, body 등)로 분류
 * - request body와 response를 정규화
 *
 * @example
 * const op = createCanonicalOperation(
 *      doc,
 *      "get",
 *      "/users/{id}",
 *      operation,
 *      pathParams,
 * );
 * // Result:
 * // {
 * //   key: "GET /users/{id}",
 * //   method: "GET",
 * //   path: "/users/{id}",
 * //   request: { params: [...] },
 * //   responses: { ... }
 * // }
 */
export function createCanonicalOperation(
    doc: OpenAPIV2.Document,
    method: string,
    path: string,
    operation: OpenAPIV2.OperationObject,
    pathParams: OpenAPIV2.ParameterObject[],
): CanonicalOperation {
    const operationKey: OperationKey = `${method.toUpperCase() as HTTPMethod} ${path}`;

    const operationParams = (operation.parameters ||
        []) as OpenAPIV2.ParameterObject[];
    const allParams = [...pathParams, ...operationParams];

    const { requestParams, formDataParams, bodyParam } =
        categorizeParameters(allParams);

    const requestBody = processRequestBody(
        doc,
        operation,
        bodyParam,
        formDataParams,
    );
    const responses = processResponses(doc, operation.responses);
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

    if (operation.deprecated !== undefined) {
        canonicalOp.deprecated = operation.deprecated;
    }
    if (operation.security !== undefined) {
        canonicalOp.security =
            operation.security as CanonicalSecurityRequirement[];
    }
    if (requestBody !== undefined) {
        canonicalOp.request.body = requestBody;
    }

    return canonicalOp;
}

/**
 * 파라미터 목록을 카테고리별로 분류
 * @example
 * const params = [
 *      { in: "query", name: "name", type: "string" },
 *      { in: "body", name: "body", type: "object" },
 *      { in: "formData", name: "formData", type: "string" },
 * ];
 * const { requestParams, formDataParams, bodyParam } =
 *      categorizeParameters(params);
 * // Result:
 * // {
 * //      requestParams: [
 * //              { name: "name", in: "query", type: "string" },
 * //              { name: "formData", in: "formData", type: "string" },
 * //      ],
 * //      formDataParams: [],
 * //      bodyParam: { name: "body", in: "body", type: "object" },
 * // }
 */
export function categorizeParameters(allParams: OpenAPIV2.ParameterObject[]) {
    const requestParams: CanonicalParam[] = [];
    const formDataParams: OpenAPIV2.GeneralParameterObject[] = [];
    let bodyParam: OpenAPIV2.InBodyParameterObject | undefined;

    for (const param of allParams) {
        if ("$ref" in param) continue;

        if (param.in === "body") {
            bodyParam = param as OpenAPIV2.InBodyParameterObject;
        } else if (param.in === "formData") {
            formDataParams.push(param as OpenAPIV2.GeneralParameterObject);
        } else {
            requestParams.push(normalizeGeneralParam(param));
        }
    }

    return { requestParams, formDataParams, bodyParam };
}

/**
 * 일반 파라미터(query, path, header)를 CanonicalParam으로 변환
 * @example
 * const param = { name: "id", in: "path", required: true, type: "integer" };
 * const canonical = normalizeGeneralParam(param);
 * // Result
 * {
 *      name: "id",
 *      in: "path",
 *      required: true,
 *      schema: { type: "integer" }
 * }
 */
export function normalizeGeneralParam(
    param: OpenAPIV2.ParameterObject,
): CanonicalParam {
    const generalParam = param;
    const paramIn = generalParam.in as CanonicalParam["in"];

    const paramObj: CanonicalParam = {
        name: generalParam.name,
        in: paramIn,
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
        paramObj.schema.items = toCanonicalSchema(generalParam.items);
    if (generalParam.enum !== undefined)
        paramObj.schema.enum = generalParam.enum;
    if (generalParam.default !== undefined)
        paramObj.schema.default = generalParam.default;

    return paramObj;
}

/**
 * 요청 본문(Request Body)을 처리
 * - body 파라미터가 있으면 이를 기반으로 CanonicalBody를 생성
 * - formData 파라미터가 있으면 이를 객체 스키마로 변환하여 CanonicalBody를 생성
 * @example
 * const doc = {
 *      consumes: ["application/json"],
 *      // ...
 * };
 * const bodyParam = {
 *      required: true,
 *      schema: {
 *              type: "object",
 *              properties: {
 *                      id: { type: "integer" },
 *                      name: { type: "string" },
 *              },
 *      },
 * };
 * const canonicalBody = processRequestBody(doc, operation, bodyParam, formDataParams);
 * // Result
 * {
 *      required: true,
 *      content: {
 *              "application/json": {
 *                      schema: {
 *                              type: "object",
 *                              properties: {
 *                                      id: { type: "integer" },
 *                                      name: { type: "string" },
 *                              },
 *                      },
 *              },
 *      },
 * }
 */
export function processRequestBody(
    doc: OpenAPIV2.Document,
    operation: OpenAPIV2.OperationObject,
    bodyParam: OpenAPIV2.InBodyParameterObject | undefined,
    formDataParams: OpenAPIV2.GeneralParameterObject[],
): CanonicalBody | undefined {
    if (bodyParam) {
        return {
            required: bodyParam.required || false,
            content: {
                [doc.consumes?.[0] || "application/json"]: {
                    schema: toCanonicalSchema(bodyParam.schema),
                },
            },
        };
    }

    if (formDataParams.length > 0) {
        return processFormData(doc, operation, formDataParams);
    }

    return undefined;
}

/**
 * FormData 파라미터 목록을 하나의 객체 스키마로 변환
 * - 각 파라미터를 객체의 프로퍼티로 변환
 * - consumes 필드를 참조하여 컨텐츠 타입 결정 (기본: application/x-www-form-urlencoded)
 *
 * @example
 * const doc = {
 *      consumes: ["application/x-www-form-urlencoded"],
 *      // ...
 * };
 * const operation = {
 *      // ...
 * };
 * const formDataParams = [
 *      { name: "id", in: "formData", required: true, type: "integer" },
 *      { name: "name", in: "formData", required: false, type: "string" },
 * ];
 * const canonicalBody = processFormData(doc, operation, formDataParams);
 * // Result
 * {
 *      required: true,
 *      content: {
 *              "application/x-www-form-urlencoded": {
 *                      schema: {
 *                              type: "object",
 *                              properties: {
 *                                      id: { type: "integer" },
 *                                      name: { type: "string" },
 *                              },
 *                      },
 *              },
 *      },
 * }
 */
export function processFormData(
    doc: OpenAPIV2.Document,
    operation: OpenAPIV2.OperationObject,
    formDataParams: OpenAPIV2.GeneralParameterObject[],
): CanonicalBody {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const param of formDataParams) {
        const {
            name,
            in: inParam,
            required: requiredParam,
            description,
            allowEmptyValue,
            items,
            ...schemaProps
        } = param;

        properties[name] = {
            ...schemaProps,
        };

        if (items) {
            properties[name].items = toCanonicalSchema(items);
        }
        if (description) {
            properties[name].description = description;
        }
        if (requiredParam) {
            required.push(param.name);
        }
    }

    const contentType =
        operation.consumes?.[0] ||
        doc.consumes?.[0] ||
        "application/x-www-form-urlencoded";

    const schema = {
        type: "object",
        properties,
    };

    const requiredSet = new Set(required);
    for (const propKey of Object.keys(properties)) {
        properties[propKey].required = requiredSet.has(propKey);
    }

    return {
        required: formDataParams.some((p) => p.required),
        content: {
            [contentType]: {
                schema,
            },
        },
    };
}

/**
 * 응답 목록(Responses)을 처리
 * - 상태 코드별로 순회하며 정규화 수행
 * - $ref가 있는 응답은 현재 구현에서 무시 (deref된 문서를 가정)
 *
 * @example
 * const doc = {
 *      // ...
 * };
 * const responses = {
 *      "200": {
 *              description: "OK",
 *              schema: {
 *                      type: "object",
 *                      properties: {
 *                              id: { type: "integer" },
 *                              name: { type: "string" },
 *                      },
 *              },
 *      },
 * };
 * const canonicalResponses = processResponses(doc, responses);
 * // Result
 * {
 *      "200": {
 *              description: "OK",
 *              content: {
 *                      "application/json": {
 *                              schema: {
 *                                      type: "object",
 *                                      properties: {
 *                                              id: { type: "integer" },
 *                                              name: { type: "string" },
 *                                      },
 *                              },
 *                      },
 *              },
 *      },
 * }
 */
export function processResponses(
    doc: OpenAPIV2.Document,
    responses: OpenAPIV2.ResponsesObject,
): Record<string, CanonicalResponse> {
    const result: Record<string, CanonicalResponse> = {};

    for (const [code, response] of Object.entries(responses)) {
        if (!response || "$ref" in response) continue;
        const resObj = response as OpenAPIV2.ResponseObject;
        result[code] = normalizeResponse(doc, resObj);
    }

    return result;
}

/**
 * 개별 응답 객체 정규화
 * - description 복사
 * - schema 존재하면 `produces` 필드 참조하여 content 맵 생성
 * @example
 * const doc = {
 *      // ...
 * };
 * const resObj = {
 *      description: "OK",
 *      schema: {
 *              type: "object",
 *              properties: {
 *                      id: { type: "integer" },
 *                      name: { type: "string" },
 *              },
 *      },
 * };
 * const canonicalResponse = normalizeResponse(doc, resObj);
 * // Result
 * {
 *      description: "OK",
 *      content: {
 *              "application/json": {
 *                      schema: {
 *                              type: "object",
 *                              properties: {
 *                                      id: { type: "integer" },
 *                                      name: { type: "string" },
 *                              },
 *                      },
 *              },
 *      },
 * }
 */
export function normalizeResponse(
    doc: OpenAPIV2.Document,
    resObj: OpenAPIV2.ResponseObject,
): CanonicalResponse {
    const canonicalResponse: CanonicalResponse = {};
    if (resObj.description !== undefined) {
        canonicalResponse.description = resObj.description;
    }

    if (resObj.schema) {
        const contentType = doc.produces?.[0] || "application/json";
        canonicalResponse.content = {
            [contentType]: {
                schema: toCanonicalSchema(resObj.schema),
            },
        };
    }
    return canonicalResponse;
}

/**
 * 문서화용 메타데이터(operationId, summary, description, tags) 추출
 * @example
 * const operation = {
 *      operationId: "getUser",
 *      summary: "Get user",
 *      description: "Get user by ID",
 *      tags: ["User"],
 * };
 * const docMetadata = extractDocMetadata(operation);
 * // Result
 * {
 *      operationId: "getUser",
 *      summary: "Get user",
 *      description: "Get user by ID",
 *      tags: ["User"],
 * }
 */
export function extractDocMetadata(
    operation: OpenAPIV2.OperationObject,
): CanonicalOperationDoc {
    const docMetadata: CanonicalOperationDoc = {};
    if (operation.operationId !== undefined)
        docMetadata.operationId = operation.operationId;
    if (operation.summary !== undefined)
        docMetadata.summary = operation.summary;
    if (operation.description !== undefined)
        docMetadata.description = operation.description;
    if (operation.tags !== undefined) docMetadata.tags = operation.tags;

    return docMetadata;
}
