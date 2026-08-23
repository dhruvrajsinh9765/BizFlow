const Business = require("../models/Business");
const Transaction = require("../models/Transaction");

const getDashboardSummary = async (userId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
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
            unwind:"category"
        },
        {
            $group: {
                _id: "$category.type",
                total: {
                    sum:"amount"
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
            unwind:"category"
        },
        {
            $group: {
                _id: "$categoryId",
                categoryName: {
                    first:"category.name"
                },
                type: {
                    first:"category.type"
                },
                total: {
                    sum:"amount"
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

module.exports = {
    getDashboardSummary
};

