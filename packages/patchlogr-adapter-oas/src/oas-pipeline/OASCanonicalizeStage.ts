import type { CanonicalSpec } from "@patchlogr/types";
import type { OASStageContext } from "./OASStageContext";
import type { PipelineStage } from "./PipelineExecutor";
import { canonicalizeOASV2 } from "../oas-v2";
import { canonicalizeOASV3 } from "../oas-v3/canonicalizeOASV3";
import { isOpenAPIV2, isOpenAPIV3 } from "../oas-common/oasVersionUtils";

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
