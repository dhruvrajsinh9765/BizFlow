import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Mail,
    MapPin,
    Phone,
    Sparkles,
} from "lucide-react";
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
        <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
            {/* Ambient background */}
            <div
                className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-violet-600/5 blur-3xl"
                aria-hidden="true"
            />

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
                <div className="w-full">
                    {/* Brand + Heading */}
                    <div className="mb-8 text-center">
                        <div className="mb-5 inline-flex items-center gap-2.5">
                            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/30 ring-1 ring-white/10">
                                <span className="font-['Space_Grotesk'] text-base font-bold tracking-[-0.04em] text-white">
                                    B
                                </span>
                            </div>

                            <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.025em] text-slate-100">
                                BizFlow
                            </span>
                        </div>

                        <div>
                            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-indigo-400/15 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                                <Sparkles size={13} />
                                One last step
                            </div>

                            <h1 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                Set up your business
                            </h1>

                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                                Tell us a little about your business so BizFlow
                                can organize your finances around the way you
                                work.
                            </p>
                        </div>
                    </div>

                    {/* Setup Card */}
                    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/85 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[0.85fr_1.5fr]">
                        {/* Side Panel */}
                        <div className="hidden border-r border-slate-800/90 bg-slate-950/35 p-8 lg:flex lg:flex-col">
                            <div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-400">
                                    <Building2
                                        size={22}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <h2 className="mt-6 font-['Space_Grotesk'] text-xl font-semibold tracking-[-0.02em] text-slate-100">
                                    Your business profile
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    These details help keep your business
                                    information organized inside BizFlow.
                                </p>
                            </div>

                            <div className="mt-auto space-y-5 pt-10">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0 text-emerald-400"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            Quick setup
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Only the essential information is
                                            needed to get started.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0 text-emerald-400"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            Stay organized
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Your business details stay together
                                            with your financial workspace.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0 text-emerald-400"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            Update anytime
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            You can change your business
                                            information later from Settings.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-6 sm:p-8">
                            <div className="mb-7">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    Business details
                                </p>

                                <h2 className="mt-2 font-['Space_Grotesk'] text-xl font-semibold tracking-[-0.02em] text-slate-100">
                                    Business information
                                </h2>

                                <p className="mt-1.5 text-sm text-slate-400">
                                    Enter your business details below.
                                </p>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-500/10 px-4 py-3.5"
                                >
                                    <div
                                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400"
                                        aria-hidden="true"
                                    />

                                    <p className="text-sm leading-5 text-red-300">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {/* Business Name + Type */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="businessName"
                                            className="mb-2 block text-sm font-medium text-slate-300"
                                        >
                                            Business Name
                                            <span
                                                className="ml-1 text-red-400"
                                                aria-hidden="true"
                                            >
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">
                                            <Building2
                                                size={17}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                                            />

                                            <input
                                                id="businessName"
                                                name="businessName"
                                                type="text"
                                                value={
                                                    formData.businessName
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. Acme Traders"
                                                required
                                                autoComplete="organization"
                                                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="businessType"
                                            className="mb-2 block text-sm font-medium text-slate-300"
                                        >
                                            Business Type
                                            <span
                                                className="ml-1 text-red-400"
                                                aria-hidden="true"
                                            >
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">
                                            <Building2
                                                size={17}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                                            />

                                            <input
                                                id="businessType"
                                                name="businessType"
                                                type="text"
                                                value={
                                                    formData.businessType
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. Retail, Services"
                                                required
                                                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <div className="mb-4 border-b border-slate-800/80 pb-3">
                                        <h3 className="text-sm font-semibold text-slate-200">
                                            Contact information
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Optional details for your business
                                            profile.
                                        </p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {/* Phone */}
                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="mb-2 block text-sm font-medium text-slate-300"
                                            >
                                                Phone
                                            </label>

                                            <div className="relative">
                                                <Phone
                                                    size={17}
                                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                                                />

                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="10-digit phone number"
                                                    maxLength={10}
                                                    inputMode="numeric"
                                                    autoComplete="tel"
                                                    className="w-full rounded-xl border border-slate-700/90 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-medium text-slate-300"
                                            >
                                                Business Email
                                            </label>

                                            <div className="relative">
                                                <Mail
                                                    size={17}
                                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                                                />

                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="business@example.com"
                                                    autoComplete="email"
                                                    className="w-full rounded-xl border border-slate-700/90 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label
                                        htmlFor="address"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        Business Address
                                    </label>

                                    <div className="relative">
                                        <MapPin
                                            size={17}
                                            className="pointer-events-none absolute left-3.5 top-3.5 text-slate-600"
                                        />

                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter your business address"
                                            rows={3}
                                            autoComplete="street-address"
                                            className="w-full resize-none rounded-xl border border-slate-700/90 bg-slate-950/80 py-3 pl-10 pr-4 text-sm leading-6 text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="border-t border-slate-800/80 pt-5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 transition-all duration-200 hover:border-indigo-300/30 hover:bg-indigo-400 hover:shadow-indigo-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
                                    >
                                        {loading ? (
                                            <>
                                                <span
                                                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                                    aria-hidden="true"
                                                />
                                                Creating business...
                                            </>
                                        ) : (
                                            <>
                                                Create Business
                                                <ArrowRight
                                                    size={17}
                                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                                />
                                            </>
                                        )}
                                    </button>

                                    <p className="mt-3 text-center text-xs text-slate-600">
                                        You can update your business details
                                        later from Settings.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessSetup;
