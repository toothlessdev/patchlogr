import { CanonicalSpec } from "@patchlogr/types";
import { OpenAPI } from "openapi-types";

export type OASStageInput = string | OpenAPI.Document;

export type OASStageOptions = {
    skipValidation?: boolean;
};

export type OASStageContext = {
    source: OASStageInput;
    options?: OASStageOptions;
    oas?: any;
    oasVersion?: string;
    canonicalSpec?: CanonicalSpec;
    meta?: {
        version?: string;
    };
};
