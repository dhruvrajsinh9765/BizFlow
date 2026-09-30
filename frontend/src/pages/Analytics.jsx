import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    CalendarDays,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import dashboardService from "../services/dashboardService";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const PERIODS = {
    "30D": {
        label: "30D",
        months: 1,
        days: 30,
    },
    "3M": {
        label: "3M",
        months: 3,
    },
    "6M": {
        label: "6M",
        months: 6,
    },
    "1Y": {
        label: "1Y",
        months: 12,
    },
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => {
    return currencyFormatter.format(Number(value) || 0);
};

const formatNumber = (value = 0) => {
    return numberFormatter.format(Number(value) || 0);
};

const formatPercent = (value = 0) => {
    return `${Number(value || 0).toFixed(0)}%`;
};

const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getMonthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
};

const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);

    const date = new Date(year, month - 1, 1);

    return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
};

const getPeriodDates = (periodKey) => {
    const config = PERIODS[periodKey];

    const currentEnd = new Date();
    currentEnd.setHours(0, 0, 0, 0);

    let currentStart;

    if (periodKey === "30D") {
        // Exactly 30 calendar days, including today.
        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() - 29);
    } else {
        // Calendar periods:
        // 3M -> current month + previous 2 months
        // 6M -> current month + previous 5 months
        // 1Y -> current month + previous 11 months
        currentStart = new Date(
            currentEnd.getFullYear(),
            currentEnd.getMonth() - (config.months - 1),
            1
        );
    }

    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);

    let previousStart;

    if (periodKey === "30D") {
        // Previous period is the 30 days immediately
        // before the current 30-day period.
        previousStart = new Date(previousEnd);
        previousStart.setDate(
            previousStart.getDate() - 29
        );
    } else {
        // Previous calendar period has the same number
        // of months as the current period.
        previousStart = new Date(
            previousEnd.getFullYear(),
            previousEnd.getMonth() - (config.months - 1),
            1
        );
    }

    return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
    };
};

const calculateChange = (current, previous) => {
    const currentValue = Number(current) || 0;
    const previousValue = Number(previous) || 0;

    if (previousValue === 0) {
        return null;
    }

    return (
        ((currentValue - previousValue) /
            Math.abs(previousValue)) *
        100
    );
};

const calculateProfitMargin = (income, profit) => {
    const totalIncome = Number(income) || 0;
    const totalProfit = Number(profit) || 0;

    if (totalIncome === 0) {
        return 0;
    }

    return (totalProfit / totalIncome) * 100;
};

const getComparisonColor = (change, inverse = false) => {
    if (change === null || change === undefined) {
        return "text-slate-400";
    }

    const positive = change >= 0;

    if (inverse) {
        return positive
            ? "text-red-400"
            : "text-emerald-400";
    }

    return positive
        ? "text-emerald-400"
        : "text-red-400";
};

const getComparisonIcon = (change) => {
    if (change === null || change === undefined) {
        return null;
    }

    return change >= 0 ? TrendingUp : TrendingDown;
};

const buildMonthlyData = (
    monthlySummary = [],
    startDate,
    endDate
) => {
    const summaryMap = new Map();

    monthlySummary.forEach((item) => {
        if (!item?.period) {
            return;
        }

        summaryMap.set(item.period, {
            income: Number(item.income) || 0,
            expense: Number(item.expense) || 0,
        });
    });

    const months = [];

    const cursor = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
    );

    const lastMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        1
    );

    while (cursor <= lastMonth) {
        const period = getMonthKey(cursor);

        const values = summaryMap.get(period) || {
            income: 0,
            expense: 0,
        };

        const profit = values.income - values.expense;

        months.push({
            period,
            label: getMonthLabel(period),
            income: values.income,
            expense: values.expense,
            profit,
            margin: calculateProfitMargin(
                values.income,
                profit
            ),
        });

        cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
};

