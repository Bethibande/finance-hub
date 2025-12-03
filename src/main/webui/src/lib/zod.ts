import type {ZodNumber} from "zod";
import i18next from "i18next";

export function requireNullable(type: ZodNumber) {
    return type.nullable().transform((value, ctx) => {
        if (value === null) {
            ctx.addIssue({
                code: 'custom',
                message: i18next.t("validation.required")
            })
        }
        return value ?? 0;
    })
}