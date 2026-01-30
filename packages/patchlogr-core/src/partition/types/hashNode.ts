export type Hash = string;

export type HashNode<K = string, V = unknown> = {
    type: "node" | "leaf";
    key: K;
    hash: Hash;
    children?: HashNode<K, V>[];
    value?: V;
};
