import { useEffect, useMemo, useRef, useState } from "react";
import {
ArrowDownRight,
ArrowUpRight,
ChevronLeft,
ChevronRight,
Copy,
Download,
Eye,
Filter,
Plus,
RefreshCw,
Search,
SlidersHorizontal,
Trash2,
Upload,
X,
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

const CONTACT_TYPE_OPTIONS = [
{ value: "customer", label: "Customer" },
{ value: "supplier", label: "Supplier" },
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


/* =========================================================
   SEARCHABLE CONTACT SELECTOR
   ========================================================= */

const ContactSelector = ({
contacts = [],
value = "",
onChange,
loading = false,
error = "",
placeholder = "Select contact (optional)",
}) => {
const [open, setOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const containerRef = useRef(null);

useEffect(() => {
const handleClickOutside = (event) => {
if (
containerRef.current &&
!containerRef.current.contains(event.target)
) {
setOpen(false);
setSearchTerm("");
}
};

document.addEventListener("mousedown", handleClickOutside);

return () => {
document.removeEventListener("mousedown", handleClickOutside);
};
}, []);

const getContactType = (contact) => {
const type = String(contact?.contactType || "").toLowerCase();

if (type === "customer") return "Customer";
if (type === "supplier") return "Supplier";

return contact?.contactType || "Contact";
};

const getContactDetail = (contact) => {
if (contact?.phone) return contact.phone;
if (contact?.email) return contact.email;

return "No contact details";
};

const selectedContact = contacts.find(
(contact) => contact._id === value
);

const normalizedSearch = searchTerm.trim().toLowerCase();

const filteredContacts = contacts
.filter((contact) => {
if (!normalizedSearch) return true;

const name = String(contact?.name || "").toLowerCase();
const type = String(contact?.contactType || "").toLowerCase();
const phone = String(contact?.phone || "").toLowerCase();
const email = String(contact?.email || "").toLowerCase();

return (
name.includes(normalizedSearch) ||
type.includes(normalizedSearch) ||
phone.includes(normalizedSearch) ||
email.includes(normalizedSearch)
);
})
.slice(0, 8);

const selectContact = (nextValue) => {
onChange({
target: {
name: "contactId",
value: nextValue,
},
});

setOpen(false);
setSearchTerm("");
};

const clearContact = (event) => {
event.stopPropagation();
selectContact("");
};

return (
<div className="relative" ref={containerRef}>
<label className="mb-2 block text-sm font-medium text-slate-300">
Contact / Party
</label>

<button
type="button"
onClick={() => {
if (!loading) {
setOpen((current) => !current);
}
}}
disabled={loading}
className={`flex w-full items-center justify-between rounded-lg border bg-slate-950 px-4 py-3 text-left text-sm transition ${
error
? "border-red-500/60"
: open
? "border-indigo-500"
: "border-slate-700"
} ${
loading
? "cursor-not-allowed opacity-60"
: "cursor-pointer hover:border-slate-600"
}`}
>
<div className="min-w-0 flex-1">
{loading ? (
<span className="text-slate-500">
Loading contacts...
</span>
) : selectedContact ? (
<div className="flex min-w-0 items-center gap-3">
<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-300">
{String(selectedContact.name || "C")
.trim()
.charAt(0)
.toUpperCase()}
</div>

<div className="min-w-0">
<p className="truncate font-medium text-white">
{selectedContact.name}
</p>

<p className="truncate text-xs text-slate-500">
{getContactType(selectedContact)} ·{" "}
{getContactDetail(selectedContact)}
</p>
</div>
</div>
) : (
<span className="text-slate-500">
{placeholder}
</span>
)}
</div>

<div className="ml-3 flex shrink-0 items-center gap-2">
{selectedContact && (
<span
role="button"
tabIndex={0}
onClick={clearContact}
onKeyDown={(event) => {
if (
event.key === "Enter" ||
event.key === " "
) {
event.preventDefault();
clearContact(event);
}
}}
className="rounded-md px-1.5 py-0.5 text-base leading-none text-slate-500 transition hover:bg-slate-800 hover:text-white"
title="Clear contact"
>
×
</span>
)}

<span
className={`text-slate-500 transition-transform ${
open ? "rotate-180" : ""
}`}
>
▾
</span>
</div>
</button>

{open && !loading && (
<div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
<div className="border-b border-slate-800 p-3">
<div className="relative">
<Search
size={16}
className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
/>

<input
type="text"
value={searchTerm}
onChange={(event) =>
setSearchTerm(event.target.value)
}
onClick={(event) =>
event.stopPropagation()
}
autoFocus
placeholder="Search name, phone or email..."
className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
/>
</div>
</div>

<div className="max-h-72 overflow-y-auto">
<button
type="button"
onClick={() => selectContact("")}
className={`w-full border-b border-slate-800 px-4 py-3 text-left text-sm transition hover:bg-slate-900 ${
!value
? "bg-indigo-500/10 text-indigo-300"
: "text-slate-400"
}`}
>
No contact
</button>

{filteredContacts.length === 0 ? (
<div className="px-4 py-8 text-center">
<p className="text-sm text-slate-400">
No contacts found
</p>

{normalizedSearch && (
<p className="mt-1 text-xs text-slate-600">
Try another name, phone or email.
</p>
)}
</div>
) : (
filteredContacts.map((contact) => {
const isSelected =
contact._id === value;

const contactType =
getContactType(contact);

return (
<button
key={contact._id}
type="button"
onClick={() =>
selectContact(contact._id)
}
className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
isSelected
? "bg-indigo-500/10"
: "hover:bg-slate-900"
}`}
>
<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-indigo-300">
{String(contact.name || "C")
.trim()
.charAt(0)
.toUpperCase()}
</div>

<div className="min-w-0 flex-1">
<div className="flex items-center gap-2">
<p className="truncate text-sm font-medium text-white">
{contact.name}
</p>

<span
className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
contactType === "Supplier"
? "bg-amber-500/10 text-amber-400"
: "bg-blue-500/10 text-blue-400"
}`}
>
{contactType}
</span>
</div>

<p className="mt-0.5 truncate text-xs text-slate-500">
{getContactDetail(contact)}
</p>
</div>

{isSelected && (
<span className="shrink-0 text-xs font-medium text-indigo-400">
Selected
</span>
)}
</button>
);
})
)}
</div>

{contacts.length > 8 && (
<div className="border-t border-slate-800 px-4 py-2.5">
<p className="text-center text-[11px] text-slate-600">
Showing up to 8 matches. Search to find another contact.
</p>
</div>
)}
</div>
)}

{error && (
<p className="mt-1 text-xs text-red-400">
{error}
</p>
)}
</div>
);

};

/* =========================================================
   TRANSACTIONS
   ========================================================= */

const Transactions = () => {
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
const [transactionTypeFilter, setTransactionTypeFilter] =
useState("");
const [unlinkedOnly, setUnlinkedOnly] = useState(false);
const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

const [sortBy, setSortBy] =
useState("transactionDate");
const [order, setOrder] = useState("desc");
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

const [categories, setCategories] = useState([]);
const [contacts, setContacts] = useState([]);
const [categoriesLoading, setCategoriesLoading] =
useState(false);
const [contactsLoading, setContactsLoading] =
useState(false);

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

const [showQuickContactModal, setShowQuickContactModal] =
useState(false);

const [quickContactForm, setQuickContactForm] =
useState(initialQuickContactForm);

const [quickContactErrors, setQuickContactErrors] =
useState({});

const [quickContactSubmitError, setQuickContactSubmitError] =
useState("");

const [creatingQuickContact, setCreatingQuickContact] =
useState(false);

const [showViewModal, setShowViewModal] = useState(false);
const [selectedTransaction, setSelectedTransaction] =
useState(null);

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
const [transactionToDelete, setTransactionToDelete] =
useState(null);

const [deleting, setDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");

const [showImportModal, setShowImportModal] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);
const [importing, setImporting] = useState(false);
const [importError, setImportError] = useState("");
const [importSuccess, setImportSuccess] = useState("");

const [actionSuccess, setActionSuccess] = useState("");

const fetchTransactions = async () => {
try {
setLoading(true);
setError("");

const data =
await transactionService.getTransactions({
page,
limit: pageSize,
categoryId: categoryId || undefined,
contactId: contactId || undefined,
paymentMethod:
paymentMethod || undefined,
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

const data =
await categoryService.getCategories();

setCategories(
data.categories || data || []
);
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

const data =
await contactService.getContacts();

setContacts(
data.contacts || data || []
);
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
pageSize,
]);

useEffect(() => {
fetchCategories();
fetchContacts();
}, []);

useEffect(() => {
if (!actionSuccess) return undefined;

const timer = setTimeout(
() => setActionSuccess(""),
3500
);

return () => clearTimeout(timer);
}, [actionSuccess]);

const getCategory = (transaction) => {
if (!transaction?.categoryId) return null;

if (
typeof transaction.categoryId === "object"
) {
return transaction.categoryId;
}

return categories.find(
(category) =>
category._id === transaction.categoryId
);
};

const getContact = (transaction) => {
if (!transaction?.contactId) return null;

if (
typeof transaction.contactId === "object"
) {
return transaction.contactId;
}

return contacts.find(
(contact) =>
contact._id === transaction.contactId
);
};

const formatDate = (date) => {
if (!date) return "-";

return new Date(date).toLocaleDateString(
"en-IN",
{
day: "2-digit",
month: "short",
year: "numeric",
}
);
};

const formatAmount = (amount) =>
`₹${Number(amount || 0).toLocaleString("en-IN")}`;

const getTransactionType = (transaction) =>
getCategory(transaction)?.type === "income"
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
const [nextSortBy, nextOrder] =
event.target.value.split("_");

setSortBy(nextSortBy);
setOrder(nextOrder);
setPage(1);
};

const handlePageSizeChange = (event) => {
setPageSize(Number(event.target.value));
setPage(1);
};

const handleTypeFilterChange = (value) => {
setTransactionTypeFilter((current) =>
current === value ? "" : value
);
setPage(1);
};

const handleUnlinkedFilterChange = () => {
setUnlinkedOnly((current) => !current);
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

const handleDuplicateTransaction = (
transaction
) => {
const category =
typeof transaction.categoryId === "object"
? transaction.categoryId?._id || ""
: transaction.categoryId || "";

const contact =
typeof transaction.contactId === "object"
? transaction.contactId?._id || ""
: transaction.contactId || "";

setFormData({
amount: transaction.amount || "",
categoryId: category,
contactId: contact,
paymentMethod:
transaction.paymentMethod || "",
transactionDate: getToday(),
description:
transaction.description || "",
});

setFormErrors({});
setFormSubmitError("");
setShowAddModal(true);
};

const handleCloseAddModal = () => {
if (
submitting ||
creatingQuickContact
) {
return;
}

setShowAddModal(false);
resetForm();
};

const handleAddTransaction = async (event) => {
event.preventDefault();

setFormSubmitError("");

const errors =
validateTransactionForm(formData);

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
transactionDate:
formData.transactionDate,
description:
formData.description.trim(),
};

if (formData.contactId) {
payload.contactId =
formData.contactId;
}

await transactionService.createTransaction(
payload
);

setShowAddModal(false);
resetForm();

setActionSuccess(
"Transaction created successfully."
);

await fetchTransactions();
} catch (error) {
console.error(
"Failed to create transaction:",
error
);

setFormSubmitError(
error.response?.data?.message ||
"Unable to add transaction. Please try again."
);
} finally {
setSubmitting(false);
}
};

const handleOpenQuickContactModal = () => {
setQuickContactForm(
initialQuickContactForm
);

setQuickContactErrors({});
setQuickContactSubmitError("");
setShowQuickContactModal(true);
};

const handleCloseQuickContactModal = () => {
if (creatingQuickContact) return;

setShowQuickContactModal(false);
setQuickContactForm(
initialQuickContactForm
);

setQuickContactErrors({});
setQuickContactSubmitError("");
};

const handleQuickContactChange = (
event
) => {
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

if (
quickContactForm.phone &&
!/^[0-9]{10}$/.test(
quickContactForm.phone
)
) {
errors.phone =
"Phone number must contain exactly 10 digits.";
}

if (
quickContactForm.email &&
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
quickContactForm.email
)
) {
errors.email =
"Please provide a valid email address.";
}

return errors;
};

const handleQuickContactSubmit =
async (event) => {
event.preventDefault();

const errors =
validateQuickContact();

setQuickContactErrors(errors);

if (Object.keys(errors).length > 0) {
return;
}

try {
setCreatingQuickContact(true);
setQuickContactSubmitError("");

const payload = {
name: quickContactForm.name.trim(),
contactType:
quickContactForm.contactType,
};

if (quickContactForm.phone.trim()) {
payload.phone =
quickContactForm.phone.trim();
}

if (quickContactForm.email.trim()) {
payload.email =
quickContactForm.email.trim();
}

const data =
await contactService.createContact(
payload
);

const createdContact =
data.contact || data;

if (!createdContact?._id) {
throw new Error(
"Created contact was not returned by the API."
);
}

setContacts((current) => [
...current,
createdContact,
]);

setFormData((current) => ({
...current,
contactId:
createdContact._id,
}));

setShowQuickContactModal(false);
setQuickContactForm(
initialQuickContactForm
);

setQuickContactErrors({});
setQuickContactSubmitError("");
} catch (error) {
console.error(
"Failed to create contact:",
error
);

setQuickContactSubmitError(
error.response?.data?.message ||
error.message ||
"Unable to create contact. Please try again."
);
} finally {
setCreatingQuickContact(false);
}
};

const handleViewTransaction =
async (id) => {
try {
setViewLoading(true);
setViewError("");
setSelectedTransaction(null);
setShowViewModal(true);

const data =
await transactionService.getTransactionById(
id
);

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

const selectedCategory =
typeof selectedTransaction.categoryId ===
"object"
? selectedTransaction.categoryId?._id ||
""
: selectedTransaction.categoryId || "";

const selectedContact =
typeof selectedTransaction.contactId ===
"object"
? selectedTransaction.contactId?._id ||
""
: selectedTransaction.contactId || "";

setEditFormData({
amount:
selectedTransaction.amount || "",
categoryId: selectedCategory,
contactId: selectedContact,
paymentMethod:
selectedTransaction.paymentMethod || "",
transactionDate:
selectedTransaction.transactionDate
? new Date(
selectedTransaction.transactionDate
)
.toISOString()
.split("T")[0]
: "",
description:
selectedTransaction.description || "",
});

setEditFormErrors({});
setEditSubmitError("");
setShowViewModal(false);
setShowEditModal(true);
};

const handleCloseEditModal = () => {
if (editing) return;

setShowEditModal(false);
setEditFormErrors({});
setEditSubmitError("");
};

const handleUpdateTransaction =
async (event) => {
event.preventDefault();

setEditSubmitError("");

const errors =
validateTransactionForm(
editFormData
);

setEditFormErrors(errors);

if (Object.keys(errors).length > 0) {
return;
}

try {
setEditing(true);

const payload = {
amount: Number(
editFormData.amount
),
categoryId:
editFormData.categoryId,
contactId:
editFormData.contactId || null,
paymentMethod:
editFormData.paymentMethod,
transactionDate:
editFormData.transactionDate,
description:
editFormData.description.trim(),
};

await transactionService.updateTransaction(
selectedTransaction._id,
payload
);

setShowEditModal(false);
setSelectedTransaction(null);

setActionSuccess(
"Transaction updated successfully."
);

await fetchTransactions();
} catch (error) {
console.error(
"Failed to update transaction:",
error
);

setEditSubmitError(
error.response?.data?.message ||
"Unable to update transaction. Please try again."
);
} finally {
setEditing(false);
}
};

const handleOpenDeleteModal = (
transaction
) => {
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

const handleDeleteTransaction =
async () => {
if (!transactionToDelete) return;

try {
setDeleting(true);
setDeleteError("");

await transactionService.deleteTransaction(
transactionToDelete._id
);

setShowDeleteModal(false);
setTransactionToDelete(null);

setActionSuccess(
"Transaction deleted successfully."
);

if (
transactions.length === 1 &&
page > 1
) {
setPage(
(current) => current - 1
);
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
const file =
event.target.files?.[0];

setImportError("");
setImportSuccess("");

if (!file) {
setSelectedFile(null);
return;
}

if (
!file.name
.toLowerCase()
.endsWith(".csv")
) {
setSelectedFile(null);
setImportError(
"Please select a CSV file."
);
return;
}

setSelectedFile(file);
};

const handleImportCSV = async () => {
if (!selectedFile) {
setImportError(
"Please select a CSV file."
);
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

setActionSuccess(
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

const getDateString = (date) => {
const year = date.getFullYear();
const month = String(
date.getMonth() + 1
).padStart(2, "0");
const day = String(
date.getDate()
).padStart(2, "0");

return `${year}-${month}-${day}`;
};

const applyDatePreset = (preset) => {
const today = new Date();
const todayString =
getDateString(today);

if (preset === "today") {
setStartDate(todayString);
setEndDate(todayString);
} else if (preset === "week") {
const start = new Date(today);
const day = start.getDay();
const diff =
day === 0 ? 6 : day - 1;

start.setDate(
start.getDate() - diff
);

setStartDate(
getDateString(start)
);

setEndDate(todayString);
} else if (preset === "month") {
setStartDate(
getDateString(
new Date(
today.getFullYear(),
today.getMonth(),
1
)
)
);

setEndDate(todayString);
} else if (
preset === "lastMonth"
) {
const start = new Date(
today.getFullYear(),
today.getMonth() - 1,
1
);

const end = new Date(
today.getFullYear(),
today.getMonth(),
0
);

setStartDate(
getDateString(start)
);

setEndDate(
getDateString(end)
);
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
const text = String(
value ?? ""
);

return `"${text.replace(
/"/g,
'""'
)}"`;
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
...filteredTransactions.map(
(transaction) => {
const category =
getCategory(transaction);

const contact =
getContact(transaction);

const type =
getTransactionType(
transaction
);

return [
formatDate(
transaction.transactionDate
),
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
}
),
];

const csv = rows
.map((row) =>
row
.map(escapeCsv)
.join(",")
)
.join("\n");

const blob = new Blob(
[csv],
{
type: "text/csv;charset=utf-8;",
}
);

const url =
URL.createObjectURL(blob);

const link =
document.createElement("a");

link.href = url;

link.download =
`transactions-${getToday()}.csv`;

document.body.appendChild(link);

link.click();

link.remove();

URL.revokeObjectURL(url);

setActionSuccess(
"Visible transactions exported successfully."
);
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

const incomeTransactions =
transactions.filter(
(transaction) =>
getTransactionType(
transaction
) === "income"
);

const expenseTransactions =
transactions.filter(
(transaction) =>
getTransactionType(
transaction
) === "expense"
);

const incomeTotal =
incomeTransactions.reduce(
(sum, transaction) =>
sum +
Number(
transaction.amount || 0
),
0
);

const expenseTotal =
expenseTransactions.reduce(
(sum, transaction) =>
sum +
Number(
transaction.amount || 0
),
0
);

const netTotal =
incomeTotal - expenseTotal;

const averageAmount =
transactions.length > 0
? transactions.reduce(
(sum, transaction) =>
sum +
Number(
transaction.amount || 0
),
0
) / transactions.length
: 0;

const filteredTransactions =
useMemo(() => {
const searchTerm =
search.trim().toLowerCase();

return transactions.filter(
(transaction) => {
const description =
transaction.description?.toLowerCase() ||
"";

const payment =
transaction.paymentMethod?.toLowerCase() ||
"";

const category =
getCategory(
transaction
)?.name?.toLowerCase() ||
"";

const contactName =
getContact(
transaction
)?.name?.toLowerCase() ||
"";

const type =
getTransactionType(
transaction
);

const matchesSearch =
!searchTerm ||
description.includes(
searchTerm
) ||
payment.includes(
searchTerm
) ||
category.includes(
searchTerm
) ||
contactName.includes(
searchTerm
);

const matchesType =
!transactionTypeFilter ||
type ===
transactionTypeFilter;

const matchesUnlinked =
!unlinkedOnly ||
!transaction.contactId;

return (
matchesSearch &&
matchesType &&
matchesUnlinked
);
}
);
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

filteredTransactions.forEach(
(transaction) => {
if (!transaction.transactionDate) {
return;
}

const key = getDateString(
new Date(
transaction.transactionDate
)
);

grouped[key] =
(grouped[key] || 0) + 1;
}
);

return Object.entries(grouped)
.sort(([a], [b]) =>
a.localeCompare(b)
)
.slice(-7)
.map(([date, count]) => ({
date,
label: new Date(
`${date}T00:00:00`
).toLocaleDateString(
"en-IN",
{
day: "2-digit",
month: "short",
}
),
count,
}));
}, [filteredTransactions]);

const maxActivity = Math.max(
1,
...activityData.map(
(item) => item.count
)
);

const paymentSummary = useMemo(() => {
return PAYMENT_METHODS.map(
({ value, label }) => ({
method: value,
label,
amount:
filteredTransactions.reduce(
(sum, transaction) => {
const transactionMethod =
String(
transaction.paymentMethod ||
"other"
).toLowerCase();

if (
transactionMethod !==
value
) {
return sum;
}

return (
sum +
Number(
transaction.amount ||
0
)
);
},
0
),
})
);
}, [filteredTransactions]);

const topExpenseCategories =
useMemo(() => {
const totals = {};

filteredTransactions.forEach(
(transaction) => {
if (
getTransactionType(
transaction
) !== "expense"
) {
return;
}

const category =
getCategory(
transaction
)?.name ||
"Uncategorized";

totals[category] =
(totals[category] || 0) +
Number(
transaction.amount || 0
);
}
);

return Object.entries(totals)
.sort(([, a], [, b]) =>
b - a
)
.slice(0, 4);
}, [
filteredTransactions,
categories,
]);

const hasActiveFilters = Boolean(
search ||
categoryId ||
contactId ||
paymentMethod ||
startDate ||
endDate ||
transactionTypeFilter ||
unlinkedOnly
);

const sortPreset =
`${sortBy}_${order}`;

const selectedCategory =
categories.find(
(category) =>
category._id ===
formData.categoryId
);

return (
<div className="space-y-6">

{actionSuccess && (
<div className="fixed right-5 top-5 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-500/20 bg-slate-900 px-4 py-3 shadow-2xl shadow-black/30">
<div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
✓
</div>

<p className="flex-1 text-sm text-slate-200">
{actionSuccess}
</p>

<button
type="button"
onClick={() =>
setActionSuccess("")
}
className="text-slate-500 hover:text-white"
aria-label="Dismiss notification"
>
<X size={16} />
</button>
</div>
)}

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

<Button
variant="secondary"
onClick={exportVisibleTransactions}
disabled={
filteredTransactions.length === 0
}
>
<Download
size={17}
className="mr-2"
/>
Export CSV
</Button>

<Button
variant="secondary"
onClick={handleOpenImportModal}
>
<Upload
size={17}
className="mr-2"
/>
Import CSV
</Button>

<Button
onClick={handleOpenAddModal}
>
<Plus
size={17}
className="mr-2"
/>
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
<Filter size={18} />
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

<ArrowUpRight
className="mt-1 text-emerald-400"
size={20}
/>
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

<ArrowDownRight
className="mt-1 text-red-400"
size={20}
/>
</div>
</Card>


<Card>
<div className="flex items-start justify-between gap-3">
<div>
<p className="text-sm text-slate-400">
Net
</p>

<p
className={`mt-2 font-['Space_Grotesk'] text-2xl font-semibold ${
netTotal >= 0
? "text-emerald-400"
: "text-red-400"
}`}
>
{netTotal >= 0 ? "+" : "-"}
{formatAmount(
Math.abs(netTotal)
)}
</p>

<p className="mt-1 text-xs text-slate-500">
Income − expenses on loaded results
</p>
</div>

<div
className={`rounded-lg p-2 ${
netTotal >= 0
? "bg-emerald-500/10 text-emerald-400"
: "bg-red-500/10 text-red-400"
}`}
>
<ArrowUpRight size={18} />
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

{activityData.length === 0 ? (
<div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
No activity to visualize.
</div>
) : (
<div className="flex h-full items-end gap-3">

{activityData.map(
(item) => (
<div
key={item.date}
className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
>

<div className="relative flex h-full w-full items-end justify-center">

<div
className="w-full max-w-10 rounded-t-md bg-indigo-500/60 transition group-hover:bg-indigo-400/80"
style={{
height: `${Math.max(
8,
(item.count /
maxActivity) *
100
)}%`,
}}
title={`${item.count} transaction${
item.count === 1
? ""
: "s"
}`}
/>

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

</div>
)
)}

</div>
)}

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
<span className="h-2 w-2 rounded-full bg-emerald-400" />
Income
</span>

<span className="flex items-center gap-1.5">
<span className="h-2 w-2 rounded-full bg-red-400" />
Expense
</span>

</div>
</div>


<div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">

<div
className="relative h-40 w-40 shrink-0 rounded-full"
style={{
background:
incomeTotal +
expenseTotal >
0
? `conic-gradient(#34d399 0deg ${(
(incomeTotal /
(incomeTotal +
expenseTotal)) *
360
).toFixed(
2
)}deg, #f87171 ${(
(incomeTotal /
(incomeTotal +
expenseTotal)) *
360
).toFixed(
2
)}deg 360deg)`
: "#1e293b",
}}
>

<div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-slate-900">

<span className="text-xs text-slate-500">
Net
</span>

<span
className={`mt-1 text-lg font-semibold ${
netTotal >= 0
? "text-emerald-400"
: "text-red-400"
}`}
>
{netTotal >= 0 ? "+" : "-"}
{formatAmount(
Math.abs(netTotal)
)}
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
{formatAmount(
incomeTotal
)}
</span>

</div>

<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

<div
className="h-full rounded-full bg-emerald-400"
style={{
width: `${
incomeTotal +
expenseTotal
? (incomeTotal /
(incomeTotal +
expenseTotal)) *
100
: 0
}%`,
}}
/>

</div>
</div>


<div>
<div className="flex items-center justify-between text-sm">

<span className="text-slate-400">
Expenses
</span>

<span className="font-medium text-red-400">
{formatAmount(
expenseTotal
)}
</span>

</div>

<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

<div
className="h-full rounded-full bg-red-400"
style={{
width: `${
incomeTotal +
expenseTotal
? (expenseTotal /
(incomeTotal +
expenseTotal)) *
100
: 0
}%`,
}}
/>

</div>
</div>


<div className="border-t border-slate-800 pt-3 text-xs text-slate-500">

Average transaction:

<span className="text-slate-300">
{" "}
{formatAmount(
averageAmount
)}
</span>

</div>

</div>
</div>
</Card>

</div>


<Card>
<div className="flex flex-col gap-4">

<div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_200px_auto]">

<div className="relative">

<Search
size={18}
className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
/>

<Input
name="transaction-search"
value={search}
onChange={handleSearchChange}
placeholder="Search description, contact or category"
className="pl-10"
/>

</div>


<Select
name="type-filter"
value={transactionTypeFilter}
onChange={(event) => {
setTransactionTypeFilter(
event.target.value
);
setPage(1);
}}
options={TYPE_FILTER_OPTIONS}
placeholder="All types"
/>


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


<Button
variant="secondary"
onClick={() =>
setMoreFiltersOpen(
(current) => !current
)
}
className="justify-center"
>
<SlidersHorizontal
size={17}
className="mr-2"
/>
More Filters
</Button>

</div>


<div className="flex flex-wrap gap-2">

<button
type="button"
onClick={() => {
setTransactionTypeFilter("");
setUnlinkedOnly(false);
setPage(1);
}}
className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
!transactionTypeFilter &&
!unlinkedOnly
? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
: "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
}`}
>
All
</button>


<button
type="button"
onClick={() =>
handleTypeFilterChange(
"income"
)
}
className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
transactionTypeFilter ===
"income"
? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
: "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
}`}
>
Income
</button>


<button
type="button"
onClick={() =>
handleTypeFilterChange(
"expense"
)
}
className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
transactionTypeFilter ===
"expense"
? "border-red-500/40 bg-red-500/10 text-red-300"
: "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
}`}
>
Expense
</button>


<button
type="button"
onClick={
handleUnlinkedFilterChange
}
className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
unlinkedOnly
? "border-amber-500/40 bg-amber-500/10 text-amber-300"
: "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
}`}
>
Unlinked contact
</button>

</div>


{moreFiltersOpen && (
<div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

<Select
name="contact-filter"
value={contactId}
onChange={
handleContactFilterChange
}
options={contacts.map(
(contact) => ({
value: contact._id,
label: `${contact.name} (${contact.contactType})`,
})
)}
placeholder={
contactsLoading
? "Loading contacts..."
: "All contacts"
}
disabled={contactsLoading}
/>


<Select
name="payment-method-filter"
value={paymentMethod}
onChange={
handlePaymentMethodChange
}
options={PAYMENT_METHODS}
placeholder="All payment methods"
/>


<Input
label="Start Date"
name="start-date"
type="date"
value={startDate}
onChange={
handleStartDateChange
}
/>


<Input
label="End Date"
name="end-date"
type="date"
value={endDate}
onChange={
handleEndDateChange
}
/>

</div>


<div className="mt-4 flex flex-wrap gap-2">

<span className="mr-1 self-center text-xs text-slate-500">
Quick date:
</span>

<button
type="button"
onClick={() =>
applyDatePreset(
"today"
)
}
className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white"
>
Today
</button>

<button
type="button"
onClick={() =>
applyDatePreset(
"week"
)
}
className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white"
>
This week
</button>

<button
type="button"
onClick={() =>
applyDatePreset(
"month"
)
}
className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white"
>
This month
</button>

<button
type="button"
onClick={() =>
applyDatePreset(
"lastMonth"
)
}
className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white"
>
Last month
</button>

</div>


<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

<Select
name="sort-preset"
label="Sort"
value={sortPreset}
onChange={
handleSortPresetChange
}
options={SORT_PRESET_OPTIONS}
/>


<div>

<label className="mb-2 block text-sm font-medium text-slate-300">
Rows per page
</label>

<Select
name="page-size"
value={String(pageSize)}
onChange={
handlePageSizeChange
}
options={PAGE_SIZE_OPTIONS}
placeholder="Rows per page"
/>

</div>
</div>
</div>
)}


{hasActiveFilters && (
<div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3">

<span className="text-xs font-medium text-slate-500">
Active filters:
</span>

{search && (
<button
type="button"
onClick={() =>
setSearch("")
}
className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
>
Search: {search}
<X size={12} />
</button>
)}


{transactionTypeFilter && (
<button
type="button"
onClick={() =>
setTransactionTypeFilter("")
}
className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs capitalize text-slate-300"
>
{transactionTypeFilter}
<X size={12} />
</button>
)}


{categoryId && (
<button
type="button"
onClick={() => {
setCategoryId("");
setPage(1);
}}
className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
>
{categories.find(
(category) =>
category._id ===
categoryId
)?.name || "Category"}
<X size={12} />
</button>
)}


{contactId && (
<button
type="button"
onClick={() => {
setContactId("");
setPage(1);
}}
className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
>
{contacts.find(
(contact) =>
contact._id === contactId
)?.name || "Contact"}
<X size={12} />
</button>
)}


{paymentMethod && (
<button
type="button"
onClick={() => {
setPaymentMethod("");
setPage(1);
}}
className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs capitalize text-slate-300"
>
{paymentMethod}
<X size={12} />
</button>
)}


{startDate && (
<span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
From {startDate}
</span>
)}


{endDate && (
<span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
To {endDate}
</span>
)}


{unlinkedOnly && (
<button
type="button"
onClick={() =>
setUnlinkedOnly(false)
}
className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
>
Unlinked contact
<X size={12} />
</button>
)}


<button
type="button"
onClick={resetFilters}
className="ml-auto text-xs font-medium text-indigo-400 hover:text-indigo-300"
>
Clear all
</button>

</div>
)}

</div>
</Card>


{error && (
<Card>
<div className="text-center">

<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
<RefreshCw size={18} />
</div>

<p className="mt-3 text-sm text-red-400">
{error}
</p>

<Button
variant="secondary"
size="sm"
className="mt-4"
onClick={
fetchTransactions
}
>
Try Again
</Button>

</div>
</Card>
)}


{!loading &&
filteredTransactions.length >
0 && (
<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

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

{topExpenseCategories.length === 0 ? (
<p className="py-4 text-sm text-slate-500">
No expense categories to show.
</p>
) : (
topExpenseCategories.map(
([name, amount]) => {
const max =
topExpenseCategories[0][1] ||
1;

return (
<div key={name}>

<div className="flex items-center justify-between gap-3 text-sm">

<button
type="button"
onClick={() => {
const found =
categories.find(
(category) =>
category.name ===
name
);

if (found) {
setCategoryId(
found._id
);

setPage(1);
}
}}
className="truncate text-left text-slate-300 hover:text-white"
>
{name}
</button>

<span className="shrink-0 font-medium text-red-400">
{formatAmount(
amount
)}
</span>

</div>

<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

<div
className="h-full rounded-full bg-red-400/70"
style={{
width: `${
(amount / max) *
100
}%`,
}}
/>

</div>
</div>
);
}
)
)}

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

{paymentSummary.length === 0 ? (
<p className="py-4 text-sm text-slate-500">
No payment data to show.
</p>
) : (
paymentSummary
.filter(
({ amount }) =>
amount > 0
)
.slice(0, 4)
.map(
({
method,
label,
amount,
}) => (
<div
key={method}
className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"
>

<p className="text-xs text-slate-500">
{label}
</p>

<p className="mt-1 font-semibold text-white">
{formatAmount(
amount
)}
</p>

</div>
)
)
)}

</div>
</Card>

</div>
)}


{loading ? (
<Card>
<div className="space-y-3 py-4">

{[1, 2, 3, 4].map(
(item) => (
<div
key={item}
className="h-14 animate-pulse rounded-lg bg-slate-800/60"
/>
)
)}

</div>
</Card>
) : filteredTransactions.length ===
0 ? (
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
onClick={
resetFilters
}
>
Clear Filters
</Button>
) : (
<Button
onClick={
handleOpenAddModal
}
>
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

<div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">

<div>

<p className="text-sm font-medium text-white">
Transaction list
</p>

<p className="mt-1 text-xs text-slate-500">

Showing{" "}
{filteredTransactions.length}
{" "}
loaded result
{filteredTransactions.length ===
1
? ""
: "s"}

{totalTransactions >
pageSize
? ` · ${totalTransactions} total`
: ""}

</p>

</div>


<button
type="button"
onClick={
fetchTransactions
}
className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:text-white"
title="Refresh transactions"
>
<RefreshCw size={14} />
Refresh
</button>

</div>


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

{filteredTransactions.map(
(transaction) => {

const category =
getCategory(
transaction
);

const contact =
getContact(
transaction
);

const isIncome =
getTransactionType(
transaction
) ===
"income";

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
size={17}
/>
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
<Eye size={17} />
</button>


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
}
)}

</tbody>

</table>

</div>


<div className="space-y-3 md:hidden">

{filteredTransactions.map(
(transaction) => {

const category =
getCategory(
transaction
);

const contact =
getContact(
transaction
);

const isIncome =
getTransactionType(
transaction
) === "income";

return (
<div
key={
transaction._id
}
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
{formatAmount(
transaction.amount
)}
</p>

</div>


<div className="mt-4 flex flex-wrap items-center gap-2">

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


{contact && (
<span className="text-xs text-slate-400">
{contact.name}
</span>
)}

</div>


<div className="mt-4 flex justify-end gap-1 border-t border-slate-800 pt-3">

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


<button
type="button"
onClick={() =>
handleOpenDeleteModal(
transaction
)
}
className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
title="Delete"
>
<Trash2 size={16} />
</button>

</div>

</div>
);
}
)}

</div>

</Card>


{pagination && (
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

<div className="text-sm text-slate-500">

Showing{" "}
{Math.min(
(currentPage - 1) *
pageSize +
1,
totalTransactions
)}
–
{Math.min(
currentPage *
pageSize,
totalTransactions
)}
{" "}
of{" "}
{totalTransactions}
transactions

</div>


<div className="flex flex-wrap items-center justify-end gap-2">

<Select
name="page-size-bottom"
value={String(pageSize)}
onChange={
handlePageSizeChange
}
options={
PAGE_SIZE_OPTIONS
}
/>


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
<ChevronRight
size={15}
className="ml-1"
/>
</Button>

</div>

</div>
)}

</>
)}


{/* =========================================================
    ADD TRANSACTION
    ========================================================= */}

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


{/* =========================================================
    QUICK CONTACT
    ========================================================= */}

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


{/* =========================================================
    VIEW TRANSACTION
    ========================================================= */}

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


{/* =========================================================
    EDIT TRANSACTION
    ========================================================= */}

<Modal
isOpen={showEditModal}
onClose={handleCloseEditModal}
title="Edit Transaction"
>

<form
onSubmit={
handleUpdateTransaction
}
className="space-y-4"
>

{editSubmitError && (
<div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
{editSubmitError}
</div>
)}


<Input
label="Amount"
name="amount"
type="number"
value={
editFormData.amount
}
onChange={
handleEditFormChange
}
placeholder="Enter amount"
error={
editFormErrors.amount
}
/>


<Select
label="Category"
name="categoryId"
value={
editFormData.categoryId
}
onChange={
handleEditFormChange
}
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
disabled={
categoriesLoading
}
error={
editFormErrors.categoryId
}
/>


<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

<Select
label="Payment Method"
name="paymentMethod"
value={
editFormData.paymentMethod
}
onChange={
handleEditFormChange
}
placeholder="Select payment method"
options={
PAYMENT_METHODS
}
error={
editFormErrors.paymentMethod
}
/>


<div>

<Input
label="Transaction Date"
name="transactionDate"
type="date"
value={
editFormData.transactionDate
}
onChange={
handleEditFormChange
}
/>

{editFormErrors.transactionDate && (
<p className="mt-1 text-xs text-red-400">
{editFormErrors.transactionDate}
</p>
)}

</div>

</div>


{/* SEARCHABLE CONTACT SELECTOR */}

<ContactSelector
contacts={contacts}
value={
editFormData.contactId
}
onChange={
handleEditFormChange
}
loading={
contactsLoading
}
placeholder="No contact / select contact"
error={
editFormErrors.contactId
}
/>


<Input
label="Description"
name="description"
value={
editFormData.description
}
onChange={
handleEditFormChange
}
placeholder="What was this transaction for?"
error={
editFormErrors.description
}
/>


<div className="flex justify-end gap-3 border-t border-slate-800 pt-4">

<Button
type="button"
variant="secondary"
onClick={
handleCloseEditModal
}
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


{/* =========================================================
    DELETE TRANSACTION
    ========================================================= */}

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


{/* =========================================================
    IMPORT CSV
    ========================================================= */}

<Modal
isOpen={showImportModal}
onClose={
handleCloseImportModal
}
title="Import Transactions"
>

<div className="space-y-5">

<div>

<p className="text-sm text-slate-300">
Upload a CSV file to import multiple transactions at once.
</p>

<p className="mt-2 text-xs text-slate-500">
Required columns: date, type, amount, category, description. Contact is optional.
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
onChange={
handleFileChange
}
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
{(
selectedFile.size / 1024
).toFixed(1)} KB
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
onClick={
handleCloseImportModal
}
disabled={importing}
>
Close
</Button>


<Button
onClick={
handleImportCSV
}
disabled={
!selectedFile ||
importing
}
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