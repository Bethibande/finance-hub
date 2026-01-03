import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import i18next from "i18next";
import {Button} from "@/components/ui/button.tsx";

export interface EntityDeleteDialogProps {
    open: boolean,
    close: () => void,
    display: string;
    onDelete: () => void,
}

export function EntityDeleteDialog(props: EntityDeleteDialogProps) {
    const {open, close, display, onDelete} = props;

    return (
        <Dialog open={open} onOpenChange={() => close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{i18next.t("entity.delete.title", {name: display})}</DialogTitle>
                </DialogHeader>
                <div>
                    <p>{i18next.t("entity.delete.message")}</p>
                </div>
                <DialogFooter>
                    <Button variant={"outline"} onClick={close}>{i18next.t("cancel")}</Button>
                    <Button variant={"destructive"} onClick={onDelete}>{i18next.t("delete")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}