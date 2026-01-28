export type ChangeType = "added" | "removed" | "modified" | "type_changed";

export type ChangePath<K> = K[];

export type SpecChange<K = string, V = unknown> = {
    type: ChangeType;
    path: ChangePath<K>;
    key: K;
    baseHash?: string;
    headHash?: string;

    baseValue?: V;
    headValue?: V;

    baseNodeType?: "node" | "leaf";
    headNodeType?: "node" | "leaf";
};

export type SpecChangeSet<K = string, V = unknown> = {
    baseHash: string;
    headHash: string;
    changes: SpecChange<K, V>[];
};
