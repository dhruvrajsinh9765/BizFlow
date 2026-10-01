import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../app");
const { createAuthenticatedUser, authHeader } = require("../helpers/auth");
const { generateTestBusinessData, generateTestContactData } = require("../helpers/testData");

const setup = async () => {
    const auth = await createAuthenticatedUser();
    const business = await request(app).post("/api/business")
        .set(authHeader(auth.accessToken)).send(generateTestBusinessData());
    expect(business.statusCode).toBe(201);
    return auth;
};

const createContact = async (accessToken, overrides = {}) => {
    const response = await request(app).post("/api/contacts")
        .set(authHeader(accessToken)).send({ ...generateTestContactData(), ...overrides });
    expect(response.statusCode).toBe(201);
    return response.body.contact;
};

describe("Business Contact API", () => {
    test("CON-01 should create a customer contact", async () => {
        const { accessToken } = await setup();
        const contact = await createContact(accessToken, { contactType: "customer" });
        expect(contact.name).toBeTruthy();
        expect(contact.contactType).toBe("customer");
    });

    test("CON-02 should create a supplier contact", async () => {
        const { accessToken } = await setup();
        const contact = await createContact(accessToken, { contactType: "supplier" });
        expect(contact.contactType).toBe("supplier");
    });

    test("CON-03 should reject missing contact data", async () => {
        const { accessToken } = await setup();
        const response = await request(app).post("/api/contacts")
            .set(authHeader(accessToken)).send({});
        expect(response.statusCode).toBe(400);
    });

    test("CON-04 should reject an empty contact name", async () => {
        const { accessToken } = await setup();
        const response = await request(app).post("/api/contacts")
            .set(authHeader(accessToken)).send({ ...generateTestContactData(), name: "   " });
        expect(response.statusCode).toBe(400);
    });

    test("CON-05 should reject an invalid phone number", async () => {
        const { accessToken } = await setup();
        const response = await request(app).post("/api/contacts")
            .set(authHeader(accessToken)).send({ ...generateTestContactData(), phone: "123" });
        expect(response.statusCode).toBe(400);
    });

    test("CON-06 should reject an invalid contact type filter", async () => {
        const { accessToken } = await setup();
        const response = await request(app).get("/api/contacts?contactType=other")
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(400);
    });

    test("CON-07 should list contacts with a type filter", async () => {
    const { accessToken } = await setup();

    await createContact(accessToken, {
        contactType: "customer",
        email: "customer@test.com",
        phone: "9876543210"
    });

    await createContact(accessToken, {
        contactType: "supplier",
        email: "supplier@test.com",
        phone: "9876543211"
    });

    const response = await request(app)
        .get("/api/contacts?contactType=customer")
        .set(authHeader(accessToken));

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(
        response.body.every(
            (c) => c.contactType === "customer"
        )
    ).toBe(true);
});

    test("CON-08 should get a contact by id", async () => {
        const { accessToken } = await setup();
        const contact = await createContact(accessToken);
        const response = await request(app).get(`/api/contacts/${contact._id}`)
            .set(authHeader(accessToken));
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(contact._id);
    });

    test("CON-09 should update a contact", async () => {
        const { accessToken } = await setup();
        const contact = await createContact(accessToken);
        const response = await request(app).put(`/api/contacts/${contact._id}`)
            .set(authHeader(accessToken)).send({ name: "Updated Contact", phone: "9999999999" });
        expect(response.statusCode).toBe(200);
        expect(response.body.contact.name).toBe("Updated Contact");
        expect(response.body.contact.phone).toBe("9999999999");
    });

    test("CON-10 should soft-delete a contact and hide it from active results", async () => {
        const { accessToken } = await setup();
        const contact = await createContact(accessToken);
        const deleted = await request(app).delete(`/api/contacts/${contact._id}`)
            .set(authHeader(accessToken));
        expect(deleted.statusCode).toBe(200);
        const get = await request(app).get(`/api/contacts/${contact._id}`)
            .set(authHeader(accessToken));
        expect(get.statusCode).toBe(404);
    });
});
