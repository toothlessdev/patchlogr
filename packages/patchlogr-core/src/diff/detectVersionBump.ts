import { classifyChange } from "./classifyChange.js";
import type { SpecChangeSet } from "./diffChangeSet.js";

export type VersionBump = "major" | "minor" | "patch" | "none";

export type VersionBumpResult = {
    recommendedBump: VersionBump;
    isBreaking: boolean;
    reasons: string[];
};

export function detectVersionBump<K>(
    changeSet: SpecChangeSet<K>,
): VersionBumpResult {
    if (changeSet.changes.length === 0) {
        return {
            recommendedBump: "none",
            isBreaking: false,
            reasons: [],
        };
    }

    const reasons: string[] = [];
    let maxBump: VersionBump = "none";

    for (const change of changeSet.changes) {
        const bump = classifyChange(change);

        if (bump.level === "major") {
            maxBump = "major";
        } else if (bump.level === "minor" && maxBump !== "major") {
            maxBump = "minor";
        } else if (bump.level === "patch" && maxBump === "none") {
            maxBump = "patch";
        }
        reasons.push(bump.reason);
    }

    return {
        recommendedBump: maxBump,
        isBreaking: maxBump === "major",
        reasons,
    };
}
