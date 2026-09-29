import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../app");
const { createAuthenticatedUser, authHeader } = require("../helpers/auth");
const { generateTestBusinessData, generateTestCategoryData } = require("../helpers/testData");

const setup = async () => {
    const auth = await createAuthenticatedUser();
    const business = await request(app).post("/api/business")
        .set(authHeader(auth.accessToken)).send(generateTestBusinessData());
    expect(business.statusCode).toBe(201);
    return auth;
};

const makeCategory = async (accessToken, type) => {
    const response = await request(app).post("/api/categories")
        .set(authHeader(accessToken)).send(generateTestCategoryData(type));
    expect(response.statusCode).toBe(201);
    return response.body.category;
};

const makeTransaction = (accessToken, categoryId, data) =>
    request(app).post("/api/transactions")
        .set(authHeader(accessToken)).send({
            categoryId,
            amount: data.amount,
            paymentMethod: "cash",
            transactionDate: data.date,
            description: data.description || "Dashboard test"
        });

describe("Dashboard API", () => {
    test("DASH-01 should return zero totals for a business with no transactions", async () => {
        const { accessToken } = await setup();
        const response = await request(app).get("/api/dashboard")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body.summary.totalIncome).toBe(0);
        expect(response.body.summary.totalExpense).toBe(0);
        expect(response.body.summary.balance).toBe(0);
        expect(response.body.recentTransactions).toEqual([]);
    });

    test("DASH-02 should calculate income, expense and balance", async () => {
        const { accessToken } = await setup();
        const income = await makeCategory(accessToken, "income");
        const expense = await makeCategory(accessToken, "expense");
        expect((await makeTransaction(accessToken, income._id, { amount: 5000, date: "2026-09-10" })).statusCode).toBe(201);
        expect((await makeTransaction(accessToken, expense._id, { amount: 1800, date: "2026-09-11" })).statusCode).toBe(201);
        const response = await request(app).get("/api/dashboard")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body.summary.totalIncome).toBe(5000);
        expect(response.body.summary.totalExpense).toBe(1800);
        expect(response.body.summary.balance).toBe(3200);
    });

    test("DASH-03 should include category summaries", async () => {
        const { accessToken } = await setup();
        const expense = await makeCategory(accessToken, "expense");
        expect((await makeTransaction(accessToken, expense._id, { amount: 700, date: "2026-09-12" })).statusCode).toBe(201);
        const response = await request(app).get("/api/dashboard")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body.categorySummary).toHaveLength(1);
        expect(response.body.categorySummary[0].total).toBe(700);
    });

    test("DASH-04 should return at most five recent transactions", async () => {
        const { accessToken } = await setup();
        const income = await makeCategory(accessToken, "income");
        for (let i = 1; i <= 6; i++) {
            const response = await makeTransaction(accessToken, income._id, {
                amount: i * 100,
                date: `2026-09-${String(i).padStart(2, "0")}`
            });
            expect(response.statusCode).toBe(201);
        }
        const response = await request(app).get("/api/dashboard")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body.recentTransactions).toHaveLength(5);
    });

    test("DASH-05 should calculate analytics for a selected date range", async () => {
        const { accessToken } = await setup();
        const income = await makeCategory(accessToken, "income");
        const expense = await makeCategory(accessToken, "expense");
        expect((await makeTransaction(accessToken, income._id, { amount: 3000, date: "2026-09-05" })).statusCode).toBe(201);
        expect((await makeTransaction(accessToken, income._id, { amount: 5000, date: "2026-09-20" })).statusCode).toBe(201);
        expect((await makeTransaction(accessToken, expense._id, { amount: 1000, date: "2026-09-10" })).statusCode).toBe(201);
        const response = await request(app).get("/api/dashboard/analytics?startDate=2026-09-01&endDate=2026-09-15")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body.summary.totalIncome).toBe(3000);
        expect(response.body.summary.totalExpense).toBe(1000);
        expect(response.body.summary.balance).toBe(2000);
    });

    test("DASH-06 should reject invalid analytics dates and reversed ranges", async () => {
        const { accessToken } = await setup();
        const invalid = await request(app).get("/api/dashboard/analytics?startDate=2026-99-99")
            .set(authHeader(accessToken));
        expect(invalid.statusCode).toBe(400);
        const reversed = await request(app).get("/api/dashboard/analytics?startDate=2026-09-20&endDate=2026-09-10")
            .set(authHeader(accessToken));
        expect(reversed.statusCode).toBe(400);
    });
});
