const request = require("supertest");
const app = require("../../app");

const {
    generateTestUserData
} = require("./testData");


const createTestUser = async (userData = {}) => {
    const data = {
        ...generateTestUserData(),
        ...userData
    };

    const response = await request(app)
        .post("/api/users/register")
        .send(data);

    if (response.statusCode !== 200) {
        throw new Error(
            `Test user registration failed: ${JSON.stringify(response.body)}`
        );
    }

    return {
        data,
        userId: response.body.user.id,
        response
    };
};


const loginTestUser = async (userData) => {
    const response = await request(app)
        .post("/api/users/login")
        .send({
            email: userData.email,
            password: userData.password
        });

    if (response.statusCode !== 200) {
        throw new Error(
            `Test user login failed: ${JSON.stringify(response.body)}`
        );
    }

    const setCookie = response.headers["set-cookie"];

    const refreshTokenCookie = setCookie
        ?.find((cookie) => cookie.startsWith("refreshToken="))
        ?.split(";")[0];

    return {
        response,
        accessToken: response.body.accessToken,
        refreshTokenCookie
    };
};


const createAuthenticatedUser = async (userData = {}) => {
    const user = await createTestUser(userData);

    const login = await loginTestUser(user.data);

    return {
        user: {
            ...user.data,
            _id: user.userId
        },
        accessToken: login.accessToken,
        refreshTokenCookie: login.refreshTokenCookie,
        loginResponse: login.response
    };
};


const authHeader = (accessToken) => {
    return {
        Authorization: `Bearer ${accessToken}`
    };
};


module.exports = {
    createTestUser,
    loginTestUser,
    createAuthenticatedUser,
    authHeader
};