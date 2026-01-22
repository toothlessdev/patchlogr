import type { CanonicalSpec } from "@patchlogr/types";
import type { Partition, PartitionedSpec } from "./partition";

import { createSHA256Hash } from "../utils/createHash";
import { stableStringify } from "../utils/stableStringify";

export const DEFAULT_TAG = "__DEFAULT__";

export function partitionByTag(spec: CanonicalSpec): PartitionedSpec {
    const partitions = new Map<string, Partition[]>();

    Object.entries(spec.operations).forEach(([key, operation]) => {
        const tag = operation.doc?.tags?.[0] || DEFAULT_TAG;
        const hash = createSHA256Hash(stableStringify(operation));

        if (!partitions.has(tag))
            partitions.set(tag, [{ hash, operationKey: key }]);
        else partitions.get(tag)?.push({ hash, operationKey: key });
    });

    return {
        hash: createSHA256Hash(stableStringify(spec)),
        metadata: {
            ...spec.info,
            ...spec.security,
        },
        partitions,
    };
}
