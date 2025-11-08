import {toast} from "sonner";
import type {ErrorResponse} from "./types.ts";
import i18next from "i18next";

export function showHttpError(response: Response) {
    const contentLength = parseInt(response.headers.get("Content-Length") || "0")
    const contentType = response.headers.get("Content-Type") || ""

    if (contentLength > 0 && contentType.startsWith("application/json")) {
        response.json().then(json => {
            if (json satisfies ErrorResponse) {
                showErrorResponse(json)
            } else {
                showErrorMessage(response.statusText)
            }
        })
    } else {
        showErrorMessage(response.statusText)
    }
}

export function showErrorResponse(response: ErrorResponse) {
    showErrorMessage(i18next.t(response.translationKey))
}

export function showError(error: Error) {
    showErrorMessage(error.message)
}

export function showErrorMessage(message: string) {
    toast.error(message, {
        position: "top-center",
        duration: 5000,
    })
}