import {useViewConfig} from "../lib/view-config.tsx";
import {useEffect, useState} from "react";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "../components/ui/chart.tsx";
import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "../components/ui/card.tsx";
import {EntityComboBox} from "../components/entity-combobox.tsx";
import {AssetActions} from "./assets/AssetView.tsx";
import {TransactionItem} from "./payments/Payments.tsx";
import type {Asset} from "../lib/types.ts";
import {Button} from "../components/ui/button.tsx";
import {ArrowDownUp} from "react-bootstrap-icons";

export default function DashboardView() {
    const {setViewConfig} = useViewConfig();

    useEffect(() => {
        setViewConfig({
            toolbar: <h2>Dashboard</h2>
        })
    }, [])

    const data = []
    const today = Date.now();
    let plannedAmount = 152
    let bookedAmount = 152
    for (let i = 0; i < 60; i++) {
        const date = today - (30 * 1000 * 60 * 60 * 24) + (i * 1000 * 60 * 60 * 24);
        const planned = Math.random() > 0.5 ? plannedAmount : plannedAmount + Math.random() * 15;
        plannedAmount = planned;

        const booked = Math.random() > 0.5 ? bookedAmount : bookedAmount + Math.random() * 15;
        bookedAmount = booked;

        data.push({
            date: date,
            planned: planned,
            booked: i <= 30 ? booked : undefined
        })
    }

    const chartConfig = {
        planned: {
            label: "Planned",
            color: "red",
        },
        booked: {
            label: "Booked",
            color: "green",
        }
    } satisfies ChartConfig;

    const [asset, setAsset] = useState<Asset | null>(null)

    return (
        <div>
            <div className={"flex gap-3 mb-4"}>
                <div className={"grid w-48"}>
                    <EntityComboBox emptyLabel={"Asset"}
                                    value={asset}
                                    onChange={setAsset}
                                    keyGenerator={a => a.name}
                                    render={AssetActions.format}
                                    actions={AssetActions}
                                    form={null}
                                    i18nKey={"asset"}/>
                </div>
            </div>
            <div className={"gap-4 flex"}>
                <Card className={"grow"}>
                    <CardHeader>
                        <CardTitle>Asset value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <AreaChart accessibilityLayer
                                       data={data}
                                       margin={{
                                           left: 12,
                                           right: 12
                                       }}>
                                <CartesianGrid vertical={false}/>
                                <XAxis dataKey="date"
                                       tickLine={false}
                                       axisLine={false}
                                       tickCount={10}
                                       tickFormatter={(value) => {
                                           return new Date(value).toLocaleDateString(undefined, {
                                               day: "numeric",
                                               month: "short"
                                           });
                                       }}/>

                                <YAxis tickLine={false}
                                       axisLine={false}/>

                                <ChartTooltip cursor={true}
                                              content={<ChartTooltipContent hideLabel/>}/>

                                <ReferenceLine x={today}
                                               label={{value: "Future", position: "insideTopLeft"}}/>
                                <ReferenceLine x={today}
                                               label={{value: "Actual", position: "insideTopRight"}}/>

                                <Area
                                    dataKey="planned"
                                    type="step"
                                    fill="var(--color-planned)"
                                    fillOpacity={0}
                                    stroke="var(--color-planned)"/>

                                <Area
                                    dataKey="booked"
                                    type="step"
                                    fill="var(--color-booked)"
                                    fillOpacity={0}
                                    stroke="var(--color-booked)"/>
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className={"w-96"}>
                    <CardHeader className={"flex items-center"}>
                        <CardTitle>Upcoming payments</CardTitle>
                        <CardAction className={"ml-auto"}><Button className={"ml-auto"} size={"icon-sm"}>+</Button></CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className={"flex flex-col gap-3"}>
                            <TransactionItem transaction={{name: "Server NetCup", amount: -70, asset: {name: "Euros"}, date: new Date(), wallet: {name: "Tagesgeltkonto"}}}/>
                            <TransactionItem transaction={{name: "Jetbrains All-Products Pack", amount: -29, asset: {name: "Euros"}, date: new Date(), wallet: {name: "Tagesgeltkonto"}}}/>
                            <TransactionItem transaction={{name: "Trade Republic", amount: 500, asset: {name: "Euros"}, date: new Date(), wallet: {name: "TR Holdings"}}}/>
                            <ArrowDownUp className={"ml-auto mr-auto my-[-1.25rem] z-10 outline size-6 bg-white p-1 rounded-md"}/>
                            <TransactionItem transaction={{name: "Trade Republic", amount: -500, asset: {name: "Euros"}, date: new Date(), wallet: {name: "Tagesgeltkonto"}}}/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}