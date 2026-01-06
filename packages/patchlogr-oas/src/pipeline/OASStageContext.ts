import { CanonicalSpec } from "@patchlogr/types";
import { OpenAPI } from "openapi-types";

export type OASStageInput = string | OpenAPI.Document;

export type OASStageContext = {
    source: OASStageInput;
    oas?: any;
    oasVersion?: string;
    canonicalSpec?: CanonicalSpec;
    meta?: {
        version?: string;
    };
};
