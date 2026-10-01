const { GoogleGenAI } = require("@google/genai");

const Business = require("../models/Business");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/Apperror");

const IST_OFFSET_MINUTES = 330;


const getISTParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, Number(part.value)])
    );

    return {
        year: values.year,
        month: values.month,
        day: values.day,
    };
};


const getMonthRangeIST = (year, month) => {
    const startUtc = Date.UTC(year, month - 1, 1);
    const endUtc = Date.UTC(year, month, 1) - 1;

    return {
        start: new Date(
            startUtc - IST_OFFSET_MINUTES * 60 * 1000
        ),

        end: new Date(
            endUtc - IST_OFFSET_MINUTES * 60 * 1000
        ),
    };
};


const getMonthLabel = (year, month) => {
    const date = new Date(
        Date.UTC(year, month - 1, 1)
    );

    return new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
};


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
                    $lte: endDate,
                },
            },
        },

        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
            },
        },

        {
            $unwind: "$category",
        },

        {
            $group: {
                _id: "$category.type",

                total: {
                    $sum: "$amount",
                },
            },
        },
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
        profit: income - expense,
    };
};


const calculatePercentageChange = (
    current,
    previous
) => {

    if (previous === 0) {
        return null;
    }

    return Number(
        (
            ((current - previous) / previous) *
            100
        ).toFixed(2)
    );
};


