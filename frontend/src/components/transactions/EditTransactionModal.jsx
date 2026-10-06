import ContactSelector from "./ContactSelector";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

// Payment methods available when editing a transaction.
const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank", label: "Bank Transfer" },
    { value: "card", label: "Card" },
    { value: "other", label: "Other" },
];

const EditTransactionModal = ({
    showEditModal,
    handleCloseEditModal,
    handleUpdateTransaction,
    editSubmitError,
    editFormData,
    handleEditFormChange,
    editFormErrors,
    categoriesLoading,
    categories,
    contacts,
    contactsLoading,
    editing,
}) => {
    return (
        <Modal
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            title="Edit Transaction"
        >
            <form
                onSubmit={handleUpdateTransaction}
                className="space-y-4"
            >
                {/* Show an error if updating the transaction fails. */}
                {editSubmitError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {editSubmitError}
                    </div>
                )}

                {/* Transaction amount */}
                <Input
                    label="Amount"
                    name="amount"
                    type="number"
                    value={editFormData.amount}
                    onChange={handleEditFormChange}
                    placeholder="Enter amount"
                    error={editFormErrors.amount}
                />

                {/* Transaction category */}
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
                    options={categories.map((category) => ({
                        value: category._id,
                        label: category.name,
                    }))}
                    disabled={categoriesLoading}
                    error={editFormErrors.categoryId}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Payment method */}
                    <Select
                        label="Payment Method"
                        name="paymentMethod"
                        value={editFormData.paymentMethod}
                        onChange={handleEditFormChange}
                        placeholder="Select payment method"
                        options={PAYMENT_METHODS}
                        error={editFormErrors.paymentMethod}
                    />

                    {/* Transaction date */}
                    <div>
                        <Input
                            label="Transaction Date"
                            name="transactionDate"
                            type="date"
                            value={editFormData.transactionDate}
                            onChange={handleEditFormChange}
                        />

                        {editFormErrors.transactionDate && (
                            <p className="mt-1 text-xs text-red-400">
                                {editFormErrors.transactionDate}
                            </p>
                        )}
                    </div>
                </div>

                {/* Searchable contact selector */}
                <ContactSelector
                    contacts={contacts}
                    value={editFormData.contactId}
                    onChange={handleEditFormChange}
                    loading={contactsLoading}
                    placeholder="No contact / select contact"
                    error={editFormErrors.contactId}
                />

                {/* Transaction description */}
                <Input
                    label="Description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    placeholder="What was this transaction for?"
                    error={editFormErrors.description}
                />

                {/* Form actions */}
                <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
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
                        {editing ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditTransactionModal;