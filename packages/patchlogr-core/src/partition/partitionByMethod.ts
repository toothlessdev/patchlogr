import type {
    CanonicalSpec,
    HTTPMethod,
    CanonicalOperation,
} from "@patchlogr/types";
import type { PartitionedSpec, HashNode } from "./partition";

import { createSHA256Hash } from "../utils/createHash";
import stableStringify from "fast-json-stable-stringify";

export function partitionByMethod(
    spec: CanonicalSpec,
): PartitionedSpec<string, CanonicalOperation> {
    const methodGroups = new Map<
        HTTPMethod,
        Array<{ key: string; operation: CanonicalOperation }>
    >();

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
            operations.map(({ key, operation }) => ({
                type: "leaf",
                key,
                hash: createSHA256Hash(stableStringify(operation)),
                value: operation,
            }));

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
    };
}
