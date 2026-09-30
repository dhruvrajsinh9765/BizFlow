import { useState } from "react";
import { useNavigate } from "react-router-dom";
import businessService from "../services/businessService";

const BusinessSetup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        businessName: "",
        businessType: "",
        phone: "",
        email: "",
        address: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.businessName.trim()) {
            setError("Business name is required.");
            return;
        }

        if (!formData.businessType.trim()) {
            setError("Business type is required.");
            return;
        }

        if (
            formData.phone &&
            !/^[0-9]{10}$/.test(formData.phone)
        ) {
            setError("Phone number must contain exactly 10 digits.");
            return;
        }

        setLoading(true);

        try {
            await businessService.createBusiness({
                businessName: formData.businessName,
                businessType: formData.businessType,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                address: formData.address || undefined,
            });

            navigate("/overview", { replace: true });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to create business profile."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
            <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white">
                        BizFlow
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Let's set up your business
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
                    <div className="mb-6">
                        <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
                            Create your business profile
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Add your business details to start using BizFlow.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="businessName"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Business Name
                            </label>

                            <input
                                id="businessName"
                                name="businessName"
                                type="text"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="Enter your business name"
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="businessType"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Business Type
                            </label>

                            <input
                                id="businessType"
                                name="businessType"
                                type="text"
                                value={formData.businessType}
                                onChange={handleChange}
                                placeholder="e.g. Retail, Restaurant, Services"
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit phone number"
                                    maxLength={10}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Business Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="business@example.com"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                                />
                            </div>
                        </div>

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
                                placeholder="Enter your business address"
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-indigo-500 px-4 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Creating Business..."
                                : "Create Business"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessSetup;