import { Inbox } from "lucide-react";

const EmptyState = ({
    title = "No data found",
    description = "",
    action = null,
}) => {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <Inbox size={24} />
            </div>

            <h3 className="text-base font-semibold text-white">
                {title}
            </h3>

            {description && (
                <p className="mt-2 max-w-md text-sm text-slate-500">
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

