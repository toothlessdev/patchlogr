import { preprocessOASDocument } from "@patchlogr/oas";
import { type OASStageOptions } from "@patchlogr/oas";
import type { OpenAPI } from "openapi-types";
import fs from "fs/promises";

export type RunCanonicalizeOptions = OASStageOptions & {
    output?: "stdout" | string;
};

export async function runCanonicalize(
    apiDocs: OpenAPI.Document,
    options: RunCanonicalizeOptions,
) {
    const output = await preprocessOASDocument(apiDocs, {
        skipValidation: !!options.skipValidation,
    });

    if (options.output === "stdout" || options.output === undefined) {
        console.log(JSON.stringify(output, null, 2));
    } else {
        try {
            await fs.writeFile(options.output, JSON.stringify(output, null, 2));
        } catch (error) {
            console.error(`Failed to write to file ${options.output}:`, error);
        }
    }
}
