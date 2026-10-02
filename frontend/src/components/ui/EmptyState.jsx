import { Inbox } from "lucide-react";

const EmptyState = ({
    title = "No data found",
    description = "",
    action = null,
}) => {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/70 text-slate-400 shadow-sm">
                <Inbox size={25} strokeWidth={1.8} />
            </div>

            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-slate-100">
                {title}
            </h3>

            {description && (
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;