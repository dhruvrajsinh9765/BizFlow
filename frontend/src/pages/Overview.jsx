import {
    useEffect,
    useState,
} from "react";

import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronRight,
    Sparkles,
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

import { useNavigate } from "react-router-dom";

import dashboardService from "../services/dashboardService";
import insightService from "../services/insightService";
import transactionService from "../services/transactionService";
import contactService from "../services/contactService";
import categoryService from "../services/categoryService";

import { useAuth } from "../context/AuthContext";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
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

const getDateRange = (period, selectedYear = "", selectedMonth = "") => {
    const today = new Date();

    if (selectedYear && selectedMonth !== "") {
        const year = Number(selectedYear);
        const month = Number(selectedMonth);
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        return {
            startDate: getDateString(startDate),
            endDate: getDateString(endDate),
        };
    }

    if (selectedYear) {
        const year = Number(selectedYear);
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        if (year === today.getFullYear()) {
            endDate.setTime(today.getTime());
        }

        return {
            startDate: getDateString(startDate),
            endDate: getDateString(endDate),
        };
    }

    if (selectedMonth !== "") {
        const year = today.getFullYear();
        const month = Number(selectedMonth);
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        return {
            startDate: getDateString(startDate),
            endDate: getDateString(endDate),
        };
    }

    const activePeriod = period || "30D";
    const endDate = new Date();
    const startDate = new Date(endDate);

    startDate.setDate(
        startDate.getDate() - PERIODS[activePeriod] + 1
    );

    return {
        startDate: getDateString(startDate),
        endDate: getDateString(endDate),
    };
};

const getChartGranularity = (period, selectedYear, selectedMonth) => {
    if (selectedYear || selectedMonth) {
        return "month";
    }

    return period === "7D" || period === "30D"
        ? "day"
        : "month";
};

const getChartKey = (date, granularity) => {
    if (granularity === "day") {
        return getDateString(date);
    }

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
};

const getChartLabel = (date, granularity) => {
    if (granularity === "day") {
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
        });
    }

    return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
};

const buildChartData = (transactions, categories, startDate, endDate, granularity) => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const buckets = new Map();
    const cursor = new Date(start);

    if (granularity === "month") {
        cursor.setDate(1);
    }

    while (cursor <= end) {
        const key = getChartKey(cursor, granularity);

        buckets.set(key, {
            period: key,
            label: getChartLabel(cursor, granularity),
            income: 0,
            expense: 0,
        });

        if (granularity === "day") {
            cursor.setDate(cursor.getDate() + 1);
        } else {
            cursor.setMonth(cursor.getMonth() + 1);
        }
    }

    transactions.forEach((transaction) => {
        if (!transaction?.transactionDate) {
            return;
        }

        const date = new Date(transaction.transactionDate);

        if (Number.isNaN(date.getTime())) {
            return;
        }

        const category =
            typeof transaction.categoryId === "object"
                ? transaction.categoryId
                : categories.find(
                      (item) =>
                          item._id === transaction.categoryId
                  );

        const key = getChartKey(date, granularity);
        const bucket = buckets.get(key);

        if (!bucket || !category?.type) {
            return;
        }

        const amount = Number(transaction.amount) || 0;

        if (category.type === "income") {
            bucket.income += amount;
        } else if (category.type === "expense") {
            bucket.expense += amount;
        }
    });

    return Array.from(buckets.values());
};

