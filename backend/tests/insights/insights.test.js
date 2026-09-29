import { describe, test, expect, vi } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const app = require("../../app");
const insightService = require("../../services/insightService");

const {
    createAuthenticatedUser,
    authHeader
} = require("../helpers/auth");

const {
    generateTestBusinessData,
    generateTestCategoryData
} = require("../helpers/testData");


describe("AI Insights API", () => {

    test("AI-01 should reject unauthenticated insight requests", async () => {

        const response = await request(app)
            .get("/api/insights");

        expect(response.statusCode).toBe(401);
    });


    test("AI-02 should return structured insights for an authenticated business", async () => {

        const auth = await createAuthenticatedUser();


        const business = await request(app)
            .post("/api/business")
            .set(authHeader(auth.accessToken))
            .send(generateTestBusinessData());

        expect(business.statusCode).toBe(201);


        const category = await request(app)
            .post("/api/categories")
            .set(authHeader(auth.accessToken))
            .send(generateTestCategoryData("income"));

        expect(category.statusCode).toBe(201);


        const transaction = await request(app)
            .post("/api/transactions")
            .set(authHeader(auth.accessToken))
            .send({
                categoryId: category.body.category._id,
                amount: 5000,
                paymentMethod: "cash",
                transactionDate: "2026-09-15",
                description: "AI test"
            });

        expect(transaction.statusCode).toBe(201);


        // Mock the service instead of calling the real Gemini API.
        const mockedInsights = {

            financialData: {
                summary: {
                    totalIncome: 5000,
                    totalExpense: 1000,
                    balance: 4000,
                    profit: 4000
                }
            },

            insights: {
                summary: "Business financial analysis completed.",

                keyFindings: [
                    {
                        title: "Revenue and expense overview",
                        description: "Income and expenses were analyzed.",
                        evidence: "Income: 5000, Expense: 1000"
                    }
                ],

                risks: [],

                opportunities: [],

                recommendedActions: [
                    {
                        priority: "medium",
                        action: "Review expenses regularly.",
                        reason: "Expense data is available for analysis."
                    }
                ]
            }
        };


        vi.spyOn(
            insightService,
            "generateBusinessInsights"
        ).mockResolvedValueOnce(mockedInsights);


        const response = await request(app)
            .get("/api/insights")
            .set(authHeader(auth.accessToken));


        expect(response.statusCode).toBe(200);

        expect(
            typeof response.body.insights.summary
        ).toBe("string");

        expect(
            Array.isArray(response.body.insights.keyFindings)
        ).toBe(true);

        expect(
            Array.isArray(response.body.insights.risks)
        ).toBe(true);

        expect(
            Array.isArray(response.body.insights.opportunities)
        ).toBe(true);

        expect(
            Array.isArray(response.body.insights.recommendedActions)
        ).toBe(true);


        // Restore the original service function.
        vi.restoreAllMocks();
    });


    test("AI-03 should fail when the AI service is not configured", async () => {

        const auth = await createAuthenticatedUser();


        const business = await request(app)
            .post("/api/business")
            .set(authHeader(auth.accessToken))
            .send(generateTestBusinessData());

        expect(business.statusCode).toBe(201);


        const original = process.env.GEMINI_API_KEY;

        delete process.env.GEMINI_API_KEY;


        const response = await request(app)
            .get("/api/insights")
            .set(authHeader(auth.accessToken));


        if (original !== undefined) {
            process.env.GEMINI_API_KEY = original;
        }


        expect(response.statusCode).toBe(500);

        expect(response.body.message)
            .toBe("AI service is not configured");
    });


    test("AI-04 should return 404 when the authenticated user has no business", async () => {

    const auth = await createAuthenticatedUser();


    // A key is required for the service to reach
    // the "Business not found" check.
    process.env.GEMINI_API_KEY = "test-api-key";


    const response = await request(app)
        .get("/api/insights")
        .set(authHeader(auth.accessToken));


    expect(response.statusCode).toBe(404);

    expect(response.body.message)
        .toBe("Business not found");


    // Keep the test environment clean for following tests.
    delete process.env.GEMINI_API_KEY;
});

});