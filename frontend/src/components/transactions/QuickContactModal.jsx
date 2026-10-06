import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const CONTACT_TYPE_OPTIONS = [
    { value: "customer", label: "Customer" },
    { value: "supplier", label: "Supplier" },
];

const QuickContactModal = ({
    showQuickContactModal,
    handleCloseQuickContactModal,
    handleQuickContactSubmit,
    quickContactSubmitError,
    quickContactForm,
    handleQuickContactChange,
    quickContactErrors,
    creatingQuickContact,
}) => {
    return (
<Modal
isOpen={showQuickContactModal}
onClose={
handleCloseQuickContactModal
}
title="Add New Contact"
>

<form
onSubmit={
handleQuickContactSubmit
}
className="space-y-4"
>

{quickContactSubmitError && (
<div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
{quickContactSubmitError}
</div>
)}


<Input
label="Name"
name="name"
value={
quickContactForm.name
}
onChange={
handleQuickContactChange
}
placeholder="Enter contact name"
error={
quickContactErrors.name
}
/>


<Select
label="Contact Type"
name="contactType"
value={
quickContactForm.contactType
}
onChange={
handleQuickContactChange
}
options={
CONTACT_TYPE_OPTIONS
}
placeholder="Select contact type"
error={
quickContactErrors.contactType
}
/>


<Input
label="Phone"
name="phone"
type="tel"
value={
quickContactForm.phone
}
onChange={
handleQuickContactChange
}
placeholder="10-digit phone number"
error={
quickContactErrors.phone
}
/>


<Input
label="Email"
name="email"
type="email"
value={
quickContactForm.email
}
onChange={
handleQuickContactChange
}
placeholder="example@email.com"
error={
quickContactErrors.email
}
/>


<div className="flex justify-end gap-3 border-t border-slate-800 pt-4">

<Button
type="button"
variant="secondary"
onClick={
handleCloseQuickContactModal
}
disabled={
creatingQuickContact
}
>
Cancel
</Button>


<Button
type="submit"
disabled={
creatingQuickContact
}
>
{creatingQuickContact
? "Creating..."
: "Create Contact"}
</Button>

</div>

</form>

</Modal>
    );
};

export default QuickContactModal;
