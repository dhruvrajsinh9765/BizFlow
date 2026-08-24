const { GoogleGenAI } = require("@google/genai");

const Business = require("../models/Business");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/Apperror");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


const getBusinessFinancialData = async (userId) => {
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
    if (!process.env.GEMINI_API_KEY) {
        throw new AppError(
            "AI service is not configured",
            500
        );
    }

    const financialData = await getBusinessFinancialData(userId);

    const prompt = `
You are a financial assistant for a small business.

Analyze the following business financial data:

${JSON.stringify(financialData, null, 2)}

Provide your response using exactly these sections:

1. Overall Financial Summary
2. Key Financial Observations
3. Category Insights
4. Recommendations

Instructions:

- Base your analysis only on the financial data provided.
- Do not invent numbers, transactions, trends, percentages, or facts.
- Use actual numbers from the provided data whenever relevant.
- Do not describe the balance as profit; refer to it as the difference between total income and total expense.
- Clearly distinguish observations supported by the data from situations where there is insufficient data.
- Do not claim that income or expenses increased or decreased unless the provided data clearly supports a comparison.
- Avoid repeating the same observation across multiple sections.

For Key Financial Observations:
- Identify the most important financial patterns visible in the data.
- Explain why each observation may matter to the business owner.
- Focus on meaningful observations rather than listing every number.

For Category Insights:
- Identify important income and expense categories based on their totals.
- Highlight categories that contribute significantly to total income or expenses.
- Mention when category data is too limited for meaningful analysis.

For Recommendations:
- Give practical and specific suggestions based directly on the provided data.
- Explain which financial observation each recommendation is based on.
- Avoid generic advice such as "increase sales" or "reduce expenses" unless supported by a specific observation.
- Do not present assumptions as facts.

If there is insufficient data to make a meaningful observation or recommendation, clearly say so.

Keep the response concise, useful, and easy for a small business owner to understand.
`;

    let response;

    try {
        response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });
    } catch (error) {
        throw new AppError(
            "Unable to generate business insights at the moment. Please try again later",
            503
        );
    }

    if (!response.text) {
        throw new AppError(
            "Unable to generate business insights at the moment",
            503
        );
    }

    return {
        financialData,
        insights: response.text
    };
};


module.exports = {
    getBusinessFinancialData,
    generateBusinessInsights
};