import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Import bcrypt to hash passwords
import { app } from "../app.js";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Review from "../models/review.model.js";

const TEST_DB_URL = "mongodb://127.0.0.1:27017/movie_review_test";

describe("Admin Route Integration Tests", () => {
    let adminCookie;
    let userCookie;
    let adminId;

    beforeAll(async () => {
        await mongoose.connect(TEST_DB_URL);
        mongoose.set("strictQuery", true);
    });

    beforeEach(async () => {
        // 1. Clean the database
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        
        // 2. Setup: Create an Admin User with a HASHED password
        const hashedPassword = await bcrypt.hash("adminpassword", 10);
        
        const admin = await User.create({
            nickname: "AdminUser",
            email: "admin@example.com",
            password: hashedPassword, // Store the hashed password
            role: "admin"
        });
        adminId = admin._id;

        // 3. Login as Admin to get the cookie
        const resAdmin = await request(app).post("/auth/login").send({
            email: "admin@example.com",
            password: "adminpassword", // Send plain text (controller compares with hash)
        });
        adminCookie = resAdmin.headers["set-cookie"];

        // 4. Setup: Create a Regular User via Signup (easiest way to handle hashing)
        await request(app).post("/auth/signup").send({
            nickname: "RegularUser",
            email: "user@example.com",
            password: "userpassword",
            role: "user"
        });

        // 5. Login as Regular User
        const resUser = await request(app).post("/auth/login").send({
            email: "user@example.com",
            password: "userpassword",
        });
        userCookie = resUser.headers["set-cookie"];
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    // --- TEST CASES ---

    it("1. GET /admin/ - Should allow admin to access the dashboard", async () => {
        const res = await request(app)
            .get("/admin/")
            .set("Cookie", adminCookie); 

        expect(res.statusCode).toEqual(200);
        expect(res.type).toBe("text/html");
        expect(res.text).toContain("MovieReview - Admin"); 
    });

    it("2. GET /admin/ - Should DENY access to non-admin users", async () => {
        const res = await request(app)
            .get("/admin/")
            .set("Cookie", userCookie); 

        // Expect Access Denied
        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toBe("Access denied");
    });

    it("3. GET /admin/users - Should list users for admin", async () => {
        const res = await request(app)
            .get("/admin/users")
            .set("Cookie", adminCookie);

        expect(res.statusCode).toEqual(200);
        expect(res.type).toBe("text/html");
        expect(res.text).toContain("RegularUser"); 
    });

    it("4. POST /admin/movie/delete - Should delete a movie", async () => {
        const movie = await Movie.create({
            name: "Delete Me",
            description: "Test Description",
            release_year: 2023,
            user: adminId
        });

        const res = await request(app)
            .post("/admin/movie/delete")
            .set("Cookie", adminCookie)
            .send({ movieId: movie._id });

        expect(res.statusCode).toEqual(302);
        
        const deletedMovie = await Movie.findById(movie._id);
        expect(deletedMovie).toBeNull();
    });

    it("5. GET /admin/reviews - Should list reviews", async () => {
        const res = await request(app)
            .get("/admin/reviews")
            .set("Cookie", adminCookie);

        expect(res.statusCode).toEqual(200);
        expect(res.type).toBe("text/html");
    });

    it("6. POST /admin/review/update - Should approve/reject a review", async () => {
        const movie = await Movie.create({
            name: "Reviewed Movie",
            release_year: 2023,
            user: adminId
        });
        
        // NOTE: Using "pendding" (double d) to match your model's typo
        const review = await Review.create({
            title: "Great Movie",
            movie: movie._id,
            user: adminId,
            status: "pendding" 
        });

        const res = await request(app)
            .post("/admin/review/update")
            .set("Cookie", adminCookie)
            .send({ 
                reviewId: review._id,
                status: "approved"
            });

        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toBe("/admin/reviews");

        const updatedReview = await Review.findById(review._id);
        expect(updatedReview.status).toBe("approved");
    });
});
