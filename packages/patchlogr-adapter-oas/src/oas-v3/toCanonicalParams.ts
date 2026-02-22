import type { CanonicalParam } from "@patchlogr/types";
import type { OpenAPIV3 } from "openapi-types";
import { toCanonicalSchema } from "../oas-common/toCanonicalSchema";

/**
 * 파라미터(Parameter) 목록을 CanonicalParam 배열로 변환
 * - $ref가 없는 파라미터만 처리 (dereferenced 가정)
 * - name, in, required, schema 등을 매핑
 *
 * @example
 * const params = [{ name: "id", in: "path", required: true, schema: { type: "string" } }];
 * const canonical = toCanonicalParams(params);
 * // Result
 * [{ name: "id", in: "path", required: true, schema: { type: "string" } }]
 */
export function toCanonicalParams(
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