const Overview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [recentTransactions, setRecentTransactions] =
        useState([]);

    const [period, setPeriod] = useState("30D");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [aiInsights, setAiInsights] = useState(null);
    const [aiLoading, setAiLoading] = useState(true);
    const [aiError, setAiError] = useState("");

    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [customerContribution, setCustomerContribution] =
        useState([]);
    const [customerContributionLoading, setCustomerContributionLoading] =
        useState(true);
    const [customerContributionError, setCustomerContributionError] =
        useState("");

    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);

    /*
     * ---------------------------------------------------------
     * Dashboard
     * ---------------------------------------------------------
     */

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const { startDate, endDate } =
                getDateRange(period, selectedYear, selectedMonth);

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

    useEffect(() => {
        fetchDashboard();
    }, [period, selectedYear, selectedMonth]);

    /*
     * ---------------------------------------------------------
     * Categories + Contacts
     * ---------------------------------------------------------
     */

    useEffect(() => {
        const fetchSupportData = async () => {
            try {
                const [
                    categoriesData,
                    contactsData,
                ] = await Promise.all([
                    categoryService.getCategories(),
                    contactService.getContacts(),
                ]);

                setCategories(
                    categoriesData?.categories ||
                        categoriesData ||
                        []
                );

                setContacts(
                    contactsData?.contacts ||
                        contactsData ||
                        []
                );
            } catch (error) {
                console.error(
                    "Failed to load categories or contacts:",
                    error
                );
            }
        };

        fetchSupportData();
    }, []);

    /*
     * ---------------------------------------------------------
     * Customer Contribution
     * ---------------------------------------------------------
     */

    useEffect(() => {
        let cancelled = false;

        const fetchCustomerContribution = async () => {
            try {
                setCustomerContributionLoading(true);
                setCustomerContributionError("");

                const { startDate, endDate } =
                    getDateRange(period, selectedYear, selectedMonth);

                const transactionLimit = 100;
                let page = 1;
                let allTransactions = [];
                let totalPages = 1;

                do {
                    const data =
                        await transactionService.getTransactions({
                            page,
                            limit: transactionLimit,
                            startDate,
                            endDate,
                        });

                    const pageTransactions =
                        data?.transactions || [];

                    allTransactions = [
                        ...allTransactions,
                        ...pageTransactions,
                    ];

                    totalPages =
                        Number(
                            data?.pagination?.totalPages
                        ) || 1;

                    page += 1;
                } while (page <= totalPages);

                const getCategory = (transaction) => {
                    if (!transaction?.categoryId) {
                        return null;
                    }

                    if (
                        typeof transaction.categoryId ===
                        "object"
                    ) {
                        return transaction.categoryId;
                    }

                    return categories.find(
                        (category) =>
                            category._id ===
                            transaction.categoryId
                    );
                };

                const getContact = (transaction) => {
                    if (!transaction?.contactId) {
                        return null;
                    }

                    if (
                        typeof transaction.contactId ===
                        "object"
                    ) {
                        return transaction.contactId;
                    }

                    return contacts.find(
                        (contact) =>
                            contact._id ===
                            transaction.contactId
                    );
                };

                const contributionMap = new Map();

                allTransactions.forEach(
                    (transaction) => {
                        const category =
                            getCategory(transaction);

                        const contact =
                            getContact(transaction);

                        if (
                            category?.type !== "income" ||
                            contact?.contactType !==
                                "customer"
                        ) {
                            return;
                        }

                        const contactId =
                            contact._id ||
                            contact.id ||
                            contact.name;

                        if (!contactId) {
                            return;
                        }

                        const current =
                            contributionMap.get(
                                contactId
                            ) || {
                                id: contactId,
                                name:
                                    contact.name ||
                                    "Unknown customer",
                                amount: 0,
                                transactions: 0,
                            };

                        current.amount +=
                            Number(
                                transaction.amount
                            ) || 0;

                        current.transactions += 1;

                        contributionMap.set(
                            contactId,
                            current
                        );
                    }
                );

                const contribution =
                    Array.from(
                        contributionMap.values()
                    ).sort(
                        (a, b) =>
                            b.amount - a.amount
                    );

                const totalCustomerRevenue =
                    contribution.reduce(
                        (sum, customer) =>
                            sum + customer.amount,
                        0
                    );

                const result = contribution
                    .slice(0, 5)
                    .map((customer) => ({
                        ...customer,
                        percentage:
                            totalCustomerRevenue > 0
                                ? (customer.amount /
                                      totalCustomerRevenue) *
                                  100
                                : 0,
                    }));

                if (!cancelled) {
                    setCustomerContribution(result);
                }
            } catch (error) {
                console.error(
                    "Failed to load customer contribution:",
                    error
                );

                if (!cancelled) {
                    setCustomerContributionError(
                        "Unable to load customer contribution."
                    );
                    setCustomerContribution([]);
                }
            } finally {
                if (!cancelled) {
                    setCustomerContributionLoading(
                        false
                    );
                }
            }
        };

        if (
            categories.length > 0 ||
            contacts.length > 0
        ) {
            fetchCustomerContribution();
        } else {
            setCustomerContributionLoading(true);
        }

        return () => {
            cancelled = true;
        };
    }, [period, selectedYear, selectedMonth, categories, contacts]);

    /*
     * ---------------------------------------------------------
     * Financial Chart
     * ---------------------------------------------------------
     */

    useEffect(() => {
        let cancelled = false;

        const fetchChartData = async () => {
            try {
                setChartLoading(true);

                const { startDate, endDate } =
                    getDateRange(period, selectedYear, selectedMonth);

                const transactionLimit = 100;
                let page = 1;
                let allTransactions = [];
                let totalPages = 1;

                do {
                    const data =
                        await transactionService.getTransactions({
                            page,
                            limit: transactionLimit,
                            startDate,
                            endDate,
                        });

                    allTransactions = [
                        ...allTransactions,
                        ...(data?.transactions || []),
                    ];

                    totalPages =
                        Number(data?.pagination?.totalPages) || 1;
                    page += 1;
                } while (page <= totalPages);

                const granularity = getChartGranularity(
                    period,
                    selectedYear,
                    selectedMonth
                );

                const result = buildChartData(
                    allTransactions,
                    categories,
                    startDate,
                    endDate,
                    granularity
                );

                if (!cancelled) {
                    setChartData(result);
                }
            } catch (error) {
                console.error(
                    "Failed to load financial chart data:",
                    error
                );

                if (!cancelled) {
                    setChartData([]);
                }
            } finally {
                if (!cancelled) {
                    setChartLoading(false);
                }
            }
        };

        if (categories.length > 0) {
            fetchChartData();
        } else {
            setChartLoading(true);
        }

        return () => {
            cancelled = true;
        };
    }, [period, selectedYear, selectedMonth, categories]);

    /*
     * ---------------------------------------------------------
     * AI Insights
     * ---------------------------------------------------------
     */

    useEffect(() => {
        let cancelled = false;

        const fetchAIInsights = async () => {
            try {
                setAiLoading(true);
                setAiError("");

                const data =
                    await insightService.getInsights();

                if (!cancelled) {
                    setAiInsights(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setAiError(
                        error.response?.data?.message ||
                            "Unable to generate business insights."
                    );
                }
            } finally {
                if (!cancelled) {
                    setAiLoading(false);
                }
            }
        };

        fetchAIInsights();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * ---------------------------------------------------------
     * Helpers
     * ---------------------------------------------------------
     */

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN"
        )}`;
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

    const getCategory = (transaction) => {
        if (!transaction?.categoryId) {
            return null;
        }

        if (
            typeof transaction.categoryId ===
            "object"
        ) {
            return transaction.categoryId;
        }

        return categories.find(
            (category) =>
                category._id ===
                transaction.categoryId
        );
    };

    const getContact = (transaction) => {
        if (!transaction?.contactId) {
            return null;
        }

        if (
            typeof transaction.contactId ===
            "object"
        ) {
            return transaction.contactId;
        }

        return contacts.find(
            (contact) =>
                contact._id ===
                transaction.contactId
        );
    };

    /*
     * ---------------------------------------------------------
     * Derived Dashboard Data
     * ---------------------------------------------------------
     */

    const summary = dashboard?.summary || {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    };

    const categorySummary =
        dashboard?.categorySummary || [];

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

    const expenseCategories =
        categorySummary.filter(
            (category) =>
                category.type === "expense"
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
     * Expense Analysis
     */

    const expenseAnalysis = categorySummary
        .filter(
            (category) =>
                category.type === "expense"
        )
        .map((category) => ({
            name: category.categoryName,
            amount:
                Number(category.total) || 0,
        }))
        .sort(
            (a, b) => b.amount - a.amount
        );

    /*
     * Category Summary
     */

    const categoryActivityTotal =
        categorySummary.reduce(
            (sum, category) =>
                sum +
                (Number(category.total) || 0),
            0
        );

    const visibleCategorySummary =
        [...categorySummary]
            .sort(
                (a, b) =>
                    Number(b.total) -
                    Number(a.total)
            )
            .slice(0, 8);

    /*
     * AI
     */

    const insights = aiInsights?.insights || {};



    /*
     * ---------------------------------------------------------
     * Loading / Initial Error
     * ---------------------------------------------------------
     */

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

                    <div className="mt-5">
                        <Button
                            type="button"
                            onClick={fetchDashboard}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

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
                        A clear view of what is happening
                        in your business.
                    </p>
                </div>

            </div>

            {/* =================================================
                PERIOD FILTER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-fit rounded-lg border border-slate-800 bg-slate-900 p-1">
                    {Object.keys(PERIODS).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => {
                                setPeriod(option);
                                setSelectedYear("");
                                setSelectedMonth("");
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                period === option && !selectedYear && !selectedMonth
                                    ? "bg-indigo-500 text-white"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                        value={selectedYear}
                        onChange={(event) => {
                            setSelectedYear(event.target.value);
                            setPeriod("");
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
                    >
                        <option value="">All years</option>
                        {Array.from({ length: 5 }, (_, index) => {
                            const year = new Date().getFullYear() - index;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>

                    <select
                        value={selectedMonth}
                        onChange={(event) => {
                            setSelectedMonth(event.target.value);
                            setPeriod("");
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
                    >
                        <option value="">All months</option>
                        {Array.from({ length: 12 }, (_, index) => (
                            <option key={index} value={index}>
                                {new Date(2000, index, 1).toLocaleString("en-IN", { month: "long" })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <p className="text-xs text-slate-500">
                {selectedYear && selectedMonth
                    ? `Showing financial data for ${new Date(Number(selectedYear), Number(selectedMonth), 1).toLocaleString("en-IN", { month: "long", year: "numeric" })}`
                    : selectedYear
                    ? `Showing financial data for ${selectedYear}`
                    : selectedMonth
                    ? `Showing ${new Date(2000, Number(selectedMonth), 1).toLocaleString("en-IN", { month: "long" })} for the current year`
                    : "Dashboard data for the selected period"}
            </p>

            {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <LoadingSpinner size="sm" />
                    Updating dashboard...
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

            {/* =================================================
                FINANCIAL PERFORMANCE
            ================================================= */}

            <Card
                title="Financial Performance"
                description="Income vs expenses over the selected period."
            >
                {chartLoading ? (
                    <div className="flex h-80 items-center justify-center">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <LoadingSpinner size="sm" />
                            Updating financial performance...
                        </div>
                    </div>
                ) : chartData.length > 0 ? (
                    <div className="h-80 w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <LineChart
                                data={chartData}
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
                                    dataKey="label"
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
                                    strokeWidth={
                                        2
                                    }
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
                                    strokeWidth={
                                        2
                                    }
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

            {/* =================================================
                BUSINESS PULSE
            ================================================= */}

            <Card
                title="Business Pulse"
                description="A quick snapshot of your current financial position."
            >
                <div className="grid gap-4 md:grid-cols-3">
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
                                {
                                    financialPosition
                                }
                            </p>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            Based on income and expenses for
                            the selected period.
                        </p>
                    </div>

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
                            Highest expense category in the
                            selected period.
                        </p>
                    </div>

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
                            Revenue generated for every ₹1
                            spent.
                        </p>
                    </div>
                </div>
            </Card>

            {/* =================================================
                EXPENSE ANALYSIS
            ================================================= */}

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

            {/* =================================================
                CUSTOMER CONTRIBUTION
            ================================================= */}

            <Card
                title="Customer Contribution"
                description="Revenue contribution from your customers during the selected period."
            >
                {customerContributionLoading ? (
                    <div className="flex min-h-40 items-center justify-center">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <LoadingSpinner size="sm" />
                            Calculating customer contribution...
                        </div>
                    </div>
                ) : customerContributionError ? (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
                        {customerContributionError}
                    </div>
                ) : customerContribution.length >
                  0 ? (
                    <div className="space-y-4">
                        {customerContribution.map(
                            (customer) => (
                                <div
                                    key={
                                        customer.id
                                    }
                                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {
                                                    customer.name
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    customer.transactions
                                                }{" "}
                                                {customer.transactions ===
                                                1
                                                    ? "transaction"
                                                    : "transactions"}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-sm font-semibold text-emerald-400">
                                                {formatCurrency(
                                                    customer.amount
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {customer.percentage.toFixed(
                                                    1
                                                )}
                                                %
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-indigo-500 transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    customer.percentage,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        )}

                        {customerContribution.length ===
                            5 && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/contacts"
                                    )
                                }
                                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                            >
                                View all customers
                                <ChevronRight
                                    size={16}
                                />
                            </button>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title="No customer contribution data yet"
                        description="Customer revenue contribution will appear here once income transactions are linked to customers."
                    />
                )}
            </Card>

            {/* =================================================
                AI BUSINESS INSIGHTS
            ================================================= */}

            <Card>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                                <Sparkles size={18} />
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">
                                    AI Business Insights
                                </p>
                                <h2 className="mt-1 text-lg font-semibold text-white">
                                    What stands out in your business
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Highlights from your latest business data. Open AI Analyst for the detailed analysis and recommendations.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/ai-analyst")}
                            className="inline-flex w-fit shrink-0 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white"
                        >
                            Open AI Analyst
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {aiLoading ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <LoadingSpinner size="sm" />
                            Analyzing your business data...
                        </div>
                    ) : aiError ? (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
                            AI insights are temporarily unavailable.
                        </div>
                    ) : Array.isArray(insights.keyFindings) && insights.keyFindings.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {insights.keyFindings.slice(0, 2).map((item, index) => (
                                <div
                                    key={`overview-finding-${index}`}
                                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                                >
                                    <p className="text-sm font-semibold text-white">
                                        {item?.title || "Business finding"}
                                    </p>

                                    {item?.description && (
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {item.description}
                                        </p>
                                    )}

                                    {item?.evidence && (
                                        <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-5 text-slate-500">
                                            <span className="font-medium text-slate-400">Evidence:</span>{" "}
                                            {item.evidence}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : insights.summary ? (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                            <p className="text-sm leading-6 text-slate-300">
                                {insights.summary}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            Open AI Analyst for a detailed view of your business performance.
                        </p>
                    )}
                </div>
            </Card>

            {/* =================================================
                RECENT TRANSACTIONS
            ================================================= */}

            <Card
                title="Recent Transactions"
                description="Your latest financial activity."
            >
                {recentTransactions.length >
                0 ? (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px]">
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

                                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Contact
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentTransactions.map(
                                        (
                                            transaction
                                        ) => {
                                            const category =
                                                getCategory(
                                                    transaction
                                                );

                                            const contact =
                                                getContact(
                                                    transaction
                                                );

                                            const isIncome =
                                                category?.type ===
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
                                                            {category?.name ||
                                                                "Uncategorized"}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm text-slate-400">
                                                        {contact?.name ||
                                                            "—"}
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

                        <div className="mt-4 flex justify-end border-t border-slate-800 pt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/transactions"
                                    )
                                }
                                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                            >
                                View all transactions
                                <ChevronRight
                                    size={16}
                                />
                            </button>
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        title="No recent transactions"
                        description="Your latest income and expense transactions will appear here."
                    />
                )}
            </Card>

            {/* =================================================
                CATEGORY SUMMARY
            ================================================= */}

            <Card
                title="Category Summary"
                description="Your financial activity grouped by category. Percentages show each category’s share of total financial activity."
            >
                {visibleCategorySummary.length >
                0 ? (
                    <div className="space-y-4">
                        {visibleCategorySummary.map(
                            (category) => {
                                const total =
                                    Number(
                                        category.total
                                    ) || 0;

                                const percentage =
                                    categoryActivityTotal >
                                    0
                                        ? (total /
                                              categoryActivityTotal) *
                                          100
                                        : 0;

                                return (
                                    <div
                                        key={
                                            category.categoryId
                                        }
                                        className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">
                                                    {
                                                        category.categoryName
                                                    }
                                                </p>

                                                <p
                                                    className={`mt-1 text-xs capitalize ${
                                                        category.type ===
                                                        "income"
                                                            ? "text-emerald-400"
                                                            : "text-red-400"
                                                    }`}
                                                >
                                                    {
                                                        category.type
                                                    }
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-200">
                                                    {formatCurrency(
                                                        total
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {percentage.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className={`h-full rounded-full ${
                                                    category.type ===
                                                    "income"
                                                        ? "bg-emerald-500"
                                                        : "bg-indigo-500"
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        percentage,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}

                        {categorySummary.length >
                            visibleCategorySummary.length && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/categories"
                                    )
                                }
                                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                            >
                                View all categories
                                <ChevronRight
                                    size={16}
                                />
                            </button>
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