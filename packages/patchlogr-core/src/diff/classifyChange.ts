import type { VersionBump } from "./detectVersionBump";
import type { SpecChange } from "./diffChangeSet";

export type ChangeClassification = {
    level: VersionBump;
    reason: string;
};

export function classifyChange<K>(change: SpecChange<K>): ChangeClassification {
    const pathStr = change.path.map(String).join(" > ");
    const keyStr = String(change.key);

    switch (change.type) {
        case "removed":
            // operation 삭제, 필드 삭제 등
            return {
                level: "major",
                reason: `Removed: ${pathStr} > ${keyStr}`,
            };

        case "type_changed":
            // node, leaf 타입 변경
            return {
                level: "major",
                reason: `Type changed at: ${pathStr} > ${keyStr} (${change.baseNodeType} → ${change.headNodeType})`,
            };

        case "added":
            // 새로운 operation, 필드 추가
            return {
                level: "minor",
                reason: `Added: ${pathStr} > ${keyStr}`,
            };

        case "modified":
            // TODO: required 추가 => major, description 변경 => patch ...
            return {
                level: "minor",
                reason: `Modified: ${pathStr} > ${keyStr}`,
            };

        default:
            return {
                level: "patch",
                reason: `Unknown change at: ${pathStr} > ${keyStr}`,
            };
    }
}
