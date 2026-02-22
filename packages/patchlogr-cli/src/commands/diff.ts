import { preprocessOASDocument } from "@patchlogr/adapter-oas";
import {
    detectVersionBump,
    diffSpec,
    partitionByMethod,
    partitionByTag,
    type PartitionedSpec,
} from "@patchlogr/core";

import { Command } from "commander";
import { type OpenAPI } from "openapi-types";

import fs from "fs/promises";

export type DiffOptions = {
    partition: "tag" | "method";
    output?: "stdout" | string;
    skipValidation: boolean;
};

export const diffCommand = new Command("diff")
    .description("Diff two OpenAPI Specification files")
    .argument("<base>", "Base OpenAPI Specification file")
    .argument("<head>", "Head OpenAPI Specification file")
    .option("-o, --output <file>", "Output file")
    .option("--skipValidation", "Skip validation", true)
    .option("-p, --partition <partition>", "Partition Strategy", "tag")
    .action(diffAction);

export async function diffAction(
    basePath: OpenAPI.Document,
    headPath: OpenAPI.Document,
    options: DiffOptions,
) {
    const preprocessedBase = await preprocessOASDocument(basePath, {
        skipValidation: options.skipValidation,
    });
    const preprocessedHead = await preprocessOASDocument(headPath, {
        skipValidation: options.skipValidation,
    });

    const baseCanonicalSpec = preprocessedBase.canonicalSpec;
    const headCanonicalSpec = preprocessedHead.canonicalSpec;

    if (!baseCanonicalSpec || !headCanonicalSpec) {
        throw new Error("Failed to preprocess OpenAPI Specification files");
    }

    let partitionedBase: PartitionedSpec;
    let partitionedHead: PartitionedSpec;

    switch (options.partition) {
        case "method":
            partitionedBase = partitionByMethod(baseCanonicalSpec);
            partitionedHead = partitionByMethod(headCanonicalSpec);
            break;
        case "tag":
        default:
            partitionedBase = partitionByTag(baseCanonicalSpec);
            partitionedHead = partitionByTag(headCanonicalSpec);
            break;
    }

    const specChangeSet = diffSpec(partitionedBase, partitionedHead);
    const versionBump = detectVersionBump(specChangeSet);

    if (options.output === "stdout" || options.output === undefined) {
        console.log(JSON.stringify(specChangeSet, null, 2));
        console.log(JSON.stringify(versionBump, null, 2));
    } else {
        try {
            await fs.writeFile(
                options.output.concat(".json"),
                JSON.stringify(specChangeSet, null, 2),
                "utf-8",
            );
            await fs.writeFile(
                options.output.concat(".version.json"),
                JSON.stringify(versionBump, null, 2),
                "utf-8",
            );
        } catch (error) {
            throw new Error(`Failed to write to file ${options.output}:`, {
                cause: error,
            });
        }
    }
}
