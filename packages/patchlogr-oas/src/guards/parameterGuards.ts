import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { CanonicalParam } from "@patchlogr/types";

export function isValidCanonicalParamIn(
    val: string,
): val is CanonicalParam["in"] {
    return ["query", "header", "path", "cookie"].includes(val);
}
