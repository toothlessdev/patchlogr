import type { HashNode } from "./hashNode";
import type { HashObject } from "./hashObject";

export type PartitionedSpec<K = string, V = unknown> = {
    root: HashNode<K, V>;
    metadata: Record<string, unknown>;
    hashObjects: HashObject<V>[];
};
