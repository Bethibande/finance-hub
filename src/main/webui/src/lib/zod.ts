import {z, type ZodNumber} from "zod";
import i18next from "i18next";
import {type CronExpressionOptions, CronExpressionParser} from "cron-parser";

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

export function cronExpression() {
    return z.string().superRefine((arg, ctx) => {
        if (arg.includes("@")) {
            ctx.addIssue(i18next.t("validation.invalidCronExpression"))
            return;
        }

        try {
            const options = {
                strict: true
            } satisfies CronExpressionOptions;

            CronExpressionParser.parse(arg, options)
        } catch {
            ctx.addIssue(i18next.t("validation.invalidCronExpression"))
        }
    })
}