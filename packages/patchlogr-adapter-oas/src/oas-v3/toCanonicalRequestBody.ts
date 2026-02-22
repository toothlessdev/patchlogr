import type { CanonicalBody } from "@patchlogr/types";
import type { OpenAPIV3 } from "openapi-types";
import { toCanonicalSchema } from "../oas-common/toCanonicalSchema";

/**
 * RequestBody 객체를 CanonicalBody로 변환
 * - content 맵을 순회하며 미디어 타입별 스키마를 CanonicalSchema로 변환
 *
 * @example
 * const requestBody = {
 *      content: { "application/json": { schema: { type: "object" } } },
 *      required: true
 * };
 * const canonical = toCanonicalBody(requestBody);
 */
export function toCanonicalBody(
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
