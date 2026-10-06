import ContactSelector from "./ContactSelector";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank", label: "Bank Transfer" },
    { value: "card", label: "Card" },
    { value: "other", label: "Other" },
];

const AddTransactionModal = ({
    showAddModal,
    handleCloseAddModal,
    handleAddTransaction,
    formSubmitError,
    formData,
    handleFormChange,
    formErrors,
    categoriesLoading,
    categories,
    selectedCategory,
    contacts,
    contactsLoading,
    handleOpenQuickContactModal,
    submitting,
    formatAmount,
}) => {
    return (
<Modal
isOpen={showAddModal}
onClose={handleCloseAddModal}
title="Add Transaction"
>

<form
onSubmit={handleAddTransaction}
className="max-h-[calc(100vh-220px)] space-y-4 overflow-y-auto pr-1 sm:max-h-[calc(100vh-240px)]"
>

{formSubmitError && (
<div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
{formSubmitError}
</div>
)}


<Input
label="Amount"
name="amount"
type="number"
value={formData.amount}
onChange={handleFormChange}
placeholder="Enter amount"
error={formErrors.amount}
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
error={formErrors.categoryId}
/>


{selectedCategory && (
<div className="-mt-2 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">

<span className="text-xs text-slate-500">
Transaction type
</span>

<Badge
variant={
selectedCategory.type ===
"income"
? "success"
: "danger"
}
>
{selectedCategory.type ===
"income"
? "Income"
: "Expense"}
</Badge>

</div>
)}


<Input
label="Description"
name="description"
value={formData.description}
onChange={handleFormChange}
placeholder="What was this transaction for?"
error={formErrors.description}
/>


<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

<div>

<Input
label="Transaction Date"
name="transactionDate"
type="date"
value={
formData.transactionDate
}
onChange={
handleFormChange
}
/>

{formErrors.transactionDate && (
<p className="mt-1 text-xs text-red-400">
{formErrors.transactionDate}
</p>
)}

</div>


<Select
label="Payment Method"
name="paymentMethod"
value={
formData.paymentMethod
}
onChange={
handleFormChange
}
placeholder="Select payment method"
options={
PAYMENT_METHODS
}
error={
formErrors.paymentMethod
}
/>

</div>


{/* SEARCHABLE CONTACT SELECTOR */}

<div>

<ContactSelector
contacts={contacts}
value={formData.contactId}
onChange={handleFormChange}
loading={contactsLoading}
placeholder="Select contact (optional)"
error={formErrors.contactId}
/>

<button
type="button"
onClick={
handleOpenQuickContactModal
}
className="mt-2 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
>
+ Add New Contact
</button>

</div>


<div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">

<p className="text-sm font-medium text-white">
Transaction Summary
</p>

<div className="mt-3 grid grid-cols-2 gap-3 text-sm">

<div>
<p className="text-xs text-slate-500">
Type
</p>

<p className="mt-1 text-slate-200">
{selectedCategory?.type ===
"income"
? "Income"
: selectedCategory?.type ===
"expense"
? "Expense"
: "-"}
</p>
</div>


<div>
<p className="text-xs text-slate-500">
Amount
</p>

<p className="mt-1 font-medium text-slate-200">
{formData.amount
? formatAmount(
formData.amount
)
: "-"}
</p>
</div>


<div>
<p className="text-xs text-slate-500">
Category
</p>

<p className="mt-1 truncate text-slate-200">
{selectedCategory?.name ||
"-"}
</p>
</div>


<div>
<p className="text-xs text-slate-500">
Contact
</p>

<p className="mt-1 truncate text-slate-200">

{contacts.find(
(contact) =>
contact._id ===
formData.contactId
)?.name || "-"}

</p>

</div>

</div>

</div>


<div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-800 bg-slate-900/95 pt-4 backdrop-blur">

<Button
type="button"
variant="secondary"
onClick={
handleCloseAddModal
}
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
: "Save Transaction"}
</Button>

</div>

</form>

</Modal>
    );
};

export default AddTransactionModal;
