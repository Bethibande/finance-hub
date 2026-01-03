import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import i18next from "i18next";
import {Button} from "@/components/ui/button.tsx";
import type {RecurringPaymentDTO} from "@/generated";
import {RecurringPaymentApi} from "@/views/recurring/RecurringPaymentFunctions.ts";
import {showError} from "@/lib/errors.tsx";

interface ForceOverwriteDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    payment: RecurringPaymentDTO | null;
}

export function ForceOverwriteDialog(props: ForceOverwriteDialogProps) {
    return (
        <Dialog open={props.open} onOpenChange={props.setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{i18next.t("recurring.forceOverwrite.title")}</DialogTitle>
                </DialogHeader>

                <div>
                    <p>{i18next.t("recurring.forceOverwrite.description")}</p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => props.setOpen(false)}>
                        {i18next.t("cancel")}
                    </Button>
                    <Button variant="destructive" onClick={() => {
                        RecurringPaymentApi.apiV2RecurringIdUpdatePaymentsPost({
                            id: props.payment!.id!,
                            overwriteModified: true
                        }).then(() => props.setOpen(false)).catch(showError)
                    }}>
                        {i18next.t("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}