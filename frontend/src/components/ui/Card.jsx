const Card = ({
    children,
    title,
    description,
    className = "",
}) => {
    return (
        <div
            className={`rounded-xl border border-slate-800 bg-slate-900 p-5 ${className}`}
        >
            {(title || description) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                            {title}
                        </h3>
                    )}

                    {description && (
                        <p className="mt-1 text-sm text-slate-400">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {children}
        </div>
    );
};

export default Card;

