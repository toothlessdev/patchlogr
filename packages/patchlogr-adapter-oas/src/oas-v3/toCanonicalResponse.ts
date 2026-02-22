import type { CanonicalResponse } from "@patchlogr/types";
import type { OpenAPIV3 } from "openapi-types";
import { toCanonicalSchema } from "../oas-common/toCanonicalSchema";

/**
 * 응답 목록(Responses)을 CanonicalResponse 맵으로 변환
 * - 상태 코드별로 순회하며 CanonicalResponse로 변환
 *
 * @example
 * const responses = { "200": { description: "OK" } };
 * const canonical = toCanonicalResponses(responses);
 */
export function toCanonicalResponses(
    responses: OpenAPIV3.ResponsesObject | undefined,
): Record<string, CanonicalResponse> {
    const result: Record<string, CanonicalResponse> = {};

    if (!responses) return result;

    for (const [code, response] of Object.entries(responses)) {
        if ("$ref" in response) continue;
        const resObj = response as OpenAPIV3.ResponseObject;
        result[code] = toCanonicalResponse(resObj);
    }

    return result;
}

/**
 * 개별 응답 객체를 CanonicalResponse로 변환
 * - content 맵을 순회하며 미디어 타입별 스키마를 변환
 */
function toCanonicalResponse(
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
