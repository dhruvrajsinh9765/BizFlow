const Business = require("../models/Business");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/Apperror");


const getDashboardSummary = async (userId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const businessId = business._id;

    // Calculate total income and total expense
    const financialSummary = await Transaction.aggregate([
        {
            $match: {
                businessId
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $group: {
                _id: "$category.type",
                total: {
                    $sum: "$amount"
                }
            }
        }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    financialSummary.forEach((item) => {
        if (item._id === "income") {
            totalIncome = item.total;
        }

        if (item._id === "expense") {
            totalExpense = item.total;
        }
    });

    // Calculate category-wise totals
    const categorySummary = await Transaction.aggregate([
        {
            $match: {
                businessId
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $group: {
                _id: "$categoryId",
                categoryName: {
                    $first: "$category.name"
                },
                type: {
                    $first: "$category.type"
                },
                total: {
                    $sum: "$amount"
                }
            }
        },
        {
            $project: {
                _id: 0,
                categoryId: "$_id",
                categoryName: 1,
                type: 1,
                total: 1
            }
        }
    ]);

    // Get five most recent transactions
    const recentTransactions = await Transaction.find({
        businessId
    })
        .sort({
            transactionDate: -1
        })
        .limit(5)
        .populate("categoryId", "name type");

    return {
        summary: {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        },
        categorySummary,
        recentTransactions
    };
};


const getFinancialAnalytics = async (userId, filters = {}) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const {
        startDate,
        endDate
    } = filters;

    const businessId = business._id;

    // Validate start date
    let parsedStartDate;

    if (startDate !== undefined) {
        parsedStartDate = new Date(startDate);

        if (Number.isNaN(parsedStartDate.getTime())) {
            throw new AppError("Invalid start date", 400);
        }
    }

    // Validate end date
    let parsedEndDate;

    if (endDate !== undefined) {
        parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
            throw new AppError("Invalid end date", 400);
        }
    }

    // Validate date range
    if (
        parsedStartDate !== undefined &&
        parsedEndDate !== undefined &&
        parsedStartDate > parsedEndDate
    ) {
        throw new AppError(
            "Start date cannot be later than end date",
            400
        );
    }

    // Build the transaction filter
    const matchQuery = {
        businessId
    };

    if (parsedStartDate !== undefined || parsedEndDate !== undefined) {
        matchQuery.transactionDate = {};

        if (parsedStartDate !== undefined) {
            matchQuery.transactionDate.$gte = parsedStartDate;
        }

        if (parsedEndDate !== undefined) {
            matchQuery.transactionDate.$lte = parsedEndDate;
        }
    }

    // Calculate total income and expense for the selected period
    const financialSummary = await Transaction.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $group: {
                _id: "$category.type",
                total: {
                    $sum: "$amount"
                }
            }
        }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    financialSummary.forEach((item) => {
        if (item._id === "income") {
            totalIncome = item.total;
        }

        if (item._id === "expense") {
            totalExpense = item.total;
        }
    });

    // Calculate month-wise income and expense
    const monthlySummary = await Transaction.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $group: {
                _id: {
                    year: {
                        $year: "$transactionDate"
                    },
                    month: {
                        $month: "$transactionDate"
                    },
                    type: "$category.type"
                },
                total: {
                    $sum: "$amount"
                }
            }
        },
        {
            $group: {
                _id: {
                    year: "$_id.year",
                    month: "$_id.month"
                },
                values: {
                    $push: {
                        type: "$_id.type",
                        total: "$total"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                period: {
                    $dateToString: {
                        format: "%Y-%m",
                        date: {
                            $dateFromParts: {
                                year: "$_id.year",
                                month: "$_id.month"
                            }
                        }
                    }
                },
                income: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$values",
                                                as: "value",
                                                cond: {
                                                    $eq: [
                                                        "$$value.type",
                                                        "income"
                                                    ]
                                                }
                                            }
                                        },
                                        as: "incomeValue",
                                        in: "$$incomeValue.total"
                                    }
                                },
                                0
                            ]
                        },
                        0
                    ]
                },
                expense: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$values",
                                                as: "value",
                                                cond: {
                                                    $eq: [
                                                        "$$value.type",
                                                        "expense"
                                                    ]
                                                }
                                            }
                                        },
                                        as: "expenseValue",
                                        in: "$$expenseValue.total"
                                    }
                                },
                                0
                            ]
                        },
                        0
                    ]
                }
            }
        },
        {
            $sort: {
                period: 1
            }
        }
    ]);

    // Calculate category-wise totals for the selected period
    const categorySummary = await Transaction.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $group: {
                _id: "$categoryId",
                categoryName: {
                    $first: "$category.name"
                },
                type: {
                    $first: "$category.type"
                },
                total: {
                    $sum: "$amount"
                }
            }
        },
        {
            $project: {
                _id: 0,
                categoryId: "$_id",
                categoryName: 1,
                type: 1,
                total: 1
            }
        },
        {
            $sort: {
                total: -1
            }
        }
    ]);

    return {
        summary: {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        },
        monthlySummary,
        categorySummary
    };
};


module.exports = {
    getDashboardSummary,
    getFinancialAnalytics
};