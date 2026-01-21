export function stableStringify(obj: Record<string, unknown>) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}
