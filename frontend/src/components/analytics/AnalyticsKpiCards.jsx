import { TrendingDown, TrendingUp } from "lucide-react";
import Card from "../ui/Card";

// Displays period-over-period changes. Calculations remain in Analytics.jsx.
const AnalyticsKpiCards = ({
    incomeChange,
    expenseChange,
    profitChange,
    marginChange,
    totalIncome,
    previousIncome,
    totalExpense,
    previousExpense,
    balance,
    previousBalance,
    currentMargin,
    previousMargin,
    getComparisonColor,
    getComparisonIcon,
    formatCurrency,
}) => (
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Revenue change
                            </p>
                            <p
                                className={`mt-2 text-2xl font-semibold ${
                                    incomeChange === null
                                        ? "text-slate-400"
                                        : getComparisonColor(incomeChange)
                                }`}
                            >
                                {incomeChange === null
                                    ? totalIncome > 0
                                        ? "New activity"
                                        : "No activity"
                                    : `${incomeChange >= 0 ? "+" : ""}${incomeChange.toFixed(1)}%`}
                            </p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-2">
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs">
                        {incomeChange !== null ? (
                            <>
                                {(() => {
                                    const Icon =
                                        getComparisonIcon(
                                            incomeChange
                                        );
                                    return (
                                        <Icon
                                            className={`h-3.5 w-3.5 ${getComparisonColor(
                                                incomeChange
                                            )}`}
                                        />
                                    );
                                })()}
                                <span
                                    className={getComparisonColor(
                                        incomeChange
                                    )}
                                >
                                    {Math.abs(
                                        incomeChange
                                    ).toFixed(1)}
                                    %
                                </span>
                                <span className="text-slate-500">
                                    vs previous period
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-500">
                                Current: {formatCurrency(totalIncome)} · Previous: {formatCurrency(previousIncome)}
                            </span>
                        )}
                    </div>
                </Card>
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Expense change
                            </p>
                            <p
                                className={`mt-2 text-2xl font-semibold ${
                                    expenseChange === null
                                        ? "text-slate-400"
                                        : getComparisonColor(expenseChange, true)
                                }`}
                            >
                                {expenseChange === null
                                    ? totalExpense > 0
                                        ? "New activity"
                                        : "No activity"
                                    : `${expenseChange >= 0 ? "+" : ""}${expenseChange.toFixed(1)}%`}
                            </p>
                        </div>
                        <div className="rounded-lg bg-red-500/10 p-2">
                            <TrendingDown className="h-5 w-5 text-red-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs">
                        {expenseChange !== null ? (
                            <>
                                {(() => {
                                    const Icon =
                                        getComparisonIcon(
                                            expenseChange
                                        );
                                    return (
                                        <Icon
                                            className={`h-3.5 w-3.5 ${getComparisonColor(
                                                expenseChange,
                                                true
                                            )}`}
                                        />
                                    );
                                })()}
                                <span
                                    className={getComparisonColor(
                                        expenseChange,
                                        true
                                    )}
                                >
                                    {Math.abs(
                                        expenseChange
                                    ).toFixed(1)}
                                    %
                                </span>
                                <span className="text-slate-500">
                                    vs previous period
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-500">
                                Current: {formatCurrency(totalExpense)} · Previous: {formatCurrency(previousExpense)}
                            </span>
                        )}
                    </div>
                </Card>
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Profit change
                            </p>
                            <p
                                className={`mt-2 text-2xl font-semibold ${
                                    profitChange === null
                                        ? "text-slate-400"
                                        : getComparisonColor(profitChange)
                                }`}
                            >
                                {profitChange === null
                                    ? balance !== 0
                                        ? "New result"
                                        : "No activity"
                                    : `${profitChange >= 0 ? "+" : ""}${profitChange.toFixed(1)}%`}
                            </p>
                        </div>
                        <div className="rounded-lg bg-indigo-500/10 p-2">
                            <TrendingUp className="h-5 w-5 text-indigo-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs">
                        {profitChange !== null ? (
                            <>
                                {(() => {
                                    const Icon =
                                        getComparisonIcon(
                                            profitChange
                                        );
                                    return (
                                        <Icon
                                            className={`h-3.5 w-3.5 ${getComparisonColor(
                                                profitChange
                                            )}`}
                                        />
                                    );
                                })()}
                                <span
                                    className={getComparisonColor(
                                        profitChange
                                    )}
                                >
                                    {Math.abs(
                                        profitChange
                                    ).toFixed(1)}
                                    %
                                </span>
                                <span className="text-slate-500">
                                    vs previous period
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-500">
                                Current: {formatCurrency(balance)} · Previous: {formatCurrency(previousBalance)}
                            </span>
                        )}
                    </div>
                </Card>
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Margin change
                            </p>
                            <p
                                className={`mt-2 text-2xl font-semibold ${
                                    marginChange === null
                                        ? "text-slate-400"
                                        : marginChange >= 0
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                }`}
                            >
                                {marginChange === null
                                    ? currentMargin > 0
                                        ? "New margin"
                                        : "No margin"
                                    : `${marginChange >= 0 ? "+" : ""}${marginChange.toFixed(1)} pp`}
                            </p>
                        </div>
                        <div className="rounded-lg bg-sky-500/10 p-2">
                            <TrendingUp className="h-5 w-5 text-sky-400" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs">
                        {marginChange !== null ? (
                            <span
                                className={
                                    marginChange >= 0
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                }
                            >
                                {marginChange >= 0
                                    ? "+"
                                    : ""}
                                {marginChange.toFixed(1)}
                                pp
                            </span>
                        ) : (
                            <span className="text-slate-500">
                                Current: {currentMargin.toFixed(1)}% · Previous: {previousMargin.toFixed(1)}%
                            </span>
                        )}
                        {marginChange !== null && (
                            <span className="ml-1.5 text-slate-500">
                                vs previous period
                            </span>
                        )}
                    </div>
                </Card>
            </div>
);

export default AnalyticsKpiCards;
