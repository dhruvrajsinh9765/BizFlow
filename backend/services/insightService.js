const { GoogleGenAI } = require("@google/genai");

const Business = require("../models/Business");
const Transaction = require("../models/Transaction");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const getBusinessFinancialData = async (userId) => {
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

    // Get five most recent transactions
    const recentTransactions = await Transaction.find({
        businessId
    })
        .sort({
            transactionDate: -1
        })
        .limit(5)
        .populate("categoryId", "name type")
        .select(
            "amount paymentMethod transactionDate description categoryId"
        );

    return {
        business: {
            businessName: business.businessName,
            businessType: business.businessType
        },
        summary: {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        },
        categorySummary,
        recentTransactions
    };
};

const generateBusinessInsights = async (userId) => {
    const financialData = await getBusinessFinancialData(userId);

    const prompt = `
You are a financial assistant for a small business.

Analyze the following business financial data:

${JSON.stringify(financialData, null, 2)}

Provide:
1. A short overall financial summary.
2. Important observations about income and expenses.
3. Category-wise observations.
4. Practical suggestions to improve the business's financial performance.

Rules:
- Use only the data provided.
- Do not invent numbers, transactions, or facts.
- Keep the response concise and easy for a small business owner to understand.
- If there is insufficient data for an observation, clearly mention that.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
    });

    return {
        financialData,
        insights: response.text
    };
};

module.exports = {
    getBusinessFinancialData,
    generateBusinessInsights
};