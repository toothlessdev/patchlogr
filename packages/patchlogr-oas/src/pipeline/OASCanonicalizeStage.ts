import { CanonicalSpec } from "@patchlogr/types";
import { OASStageContext } from "./OASStageContext";
import { PipelineStage } from "./PipelineExecutor";
import { canonicalizeOASV2 } from "../canonicalize/v2";
import { canonicalizeOASV3 } from "../canonicalize/v3";
import { isOpenAPIV2, isOpenAPIV3 } from "../utils/OASVersionUtils";

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

        if (isOpenAPIV2(input.oas)) {
            canonicalSpec = canonicalizeOASV2(input.oas);
        } else if (isOpenAPIV3(input.oas)) {
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
