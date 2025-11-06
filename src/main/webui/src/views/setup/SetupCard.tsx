import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "../../components/ui/card.tsx";
import i18next from "i18next";
import type {ReactNode} from "react";
import {Button} from "../../components/ui/button.tsx";
import {ChevronRight} from "react-bootstrap-icons";

export default function SetupCard(props: { title: string, description: string, children: ReactNode }) {
    const {title, description, children} = props;

    return (
        <Card className={"w-96"}>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">{i18next.t(title)}</CardTitle>
                <CardDescription>
                    {i18next.t(description)}
                </CardDescription>
            </CardHeader>
            <div className={"w-full flex flex-col items-center gap-4 px-5 justify-center"}>
                {children}
            </div>
            <CardFooter className={"w-full flex justify-end"}>
                <Button>{i18next.t("next")} <ChevronRight/></Button>
            </CardFooter>
        </Card>
    )
}