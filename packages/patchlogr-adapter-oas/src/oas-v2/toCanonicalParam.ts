import type { CanonicalParam } from "@patchlogr/types";
import type { OpenAPIV2 } from "openapi-types";
import { toCanonicalSchema } from "../oas-common/toCanonicalSchema";

/**
 * 일반 파라미터(query, path, header)를 CanonicalParam으로 변환
 * @example
 * const param = { name: "id", in: "path", required: true, type: "integer" };
 * const canonical = toCanonicalParam(param);
 * // Result
 * {
 *      name: "id",
 *      in: "path",
 *      required: true,
 *      schema: { type: "integer" }
 * }
 */
export function toCanonicalParam(
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
    if (generalParam.collectionFormat !== undefined)
        paramObj.schema.collectionFormat = generalParam.collectionFormat;

    return paramObj;
}
