import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import Card from "../ui/Card";

// Displays revenue, expense, and profit for the selected period.
const FinancialTrendChart = ({
    chartData,
    chartGranularityLabel,
    periodConfig,
    formatNumber,
    formatCurrency,
}) => (
<Card>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">
                            Revenue, expenses & profit
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {chartGranularityLabel} · actual transaction activity
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="rounded-md border border-slate-800 px-2 py-1">
                            {periodConfig.label}
                        </span>
                        <div className="hidden items-center gap-3 sm:flex">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                                Profit
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Revenue
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-400" />
                                Expenses
                            </span>
                        </div>
                    </div>
                </div>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="profitGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#6366f1"
                                        stopOpacity={0.25}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#6366f1"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
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
                                tick={{
                                    fill: "#64748b",
                                    fontSize: 11,
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) =>
                                    `₹${formatNumber(value)}`
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
                                labelStyle={{
                                    color: "#94a3b8",
                                    marginBottom: "4px",
                                }}
                                formatter={(value, name) => [
                                    formatCurrency(value),
                                    name,
                                ]}
                            />
                            <Area
                                type="linear"
                                dataKey="profit"
                                name="Profit"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill="url(#profitGradient)"
                            />
                            <Line
                                type="linear"
                                dataKey="income"
                                name="Revenue"
                                stroke="#34d399"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="linear"
                                dataKey="expense"
                                name="Expenses"
                                stroke="#f87171"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
);

export default FinancialTrendChart;
