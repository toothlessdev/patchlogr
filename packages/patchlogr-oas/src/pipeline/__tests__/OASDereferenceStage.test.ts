import { describe, test, expect } from "vitest";
import { OASDereferenceStage } from "../OASDereferenceStage";
import { OASStageContext } from "../OASStageContext";

describe("OASDereferenceStage", () => {
    test("should throw an error if input.oas is missing", async () => {
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
