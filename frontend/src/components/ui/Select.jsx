const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
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

            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`w-full rounded-lg border bg-slate-950 px-4 py-3 text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    error
                        ? "border-red-500 focus:border-red-400"
                        : "border-slate-700 focus:border-indigo-500"
                } ${className}`}
            >
                <option value="">
                    {placeholder}
                </option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="mt-1.5 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Select;

