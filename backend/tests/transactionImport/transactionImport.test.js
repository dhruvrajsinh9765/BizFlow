import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const app = require("../../app");

const {
    createAuthenticatedUser,
    authHeader
} = require("../helpers/auth");


describe("CSV Transaction Import API", () => {

    test("CSV-01 should reject unauthenticated CSV import requests", async () => {

        const csv = [
            "date,type,amount,category,description",
            "2026-09-01,income,5000,Sales,Product sale"
        ].join("\n");


        const response = await request(app)
            .post("/api/transactions/import")
            .set("Content-Type", "text/csv")
            .send(csv);


        expect(response.statusCode).toBe(401);
    });


    test("CSV-02 should import a valid CSV successfully", async () => {

        const auth = await createAuthenticatedUser();


        const business = await request(app)
            .post("/api/business")
            .set(authHeader(auth.accessToken))
            .send({
                businessName: "CSV Test Business",
                businessType: "Retail"
            });

        expect(business.statusCode).toBe(201);


        const category = await request(app)
            .post("/api/categories")
            .set(authHeader(auth.accessToken))
            .send({
                name: "Sales",
                type: "income"
            });

        expect(category.statusCode).toBe(201);


        const validCsv = [
            "date,type,amount,category,contact,description",
            "2026-09-01,income,25000,Sales,,Product sale",
            "2026-09-02,income,18000,Sales,,Product sale"
        ].join("\n");


        const response = await request(app)
            .post("/api/transactions/import")
            .set(authHeader(auth.accessToken))
            .set("Content-Type", "text/csv")
            .send(validCsv);


        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("CSV imported successfully");

        expect(response.body.totalRows)
            .toBe(2);

        expect(response.body.validRows)
            .toBe(2);

        expect(response.body.invalidRows)
            .toBe(0);

        expect(response.body.importedTransactions)
            .toBe(2);
    });


    test("CSV-03 should reject CSV with missing required columns", async () => {

        const auth = await createAuthenticatedUser();


        const business = await request(app)
            .post("/api/business")
            .set(authHeader(auth.accessToken))
            .send({
                businessName: "CSV Missing Column Business",
                businessType: "Retail"
            });

        expect(business.statusCode).toBe(201);


        // Description column is intentionally missing.
        const csv = [
            "date,type,amount,category",
            "2026-09-01,income,5000,Sales"
        ].join("\n");


        const response = await request(app)
            .post("/api/transactions/import")
            .set(authHeader(auth.accessToken))
            .set("Content-Type", "text/csv")
            .send(csv);


        expect(response.statusCode).toBe(400);

        expect(response.body.message)
            .toBe("Missing required columns: description");
    });


    test("CSV-04 should reject invalid row data", async () => {

        const auth = await createAuthenticatedUser();


        const business = await request(app)
            .post("/api/business")
            .set(authHeader(auth.accessToken))
            .send({
                businessName: "CSV Invalid Row Business",
                businessType: "Retail"
            });

        expect(business.statusCode).toBe(201);


        const category = await request(app)
            .post("/api/categories")
            .set(authHeader(auth.accessToken))
            .send({
                name: "Sales",
                type: "income"
            });

        expect(category.statusCode).toBe(201);


        const csv = [
            "date,type,amount,category,description",
            "2026-09-01,income,invalid,Sales,Invalid amount"
        ].join("\n");


        const response = await request(app)
            .post("/api/transactions/import")
            .set(authHeader(auth.accessToken))
            .set("Content-Type", "text/csv")
            .send(csv);


        expect(response.statusCode).toBe(400);

        expect(response.body.message)
            .toBe("CSV contains invalid rows");

        expect(response.body.totalRows)
            .toBe(1);

        expect(response.body.validRows)
            .toBe(0);

        expect(response.body.invalidRows)
            .toBe(1);

        expect(Array.isArray(response.body.errors))
            .toBe(true);

        expect(response.body.errors[0].row)
            .toBe(2);

        expect(response.body.errors[0].message)
            .toBe(
                "Amount must be a valid number greater than 0"
            );
    });


    test("CSV-05 should reject a CSV row when the category does not exist", async () => {

        const auth = await createAuthenticatedUser();


        const business = await request(app)
            .post("/api/business")
            .set(authHeader(auth.accessToken))
            .send({
                businessName: "CSV Category Business",
                businessType: "Retail"
            });

        expect(business.statusCode).toBe(201);


        const csv = [
            "date,type,amount,category,description",
            "2026-09-01,income,5000,Non Existing Category,Product sale"
        ].join("\n");


        const response = await request(app)
            .post("/api/transactions/import")
            .set(authHeader(auth.accessToken))
            .set("Content-Type", "text/csv")
            .send(csv);


        expect(response.statusCode).toBe(400);

        expect(response.body.message)
            .toBe("CSV contains invalid rows");

        expect(response.body.invalidRows)
            .toBe(1);

        expect(response.body.validRows)
            .toBe(0);

        expect(response.body.errors[0].row)
            .toBe(2);

        expect(response.body.errors[0].message)
            .toBe(
                "Category 'Non Existing Category' not found for type 'income'"
            );
    });


    test("CSV-06 should return 404 when the authenticated user has no business", async () => {

        const auth = await createAuthenticatedUser();


        const csv = [
            "date,type,amount,category,description",
            "2026-09-01,income,5000,Sales,Product sale"
        ].join("\n");


        const response = await request(app)
            .post("/api/transactions/import")
            .set(authHeader(auth.accessToken))
            .set("Content-Type", "text/csv")
            .send(csv);


        expect(response.statusCode).toBe(404);

        expect(response.body.message)
            .toBe("Business not found");
    });

});