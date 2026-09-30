const Badge = ({
    children,
    variant = "default",
    className = "",
}) => {
    const variants = {
        default:
            "bg-slate-800 text-slate-300",
        success:
            "bg-emerald-500/10 text-emerald-400",
        danger:
            "bg-red-500/10 text-red-400",
        warning:
            "bg-amber-500/10 text-amber-400",
        info:
            "bg-blue-500/10 text-blue-400",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;

