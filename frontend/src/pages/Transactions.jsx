import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownRight,
    ArrowUpRight,
    Eye,
    Plus,
    Search,
    Trash2,
    Upload,
} from "lucide-react";

import transactionService from "../services/transactionService";
import categoryService from "../services/categoryService";
import contactService from "../services/contactService";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank", label: "Bank Transfer" },
    { value: "card", label: "Card" },
    { value: "other", label: "Other" },
];

const SORT_OPTIONS = [
    {
        value: "transactionDate",
        label: "Transaction Date",
    },
    {
        value: "amount",
        label: "Amount",
    },
];

const ORDER_OPTIONS = [
    {
        value: "desc",
        label: "Descending",
    },
    {
        value: "asc",
        label: "Ascending",
    },
];

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [contactId, setContactId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Sorting
    const [sortBy, setSortBy] = useState("transactionDate");
    const [order, setOrder] = useState("desc");

    const [page, setPage] = useState(1);

    // Filter data
    const [categories, setCategories] = useState([]);
    const [contacts, setContacts] = useState([]);

    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [contactsLoading, setContactsLoading] = useState(false);

    // Add transaction modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // View transaction modal
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [viewError, setViewError] = useState("");

    // Edit transaction modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        amount: "",
        categoryId: "",
        paymentMethod: "",
        transactionDate: "",
        description: "",
    });
    const [editError, setEditError] = useState("");
    const [editing, setEditing] = useState(false);

    // Delete transaction modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] =
        useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // CSV import modal
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState("");
    const [importSuccess, setImportSuccess] = useState("");

    const [formData, setFormData] = useState({
        amount: "",
        categoryId: "",
        paymentMethod: "",
        transactionDate: new Date()
            .toISOString()
            .split("T")[0],
        description: "",
    });

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await transactionService.getTransactions({
                page,
                limit: 10,

                categoryId: categoryId || undefined,
                contactId: contactId || undefined,
                paymentMethod: paymentMethod || undefined,

                startDate: startDate || undefined,
                endDate: endDate || undefined,

                sortBy,
                order,
            });

            setTransactions(data.transactions || []);
            setPagination(data.pagination || null);
        } catch (error) {
            console.error(
                "Failed to fetch transactions:",
                error
            );

            setError(
                "Unable to load transactions. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);

            const data = await categoryService.getCategories();

            setCategories(data.categories || data || []);
        } catch (error) {
            console.error(
                "Failed to fetch categories:",
                error
            );
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchContacts = async () => {
        try {
            setContactsLoading(true);

            const data = await contactService.getContacts();

            setContacts(data.contacts || data || []);
        } catch (error) {
            console.error(
                "Failed to fetch contacts:",
                error
            );
        } finally {
            setContactsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [
        page,
        categoryId,
        contactId,
        paymentMethod,
        startDate,
        endDate,
        sortBy,
        order,
    ]);

    useEffect(() => {
        fetchCategories();
        fetchContacts();
    }, []);

    const getCategory = (transaction) => {
        if (!transaction.categoryId) {
            return null;
        }

        if (typeof transaction.categoryId === "object") {
            return transaction.categoryId;
        }

        return categories.find(
            (category) =>
                category._id === transaction.categoryId
        );
    };

    const getContact = (transaction) => {
        if (!transaction.contactId) {
            return null;
        }

        if (typeof transaction.contactId === "object") {
            return transaction.contactId;
        }

        return contacts.find(
            (contact) =>
                contact._id === transaction.contactId
        );
    };

    const filteredTransactions = useMemo(() => {
        if (!search.trim()) {
            return transactions;
        }

        const searchTerm = search.toLowerCase();

        return transactions.filter((transaction) => {
            const description =
                transaction.description?.toLowerCase() || "";

            const payment =
                transaction.paymentMethod?.toLowerCase() || "";

            const category =
                getCategory(transaction)?.name?.toLowerCase() || "";

            const contact = getContact(transaction);

            const contactName =
                contact?.name?.toLowerCase() || "";

            return (
                description.includes(searchTerm) ||
                payment.includes(searchTerm) ||
                category.includes(searchTerm) ||
                contactName.includes(searchTerm)
            );
        });
    }, [
        transactions,
        search,
        categories,
        contacts,
    ]);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatAmount = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    const handleCategoryChange = (event) => {
        setCategoryId(event.target.value);
        setPage(1);
    };

    const handleContactChange = (event) => {
        setContactId(event.target.value);
        setPage(1);
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
        setPage(1);
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
        setPage(1);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
        setPage(1);
    };

    const handleSortByChange = (event) => {
        setSortBy(event.target.value);
        setPage(1);
    };

    const handleOrderChange = (event) => {
        setOrder(event.target.value);
        setPage(1);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            amount: "",
            categoryId: "",
            paymentMethod: "",
            transactionDate: new Date()
                .toISOString()
                .split("T")[0],
            description: "",
        });

        setFormError("");
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        if (submitting) return;

        setShowAddModal(false);
        resetForm();
    };

    const handleAddTransaction = async (event) => {
        event.preventDefault();

        setFormError("");

        if (!formData.amount || Number(formData.amount) <= 0) {
            setFormError("Please enter a valid amount.");
            return;
        }

        if (!formData.categoryId) {
            setFormError("Please select a category.");
            return;
        }

        if (!formData.paymentMethod) {
            setFormError("Please select a payment method.");
            return;
        }

        if (!formData.transactionDate) {
            setFormError("Please select a transaction date.");
            return;
        }

        try {
            setSubmitting(true);

            await transactionService.createTransaction({
                amount: Number(formData.amount),
                categoryId: formData.categoryId,
                paymentMethod: formData.paymentMethod,
                transactionDate: formData.transactionDate,
                description: formData.description.trim(),
            });

            setShowAddModal(false);
            resetForm();

            await fetchTransactions();
        } catch (error) {
            console.error(
                "Failed to create transaction:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to add transaction. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewTransaction = async (id) => {
        try {
            setViewLoading(true);
            setViewError("");
            setSelectedTransaction(null);
            setShowViewModal(true);

            const data =
                await transactionService.getTransactionById(id);

            setSelectedTransaction(
                data.transaction || data
            );
        } catch (error) {
            console.error(
                "Failed to fetch transaction:",
                error
            );

            setViewError(
                error.response?.data?.message ||
                    "Unable to load transaction details."
            );
        } finally {
            setViewLoading(false);
        }
    };

    const handleCloseViewModal = () => {
        if (viewLoading) return;

        setShowViewModal(false);
        setSelectedTransaction(null);
        setViewError("");
    };

    const handleOpenEditModal = () => {
        if (!selectedTransaction) return;

        setEditFormData({
            amount: selectedTransaction.amount || "",
            categoryId:
                typeof selectedTransaction.categoryId === "object"
                    ? selectedTransaction.categoryId?._id || ""
                    : selectedTransaction.categoryId || "",
            paymentMethod:
                selectedTransaction.paymentMethod || "",
            transactionDate: selectedTransaction.transactionDate
                ? new Date(selectedTransaction.transactionDate)
                      .toISOString()
                      .split("T")[0]
                : "",
            description:
                selectedTransaction.description || "",
        });

        setEditError("");
        setShowViewModal(false);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        if (editing) return;

        setShowEditModal(false);
        setEditError("");
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;

        setEditFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleUpdateTransaction = async (event) => {
        event.preventDefault();

        setEditError("");

        if (
            !editFormData.amount ||
            Number(editFormData.amount) <= 0
        ) {
            setEditError("Please enter a valid amount.");
            return;
        }

        if (!editFormData.categoryId) {
            setEditError("Please select a category.");
            return;
        }

        if (!editFormData.paymentMethod) {
            setEditError("Please select a payment method.");
            return;
        }

        if (!editFormData.transactionDate) {
            setEditError("Please select a transaction date.");
            return;
        }

        try {
            setEditing(true);

            await transactionService.updateTransaction(
                selectedTransaction._id,
                {
                    amount: Number(editFormData.amount),
                    categoryId: editFormData.categoryId,
                    paymentMethod: editFormData.paymentMethod,
                    transactionDate:
                        editFormData.transactionDate,
                    description:
                        editFormData.description.trim(),
                }
            );

            setShowEditModal(false);
            setSelectedTransaction(null);

            await fetchTransactions();
        } catch (error) {
            console.error(
                "Failed to update transaction:",
                error
            );

            setEditError(
                error.response?.data?.message ||
                    "Unable to update transaction. Please try again."
            );
        } finally {
            setEditing(false);
        }
    };

    const handleOpenDeleteModal = (transaction) => {
        setTransactionToDelete(transaction);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        if (deleting) return;

        setShowDeleteModal(false);
        setTransactionToDelete(null);
        setDeleteError("");
    };

    const handleDeleteTransaction = async () => {
        if (!transactionToDelete) return;

        try {
            setDeleting(true);
            setDeleteError("");

            await transactionService.deleteTransaction(
                transactionToDelete._id
            );

            setShowDeleteModal(false);
            setTransactionToDelete(null);

            if (
                transactions.length === 1 &&
                page > 1
            ) {
                setPage((current) => current - 1);
            } else {
                await fetchTransactions();
            }
        } catch (error) {
            console.error(
                "Failed to delete transaction:",
                error
            );

            setDeleteError(
                error.response?.data?.message ||
                    "Unable to delete transaction. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleOpenImportModal = () => {
        setSelectedFile(null);
        setImportError("");
        setImportSuccess("");
        setShowImportModal(true);
    };

    const handleCloseImportModal = () => {
        if (importing) return;

        setShowImportModal(false);
        setSelectedFile(null);
        setImportError("");
        setImportSuccess("");
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        setImportError("");
        setImportSuccess("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setSelectedFile(null);
            setImportError("Please select a CSV file.");
            return;
        }

        setSelectedFile(file);
    };

    const handleImportCSV = async () => {
        if (!selectedFile) {
            setImportError("Please select a CSV file.");
            return;
        }

        try {
            setImporting(true);
            setImportError("");
            setImportSuccess("");

            await transactionService.importTransactions(
                selectedFile
            );

            setImportSuccess(
                "Transactions imported successfully."
            );

            setSelectedFile(null);

            await fetchTransactions();
        } catch (error) {
            console.error(
                "Failed to import transactions:",
                error
            );

            setImportError(
                error.response?.data?.message ||
                    "Unable to import transactions. Please check your CSV file and try again."
            );
        } finally {
            setImporting(false);
        }
    };

    const totalTransactions =
        pagination?.totalTransactions ??
        pagination?.total ??
        transactions.length;

    const currentPage =
        pagination?.currentPage ??
        pagination?.page ??
        page;

    const totalPages =
        pagination?.totalPages ??
        pagination?.pages ??
        1;

    const averageAmount =
        transactions.length > 0
            ? transactions.reduce(
                  (sum, transaction) =>
                      sum + Number(transaction.amount || 0),
                  0
              ) / transactions.length
            : 0;

    const paymentMethodsUsed = new Set(
        transactions.map(
            (transaction) => transaction.paymentMethod
        )
    ).size;

    const hasActiveFilters =
        search ||
        categoryId ||
        contactId ||
        paymentMethod ||
        startDate ||
        endDate;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-indigo-400">
                        Workspace
                    </p>

                    <h1 className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        Transactions
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Manage and track your business transactions.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleOpenImportModal}
                    >
                        <Upload size={17} className="mr-2" />
                        Import CSV
                    </Button>

                    <Button onClick={handleOpenAddModal}>
                        <Plus size={17} className="mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <p className="text-sm text-slate-400">
                        All Transactions
                    </p>

                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        {totalTransactions}
                    </p>
                </Card>

                <Card>
                    <p className="text-sm text-slate-400">
                        Current Page
                    </p>

                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        {transactions.length}
                    </p>
                </Card>

                <Card>
                    <p className="text-sm text-slate-400">
                        Payment Methods
                    </p>

                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        {paymentMethodsUsed}
                    </p>
                </Card>

                <Card>
                    <p className="text-sm text-slate-400">
                        Average Amount
                    </p>

                    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        {formatAmount(averageAmount)}
                    </p>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <Input
                            name="transaction-search"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search transactions..."
                            className="pl-10"
                        />
                    </div>

                    {/* Category */}
                    <Select
                        name="category-filter"
                        value={categoryId}
                        onChange={handleCategoryChange}
                        options={categories.map(
                            (category) => ({
                                value: category._id,
                                label: category.name,
                            })
                        )}
                        placeholder={
                            categoriesLoading
                                ? "Loading categories..."
                                : "All categories"
                        }
                        disabled={categoriesLoading}
                    />

                    {/* Contact */}
                    <Select
                        name="contact-filter"
                        value={contactId}
                        onChange={handleContactChange}
                        options={contacts.map(
                            (contact) => ({
                                value: contact._id,
                                label: contact.name,
                            })
                        )}
                        placeholder={
                            contactsLoading
                                ? "Loading contacts..."
                                : "All contacts"
                        }
                        disabled={contactsLoading}
                    />

                    {/* Payment Method */}
                    <Select
                        name="payment-method"
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        options={PAYMENT_METHODS}
                        placeholder="All payment methods"
                    />

                    {/* Start Date */}
                    <Input
                        label="Start Date"
                        name="start-date"
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />

                    {/* End Date */}
                    <Input
                        label="End Date"
                        name="end-date"
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                    />

                    {/* Sort By */}
                    <Select
                        label="Sort By"
                        name="sort-by"
                        value={sortBy}
                        onChange={handleSortByChange}
                        options={SORT_OPTIONS}
                    />

                    {/* Order */}
                    <Select
                        label="Order"
                        name="order"
                        value={order}
                        onChange={handleOrderChange}
                        options={ORDER_OPTIONS}
                    />
                </div>
            </Card>

            {/* Error */}
            {error && (
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-red-400">
                            {error}
                        </p>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4"
                            onClick={fetchTransactions}
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {/* Loading / Empty / Table */}
            {loading ? (
                <Card>
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                </Card>
            ) : filteredTransactions.length === 0 ? (
                <Card>
                    <EmptyState
                        title={
                            hasActiveFilters
                                ? "No matching transactions"
                                : "No transactions yet"
                        }
                        description={
                            hasActiveFilters
                                ? "Try changing your search or filters."
                                : "Add your first transaction to start tracking your business finances."
                        }
                    />
                </Card>
            ) : (
                <>
                    {/* Transaction Table */}
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
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
                                            Payment
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Amount
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTransactions.map(
                                        (transaction) => {
                                            const category =
                                                getCategory(
                                                    transaction
                                                );

                                            const type =
                                                category?.type ||
                                                "expense";

                                            const isIncome =
                                                type === "income";

                                            return (
                                                <tr
                                                    key={
                                                        transaction._id
                                                    }
                                                    className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
                                                >
                                                    <td className="px-4 py-4 text-sm text-slate-400">
                                                        {formatDate(
                                                            transaction.transactionDate
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                                    isIncome
                                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                                        : "bg-red-500/10 text-red-400"
                                                                }`}
                                                            >
                                                                {isIncome ? (
                                                                    <ArrowUpRight
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ArrowDownRight
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <p className="font-medium text-white">
                                                                    {transaction.description ||
                                                                        "No description"}
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-slate-500">
                                                                    {isIncome
                                                                        ? "Income"
                                                                        : "Expense"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            variant={
                                                                isIncome
                                                                    ? "success"
                                                                    : "danger"
                                                            }
                                                        >
                                                            {category?.name ||
                                                                "Uncategorized"}
                                                        </Badge>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm capitalize text-slate-400">
                                                        {transaction.paymentMethod ||
                                                            "-"}
                                                    </td>

                                                    <td
                                                        className={`px-4 py-4 text-right font-medium ${
                                                            isIncome
                                                                ? "text-emerald-400"
                                                                : "text-red-400"
                                                        }`}
                                                    >
                                                        {isIncome
                                                            ? "+"
                                                            : "-"}
                                                        {formatAmount(
                                                            transaction.amount
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleViewTransaction(
                                                                        transaction._id
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                                                title="View transaction"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenDeleteModal(
                                                                        transaction
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                                                                title="Delete transaction"
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

                    {/* Pagination */}
                    {pagination && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Page {currentPage} of{" "}
                                {totalPages}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={
                                        currentPage <= 1
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                current - 1
                                        )
                                    }
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={
                                        currentPage >=
                                        totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                current + 1
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add Transaction Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={handleCloseAddModal}
                title="Add Transaction"
            >
                <form
                    onSubmit={handleAddTransaction}
                    className="space-y-4"
                >
                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleFormChange}
                        placeholder="Enter amount"
                        required
                    />

                    <Select
                        label="Category"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleFormChange}
                        placeholder={
                            categoriesLoading
                                ? "Loading categories..."
                                : "Select category"
                        }
                        options={categories.map(
                            (category) => ({
                                value: category._id,
                                label: category.name,
                            })
                        )}
                        disabled={categoriesLoading}
                        required
                    />

                    <Select
                        label="Payment Method"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleFormChange}
                        placeholder="Select payment method"
                        options={PAYMENT_METHODS}
                        required
                    />

                    <Input
                        label="Transaction Date"
                        name="transactionDate"
                        type="date"
                        value={formData.transactionDate}
                        onChange={handleFormChange}
                        required
                    />

                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Enter description"
                    />

                    {formError && (
                        <p className="text-sm text-red-400">
                            {formError}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCloseAddModal}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Adding..."
                                : "Add Transaction"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* View Transaction Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={handleCloseViewModal}
                title="Transaction Details"
            >
                {viewLoading ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner />
                    </div>
                ) : viewError ? (
                    <div className="py-6 text-center">
                        <p className="text-sm text-red-400">
                            {viewError}
                        </p>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4"
                            onClick={handleCloseViewModal}
                        >
                            Close
                        </Button>
                    </div>
                ) : selectedTransaction ? (
                    <div className="space-y-5">
                        {(() => {
                            const category =
                                getCategory(
                                    selectedTransaction
                                );

                            const contact =
                                getContact(
                                    selectedTransaction
                                );

                            const isIncome =
                                category?.type === "income";

                            return (
                                <>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Description
                                        </p>

                                        <p className="mt-1 text-lg font-semibold text-white">
                                            {selectedTransaction.description ||
                                                "No description"}
                                        </p>
                                    </div>

                                    <div
                                        className={`rounded-xl border p-4 ${
                                            isIncome
                                                ? "border-emerald-500/20 bg-emerald-500/5"
                                                : "border-red-500/20 bg-red-500/5"
                                        }`}
                                    >
                                        <p className="text-sm text-slate-400">
                                            Amount
                                        </p>

                                        <p
                                            className={`mt-1 font-['Space_Grotesk'] text-2xl font-semibold ${
                                                isIncome
                                                    ? "text-emerald-400"
                                                    : "text-red-400"
                                            }`}
                                        >
                                            {isIncome
                                                ? "+"
                                                : "-"}
                                            {formatAmount(
                                                selectedTransaction.amount
                                            )}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                                Type
                                            </p>

                                            <p className="mt-1 text-sm capitalize text-slate-200">
                                                {isIncome
                                                    ? "Income"
                                                    : "Expense"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                                Category
                                            </p>

                                            <p className="mt-1 text-sm text-slate-200">
                                                {category?.name ||
                                                    "Uncategorized"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                                Payment Method
                                            </p>

                                            <p className="mt-1 text-sm capitalize text-slate-200">
                                                {selectedTransaction.paymentMethod ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                                Date
                                            </p>

                                            <p className="mt-1 text-sm text-slate-200">
                                                {formatDate(
                                                    selectedTransaction.transactionDate
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                                Contact
                                            </p>

                                            <p className="mt-1 text-sm text-slate-200">
                                                {contact?.name ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                                        <Button
                                            variant="secondary"
                                            onClick={
                                                handleCloseViewModal
                                            }
                                        >
                                            Close
                                        </Button>

                                        <Button
                                            onClick={
                                                handleOpenEditModal
                                            }
                                        >
                                            Edit Transaction
                                        </Button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                ) : null}
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={handleCloseEditModal}
                title="Edit Transaction"
            >
                <form
                    onSubmit={handleUpdateTransaction}
                    className="space-y-4"
                >
                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        value={editFormData.amount}
                        onChange={handleEditFormChange}
                        placeholder="Enter amount"
                        required
                    />

                    <Select
                        label="Category"
                        name="categoryId"
                        value={editFormData.categoryId}
                        onChange={handleEditFormChange}
                        placeholder={
                            categoriesLoading
                                ? "Loading categories..."
                                : "Select category"
                        }
                        options={categories.map(
                            (category) => ({
                                value: category._id,
                                label: category.name,
                            })
                        )}
                        disabled={categoriesLoading}
                        required
                    />

                    <Select
                        label="Payment Method"
                        name="paymentMethod"
                        value={editFormData.paymentMethod}
                        onChange={handleEditFormChange}
                        placeholder="Select payment method"
                        options={PAYMENT_METHODS}
                        required
                    />

                    <Input
                        label="Transaction Date"
                        name="transactionDate"
                        type="date"
                        value={editFormData.transactionDate}
                        onChange={handleEditFormChange}
                        required
                    />

                    <Input
                        label="Description"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        placeholder="Enter description"
                    />

                    {editError && (
                        <p className="text-sm text-red-400">
                            {editError}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCloseEditModal}
                            disabled={editing}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={editing}
                        >
                            {editing
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Transaction Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                title="Delete Transaction"
            >
                <div className="space-y-5">
                    <div>
                        <p className="text-sm text-slate-300">
                            Are you sure you want to delete this
                            transaction?
                        </p>

                        {transactionToDelete && (
                            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                                <p className="font-medium text-white">
                                    {transactionToDelete.description ||
                                        "No description"}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    {formatAmount(
                                        transactionToDelete.amount
                                    )}{" "}
                                    ·{" "}
                                    {formatDate(
                                        transactionToDelete.transactionDate
                                    )}
                                </p>
                            </div>
                        )}

                        <p className="mt-3 text-xs text-slate-500">
                            This action cannot be undone.
                        </p>
                    </div>

                    {deleteError && (
                        <p className="text-sm text-red-400">
                            {deleteError}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                        <Button
                            variant="secondary"
                            onClick={handleCloseDeleteModal}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="danger"
                            onClick={handleDeleteTransaction}
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Transaction"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Import CSV Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={handleCloseImportModal}
                title="Import Transactions"
            >
                <div className="space-y-5">
                    <div>
                        <p className="text-sm text-slate-300">
                            Upload a CSV file to import multiple
                            transactions at once.
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                            Required columns: date, type, amount,
                            category, description. Contact is optional.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="csv-file"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            CSV File
                        </label>

                        <input
                            id="csv-file"
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handleFileChange}
                            disabled={importing}
                            className="block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {selectedFile && (
                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                            <p className="text-sm font-medium text-white">
                                {selectedFile.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    )}

                    {importError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <p className="text-sm text-red-400">
                                {importError}
                            </p>
                        </div>
                    )}

                    {importSuccess && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <p className="text-sm text-emerald-400">
                                {importSuccess}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                        <Button
                            variant="secondary"
                            onClick={handleCloseImportModal}
                            disabled={importing}
                        >
                            Close
                        </Button>

                        <Button
                            onClick={handleImportCSV}
                            disabled={!selectedFile || importing}
                        >
                            {importing
                                ? "Importing..."
                                : "Import CSV"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Transactions;

