import type {
    CanonicalSpec,
    CanonicalOperation,
    OperationKey,
} from "@patchlogr/types";
import type { PartitionedSpec, HashNode } from "./partition";

import { createSHA256Hash } from "../utils/createHash";
import stableStringify from "fast-json-stable-stringify";

export const DEFAULT_TAG = "__DEFAULT__";

export function partitionByTag(
    spec: CanonicalSpec,
): PartitionedSpec<string, CanonicalOperation> {
    const tagGroups = new Map<
        string,
        Array<{ key: string; operation: CanonicalOperation }>
    >();

    Object.entries(spec.operations).forEach(([key, operation]) => {
        const tag = operation.doc?.tags?.[0] || DEFAULT_TAG;

        if (!tagGroups.has(tag)) {
            tagGroups.set(tag, []);
        }
        tagGroups.get(tag)?.push({
            key: key as OperationKey,
            operation,
        });
    });

    const tagNodes: HashNode<string, CanonicalOperation>[] = [];

    tagGroups.forEach((operations, tag) => {
        const operationLeaves: HashNode<string, CanonicalOperation>[] =
            operations.map(({ key, operation }) => ({
                type: "leaf",
                key,
                hash: createSHA256Hash(stableStringify(operation)),
                value: operation,
            }));

        const tagHash = createSHA256Hash(
            stableStringify(operationLeaves.map((leaf) => leaf.hash)),
        );

        tagNodes.push({
            type: "node",
            key: tag,
            hash: tagHash,
            children: operationLeaves,
        });
    });

    const rootHash = createSHA256Hash(
        stableStringify(tagNodes.map((node) => node.hash)),
    );

    const root: HashNode<string, CanonicalOperation> = {
        type: "node",
        key: "root",
        hash: rootHash,
        children: tagNodes,
    };

    return {
        root,
        metadata: {
            ...spec.info,
            ...spec.security,
        },
    };
}
