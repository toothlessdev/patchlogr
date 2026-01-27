import type { HashNode } from "../partition/index.js";
import type { ChangePath, SpecChange } from "./diffChangeSet.js";

/**
 * 두 node의 children을 비교하여 added/removed change를 생성하고,
 * 공통 자식 중 hash가 다른 경우 재귀 비교가 필요한 쌍을 반환
 * @param base 기준 node
 * @param head 비교 대상 node
 * @param path 현재 경로 (base.key 포함)
 */
export function diffChildNodes<K, V>(
    base: HashNode<K, V>,
    head: HashNode<K, V>,
    path: ChangePath<K>,
): {
    changes: SpecChange<K, V>[];
    modifiedPairs: Array<{ base: HashNode<K, V>; head: HashNode<K, V> }>;
} {
    const changes: SpecChange<K, V>[] = [];
    const modifiedPairs: Array<{ base: HashNode<K, V>; head: HashNode<K, V> }> =
        [];

    const baseChildren = base.children ?? [];
    const headChildren = head.children ?? [];

    const baseChildMap = new Map<K, HashNode<K, V>>();
    const headChildMap = new Map<K, HashNode<K, V>>();

    for (const child of baseChildren) {
        baseChildMap.set(child.key, child);
    }
    for (const child of headChildren) {
        headChildMap.set(child.key, child);
    }

    // Removed children (base에만 존재)
    for (const [key, baseChild] of baseChildMap) {
        if (!headChildMap.has(key)) {
            const childPath = [...path, key];
            const change: SpecChange<K, V> = {
                type: "removed",
                path: childPath,
                key: key,
                baseHash: baseChild.hash,
                baseNodeType: baseChild.type,
            };

            if (baseChild.type === "leaf" && baseChild.value !== undefined) {
                change.baseValue = baseChild.value;
            }
            changes.push(change);
        }
    }

    // Added children (head에만 존재)
    for (const [key, headChild] of headChildMap) {
        if (!baseChildMap.has(key)) {
            const childPath = [...path, key];
            const change: SpecChange<K, V> = {
                type: "added",
                path: childPath,
                key: key,
                headHash: headChild.hash,
                headNodeType: headChild.type,
            };

            if (headChild.type === "leaf" && headChild.value !== undefined) {
                change.headValue = headChild.value;
            }
            changes.push(change);
        }
    }

    // Modified pairs (공통 자식 중 hash가 다른 경우)
    for (const [key, baseChild] of baseChildMap) {
        const headChild = headChildMap.get(key);
        if (headChild && baseChild.hash !== headChild.hash) {
            modifiedPairs.push({ base: baseChild, head: headChild });
        }
    }

    return { changes, modifiedPairs };
}
