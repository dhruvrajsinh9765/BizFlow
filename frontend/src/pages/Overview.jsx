import { useEffect, useState } from "react";
import {
    ArrowDownRight,
    ArrowUpRight,
    Lightbulb,
    Plus,
    ShieldAlert,
    Sparkles,
    Target,
    Upload,
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import dashboardService from "../services/dashboardService";
import insightService from "../services/insightService";
import { useAuth } from "../context/AuthContext";

import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const PERIODS = {
    "7D": 7,
    "30D": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
};

const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getDateRange = (period) => {
    const endDate = new Date();
    const startDate = new Date(endDate);

    startDate.setDate(
        startDate.getDate() - PERIODS[period] + 1
    );

    return {
        startDate: getDateString(startDate),
        endDate: getDateString(endDate),
    };
};

const Overview = () => {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [recentTransactions, setRecentTransactions] =
        useState([]);

    const [period, setPeriod] = useState("30D");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [aiInsights, setAiInsights] = useState(null);
    const [aiLoading, setAiLoading] = useState(true);
    const [aiError, setAiError] = useState("");

    /*
     * Load dashboard analytics and recent transactions.
     */
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const { startDate, endDate } =
                    getDateRange(period);

                const [
                    analyticsData,
                    dashboardSummary,
                ] = await Promise.all([
                    dashboardService.getFinancialAnalytics({
                        startDate,
                        endDate,
                    }),

                    dashboardService.getDashboardSummary(),
                ]);

                setDashboard(analyticsData);

                setRecentTransactions(
                    dashboardSummary?.recentTransactions || []
                );
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [period]);

    /*
     * Load AI insights once when Overview is opened.
     */
    useEffect(() => {
        const fetchAIInsights = async () => {
            try {
                setAiLoading(true);
                setAiError("");

                const data =
                    await insightService.getInsights();

                setAiInsights(data);
            } catch (error) {
                setAiError(
                    error.response?.data?.message ||
                        "Unable to generate business insights."
                );
            } finally {
                setAiLoading(false);
            }
        };

        fetchAIInsights();
    }, []);

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    if (loading && !dashboard) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error && !dashboard) {
        return (
            <Card>
                <div className="py-10 text-center">
                    <h2 className="text-lg font-semibold text-white">
                        Unable to load dashboard
                    </h2>

                    <p className="mt-2 text-sm text-red-400">
                        {error}
                    </p>
                </div>
            </Card>
        );
    }

    const summary = dashboard?.summary || {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    };

    const categorySummary =
        dashboard?.categorySummary || [];

    const monthlySummary =
        dashboard?.monthlySummary || [];

    const totalIncome =
        Number(summary.totalIncome) || 0;

    const totalExpense =
        Number(summary.totalExpense) || 0;

    const balance =
        Number(summary.balance) || 0;

    const profitMargin =
        totalIncome > 0
            ? (balance / totalIncome) * 100
            : 0;

    /*
     * Business Pulse
     */
    const expenseCategories = categorySummary.filter(
        (category) => category.type === "expense"
    );

    const topExpenseCategory =
        expenseCategories.length > 0
            ? expenseCategories.reduce(
                  (highest, current) =>
                      Number(current.total) >
                      Number(highest.total)
                          ? current
                          : highest
              )
            : null;

    const financialPosition =
        balance > 0
            ? "Positive"
            : balance < 0
            ? "Negative"
            : "Balanced";

    const expenseCoverage =
        totalExpense > 0
            ? totalIncome / totalExpense
            : 0;

    /*
     * Net Cash Movement
     */
    const netCashMovement = monthlySummary.map(
        (month) => ({
            ...month,
            netCash:
                Number(month.income || 0) -
                Number(month.expense || 0),
        })
    );

    /*
     * Expense Analysis
     */
    const expenseAnalysis = categorySummary
        .filter(
            (category) => category.type === "expense"
        )
        .map((category) => ({
            name: category.categoryName,
            amount: Number(category.total) || 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    /*
     * AI Insights
     */
    const insights = aiInsights || {};

    const keyFindings =
        Array.isArray(insights.keyFindings)
            ? insights.keyFindings
            : [];

    const risks =
        Array.isArray(insights.risks)
            ? insights.risks
            : [];

    const opportunities =
        Array.isArray(insights.opportunities)
            ? insights.opportunities
            : [];

    const recommendedActions =
        Array.isArray(insights.recommendedActions)
            ? insights.recommendedActions
            : [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs text-slate-500">
                        Workspace / Overview
                    </p>

                    <h1 className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        Good morning,{" "}
                        {user?.name || "there"} 👋
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        A clear view of what is happening in your business.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                        <Upload size={17} />
                        Import CSV
                    </button>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
                    >
                        <Plus size={17} />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Period Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-fit rounded-lg border border-slate-800 bg-slate-900 p-1">
                    {Object.keys(PERIODS).map(
                        (option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() =>
                                    setPeriod(option)
                                }
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                    period === option
                                        ? "bg-indigo-500 text-white"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {option}
                            </button>
                        )
                    )}
                </div>

                <select
                    defaultValue="2026-09"
                    className="w-fit rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
                >
                    <option value="2026-09">
                        September 2026
                    </option>
                </select>
            </div>

            {/* Updating Indicator */}
            {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <LoadingSpinner size="sm" />
                    Updating dashboard...
                </div>
            )}

            {/* Dashboard Error */}
            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Revenue */}
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Revenue
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                {formatCurrency(
                                    totalIncome
                                )}
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                Income for selected period
                            </p>
                        </div>

                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                            <ArrowUpRight
                                size={20}
                            />
                        </div>
                    </div>
                </Card>

                {/* Expenses */}
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Expenses
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                {formatCurrency(
                                    totalExpense
                                )}
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                Expenses for selected period
                            </p>
                        </div>

                        <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                            <ArrowDownRight
                                size={20}
                            />
                        </div>
                    </div>
                </Card>

                {/* Net Profit */}
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Net Profit
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                {formatCurrency(
                                    balance
                                )}
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                Income minus expenses
                            </p>
                        </div>

                        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                            <ArrowUpRight
                                size={20}
                            />
                        </div>
                    </div>
                </Card>

                {/* Profit Margin */}
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Profit Margin
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                {profitMargin.toFixed(
                                    1
                                )}
                                %
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                Net profit as % of revenue
                            </p>
                        </div>

                        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                            <ArrowUpRight
                                size={20}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Financial Performance */}
            <Card
                title="Financial Performance"
                description="Income vs expenses over the selected period."
            >
                {monthlySummary.length > 0 ? (
                    <div className="h-80 w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <LineChart
                                data={
                                    monthlySummary
                                }
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 10,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1e293b"
                                />

                                <XAxis
                                    dataKey="period"
                                    stroke="#64748b"
                                    tick={{
                                        fontSize: 12,
                                    }}
                                />

                                <YAxis
                                    stroke="#64748b"
                                    tick={{
                                        fontSize: 12,
                                    }}
                                    tickFormatter={(
                                        value
                                    ) =>
                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`
                                    }
                                />

                                <Tooltip
                                    formatter={(
                                        value
                                    ) =>
                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`
                                    }
                                    contentStyle={{
                                        backgroundColor:
                                            "#0f172a",
                                        border: "1px solid #1e293b",
                                        borderRadius:
                                            "8px",
                                        color: "#f8fafc",
                                    }}
                                />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    name="Income"
                                    stroke="#34d399"
                                    strokeWidth={2}
                                    dot={{
                                        r: 3,
                                    }}
                                    activeDot={{
                                        r: 5,
                                    }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="expense"
                                    name="Expenses"
                                    stroke="#f87171"
                                    strokeWidth={2}
                                    dot={{
                                        r: 3,
                                    }}
                                    activeDot={{
                                        r: 5,
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <EmptyState
                        title="No financial data yet"
                        description="Income and expense trends will appear here once you have transactions."
                    />
                )}
            </Card>

            {/* Business Pulse */}
            <Card
                title="Business Pulse"
                description="A quick snapshot of your current financial position."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Financial Position */}
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">
                            Financial Position
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                            <div
                                className={`h-2.5 w-2.5 rounded-full ${
                                    financialPosition ===
                                    "Positive"
                                        ? "bg-emerald-400"
                                        : financialPosition ===
                                          "Negative"
                                        ? "bg-red-400"
                                        : "bg-slate-400"
                                }`}
                            />

                            <p className="text-lg font-semibold text-white">
                                {financialPosition}
                            </p>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            Based on income and expenses for the selected period.
                        </p>
                    </div>

                    {/* Top Expense Category */}
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">
                            Top Expense Category
                        </p>

                        {topExpenseCategory ? (
                            <>
                                <p className="mt-3 text-lg font-semibold text-white">
                                    {
                                        topExpenseCategory.categoryName
                                    }
                                </p>

                                <p className="mt-1 text-sm text-red-400">
                                    {formatCurrency(
                                        topExpenseCategory.total
                                    )}
                                </p>
                            </>
                        ) : (
                            <p className="mt-3 text-lg font-semibold text-slate-500">
                                No data
                            </p>
                        )}

                        <p className="mt-2 text-xs text-slate-500">
                            Highest expense category in the selected period.
                        </p>
                    </div>

                    {/* Expense Coverage */}
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">
                            Expense Coverage
                        </p>

                        <p className="mt-3 text-lg font-semibold text-white">
                            {totalExpense > 0
                                ? `${expenseCoverage.toFixed(
                                      1
                                  )}×`
                                : "—"}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                            Revenue generated for every ₹1 spent.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Net Cash Movement */}
            <Card
                title="Net Cash Movement"
                description="Monthly movement after subtracting expenses from income."
            >
                {netCashMovement.length > 0 ? (
                    <div className="space-y-3">
                        {netCashMovement.map(
                            (month) => (
                                <div
                                    key={
                                        month.period
                                    }
                                    className="flex items-center justify-between rounded-lg bg-slate-950 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {
                                                month.period
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Income{" "}
                                            {formatCurrency(
                                                month.income
                                            )}
                                            {" · "}
                                            Expenses{" "}
                                            {formatCurrency(
                                                month.expense
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={`text-sm font-semibold ${
                                                month.netCash >
                                                0
                                                    ? "text-emerald-400"
                                                    : month.netCash <
                                                      0
                                                    ? "text-red-400"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {formatCurrency(
                                                month.netCash
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Net movement
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title="No cash movement yet"
                        description="Net cash movement will appear here once you have financial transactions."
                    />
                )}
            </Card>

            {/* Expense Analysis */}
            <Card
                title="Expense Analysis"
                description="How your expenses are distributed across categories."
            >
                {expenseAnalysis.length > 0 ? (
                    <div className="h-80 w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={
                                    expenseAnalysis
                                }
                                layout="vertical"
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1e293b"
                                />

                                <XAxis
                                    type="number"
                                    stroke="#64748b"
                                    tick={{
                                        fontSize: 12,
                                    }}
                                    tickFormatter={(
                                        value
                                    ) =>
                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`
                                    }
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#64748b"
                                    tick={{
                                        fontSize: 12,
                                    }}
                                    width={110}
                                />

                                <Tooltip
                                    formatter={(
                                        value
                                    ) =>
                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`
                                    }
                                    contentStyle={{
                                        backgroundColor:
                                            "#0f172a",
                                        border: "1px solid #1e293b",
                                        borderRadius:
                                            "8px",
                                        color: "#f8fafc",
                                    }}
                                />

                                <Bar
                                    dataKey="amount"
                                    name="Expenses"
                                    fill="#818cf8"
                                    radius={[
                                        0,
                                        6,
                                        6,
                                        0,
                                    ]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <EmptyState
                        title="No expense data yet"
                        description="Expense analysis will appear here once you have expense transactions."
                    />
                )}
            </Card>

            {/* Customer Contribution */}
            <Card
                title="Customer Contribution"
                description="Revenue contribution from your customers."
            >
                <EmptyState
                    title="No customer contribution data yet"
                    description="Customer revenue contribution will appear here once transactions are linked to customers."
                />
            </Card>

            {/* AI Analyst */}
            <Card
                title="AI Analyst"
                description="AI-powered insights based on your business financial data."
            >
                {aiLoading ? (
                    <div className="flex min-h-40 items-center justify-center">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <LoadingSpinner size="sm" />
                            Analyzing your business data...
                        </div>
                    </div>
                ) : aiError ? (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <ShieldAlert
                                size={20}
                                className="mt-0.5 text-red-400"
                            />

                            <div>
                                <p className="text-sm font-medium text-red-300">
                                    Unable to generate AI insights
                                </p>

                                <p className="mt-1 text-sm text-red-400/80">
                                    {aiError}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : !insights.summary &&
                  keyFindings.length === 0 &&
                  risks.length === 0 &&
                  opportunities.length === 0 &&
                  recommendedActions.length === 0 ? (
                    <EmptyState
                        title="No AI insights yet"
                        description="AI insights will appear here once enough financial data is available."
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Summary */}
                        {insights.summary && (
                            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                                        <Sparkles
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            Financial Summary
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                            {
                                                insights.summary
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Key Findings */}
                        {keyFindings.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Target
                                        size={18}
                                        className="text-blue-400"
                                    />

                                    <h3 className="font-['Space_Grotesk'] text-base font-semibold text-white">
                                        Key Findings
                                    </h3>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {keyFindings.map(
                                        (
                                            finding,
                                            index
                                        ) => (
                                            <div
                                                key={`${finding.title}-${index}`}
                                                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                                            >
                                                <h4 className="text-sm font-semibold text-white">
                                                    {
                                                        finding.title
                                                    }
                                                </h4>

                                                <p className="mt-2 text-sm leading-5 text-slate-400">
                                                    {
                                                        finding.description
                                                    }
                                                </p>

                                                {finding.evidence && (
                                                    <p className="mt-3 text-xs text-slate-500">
                                                        Evidence:{" "}
                                                        {
                                                            finding.evidence
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Risks */}
                        {risks.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <ShieldAlert
                                        size={18}
                                        className="text-red-400"
                                    />

                                    <h3 className="font-['Space_Grotesk'] text-base font-semibold text-white">
                                        Risks
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {risks.map(
                                        (
                                            risk,
                                            index
                                        ) => (
                                            <div
                                                key={`${risk.title}-${index}`}
                                                className="rounded-lg border border-red-500/10 bg-red-500/5 p-4"
                                            >
                                                <h4 className="text-sm font-semibold text-white">
                                                    {
                                                        risk.title
                                                    }
                                                </h4>

                                                <p className="mt-2 text-sm leading-5 text-slate-400">
                                                    {
                                                        risk.description
                                                    }
                                                </p>

                                                {risk.evidence && (
                                                    <p className="mt-3 text-xs text-slate-500">
                                                        Evidence:{" "}
                                                        {
                                                            risk.evidence
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Opportunities */}
                        {opportunities.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Lightbulb
                                        size={18}
                                        className="text-amber-400"
                                    />

                                    <h3 className="font-['Space_Grotesk'] text-base font-semibold text-white">
                                        Opportunities
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {opportunities.map(
                                        (
                                            opportunity,
                                            index
                                        ) => (
                                            <div
                                                key={`${opportunity.title}-${index}`}
                                                className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-4"
                                            >
                                                <h4 className="text-sm font-semibold text-white">
                                                    {
                                                        opportunity.title
                                                    }
                                                </h4>

                                                <p className="mt-2 text-sm leading-5 text-slate-400">
                                                    {
                                                        opportunity.description
                                                    }
                                                </p>

                                                {opportunity.evidence && (
                                                    <p className="mt-3 text-xs text-slate-500">
                                                        Evidence:{" "}
                                                        {
                                                            opportunity.evidence
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recommended Actions */}
                        {recommendedActions.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <ArrowUpRight
                                        size={18}
                                        className="text-emerald-400"
                                    />

                                    <h3 className="font-['Space_Grotesk'] text-base font-semibold text-white">
                                        Recommended Actions
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {recommendedActions.map(
                                        (
                                            recommendation,
                                            index
                                        ) => (
                                            <div
                                                key={`${recommendation.action}-${index}`}
                                                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                                            >
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <h4 className="text-sm font-semibold text-white">
                                                        {
                                                            recommendation.action
                                                        }
                                                    </h4>

                                                    {recommendation.priority && (
                                                        <span
                                                            className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                                                recommendation.priority ===
                                                                "high"
                                                                    ? "bg-red-500/10 text-red-400"
                                                                    : recommendation.priority ===
                                                                      "medium"
                                                                    ? "bg-amber-500/10 text-amber-400"
                                                                    : "bg-slate-800 text-slate-400"
                                                            }`}
                                                        >
                                                            {
                                                                recommendation.priority
                                                            }{" "}
                                                            priority
                                                        </span>
                                                    )}
                                                </div>

                                                {recommendation.reason && (
                                                    <p className="mt-2 text-sm leading-5 text-slate-400">
                                                        {
                                                            recommendation.reason
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Recent Transactions */}
            <Card
                title="Recent Transactions"
                description="Your latest financial activity."
            >
                {recentTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-800 text-left">
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Description
                                    </th>

                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Category
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTransactions.map(
                                    (transaction) => {
                                        const isIncome =
                                            transaction.categoryId
                                                ?.type ===
                                            "income";

                                        return (
                                            <tr
                                                key={
                                                    transaction._id
                                                }
                                                className="border-b border-slate-800/70 last:border-0"
                                            >
                                                <td className="px-4 py-4 text-sm text-slate-400">
                                                    {formatDate(
                                                        transaction.transactionDate
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium text-white">
                                                        {transaction.description ||
                                                            "No description"}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                                                        {transaction
                                                            .categoryId
                                                            ?.name ||
                                                            "Uncategorized"}
                                                    </span>
                                                </td>

                                                <td
                                                    className={`px-4 py-4 text-right text-sm font-semibold ${
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
                ) : (
                    <EmptyState
                        title="No recent transactions"
                        description="Your latest income and expense transactions will appear here."
                    />
                )}
            </Card>

            {/* Category Summary */}
            <Card
                title="Category Summary"
                description="Your financial activity grouped by category."
            >
                {categorySummary.length > 0 ? (
                    <div className="space-y-3">
                        {categorySummary.map(
                            (category) => (
                                <div
                                    key={
                                        category.categoryId
                                    }
                                    className="flex items-center justify-between rounded-lg bg-slate-950 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {
                                                category.categoryName
                                            }
                                        </p>

                                        <p className="mt-1 text-xs capitalize text-slate-500">
                                            {
                                                category.type
                                            }
                                        </p>
                                    </div>

                                    <p className="text-sm font-semibold text-slate-200">
                                        {formatCurrency(
                                            category.total
                                        )}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title="No category data yet"
                        description="Category activity will appear here once you have transactions."
                    />
                )}
            </Card>
        </div>
    );
};

export default Overview;