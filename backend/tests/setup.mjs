import mongoose from "mongoose";
import { beforeAll, afterAll } from "vitest";
import dotenv from "dotenv";

dotenv.config({
    path: ".env.test"
});

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});