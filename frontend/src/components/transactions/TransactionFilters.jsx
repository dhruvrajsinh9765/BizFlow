import { Search, SlidersHorizontal, X } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

const TransactionFilters = ({
    search,
    handleSearchChange,
    transactionTypeFilter,
    setTransactionTypeFilter,
    setPage,
    categoryId,
    handleCategoryChange,
    categories,
    categoriesLoading,
    setMoreFiltersOpen,
    moreFiltersOpen,
    handleTypeFilterChange,
    unlinkedOnly,
    handleUnlinkedFilterChange,
    contactId,
    handleContactFilterChange,
    contacts,
    contactsLoading,
    paymentMethod,
    handlePaymentMethodChange,
    paymentMethods,
    startDate,
    handleStartDateChange,
    endDate,
    handleEndDateChange,
    applyDatePreset,
    sortPreset,
    handleSortPresetChange,
    sortPresetOptions,
    pageSize,
    handlePageSizeChange,
    pageSizeOptions,
    hasActiveFilters,
    resetFilters,
    typeFilterOptions,
}) => (
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

options={typeFilterOptions}

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

options={paymentMethods}

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

options={sortPresetOptions}

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

options={pageSizeOptions}

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
);

export default TransactionFilters;
