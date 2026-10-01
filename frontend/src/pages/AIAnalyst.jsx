import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Bot,
    CheckCircle2,
    ChevronRight,
    Lightbulb,
    RefreshCw,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Badge from "../components/ui/Badge";
import insightService from "../services/insightService";

const formatCurrency = (value) => {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatPercentage = (value) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "N/A";
    }

    return `${Number(value).toFixed(1)}%`;
};

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const getChangeColor = (value, inverse = false) => {
    if (value === null || value === undefined) {
        return "text-slate-400";
    }

    const numericValue = Number(value);

    if (numericValue === 0) {
        return "text-slate-400";
    }

    const isPositive = numericValue > 0;

    if (inverse) {
        return isPositive
            ? "text-red-400"
            : "text-emerald-400";
    }

    return isPositive
        ? "text-emerald-400"
        : "text-red-400";
};

const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
        case "high":
            return "danger";

        case "medium":
            return "warning";

        case "low":
            return "info";

        default:
            return "default";
    }
};

const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
        case "high":
            return AlertTriangle;

        case "medium":
            return Target;

        default:
            return CheckCircle2;
    }
};

/*
 * Percentage changes such as -100% are mathematically valid,
 * but "No activity" is more useful when the current period
 * contains zero and the previous period contained activity.
 */
const getChangeLabel = (current, previous) => {
    const currentValue = Number(current) || 0;
    const previousValue = Number(previous) || 0;

    if (currentValue === 0 && previousValue === 0) {
        return "No activity";
    }

    if (currentValue === 0 && previousValue !== 0) {
        return "No activity";
    }

    if (previousValue === 0 && currentValue !== 0) {
        return "New activity";
    }

    const change =
        ((currentValue - previousValue) /
            Math.abs(previousValue)) *
        100;

    const sign = change > 0 ? "+" : "";

    return `${sign}${change.toFixed(1)}%`;
};

const getChangeValue = (current, previous) => {
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

const MetricCard = ({
    title,
    value,
    icon: Icon,
    iconClassName,
}) => {
    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-white">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 ${iconClassName}`}
                >
                    <Icon size={20} />
                </div>
            </div>
        </Card>
    );
};

