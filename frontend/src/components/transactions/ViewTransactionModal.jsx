import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import LoadingSpinner from "../ui/LoadingSpinner";

const ViewTransactionModal = ({
    showViewModal,
    handleCloseViewModal,
    viewLoading,
    viewError,
    selectedTransaction,
    getCategory,
    getContact,
    getTransactionType,
    formatAmount,
    formatDate,
    handleOpenEditModal,
}) => {
    return (
<Modal
isOpen={showViewModal}
onClose={
handleCloseViewModal
}
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
onClick={
handleCloseViewModal
}
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
getTransactionType(
selectedTransaction
) ===
"income";

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
{isIncome ? "+" : "-"}
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

<div className="mt-2">

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

</div>

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
{contact?.name || "-"}
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
    );
};

export default ViewTransactionModal;
