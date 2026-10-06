import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { CalendarDays } from "lucide-react";
import Card from "../ui/Card";

// Displays period comparison and profit-margin trend.
const AnalyticsComparison = ({
    comparisonItems,
    getBarWidth,
    marginData,
    marginDomain,
    formatCurrency,
    chartGranularityLabel,
}) => (
<div className="grid gap-6 xl:grid-cols-2">
                {/* Period Comparison */}
                <Card>
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Period comparison
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Current vs previous
                            </p>
                        </div>
                        <CalendarDays className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="space-y-5">
                        {comparisonItems.map((item) => (
                            <div key={item.label}>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-slate-300">
                                        {item.label}
                                    </span>
                                    <span
                                        className={`text-sm font-medium ${
                                            item.current < 0
                                                ? "text-red-400"
                                                : "text-white"
                                        }`}
                                    >
                                        {formatCurrency(
                                            item.current
                                        )}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-16 text-[11px] text-slate-500">
                                            Current
                                        </span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{
                                                    width: `${getBarWidth(
                                                        item.current
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-16 text-[11px] text-slate-500">
                                            Previous
                                        </span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-slate-600 transition-all"
                                                style={{
                                                    width: `${getBarWidth(
                                                        item.previous
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                                    <span>
                                        Current:{" "}
                                        {formatCurrency(
                                            item.current
                                        )}
                                    </span>
                                    <span>
                                        Previous:{" "}
                                        {formatCurrency(
                                            item.previous
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                {/* Profit Margin Trend */}
                <Card>
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-white">
                            Profit margin trend
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {chartGranularityLabel} · actual margin
                        </p>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <LineChart
                                data={marginData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1e293b"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fill: "#64748b",
                                        fontSize: 11,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={marginDomain}
                                    tick={{
                                        fill: "#64748b",
                                        fontSize: 11,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) =>
                                        `${value}%`
                                    }
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor:
                                            "#0f172a",
                                        border: "1px solid #1e293b",
                                        borderRadius: "8px",
                                        color: "#f8fafc",
                                    }}
                                    formatter={(value) => [
                                        `${Number(
                                            value
                                        ).toFixed(1)}%`,
                                        "Margin",
                                    ]}
                                />
                                <Line
                                    type="linear"
                                    dataKey="margin"
                                    stroke="#38bdf8"
                                    strokeWidth={2}
                                    dot={{
                                        r: 3,
                                        fill: "#38bdf8",
                                    }}
                                    activeDot={{
                                        r: 5,
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
);

export default AnalyticsComparison;
