import type { HashObject } from "../partition/types/HashObject";

export interface ContentAddressableStorage<T = string> {
    get(hash: string): Promise<T | null>;

    has(hash: string): Promise<boolean>;

    put(entry: HashObject<T>): Promise<void>;
    putMany(entries: HashObject<T>[]): Promise<void>;
}
