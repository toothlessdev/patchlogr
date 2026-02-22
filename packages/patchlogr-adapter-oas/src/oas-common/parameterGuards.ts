import type { CanonicalParam } from "@patchlogr/types";

export function isValidCanonicalParamIn(
    val: string,
): val is CanonicalParam["in"] {
    return ["query", "header", "path", "cookie"].includes(val);
}
