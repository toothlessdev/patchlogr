import type { CanonicalResponse } from "@patchlogr/types";
import type { OpenAPIV2 } from "openapi-types";
import { toCanonicalSchema } from "../oas-common/toCanonicalSchema";

/**
 * 응답 목록(Responses)을 CanonicalResponse 맵으로 변환
 * - 상태 코드별로 순회하며 정규화 수행
 * - $ref가 있는 응답은 현재 구현에서 무시 (deref된 문서를 가정)
 *
 * @example
 * const canonicalResponses = toCanonicalResponses(doc, responses);
 */
export function toCanonicalResponses(
    doc: OpenAPIV2.Document,
    responses: OpenAPIV2.ResponsesObject,
): Record<string, CanonicalResponse> {
    const result: Record<string, CanonicalResponse> = {};

    for (const [code, response] of Object.entries(responses)) {
        if (!response || "$ref" in response) continue;
        const resObj = response as OpenAPIV2.ResponseObject;
        result[code] = toCanonicalResponse(doc, resObj);
    }

    return result;
}

/**
 * 개별 응답 객체를 CanonicalResponse로 변환
 * - description 복사
 * - schema 존재하면 `produces` 필드 참조하여 content 맵 생성
 */
function toCanonicalResponse(
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
