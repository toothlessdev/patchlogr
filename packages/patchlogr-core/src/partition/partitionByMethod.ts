import type {
    CanonicalSpec,
    HTTPMethod,
    CanonicalOperation,
} from "@patchlogr/types";

import type { HashNode } from "./types/hashNode";
import type { PartitionedSpec } from "./types/partitionedSpec";
import type { HashObject } from "./types/hashObject";

import { createSHA256Hash } from "../utils/createHash";
import stableStringify from "fast-json-stable-stringify";

export function partitionByMethod(
    spec: CanonicalSpec,
): PartitionedSpec<string, CanonicalOperation> {
    const methodGroups = new Map<
        HTTPMethod,
        Array<{ key: string; operation: CanonicalOperation }>
    >();
    const hashObjects: HashObject<CanonicalOperation>[] = [];

    Object.entries(spec.operations).forEach(([key, operation]) => {
        if (!methodGroups.has(operation.method)) {
            methodGroups.set(operation.method, []);
        }
        methodGroups.get(operation.method)?.push({
            key: key,
            operation,
        });
    });

    const methodNodes: HashNode<string, CanonicalOperation>[] = [];

    methodGroups.forEach((operations, method) => {
        const operationLeaves: HashNode<string, CanonicalOperation>[] =
            operations.map(({ key, operation }) => {
                const hash = createSHA256Hash(stableStringify(operation));
                hashObjects.push({ hash, data: operation });
                return {
                    type: "leaf" as const,
                    key,
                    hash,
                };
            });

        const methodHash = createSHA256Hash(
            stableStringify(operationLeaves.map((leaf) => leaf.hash)),
        );

        methodNodes.push({
            type: "node",
            key: method,
            hash: methodHash,
            children: operationLeaves,
        });
    });

    const rootHash = createSHA256Hash(
        stableStringify(methodNodes.map((node) => node.hash)),
    );

    const root: HashNode<string, CanonicalOperation> = {
        type: "node",
        key: "root",
        hash: rootHash,
        children: methodNodes,
    };

    return {
        root,
        metadata: {
            ...spec.info,
            ...spec.security,
        },
        hashObjects,
    };
}
