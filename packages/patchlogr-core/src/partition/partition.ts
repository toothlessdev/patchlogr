export type Hash = string;

export type HashNode<K = string, V = unknown> = {
    type: "node" | "leaf";
    key: K;
    hash: Hash;
    children?: HashNode<K, V>[];
    value?: V;
};

export type PartitionedSpec<K = string, V = unknown> = {
    root: HashNode<K, V>;
    metadata: Record<string, unknown>;
};