const Analytics = () => {
    const [selectedPeriod, setSelectedPeriod] =
        useState("30D");

    const [analytics, setAnalytics] = useState(null);
    const [previousAnalytics, setPreviousAnalytics] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const requestIdRef = useRef(0);

    const fetchAnalytics = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        setLoading(true);
        setError("");

        try {
            const {
                currentStart,
                currentEnd,
                previousStart,
                previousEnd,
            } = getPeriodDates(selectedPeriod);

            const currentParams = {
                startDate: formatDateForApi(currentStart),
                endDate: formatDateForApi(currentEnd),
            };

            const previousParams = {
                startDate: formatDateForApi(previousStart),
                endDate: formatDateForApi(previousEnd),
            };

            const [
                currentData,
                previousData,
            ] = await Promise.all([
                dashboardService.getFinancialAnalytics(
                    currentParams
                ),
                dashboardService.getFinancialAnalytics(
                    previousParams
                ),
            ]);

            // Ignore responses from older requests.
            if (requestId !== requestIdRef.current) {
                return;
            }

            setAnalytics({
                ...currentData,
                _periodStart: currentStart,
                _periodEnd: currentEnd,
            });

            setPreviousAnalytics(previousData);
        } catch (requestError) {
            if (requestId !== requestIdRef.current) {
                return;
            }

            console.error(
                "Failed to fetch analytics:",
                requestError
            );

            setError(
                "Unable to load analytics right now. Please try again."
            );
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [selectedPeriod]);

    useEffect(() => {
        fetchAnalytics();

        return () => {
            requestIdRef.current += 1;
        };
    }, [fetchAnalytics]);

    const summary = analytics?.summary || {};
    const previousSummary =
        previousAnalytics?.summary || {};

    const totalIncome =
        Number(summary.totalIncome) || 0;

    const totalExpense =
        Number(summary.totalExpense) || 0;

    const balance =
        Number(summary.balance) ||
        totalIncome - totalExpense;

    const previousIncome =
        Number(previousSummary.totalIncome) || 0;

    const previousExpense =
        Number(previousSummary.totalExpense) || 0;

    const previousBalance =
        Number(previousSummary.balance) ||
        previousIncome - previousExpense;

    const incomeChange = calculateChange(
        totalIncome,
        previousIncome
    );

    const expenseChange = calculateChange(
        totalExpense,
        previousExpense
    );

    const profitChange = calculateChange(
        balance,
        previousBalance
    );

    const currentMargin = calculateProfitMargin(
        totalIncome,
        balance
    );

    const previousMargin = calculateProfitMargin(
        previousIncome,
        previousBalance
    );

    const marginChange =
        previousIncome === 0
            ? null
            : currentMargin - previousMargin;

    const monthlyData = useMemo(() => {
        if (!analytics) {
            return [];
        }

        return buildMonthlyData(
            analytics.monthlySummary || [],
            analytics._periodStart,
            analytics._periodEnd
        );
    }, [analytics]);

    const expenseBreakdown = useMemo(() => {
        const categories =
            analytics?.categorySummary || [];

        return categories
            .filter(
                (category) =>
                    category.type === "expense"
            )
            .map((category) => ({
                ...category,
                total: Number(category.total) || 0,
            }))
            .filter((category) => category.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [analytics]);

    const incomeBreakdown = useMemo(() => {
        const categories =
            analytics?.categorySummary || [];

        return categories
            .filter(
                (category) =>
                    category.type === "income"
            )
            .map((category) => ({
                ...category,
                total: Number(category.total) || 0,
            }))
            .filter((category) => category.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [analytics]);

    const totalExpenseBreakdown =
        expenseBreakdown.reduce(
            (sum, category) => sum + category.total,
            0
        );

    const totalIncomeBreakdown =
        incomeBreakdown.reduce(
            (sum, category) => sum + category.total,
            0
        );

    const comparisonItems = [
        {
            label: "Revenue",
            current: totalIncome,
            previous: previousIncome,
        },
        {
            label: "Expenses",
            current: totalExpense,
            previous: previousExpense,
        },
        {
            label: "Profit",
            current: balance,
            previous: previousBalance,
        },
    ];

    const maxComparisonValue = Math.max(
        1,
        ...comparisonItems.flatMap((item) => [
            Math.abs(item.current),
            Math.abs(item.previous),
        ])
    );

    const getBarWidth = (value) => {
        return Math.min(
            100,
            (Math.abs(value) / maxComparisonValue) * 100
        );
    };

    const marginDomain = useMemo(() => {
        const values = monthlyData.map(
            (item) => Number(item.margin) || 0
        );

        if (values.length === 0) {
            return [0, 100];
        }

        const minimum = Math.min(0, ...values);
        const maximum = Math.max(100, ...values);

        const range = maximum - minimum;
        const padding = Math.max(range * 0.1, 5);

        return [
            Math.floor(minimum - padding),
            Math.ceil(maximum + padding),
        ];
    }, [monthlyData]);

    const periodConfig = PERIODS[selectedPeriod];

    const isInitialLoading = loading && !analytics;

    if (isInitialLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!analytics && error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="w-full max-w-md">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-white">
                            Analytics unavailable
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchAnalytics}
                            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                        >
                            Retry
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 text-sm text-slate-500">
                        Workspace / Analytics
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        Analytics
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Go beyond totals and understand movement behind your numbers.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
                    {Object.keys(PERIODS).map((period) => (
                        <button
                            key={period}
                            type="button"
                            onClick={() =>
                                setSelectedPeriod(period)
                            }
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                selectedPeriod === period
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error while retaining previous data */}
            {error && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchAnalytics}
                        className="shrink-0 rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Updating indicator */}
            {loading && (
                <div className="flex items-center justify-end">
                    <span className="text-xs text-slate-500">
                        Updating analytics...
                    </span>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Revenue
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-white">
                                {formatCurrency(totalIncome)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-emerald-500/10 p-2">
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-xs">
                        {incomeChange !== null ? (
                            <>
                                {(() => {
                                    const Icon =
                                        getComparisonIcon(
                                            incomeChange
                                        );

                                    return (
                                        <Icon
                                            className={`h-3.5 w-3.5 ${getComparisonColor(
                                                incomeChange
                                            )}`}
                                        />
                                    );
                                })()}

                                <span
                                    className={getComparisonColor(
                                        incomeChange
                                    )}
                                >
                                    {Math.abs(
                                        incomeChange
                                    ).toFixed(1)}
                                    %
                                </span>

                                <span className="text-slate-500">
                                    vs previous period
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-500">
                                No previous-period data
                            </span>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Expenses
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-white">
                                {formatCurrency(totalExpense)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-red-500/10 p-2">
                            <TrendingDown className="h-5 w-5 text-red-400" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-xs">
                        {expenseChange !== null ? (
                            <>
                                {(() => {
                                    const Icon =
                                        getComparisonIcon(
                                            expenseChange
                                        );

                                    return (
                                        <Icon
                                            className={`h-3.5 w-3.5 ${getComparisonColor(
                                                expenseChange,
                                                true
                                            )}`}
                                        />
                                    );
                                })()}

                                <span
                                    className={getComparisonColor(
                                        expenseChange,
                                        true
                                    )}
                                >
                                    {Math.abs(
                                        expenseChange
                                    ).toFixed(1)}
                                    %
                                </span>

                                <span className="text-slate-500">
                                    vs previous period
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-500">
                                No previous-period data
                            </span>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Profit
                            </p>

                            <p
                                className={`mt-2 text-2xl font-semibold ${
                                    balance >= 0
                                        ? "text-white"
                                        : "text-red-400"
                                }`}
                            >
                                {formatCurrency(balance)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-indigo-500/10 p-2">
                            <TrendingUp className="h-5 w-5 text-indigo-400" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-xs">
                        {profitChange !== null ? (
                            <>
                                {(() => {
                                    const Icon =
                                        getComparisonIcon(
                                            profitChange
                                        );

                                    return (
                                        <Icon
                                            className={`h-3.5 w-3.5 ${getComparisonColor(
                                                profitChange
                                            )}`}
                                        />
                                    );
                                })()}

                                <span
                                    className={getComparisonColor(
                                        profitChange
                                    )}
                                >
                                    {Math.abs(
                                        profitChange
                                    ).toFixed(1)}
                                    %
                                </span>

                                <span className="text-slate-500">
                                    vs previous period
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-500">
                                No previous-period data
                            </span>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Margin
                            </p>

                            <p
                                className={`mt-2 text-2xl font-semibold ${
                                    currentMargin >= 0
                                        ? "text-white"
                                        : "text-red-400"
                                }`}
                            >
                                {formatPercent(
                                    currentMargin
                                )}
                            </p>
                        </div>

                        <div className="rounded-lg bg-sky-500/10 p-2">
                            <TrendingUp className="h-5 w-5 text-sky-400" />
                        </div>
                    </div>

                    <div className="mt-4 text-xs">
                        {marginChange !== null ? (
                            <span
                                className={
                                    marginChange >= 0
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                }
                            >
                                {marginChange >= 0
                                    ? "+"
                                    : ""}
                                {marginChange.toFixed(1)}
                                pp
                            </span>
                        ) : (
                            <span className="text-slate-500">
                                No previous-period data
                            </span>
                        )}

                        {marginChange !== null && (
                            <span className="ml-1.5 text-slate-500">
                                vs previous period
                            </span>
                        )}
                    </div>
                </Card>
            </div>

            {/* Revenue / Expenses / Profit Chart */}
            <Card>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">
                            Revenue, expenses & profit
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Monthly trend
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
                            data={monthlyData}
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
                                type="monotone"
                                dataKey="profit"
                                name="Profit"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill="url(#profitGradient)"
                            />

                            <Line
                                type="monotone"
                                dataKey="income"
                                name="Revenue"
                                stroke="#34d399"
                                strokeWidth={2}
                                dot={false}
                            />

                            <Line
                                type="monotone"
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

            {/* Comparison + Margin */}
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
                            Monthly margin
                        </p>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <LineChart
                                data={monthlyData}
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
                                    type="monotone"
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

            {/* Breakdown */}
            <div className="grid gap-6 xl:grid-cols-2">
                {/* Expense Breakdown */}
                <Card>
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-white">
                            Expense breakdown
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Where your money is going
                        </p>
                    </div>

                    {expenseBreakdown.length === 0 ? (
                        <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">
                            No expense data for this period.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {expenseBreakdown.map(
                                (category) => {
                                    const share =
                                        totalExpenseBreakdown ===
                                        0
                                            ? 0
                                            : (category.total /
                                                  totalExpenseBreakdown) *
                                              100;

                                    return (
                                        <div
                                            key={
                                                category.categoryId
                                            }
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="truncate text-sm text-slate-300">
                                                    {
                                                        category.categoryName
                                                    }
                                                </span>

                                                <span className="shrink-0 text-sm font-medium text-white">
                                                    {formatCurrency(
                                                        category.total
                                                    )}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-red-400"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            share
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-1.5 text-[11px] text-slate-500">
                                                {share.toFixed(
                                                    1
                                                )}
                                                % of expenses
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </Card>

                {/* Income Breakdown */}
                <Card>
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-white">
                            Income breakdown
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Where your revenue comes from
                        </p>
                    </div>

                    {incomeBreakdown.length === 0 ? (
                        <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">
                            No income data for this period.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {incomeBreakdown.map(
                                (category) => {
                                    const share =
                                        totalIncomeBreakdown ===
                                        0
                                            ? 0
                                            : (category.total /
                                                  totalIncomeBreakdown) *
                                              100;

                                    return (
                                        <div
                                            key={
                                                category.categoryId
                                            }
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="truncate text-sm text-slate-300">
                                                    {
                                                        category.categoryName
                                                    }
                                                </span>

                                                <span className="shrink-0 text-sm font-medium text-white">
                                                    {formatCurrency(
                                                        category.total
                                                    )}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-emerald-400"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            share
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-1.5 text-[11px] text-slate-500">
                                                {share.toFixed(
                                                    1
                                                )}
                                                % of revenue
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;