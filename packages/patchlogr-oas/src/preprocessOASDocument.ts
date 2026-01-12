import { OpenAPI } from "openapi-types";
import { OASBundleStage } from "./pipeline/OASBundleStage";
import { OASCanonicalizeStage } from "./pipeline/OASCanonicalizeStage";
import { OASDereferenceStage } from "./pipeline/OASDereferenceStage";
import { OASStageOptions, OASStageContext } from "./pipeline/OASStageContext";
import { OASValidationStage } from "./pipeline/OASValidationStage";
import { PipelineExecutor } from "./pipeline/PipelineExecutor";

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
