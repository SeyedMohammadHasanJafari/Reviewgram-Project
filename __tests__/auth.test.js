// __tests__/auth.test.js
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app.js";
import User from "../models/user.model.js";

const TEST_DB_URL = "mongodb://127.0.0.1:27017/movie_review_test";

describe("Reviewgram Integration Tests", () => {
    let userCookie;
    let userId;

    beforeAll(async() => {
        await mongoose.connect(TEST_DB_URL);
        mongoose.set("strictQuery", true);
    });

    beforeEach(async() => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    afterAll(async() => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it("1. Should register a new user", async() => {
        const res = await request(app).post("/auth/signup").send({
            nickname: "TestUser",
            email: "test@example.com",
            password: "password123",
            role: "user",
        });

        expect(res.statusCode).toEqual(302);

        const user = await User.findOne({ email: "test@example.com" });
        expect(user).toBeTruthy();
        expect(user.nickname).toBe("TestUser");
    });

    it("2. Should login and return a cookie", async() => {
        await request(app).post("/auth/signup").send({
            nickname: "TestUser",
            email: "test@example.com",
            password: "password123",
            role: "user",
        });

        const res = await request(app).post("/auth/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(res.statusCode).toEqual(302);

        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeTruthy();
        userCookie = cookies[0];

        const user = await User.findOne({ email: "test@example.com" });
        userId = user._id;
    });
});