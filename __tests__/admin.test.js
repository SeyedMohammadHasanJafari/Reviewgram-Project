import request from "supertest";
import mongoose from "mongoose";
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
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        
        const admin = await User.create({
            nickname: "AdminUser",
            email: "admin@example.com",
            password: "adminpassword", // Note: In a real app, ensure this matches your hashing logic if you have hooks
            role: "admin"
        });
        adminId = admin._id;

        const resAdmin = await request(app).post("/auth/login").send({
            email: "admin@example.com",
            password: "adminpassword",
        });
        adminCookie = resAdmin.headers["set-cookie"];

        await User.create({
            nickname: "RegularUser",
            email: "user@example.com",
            password: "userpassword",
            role: "user"
        });

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

    //  TEST CASES 

    it("1. GET /admin/ - Should allow admin to access the dashboard", async () => {
        const res = await request(app)
            .get("/admin/")
            .set("Cookie", adminCookie); // Send the admin cookie

        // Expect successful render (Status 200) and HTML content
        expect(res.statusCode).toEqual(200);
        expect(res.type).toBe("text/html");
        // Verify we are seeing the admin page content (based on the subject passed in admin.route.js)
        expect(res.text).toContain("MovieReview - Admin"); 
    });

    it("2. GET /admin/ - Should DENY access to non-admin users", async () => {
        const res = await request(app)
            .get("/admin/")
            .set("Cookie", userCookie); // Send the regular user cookie

        // Expect Access Denied (Status 401 based on your middleware)
        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toBe("Access denied");
    });

    it("3. GET /admin/users - Should list users for admin", async () => {
        const res = await request(app)
            .get("/admin/users")
            .set("Cookie", adminCookie);

        expect(res.statusCode).toEqual(200);
        expect(res.type).toBe("text/html");
        // The page should list the regular user we created
        expect(res.text).toContain("RegularUser"); 
    });

    it("4. POST /admin/movie/delete - Should delete a movie", async () => {
        // 1. Create a movie to delete
        const movie = await Movie.create({
            name: "Delete Me",
            description: "Test Description",
            release_year: 2023,
            user: adminId
        });

        // 2. Request deletion
        const res = await request(app)
            .post("/admin/movie/delete")
            .set("Cookie", adminCookie)
            .send({ movieId: movie._id });

        // 3. Expect redirect back to admin dashboard (Status 302)
        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toBe("/admin/");

        // 4. Verify movie is gone from Database
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
        // 1. Create a movie and review
        const movie = await Movie.create({
            name: "Reviewed Movie",
            release_year: 2023,
            user: adminId
        });
        
        const review = await Review.create({
            title: "Great Movie",
            movie: movie._id,
            user: adminId,
            status: "pending"
        });

        // 2. Request status update to 'approved'
        const res = await request(app)
            .post("/admin/review/update")
            .set("Cookie", adminCookie)
            .send({ 
                reviewId: review._id,
                status: "approved"
            });

        // 3. Expect redirect to reviews page
        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toBe("/admin/reviews");

        // 4. Verify status updated in Database
        const updatedReview = await Review.findById(review._id);
        expect(updatedReview.status).toBe("approved");
    });
});