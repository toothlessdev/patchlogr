import type { HashNode } from "./HashNode";
import type { HashObject } from "./HashObject";

export type PartitionedSpec<K = string, V = unknown> = {
    root: HashNode<K, V>;
    metadata: Record<string, unknown>;
    hashObjects: HashObject<V>[];
};
