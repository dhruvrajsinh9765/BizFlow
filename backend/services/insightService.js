const { GoogleGenAI } = require("@google/genai");

const Business = require("../models/Business");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/Apperror");

const {
    getMonthRangeIST
} = require("../utils/dateUtils");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


const getMonthlyFinancialSummary = async (
    businessId,
    startDate,
    endDate
) => {

    const result = await Transaction.aggregate([
        {
            $match: {
                businessId,
                transactionDate: {
                    $gte: startDate,
                    $lte: endDate
                }
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


    let income = 0;
    let expense = 0;


    result.forEach((item) => {

        if (item._id === "income") {
            income = item.total;
        }

        if (item._id === "expense") {
            expense = item.total;
        }

    });


    return {
        income,
        expense,
        profit: income - expense
    };

};


const getBusinessFinancialData = async (userId) => {

    const business = await Business.findOne({ userId });


    if (!business) {
        throw new AppError("Business not found", 404);
    }


    const businessId = business._id;


    // Calculate current and previous month

    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;


    const previousMonth =
        currentMonth === 1
            ? 12
            : currentMonth - 1;


    const previousYear =
        currentMonth === 1
            ? currentYear - 1
            : currentYear;


    const currentRange = getMonthRangeIST(
        currentYear,
        currentMonth
    );


    const previousRange = getMonthRangeIST(
        previousYear,
        previousMonth
    );


    const currentMonthData = await getMonthlyFinancialSummary(
        businessId,
        currentRange.start,
        currentRange.end
    );


    const previousMonthData = await getMonthlyFinancialSummary(
        businessId,
        previousRange.start,
        previousRange.end
    );


    const calculatePercentageChange = (current, previous) => {

        if (previous === 0) {
            return null;
        }


        return Number(
            (((current - previous) / previous) * 100).toFixed(2)
        );

    };


    const periodComparison = {

        currentPeriod: currentMonthData,

        previousPeriod: previousMonthData,


        changes: {

            income: calculatePercentageChange(
                currentMonthData.income,
                previousMonthData.income
            ),


            expense: calculatePercentageChange(
                currentMonthData.expense,
                previousMonthData.expense
            ),


            profit: calculatePercentageChange(
                currentMonthData.profit,
                previousMonthData.profit
            )

        }

    };


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


    // Calculate additional financial metrics

    const profit = totalIncome - totalExpense;


    const profitMargin =
        totalIncome > 0
            ? Number(((profit / totalIncome) * 100).toFixed(2))
            : 0;


    const expenseRatio =
        totalIncome > 0
            ? Number(((totalExpense / totalIncome) * 100).toFixed(2))
            : 0;


    const topIncomeCategory =
        categorySummary.find(
            (category) => category.type === "income"
        ) || null;


    const topExpenseCategory =
        categorySummary.find(
            (category) => category.type === "expense"
        ) || null;


    const incomeCategories = categorySummary.filter(
        (category) => category.type === "income"
    );


    const expenseCategories = categorySummary.filter(
        (category) => category.type === "expense"
    );


    const topIncomeCategories = incomeCategories.slice(0, 3);

    const topExpenseCategories = expenseCategories.slice(0, 3);


    const topIncomeCategoryPercentage =
        totalIncome > 0 && topIncomeCategory
            ? Number(
                (
                    (topIncomeCategory.total / totalIncome) *
                    100
                ).toFixed(2)
            )
            : null;


    const topExpenseCategoryPercentage =
        totalExpense > 0 && topExpenseCategory
            ? Number(
                (
                    (topExpenseCategory.total / totalExpense) *
                    100
                ).toFixed(2)
            )
            : null;


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


    // Detect unusual recent expense

    const expenseTransactions = recentTransactions.filter(
        (transaction) =>
            transaction.categoryId &&
            transaction.categoryId.type === "expense"
    );


    const averageRecentExpense =
        expenseTransactions.length > 0
            ? expenseTransactions.reduce(
                (sum, transaction) =>
                    sum + transaction.amount,
                0
            ) / expenseTransactions.length
            : 0;


    const largestRecentExpense =
        expenseTransactions.length > 0
            ? expenseTransactions.reduce(
                (largest, transaction) =>
                    transaction.amount > largest.amount
                        ? transaction
                        : largest
            )
            : null;


    const unusualExpense =
        largestRecentExpense &&
        averageRecentExpense > 0 &&
        largestRecentExpense.amount >=
        averageRecentExpense * 2

            ? {

                amount:
                    largestRecentExpense.amount,

                category:
                    largestRecentExpense.categoryId.name,

                description:
                    largestRecentExpense.description,

                averageRecentExpense:
                    Number(
                        averageRecentExpense.toFixed(2)
                    ),

                ratioToAverage:
                    Number(
                        (
                            largestRecentExpense.amount /
                            averageRecentExpense
                        ).toFixed(2)
                    )

            }

            : null;


    return {

        business: {

            businessName:
                business.businessName,

            businessType:
                business.businessType

        },


        summary: {

            totalIncome,

            totalExpense,

            balance:
                totalIncome - totalExpense,

            profit,

            profitMargin,

            expenseRatio

        },


        categorySummary,


        topCategories: {

            topIncomeCategory,

            topExpenseCategory,

            topIncomeCategoryPercentage,

            topExpenseCategoryPercentage,

            topIncomeCategories,

            topExpenseCategories

        },


        periodComparison,


        unusualExpense,


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


    const financialData =
        await getBusinessFinancialData(userId);



    const prompt = `

You are an AI business analyst for a small business.

Analyze the following structured business financial data:

${JSON.stringify(financialData, null, 2)}

Your job is to identify the most important financial findings, risks, opportunities, and practical actions for the business owner.

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "Short overall financial summary",
  "keyFindings": [
    {
      "title": "Short finding title",
      "description": "Brief explanation of the finding",
      "evidence": "Specific numerical evidence from the provided data"
    }
  ],
  "risks": [
    {
      "title": "Short risk title",
      "description": "Brief explanation of the risk",
      "evidence": "Specific numerical evidence from the provided data"
    }
  ],
  "opportunities": [
    {
      "title": "Short opportunity title",
      "description": "Brief explanation of the opportunity",
      "evidence": "Specific numerical evidence from the provided data"
    }
  ],
  "recommendedActions": [
    {
      "priority": "high",
      "action": "Specific practical action",
      "reason": "Why this action is recommended based on the data"
    }
  ]
}

Rules:

- Base everything only on the provided financial data.
- Never invent numbers, percentages, transactions, trends, or business facts.
- Use the actual calculated metrics provided in the data.
- Do not perform your own financial calculations when the required metric is already provided.
- Do not call the balance profit unless it is explicitly provided as profit.
- Treat "income" and "expense" according to the provided category type.
- Do not claim that income, expenses, or profit increased or decreased unless the period comparison data supports it.
- A null percentage change means that the previous period value was zero, so do not describe it as a percentage increase or decrease.
- If there is insufficient data for a finding, risk, opportunity, or recommendation, do not invent one.
- Keep each description short and useful.
- Avoid generic advice such as "increase sales" or "reduce expenses" unless the provided data gives a specific reason.
- Recommendations must be directly connected to an observed finding, risk, or opportunity.
- Use 0 to 3 items in each array depending on how much meaningful information is available.
- Do not repeat the same observation across multiple sections unless it is necessary.
- Priority must be one of: "high", "medium", or "low".
- Return JSON only. Do not include markdown, code fences, explanations, or text outside the JSON.
- Do not use financial terms such as "cash flow", "cash position", "liquidity", or other metrics unless they are explicitly provided in the financial data.
- A metric value of 0 must not be interpreted as evidence of a meaningful financial condition unless the surrounding data supports that interpretation.
- When profit is negative, describe it as a loss rather than "negative profit" or "net profit of a negative amount".

`;


    let response;


    try {

        response =
            await ai.models.generateContent({

                model:
                    "gemini-3.5-flash-lite",

                contents:
                    prompt

            });

    } catch (error) {

        console.error(
            "Gemini API error:",
            error
        );


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


    let insights;


    // Parse Gemini JSON response

    try {

        insights =
            JSON.parse(response.text);

    } catch (error) {

        console.error(
            "Invalid JSON returned by Gemini:",
            response.text
        );


        throw new AppError(
            "AI service returned an invalid response",
            503
        );

    }


    // Validate Gemini response structure

    if (
        typeof insights !== "object" ||
        insights === null ||
        typeof insights.summary !== "string" ||
        !Array.isArray(insights.keyFindings) ||
        !Array.isArray(insights.risks) ||
        !Array.isArray(insights.opportunities) ||
        !Array.isArray(insights.recommendedActions)
    ) {

        console.error(
            "Gemini returned an invalid insight structure:",
            insights
        );


        throw new AppError(
            "AI service returned an invalid response",
            503
        );

    }


    return {

        financialData,

        insights

    };

};


module.exports = {

    getBusinessFinancialData,

    generateBusinessInsights

};
