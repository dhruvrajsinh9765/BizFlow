import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronRight,
    Mail,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";

import contactService from "../services/contactService";
import transactionService from "../services/transactionService";
import categoryService from "../services/categoryService";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const initialForm = {
    name: "",
    contactType: "",
    phone: "",
    email: "",
    address: "",
};

const CONTACT_TYPES = [
    {
        value: "customer",
        label: "Customer",
    },
    {
        value: "supplier",
        label: "Supplier",
    },
];

const ACTIVITY_FILTERS = [
    {
        value: "",
        label: "All contacts",
    },
    {
        value: "recent",
        label: "Recently active",
    },
];

const SORT_OPTIONS = [
    {
        value: "nameAsc",
        label: "Name A–Z",
    },
    {
        value: "nameDesc",
        label: "Name Z–A",
    },
    {
        value: "recent",
        label: "Recently added",
    },
    {
        value: "revenue",
        label: "Highest revenue",
    },
    {
        value: "transactions",
        label: "Most transactions",
    },
];

const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;
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

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getInitials = (name = "") => {
    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "?";
    }

    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const getContactTypeLabel = (contactType) => {
    if (!contactType) return "Unknown";

    return (
        contactType.charAt(0).toUpperCase() +
        contactType.slice(1)
    );
};

const getTransactionContactId = (transaction) => {
    if (!transaction?.contactId) {
        return "";
    }

    if (typeof transaction.contactId === "object") {
        return transaction.contactId?._id || "";
    }

    return String(transaction.contactId);
};

const getTransactionCategoryId = (transaction) => {
    if (!transaction?.categoryId) {
        return "";
    }

    if (typeof transaction.categoryId === "object") {
        return transaction.categoryId?._id || "";
    }

    return String(transaction.categoryId);
};

const isIncomeTransaction = (transaction, categories) => {
    if (
        transaction?.categoryId &&
        typeof transaction.categoryId === "object" &&
        transaction.categoryId.type
    ) {
        return transaction.categoryId.type === "income";
    }

    const categoryId = getTransactionCategoryId(transaction);

    const category = categories.find(
        (item) => String(item._id) === String(categoryId)
    );

    return category?.type === "income";
};

