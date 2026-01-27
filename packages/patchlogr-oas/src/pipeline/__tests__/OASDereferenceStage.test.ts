import { describe, test, expect } from "vitest";
import { OASDereferenceStage } from "../OASDereferenceStage";
import type { OASStageContext } from "../OASStageContext";

describe("OASDereferenceStage", () => {
    test("input.oas가 없으면 에러를 던진다", async () => {
        const stage = new OASDereferenceStage();
        const input: OASStageContext = {
            source: "{}",
            options: {},
        };

        await expect(stage.execute(input)).rejects.toThrow(
            "OAS object is missing in context. A previous stage might have failed.",
        );
    });
});
