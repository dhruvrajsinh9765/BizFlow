import Button from "../ui/Button";
import Modal from "../ui/Modal";

const DeleteTransactionModal = ({
    showDeleteModal,
    handleCloseDeleteModal,
    transactionToDelete,
    formatAmount,
    formatDate,
    deleteError,
    handleDeleteTransaction,
    deleting,
}) => {
    return (
<Modal
isOpen={showDeleteModal}
onClose={
handleCloseDeleteModal
}
title="Delete Transaction"
>

<div className="space-y-5">

<p className="text-sm leading-6 text-slate-400">
Are you sure you want to delete this transaction?
</p>


{transactionToDelete && (
<div className="rounded-lg border border-slate-800 bg-slate-950 p-4">

<p className="font-medium text-white">
{transactionToDelete.description ||
"No description"}
</p>

<p className="mt-1 text-sm text-slate-400">
{formatAmount(
transactionToDelete.amount
)}
{" · "}
{formatDate(
transactionToDelete.transactionDate
)}
</p>

</div>
)}


<p className="text-xs text-slate-500">
This action cannot be undone.
</p>


{deleteError && (
<p className="text-sm text-red-400">
{deleteError}
</p>
)}


<div className="flex justify-end gap-3 border-t border-slate-800 pt-4">

<Button
variant="secondary"
onClick={
handleCloseDeleteModal
}
disabled={deleting}
>
Cancel
</Button>


<Button
variant="danger"
onClick={
handleDeleteTransaction
}
disabled={deleting}
>
{deleting
? "Deleting..."
: "Delete Transaction"}
</Button>

</div>

</div>

</Modal>
    );
};

export default DeleteTransactionModal;
