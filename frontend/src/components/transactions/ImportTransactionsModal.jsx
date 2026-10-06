import Button from "../ui/Button";
import Modal from "../ui/Modal";

const ImportTransactionsModal = ({
    showImportModal,
    handleCloseImportModal,
    handleFileChange,
    selectedFile,
    importing,
    importError,
    importSuccess,
    handleImportCSV,
}) => {
    return (
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
    );
};

export default ImportTransactionsModal;
