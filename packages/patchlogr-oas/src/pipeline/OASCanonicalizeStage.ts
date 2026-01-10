import { CanonicalSpec } from "@patchlogr/types";
import { OASStageContext } from "./OASStageContext";
import { PipelineStage } from "./PipelineExecutor";
import { canonicalizeOASV2 } from "../canonicalize/canonicalizeOASV2";
import { canonicalizeOASV3 } from "../canonicalize/canonicalizeOASV3";

/**
 * 표준화된 CanonicalSpec로 변환
 */
export class OASCanonicalizeStage implements PipelineStage<OASStageContext> {
    async execute(input: OASStageContext): Promise<OASStageContext> {
        if (!input.oas) {
            throw new Error(
                "OAS object is missing in context. Validation stage might have failed.",
            );
        }

        let canonicalSpec: CanonicalSpec;

        if (input.oasVersion === "2.0") {
            canonicalSpec = canonicalizeOASV2(input.oas);
        } else if (input.oasVersion?.startsWith("3.")) {
            canonicalSpec = canonicalizeOASV3(input.oas);
        } else {
            throw new Error(`Unsupported OpenAPI version: ${input.oasVersion}`);
        }

        return {
            ...input,
            canonicalSpec,
        };
    }
}
