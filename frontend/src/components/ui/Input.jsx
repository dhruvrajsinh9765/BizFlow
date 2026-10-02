const Input = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    error = "",
    disabled = false,
    required = false,
    className = "",
}) => {
    const errorId = `${name}-error`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="mb-2 block text-sm font-medium text-slate-300"
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-red-400" aria-hidden="true">
                            *
                        </span>
                    )}
                </label>
            )}

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className={`w-full rounded-lg border bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/60 disabled:opacity-60 ${
                    error
                        ? "border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/10"
                        : "border-slate-700/90 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                } ${className}`}
            />

            {error && (
                <p
                    id={errorId}
                    className="mt-1.5 text-sm leading-5 text-red-400"
                >
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;