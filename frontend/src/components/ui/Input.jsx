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
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="mb-2 block text-sm font-medium text-slate-300"
                >
                    {label}
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
                className={`w-full rounded-lg border bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 ${
                    error
                        ? "border-red-500 focus:border-red-400"
                        : "border-slate-700 focus:border-indigo-500"
                } ${className}`}
            />

            {error && (
                <p className="mt-1.5 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;

