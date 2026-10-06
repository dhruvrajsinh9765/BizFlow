import Card from "../ui/Card";

// Displays transaction activity metrics and payment-method distribution.
const AnalyticsActivity = ({
    selectedPeriod,
    activityMetrics,
    paymentSummary,
    totalIncome,
    totalExpense,
    formatNumber,
    formatCurrency,
}) => (
<div className="grid gap-6 xl:grid-cols-2">
                <Card>
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Transaction activity
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Activity generated during the selected period
                            </p>
                        </div>
                        <span className="rounded-md border border-slate-800 px-2 py-1 text-[11px] text-slate-500">
                            {selectedPeriod}
                        </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                            <p className="text-xs text-slate-500">Transactions</p>
                            <p className="mt-2 text-xl font-semibold text-white">
                                {formatNumber(activityMetrics.count)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                            <p className="text-xs text-slate-500">Average transaction</p>
                            <p className="mt-2 text-xl font-semibold text-white">
                                {formatCurrency(activityMetrics.average)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                            <p className="text-xs text-slate-500">Largest transaction</p>
                            <p className="mt-2 text-xl font-semibold text-white">
                                {formatCurrency(activityMetrics.largestAmount)}
                            </p>
                            <p className="mt-1 text-[11px] capitalize text-slate-500">
                                {activityMetrics.largestType || "No transaction"}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-white">
                            Payment methods
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Transaction volume by payment method
                        </p>
                    </div>
                    {activityMetrics.paymentMethods.length === 0 ? (
                        <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-500">
                            No transaction activity for this period.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activityMetrics.paymentMethods.map((method) => {
                                const share =
                                    totalIncome + totalExpense > 0
                                        ? (method.amount / (totalIncome + totalExpense)) * 100
                                        : 0;
                                return (
                                    <div key={method.name}>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="text-sm text-slate-300">{method.name}</span>
                                            <span className="text-xs text-slate-400">
                                                {method.count} {method.count === 1 ? "transaction" : "transactions"}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-sky-400"
                                                style={{ width: `${Math.min(100, share)}%` }}
                                            />
                                        </div>
                                        <p className="mt-1.5 text-[11px] text-slate-500">
                                            {formatCurrency(method.amount)} · {share.toFixed(1)}% of transaction value
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
);

export default AnalyticsActivity;
