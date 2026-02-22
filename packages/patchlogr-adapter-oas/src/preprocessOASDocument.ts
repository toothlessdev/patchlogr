import type { OpenAPI } from "openapi-types";
import { OASBundleStage } from "./oas-pipeline/OASBundleStage";
import { OASCanonicalizeStage } from "./oas-pipeline/OASCanonicalizeStage";
import { OASDereferenceStage } from "./oas-pipeline/OASDereferenceStage";
import type {
    OASStageOptions,
    OASStageContext,
} from "./oas-pipeline/OASStageContext";
import { OASValidationStage } from "./oas-pipeline/OASValidationStage";
import { PipelineExecutor } from "./oas-pipeline/PipelineExecutor";

export function preprocessOASDocument(
    doc: OpenAPI.Document,
    options: OASStageOptions = {},
) {
    const pipelineExecutor = new PipelineExecutor<OASStageContext>();

    pipelineExecutor.add(new OASBundleStage());
    pipelineExecutor.add(new OASValidationStage());
    pipelineExecutor.add(new OASDereferenceStage());
    pipelineExecutor.add(new OASCanonicalizeStage());

    return pipelineExecutor.run({
        source: doc,
        options,
    });
}