const InsightCard = ({
    title,
    description,
    evidence,
    icon: Icon,
    iconClassName,
}) => {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex gap-3">
                <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 ${iconClassName}`}
                >
                    <Icon size={18} />
                </div>

                <div className="min-w-0">
                    <h3 className="font-medium text-white">
                        {title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                        {description}
                    </p>

                    {evidence && (
                        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                            <p className="text-xs leading-5 text-slate-300">
                                <span className="font-medium text-slate-400">
                                    Evidence:
                                </span>{" "}
                                {evidence}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConcentrationBar = ({
    category,
    total,
    percentage,
    type,
}) => {
    const isIncome = type === "income";

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-slate-200">
                    {category}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                    <span
                        className={
                            isIncome
                                ? "text-sm text-emerald-400"
                                : "text-sm text-red-400"
                        }
                    >
                        {formatCurrency(total)}
                    </span>

                    <span className="text-xs text-slate-500">
                        {percentage.toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                    className={`h-full rounded-full ${
                        isIncome
                            ? "bg-emerald-400"
                            : "bg-red-400"
                    }`}
                    style={{
                        width: `${Math.min(
                            Math.max(percentage, 0),
                            100
                        )}%`,
                    }}
                />
            </div>
        </div>
    );
};

const AIAnalyst = () => {
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadInsights = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response =
                    await insightService.getInsights();

                setData(response);
            } catch (err) {
                console.error(
                    "Failed to load AI insights:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                        "Unable to generate business insights right now. Please try again."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        loadInsights();
    }, [loadInsights]);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner />

                    <p className="text-sm text-slate-400">
                        Analyzing your business...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-slate-500">
                        Workspace / AI Analyst
                    </p>

                    <div className="mt-1 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Sparkles
                                size={21}
                                className="text-violet-400"
                            />
                        </div>

                        <h1 className="text-2xl font-semibold text-white">
                            AI Analyst
                        </h1>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                        Understand what is happening in your
                        business and get practical,
                        data-backed recommendations.
                    </p>
                </div>

                <Card>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle
                                size={26}
                                className="text-red-400"
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            Unable to generate insights
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                            {error}
                        </p>

                        <div className="mt-5">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    loadInsights()
                                }
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const financialData = data?.financialData || {};
    const insights = data?.insights || {};

    const summary = financialData.summary || {};

    const categorySummary =
        financialData.categorySummary || [];

    const periodComparison =
        financialData.periodComparison || {};

    const period = financialData.period || {};

    const unusualExpense =
        financialData.unusualExpense;

    const recentTransactions =
        financialData.recentTransactions || [];

    const keyFindings = Array.isArray(
        insights.keyFindings
    )
        ? insights.keyFindings
        : [];

    const risks = Array.isArray(insights.risks)
        ? insights.risks
        : [];

    const opportunities = Array.isArray(
        insights.opportunities
    )
        ? insights.opportunities
        : [];

    const recommendedActions = Array.isArray(
        insights.recommendedActions
    )
        ? insights.recommendedActions
        : [];

    const changes =
        periodComparison.changes || {};

    const currentPeriod =
        periodComparison.currentPeriod || {};

    const previousPeriod =
        periodComparison.previousPeriod || {};

    const currentPeriodLabel =
        period.currentPeriodLabel ||
        "Current period";

    const previousPeriodLabel =
        period.previousPeriodLabel ||
        "Previous period";

    const currentIncome =
        Number(currentPeriod.income) || 0;

    const currentExpense =
        Number(currentPeriod.expense) || 0;

    const currentProfit =
        Number(currentPeriod.profit) ||
        currentIncome - currentExpense;

    const previousIncome =
        Number(previousPeriod.income) || 0;

    const previousExpense =
        Number(previousPeriod.expense) || 0;

    const previousProfit =
        Number(previousPeriod.profit) ||
        previousIncome - previousExpense;

    const totalIncome =
        Number(summary.totalIncome) || 0;

    const totalExpense =
        Number(summary.totalExpense) || 0;

    const hasTransactions =
        recentTransactions.length > 0 ||
        totalIncome > 0 ||
        totalExpense > 0;

    const incomeCategories = categorySummary
        .filter(
            (category) => category.type === "income"
        )
        .slice(0, 5);

    const expenseCategories = categorySummary
        .filter(
            (category) => category.type === "expense"
        )
        .slice(0, 5);

    const totalFindings = keyFindings.length;
    const totalRisks = risks.length;
    const totalOpportunities =
        opportunities.length;
    const totalActions =
        recommendedActions.length;

    const incomeChangeValue = getChangeValue(
        currentIncome,
        previousIncome
    );

    const expenseChangeValue = getChangeValue(
        currentExpense,
        previousExpense
    );

    const profitChangeValue = getChangeValue(
        currentProfit,
        previousProfit
    );

    const currentPeriodHasActivity =
        currentIncome !== 0 ||
        currentExpense !== 0 ||
        currentProfit !== 0;

    const previousPeriodHasActivity =
        previousIncome !== 0 ||
        previousExpense !== 0 ||
        previousProfit !== 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        Workspace / AI Analyst
                    </p>

                    <div className="mt-1 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Sparkles
                                size={21}
                                className="text-violet-400"
                            />
                        </div>

                        <h1 className="text-2xl font-semibold text-white">
                            AI Analyst
                        </h1>
                    </div>

                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                        Understand what is happening in your
                        business and get practical,
                        data-backed recommendations.
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={() =>
                        loadInsights(true)
                    }
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Analyzing..."
                        : "Refresh Analysis"}
                </Button>
            </div>

            {/* Refresh Error */}
            {error && data && (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <AlertTriangle
                            size={18}
                            className="shrink-0 text-red-400"
                        />

                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            loadInsights(true)
                        }
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* AI Summary */}
            <Card>
                <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                        <Bot
                            size={22}
                            className="text-violet-400"
                        />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-white">
                                Business Summary
                            </h2>

                            <Badge variant="info">
                                AI Generated
                            </Badge>
                        </div>

                        <p className="mt-2 text-sm leading-7 text-slate-300">
                            {insights.summary ||
                                "There is not enough information available to generate a meaningful summary."}
                        </p>
                    </div>
                </div>
            </Card>

            {/* AI Analysis At A Glance */}
            <section>
                <div className="mb-3">
                    <h2 className="text-lg font-semibold text-white">
                        AI Analysis At A Glance
                    </h2>

                    <p className="text-sm text-slate-400">
                        A quick overview of what the analysis
                        identified.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">
                                    Key Findings
                                </p>

                                <p className="mt-1 text-2xl font-semibold text-white">
                                    {totalFindings}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                                <Sparkles
                                    size={19}
                                    className="text-violet-400"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">
                                    Risks
                                </p>

                                <p className="mt-1 text-2xl font-semibold text-white">
                                    {totalRisks}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                                <AlertTriangle
                                    size={19}
                                    className="text-red-400"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">
                                    Opportunities
                                </p>

                                <p className="mt-1 text-2xl font-semibold text-white">
                                    {totalOpportunities}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                                <Lightbulb
                                    size={19}
                                    className="text-amber-400"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">
                                    Recommended Actions
                                </p>

                                <p className="mt-1 text-2xl font-semibold text-white">
                                    {totalActions}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Target
                                    size={19}
                                    className="text-emerald-400"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Empty State */}
            {!hasTransactions ? (
                <Card>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10">
                            <Bot
                                size={26}
                                className="text-violet-400"
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            Not enough financial activity yet
                        </h2>

                        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                            AI Analyst needs transaction data to
                            identify meaningful business patterns,
                            risks and opportunities.
                        </p>

                        <div className="mt-5">
                            <Button
                                onClick={() =>
                                    navigate(
                                        "/transactions"
                                    )
                                }
                            >
                                Add Transaction
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Overall Business Performance */}
                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold text-white">
                                Overall Business Performance
                            </h2>

                            <p className="text-sm text-slate-400">
                                Cumulative financial metrics from
                                all recorded transactions.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                title="Total Income"
                                value={formatCurrency(
                                    summary.totalIncome
                                )}
                                icon={ArrowUpRight}
                                iconClassName="text-emerald-400"
                            />

                            <MetricCard
                                title="Total Expense"
                                value={formatCurrency(
                                    summary.totalExpense
                                )}
                                icon={ArrowDownRight}
                                iconClassName="text-red-400"
                            />

                            <MetricCard
                                title={
                                    Number(
                                        summary.profit
                                    ) < 0
                                        ? "Net Loss"
                                        : "Net Profit"
                                }
                                value={formatCurrency(
                                    summary.profit
                                )}
                                icon={
                                    Number(
                                        summary.profit
                                    ) < 0
                                        ? TrendingDown
                                        : TrendingUp
                                }
                                iconClassName={
                                    Number(
                                        summary.profit
                                    ) < 0
                                        ? "text-red-400"
                                        : "text-emerald-400"
                                }
                            />

                            <MetricCard
                                title="Profit Margin"
                                value={formatPercentage(
                                    summary.profitMargin
                                )}
                                icon={Target}
                                iconClassName="text-violet-400"
                            />
                        </div>
                    </section>

                    {/* What Changed */}
                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold text-white">
                                What Changed
                            </h2>

                            <p className="text-sm text-slate-400">
                                {currentPeriodLabel} compared with{" "}
                                {previousPeriodLabel}.
                            </p>
                        </div>

                        <Card>
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <Badge variant="info">
                                    {currentPeriodLabel}
                                </Badge>

                                <span className="text-xs text-slate-500">
                                    vs
                                </span>

                                <Badge variant="default">
                                    {previousPeriodLabel}
                                </Badge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Income */}
                                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">
                                            Income
                                        </span>

                                        <ArrowUpRight
                                            size={17}
                                            className={
                                                currentIncome ===
                                                    0 &&
                                                previousIncome ===
                                                    0
                                                    ? "text-slate-500"
                                                    : getChangeColor(
                                                          incomeChangeValue
                                                      )
                                            }
                                        />
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-white">
                                        {formatCurrency(
                                            currentIncome
                                        )}
                                    </p>

                                    <p
                                        className={`mt-1 text-sm ${
                                            currentIncome ===
                                                0 &&
                                            previousIncome ===
                                                0
                                                ? "text-slate-500"
                                                : getChangeColor(
                                                      incomeChangeValue
                                                  )
                                        }`}
                                    >
                                        {getChangeLabel(
                                            currentIncome,
                                            previousIncome
                                        )}

                                        <span className="ml-1 text-slate-500">
                                            vs previous
                                        </span>
                                    </p>
                                </div>

                                {/* Expense */}
                                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">
                                            Expense
                                        </span>

                                        <ArrowDownRight
                                            size={17}
                                            className={
                                                currentExpense ===
                                                    0 &&
                                                previousExpense ===
                                                    0
                                                    ? "text-slate-500"
                                                    : getChangeColor(
                                                          expenseChangeValue,
                                                          true
                                                      )
                                            }
                                        />
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-white">
                                        {formatCurrency(
                                            currentExpense
                                        )}
                                    </p>

                                    <p
                                        className={`mt-1 text-sm ${
                                            currentExpense ===
                                                0 &&
                                            previousExpense ===
                                                0
                                                ? "text-slate-500"
                                                : getChangeColor(
                                                      expenseChangeValue,
                                                      true
                                                  )
                                        }`}
                                    >
                                        {getChangeLabel(
                                            currentExpense,
                                            previousExpense
                                        )}

                                        <span className="ml-1 text-slate-500">
                                            vs previous
                                        </span>
                                    </p>
                                </div>

                                {/* Profit */}
                                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">
                                            Profit
                                        </span>

                                        <TrendingUp
                                            size={17}
                                            className={
                                                currentProfit ===
                                                    0 &&
                                                previousProfit ===
                                                    0
                                                    ? "text-slate-500"
                                                    : getChangeColor(
                                                          profitChangeValue
                                                      )
                                            }
                                        />
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-white">
                                        {formatCurrency(
                                            currentProfit
                                        )}
                                    </p>

                                    <p
                                        className={`mt-1 text-sm ${
                                            currentProfit ===
                                                0 &&
                                            previousProfit ===
                                                0
                                                ? "text-slate-500"
                                                : getChangeColor(
                                                      profitChangeValue
                                                  )
                                        }`}
                                    >
                                        {getChangeLabel(
                                            currentProfit,
                                            previousProfit
                                        )}

                                        <span className="ml-1 text-slate-500">
                                            vs previous
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Current period profit
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-300">
                                        {formatCurrency(
                                            currentProfit
                                        )}
                                    </p>
                                </div>

                                <div className="sm:text-right">
                                    <p className="text-xs text-slate-500">
                                        Previous period profit
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-300">
                                        {formatCurrency(
                                            previousProfit
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Key Findings */}
                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold text-white">
                                Key Findings
                            </h2>

                            <p className="text-sm text-slate-400">
                                Important observations from your
                                financial data.
                            </p>
                        </div>

                        {keyFindings.length === 0 ? (
                            <Card>
                                <p className="text-sm text-slate-500">
                                    No significant findings were
                                    identified.
                                </p>
                            </Card>
                        ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {keyFindings.map(
                                    (finding, index) => (
                                        <InsightCard
                                            key={`${finding.title}-${index}`}
                                            title={
                                                finding.title
                                            }
                                            description={
                                                finding.description
                                            }
                                            evidence={
                                                finding.evidence
                                            }
                                            icon={Sparkles}
                                            iconClassName="text-violet-400"
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </section>

                    {/* Risks + Opportunities */}
                    <div className="grid gap-6 xl:grid-cols-2">
                        <section>
                            <div className="mb-3">
                                <h2 className="text-lg font-semibold text-white">
                                    Risks
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Areas that may require
                                    attention.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {risks.length === 0 ? (
                                    <Card>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2
                                                size={19}
                                                className="text-emerald-400"
                                            />

                                            <p className="text-sm text-slate-300">
                                                No significant
                                                risks were
                                                identified
                                                from the
                                                available
                                                data.
                                            </p>
                                        </div>
                                    </Card>
                                ) : (
                                    risks.map(
                                        (risk, index) => (
                                            <InsightCard
                                                key={`${risk.title}-${index}`}
                                                title={
                                                    risk.title
                                                }
                                                description={
                                                    risk.description
                                                }
                                                evidence={
                                                    risk.evidence
                                                }
                                                icon={
                                                    AlertTriangle
                                                }
                                                iconClassName="text-red-400"
                                            />
                                        )
                                    )
                                )}
                            </div>
                        </section>

                        <section>
                            <div className="mb-3">
                                <h2 className="text-lg font-semibold text-white">
                                    Opportunities
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Potential areas worth
                                    exploring.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {opportunities.length ===
                                0 ? (
                                    <Card>
                                        <p className="text-sm text-slate-500">
                                            No specific
                                            opportunities
                                            were identified
                                            from the
                                            available data.
                                        </p>
                                    </Card>
                                ) : (
                                    opportunities.map(
                                        (
                                            opportunity,
                                            index
                                        ) => (
                                            <InsightCard
                                                key={`${opportunity.title}-${index}`}
                                                title={
                                                    opportunity.title
                                                }
                                                description={
                                                    opportunity.description
                                                }
                                                evidence={
                                                    opportunity.evidence
                                                }
                                                icon={
                                                    Lightbulb
                                                }
                                                iconClassName="text-amber-400"
                                            />
                                        )
                                    )
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Recommended Actions */}
                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold text-white">
                                Recommended Actions
                            </h2>

                            <p className="text-sm text-slate-400">
                                Practical actions connected to the
                                observed data.
                            </p>
                        </div>

                        {recommendedActions.length === 0 ? (
                            <Card>
                                <p className="text-sm text-slate-500">
                                    No specific actions were
                                    recommended based on the
                                    available data.
                                </p>
                            </Card>
                        ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {recommendedActions.map(
                                    (
                                        recommendation,
                                        index
                                    ) => {
                                        const PriorityIcon =
                                            getPriorityIcon(
                                                recommendation.priority
                                            );

                                        const priority =
                                            recommendation.priority?.toLowerCase();

                                        const priorityColor =
                                            priority ===
                                            "high"
                                                ? "text-red-400"
                                                : priority ===
                                                    "medium"
                                                  ? "text-amber-400"
                                                  : "text-emerald-400";

                                        return (
                                            <Card
                                                key={`${recommendation.action}-${index}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                                                        <PriorityIcon
                                                            size={
                                                                19
                                                            }
                                                            className={
                                                                priorityColor
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-medium text-white">
                                                                {
                                                                    recommendation.action
                                                                }
                                                            </h3>

                                                            <Badge
                                                                variant={getPriorityVariant(
                                                                    recommendation.priority
                                                                )}
                                                            >
                                                                {recommendation.priority ||
                                                                    "Normal"}
                                                            </Badge>
                                                        </div>

                                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                                            {
                                                                recommendation.reason
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </section>

                    {/* Business Breakdown */}
                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold text-white">
                                Business Breakdown
                            </h2>

                            <p className="text-sm text-slate-400">
                                All-time income and expenses
                                distributed across categories.
                            </p>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            {/* Income */}
                            <Card
                                title="Income Sources"
                                description="Largest recorded income categories"
                            >
                                <div className="mt-5 space-y-5">
                                    {incomeCategories.length ===
                                    0 ? (
                                        <p className="text-sm text-slate-500">
                                            No income category
                                            data available.
                                        </p>
                                    ) : (
                                        incomeCategories.map(
                                            (
                                                category,
                                                index
                                            ) => {
                                                const percentage =
                                                    totalIncome >
                                                    0
                                                        ? (Number(
                                                              category.total
                                                          ) /
                                                              totalIncome) *
                                                          100
                                                        : 0;

                                                return (
                                                    <ConcentrationBar
                                                        key={`${category.categoryName}-${index}`}
                                                        category={
                                                            category.categoryName
                                                        }
                                                        total={
                                                            category.total
                                                        }
                                                        percentage={
                                                            percentage
                                                        }
                                                        type="income"
                                                    />
                                                );
                                            }
                                        )
                                    )}
                                </div>
                            </Card>

                            {/* Expenses */}
                            <Card
                                title="Expense Breakdown"
                                description="Largest recorded expense categories"
                            >
                                <div className="mt-5 space-y-5">
                                    {expenseCategories.length ===
                                    0 ? (
                                        <p className="text-sm text-slate-500">
                                            No expense category
                                            data available.
                                        </p>
                                    ) : (
                                        expenseCategories.map(
                                            (
                                                category,
                                                index
                                            ) => {
                                                const percentage =
                                                    totalExpense >
                                                    0
                                                        ? (Number(
                                                              category.total
                                                          ) /
                                                              totalExpense) *
                                                          100
                                                        : 0;

                                                return (
                                                    <ConcentrationBar
                                                        key={`${category.categoryName}-${index}`}
                                                        category={
                                                            category.categoryName
                                                        }
                                                        total={
                                                            category.total
                                                        }
                                                        percentage={
                                                            percentage
                                                        }
                                                        type="expense"
                                                    />
                                                );
                                            }
                                        )
                                    )}
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Financial Context */}
                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold text-white">
                                Financial Context
                            </h2>

                            <p className="text-sm text-slate-400">
                                Additional context supporting the AI
                                analysis.
                            </p>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            {/* Expense Monitor */}
                            <Card
                                title="Expense Monitor"
                                description="Recent expense anomaly detection"
                            >
                                {unusualExpense ? (
                                    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle
                                                size={19}
                                                className="mt-0.5 shrink-0 text-amber-400"
                                            />

                                            <div>
                                                <p className="font-medium text-white">
                                                    Unusual expense
                                                    detected
                                                </p>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    {
                                                        unusualExpense.description
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Amount
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-white">
                                                    {formatCurrency(
                                                        unusualExpense.amount
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Category
                                                </p>

                                                <p className="mt-1 truncate text-sm font-medium text-white">
                                                    {
                                                        unusualExpense.category
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Recent average
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-white">
                                                    {formatCurrency(
                                                        unusualExpense.averageRecentExpense
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Average multiple
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-amber-400">
                                                    {
                                                        unusualExpense.ratioToAverage
                                                    }
                                                    x
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                        <CheckCircle2
                                            size={19}
                                            className="text-emerald-400"
                                        />

                                        <p className="text-sm text-slate-400">
                                            No unusual recent
                                            expense was detected.
                                        </p>
                                    </div>
                                )}
                            </Card>

                            {/* Period Context */}
                            <Card
                                title="Period Context"
                                description="Time periods used for comparison"
                            >
                                <div className="mt-4 space-y-4">
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Current period
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-white">
                                                    {
                                                        currentPeriodLabel
                                                    }
                                                </p>
                                            </div>

                                            <Badge variant="info">
                                                {currentPeriodHasActivity
                                                    ? "Active"
                                                    : "No activity"}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 grid grid-cols-3 gap-3">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Income
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-emerald-400">
                                                    {formatCurrency(
                                                        currentIncome
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Expense
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-red-400">
                                                    {formatCurrency(
                                                        currentExpense
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Profit
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-300">
                                                    {formatCurrency(
                                                        currentProfit
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Previous period
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-white">
                                                    {
                                                        previousPeriodLabel
                                                    }
                                                </p>
                                            </div>

                                            <Badge variant="default">
                                                {previousPeriodHasActivity
                                                    ? "Recorded"
                                                    : "No activity"}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 grid grid-cols-3 gap-3">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Income
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-emerald-400">
                                                    {formatCurrency(
                                                        previousIncome
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Expense
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-red-400">
                                                    {formatCurrency(
                                                        previousExpense
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Profit
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-300">
                                                    {formatCurrency(
                                                        previousProfit
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Current Period Status */}
                    {!currentPeriodHasActivity &&
                        previousPeriodHasActivity && (
                            <section>
                                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle
                                            size={19}
                                            className="mt-0.5 shrink-0 text-amber-400"
                                        />

                                        <div>
                                            <p className="font-medium text-white">
                                                No recorded activity in{" "}
                                                {
                                                    currentPeriodLabel
                                                }
                                            </p>

                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                The previous period contains
                                                recorded financial activity,
                                                but no income or expense has
                                                been recorded in the current
                                                period yet.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                    {/* Recent Activity */}
                    <section>
                        <div className="mb-3 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Recent Activity
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Most recent transactions available
                                    to the analyst.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/transactions"
                                    )
                                }
                                className="hidden items-center gap-1 text-sm font-medium text-violet-400 transition hover:text-violet-300 sm:flex"
                            >
                                View Transactions
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <Card>
                            {recentTransactions.length ===
                            0 ? (
                                <p className="py-6 text-center text-sm text-slate-500">
                                    No recent transactions
                                    available.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[650px]">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-left">
                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Date
                                                </th>

                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Description
                                                </th>

                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Category
                                                </th>

                                                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {recentTransactions.map(
                                                (
                                                    transaction,
                                                    index
                                                ) => {
                                                    const category =
                                                        transaction.categoryId;

                                                    const isIncome =
                                                        category?.type ===
                                                        "income";

                                                    return (
                                                        <tr
                                                            key={
                                                                transaction._id ||
                                                                index
                                                            }
                                                            className="border-b border-slate-800/70 last:border-0"
                                                        >
                                                            <td className="px-3 py-4 text-sm text-slate-400">
                                                                {formatDate(
                                                                    transaction.transactionDate
                                                                )}
                                                            </td>

                                                            <td className="max-w-[280px] px-3 py-4">
                                                                <p className="truncate text-sm font-medium text-white">
                                                                    {transaction.description ||
                                                                        "Untitled transaction"}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-4">
                                                                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                                                                    {category?.name ||
                                                                        "Uncategorized"}
                                                                </span>
                                                            </td>

                                                            <td
                                                                className={`px-3 py-4 text-right text-sm font-medium ${
                                                                    isIncome
                                                                        ? "text-emerald-400"
                                                                        : "text-red-400"
                                                                }`}
                                                            >
                                                                {isIncome
                                                                    ? "+"
                                                                    : "-"}
                                                                {formatCurrency(
                                                                    transaction.amount
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/transactions"
                                )
                            }
                            className="mt-3 flex items-center gap-1 text-sm font-medium text-violet-400 transition hover:text-violet-300 sm:hidden"
                        >
                            View Transactions
                            <ChevronRight size={16} />
                        </button>
                    </section>

                    {/* Footer Note */}
                    <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
                        <Bot
                            size={17}
                            className="mt-0.5 shrink-0 text-slate-500"
                        />

                        <p className="text-xs leading-5 text-slate-500">
                            AI insights are generated only from
                            the financial data available in your
                            BizFlow workspace. Always review the
                            underlying figures before acting on a
                            recommendation.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIAnalyst;