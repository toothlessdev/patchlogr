import type { HashNode } from "./partition";
import { createSHA256Hash } from "../utils/createHash";
import stableStringify from "fast-json-stable-stringify";

export function createNode<K, V>(
    key: K,
    hash: string,
    children: HashNode<K, V>[],
): HashNode<K, V> {
    return { type: "node", key, hash, children };
}

export function createLeafNode<K, V>(
    key: K,
    hash: string,
    value: V,
): HashNode<K, V> {
    return { type: "leaf", key, hash, value };
}
export function createHashedLeaf<K, V>(key: K, value: V): HashNode<K, V> {
    const hash = createSHA256Hash(stableStringify({ key, value }));
    return { type: "leaf", key, hash, value };
}

export function createHashedNode<K, V>(
    key: K,
    children: HashNode<K, V>[],
): HashNode<K, V> {
    const sortedChildData = children
        .map((child) => ({ key: child.key, hash: child.hash }))
        .sort((a, b) => String(a.key).localeCompare(String(b.key)));

    const hash = createSHA256Hash(
        stableStringify({ key, children: sortedChildData }),
    );
    return { type: "node", key, hash, children };
}
