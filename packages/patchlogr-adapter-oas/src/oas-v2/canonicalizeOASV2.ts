import type {
    CanonicalOperation,
    CanonicalSpec,
    HTTPMethod,
    OperationKey,
    CanonicalSecurityRequirement,
} from "@patchlogr/types";
import type { OpenAPIV2 } from "openapi-types";
import { partitionParameters } from "./partitionParameters";
import { toCanonicalBody } from "./toCanonicalRequestBody";
import { toCanonicalResponses } from "./toCanonicalResponse";
import { toCanonicalOperationDoc } from "./toCanonicalOperationDoc";

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

            const canonicalOp = toCanonicalOperation(
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
 * const op = toCanonicalOperation(
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
export function toCanonicalOperation(
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
        partitionParameters(allParams);

    const requestBody = toCanonicalBody(
        doc,
        operation,
        bodyParam,
        formDataParams,
    );
    const responses = toCanonicalResponses(doc, operation.responses);
    const docMetadata = toCanonicalOperationDoc(operation);

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
