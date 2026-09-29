import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../app");
const { createAuthenticatedUser, authHeader } = require("../helpers/auth");
const { generateTestBusinessData, generateTestCategoryData, generateTestContactData } = require("../helpers/testData");

const setup = async () => {
    const auth = await createAuthenticatedUser();
    const business = await request(app).post("/api/business")
        .set(authHeader(auth.accessToken)).send(generateTestBusinessData());
    expect(business.statusCode).toBe(201);
    return auth;
};

const category = async (accessToken, type) => {
    const response = await request(app).post("/api/categories")
        .set(authHeader(accessToken)).send(generateTestCategoryData(type));
    expect(response.statusCode).toBe(201);
    return response.body.category;
};

const contact = async (accessToken) => {
    const response = await request(app).post("/api/contacts")
        .set(authHeader(accessToken)).send(generateTestContactData());
    expect(response.statusCode).toBe(201);
    return response.body.contact;
};

const createTransaction = async (accessToken, categoryId, overrides = {}) => {
    return request(app).post("/api/transactions")
        .set(authHeader(accessToken)).send({
            categoryId,
            amount: 1000,
            paymentMethod: "cash",
            transactionDate: "2026-09-15",
            description: "Test transaction",
            ...overrides
        });
};

describe("Transaction API", () => {
    test("TRX-01 should create an income transaction", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const response = await createTransaction(accessToken, cat._id);
        expect(response.statusCode).toBe(201);
        expect(response.body.transaction.amount).toBe(1000);
        expect(response.body.transaction.categoryId).toBe(cat._id);
    });

    test("TRX-02 should create an expense transaction", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "expense");
        const response = await createTransaction(accessToken, cat._id);
        expect(response.statusCode).toBe(201);
    });

    test("TRX-03 should reject a missing category", async () => {
        const { accessToken } = await setup();
        const response = await createTransaction(accessToken, undefined);
        expect(response.statusCode).toBe(400);
    });

    test("TRX-04 should reject a missing amount", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const response = await createTransaction(accessToken, cat._id, { amount: undefined });
        expect(response.statusCode).toBe(400);
    });

    test("TRX-05 should reject an invalid payment method", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const response = await createTransaction(accessToken, cat._id, { paymentMethod: "bitcoin" });
        expect(response.statusCode).toBe(400);
    });

    test("TRX-06 should reject an amount above the maximum", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const response = await createTransaction(accessToken, cat._id, { amount: 100000001 });
        expect(response.statusCode).toBe(400);
    });

    test("TRX-07 should reject a category belonging to another business", async () => {
        const first = await setup();
        const second = await setup();
        const cat = await category(first.accessToken, "income");
        const response = await createTransaction(second.accessToken, cat._id);
        expect(response.statusCode).toBe(404);
    });

    test("TRX-08 should accept a valid contact", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const con = await contact(accessToken);
        const response = await createTransaction(accessToken, cat._id, { contactId: con._id });
        expect(response.statusCode).toBe(201);
        expect(response.body.transaction.contactId).toBe(con._id);
    });

    test("TRX-09 should reject a contact belonging to another business", async () => {
        const first = await setup();
        const second = await setup();
        const cat = await category(second.accessToken, "income");
        const con = await contact(first.accessToken);
        const response = await createTransaction(second.accessToken, cat._id, { contactId: con._id });
        expect(response.statusCode).toBe(404);
    });

    test("TRX-10 should list transactions with pagination", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        await createTransaction(accessToken, cat._id, { amount: 100 });
        await createTransaction(accessToken, cat._id, { amount: 200 });
        const response = await request(app).get("/api/transactions?page=1&limit=1")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body.transactions.length).toBe(1);
        expect(response.body.pagination.totalTransactions).toBe(2);
    });

    test("TRX-11 should reject an invalid pagination limit", async () => {
        const { accessToken } = await setup();
        const response = await request(app).get("/api/transactions?limit=101")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(400);
    });

    test("TRX-12 should get a transaction by id", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const created = await createTransaction(accessToken, cat._id);
        const response = await request(app).get(`/api/transactions/${created.body.transaction._id}`)
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(created.body.transaction._id);
    });

    test("TRX-13 should update a transaction", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const created = await createTransaction(accessToken, cat._id);
        const response = await request(app).put(`/api/transactions/${created.body.transaction._id}`)
            .set(authHeader(accessToken)).send({ amount: 2500, description: "Updated" });
        expect(response.statusCode).toBe(200);
        expect(response.body.transaction.amount).toBe(2500);
        expect(response.body.transaction.description).toBe("Updated");
    });

    test("TRX-14 should reject an empty transaction update", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const created = await createTransaction(accessToken, cat._id);
        const response = await request(app).put(`/api/transactions/${created.body.transaction._id}`)
            .set(authHeader(accessToken)).send({});
        expect(response.statusCode).toBe(400);
    });

    test("TRX-15 should delete a transaction", async () => {
        const { accessToken } = await setup();
        const cat = await category(accessToken, "income");
        const created = await createTransaction(accessToken, cat._id);
        const id = created.body.transaction._id;
        const deleted = await request(app).delete(`/api/transactions/${id}`)
            .set(authHeader(accessToken));
        expect(deleted.statusCode).toBe(200);
        const get = await request(app).get(`/api/transactions/${id}`)
            .set(authHeader(accessToken));
        expect(get.statusCode).toBe(404);
    });

    test("TRX-16 should reject an unauthenticated transaction request", async () => {
        const response = await request(app).get("/api/transactions");
        expect(response.statusCode).toBe(401);
    });
});
