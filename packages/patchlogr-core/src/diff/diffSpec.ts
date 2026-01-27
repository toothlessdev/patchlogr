import { PartitionedSpec } from "../partition/index.js";
import type { SpecChangeSet } from "./diffChangeSet.js";
import { diffNode } from "./diffNode.js";

export function diffSpec<K extends string = string, V = unknown>(
    base: PartitionedSpec<K, V>,
    head: PartitionedSpec<K, V>,
): SpecChangeSet<K, V> {
    return diffNode(base.root, head.root);
}
