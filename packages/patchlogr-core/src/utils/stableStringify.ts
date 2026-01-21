export function stableStringify(obj: Record<string, unknown>): string {
    return JSON.stringify(sortObjectKeys(obj));
}

function sortObjectKeys(value: unknown): unknown {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(sortObjectKeys);
    }

    if (typeof value === "object") {
        const sortedObj: Record<string, unknown> = {};
        const keys = Object.keys(value).sort();

        for (const key of keys) {
            sortedObj[key] = sortObjectKeys(value[key]);
        }

        return sortedObj;
    }

    return value;
}