const isRecentTransaction = (transaction) => {
    if (!transaction?.transactionDate) {
        return false;
    }

    const transactionDate = new Date(
        transaction.transactionDate
    );

    if (Number.isNaN(transactionDate.getTime())) {
        return false;
    }

    const now = new Date();

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(
        thirtyDaysAgo.getDate() - 30
    );

    return transactionDate >= thirtyDaysAgo;
};

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] =
        useState(true);

    const [error, setError] = useState("");
    const [insightsError, setInsightsError] = useState("");

    const [search, setSearch] = useState("");
    const [contactType, setContactType] = useState("");
    const [activityFilter, setActivityFilter] =
        useState("");
    const [sortBy, setSortBy] = useState("nameAsc");

    const [modalType, setModalType] = useState(null);
    const [selectedContact, setSelectedContact] =
        useState(null);

    const [drawerLoading, setDrawerLoading] =
        useState(false);

    const [formData, setFormData] =
        useState(initialForm);

    const [formErrors, setFormErrors] =
        useState({});

    const [formSubmitError, setFormSubmitError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const loadContacts = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await contactService.getContacts();

            const contactList =
                data?.contacts || data || [];

            setContacts(
                Array.isArray(contactList)
                    ? contactList
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load contacts:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load contacts."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadInsights = async () => {
        try {
            setInsightsLoading(true);
            setInsightsError("");

            const [categoryData, firstPageData] =
                await Promise.all([
                    categoryService.getCategories(),
                    transactionService.getTransactions({
                        page: 1,
                        limit: 100,
                        sortBy: "transactionDate",
                        order: "desc",
                    }),
                ]);

            const loadedCategories =
                categoryData?.categories ||
                categoryData ||
                [];

            const firstPageTransactions =
                firstPageData?.transactions || [];

            const pagination =
                firstPageData?.pagination || {};

            const totalPages =
                pagination?.totalPages ||
                pagination?.pages ||
                1;

            let allTransactions = [
                ...firstPageTransactions,
            ];

            if (totalPages > 1) {
                const remainingRequests = [];

                for (
                    let page = 2;
                    page <= totalPages;
                    page += 1
                ) {
                    remainingRequests.push(
                        transactionService.getTransactions({
                            page,
                            limit: 100,
                            sortBy: "transactionDate",
                            order: "desc",
                        })
                    );
                }

                const remainingPages =
                    await Promise.all(
                        remainingRequests
                    );

                remainingPages.forEach(
                    (pageData) => {
                        allTransactions = [
                            ...allTransactions,
                            ...(pageData?.transactions ||
                                []),
                        ];
                    }
                );
            }

            setCategories(
                Array.isArray(loadedCategories)
                    ? loadedCategories
                    : []
            );

            setTransactions(allTransactions);
        } catch (error) {
            console.error(
                "Failed to load contact insights:",
                error
            );

            setInsightsError(
                "Contact insights are temporarily unavailable."
            );
        } finally {
            setInsightsLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
        loadInsights();
    }, []);

    const getContactStats = (contact) => {
        const contactId = String(
            contact?._id || ""
        );

        const contactTransactions =
            transactions.filter(
                (transaction) =>
                    String(
                        getTransactionContactId(
                            transaction
                        )
                    ) === contactId
            );

        let revenue = 0;
        let expenses = 0;

        contactTransactions.forEach(
            (transaction) => {
                const amount = Number(
                    transaction.amount || 0
                );

                if (
                    isIncomeTransaction(
                        transaction,
                        categories
                    )
                ) {
                    revenue += amount;
                } else {
                    expenses += amount;
                }
            }
        );

        const recentTransactionCount =
            contactTransactions.filter(
                isRecentTransaction
            ).length;

        const latestTransaction =
            [...contactTransactions].sort(
                (a, b) =>
                    new Date(
                        b.transactionDate || 0
                    ) -
                    new Date(
                        a.transactionDate || 0
                    )
            )[0] || null;

        return {
            revenue,
            expenses,
            transactionCount:
                contactTransactions.length,
            recentTransactionCount,
            latestTransaction,
        };
    };

    const contactStatsMap = useMemo(() => {
        const map = {};

        contacts.forEach((contact) => {
            map[String(contact._id)] =
                getContactStats(contact);
        });

        return map;
    }, [contacts, transactions, categories]);

    const filteredContacts = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        let result = contacts.filter(
            (contact) => {
                const matchesSearch =
                    !searchValue ||
                    [
                        contact.name,
                        contact.phone,
                        contact.email,
                        contact.address,
                        contact.contactType,
                    ]
                        .filter(Boolean)
                        .some((value) =>
                            String(value)
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )
                        );

                const matchesActivity =
                    activityFilter !== "recent" ||
                    (
                        contactStatsMap[
                            String(contact._id)
                        ]?.recentTransactionCount ||
                        0
                    ) > 0;

                return (
                    matchesSearch &&
                    matchesActivity
                );
            }
        );

        result = [...result].sort(
            (a, b) => {
                const statsA =
                    contactStatsMap[
                        String(a._id)
                    ] || {};

                const statsB =
                    contactStatsMap[
                        String(b._id)
                    ] || {};

                if (sortBy === "nameDesc") {
                    return String(b.name || "")
                        .localeCompare(
                            String(a.name || "")
                        );
                }

                if (sortBy === "recent") {
                    const dateA = new Date(
                        statsA.latestTransaction
                            ?.transactionDate ||
                            a.createdAt ||
                            0
                    ).getTime();

                    const dateB = new Date(
                        statsB.latestTransaction
                            ?.transactionDate ||
                            b.createdAt ||
                            0
                    ).getTime();

                    return dateB - dateA;
                }

                if (sortBy === "revenue") {
                    return (
                        Number(
                            statsB.revenue || 0
                        ) -
                        Number(
                            statsA.revenue || 0
                        )
                    );
                }

                if (sortBy === "transactions") {
                    return (
                        Number(
                            statsB.transactionCount ||
                                0
                        ) -
                        Number(
                            statsA.transactionCount ||
                                0
                        )
                    );
                }

                return String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    );
            }
        );

        return result;
    }, [
        contacts,
        search,
        activityFilter,
        sortBy,
        contactStatsMap,
    ]);

    const summary = useMemo(() => {
        const totalContacts =
            contacts.length;

        const customers = contacts.filter(
            (contact) =>
                contact.contactType === "customer"
        ).length;

        const suppliers = contacts.filter(
            (contact) =>
                contact.contactType === "supplier"
        ).length;

        const activeContacts =
            contacts.filter((contact) => {
                const stats =
                    contactStatsMap[
                        String(contact._id)
                    ];

                return (
                    (stats?.recentTransactionCount ||
                        0) > 0
                );
            }).length;

        const contactsWithDetails =
            contacts.filter(
                (contact) =>
                    Boolean(
                        contact.phone ||
                            contact.email
                    )
            ).length;

        return {
            totalContacts,
            customers,
            suppliers,
            activeContacts,
            contactsWithDetails,
        };
    }, [contacts, contactStatsMap]);

    const revenueContributors = useMemo(() => {
        return contacts
            .filter(
                (contact) =>
                    contact.contactType ===
                    "customer"
            )
            .map((contact) => ({
                contact,
                stats:
                    contactStatsMap[
                        String(contact._id)
                    ] || {},
            }))
            .filter(
                ({ stats }) =>
                    Number(stats.revenue || 0) > 0
            )
            .sort(
                (a, b) =>
                    Number(b.stats.revenue || 0) -
                    Number(a.stats.revenue || 0)
            )
            .slice(0, 5);
    }, [contacts, contactStatsMap]);

    const activityData = useMemo(() => {
        const today = new Date();

        const points = [];

        for (let index = 5; index >= 0; index -= 1) {
            const date = new Date(
                today.getFullYear(),
                today.getMonth() - index,
                1
            );

            const year =
                date.getFullYear();

            const month =
                date.getMonth();

            const count =
                transactions.filter(
                    (transaction) => {
                        if (
                            !transaction.transactionDate
                        ) {
                            return false;
                        }

                        const transactionDate =
                            new Date(
                                transaction.transactionDate
                            );

                        return (
                            transactionDate.getFullYear() ===
                                year &&
                            transactionDate.getMonth() ===
                                month &&
                            Boolean(
                                getTransactionContactId(
                                    transaction
                                )
                            )
                        );
                    }
                ).length;

            points.push({
                label: date.toLocaleDateString(
                    "en-IN",
                    {
                        month: "short",
                    }
                ),
                count,
            });
        }

        return points;
    }, [transactions]);

    const maxActivity = Math.max(
        ...activityData.map(
            (item) => item.count
        ),
        1
    );

    const maxRevenue = Math.max(
        ...revenueContributors.map(
            ({ stats }) =>
                Number(stats.revenue || 0)
        ),
        1
    );

    const openAddModal = () => {
        setFormData(initialForm);
        setFormErrors({});
        setFormSubmitError("");
        setSelectedContact(null);
        setModalType("add");
    };

    const openViewDrawer = async (contact) => {
        setSelectedContact(contact);
        setModalType("view");
        setDrawerLoading(true);

        try {
            const data =
                await contactService.getContactById(
                    contact._id
                );

            const latestContact =
                data?.contact || data;

            if (latestContact?._id) {
                setSelectedContact(
                    latestContact
                );
            }
        } catch (error) {
            console.error(
                "Failed to load contact details:",
                error
            );
        } finally {
            setDrawerLoading(false);
        }
    };

    const openEditModal = (contact) => {
        setSelectedContact(contact);

        setFormData({
            name: contact.name || "",
            contactType:
                contact.contactType || "",
            phone: contact.phone || "",
            email: contact.email || "",
            address: contact.address || "",
        });

        setFormErrors({});
        setFormSubmitError("");
        setModalType("edit");
    };

    const openDeleteModal = (contact) => {
        setSelectedContact(contact);
        setModalType("delete");
    };

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setModalType(null);
        setSelectedContact(null);
        setFormData(initialForm);
        setFormErrors({});
        setFormSubmitError("");
        setDrawerLoading(false);
    };

    const handleChange = (event) => {
        const { name, value } =
            event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setFormSubmitError("");
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name =
                "Contact name is required.";
        }

        if (!formData.contactType) {
            errors.contactType =
                "Contact type is required.";
        }

        if (
            formData.phone &&
            !/^[0-9]{10}$/.test(
                formData.phone.trim()
            )
        ) {
            errors.phone =
                "Phone number must contain exactly 10 digits.";
        }

        if (
            formData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            errors.email =
                "Please provide a valid email address.";
        }

        setFormErrors(errors);

        return (
            Object.keys(errors).length === 0
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormSubmitError("");
        setError("");

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                name: formData.name.trim(),
                contactType:
                    formData.contactType,
            };

            if (formData.phone.trim()) {
                payload.phone =
                    formData.phone.trim();
            }

            if (formData.email.trim()) {
                payload.email =
                    formData.email.trim();
            }

            if (formData.address.trim()) {
                payload.address =
                    formData.address.trim();
            }

            if (modalType === "add") {
                await contactService.createContact(
                    payload
                );

                setSuccessMessage(
                    "Contact created successfully."
                );
            } else {
                await contactService.updateContact(
                    selectedContact._id,
                    payload
                );

                setSuccessMessage(
                    "Contact updated successfully."
                );
            }

            closeModal();

            await Promise.all([
                loadContacts(),
                loadInsights(),
            ]);

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            console.error(
                "Failed to save contact:",
                error
            );

            setFormSubmitError(
                error.response?.data?.message ||
                    "Unable to save contact. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedContact) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccessMessage("");

            await contactService.deleteContact(
                selectedContact._id
            );

            closeModal();

            await Promise.all([
                loadContacts(),
                loadInsights(),
            ]);

            setSuccessMessage(
                "Contact deleted successfully."
            );

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            console.error(
                "Failed to delete contact:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to delete contact."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const selectedContactStats =
        selectedContact
            ? contactStatsMap[
                  String(selectedContact._id)
              ] || {
                  revenue: 0,
                  expenses: 0,
                  transactionCount: 0,
                  recentTransactionCount: 0,
                  latestTransaction: null,
              }
            : null;

    const selectedContactTransactions =
        selectedContact
            ? transactions
                  .filter(
                      (transaction) =>
                          String(
                              getTransactionContactId(
                                  transaction
                              )
                          ) ===
                          String(
                              selectedContact._id
                          )
                  )
                  .sort(
                      (a, b) =>
                          new Date(
                              b.transactionDate ||
                                  0
                          ) -
                          new Date(
                              a.transactionDate ||
                                  0
                          )
                  )
                  .slice(0, 5)
            : [];

    const clearFilters = () => {
        setSearch("");
        setContactType("");
        setActivityFilter("");
        setSortBy("nameAsc");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-sm font-medium text-indigo-400">
                        Workspace / Contacts
                    </p>

                    <h1 className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
                        Contacts
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-400">
                        Understand who contributes revenue
                        and how active each relationship is.
                    </p>
                </div>

                <Button
                    onClick={openAddModal}
                    className="w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                </Button>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Total contacts
                            </p>

                            <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                {loading
                                    ? "—"
                                    : summary.totalContacts}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {summary.contactsWithDetails}{" "}
                                with contact details
                            </p>
                        </div>

                        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Customers
                            </p>

                            <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                {loading
                                    ? "—"
                                    : summary.customers}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Customer relationships
                            </p>
                        </div>

                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Suppliers
                            </p>

                            <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                {loading
                                    ? "—"
                                    : summary.suppliers}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Supplier relationships
                            </p>
                        </div>

                        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                            <ArrowDownRight className="h-5 w-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Active contacts
                            </p>

                            <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                                {insightsLoading
                                    ? "—"
                                    : summary.activeContacts}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Active in the last 30 days
                            </p>
                        </div>

                        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Insight Charts */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card>
                    <div className="mb-5 flex items-start justify-between">
                        <div>
                            <h2 className="font-['Space_Grotesk'] text-base font-semibold text-white">
                                Revenue contribution
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Top customers based on linked income
                                transactions.
                            </p>
                        </div>

                        <span className="text-xs text-slate-600">
                            Top 5
                        </span>
                    </div>

                    {insightsLoading ? (
                        <div className="flex h-52 items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : revenueContributors.length === 0 ? (
                        <div className="flex h-52 items-center justify-center text-center">
                            <div>
                                <p className="text-sm text-slate-400">
                                    No linked customer revenue yet.
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                    Link income transactions to customers
                                    to see contribution here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {revenueContributors.map(
                                ({
                                    contact,
                                    stats,
                                }) => {
                                    const percentage =
                                        Math.max(
                                            4,
                                            (Number(
                                                stats.revenue ||
                                                    0
                                            ) /
                                                maxRevenue) *
                                                100
                                        );

                                    return (
                                        <button
                                            key={contact._id}
                                            type="button"
                                            onClick={() =>
                                                openViewDrawer(
                                                    contact
                                                )
                                            }
                                            className="group w-full text-left"
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <span className="truncate text-sm font-medium text-slate-300 group-hover:text-white">
                                                    {
                                                        contact.name
                                                    }
                                                </span>

                                                <span className="shrink-0 text-sm font-medium text-emerald-400">
                                                    {formatCompactCurrency(
                                                        stats.revenue
                                                    )}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-indigo-500 transition-all"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="mb-5 flex items-start justify-between">
                        <div>
                            <h2 className="font-['Space_Grotesk'] text-base font-semibold text-white">
                                Customer activity
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Contact-linked transactions per month.
                            </p>
                        </div>

                        <span className="text-xs text-slate-600">
                            Last 6 months
                        </span>
                    </div>

                    {insightsLoading ? (
                        <div className="flex h-52 items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="flex h-52 items-end gap-3">
                            {activityData.map(
                                (item) => {
                                    const height =
                                        item.count === 0
                                            ? 4
                                            : Math.max(
                                                  8,
                                                  (item.count /
                                                      maxActivity) *
                                                      100
                                              );

                                    return (
                                        <div
                                            key={item.label}
                                            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                                        >
                                            <span className="text-[10px] text-slate-500">
                                                {item.count}
                                            </span>

                                            <div className="flex h-32 w-full items-end justify-center">
                                                <div
                                                    className="w-full max-w-10 rounded-t-md bg-indigo-500/80 transition-all"
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                />
                                            </div>

                                            <span className="text-[10px] text-slate-600">
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {insightsError && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
                    {insightsError}
                </div>
            )}

            {/* Search / Filters */}
            <Card>
                <div className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px_190px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search name, phone, email or address..."
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <Select
                            name="contactTypeFilter"
                            value={contactType}
                            onChange={(event) =>
                                setContactType(
                                    event.target.value
                                )
                            }
                            options={CONTACT_TYPES}
                            placeholder="All types"
                        />

                        <Select
                            name="activityFilter"
                            value={activityFilter}
                            onChange={(event) =>
                                setActivityFilter(
                                    event.target.value
                                )
                            }
                            options={ACTIVITY_FILTERS}
                            placeholder="Activity"
                        />

                        <Select
                            name="sortBy"
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(
                                    event.target.value
                                )
                            }
                            options={SORT_OPTIONS}
                            placeholder="Sort by"
                        />
                    </div>

                    <div className="flex flex-col justify-between gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setContactType("")
                                }
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                    !contactType
                                        ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                                        : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                }`}
                            >
                                All
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setContactType(
                                        "customer"
                                    )
                                }
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                    contactType ===
                                    "customer"
                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                        : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                }`}
                            >
                                Customers
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setContactType(
                                        "supplier"
                                    )
                                }
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                    contactType ===
                                    "supplier"
                                        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                        : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                }`}
                            >
                                Suppliers
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <span className="text-slate-300">
                                    {
                                        filteredContacts.length
                                    }
                                </span>{" "}
                                of{" "}
                                <span className="text-slate-300">
                                    {contacts.length}
                                </span>{" "}
                                contacts
                            </p>

                            {(search ||
                                contactType ||
                                activityFilter ||
                                sortBy !==
                                    "nameAsc") && (
                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Contacts */}
            {loading ? (
                <Card>
                    <div className="flex min-h-64 items-center justify-center">
                        <LoadingSpinner />
                    </div>
                </Card>
            ) : filteredContacts.length === 0 ? (
                <Card>
                    <EmptyState
                        title={
                            search ||
                            contactType ||
                            activityFilter
                                ? "No contacts found"
                                : "No contacts yet"
                        }
                        description={
                            search ||
                            contactType ||
                            activityFilter
                                ? "Try changing your search or filters."
                                : "Add your first customer or supplier to start managing your business relationships."
                        }
                        action={
                            !search &&
                            !contactType &&
                            !activityFilter ? (
                                <Button
                                    onClick={
                                        openAddModal
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Contact
                                </Button>
                            ) : null
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredContacts.map(
                        (contact) => {
                            const stats =
                                contactStatsMap[
                                    String(
                                        contact._id
                                    )
                                ] || {
                                    revenue: 0,
                                    expenses: 0,
                                    transactionCount: 0,
                                    recentTransactionCount: 0,
                                };

                            const isActive =
                                stats.recentTransactionCount >
                                0;

                            return (
                                <Card
                                    key={contact._id}
                                    className="group transition hover:border-slate-700"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openViewDrawer(
                                                    contact
                                                )
                                            }
                                            className="flex min-w-0 items-center gap-3 text-left"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-300">
                                                {getInitials(
                                                    contact.name
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-white group-hover:text-indigo-300">
                                                    {
                                                        contact.name
                                                    }
                                                </h3>

                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            contact.contactType ===
                                                            "customer"
                                                                ? "info"
                                                                : "warning"
                                                        }
                                                    >
                                                        {getContactTypeLabel(
                                                            contact.contactType
                                                        )}
                                                    </Badge>

                                                    {isActive && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openViewDrawer(
                                                    contact
                                                )
                                            }
                                            className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-800 hover:text-slate-300"
                                            aria-label={`View ${contact.name}`}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                                        {contact.phone && (
                                            <a
                                                href={`tel:${contact.phone}`}
                                                className="flex items-center gap-2 truncate text-xs text-slate-400 hover:text-slate-200"
                                            >
                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {
                                                        contact.phone
                                                    }
                                                </span>
                                            </a>
                                        )}

                                        {contact.email && (
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="flex items-center gap-2 truncate text-xs text-slate-400 hover:text-slate-200"
                                            >
                                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {
                                                        contact.email
                                                    }
                                                </span>
                                            </a>
                                        )}

                                        {!contact.phone &&
                                            !contact.email && (
                                                <p className="text-xs text-slate-600">
                                                    No phone or email
                                                    provided.
                                                </p>
                                            )}
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 divide-x divide-slate-800 rounded-lg border border-slate-800 bg-slate-950/50">
                                        <div className="px-3 py-3">
                                            <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                                Revenue
                                            </p>

                                            <p className="mt-1 truncate text-sm font-semibold text-emerald-400">
                                                {formatCompactCurrency(
                                                    stats.revenue
                                                )}
                                            </p>
                                        </div>

                                        <div className="px-3 py-3">
                                            <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                                Expenses
                                            </p>

                                            <p className="mt-1 truncate text-sm font-semibold text-red-400">
                                                {formatCompactCurrency(
                                                    stats.expenses
                                                )}
                                            </p>
                                        </div>

                                        <div className="px-3 py-3">
                                            <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                                Transactions
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-white">
                                                {
                                                    stats.transactionCount
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openViewDrawer(
                                                    contact
                                                )
                                            }
                                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                                        >
                                            View details
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        contact
                                                    )
                                                }
                                                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                                                aria-label="Edit contact"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        contact
                                                    )
                                                }
                                                className="rounded-md p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                                aria-label="Delete contact"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        }
                    )}
                </div>
            )}

            {/* Add / Edit Modal */}
            {(modalType === "add" ||
                modalType === "edit") && (
                <Modal
                    isOpen
                    onClose={closeModal}
                    title={
                        modalType === "add"
                            ? "Add Contact"
                            : "Edit Contact"
                    }
                >
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {formSubmitError && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {formSubmitError}
                            </div>
                        )}

                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter contact name"
                            error={formErrors.name}
                            required
                        />

                        <Select
                            label="Contact Type"
                            name="contactType"
                            value={
                                formData.contactType
                            }
                            onChange={handleChange}
                            options={CONTACT_TYPES}
                            placeholder="Select contact type"
                            error={
                                formErrors.contactType
                            }
                            required
                        />

                        <Input
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit phone number"
                            error={formErrors.phone}
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            error={formErrors.email}
                        />

                        <div>
                            <label
                                htmlFor="address"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Address
                            </label>

                            <textarea
                                id="address"
                                name="address"
                                value={
                                    formData.address
                                }
                                onChange={handleChange}
                                placeholder="Enter address"
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={closeModal}
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
                                    : modalType ===
                                      "add"
                                    ? "Add Contact"
                                    : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Modal */}
            {modalType === "delete" &&
                selectedContact && (
                    <Modal
                        isOpen
                        onClose={closeModal}
                        title="Delete Contact"
                    >
                        <div className="space-y-5">
                            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                                <p className="text-sm leading-6 text-slate-400">
                                    Are you sure you want
                                    to delete{" "}
                                    <span className="font-medium text-white">
                                        {
                                            selectedContact.name
                                        }
                                    </span>
                                    ?
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    This contact will no
                                    longer appear in your
                                    active contacts or
                                    transaction contact
                                    lists.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={closeModal}
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={handleDelete}
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Deleting..."
                                        : "Delete Contact"}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

            {/* Contact Detail Drawer */}
            {modalType === "view" &&
                selectedContact && (
                    <div className="fixed inset-0 z-50">
                        <button
                            type="button"
                            aria-label="Close contact details"
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                        />

                        <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Contact details
                                    </p>

                                    <h2 className="mt-1 font-['Space_Grotesk'] text-xl font-semibold text-white">
                                        {
                                            selectedContact.name
                                        }
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {drawerLoading ? (
                                    <div className="flex min-h-80 items-center justify-center">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Profile */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xl font-semibold text-indigo-300">
                                                {getInitials(
                                                    selectedContact.name
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {
                                                        selectedContact.name
                                                    }
                                                </h3>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            selectedContact.contactType ===
                                                            "customer"
                                                                ? "info"
                                                                : "warning"
                                                        }
                                                    >
                                                        {getContactTypeLabel(
                                                            selectedContact.contactType
                                                        )}
                                                    </Badge>

                                                    {selectedContactStats?.recentTransactionCount >
                                                        0 && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                            Active recently
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial Summary */}
                                        <div>
                                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Financial summary
                                            </p>

                                            <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/50">
                                                <div className="px-3 py-4">
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                                        Revenue
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                                                        {formatCompactCurrency(
                                                            selectedContactStats?.revenue
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="px-3 py-4">
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                                        Expenses
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-red-400">
                                                        {formatCompactCurrency(
                                                            selectedContactStats?.expenses
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="px-3 py-4">
                                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                                        Transactions
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-white">
                                                        {
                                                            selectedContactStats?.transactionCount
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div>
                                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Contact information
                                            </p>

                                            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                                                <div>
                                                    <p className="text-xs text-slate-600">
                                                        Phone
                                                    </p>

                                                    {selectedContact.phone ? (
                                                        <a
                                                            href={`tel:${selectedContact.phone}`}
                                                            className="mt-1 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
                                                        >
                                                            <Phone className="h-4 w-4 text-slate-500" />
                                                            {
                                                                selectedContact.phone
                                                            }
                                                        </a>
                                                    ) : (
                                                        <p className="mt-1 text-sm text-slate-600">
                                                            Not provided
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-600">
                                                        Email
                                                    </p>

                                                    {selectedContact.email ? (
                                                        <a
                                                            href={`mailto:${selectedContact.email}`}
                                                            className="mt-1 flex items-center gap-2 break-all text-sm text-slate-300 hover:text-white"
                                                        >
                                                            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                                                            {
                                                                selectedContact.email
                                                            }
                                                        </a>
                                                    ) : (
                                                        <p className="mt-1 text-sm text-slate-600">
                                                            Not provided
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-600">
                                                        Address
                                                    </p>

                                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                                        {
                                                            selectedContact.address ||
                                                            "Not provided"
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Transactions */}
                                        <div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Recent transactions
                                                </p>

                                                <span className="text-xs text-slate-600">
                                                    {
                                                        selectedContactStats?.transactionCount ||
                                                        0
                                                    }{" "}
                                                    total
                                                </span>
                                            </div>

                                            {selectedContactTransactions.length ===
                                            0 ? (
                                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-center">
                                                    <p className="text-sm text-slate-500">
                                                        No transactions are
                                                        linked to this
                                                        contact yet.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="overflow-hidden rounded-xl border border-slate-800">
                                                    {selectedContactTransactions.map(
                                                        (
                                                            transaction,
                                                            index
                                                        ) => {
                                                            const income =
                                                                isIncomeTransaction(
                                                                    transaction,
                                                                    categories
                                                                );

                                                            return (
                                                                <div
                                                                    key={
                                                                        transaction._id ||
                                                                        `${transaction.transactionDate}-${index}`
                                                                    }
                                                                    className={`flex items-center justify-between gap-4 bg-slate-900/50 px-4 py-3 ${
                                                                        index <
                                                                        selectedContactTransactions.length -
                                                                            1
                                                                            ? "border-b border-slate-800"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-medium text-slate-300">
                                                                            {
                                                                                transaction.description ||
                                                                                "Transaction"
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-slate-600">
                                                                            {formatDate(
                                                                                transaction.transactionDate
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <p
                                                                        className={`shrink-0 text-sm font-semibold ${
                                                                            income
                                                                                ? "text-emerald-400"
                                                                                : "text-red-400"
                                                                        }`}
                                                                    >
                                                                        {income
                                                                            ? "+"
                                                                            : "-"}
                                                                        {formatCurrency(
                                                                            transaction.amount
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
                                <Button
                                    variant="secondary"
                                    onClick={closeModal}
                                >
                                    Close
                                </Button>

                                <Button
                                    onClick={() =>
                                        openEditModal(
                                            selectedContact
                                        )
                                    }
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Contact
                                </Button>
                            </div>
                        </aside>
                    </div>
                )}
        </div>
    );
};

export default Contacts;