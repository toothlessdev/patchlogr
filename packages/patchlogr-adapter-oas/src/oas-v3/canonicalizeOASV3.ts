import type {
    CanonicalOperation,
    CanonicalSpec,
    HTTPMethod,
    OperationKey,
    CanonicalSecurityRequirement,
} from "@patchlogr/types";
import type { OpenAPIV3 } from "openapi-types";
import { toCanonicalParams } from "./toCanonicalParams";
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
    "trace",
] as const;

/**
 * OpenAPI 3.0 문서를 CanonicalSpec으로 변환합니다.
 * - paths, operation을 순회하며 정규화된 포맷으로 변환합니다.
 * - 파라미터, 바디, 응답 등을 표준화된 형태로 정리합니다.
 *
 * @param {OpenAPIV3.Document} doc - 변환할 OpenAPI 3.0 문서 객체
 * @returns {CanonicalSpec} 정규화된 API 명세 (CanonicalSpec)
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

            const canonicalOp = toCanonicalOperation(
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
 */
export function toCanonicalOperation(
    method: string,
    path: string,
    operation: OpenAPIV3.OperationObject,
    pathParams: OpenAPIV3.ParameterObject[],
): CanonicalOperation {
    const operationKey: OperationKey = `${method.toUpperCase() as HTTPMethod} ${path}`;

    const operationParams = (operation.parameters ||
        []) as OpenAPIV3.ParameterObject[];
    const allParams = [...pathParams, ...operationParams];

    const requestParams = toCanonicalParams(allParams);
    const requestBody = toCanonicalBody(operation.requestBody);
    const responses = toCanonicalResponses(operation.responses);
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
