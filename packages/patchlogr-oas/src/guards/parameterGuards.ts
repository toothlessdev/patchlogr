import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { CanonicalParam } from "@patchlogr/types";

export function isV2GeneralParameter(
    param: OpenAPIV2.ParameterObject,
): param is OpenAPIV2.GeneralParameterObject {
    return param.in !== "body";
}

export function isV3ParameterObject(
    param: any,
): param is OpenAPIV3.ParameterObject {
    return (
        typeof param === "object" &&
        param !== null &&
        "course" in param === false &&
        typeof param.name === "string" &&
        typeof param.in === "string"
    );
}

export function isValidCanonicalParamIn(
    val: string,
): val is CanonicalParam["in"] {
    return ["query", "header", "path", "cookie"].includes(val);
}