const getBusinessFinancialData = async (userId) => {

    const business = await Business.findOne({
        userId,
    });


    if (!business) {
        throw new AppError(
            "Business not found",
            404
        );
    }


    const businessId = business._id;


    // ---------------------------------------------------------
    // Current and previous calendar month in IST
    // ---------------------------------------------------------

    const nowParts = getISTParts();


    const currentYear =
        nowParts.year;

    const currentMonth =
        nowParts.month;


    const previousDate = new Date(
        Date.UTC(
            currentYear,
            currentMonth - 2,
            1
        )
    );


    const previousYear =
        previousDate.getUTCFullYear();

    const previousMonth =
        previousDate.getUTCMonth() + 1;


    const currentRange =
        getMonthRangeIST(
            currentYear,
            currentMonth
        );


    const previousRange =
        getMonthRangeIST(
            previousYear,
            previousMonth
        );


    const [
        currentMonthData,
        previousMonthData
    ] = await Promise.all([

        getMonthlyFinancialSummary(
            businessId,
            currentRange.start,
            currentRange.end
        ),

        getMonthlyFinancialSummary(
            businessId,
            previousRange.start,
            previousRange.end
        ),

    ]);


    const periodComparison = {

        currentPeriod:
            currentMonthData,

        previousPeriod:
            previousMonthData,

        changes: {

            income:
                calculatePercentageChange(
                    currentMonthData.income,
                    previousMonthData.income
                ),

            expense:
                calculatePercentageChange(
                    currentMonthData.expense,
                    previousMonthData.expense
                ),

            profit:
                calculatePercentageChange(
                    currentMonthData.profit,
                    previousMonthData.profit
                ),

        },

    };


    // ---------------------------------------------------------
    // Overall financial summary
    //
    // IMPORTANT:
    // Transaction does NOT contain a type field.
    // Income/expense comes from Category.type.
    // ---------------------------------------------------------

    const financialSummary =
        await Transaction.aggregate([

            {
                $match: {
                    businessId,
                },
            },

            {
                $lookup: {
                    from: "categories",

                    localField:
                        "categoryId",

                    foreignField:
                        "_id",

                    as: "category",
                },
            },

            {
                $unwind:
                    "$category",
            },

            {
                $group: {

                    _id:
                        "$category.type",

                    total: {
                        $sum: "$amount",
                    },

                },
            },

        ]);


    let totalIncome = 0;
    let totalExpense = 0;


    financialSummary.forEach((item) => {

        if (item._id === "income") {
            totalIncome =
                item.total;
        }

        if (item._id === "expense") {
            totalExpense =
                item.total;
        }

    });


    // ---------------------------------------------------------
    // Category-wise financial summary
    // ---------------------------------------------------------

    const categorySummary =
        await Transaction.aggregate([

            {
                $match: {
                    businessId,
                },
            },

            {
                $lookup: {
                    from: "categories",

                    localField:
                        "categoryId",

                    foreignField:
                        "_id",

                    as: "category",
                },
            },

            {
                $unwind:
                    "$category",
            },

            {
                $group: {

                    _id:
                        "$categoryId",

                    categoryName: {
                        $first:
                            "$category.name",
                    },

                    type: {
                        $first:
                            "$category.type",
                    },

                    total: {
                        $sum:
                            "$amount",
                    },

                },
            },

            {
                $project: {

                    _id: 0,

                    categoryId:
                        "$_id",

                    categoryName: 1,

                    type: 1,

                    total: 1,

                },
            },

            {
                $sort: {
                    total: -1,
                },
            },

        ]);


    // ---------------------------------------------------------
    // Derived financial metrics
    // ---------------------------------------------------------

    const profit =
        totalIncome -
        totalExpense;


    const profitMargin =
        totalIncome > 0
            ? Number(
                (
                    (profit / totalIncome) *
                    100
                ).toFixed(2)
            )
            : 0;


    const expenseRatio =
        totalIncome > 0
            ? Number(
                (
                    (totalExpense / totalIncome) *
                    100
                ).toFixed(2)
            )
            : 0;


    // ---------------------------------------------------------
    // Category breakdown
    // ---------------------------------------------------------

    const incomeCategories =
        categorySummary.filter(
            (category) =>
                category.type ===
                "income"
        );


    const expenseCategories =
        categorySummary.filter(
            (category) =>
                category.type ===
                "expense"
        );


    const topIncomeCategory =
        incomeCategories[0] ||
        null;


    const topExpenseCategory =
        expenseCategories[0] ||
        null;


    const topIncomeCategoryPercentage =
        totalIncome > 0 &&
        topIncomeCategory
            ? Number(
                (
                    (
                        topIncomeCategory.total /
                        totalIncome
                    ) * 100
                ).toFixed(2)
            )
            : null;


    const topExpenseCategoryPercentage =
        totalExpense > 0 &&
        topExpenseCategory
            ? Number(
                (
                    (
                        topExpenseCategory.total /
                        totalExpense
                    ) * 100
                ).toFixed(2)
            )
            : null;


    // ---------------------------------------------------------
    // Recent transactions
    // ---------------------------------------------------------

    const recentTransactions =
        await Transaction.find({
            businessId,
        })
            .sort({
                transactionDate: -1,
            })
            .limit(5)
            .populate(
                "categoryId",
                "name type"
            )
            .select(
                "amount paymentMethod transactionDate description categoryId"
            );


    // ---------------------------------------------------------
    // Recent expense anomaly
    // ---------------------------------------------------------

    const expenseTransactions =
        recentTransactions.filter(
            (transaction) =>
                transaction.categoryId &&
                transaction.categoryId.type ===
                    "expense"
        );


    const averageRecentExpense =
        expenseTransactions.length > 0
            ? expenseTransactions.reduce(
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    transaction.amount,
                0
            ) /
                expenseTransactions.length
            : 0;


    const largestRecentExpense =
        expenseTransactions.length > 0
            ? expenseTransactions.reduce(
                (
                    largest,
                    transaction
                ) =>
                    transaction.amount >
                    largest.amount
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
                    largestRecentExpense
                        .categoryId
                        .name,

                description:
                    largestRecentExpense
                        .description,

                averageRecentExpense:
                    Number(
                        averageRecentExpense
                            .toFixed(2)
                    ),

                ratioToAverage:
                    Number(
                        (
                            largestRecentExpense.amount /
                            averageRecentExpense
                        ).toFixed(2)
                    ),

            }

            : null;


    // ---------------------------------------------------------
    // Final financial data
    // ---------------------------------------------------------

    return {

        business: {

            businessName:
                business.businessName,

            businessType:
                business.businessType,

        },


        summary: {

            totalIncome,

            totalExpense,

            balance:
                totalIncome -
                totalExpense,

            profit,

            profitMargin,

            expenseRatio,

        },


        categorySummary,


        topCategories: {

            topIncomeCategory,

            topExpenseCategory,

            topIncomeCategoryPercentage,

            topExpenseCategoryPercentage,

            topIncomeCategories:
                incomeCategories.slice(0, 3),

            topExpenseCategories:
                expenseCategories.slice(0, 3),

        },


        period: {

            currentPeriodLabel:
                getMonthLabel(
                    currentYear,
                    currentMonth
                ),

            previousPeriodLabel:
                getMonthLabel(
                    previousYear,
                    previousMonth
                ),

            currentPeriodStart:
                currentRange.start,

            currentPeriodEnd:
                currentRange.end,

            previousPeriodStart:
                previousRange.start,

            previousPeriodEnd:
                previousRange.end,

        },


        periodComparison,

        unusualExpense,

        recentTransactions,

    };

};


// -------------------------------------------------------------
// Generate AI insights
// -------------------------------------------------------------

