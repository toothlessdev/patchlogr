import type { PartitionedSpec } from "../partition/index.js";
import type { SpecChangeSet } from "./diffChangeSet.js";
import { diffNode } from "./diffNode.js";

export function diffSpec<K extends string = string>(
    base: PartitionedSpec<K>,
    head: PartitionedSpec<K>,
): SpecChangeSet<K> {
    return diffNode(base.root, head.root);
}
