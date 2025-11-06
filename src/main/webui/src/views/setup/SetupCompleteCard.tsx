import SetupCard from "./SetupCard.tsx";

export default function SetupCompleteCard(props: {next: () => void}) {
    return (
        <form onSubmit={() => props.next()}>
            <SetupCard title={"setup.done.title"} description={"setup.done.description"}>
                <></>
            </SetupCard>
        </form>
    )
}