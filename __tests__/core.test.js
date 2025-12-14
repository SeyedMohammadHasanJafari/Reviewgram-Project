// __tests__/core.test.js
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app.js";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Review from "../models/review.model.js";

const TEST_DB_URL = "mongodb://127.0.0.1:27017/movie_review_test_core";

describe("Core Features Integration Tests", () => {
  let userCookie;
  let userId;
  let movieId;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URL);
    mongoose.set("strictQuery", true);
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    await request(app).post("/auth/signup").send({
      nickname: "Reviewer",
      email: "reviewer@test.com",
      password: "password123",
      role: "user",
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "reviewer@test.com",
      password: "password123",
    });

    userCookie = loginRes.headers["set-cookie"][0];
    const user = await User.findOne({ email: "reviewer@test.com" });
    userId = user._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("1. Should allow authenticated user to add a movie", async () => {
    const res = await request(app)
      .post("/movie")
      .set("Cookie", userCookie)
      .send({
        name: "Inception",
        description: "A mind-bending sci-fi thriller",
        release_year: 2010,
        genre: "Science Fiction",
      });

    expect(res.statusCode).toEqual(302);

    const movie = await Movie.findOne({ name: "Inception" });
    expect(movie).toBeTruthy();
    expect(movie.release_year).toBe(2010);

    movieId = movie._id;
  });

  it("2. Should add a review and update movie rating", async () => {
    const movie = new Movie({
      name: "The Matrix",
      description: "Simulation world",
      release_year: 1999,
      user: userId,
      genre: "Action/Adventure",
    });
    await movie.save();

    const res = await request(app)
      .post("/review")
      .set("Cookie", userCookie)
      .send({
        title: "Masterpiece",
        description: "Changed my life",
        rating: 5,
        movieId: movie._id,
      });

    expect(res.statusCode).toEqual(302);

    const review = await Review.findOne({ title: "Masterpiece" });
    expect(review).toBeTruthy();
    expect(review.rating).toBe(5);

    const updatedMovie = await Movie.findById(movie._id);
    expect(updatedMovie.users_rating).toBe(5);
    expect(updatedMovie.number_of_users_rating).toBe(1);
  });
});
