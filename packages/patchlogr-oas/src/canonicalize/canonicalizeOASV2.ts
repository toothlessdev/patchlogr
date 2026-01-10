import {
    CanonicalOperation,
    CanonicalParam,
    CanonicalSpec,
    HTTPMethod,
    OperationKey,
    CanonicalResponse,
    CanonicalBody,
    CanonicalOperationDoc,
    CanonicalSecurityRequirement,
} from "@patchlogr/types";
import { OpenAPIV2 } from "openapi-types";
import { toCanonicalSchema } from "../utils/toCanonicalSchema";

const HTTP_METHODS = [
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
] as const;

export function canonicalizeOASV2(doc: OpenAPIV2.Document): CanonicalSpec {
    const operations: Record<OperationKey, CanonicalOperation> = {};

    if (!doc.paths) {
        return {
            info: doc.info,
            operations,
        };
    }

    for (const [path, pathItem] of Object.entries(doc.paths)) {
        if (!pathItem) continue;

        const pathParams = (pathItem.parameters ||
            []) as OpenAPIV2.ParameterObject[];

        for (const method of HTTP_METHODS) {
            const operation = pathItem[method] as OpenAPIV2.OperationObject;
            if (!operation) continue;

            const canonicalOp = createCanonicalOperation(
                doc,
                method,
                path,
                operation,
                pathParams,
            );
            operations[canonicalOp.key] = canonicalOp;
        }
    }

    return {
        info: doc.info,
        operations,
    };
}

export function createCanonicalOperation(
    doc: OpenAPIV2.Document,
    method: string,
    path: string,
    operation: OpenAPIV2.OperationObject,
    pathParams: OpenAPIV2.ParameterObject[],
): CanonicalOperation {
    const operationKey: OperationKey = `${method.toUpperCase() as HTTPMethod} ${path}`;

    const operationParams = (operation.parameters ||
        []) as OpenAPIV2.ParameterObject[];
    const allParams = [...pathParams, ...operationParams];

    const { requestParams, formDataParams, bodyParam } =
        categorizeParameters(allParams);

    const requestBody = processRequestBody(
        doc,
        operation,
        bodyParam,
        formDataParams,
    );
    const responses = processResponses(doc, operation.responses);
    const docMetadata = extractDocMetadata(operation);

    const canonicalOp: CanonicalOperation = {
        key: operationKey,
        method: method.toUpperCase() as HTTPMethod,
        path,
        request: {
            params: requestParams,
        },
        responses,
        doc: docMetadata,
    };

    if (operation.deprecated !== undefined) {
        canonicalOp.deprecated = operation.deprecated;
    }
    if (operation.security !== undefined) {
        canonicalOp.security =
            operation.security as CanonicalSecurityRequirement[];
    }
    if (requestBody !== undefined) {
        canonicalOp.request.body = requestBody;
    }

    return canonicalOp;
}

export function categorizeParameters(allParams: OpenAPIV2.ParameterObject[]) {
    const requestParams: CanonicalParam[] = [];
    const formDataParams: OpenAPIV2.GeneralParameterObject[] = [];
    let bodyParam: OpenAPIV2.InBodyParameterObject | undefined;

    for (const param of allParams) {
        if ("$ref" in param) continue;

        if (param.in === "body") {
            bodyParam = param as OpenAPIV2.InBodyParameterObject;
        } else if (param.in === "formData") {
            formDataParams.push(param as OpenAPIV2.GeneralParameterObject);
        } else {
            requestParams.push(normalizeGeneralParam(param));
        }
    }

    return { requestParams, formDataParams, bodyParam };
}

export function normalizeGeneralParam(
    param: OpenAPIV2.ParameterObject,
): CanonicalParam {
    const generalParam = param as OpenAPIV2.GeneralParameterObject;
    const paramObj: CanonicalParam = {
        name: generalParam.name,
        in: generalParam.in as CanonicalParam["in"],
        required: generalParam.required || false,
    };

    if (generalParam.description !== undefined) {
        paramObj.description = generalParam.description;
    }

    paramObj.schema = {
        type: generalParam.type as string,
    };

    if (generalParam.format !== undefined)
        paramObj.schema.format = generalParam.format;
    if (generalParam.items !== undefined)
        paramObj.schema.items = toCanonicalSchema(generalParam.items);
    if (generalParam.enum !== undefined)
        paramObj.schema.enum = generalParam.enum;
    if (generalParam.default !== undefined)
        paramObj.schema.default = generalParam.default;

    return paramObj;
}

