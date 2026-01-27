import type { HashNode } from "../partition/index.js";
import type { ChangePath, SpecChange } from "./diffChangeSet.js";

/**
 * 노드 타입이 변경된 경우 (node <-> leaf) change를 생성
 * @param base 기준 노드
 * @param head 비교 대상 노드
 * @param path 현재 경로 (base.key 포함)
 */
export function diffTypeChange<K, V>(
    base: HashNode<K, V>,
    head: HashNode<K, V>,
    path: ChangePath<K>,
): SpecChange<K, V> {
    const change: SpecChange<K, V> = {
        type: "type_changed",
        path,
        key: base.key,
        baseHash: base.hash,
        headHash: head.hash,
        baseNodeType: base.type,
        headNodeType: head.type,
    };

    if (base.type === "leaf" && base.value !== undefined) {
        change.baseValue = base.value;
    }
    if (head.type === "leaf" && head.value !== undefined) {
        change.headValue = head.value;
    }

    return change;
}
