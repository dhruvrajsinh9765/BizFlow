import Card from "../ui/Card";

// Displays expense and income category breakdowns.
const AnalyticsBreakdown = ({
    expenseBreakdown,
    incomeBreakdown,
    totalExpenseBreakdown,
    totalIncomeBreakdown,
    formatCurrency,
}) => (
<div className="grid gap-6 xl:grid-cols-2">
                {/* Expense Breakdown */}
                <Card>
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-white">
                            Expense breakdown
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Where your money is going
                        </p>
                    </div>
                    {expenseBreakdown.length === 0 ? (
                        <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">
                            No expense data for this period.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {expenseBreakdown.map(
                                (category) => {
                                    const share =
                                        totalExpenseBreakdown ===
                                        0
                                            ? 0
                                            : (category.total /
                                                  totalExpenseBreakdown) *
                                              100;
                                    return (
                                        <div
                                            key={
                                                category.categoryId
                                            }
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="truncate text-sm text-slate-300">
                                                    {
                                                        category.categoryName
                                                    }
                                                </span>
                                                <span className="shrink-0 text-sm font-medium text-white">
                                                    {formatCurrency(
                                                        category.total
                                                    )}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-red-400"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            share
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-1.5 text-[11px] text-slate-500">
                                                {share.toFixed(
                                                    1
                                                )}
                                                % of expenses
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </Card>
                {/* Income Breakdown */}
                <Card>
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-white">
                            Income breakdown
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Where your revenue comes from
                        </p>
                    </div>
                    {incomeBreakdown.length === 0 ? (
                        <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">
                            No income data for this period.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {incomeBreakdown.map(
                                (category) => {
                                    const share =
                                        totalIncomeBreakdown ===
                                        0
                                            ? 0
                                            : (category.total /
                                                  totalIncomeBreakdown) *
                                              100;
                                    return (
                                        <div
                                            key={
                                                category.categoryId
                                            }
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="truncate text-sm text-slate-300">
                                                    {
                                                        category.categoryName
                                                    }
                                                </span>
                                                <span className="shrink-0 text-sm font-medium text-white">
                                                    {formatCurrency(
                                                        category.total
                                                    )}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-emerald-400"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            share
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-1.5 text-[11px] text-slate-500">
                                                {share.toFixed(
                                                    1
                                                )}
                                                % of revenue
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </Card>
            </div>
);

export default AnalyticsBreakdown;
