// Header for the Analytics page and period selector.
// The parent keeps the selected period state so the existing data-fetching logic stays unchanged.
const AnalyticsHeader = ({
    selectedPeriod,
    setSelectedPeriod,
    periods,
}) => {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <div className="mb-2 text-sm text-slate-500">
                    Workspace / Analytics
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-white">
                    Analytics
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Go beyond totals and understand movement behind your numbers.
                </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
                {periods.map((period) => (
                    <button
                        key={period}
                        type="button"
                        onClick={() => setSelectedPeriod(period)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            selectedPeriod === period
                                ? "bg-indigo-600 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        {period}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsHeader;