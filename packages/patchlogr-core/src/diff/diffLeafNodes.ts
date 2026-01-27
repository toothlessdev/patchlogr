import type { HashNode } from "../partition/index.js";
import type { ChangePath, SpecChange } from "./diffChangeSet.js";

/**
 * 두 leaf 노드를 비교하여 modified change를 생성
 * @param base 기준 leaf 노드
 * @param head 비교 대상 leaf 노드
 * @param path 현재 경로 (base.key 포함)
 */
export function diffLeafNodes<K, V>(
    base: HashNode<K, V>,
    head: HashNode<K, V>,
    path: ChangePath<K>,
): SpecChange<K, V> {
    const change: SpecChange<K, V> = {
        type: "modified",
        path,
        key: base.key,
        baseHash: base.hash,
        headHash: head.hash,
    };

    if (base.value !== undefined) {
        change.baseValue = base.value;
    }
    if (head.value !== undefined) {
        change.headValue = head.value;
    }

    return change;
}
