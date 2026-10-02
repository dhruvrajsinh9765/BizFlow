const Button = ({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    onClick,
    disabled = false,
    className = "",
}) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
        primary:
            "border border-indigo-400/20 bg-indigo-500 text-white shadow-sm shadow-indigo-950/30 hover:border-indigo-300/30 hover:bg-indigo-400 hover:shadow-md hover:shadow-indigo-950/40",
        secondary:
            "border border-slate-700 bg-slate-900 text-slate-200 shadow-sm hover:border-slate-600 hover:bg-slate-800 hover:text-white",
        danger:
            "border border-red-400/20 bg-red-500 text-white shadow-sm shadow-red-950/20 hover:border-red-300/30 hover:bg-red-400 hover:shadow-md",
        ghost:
            "border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-white",
    };

    const sizes = {
        sm: "min-h-9 px-3 py-2 text-sm",
        md: "min-h-10 px-4 py-2.5 text-sm",
        lg: "min-h-11 px-5 py-3 text-base",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;