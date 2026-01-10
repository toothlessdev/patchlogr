import { OpenAPI } from "openapi-types";
import { PipelineExecutor } from "./pipeline/PipelineExecutor";
import { OASValidationStage } from "./pipeline/OASValidationStage";
import { OASCanonicalizeStage } from "./pipeline/OASCanonicalizeStage";
import { OASBundleStage } from "./pipeline/OASBundleStage";
import { OASStageContext, OASStageOptions } from "./pipeline/OASStageContext";
import { OASDereferenceStage } from "./pipeline/OASDereferenceStage";

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
