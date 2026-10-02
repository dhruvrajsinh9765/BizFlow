const Card = ({
    children,
    title,
    description,
    className = "",
}) => {
    return (
        <div
            className={`rounded-xl border border-slate-800/90 bg-slate-900/80 p-5 shadow-sm shadow-black/20 backdrop-blur-sm transition-colors duration-200 ${className}`}
        >
            {(title || description) && (
                <div className="mb-5">
                    {title && (
                        <h3 className="font-['Space_Grotesk'] text-lg font-semibold tracking-[-0.01em] text-slate-100">
                            {title}
                        </h3>
                    )}

                    {description && (
                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
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