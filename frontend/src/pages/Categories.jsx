import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    Pencil,
    Plus,
    Receipt,
    Tag,
    TrendingUp,
    Trash2,
    Wallet,
} from "lucide-react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import categoryService from "../services/categoryService";
import transactionService from "../services/transactionService";
import dashboardService from "../services/dashboardService";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const CATEGORY_TYPES = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
];

const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatCompactCurrency = (value) => {
    const amount = Number(value || 0);

    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }

    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return formatCurrency(amount);
};

const getPercentage = (value, total) => {
    if (!total) {
        return 0;
    }

    return (Number(value || 0) / Number(total)) * 100;
};

const getCategoryColor = (index, type) => {
    const expenseColors = [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#ec4899",
        "#8b5cf6",
        "#06b6d4",
        "#14b8a6",
        "#84cc16",
    ];

    const incomeColors = [
        "#10b981",
        "#22c55e",
        "#14b8a6",
        "#06b6d4",
        "#3b82f6",
        "#6366f1",
        "#8b5cf6",
        "#a855f7",
    ];

    const colors =
        type === "income" ? incomeColors : expenseColors;

    return colors[index % colors.length];
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [transactionCounts, setTransactionCounts] =
        useState({});

    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] =
        useState(true);
    const [countsLoading, setCountsLoading] = useState(false);

    const [error, setError] = useState("");
    const [errorCanRetry, setErrorCanRetry] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState(null);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);
    const [deleteCategory, setDeleteCategory] =
        useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        type: "",
    });

    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");
            setErrorCanRetry(false);

            const data =
                await categoryService.getCategories();

            setCategories(data.categories || data || []);
        } catch (error) {
            console.error(
                "Failed to fetch categories:",
                error
            );

            setError(
                "Unable to load categories. Please try again."
            );
            setErrorCanRetry(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);

            const data =
                await dashboardService.getFinancialAnalytics();

            setAnalytics(data);
        } catch (error) {
            console.error(
                "Failed to fetch category analytics:",
                error
            );

            setAnalytics(null);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchTransactionCounts = async (categoryList) => {
        if (!categoryList.length) {
            setTransactionCounts({});
            return;
        }

        try {
            setCountsLoading(true);

            const results = await Promise.all(
                categoryList.map(async (category) => {
                    try {
                        const data =
                            await transactionService.getTransactions(
                                {
                                    categoryId:
                                        category._id,
                                    page: 1,
                                    limit: 1,
                                }
                            );

                        return {
                            categoryId: category._id,
                            count:
                                data?.pagination
                                    ?.totalTransactions || 0,
                        };
                    } catch (error) {
                        console.error(
                            `Failed to fetch transaction count for category ${category.name}:`,
                            error
                        );

                        return {
                            categoryId: category._id,
                            count: 0,
                        };
                    }
                })
            );

            const counts = {};

            results.forEach((item) => {
                counts[item.categoryId] = item.count;
            });

            setTransactionCounts(counts);
        } finally {
            setCountsLoading(false);
        }
    };

    const fetchPageData = async () => {
        setError("");
        setErrorCanRetry(false);

        await Promise.all([
            fetchCategories(),
            fetchAnalytics(),
        ]);
    };

    useEffect(() => {
        fetchPageData();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            fetchTransactionCounts(categories);
        } else {
            setTransactionCounts({});
        }
    }, [categories]);

    useEffect(() => {
        if (!error || errorCanRetry) {
            return;
        }

        const timer = setTimeout(() => {
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [error, errorCanRetry]);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setFormError("");
    };

    const resetForm = () => {
        setFormData({
            name: "",
            type: "",
        });

        setFormError("");
        setEditingCategory(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEditModal = (category) => {
        setEditingCategory(category);

        setFormData({
            name: category.name || "",
            type: category.type || "",
        });

        setFormError("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (submitting) {
            return;
        }

        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");

        const name = formData.name.trim();

        if (!name) {
            setFormError(
                "Please enter a category name."
            );
            return;
        }

        if (!formData.type) {
            setFormError(
                "Please select a category type."
            );
            return;
        }

        try {
            setSubmitting(true);

            const categoryData = {
                name,
                type: formData.type,
            };

            if (editingCategory) {
                await categoryService.updateCategory(
                    editingCategory._id,
                    categoryData
                );
            } else {
                await categoryService.createCategory(
                    categoryData
                );
            }

            setShowModal(false);
            resetForm();

            await fetchPageData();
        } catch (error) {
            console.error(
                "Failed to save category:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to save category. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDeleteModal = (category) => {
        setDeleteCategory(category);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        if (deleting) {
            return;
        }

        setShowDeleteModal(false);
        setDeleteCategory(null);
        setDeleteError("");
    };

    const handleDelete = async () => {
        if (!deleteCategory) {
            return;
        }

        try {
            setDeleting(true);
            setDeleteError("");

            await categoryService.deleteCategory(
                deleteCategory._id
            );

            setShowDeleteModal(false);
            setDeleteCategory(null);
            setDeleteError("");

            await fetchPageData();
        } catch (error) {
            console.error(
                "Failed to delete category:",
                error
            );

            setDeleteError(
                error.response?.data?.message ||
                    "Unable to delete category. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    };

    const incomeCategories = useMemo(() => {
        const categorySummary =
            analytics?.categorySummary || [];

        return categorySummary
            .filter(
                (category) => category.type === "income"
            )
            .map((category) => ({
                ...category,
                total: Number(category.total || 0),
            }))
            .sort((a, b) => b.total - a.total);
    }, [analytics]);

    const expenseCategories = useMemo(() => {
        const categorySummary =
            analytics?.categorySummary || [];

        return categorySummary
            .filter(
                (category) =>
                    category.type === "expense"
            )
            .map((category) => ({
                ...category,
                total: Number(category.total || 0),
            }))
            .sort((a, b) => b.total - a.total);
    }, [analytics]);

    const totalIncome = useMemo(() => {
        return incomeCategories.reduce(
            (sum, category) =>
                sum + category.total,
            0
        );
    }, [incomeCategories]);

    const totalExpense = useMemo(() => {
        return expenseCategories.reduce(
            (sum, category) =>
                sum + category.total,
            0
        );
    }, [expenseCategories]);

    const largestIncome =
        incomeCategories[0] || null;

    const largestExpense =
        expenseCategories[0] || null;

    const topExpenseShare = largestExpense
        ? getPercentage(
              largestExpense.total,
              totalExpense
          )
        : 0;

    const incomeChartData = incomeCategories.map(
        (category) => ({
            name: category.categoryName,
            value: category.total,
        })
    );

    const expenseChartData = expenseCategories.map(
        (category) => ({
            name: category.categoryName,
            value: category.total,
        })
    );

    const categoryRows = useMemo(() => {
        const summary =
            analytics?.categorySummary || [];

        return categories
            .map((category) => {
                const analyticsCategory =
                    summary.find(
                        (item) =>
                            String(item.categoryId) ===
                            String(category._id)
                    );

                const amount = Number(
                    analyticsCategory?.total || 0
                );

                const total =
                    category.type === "income"
                        ? totalIncome
                        : totalExpense;

                return {
                    ...category,
                    amount,
                    transactionCount:
                        transactionCounts[
                            category._id
                        ] || 0,
                    share: getPercentage(
                        amount,
                        total
                    ),
                };
            })
            .sort((a, b) => b.amount - a.amount);
    }, [
        categories,
        analytics,
        transactionCounts,
        totalIncome,
        totalExpense,
    ]);

    const incomeCount = categories.filter(
        (category) =>
            category.type === "income"
    ).length;

    const expenseCount = categories.filter(
        (category) =>
            category.type === "expense"
    ).length;

    const renderDonutChart = (data, type) => {
        if (!data.length) {
            return (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <Receipt
                            size={30}
                            className="mx-auto text-slate-600"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                            No {type} transactions yet.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative h-64">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={68}
                            outerRadius={94}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {data.map(
                                (entry, index) => (
                                    <Cell
                                        key={`entry.name-{index}`}
                                        fill={getCategoryColor(
                                            index,
                                            type
                                        )}
                                    />
                                )
                            )}
                        </Pie>

                        <Tooltip
                            formatter={(value) =>
                                formatCurrency(value)
                            }
                            contentStyle={{
                                backgroundColor:
                                    "#0f172a",
                                border: "1px solid #1e293b",
                                borderRadius: "10px",
                                color: "#f8fafc",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xs text-slate-500">
                            Total {type}
                        </p>

                        <p className="mt-1 font-['Space_Grotesk'] text-xl font-semibold text-white">
                            {formatCompactCurrency(
                                type === "income"
                                    ? totalIncome
                                    : totalExpense
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderLegend = (data, type) => {
        return (
            <div className="space-y-3">
                {data
                    .slice(0, 6)
                    .map((item, index) => {
                        const total =
                            type === "income"
                                ? totalIncome
                                : totalExpense;

                        const share =
                            getPercentage(
                                item.value,
                                total
                            );

                        return (
                            <div
                                key={`${item.name}-legend`}
                                className="flex items-center justify-between gap-3"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{
                                            backgroundColor:
                                                getCategoryColor(
                                                    index,
                                                    type
                                                ),
                                        }}
                                    />

                                    <span className="truncate text-sm text-slate-300">
                                        {item.name}
                                    </span>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="text-xs text-slate-500">
                                        {share.toFixed(
                                            0
                                        )}
                                        %
                                    </span>

                                    <span className="text-sm font-medium text-white">
                                        {formatCompactCurrency(
                                            item.value
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                {data.length > 6 && (
                    <p className="pt-1 text-xs text-slate-500">
                        + {data.length - 6} more categories
                    </p>
                )}
            </div>
        );
    };

    const isInitialLoading =
        loading || analyticsLoading;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-indigo-400">
                        Workspace
                    </p>

                    <h1 className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Organize your income and expenses
                        into categories.
                    </p>
                </div>

                <Button onClick={handleOpenAddModal}>
                    <Plus
                        size={17}
                        className="mr-2"
                    />
                    Add Category
                </Button>
            </div>

            {/* Page-level Error */}
            {error && (
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-red-400">
                            {error}
                        </p>

                        {errorCanRetry && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="mt-4"
                                onClick={fetchPageData}
                            >
                                Try Again
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {isInitialLoading ? (
                <Card>
                    <div className="flex justify-center py-16">
                        <LoadingSpinner />
                    </div>
                </Card>
            ) : categories.length === 0 ? (
                <Card>
                    <EmptyState
                        title="No categories yet"
                        description="Create your first category to organize your business transactions."
                        action={
                            <Button
                                onClick={
                                    handleOpenAddModal
                                }
                            >
                                <Plus
                                    size={17}
                                    className="mr-2"
                                />
                                Add Category
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Total Categories
                                    </p>

                                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                        {categories.length}
                                    </p>

                                    <p className="mt-2 text-xs text-slate-500">
                                        {incomeCount} income
                                        {" · "}
                                        {expenseCount} expense
                                    </p>
                                </div>

                                <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                                    <Tag size={20} />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-400">
                                        Largest Expense
                                    </p>

                                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                        {largestExpense
                                            ? formatCompactCurrency(
                                                  largestExpense.total
                                              )
                                            : "₹0"}
                                    </p>

                                    <p className="mt-2 truncate text-xs text-slate-500">
                                        {largestExpense
                                            ? largestExpense.categoryName
                                            : "No expense data"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                                    <Wallet size={20} />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-400">
                                        Largest Income
                                    </p>

                                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                        {largestIncome
                                            ? formatCompactCurrency(
                                                  largestIncome.total
                                              )
                                            : "₹0"}
                                    </p>

                                    <p className="mt-2 truncate text-xs text-slate-500">
                                        {largestIncome
                                            ? largestIncome.categoryName
                                            : "No income data"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                                    <TrendingUp
                                        size={20}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Concentration
                                    </p>

                                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                        {topExpenseShare.toFixed(
                                            0
                                        )}
                                        %
                                    </p>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Top expense category
                                    </p>
                                </div>

                                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                                    <BarChart3
                                        size={20}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Distribution Charts */}
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <Card
                            title="Expense Distribution"
                            description="How your total expenses are distributed across categories."
                        >
                            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                                {renderDonutChart(
                                    expenseChartData,
                                    "expense"
                                )}

                                {renderLegend(
                                    expenseChartData,
                                    "expense"
                                )}
                            </div>
                        </Card>

                        <Card
                            title="Income Distribution"
                            description="How your total income is distributed across categories."
                        >
                            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                                {renderDonutChart(
                                    incomeChartData,
                                    "income"
                                )}

                                {renderLegend(
                                    incomeChartData,
                                    "income"
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Category Performance */}
                    <Card
                        title="Category Performance"
                        description="Your categories ranked by financial contribution."
                    >
                        <div className="mt-5 space-y-5">
                            {categoryRows
                                .slice(0, 8)
                                .map(
                                    (
                                        category,
                                        index
                                    ) => {
                                        const isIncome =
                                            category.type ===
                                            "income";

                                        return (
                                            <div
                                                key={
                                                    category._id
                                                }
                                            >
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-medium text-slate-400">
                                                                {index +
                                                                    1}
                                                            </span>

                                                            <p className="truncate text-sm font-medium text-white">
                                                                {
                                                                    category.name
                                                                }
                                                            </p>
                                                        </div>

                                                        <p className="mt-1 pl-8 text-xs text-slate-500">
                                                            {countsLoading
                                                                ? "Loading transactions..."
                                                                : `${category.transactionCount} ${
                                                                      category.transactionCount ===
                                                                      1
                                                                          ? "transaction"
                                                                          : "transactions"
                                                                  }`}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3 pl-8 sm:pl-0">
                                                        <span
                                                            className={
                                                                isIncome
                                                                    ? "text-sm font-medium text-emerald-400"
                                                                    : "text-sm font-medium text-red-400"
                                                            }
                                                        >
                                                            {formatCompactCurrency(
                                                                category.amount
                                                            )}
                                                        </span>

                                                        <span className="text-xs text-slate-500">
                                                            ·{" "}
                                                            {category.share.toFixed(
                                                                0
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            isIncome
                                                                ? "bg-emerald-500"
                                                                : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                category.share,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}

                            {categoryRows.length === 0 && (
                                <p className="py-8 text-center text-sm text-slate-500">
                                    No category performance
                                    data available.
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Category Management */}
                    <Card
                        title="Category Management"
                        description="Manage your income and expense categories."
                    >
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left">
                                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Category
                                        </th>

                                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Type
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Transactions
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Amount
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Share
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categoryRows.map(
                                        (category) => {
                                            const isIncome =
                                                category.type ===
                                                "income";

                                            return (
                                                <tr
                                                    key={
                                                        category._id
                                                    }
                                                    className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
                                                >
                                                    <td className="px-4 py-4">
                                                        <p className="font-medium text-white">
                                                            {
                                                                category.name
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            variant={
                                                                isIncome
                                                                    ? "success"
                                                                    : "danger"
                                                            }
                                                        >
                                                            {isIncome
                                                                ? "Income"
                                                                : "Expense"}
                                                        </Badge>
                                                    </td>

                                                    <td className="px-4 py-4 text-right text-sm text-slate-300">
                                                        {countsLoading
                                                            ? "..."
                                                            : category.transactionCount}
                                                    </td>

                                                    <td className="px-4 py-4 text-right">
                                                        <span
                                                            className={
                                                                isIncome
                                                                    ? "text-sm font-medium text-emerald-400"
                                                                    : "text-sm font-medium text-red-400"
                                                            }
                                                        >
                                                            {formatCurrency(
                                                                category.amount
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-right text-sm text-slate-400">
                                                        {category.share.toFixed(
                                                            0
                                                        )}
                                                        %
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenEditModal(
                                                                        category
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                                                title="Edit category"
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenDeleteModal(
                                                                        category
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                                                                title="Delete category"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}

            {/* Add / Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={
                    editingCategory
                        ? "Edit Category"
                        : "Add Category"
                }
            >
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <Input
                        label="Category Name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g. Sales, Rent, Marketing"
                        required
                    />

                    <Select
                        label="Type"
                        name="type"
                        value={formData.type}
                        onChange={handleFormChange}
                        options={CATEGORY_TYPES}
                        placeholder="Select type"
                        required
                    />

                    {formError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                            <p className="text-sm leading-5 text-red-400">
                                {formError}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCloseModal}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Saving..."
                                : editingCategory
                                ? "Save Changes"
                                : "Add Category"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                title="Delete Category"
            >
                <div className="space-y-5">
                    <p className="text-sm leading-6 text-slate-400">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-white">
                            {deleteCategory?.name}
                        </span>
                        ?
                    </p>

                    {deleteError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                            <p className="text-xs leading-5 text-red-400">
                                {deleteError}
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-slate-500">
                        A category cannot be deleted if
                        transactions are associated with it.
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCloseDeleteModal}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Category"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Categories;

