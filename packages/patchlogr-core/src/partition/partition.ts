export type Hash = string;

export type HashInternalNode<K = string, V = unknown> = {
    type: "node";
    key: K;
    hash: Hash;
    children: HashNode<K, V>[];
};

export type HashLeafNode<K = string, V = unknown> = {
    type: "leaf";
    key: K;
    hash: Hash;
    value: V;
};

export type HashNode<K = string, V = unknown> =
    | HashInternalNode<K, V>
    | HashLeafNode<K, V>;

export type PartitionedSpec<K, V = unknown> = {
    root: HashNode<K, V>;
    metadata: Record<string, unknown>;
};
