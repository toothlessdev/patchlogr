import { describe, expect, test } from "vitest";
import { toCanonicalOperationDoc } from "./toCanonicalOperationDoc";

describe("toCanonicalOperationDoc", () => {
    test("문서 메타데이터를 CanonicalOperationDoc으로 변환한다", () => {
        const op: any = {
            operationId: "op1",
            summary: "summary",
            description: "desc",
            tags: ["tag1"],
        };
        const result = toCanonicalOperationDoc(op);
        expect(result).toEqual({
            operationId: "op1",
            summary: "summary",
            description: "desc",
            tags: ["tag1"],
        });
    });
});