const generateBusinessInsights = async (
    userId
) => {

    // Check configuration first.
    // This is important because AI-03 expects a
    // configuration error when the key is missing.

    if (!process.env.GEMINI_API_KEY) {

        throw new AppError(
            "AI service is not configured",
            500
        );

    }


    const financialData =
        await getBusinessFinancialData(
            userId
        );


    // Create the Gemini client only after
    // confirming that the API key exists.

    const ai =
        new GoogleGenAI({
            apiKey:
                process.env.GEMINI_API_KEY,
        });


    const prompt = `

You are an AI business analyst for a small business.

Analyze ONLY the structured financial data provided below.

IMPORTANT TIME CONTEXT:

- summary contains ALL-TIME recorded business totals.
- periodComparison.currentPeriod contains the CURRENT CALENDAR MONTH in India Standard Time (IST).
- periodComparison.previousPeriod contains the PREVIOUS CALENDAR MONTH in IST.
- recentTransactions contains the five most recent recorded transactions.
- Never describe the business as inactive when currentPeriod contains non-zero income, expense, or profit.
- Never use all-time totals as evidence for a monthly trend.

DATA:

${JSON.stringify(
    financialData,
    null,
    2
)}


Return ONLY valid JSON with exactly this structure:

{
  "summary": "Short, factual overall business summary",

  "keyFindings": [
    {
      "title": "Short finding title",
      "description": "Brief explanation",
      "evidence": "Specific numerical evidence from the provided data"
    }
  ],

  "risks": [
    {
      "title": "Short risk title",
      "description": "Brief explanation",
      "evidence": "Specific numerical evidence from the provided data"
    }
  ],

  "opportunities": [
    {
      "title": "Short opportunity title",
      "description": "Brief explanation",
      "evidence": "Specific numerical evidence from the provided data"
    }
  ],

  "recommendedActions": [
    {
      "priority": "high",
      "action": "Specific practical action",
      "reason": "Why this action follows from the data"
    }
  ]
}


RULES:

- Base every statement only on the supplied data.

- Never invent numbers, percentages, transactions, customers, causes, correlations, ROI, or trends.

- Do not claim correlation or causation unless it is explicitly supported by the data.

- Do not call balance profit unless the profit field is being referenced.

- Use the provided profit and profitMargin fields rather than recalculating them.

- A null percentage change means the previous period value was zero. Use wording such as "new activity" or "no comparable prior activity" rather than a percentage change.

- A zero current-period value is not by itself evidence of inactivity. Consider the other current-period metrics and recent transactions before making an inactivity statement.

- If current-period income, expense, or profit is non-zero, do not create an inactivity risk or recommendation.

- If previous-period value is zero and current-period value is non-zero, describe it as new activity rather than a percentage increase.

- If previous-period value is non-zero and current-period value is zero, a -100% change is valid.

- Do not repeat the same observation across keyFindings, risks, opportunities, and recommendedActions unless the sections serve clearly different purposes.

- Recommendations must be directly connected to a specific observed finding, risk, or opportunity.

- Avoid generic advice such as "increase sales" or "reduce expenses" without a data-specific reason.

- For expense anomalies, only refer to unusualExpense when it is not null.

- Do not call an expense unusual merely because it is the largest expense category.

- Do not claim marketing effectiveness, ROI, customer contribution, or investment return unless the provided data directly supports that claim.

- Use 0 to 3 items in each array. Prefer fewer, stronger insights over repetitive ones.

- Priority must be exactly one of: high, medium, low.

- Keep descriptions concise and professional.

- Return JSON only. No markdown or text outside the JSON.

`;


    let response;


    try {

        response =
            await ai.models.generateContent({

                model:
                    "gemini-3.5-flash-lite",

                contents:
                    prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseSchema: {

                        type: "object",

                        properties: {

                            summary: {
                                type: "string",
                            },


                            keyFindings: {

                                type: "array",

                                items: {

                                    type: "object",

                                    properties: {

                                        title: {
                                            type: "string",
                                        },

                                        description: {
                                            type: "string",
                                        },

                                        evidence: {
                                            type: "string",
                                        },

                                    },

                                    required: [
                                        "title",
                                        "description",
                                        "evidence",
                                    ],

                                },

                            },


                            risks: {

                                type: "array",

                                items: {

                                    type: "object",

                                    properties: {

                                        title: {
                                            type: "string",
                                        },

                                        description: {
                                            type: "string",
                                        },

                                        evidence: {
                                            type: "string",
                                        },

                                    },

                                    required: [
                                        "title",
                                        "description",
                                        "evidence",
                                    ],

                                },

                            },


                            opportunities: {

                                type: "array",

                                items: {

                                    type: "object",

                                    properties: {

                                        title: {
                                            type: "string",
                                        },

                                        description: {
                                            type: "string",
                                        },

                                        evidence: {
                                            type: "string",
                                        },

                                    },

                                    required: [
                                        "title",
                                        "description",
                                        "evidence",
                                    ],

                                },

                            },


                            recommendedActions: {

                                type: "array",

                                items: {

                                    type: "object",

                                    properties: {

                                        priority: {

                                            type: "string",

                                            enum: [
                                                "high",
                                                "medium",
                                                "low",
                                            ],

                                        },

                                        action: {
                                            type: "string",
                                        },

                                        reason: {
                                            type: "string",
                                        },

                                    },

                                    required: [
                                        "priority",
                                        "action",
                                        "reason",
                                    ],

                                },

                            },

                        },

                        required: [
                            "summary",
                            "keyFindings",
                            "risks",
                            "opportunities",
                            "recommendedActions",
                        ],

                    },

                },

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


    try {

        insights =
            JSON.parse(
                response.text
            );

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


    if (
        typeof insights !== "object" ||
        insights === null ||
        typeof insights.summary !== "string" ||
        !Array.isArray(
            insights.keyFindings
        ) ||
        !Array.isArray(
            insights.risks
        ) ||
        !Array.isArray(
            insights.opportunities
        ) ||
        !Array.isArray(
            insights.recommendedActions
        )
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

        insights,

    };

};


module.exports = {

    getBusinessFinancialData,

    generateBusinessInsights,

};