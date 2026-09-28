import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const app = require("../../app");
const Business = require("../../models/Business");

const {
    createAuthenticatedUser,
    authHeader
} = require("../helpers/auth");

const {
    generateTestBusinessData
} = require("../helpers/testData");


describe("Business API", () => {

    // BUS-01
    test("should create a business with valid data", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        const response = await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        expect(response.statusCode).toBe(201);

        expect(response.body.message).toBe(
            "Business created successfully"
        );

        expect(response.body.business).toBeDefined();
        expect(response.body.business.businessName).toBe(
            businessData.businessName
        );
        expect(response.body.business.businessType).toBe(
            businessData.businessType
        );
        expect(response.body.business.phone).toBe(
            businessData.phone
        );
        expect(response.body.business.email).toBe(
            businessData.email
        );
        expect(response.body.business.address).toBe(
            businessData.address
        );
    });


    // BUS-02
    test("should reject business creation when business name is missing", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        delete businessData.businessName;

        const response = await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        expect(response.statusCode).toBe(400);
    });


    // BUS-03
    test("should reject business creation when business type is missing", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        delete businessData.businessType;

        const response = await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        expect(response.statusCode).toBe(400);
    });


    // BUS-04
    test("should reject business creation with an invalid phone number", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        businessData.phone = "12345";

        const response = await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        expect(response.statusCode).toBe(400);
    });


    // BUS-05
    test("should reject business creation with an invalid email", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        businessData.email = "invalid-email";

        const response = await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        expect(response.statusCode).toBe(400);
    });


    // BUS-06
    test("should get the authenticated user's business", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        const response = await request(app)
            .get("/api/business")
            .set(authHeader(accessToken));

        expect(response.statusCode).toBe(200);

        expect(response.body.businessName).toBe(
            businessData.businessName
        );

        expect(response.body.businessType).toBe(
            businessData.businessType
        );

        expect(response.body.phone).toBe(
            businessData.phone
        );

        expect(response.body.email).toBe(
            businessData.email
        );
    });


    // BUS-07
    test("should update the authenticated user's business", async () => {
        const { accessToken, user } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        const updateData = {
            businessName: "Updated Business",
            phone: "9999999999",
            address: "Updated Address"
        };

        const response = await request(app)
            .put("/api/business")
            .set(authHeader(accessToken))
            .send(updateData);

        expect(response.statusCode).toBe(200);

        expect(response.body.message).toBe(
            "Business updated successfully"
        );

        expect(response.body.business.businessName).toBe(
            "Updated Business"
        );

        expect(response.body.business.phone).toBe(
            "9999999999"
        );

        expect(response.body.business.address).toBe(
            "Updated Address"
        );

        const business = await Business.findOne({
            userId: user._id
        });

        expect(business.businessName).toBe("Updated Business");
        expect(business.phone).toBe("9999999999");
        expect(business.address).toBe("Updated Address");
    });


    // BUS-08
    test("should reject an update when no fields are provided", async () => {
        const { accessToken } = await createAuthenticatedUser();
        const businessData = generateTestBusinessData();

        await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(businessData);

        const response = await request(app)
            .put("/api/business")
            .set(authHeader(accessToken))
            .send({});

        expect(response.statusCode).toBe(400);
    });


    // BUS-09
    test("should reject unauthenticated business requests", async () => {
        const response = await request(app)
            .get("/api/business");

        expect(response.statusCode).toBe(401);
    });


    // BUS-10
    test("should prevent a user from creating a second business", async () => {
        const { accessToken } = await createAuthenticatedUser();

        const firstBusiness = generateTestBusinessData();

        await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(firstBusiness);

        const secondBusiness = generateTestBusinessData();

        const response = await request(app)
            .post("/api/business")
            .set(authHeader(accessToken))
            .send(secondBusiness);

        expect(response.statusCode).toBe(409);

        expect(response.body.message).toBe(
            "You have already created a business profile"
        );
    });

});