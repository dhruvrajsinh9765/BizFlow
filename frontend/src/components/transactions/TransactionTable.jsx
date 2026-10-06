import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Copy,
    Eye,
    Plus,
    RefreshCw,
    Trash2,
} from "lucide-react";

import Card from "../ui/Card";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";

// Displays the transaction list in desktop and mobile layouts.
// Pagination and transaction actions are handled through callbacks
// provided by the parent Transactions page.
const TransactionTable = ({
    loading,
    filteredTransactions,
    hasActiveFilters,
    resetFilters,
    handleOpenAddModal,
    fetchTransactions,
    formatDate,
    formatAmount,
    getCategory,
    getContact,
    getTransactionType,
    setCategoryId,
    setContactId,
    setPage,
    totalTransactions,
    pageSize,
    pagination,
    currentPage,
    totalPages,
    handleViewTransaction,
    handleDuplicateTransaction,
    handleOpenDeleteModal,
    pageSizeOptions,
    handlePageSizeChange,
}) => (
    loading ? (
        // Loading skeleton shown while transactions are being fetched.
        <Card>
            <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-14 animate-pulse rounded-lg bg-slate-800/60"
                    />
                ))}
            </div>
        </Card>
    ) : filteredTransactions.length === 0 ? (
        // Empty state shown when there are no transactions.
        <Card>
            <EmptyState
                title={
                    hasActiveFilters
                        ? "No matching transactions"
                        : "No transactions yet"
                }
                description={
                    hasActiveFilters
                        ? "Try changing or clearing your filters."
                        : "Add your first transaction to start tracking your business finances."
                }
                action={
                    hasActiveFilters ? (
                        <Button
                            variant="secondary"
                            onClick={resetFilters}
                        >
                            Clear Filters
                        </Button>
                    ) : (
                        <Button onClick={handleOpenAddModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Transaction
                        </Button>
                    )
                }
            />
        </Card>
    ) : (
        <>
            <Card>
                {/* Transaction list header and refresh action */}
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">
                            Transaction list
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Showing{" "}
                            {filteredTransactions.length} loaded result
                            {filteredTransactions.length === 1 ? "" : "s"}
                            {totalTransactions > pageSize
                                ? ` · ${totalTransactions} total`
                                : ""}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchTransactions}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:text-white"
                        title="Refresh transactions"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>

                {/* Desktop transaction table */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[900px]">
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

                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Type
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
                            {filteredTransactions.map((transaction) => {
                                const category = getCategory(transaction);
                                const contact = getContact(transaction);
                                const isIncome =
                                    getTransactionType(transaction) === "income";

                                return (
                                    <tr
                                        key={transaction._id}
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
                                                        <ArrowUpRight size={17} />
                                                    ) : (
                                                        <ArrowDownRight
                                                            size={17}
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-white">
                                                        {transaction.description ||
                                                            "No description"}
                                                    </p>

                                                    <p className="mt-0.5 text-xs capitalize text-slate-500">
                                                        {transaction.paymentMethod ||
                                                            "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (category?._id) {
                                                        setCategoryId(
                                                            category._id
                                                        );
                                                        setPage(1);
                                                    }
                                                }}
                                                className="text-left"
                                            >
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
                                            </button>
                                        </td>

                                        <td className="px-4 py-4">
                                            {contact ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (contact._id) {
                                                            setContactId(
                                                                contact._id
                                                            );
                                                            setPage(1);
                                                        }
                                                    }}
                                                    className="text-left text-sm text-slate-300 hover:text-white"
                                                >
                                                    {contact.name}
                                                </button>
                                            ) : (
                                                <span className="text-sm text-slate-500">
                                                    -
                                                </span>
                                            )}
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

                                        <td
                                            className={`px-4 py-4 text-right font-medium ${
                                                isIncome
                                                    ? "text-emerald-400"
                                                    : "text-red-400"
                                            }`}
                                        >
                                            {isIncome ? "+" : "-"}
                                            {formatAmount(transaction.amount)}
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {/* View transaction */}
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
                                                    <Eye size={17} />
                                                </button>

                                                {/* Duplicate transaction */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDuplicateTransaction(
                                                            transaction
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                                    title="Duplicate transaction"
                                                >
                                                    <Copy size={16} />
                                                </button>

                                                {/* Delete transaction */}
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
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile transaction cards */}
                <div className="space-y-3 md:hidden">
                    {filteredTransactions.map((transaction) => {
                        const category = getCategory(transaction);
                        const contact = getContact(transaction);
                        const isIncome =
                            getTransactionType(transaction) === "income";

                        return (
                            <div
                                key={transaction._id}
                                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-white">
                                            {transaction.description ||
                                                "No description"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {formatDate(
                                                transaction.transactionDate
                                            )}
                                            {" · "}
                                            <span className="capitalize">
                                                {transaction.paymentMethod ||
                                                    "-"}
                                            </span>
                                        </p>
                                    </div>

                                    <p
                                        className={`shrink-0 font-semibold ${
                                            isIncome
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                        }`}
                                    >
                                        {isIncome ? "+" : "-"}
                                        {formatAmount(transaction.amount)}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={
                                            isIncome ? "success" : "danger"
                                        }
                                    >
                                        {isIncome ? "Income" : "Expense"}
                                    </Badge>

                                    <Badge
                                        variant={
                                            isIncome ? "success" : "danger"
                                        }
                                    >
                                        {category?.name || "Uncategorized"}
                                    </Badge>

                                    {contact && (
                                        <span className="text-xs text-slate-400">
                                            {contact.name}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-end gap-1 border-t border-slate-800 pt-3">
                                    {/* View */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewTransaction(
                                                transaction._id
                                            )
                                        }
                                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                                        title="View"
                                    >
                                        <Eye size={16} />
                                    </button>

                                    {/* Duplicate */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDuplicateTransaction(
                                                transaction
                                            )
                                        }
                                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                                        title="Duplicate"
                                    >
                                        <Copy size={16} />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenDeleteModal(transaction)
                                        }
                                        className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Pagination */}
            {pagination && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500">
                        Showing{" "}
                        {Math.min(
                            (currentPage - 1) * pageSize + 1,
                            totalTransactions
                        )}
                        {" – "}
                        {Math.min(
                            currentPage * pageSize,
                            totalTransactions
                        )}{" "}
                        of {totalTransactions} transactions
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Select
                            name="page-size-bottom"
                            value={String(pageSize)}
                            onChange={handlePageSizeChange}
                            options={pageSizeOptions}
                        />

                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                        >
                            <ChevronLeft
                                size={15}
                                className="mr-1"
                            />
                            Previous
                        </Button>

                        <span className="rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-400">
                            Page {currentPage} of {totalPages}
                        </span>

                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                        >
                            Next
                            <ChevronRight
                                size={15}
                                className="ml-1"
                            />
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
);

export default TransactionTable;