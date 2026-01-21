export type Partition = {
    hash: string;
    operationKey: string;
};

export type PartitionedSpec = {
    metadata: Record<string, unknown>;
    partitions: Map<string, Partition[]>;
};
