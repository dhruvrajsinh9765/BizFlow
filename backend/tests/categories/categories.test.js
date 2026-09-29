import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const app = require("../../app");
const { createAuthenticatedUser, authHeader } = require("../helpers/auth");
const { generateTestBusinessData, generateTestCategoryData } = require("../helpers/testData");

const createBusiness = async (accessToken) => {
    const response = await request(app)
        .post("/api/business")
        .set(authHeader(accessToken))
        .send(generateTestBusinessData());
    expect(response.statusCode).toBe(201);
    return response.body.business;
};

const createCategory = async (accessToken, type = "income", overrides = {}) => {
    const data = { ...generateTestCategoryData(type), ...overrides };
    const response = await request(app)
        .post("/api/categories")
        .set(authHeader(accessToken))
        .send(data);
    expect(response.statusCode).toBe(201);
    return response.body.category;
};

describe("Category API", () => {
    test("CAT-01 should create a category with valid data", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const category = await createCategory(accessToken, "income");
        expect(category.type).toBe("income");
        expect(category.name).toBeTruthy();
    });

    test("CAT-02 should reject creation when name is missing", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const response = await request(app).post("/api/categories")
            .set(authHeader(accessToken)).send({ type: "income" });
        expect(response.statusCode).toBe(400);
    });

    test("CAT-03 should reject creation when type is missing", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const response = await request(app).post("/api/categories")
            .set(authHeader(accessToken)).send({ name: "Sales" });
        expect(response.statusCode).toBe(400);
    });

    test("CAT-04 should reject an invalid category type", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const response = await request(app).post("/api/categories")
            .set(authHeader(accessToken)).send({ name: "Invalid", type: "other" });
        expect(response.statusCode).toBe(400);
    });

    test("CAT-05 should reject duplicate category name and type for the same business", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const category = generateTestCategoryData("income");
        const first = await request(app).post("/api/categories")
            .set(authHeader(accessToken)).send(category);
        expect(first.statusCode).toBe(201);
        const second = await request(app).post("/api/categories")
            .set(authHeader(accessToken)).send(category);
        expect(second.statusCode).toBe(409);
    });

    test("CAT-06 should list categories alphabetically", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        await createCategory(accessToken, "income", { name: "Zeta Category" });
        await createCategory(accessToken, "income", { name: "Alpha Category" });
        const response = await request(app).get("/api/categories")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body.map((c) => c.name)).toEqual(
            [...response.body.map((c) => c.name)].sort()
        );
    });

    test("CAT-07 should get a category by id", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const category = await createCategory(accessToken);
        const response = await request(app).get(`/api/categories/${category._id}`)
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(category._id);
    });

    test("CAT-08 should update a category", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const category = await createCategory(accessToken);
        const response = await request(app).put(`/api/categories/${category._id}`)
            .set(authHeader(accessToken)).send({ name: "Updated Category" });
        expect(response.statusCode).toBe(200);
        expect(response.body.category.name).toBe("Updated Category");
    });

    test("CAT-09 should reject changing category type when transactions use it", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const category = await createCategory(accessToken, "expense");
        const response = await request(app).post("/api/transactions")
            .set(authHeader(accessToken)).send({
                categoryId: category._id,
                amount: 500,
                paymentMethod: "cash",
                transactionDate: "2026-09-10",
                description: "Category protection test"
            });
        expect(response.statusCode).toBe(201);
        const update = await request(app).put(`/api/categories/${category._id}`)
            .set(authHeader(accessToken)).send({ type: "income" });
        expect(update.statusCode).toBe(409);
    });

    test("CAT-10 should reject deleting a category used by a transaction", async () => {
        const { accessToken } = await createAuthenticatedUser();
        await createBusiness(accessToken);
        const category = await createCategory(accessToken, "expense");
        const transaction = await request(app).post("/api/transactions")
            .set(authHeader(accessToken)).send({
                categoryId: category._id,
                amount: 500,
                paymentMethod: "cash",
                transactionDate: "2026-09-10",
                description: "Category deletion test"
            });
        expect(transaction.statusCode).toBe(201);
        const response = await request(app).delete(`/api/categories/${category._id}`)
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(409);
    });
});