export function processRequestBody(
    doc: OpenAPIV2.Document,
    operation: OpenAPIV2.OperationObject,
    bodyParam: OpenAPIV2.InBodyParameterObject | undefined,
    formDataParams: OpenAPIV2.GeneralParameterObject[],
): CanonicalBody | undefined {
    if (bodyParam) {
        return {
            required: bodyParam.required || false,
            content: {
                [doc.consumes?.[0] || "application/json"]: {
                    schema: toCanonicalSchema(bodyParam.schema),
                },
            },
        };
    }

    if (formDataParams.length > 0) {
        return processFormData(doc, operation, formDataParams);
    }

    return undefined;
}

export function processFormData(
    doc: OpenAPIV2.Document,
    operation: OpenAPIV2.OperationObject,
    formDataParams: OpenAPIV2.GeneralParameterObject[],
): CanonicalBody {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const param of formDataParams) {
        // Copy standard schema properties from the parameter
        // We exclude parameter-specific fields like 'name', 'in', 'required' (handled separately), 'description' (maybe?), 'allowEmptyValue', etc.
        // But simply copying everything except specific ones or whitelist is safer.
        // Let's iterate and copy properties that are valid in JSON Schema.
        const {
            name,
            in: inParam,
            required: requiredParam,
            description, // Description might be useful to keep on the property? Yes.
            allowEmptyValue,
            items,
            ...schemaProps
        } = param as any;

        properties[name] = {
            ...schemaProps,
        };

        if (items) {
            properties[name].items = toCanonicalSchema(items);
        }

        // Also keep description on the property level if desired for consistency with body schema
        if (description) {
            properties[name].description = description;
        }

        if (param.required) {
            required.push(param.name);
        }
    }

    const contentType =
        operation.consumes?.[0] ||
        doc.consumes?.[0] ||
        "application/x-www-form-urlencoded";

    const schema = {
        type: "object",
        properties,
    } as any;

    const requiredSet = new Set(required);
    for (const propKey of Object.keys(properties)) {
        properties[propKey].required = requiredSet.has(propKey);
    }

    return {
        required: formDataParams.some((p) => p.required),
        content: {
            [contentType]: {
                schema,
            },
        },
    };
}

export function processResponses(
    doc: OpenAPIV2.Document,
    responses: OpenAPIV2.ResponsesObject,
): Record<string, CanonicalResponse> {
    const result: Record<string, CanonicalResponse> = {};

    for (const [code, response] of Object.entries(responses)) {
        if (!response || "$ref" in response) continue;
        const resObj = response as OpenAPIV2.ResponseObject;
        result[code] = normalizeResponse(doc, resObj);
    }

    return result;
}

export function normalizeResponse(
    doc: OpenAPIV2.Document,
    resObj: OpenAPIV2.ResponseObject,
): CanonicalResponse {
    const canonicalResponse: CanonicalResponse = {};
    if (resObj.description !== undefined) {
        canonicalResponse.description = resObj.description;
    }

    if (resObj.schema) {
        const contentType = doc.produces?.[0] || "application/json";
        canonicalResponse.content = {
            [contentType]: {
                schema: toCanonicalSchema(resObj.schema),
            },
        };
    }
    return canonicalResponse;
}

export function extractDocMetadata(
    operation: OpenAPIV2.OperationObject,
): CanonicalOperationDoc {
    const docMetadata: CanonicalOperationDoc = {};
    if (operation.operationId !== undefined)
        docMetadata.operationId = operation.operationId;
    if (operation.summary !== undefined)
        docMetadata.summary = operation.summary;
    if (operation.description !== undefined)
        docMetadata.description = operation.description;
    if (operation.tags !== undefined) docMetadata.tags = operation.tags;

    return docMetadata;
}
