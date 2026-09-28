import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const app = require("../../app");
const User = require("../../models/User");

const {
    createAuthenticatedUser,
    loginTestUser,
    authHeader
} = require("../helpers/auth");


describe("Authentication API", () => {

    describe("POST /api/users/register", () => {

        test("AUTH-01: should register a user with valid data", async () => {
            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "Dhruv Test",
                    email: "dhruv-auth-01@example.com",
                    password: "Test@123456"
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty(
                "message",
                "User registered successfully"
            );

            expect(response.body).toHaveProperty("user");

            expect(response.body.user).toHaveProperty("id");
            expect(response.body.user.name).toBe("Dhruv Test");
            expect(response.body.user.email)
                .toBe("dhruv-auth-01@example.com");

            // Password should never be returned
            expect(response.body.user)
                .not.toHaveProperty("password");
        });


        test("AUTH-02: should reject registration when name is missing", async () => {
            const response = await request(app)
                .post("/api/users/register")
                .send({
                    email: "missing-name@example.com",
                    password: "Test@123456"
                });

            expect(response.statusCode).toBe(400);
        });


        test("AUTH-03: should reject registration when name is empty", async () => {
            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "   ",
                    email: "empty-name@example.com",
                    password: "Test@123456"
                });

            expect(response.statusCode).toBe(400);
        });


        test("AUTH-04: should reject registration when email is missing", async () => {
            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "Test User",
                    password: "Test@123456"
                });

            expect(response.statusCode).toBe(400);
        });


        test("AUTH-05: should reject registration with invalid email", async () => {
            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "Test User",
                    email: "invalid-email",
                    password: "Test@123456"
                });

            expect(response.statusCode).toBe(400);
        });


        test("AUTH-06: should reject registration when password is missing", async () => {
            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "Test User",
                    email: "missing-password@example.com"
                });

            expect(response.statusCode).toBe(400);
        });


        test("AUTH-07: should reject password shorter than 6 characters", async () => {
            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "Test User",
                    email: "short-password@example.com",
                    password: "12345"
                });

            expect(response.statusCode).toBe(400);
        });


        test("AUTH-08: should reject duplicate email", async () => {
            const email = "duplicate@example.com";

            await request(app)
                .post("/api/users/register")
                .send({
                    name: "First User",
                    email,
                    password: "Test@123456"
                });

            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "Second User",
                    email,
                    password: "Test@123456"
                });

            expect(response.statusCode).toBe(409);

            expect(response.body.message)
                .toBe("User already exists");
        });


        test("AUTH-09: should reject duplicate email with different casing", async () => {
            const email = "CaseTest@example.com";

            await request(app)
                .post("/api/users/register")
                .send({
                    name: "First User",
                    email,
                    password: "Test@123456"
                });

            const response = await request(app)
                .post("/api/users/register")
                .send({
                    name: "Second User",
                    email: "CASETEST@EXAMPLE.COM",
                    password: "Test@123456"
                });

            expect(response.statusCode).toBe(409);

            expect(response.body.message)
                .toBe("User already exists");
        });


        test("AUTH-10: should persist registered user in database", async () => {
            const email = "persist@example.com";

            await request(app)
                .post("/api/users/register")
                .send({
                    name: "Persistent User",
                    email,
                    password: "Test@123456"
                });

            const user = await User.findOne({ email });

            expect(user).not.toBeNull();
            expect(user.name).toBe("Persistent User");
            expect(user.email).toBe(email);

            // Password must be stored hashed, not as plain text
            expect(user.password).not.toBe("Test@123456");
        });

    });

    describe("POST /api/users/login", () => {

    test("AUTH-11: should login successfully with valid credentials", async () => {
        const email = "login-success@example.com";
        const password = "Test@123456";

        await request(app)
            .post("/api/users/register")
            .send({
                name: "Login User",
                email,
                password
            });

        const response = await request(app)
            .post("/api/users/login")
            .send({
                email,
                password
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty(
            "message",
            "Login successful"
        );

        expect(response.body).toHaveProperty("accessToken");

        expect(response.body).toHaveProperty("user");
        expect(response.body.user.email).toBe(email);

        // Refresh token should NOT be exposed in response body
        expect(response.body).not.toHaveProperty("refreshToken");

        // Refresh token should be sent as HTTP-only cookie
        expect(response.headers["set-cookie"]).toBeDefined();

        expect(
            response.headers["set-cookie"]
                .some((cookie) => cookie.startsWith("refreshToken="))
        ).toBe(true);
    });


    test("AUTH-12: should reject login with wrong password", async () => {
        const email = "wrong-password@example.com";

        await request(app)
            .post("/api/users/register")
            .send({
                name: "Wrong Password User",
                email,
                password: "Test@123456"
            });

        const response = await request(app)
            .post("/api/users/login")
            .send({
                email,
                password: "Wrong@123456"
            });

        expect(response.statusCode).toBe(401);

        expect(response.body.message)
            .toBe("Invalid email or password");
    });


    test("AUTH-13: should reject login with nonexistent email", async () => {
        const response = await request(app)
            .post("/api/users/login")
            .send({
                email: "does-not-exist@example.com",
                password: "Test@123456"
            });

        expect(response.statusCode).toBe(401);

        expect(response.body.message)
            .toBe("Invalid email or password");
    });


    test("AUTH-14: should login successfully with different email casing", async () => {
        const email = "CaseLogin@example.com";
        const password = "Test@123456";

        await request(app)
            .post("/api/users/register")
            .send({
                name: "Case Login User",
                email,
                password
            });

        const response = await request(app)
            .post("/api/users/login")
            .send({
                email: "CASELOGIN@EXAMPLE.COM",
                password
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Login successful");

        expect(response.body.user.email)
            .toBe("caselogin@example.com");

        expect(response.body).toHaveProperty("accessToken");
    });


    test("AUTH-15: should reject login when email is missing", async () => {
        const response = await request(app)
            .post("/api/users/login")
            .send({
                password: "Test@123456"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.message)
            .toBe("Email and password are required");
    });


    test("AUTH-16: should reject login when password is missing", async () => {
        const response = await request(app)
            .post("/api/users/login")
            .send({
                email: "missing-password-login@example.com"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.message)
            .toBe("Email and password are required");
    });

});

describe("Protected routes and access token", () => {

    test("AUTH-17: should access protected route with valid access token", async () => {
        const { accessToken, user } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/users/profile")
            .set(authHeader(accessToken));

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe(user.name);
        expect(response.body.email).toBe(user.email);

        // Password must not be returned
        expect(response.body).not.toHaveProperty("password");
    });


    test("AUTH-18: should reject protected route without authorization header", async () => {
        const response = await request(app)
            .get("/api/users/profile");

        expect(response.statusCode).toBe(401);
    });


    test("AUTH-19: should reject protected route with invalid access token", async () => {
        const response = await request(app)
            .get("/api/users/profile")
            .set(
                "Authorization",
                "Bearer invalid-access-token"
            );

        expect(response.statusCode).toBe(401);
    });


    test("AUTH-20: should reject access token after its session is invalidated", async () => {
        const {
            accessToken,
            user
        } = await createAuthenticatedUser();

        const Session = require("../../models/Session");

        // Confirm that the session exists
        const sessionBeforeLogout = await Session.findOne({
            userId: user._id
        });

        expect(sessionBeforeLogout).not.toBeNull();

        // Invalidate the session directly
        await Session.deleteOne({
            _id: sessionBeforeLogout._id
        });

        // Access token itself may still be cryptographically valid,
        // but the session no longer exists.
        const response = await request(app)
            .get("/api/users/profile")
            .set(authHeader(accessToken));

        expect(response.statusCode).toBe(401);
    });

});

describe("Logout", () => {

    test("AUTH-21: should logout successfully and invalidate the session", async () => {
        const {
            accessToken,
            refreshTokenCookie
        } = await createAuthenticatedUser();

        const logoutResponse = await request(app)
            .post("/api/users/logout")
            .set(authHeader(accessToken))
            .set("Cookie", refreshTokenCookie);

        expect(logoutResponse.statusCode).toBe(200);

        expect(logoutResponse.body.message)
            .toBe("Logout successful");

        // The same access token should no longer work
        // because its session was deleted.
        const profileResponse = await request(app)
            .get("/api/users/profile")
            .set(authHeader(accessToken));

        expect(profileResponse.statusCode).toBe(401);
    });


    test("AUTH-22: should logout from all devices and invalidate all sessions", async () => {
        const user = await createAuthenticatedUser();

        const secondLogin = await loginTestUser(user.user);

        // Both sessions should initially work
        const firstProfile = await request(app)
            .get("/api/users/profile")
            .set(authHeader(user.accessToken));

        const secondProfile = await request(app)
            .get("/api/users/profile")
            .set(authHeader(secondLogin.accessToken));

        expect(firstProfile.statusCode).toBe(200);
        expect(secondProfile.statusCode).toBe(200);

        // Logout from all devices
        const logoutAllResponse = await request(app)
            .post("/api/users/logout-all")
            .set(authHeader(user.accessToken));

        expect(logoutAllResponse.statusCode).toBe(200);

        expect(logoutAllResponse.body.message)
            .toBe("Logged out from all devices successfully");

        // First session should no longer work
        const firstAfterLogout = await request(app)
            .get("/api/users/profile")
            .set(authHeader(user.accessToken));

        expect(firstAfterLogout.statusCode).toBe(401);

        // Second session should also no longer work
        const secondAfterLogout = await request(app)
            .get("/api/users/profile")
            .set(authHeader(secondLogin.accessToken));

        expect(secondAfterLogout.statusCode).toBe(401);
    },10000);

});


describe("GET /api/users/profile", () => {

    test("AUTH-23: should return the authenticated user's profile", async () => {
        const {
            accessToken,
            user
        } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/users/profile")
            .set(authHeader(accessToken));

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe(user.name);
        expect(response.body.email).toBe(user.email);

        // Password must never be returned
        expect(response.body).not.toHaveProperty("password");
    });

});


describe("PUT /api/users/profile", () => {

    test("AUTH-24: should update profile with valid data", async () => {
        const {
            accessToken,
            user
        } = await createAuthenticatedUser();

        const response = await request(app)
            .put("/api/users/profile")
            .set(authHeader(accessToken))
            .send({
                name: "Updated Test User",
                email: "updated-profile@example.com"
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Profile updated successfully");

        expect(response.body.user.name)
            .toBe("Updated Test User");

        expect(response.body.user.email)
            .toBe("updated-profile@example.com");

        // Verify database state
        const updatedUser = await User.findById(user._id);

        expect(updatedUser).not.toBeNull();
        expect(updatedUser.name).toBe("Updated Test User");
        expect(updatedUser.email)
            .toBe("updated-profile@example.com");
    });


    test("AUTH-25: should reject invalid profile email", async () => {
        const { accessToken } = await createAuthenticatedUser();

        const response = await request(app)
            .put("/api/users/profile")
            .set(authHeader(accessToken))
            .send({
                email: "invalid-email"
            });

        expect(response.statusCode).toBe(400);
    });


    test(
    "AUTH-26: should reject duplicate profile email",
    async () => {
        const firstUser = await createAuthenticatedUser();

        await createAuthenticatedUser({
            email: "existing-profile@example.com"
        });

        const response = await request(app)
            .put("/api/users/profile")
            .set(authHeader(firstUser.accessToken))
            .send({
                email: "existing-profile@example.com"
            });

        expect(response.statusCode).toBe(409);

        expect(response.body.message)
            .toBe("Email already exists");
    },
    10000
);


    test("AUTH-27: should reject unauthenticated profile request", async () => {
        const response = await request(app)
            .get("/api/users/profile");

        expect(response.statusCode).toBe(401);
    });

});

});