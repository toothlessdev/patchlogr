import type { HashNode } from "../partition";
import type { ChangePath, SpecChange, SpecChangeSet } from "./diffChangeSet";
import { diffLeafNodes } from "./diffLeafNodes";
import { diffTypeChange } from "./diffTypeChange";
import { diffChildNodes } from "./diffChildNodes";

export function diffNode<K, V>(
    base: HashNode<K, V>,
    head: HashNode<K, V>,
    path: ChangePath<K> = [],
): SpecChangeSet<K, V> {
    const changes: SpecChange<K, V>[] = [];
    const currentPath = [...path, base.key];

    if (base.hash === head.hash) {
        return {
            baseHash: base.hash,
            headHash: head.hash,
            changes: [],
        };
    }

    if (base.type !== head.type) {
        changes.push(diffTypeChange(base, head, currentPath));
        return {
            baseHash: base.hash,
            headHash: head.hash,
            changes,
        };
    }

    if (base.type === "leaf" && head.type === "leaf") {
        changes.push(diffLeafNodes(base, head, currentPath));
        return {
            baseHash: base.hash,
            headHash: head.hash,
            changes,
        };
    }

    if (base.type === "node" && head.type === "node") {
        const { changes: childChanges, modifiedPairs } = diffChildNodes(
            base,
            head,
            currentPath,
        );
        changes.push(...childChanges);

        for (const pair of modifiedPairs) {
            const childResult = diffNode(pair.base, pair.head, currentPath);
            changes.push(...childResult.changes);
        }
    }

    return {
        baseHash: base.hash,
        headHash: head.hash,
        changes,
    };
}
