import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

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

export default ContactSelector;
