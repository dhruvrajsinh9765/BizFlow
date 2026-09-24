import { describe, test, expect } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const app = require("../app");

describe("Root API", () => {
    test("GET / should return backend running message", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("BizFlow Backend is Running");
    });
});