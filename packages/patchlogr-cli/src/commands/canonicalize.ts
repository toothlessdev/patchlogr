import { program } from "commander";

import { preprocessOASDocument } from "@patchlogr/oas";
import { type OASStageOptions } from "@patchlogr/oas";
import type { OpenAPI } from "openapi-types";
import fs from "fs/promises";

export type CanonicalizeOptions = OASStageOptions & {
    output?: "stdout" | string;
};

export const canonicalizeCommand = program
    .command("canonicalize")
    .argument("<api-docs>", "Path to the OpenAPI specification file")
    .option("--skipValidation", "Skip validation of the OpenAPI specification")
    .option(
        "-o, --output <file>",
        "Write result to file instead of stdout (default: stdout)",
        "stdout",
    )
    .action(canonicalizeAction);

export async function canonicalizeAction(
    apiDocs: OpenAPI.Document,
    options: CanonicalizeOptions,
) {
    try {
        const rawOutput = await preprocessOASDocument(apiDocs, {
            skipValidation: !!options.skipValidation,
        });
        const output = JSON.stringify(rawOutput, null, 2);

        if (options.output === "stdout" || options.output === undefined) {
            console.log(output);
        } else {
            try {
                await fs.writeFile(options.output, output, "utf-8");
            } catch (error) {
                throw new Error(`Failed to write to file ${options.output}:`, {
                    cause: error,
                });
            }
        }
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}
