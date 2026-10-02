const Badge = ({
    children,
    variant = "default",
    className = "",
}) => {
    const variants = {
        default:
            "border border-slate-700/80 bg-slate-800/80 text-slate-300",
        success:
            "border border-emerald-400/15 bg-emerald-500/10 text-emerald-400",
        danger:
            "border border-red-400/15 bg-red-500/10 text-red-400",
        warning:
            "border border-amber-400/15 bg-amber-500/10 text-amber-400",
        info:
            "border border-blue-400/15 bg-blue-500/10 text-blue-400",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-4 transition-colors duration-150 ${
                variants[variant] || variants.default
            } ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;