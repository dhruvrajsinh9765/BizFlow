import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import transactionService from "../services/transactionService";
import categoryService from "../services/categoryService";
import contactService from "../services/contactService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionTable from "../components/transactions/TransactionTable";
import AddTransactionModal from "../components/transactions/AddTransactionModal";
import QuickContactModal from "../components/transactions/QuickContactModal";
import ViewTransactionModal from "../components/transactions/ViewTransactionModal";
import EditTransactionModal from "../components/transactions/EditTransactionModal";
import DeleteTransactionModal from "../components/transactions/DeleteTransactionModal";
import ImportTransactionsModal from "../components/transactions/ImportTransactionsModal";
const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank", label: "Bank Transfer" },
    { value: "card", label: "Card" },
    { value: "other", label: "Other" },
];
const SORT_PRESET_OPTIONS = [
    { value: "transactionDate_desc", label: "Newest first" },
    { value: "transactionDate_asc", label: "Oldest first" },
    { value: "amount_desc", label: "Highest amount" },
    { value: "amount_asc", label: "Lowest amount" },
];
const PAGE_SIZE_OPTIONS = [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
];
const TYPE_FILTER_OPTIONS = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
];
const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const initialQuickContactForm = {
    name: "",
    contactType: "",
    phone: "",
    email: "",
};
// Main Transactions page
// The page owns data fetching, business actions, filters, analytics, and modal state.
// UI-heavy sections are extracted into TransactionFilters and TransactionTable.
const Transactions = () => {
  // ------------------------------------------------------------
  // Core transaction data and server-side filters
  // ------------------------------------------------------------
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [contactId, setContactId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
    const [unlinkedOnly, setUnlinkedOnly] = useState(false);
    const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState("transactionDate");
    const [order, setOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [categories, setCategories] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [contactsLoading, setContactsLoading] = useState(false);
  // ------------------------------------------------------------
  // Modal and form state
  // ------------------------------------------------------------
  const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        categoryId: "",
        contactId: "",
        paymentMethod: "",
        transactionDate: "",
        description: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitError, setFormSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showQuickContactModal, setShowQuickContactModal] = useState(false);
    const [quickContactForm, setQuickContactForm] = useState(initialQuickContactForm);
    const [quickContactErrors, setQuickContactErrors] = useState({});
    const [quickContactSubmitError, setQuickContactSubmitError] = useState("");
    const [creatingQuickContact, setCreatingQuickContact] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [viewError, setViewError] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        amount: "",
        categoryId: "",
        contactId: "",
        paymentMethod: "",
        transactionDate: "",
        description: "",
    });
    const [editFormErrors, setEditFormErrors] = useState({});
    const [editSubmitError, setEditSubmitError] = useState("");
    const [editing, setEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState("");
    const [importSuccess, setImportSuccess] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
  // ------------------------------------------------------------
  // Data fetching
  // ------------------------------------------------------------
  const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await transactionService.getTransactions({
                page,
                limit: pageSize,
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
        }
        catch (error) {
            console.error("Failed to fetch transactions:", error);
            setError("Unable to load transactions. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const data = await categoryService.getCategories();
            setCategories(data.categories || data || []);
        }
        catch (error) {
            console.error("Failed to fetch categories:", error);
        }
        finally {
            setCategoriesLoading(false);
        }
    };
    const fetchContacts = async () => {
        try {
            setContactsLoading(true);
            const data = await contactService.getContacts();
            setContacts(data.contacts || data || []);
        }
        catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
        finally {
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
        pageSize,
    ]);
    useEffect(() => {
        fetchCategories();
        fetchContacts();
    }, []);
    useEffect(() => {
        if (!actionSuccess)
            return undefined;
        const timer = setTimeout(() => setActionSuccess(""), 3500);
        return () => clearTimeout(timer);
    }, [actionSuccess]);
  // ------------------------------------------------------------
  // Display helpers and filter handlers
  // ------------------------------------------------------------
  const getCategory = (transaction) => {
        if (!transaction?.categoryId)
            return null;
        if (typeof transaction.categoryId === "object") {
            return transaction.categoryId;
        }
        return categories.find((category) => category._id === transaction.categoryId);
    };
    const getContact = (transaction) => {
        if (!transaction?.contactId)
            return null;
        if (typeof transaction.contactId === "object") {
            return transaction.contactId;
        }
        return contacts.find((contact) => contact._id === transaction.contactId);
    };
    const formatDate = (date) => {
        if (!date)
            return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };
    const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    const getTransactionType = (transaction) => getCategory(transaction)?.type === "income"
        ? "income"
        : "expense";
    const handleCategoryChange = (event) => {
        setCategoryId(event.target.value);
        setPage(1);
    };
    const handleContactFilterChange = (event) => {
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
    const handleSortPresetChange = (event) => {
        const [nextSortBy, nextOrder] = event.target.value.split("_");
        setSortBy(nextSortBy);
        setOrder(nextOrder);
        setPage(1);
    };
    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setPage(1);
    };
    const handleTypeFilterChange = (value) => {
        setTransactionTypeFilter((current) => current === value ? "" : value);
        setPage(1);
    };
    const handleUnlinkedFilterChange = () => {
        setUnlinkedOnly((current) => !current);
        setPage(1);
    };
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };
  // ------------------------------------------------------------
  // Transaction form helpers
  // ------------------------------------------------------------
  const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
        setFormErrors((current) => ({
            ...current,
            [name]: "",
        }));
        setFormSubmitError("");
    };
    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData((current) => ({
            ...current,
            [name]: value,
        }));
        setEditFormErrors((current) => ({
            ...current,
            [name]: "",
        }));
        setEditSubmitError("");
    };
    const resetForm = () => {
        setFormData({
            amount: "",
            categoryId: "",
            contactId: "",
            paymentMethod: "",
            transactionDate: getToday(),
            description: "",
        });
        setFormErrors({});
        setFormSubmitError("");
    };
    const validateTransactionForm = (data) => {
        const errors = {};
        if (!data.amount || Number(data.amount) <= 0) {
            errors.amount =
                "Please enter a valid amount.";
        }
        if (!data.categoryId) {
            errors.categoryId =
                "Please select a category.";
        }
        if (!data.paymentMethod) {
            errors.paymentMethod =
                "Please select a payment method.";
        }
        if (!data.transactionDate) {
            errors.transactionDate =
                "Please select a transaction date.";
        }
        if (!data.description.trim()) {
            errors.description =
                "Please enter a description.";
        }
        return errors;
    };
    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };
    const handleDuplicateTransaction = (transaction) => {
        const category = typeof transaction.categoryId === "object"
            ? transaction.categoryId?._id || ""
            : transaction.categoryId || "";
        const contact = typeof transaction.contactId === "object"
            ? transaction.contactId?._id || ""
            : transaction.contactId || "";
        setFormData({
            amount: transaction.amount || "",
            categoryId: category,
            contactId: contact,
            paymentMethod: transaction.paymentMethod || "",
            transactionDate: getToday(),
            description: transaction.description || "",
        });
        setFormErrors({});
        setFormSubmitError("");
        setShowAddModal(true);
    };
    const handleCloseAddModal = () => {
        if (submitting ||
            creatingQuickContact) {
            return;
        }
        setShowAddModal(false);
        resetForm();
    };
    const handleAddTransaction = async (event) => {
        event.preventDefault();
        setFormSubmitError("");
        const errors = validateTransactionForm(formData);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                amount: Number(formData.amount),
                categoryId: formData.categoryId,
                paymentMethod: formData.paymentMethod,
                transactionDate: formData.transactionDate,
                description: formData.description.trim(),
            };
            if (formData.contactId) {
                payload.contactId =
                    formData.contactId;
            }
            await transactionService.createTransaction(payload);
            setShowAddModal(false);
            resetForm();
            setActionSuccess("Transaction created successfully.");
            await fetchTransactions();
        }
        catch (error) {
            console.error("Failed to create transaction:", error);
            setFormSubmitError(error.response?.data?.message ||
                "Unable to add transaction. Please try again.");
        }
        finally {
            setSubmitting(false);
        }
    };
  // ------------------------------------------------------------
  // Quick contact creation
  // ------------------------------------------------------------
  const handleOpenQuickContactModal = () => {
        setQuickContactForm(initialQuickContactForm);
        setQuickContactErrors({});
        setQuickContactSubmitError("");
        setShowQuickContactModal(true);
    };
    const handleCloseQuickContactModal = () => {
        if (creatingQuickContact)
            return;
        setShowQuickContactModal(false);
        setQuickContactForm(initialQuickContactForm);
        setQuickContactErrors({});
        setQuickContactSubmitError("");
    };
    const handleQuickContactChange = (event) => {
        const { name, value } = event.target;
        setQuickContactForm((current) => ({
            ...current,
            [name]: value,
        }));
        setQuickContactErrors((current) => ({
            ...current,
            [name]: "",
        }));
        setQuickContactSubmitError("");
    };
    const validateQuickContact = () => {
        const errors = {};
        if (!quickContactForm.name.trim()) {
            errors.name =
                "Contact name is required.";
        }
        if (!quickContactForm.contactType) {
            errors.contactType =
                "Contact type is required.";
        }
        if (quickContactForm.phone &&
            !/^[0-9]{10}$/.test(quickContactForm.phone)) {
            errors.phone =
                "Phone number must contain exactly 10 digits.";
        }
        if (quickContactForm.email &&
            !/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(quickContactForm.email)) {
            errors.email =
                "Please provide a valid email address.";
        }
        return errors;
    };
    const handleQuickContactSubmit = async (event) => {
        event.preventDefault();
        const errors = validateQuickContact();
        setQuickContactErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }
        try {
            setCreatingQuickContact(true);
            setQuickContactSubmitError("");
            const payload = {
                name: quickContactForm.name.trim(),
                contactType: quickContactForm.contactType,
            };
            if (quickContactForm.phone.trim()) {
                payload.phone =
                    quickContactForm.phone.trim();
            }
            if (quickContactForm.email.trim()) {
                payload.email =
                    quickContactForm.email.trim();
            }
            const data = await contactService.createContact(payload);
            const createdContact = data.contact || data;
            if (!createdContact?._id) {
                throw new Error("Created contact was not returned by the API.");
            }
            setContacts((current) => [
                ...current,
                createdContact,
            ]);
            setFormData((current) => ({
                ...current,
                contactId: createdContact._id,
            }));
            setShowQuickContactModal(false);
            setQuickContactForm(initialQuickContactForm);
            setQuickContactErrors({});
            setQuickContactSubmitError("");
        }
        catch (error) {
            console.error("Failed to create contact:", error);
            setQuickContactSubmitError(error.response?.data?.message ||
                error.message ||
                "Unable to create contact. Please try again.");
        }
        finally {
            setCreatingQuickContact(false);
        }
    };
  // ------------------------------------------------------------
  // View / edit / delete actions
  // ------------------------------------------------------------
  const handleViewTransaction = async (id) => {
        try {
            setViewLoading(true);
            setViewError("");
            setSelectedTransaction(null);
            setShowViewModal(true);
            const data = await transactionService.getTransactionById(id);
            setSelectedTransaction(data.transaction || data);
        }
        catch (error) {
            console.error("Failed to fetch transaction:", error);
            setViewError(error.response?.data?.message ||
                "Unable to load transaction details.");
        }
        finally {
            setViewLoading(false);
        }
    };
    const handleCloseViewModal = () => {
        if (viewLoading)
            return;
        setShowViewModal(false);
        setSelectedTransaction(null);
        setViewError("");
    };
    const handleOpenEditModal = () => {
        if (!selectedTransaction)
            return;
        const selectedCategory = typeof selectedTransaction.categoryId ===
            "object"
            ? selectedTransaction.categoryId?._id ||
                ""
            : selectedTransaction.categoryId || "";
        const selectedContact = typeof selectedTransaction.contactId ===
            "object"
            ? selectedTransaction.contactId?._id ||
                ""
            : selectedTransaction.contactId || "";
        setEditFormData({
            amount: selectedTransaction.amount || "",
            categoryId: selectedCategory,
            contactId: selectedContact,
            paymentMethod: selectedTransaction.paymentMethod || "",
            transactionDate: selectedTransaction.transactionDate
                ? new Date(selectedTransaction.transactionDate)
                    .toISOString()
                    .split("T")[0]
                : "",
            description: selectedTransaction.description || "",
        });
        setEditFormErrors({});
        setEditSubmitError("");
        setShowViewModal(false);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        if (editing)
            return;
        setShowEditModal(false);
        setEditFormErrors({});
        setEditSubmitError("");
    };
    const handleUpdateTransaction = async (event) => {
        event.preventDefault();
        setEditSubmitError("");
        const errors = validateTransactionForm(editFormData);
        setEditFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }
        try {
            setEditing(true);
            const payload = {
                amount: Number(editFormData.amount),
                categoryId: editFormData.categoryId,
                contactId: editFormData.contactId || null,
                paymentMethod: editFormData.paymentMethod,
                transactionDate: editFormData.transactionDate,
                description: editFormData.description.trim(),
            };
            await transactionService.updateTransaction(selectedTransaction._id, payload);
            setShowEditModal(false);
            setSelectedTransaction(null);
            setActionSuccess("Transaction updated successfully.");
            await fetchTransactions();
        }
        catch (error) {
            console.error("Failed to update transaction:", error);
            setEditSubmitError(error.response?.data?.message ||
                "Unable to update transaction. Please try again.");
        }
        finally {
            setEditing(false);
        }
    };
    const handleOpenDeleteModal = (transaction) => {
        setTransactionToDelete(transaction);
        setDeleteError("");
        setShowDeleteModal(true);
    };
    const handleCloseDeleteModal = () => {
        if (deleting)
            return;
        setShowDeleteModal(false);
        setTransactionToDelete(null);
        setDeleteError("");
    };
    const handleDeleteTransaction = async () => {
        if (!transactionToDelete)
            return;
        try {
            setDeleting(true);
            setDeleteError("");
            await transactionService.deleteTransaction(transactionToDelete._id);
            setShowDeleteModal(false);
            setTransactionToDelete(null);
            setActionSuccess("Transaction deleted successfully.");
            if (transactions.length === 1 &&
                page > 1) {
                setPage((current) => current - 1);
            }
            else {
                await fetchTransactions();
            }
        }
        catch (error) {
            console.error("Failed to delete transaction:", error);
            setDeleteError(error.response?.data?.message ||
                "Unable to delete transaction. Please try again.");
        }
        finally {
            setDeleting(false);
        }
    };
  // ------------------------------------------------------------
  // CSV import / export
  // ------------------------------------------------------------
  const handleOpenImportModal = () => {
        setSelectedFile(null);
        setImportError("");
        setImportSuccess("");
        setShowImportModal(true);
    };
    const handleCloseImportModal = () => {
        if (importing)
            return;
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
        if (!file.name
            .toLowerCase()
            .endsWith(".csv")) {
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
            await transactionService.importTransactions(selectedFile);
            setImportSuccess("Transactions imported successfully.");
            setActionSuccess("Transactions imported successfully.");
            setSelectedFile(null);
            await fetchTransactions();
        }
        catch (error) {
            console.error("Failed to import transactions:", error);
            setImportError(error.response?.data?.message ||
                "Unable to import transactions. Please check your CSV file and try again.");
        }
        finally {
            setImporting(false);
        }
    };
  // ------------------------------------------------------------
  // Date filters and CSV export
  // ------------------------------------------------------------
  const getDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    const applyDatePreset = (preset) => {
        const today = new Date();
        const todayString = getDateString(today);
        if (preset === "today") {
            setStartDate(todayString);
            setEndDate(todayString);
        }
        else if (preset === "week") {
            const start = new Date(today);
            const day = start.getDay();
            const diff = day === 0 ? 6 : day - 1;
            start.setDate(start.getDate() - diff);
            setStartDate(getDateString(start));
            setEndDate(todayString);
        }
        else if (preset === "month") {
            setStartDate(getDateString(new Date(today.getFullYear(), today.getMonth(), 1)));
            setEndDate(todayString);
        }
        else if (preset === "lastMonth") {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            setStartDate(getDateString(start));
            setEndDate(getDateString(end));
        }
        setPage(1);
    };
    const resetFilters = () => {
        setSearch("");
        setCategoryId("");
        setContactId("");
        setPaymentMethod("");
        setStartDate("");
        setEndDate("");
        setTransactionTypeFilter("");
        setUnlinkedOnly(false);
        setSortBy("transactionDate");
        setOrder("desc");
        setPage(1);
    };
    const exportVisibleTransactions = () => {
        if (filteredTransactions.length === 0) {
            return;
        }
        const escapeCsv = (value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
        };
        const rows = [
            [
                "Date",
                "Description",
                "Category",
                "Contact",
                "Type",
                "Payment Method",
                "Amount",
            ],
            ...filteredTransactions.map((transaction) => {
                const category = getCategory(transaction);
                const contact = getContact(transaction);
                const type = getTransactionType(transaction);
                return [
                    formatDate(transaction.transactionDate),
                    transaction.description ||
                        "",
                    category?.name ||
                        "Uncategorized",
                    contact?.name || "",
                    type === "income"
                        ? "Income"
                        : "Expense",
                    transaction.paymentMethod ||
                        "",
                    transaction.amount || 0,
                ];
            }),
        ];
        const csv = rows
            .map((row) => row
            .map(escapeCsv)
            .join(","))
            .join("\n");
        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
            `transactions-${getToday()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setActionSuccess("Visible transactions exported successfully.");
    };
  // ------------------------------------------------------------
  // Derived analytics
  // These values are calculated from the transactions currently loaded.
  // ------------------------------------------------------------
  const totalTransactions = pagination?.totalTransactions ??
        pagination?.total ??
        transactions.length;
    const currentPage = pagination?.currentPage ??
        pagination?.page ??
        page;
    const totalPages = pagination?.totalPages ??
        pagination?.pages ??
        1;
    const incomeTransactions = transactions.filter((transaction) => getTransactionType(transaction) === "income");
    const expenseTransactions = transactions.filter((transaction) => getTransactionType(transaction) === "expense");
    const incomeTotal = incomeTransactions.reduce((sum, transaction) => sum +
        Number(transaction.amount || 0), 0);
    const expenseTotal = expenseTransactions.reduce((sum, transaction) => sum +
        Number(transaction.amount || 0), 0);
    const netTotal = incomeTotal - expenseTotal;
    const averageAmount = transactions.length > 0
        ? transactions.reduce((sum, transaction) => sum +
            Number(transaction.amount || 0), 0) / transactions.length
        : 0;
    const filteredTransactions = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        return transactions.filter((transaction) => {
            const description = transaction.description?.toLowerCase() ||
                "";
            const payment = transaction.paymentMethod?.toLowerCase() ||
                "";
            const category = getCategory(transaction)?.name?.toLowerCase() ||
                "";
            const contactName = getContact(transaction)?.name?.toLowerCase() ||
                "";
            const type = getTransactionType(transaction);
            const matchesSearch = !searchTerm ||
                description.includes(searchTerm) ||
                payment.includes(searchTerm) ||
                category.includes(searchTerm) ||
                contactName.includes(searchTerm);
            const matchesType = !transactionTypeFilter ||
                type ===
                    transactionTypeFilter;
            const matchesUnlinked = !unlinkedOnly ||
                !transaction.contactId;
            return (matchesSearch &&
                matchesType &&
                matchesUnlinked);
        });
    }, [
        transactions,
        search,
        categories,
        contacts,
        transactionTypeFilter,
        unlinkedOnly,
    ]);
    const activityData = useMemo(() => {
        const grouped = {};
        filteredTransactions.forEach((transaction) => {
            if (!transaction.transactionDate) {
                return;
            }
            const key = getDateString(new Date(transaction.transactionDate));
            grouped[key] =
                (grouped[key] || 0) + 1;
        });
        return Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-7)
            .map(([date, count]) => ({
            date,
            label: new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            }),
            count,
        }));
    }, [filteredTransactions]);
    const maxActivity = Math.max(1, ...activityData.map((item) => item.count));
    const paymentSummary = useMemo(() => {
        return PAYMENT_METHODS.map(({ value, label }) => ({
            method: value,
            label,
            amount: filteredTransactions.reduce((sum, transaction) => {
                const transactionMethod = String(transaction.paymentMethod ||
                    "other").toLowerCase();
                if (transactionMethod !==
                    value) {
                    return sum;
                }
                return (sum +
                    Number(transaction.amount ||
                        0));
            }, 0),
        }));
    }, [filteredTransactions]);
    const topExpenseCategories = useMemo(() => {
        const totals = {};
        filteredTransactions.forEach((transaction) => {
            if (getTransactionType(transaction) !== "expense") {
                return;
            }
            const category = getCategory(transaction)?.name ||
                "Uncategorized";
            totals[category] =
                (totals[category] || 0) +
                    Number(transaction.amount || 0);
        });
        return Object.entries(totals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4);
    }, [
        filteredTransactions,
        categories,
    ]);
    const hasActiveFilters = Boolean(search ||
        categoryId ||
        contactId ||
        paymentMethod ||
        startDate ||
        endDate ||
        transactionTypeFilter ||
        unlinkedOnly);
    const sortPreset = `${sortBy}_${order}`;
    const selectedCategory = categories.find((category) => category._id ===
        formData.categoryId);
    return (<div className="space-y-6">
        {actionSuccess && (<div className="fixed right-5 top-5 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-500/20 bg-slate-900 px-4 py-3 shadow-2xl shadow-black/30">
        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
✓
        </div>
        <p className="flex-1 text-sm text-slate-200">
        {actionSuccess}
        </p>
        <button type="button" onClick={() => setActionSuccess("")} className="text-slate-500 hover:text-white" aria-label="Dismiss notification">
        <X size={16}/>
        </button>
        </div>)}
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
    <p className="text-sm font-medium text-indigo-400">
Workspace / Transactions
    </p>
    <h1 className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
Transactions
    </h1>
    <p className="mt-1 text-sm text-slate-400">
Search, review and manage every financial movement.
    </p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
    <Button variant="secondary" onClick={exportVisibleTransactions} disabled={filteredTransactions.length === 0}>
    <Download size={17} className="mr-2"/>
Export CSV
    </Button>
    <Button variant="secondary" onClick={handleOpenImportModal}>
    <Upload size={17} className="mr-2"/>
Import CSV
    </Button>
    <Button onClick={handleOpenAddModal}>
    <Plus size={17} className="mr-2"/>
Add Transaction
    </Button>
    </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <Card>
    <div className="flex items-start justify-between gap-3">
    <div>
    <p className="text-sm text-slate-400">
Transactions
    </p>
    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
    {totalTransactions}
    </p>
    <p className="mt-1 text-xs text-slate-500">
Across all pages
    </p>
    </div>
    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
    <Filter size={18}/>
    </div>
    </div>
    </Card>
    <Card>
    <div className="flex items-start justify-between gap-3">
    <div>
    <p className="text-sm text-slate-400">
Income
    </p>
    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-emerald-400">
    {formatAmount(incomeTotal)}
    </p>
    <p className="mt-1 text-xs text-emerald-400/80">
    {incomeTransactions.length} loaded entries
    </p>
    </div>
    <ArrowUpRight className="mt-1 text-emerald-400" size={20}/>
    </div>
    </Card>
    <Card>
    <div className="flex items-start justify-between gap-3">
    <div>
    <p className="text-sm text-slate-400">
Expenses
    </p>
    <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-red-400">
    {formatAmount(expenseTotal)}
    </p>
    <p className="mt-1 text-xs text-red-400/80">
    {expenseTransactions.length} loaded entries
    </p>
    </div>
    <ArrowDownRight className="mt-1 text-red-400" size={20}/>
    </div>
    </Card>
    <Card>
    <div className="flex items-start justify-between gap-3">
    <div>
    <p className="text-sm text-slate-400">
Net
    </p>
    <p className={`mt-2 font-['Space_Grotesk'] text-2xl font-semibold ${netTotal >= 0
            ? "text-emerald-400"
            : "text-red-400"}`}>
    {netTotal >= 0 ? "+" : "-"}
        {formatAmount(Math.abs(netTotal))}
    </p>
    <p className="mt-1 text-xs text-slate-500">
Income − expenses on loaded results
    </p>
    </div>
    <div className={`rounded-lg p-2 ${netTotal >= 0
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"}`}>
    <ArrowUpRight size={18}/>
    </div>
    </div>
    </Card>
    </div>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <Card>
    <div className="flex items-center justify-between gap-3">
    <div>
    <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
Transaction Activity
    </h2>
    <p className="mt-1 text-xs text-slate-500">
Daily volume from the currently loaded results
    </p>
    </div>
    <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-500">
Last 7 dates
    </span>
    </div>
    <div className="mt-6 h-48">
        {activityData.length === 0 ? (<div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
No activity to visualize.
        </div>) : (<div className="flex h-full items-end gap-3">
            {activityData.map((item) => (<div key={item.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="relative flex h-full w-full items-end justify-center">
            <div className="w-full max-w-10 rounded-t-md bg-indigo-500/60 transition group-hover:bg-indigo-400/80" style={{
                    height: `${Math.max(8, (item.count /
                        maxActivity) *
                        100)}%`,
                }} title={`${item.count} transaction${item.count === 1
                    ? ""
                    : "s"}`}/>
            <span className="absolute -top-1 hidden -translate-y-full rounded bg-slate-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
            {item.count} transaction
                {item.count === 1
                    ? ""
                    : "s"}
            </span>
            </div>
            <span className="text-[11px] text-slate-500">
            {item.label}
            </span>
            </div>))}
        </div>)}
    </div>
    </Card>
    <Card>
    <div className="flex items-center justify-between gap-3">
    <div>
    <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
Income vs Expenses
    </h2>
    <p className="mt-1 text-xs text-slate-500">
Based on the currently loaded results
    </p>
    </div>
    <div className="flex items-center gap-3 text-[11px] text-slate-500">
    <span className="flex items-center gap-1.5">
    <span className="h-2 w-2 rounded-full bg-emerald-400"/>
Income
    </span>
    <span className="flex items-center gap-1.5">
    <span className="h-2 w-2 rounded-full bg-red-400"/>
Expense
    </span>
    </div>
    </div>
    <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
    <div className="relative h-40 w-40 shrink-0 rounded-full" style={{
            background: incomeTotal +
                expenseTotal >
                0
                ? `conic-gradient(#34d399 0deg ${((incomeTotal /
                    (incomeTotal +
                        expenseTotal)) *
                    360).toFixed(2)}deg, #f87171 ${((incomeTotal /
                    (incomeTotal +
                        expenseTotal)) *
                    360).toFixed(2)}deg 360deg)`
                : "#1e293b",
        }}>
    <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-slate-900">
    <span className="text-xs text-slate-500">
Net
    </span>
    <span className={`mt-1 text-lg font-semibold ${netTotal >= 0
            ? "text-emerald-400"
            : "text-red-400"}`}>
    {netTotal >= 0 ? "+" : "-"}
        {formatAmount(Math.abs(netTotal))}
    </span>
    </div>
    </div>
    <div className="min-w-[190px] space-y-4">
    <div>
    <div className="flex items-center justify-between text-sm">
    <span className="text-slate-400">
Income
    </span>
    <span className="font-medium text-emerald-400">
        {formatAmount(incomeTotal)}
    </span>
    </div>
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
    <div className="h-full rounded-full bg-emerald-400" style={{
            width: `${incomeTotal +
                expenseTotal
                ? (incomeTotal /
                    (incomeTotal +
                        expenseTotal)) *
                    100
                : 0}%`,
        }}/>
    </div>
    </div>
    <div>
    <div className="flex items-center justify-between text-sm">
    <span className="text-slate-400">
Expenses
    </span>
    <span className="font-medium text-red-400">
        {formatAmount(expenseTotal)}
    </span>
    </div>
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
    <div className="h-full rounded-full bg-red-400" style={{
            width: `${incomeTotal +
                expenseTotal
                ? (expenseTotal /
                    (incomeTotal +
                        expenseTotal)) *
                    100
                : 0}%`,
        }}/>
    </div>
    </div>
    <div className="border-t border-slate-800 pt-3 text-xs text-slate-500">
Average transaction:
    <span className="text-slate-300">
    {" "}
        {formatAmount(averageAmount)}
    </span>
    </div>
    </div>
    </div>
    </Card>
    </div>
  {/* Server/client-side filters are kept in their own presentational component. */}
  <TransactionFilters
    search={search}
    handleSearchChange={handleSearchChange}
    transactionTypeFilter={transactionTypeFilter}
    setTransactionTypeFilter={setTransactionTypeFilter}
    setPage={setPage}
    categoryId={categoryId}
    handleCategoryChange={handleCategoryChange}
    categories={categories}
    categoriesLoading={categoriesLoading}
    setMoreFiltersOpen={setMoreFiltersOpen}
    moreFiltersOpen={moreFiltersOpen}
    handleTypeFilterChange={handleTypeFilterChange}
    unlinkedOnly={unlinkedOnly}
    handleUnlinkedFilterChange={handleUnlinkedFilterChange}
    contactId={contactId}
    handleContactFilterChange={handleContactFilterChange}
    contacts={contacts}
    contactsLoading={contactsLoading}
    paymentMethod={paymentMethod}
    handlePaymentMethodChange={handlePaymentMethodChange}
    paymentMethods={PAYMENT_METHODS}
    typeFilterOptions={TYPE_FILTER_OPTIONS}
    startDate={startDate}
    handleStartDateChange={handleStartDateChange}
    endDate={endDate}
    handleEndDateChange={handleEndDateChange}
    applyDatePreset={applyDatePreset}
    sortPreset={sortPreset}
    handleSortPresetChange={handleSortPresetChange}
    sortPresetOptions={SORT_PRESET_OPTIONS}
    pageSize={pageSize}
    handlePageSizeChange={handlePageSizeChange}
    pageSizeOptions={PAGE_SIZE_OPTIONS}
    hasActiveFilters={hasActiveFilters}
    resetFilters={resetFilters}
  />
        {error && (<Card>
        <div className="text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <RefreshCw size={18}/>
        </div>
        <p className="mt-3 text-sm text-red-400">
        {error}
        </p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={fetchTransactions}>
Try Again
        </Button>
        </div>
        </Card>)}
        {!loading &&
            filteredTransactions.length >
                0 && (<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
        <div className="flex items-center justify-between">
        <div>
        <h2 className="font-['Space_Grotesk'] text-base font-semibold text-white">
Top expense categories
        </h2>
        <p className="mt-1 text-xs text-slate-500">
Largest expense categories in loaded results
        </p>
        </div>
        <span className="text-xs text-slate-500">
Top 4
        </span>
        </div>
        <div className="mt-4 space-y-3">
            {topExpenseCategories.length === 0 ? (<p className="py-4 text-sm text-slate-500">
No expense categories to show.
            </p>) : (topExpenseCategories.map(([name, amount]) => {
                const max = topExpenseCategories[0][1] ||
                    1;
                return (<div key={name}>
                <div className="flex items-center justify-between gap-3 text-sm">
                <button type="button" onClick={() => {
                        const found = categories.find((category) => category.name ===
                            name);
                        if (found) {
                            setCategoryId(found._id);
                            setPage(1);
                        }
                    }} className="truncate text-left text-slate-300 hover:text-white">
                {name}
                </button>
                <span className="shrink-0 font-medium text-red-400">
                    {formatAmount(amount)}
                </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-red-400/70" style={{
                        width: `${(amount / max) *
                            100}%`,
                    }}/>
                </div>
                </div>);
            }))}
        </div>
        </Card>
        <Card>
        <div className="flex items-center justify-between">
        <div>
        <h2 className="font-['Space_Grotesk'] text-base font-semibold text-white">
Payment methods
        </h2>
        <p className="mt-1 text-xs text-slate-500">
Transaction value by payment method
        </p>
        </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {paymentSummary.length === 0 ? (<p className="py-4 text-sm text-slate-500">
No payment data to show.
            </p>) : (paymentSummary
                .filter(({ amount }) => amount > 0)
                .slice(0, 4)
                .map(({ method, label, amount, }) => (<div key={method} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-xs text-slate-500">
            {label}
            </p>
            <p className="mt-1 font-semibold text-white">
                {formatAmount(amount)}
            </p>
            </div>)))}
        </div>
        </Card>
        </div>)}
  {/* Transaction list, mobile cards, and pagination are handled by the table component. */}
  <TransactionTable
    loading={loading}
    filteredTransactions={filteredTransactions}
    hasActiveFilters={hasActiveFilters}
    resetFilters={resetFilters}
    handleOpenAddModal={handleOpenAddModal}
    fetchTransactions={fetchTransactions}
    formatDate={formatDate}
    formatAmount={formatAmount}
    getCategory={getCategory}
    getContact={getContact}
    getTransactionType={getTransactionType}
    setCategoryId={setCategoryId}
    setContactId={setContactId}
    setPage={setPage}
    totalTransactions={totalTransactions}
    pageSize={pageSize}
    pagination={pagination}
    currentPage={currentPage}
    totalPages={totalPages}
    handleViewTransaction={handleViewTransaction}
    handleDuplicateTransaction={handleDuplicateTransaction}
    handleOpenDeleteModal={handleOpenDeleteModal}
    pageSizeOptions={PAGE_SIZE_OPTIONS}
    handlePageSizeChange={handlePageSizeChange}
  />
  {/* CRUD/import modals stay mounted here; this page owns their state and handlers. */}
  <AddTransactionModal
    showAddModal={showAddModal}
    handleCloseAddModal={handleCloseAddModal}
    handleAddTransaction={handleAddTransaction}
    formSubmitError={formSubmitError}
    formData={formData}
    handleFormChange={handleFormChange}
    formErrors={formErrors}
    categoriesLoading={categoriesLoading}
    categories={categories}
    selectedCategory={selectedCategory}
    contacts={contacts}
    contactsLoading={contactsLoading}
    handleOpenQuickContactModal={handleOpenQuickContactModal}
    submitting={submitting}
    formatAmount={formatAmount}
  />
  <QuickContactModal
    showQuickContactModal={showQuickContactModal}
    handleCloseQuickContactModal={handleCloseQuickContactModal}
    handleQuickContactSubmit={handleQuickContactSubmit}
    quickContactSubmitError={quickContactSubmitError}
    quickContactForm={quickContactForm}
    handleQuickContactChange={handleQuickContactChange}
    quickContactErrors={quickContactErrors}
    creatingQuickContact={creatingQuickContact}
  />
  <ViewTransactionModal
    showViewModal={showViewModal}
    handleCloseViewModal={handleCloseViewModal}
    viewLoading={viewLoading}
    viewError={viewError}
    selectedTransaction={selectedTransaction}
    getCategory={getCategory}
    getContact={getContact}
    getTransactionType={getTransactionType}
    formatAmount={formatAmount}
    formatDate={formatDate}
    handleOpenEditModal={handleOpenEditModal}
  />
  <EditTransactionModal
    showEditModal={showEditModal}
    handleCloseEditModal={handleCloseEditModal}
    handleUpdateTransaction={handleUpdateTransaction}
    editSubmitError={editSubmitError}
    editFormData={editFormData}
    handleEditFormChange={handleEditFormChange}
    editFormErrors={editFormErrors}
    categoriesLoading={categoriesLoading}
    categories={categories}
    contacts={contacts}
    contactsLoading={contactsLoading}
    editing={editing}
  />
  <DeleteTransactionModal
    showDeleteModal={showDeleteModal}
    handleCloseDeleteModal={handleCloseDeleteModal}
    transactionToDelete={transactionToDelete}
    formatAmount={formatAmount}
    formatDate={formatDate}
    deleteError={deleteError}
    handleDeleteTransaction={handleDeleteTransaction}
    deleting={deleting}
  />
  <ImportTransactionsModal
    showImportModal={showImportModal}
    handleCloseImportModal={handleCloseImportModal}
    handleFileChange={handleFileChange}
    selectedFile={selectedFile}
    importing={importing}
    importError={importError}
    importSuccess={importSuccess}
    handleImportCSV={handleImportCSV}
  />
    </div>);
};
export default Transactions;
