import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

import contactService from "../services/contactService";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const initialForm = {
    name: "",
    contactType: "",
    phone: "",
    email: "",
    address: "",
};

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [contactType, setContactType] = useState("");

    const [modalType, setModalType] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);

    const [formData, setFormData] = useState(initialForm);
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitError, setFormSubmitError] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const loadContacts = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (contactType) {
                params.contactType = contactType;
            }

            const data = await contactService.getContacts(params);

            setContacts(Array.isArray(data) ? data : []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to load contacts."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, [contactType]);

    const filteredContacts = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return contacts;
        }

        return contacts.filter((contact) =>
            [
                contact.name,
                contact.phone,
                contact.email,
                contact.address,
                contact.contactType,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value)
                        .toLowerCase()
                        .includes(searchValue)
                )
        );
    }, [contacts, search]);

    const openAddModal = () => {
        setFormData(initialForm);
        setFormErrors({});
        setFormSubmitError("");
        setSelectedContact(null);
        setModalType("add");
    };

    const openViewModal = (contact) => {
        setSelectedContact(contact);
        setModalType("view");
    };

    const openEditModal = (contact) => {
        setSelectedContact(contact);

        setFormData({
            name: contact.name || "",
            contactType: contact.contactType || "",
            phone: contact.phone || "",
            email: contact.email || "",
            address: contact.address || "",
        });

        setFormErrors({});
        setFormSubmitError("");
        setModalType("edit");
    };

    const openDeleteModal = (contact) => {
        setSelectedContact(contact);
        setModalType("delete");
    };

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setModalType(null);
        setSelectedContact(null);
        setFormData(initialForm);
        setFormErrors({});
        setFormSubmitError("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setFormSubmitError("");
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = "Contact name is required.";
        }

        if (!formData.contactType) {
            errors.contactType = "Contact type is required.";
        }

        if (
            formData.phone &&
            !/^[0-9]{10}$/.test(formData.phone)
        ) {
            errors.phone =
                "Phone number must contain exactly 10 digits.";
        }

        if (
            formData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            errors.email =
                "Please provide a valid email address.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormSubmitError("");
        setError("");

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                name: formData.name.trim(),
                contactType: formData.contactType,
            };

            if (formData.phone.trim()) {
                payload.phone = formData.phone.trim();
            }

            if (formData.email.trim()) {
                payload.email = formData.email.trim();
            }

            if (formData.address.trim()) {
                payload.address = formData.address.trim();
            }

            if (modalType === "add") {
                await contactService.createContact(payload);

                setSuccessMessage(
                    "Contact created successfully."
                );
            } else {
                await contactService.updateContact(
                    selectedContact._id,
                    payload
                );

                setSuccessMessage(
                    "Contact updated successfully."
                );
            }

            closeModal();
            await loadContacts();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setFormSubmitError(
                error.response?.data?.message ||
                    "Unable to save contact."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedContact) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccessMessage("");

            await contactService.deleteContact(
                selectedContact._id
            );

            closeModal();
            await loadContacts();

            setSuccessMessage(
                "Contact deleted successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to delete contact."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const typeOptions = [
        {
            value: "customer",
            label: "Customer",
        },
        {
            value: "supplier",
            label: "Supplier",
        },
    ];

    const columns = [
        {
            key: "name",
            label: "Name",
        },
        {
            key: "contactType",
            label: "Type",
            render: (contact) => (
                <Badge
                    variant={
                        contact.contactType === "customer"
                            ? "info"
                            : "warning"
                    }
                >
                    {contact.contactType
                        ? contact.contactType
                              .charAt(0)
                              .toUpperCase() +
                          contact.contactType.slice(1)
                        : "—"}
                </Badge>
            ),
        },
        {
            key: "phone",
            label: "Phone",
            render: (contact) => (
                <span className="text-slate-400">
                    {contact.phone || "—"}
                </span>
            ),
        },
        {
            key: "email",
            label: "Email",
            render: (contact) => (
                <span className="text-slate-400">
                    {contact.email || "—"}
                </span>
            ),
        },
        {
            key: "address",
            label: "Address",
            render: (contact) => (
                <span className="block max-w-56 truncate text-slate-400">
                    {contact.address || "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (contact) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            openViewModal(contact)
                        }
                        aria-label="View contact"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            openEditModal(contact)
                        }
                        aria-label="Edit contact"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            openDeleteModal(contact)
                        }
                        aria-label="Delete contact"
                    >
                        <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-indigo-400">
                        Workspace
                    </p>

                    <h1 className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                        Contacts
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Manage your customers and suppliers.
                    </p>
                </div>

                <Button
                    onClick={openAddModal}
                    className="w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                </Button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {successMessage}
                </div>
            )}

            {/* General Error */}
            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Filters */}
            <Card>
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search contacts..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                        />
                    </div>

                    <Select
                        name="contactTypeFilter"
                        value={contactType}
                        onChange={(event) =>
                            setContactType(event.target.value)
                        }
                        options={typeOptions}
                        placeholder="All contact types"
                    />
                </div>
            </Card>

            {/* Contacts */}
            <Card>
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <EmptyState
                        title={
                            search || contactType
                                ? "No contacts found"
                                : "No contacts yet"
                        }
                        description={
                            search || contactType
                                ? "Try changing your search or filter."
                                : "Add your first customer or supplier to get started."
                        }
                        action={
                            !search && !contactType ? (
                                <Button
                                    onClick={openAddModal}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Contact
                                </Button>
                            ) : null
                        }
                    />
                ) : (
                    <Table
                        columns={columns}
                        data={filteredContacts}
                    />
                )}
            </Card>

            {/* Add / Edit Modal */}
            {(modalType === "add" ||
                modalType === "edit") && (
                <Modal
                    isOpen
                    onClose={closeModal}
                    title={
                        modalType === "add"
                            ? "Add Contact"
                            : "Edit Contact"
                    }
                >
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {/* API error inside modal */}
                        {formSubmitError && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {formSubmitError}
                            </div>
                        )}

                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter contact name"
                            error={formErrors.name}
                            required
                        />

                        <Select
                            label="Contact Type"
                            name="contactType"
                            value={formData.contactType}
                            onChange={handleChange}
                            options={typeOptions}
                            placeholder="Select contact type"
                            error={formErrors.contactType}
                            required
                        />

                        <Input
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit phone number"
                            error={formErrors.phone}
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            error={formErrors.email}
                        />

                        <div>
                            <label
                                htmlFor="address"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Address
                            </label>

                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={closeModal}
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
                                    : modalType === "add"
                                    ? "Add Contact"
                                    : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View Modal */}
            {modalType === "view" &&
                selectedContact && (
                    <Modal
                        isOpen
                        onClose={closeModal}
                        title="Contact Details"
                    >
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Name
                                </p>

                                <p className="mt-1 text-base font-medium text-white">
                                    {selectedContact.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Contact Type
                                </p>

                                <div className="mt-2">
                                    <Badge
                                        variant={
                                            selectedContact.contactType ===
                                            "customer"
                                                ? "info"
                                                : "warning"
                                        }
                                    >
                                        {selectedContact.contactType
                                            ? selectedContact.contactType
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              selectedContact.contactType.slice(
                                                  1
                                              )
                                            : "—"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm text-slate-300">
                                        {selectedContact.phone ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm text-slate-300">
                                        {selectedContact.email ||
                                            "—"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Address
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                                    {selectedContact.address ||
                                        "—"}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="secondary"
                                    onClick={closeModal}
                                >
                                    Close
                                </Button>

                                <Button
                                    onClick={() =>
                                        openEditModal(
                                            selectedContact
                                        )
                                    }
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

            {/* Delete Modal */}
            {modalType === "delete" &&
                selectedContact && (
                    <Modal
                        isOpen
                        onClose={closeModal}
                        title="Delete Contact"
                    >
                        <div className="space-y-5">
                            <p className="text-sm leading-6 text-slate-400">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-white">
                                    {selectedContact.name}
                                </span>
                                ? This contact will no longer
                                appear in your active contacts.
                            </p>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={handleDelete}
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Deleting..."
                                        : "Delete Contact"}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
        </div>
    );
};

export default Contacts;

