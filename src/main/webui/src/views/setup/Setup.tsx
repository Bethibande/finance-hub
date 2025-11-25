import CreateWorkspaceCard from "./CreateWorkspaceCard.tsx";
import {buildClient} from "@/lib/api.ts";
import {useEffect, useState} from "react";
import CreateUserCard from "./CreateUserCard.tsx";
import {useNavigate} from "react-router";
import SetupCompleteCard from "./SetupCompleteCard.tsx";

type SetupStage = "CREATE_USER" | "CREATE_WORKSPACE" | "COMPLETE";

export default function Setup() {
    const client = buildClient().withBaseUrl("/api/v1/setup").build();
    const [stage, setStage] = useState<undefined | SetupStage>(undefined)
    useEffect(() => {
        client.fetch<SetupStage>("/stage").then(setStage)
    }, []);

    const navigate = useNavigate();

    function nextStage() {
        if (stage === "CREATE_USER") {
            setStage("CREATE_WORKSPACE")
        } else if (stage === "CREATE_WORKSPACE") {
            setStage("COMPLETE")
        } else if (stage === "COMPLETE") {
            navigate("/")
        }
    }

    return (
        <div className={"w-full h-full flex items-center justify-center"}>
            {stage === "CREATE_USER" && <CreateUserCard next={nextStage}/>}
            {stage === "CREATE_WORKSPACE" && <CreateWorkspaceCard next={nextStage}/>}
            {stage === "COMPLETE" && <SetupCompleteCard next={nextStage}/>}
        </div>
    );
}