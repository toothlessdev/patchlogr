export type Partition = {
    hash: string;
    operationKey: string;
};

export type PartitionedSpec = {
    hash: string;
    metadata: Record<string, unknown>;
    partitions: Map<string, Partition[]>;
};
