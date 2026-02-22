import type { CanonicalParam } from "@patchlogr/types";
import type { OpenAPIV2 } from "openapi-types";
import { toCanonicalParam } from "./toCanonicalParam";

/**
 * 파라미터 목록을 body / formData / 나머지(query, path, header)로 분할
 * @example
 * const params = [
 *      { in: "query", name: "name", type: "string" },
 *      { in: "body", name: "body", type: "object" },
 *      { in: "formData", name: "formData", type: "string" },
 * ];
 * const { requestParams, formDataParams, bodyParam } =
 *      partitionParameters(params);
 */
export function partitionParameters(allParams: OpenAPIV2.ParameterObject[]) {
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
            requestParams.push(toCanonicalParam(param));
        }
    }

    return { requestParams, formDataParams, bodyParam };
}
