import { preprocessOASDocument } from "@patchlogr/oas";
import { type OASStageOptions } from "@patchlogr/oas";

export type RunCanonicalizeOptions = OASStageOptions;

export async function runCanonicalize(
    apiDocs: any,
    options: RunCanonicalizeOptions,
) {
    preprocessOASDocument(apiDocs, { ...options });
}
