import type { CanonicalSpec, HTTPMethod } from "@patchlogr/types";
import type { Partition, PartitionedSpec } from "./partition";

import { createSHA256Hash } from "../utils/createHash";
import { stableStringify } from "../utils/stableStringify";

export function partitionByMethod(spec: CanonicalSpec): PartitionedSpec {
    const partitions = new Map<HTTPMethod, Partition[]>();

    Object.entries(spec.operations).forEach(([key, operation]) => {
        const hash = createSHA256Hash(stableStringify(operation));

        if (!partitions.has(operation.method))
            partitions.set(operation.method, [{ hash, operationKey: key }]);
        else
            partitions.get(operation.method)?.push({ hash, operationKey: key });
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
