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
        "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
        primary:
            "bg-indigo-500 text-white hover:bg-indigo-400",
        secondary:
            "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800",
        danger:
            "bg-red-500 text-white hover:bg-red-400",
        ghost:
            "text-slate-400 hover:bg-slate-800 hover:text-white",
    };

    const sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-5 py-3 text-base",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;

