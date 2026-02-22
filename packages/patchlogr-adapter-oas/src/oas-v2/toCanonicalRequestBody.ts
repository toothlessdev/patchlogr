import type { CanonicalBody } from "@patchlogr/types";
import type { OpenAPIV2 } from "openapi-types";
import { toCanonicalSchema } from "../oas-common/toCanonicalSchema";

/**
 * 요청 본문(Request Body)을 CanonicalBody로 변환
 * - body 파라미터가 있으면 이를 기반으로 CanonicalBody를 생성
 * - formData 파라미터가 있으면 이를 객체 스키마로 변환하여 CanonicalBody를 생성
 *
 * @example
 * const canonicalBody = toCanonicalBody(doc, operation, bodyParam, formDataParams);
 */
export function toCanonicalBody(
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
        return formDataToCanonicalBody(doc, operation, formDataParams);
    }

    return undefined;
}

/**
 * FormData 파라미터 목록을 하나의 객체 스키마로 변환하여 CanonicalBody를 생성
 * - 각 파라미터를 객체의 프로퍼티로 변환
 * - consumes 필드를 참조하여 컨텐츠 타입 결정 (기본: application/x-www-form-urlencoded)
 */
function formDataToCanonicalBody(
    doc: OpenAPIV2.Document,
    operation: OpenAPIV2.OperationObject,
    formDataParams: OpenAPIV2.GeneralParameterObject[],
): CanonicalBody {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const param of formDataParams) {
        const {
            name,
            in: inParam,
            required: requiredParam,
            description,
            allowEmptyValue,
            items,
            ...schemaProps
        } = param;

        properties[name] = {
            ...schemaProps,
        };

        if (items) {
            properties[name].items = toCanonicalSchema(items);
        }
        if (description) {
            properties[name].description = description;
        }
        if (requiredParam) {
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
    };

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
