import type { HashNode } from "../partition/index.js";
import type { ChangePath, SpecChange } from "./diffChangeSet.js";

/**
 * 두 node의 children을 비교하여 added/removed change를 생성하고,
 * 공통 자식 중 hash가 다른 경우 재귀 비교가 필요한 쌍을 반환
 * @param base 기준 node
 * @param head 비교 대상 node
 * @param path 현재 경로 (base.key 포함)
 */
export function diffChildNodes<K>(
    base: HashNode<K>,
    head: HashNode<K>,
    path: ChangePath<K>,
): {
    changes: SpecChange<K>[];
    modifiedPairs: Array<{
        base: HashNode<K>;
        head: HashNode<K>;
    }>;
} {
    const changes: SpecChange<K>[] = [];
    const modifiedPairs: Array<{
        base: HashNode<K>;
        head: HashNode<K>;
    }> = [];

    const baseChildMap = new Map(
        base.children?.map((child) => [child.key, child]),
    );
    const headChildMap = new Map(
        head.children?.map((child) => [child.key, child]),
    );

    // Removed children (base에만 존재)
    for (const [key, baseChild] of baseChildMap) {
        if (!headChildMap.has(key)) {
            const childPath = [...path, key];
            changes.push({
                type: "removed",
                path: childPath,
                key: key,
                baseHash: baseChild.hash,
                baseNodeType: baseChild.type,
            });
        }
    }

    // Added children (head에만 존재)
    for (const [key, headChild] of headChildMap) {
        if (!baseChildMap.has(key)) {
            const childPath = [...path, key];
            changes.push({
                type: "added",
                path: childPath,
                key: key,
                headHash: headChild.hash,
                headNodeType: headChild.type,
            });
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
