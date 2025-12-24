import { Router } from "express";
const router = Router();
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Review from "../models/review.model.js";
import { verifyAdminToken } from "../middlewares/auth.middleware.js";

router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const userId = req.userId;
    const isLogin = userId ? true : false;
    const isAdmin = true;
    const movies = await Movie.find({});
    res.render("./admin/index", {
      subject: "MovieReview - Admin",
      movies: movies,
      isLogin: isLogin,
      isAdmin: isAdmin,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", verifyAdminToken, async (req, res) => {
  try {
    const userId = req.userId;
    const isLogin = userId ? true : false;
    const isAdmin = true;
    const users = await User.find({ role: "user" });
    res.render("./admin/users", {
      subject: "MovieReview - ",
      users: users,
      isLogin: isLogin,
      isAdmin: isAdmin,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/edit", verifyAdminToken, async (req, res) => {
  try {
    const userId = req.userId;
    const isLogin = userId ? true : false;
    const isAdmin = true;

    const user_id = req.body.user_id;
    const user = await User.findById(user_id);
    res.render("./admin/user_edit", {
      subject: "MovieReview - ",
      user: user,
      isLogin: isLogin,
      isAdmin: isAdmin,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/edit/save", verifyAdminToken, async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const user = await User.findById(user_id);
    await User.findByIdAndUpdate(user_id, { nickname: req.body.nickname });
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/delete", verifyAdminToken, async (req, res) => {
  try {
    const user_id = req.body.user_id;
    await User.findByIdAndDelete(user_id);
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/delete/multi", verifyAdminToken, async (req, res) => {
  try {
    const users_id = req.body.user_id;
    await User.deleteMany({ $in: user_id });
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/movie/add", verifyAdminToken, async (req, res) => {
  try {
    res.render("./admin/add_movie", {
      subject: "MovieReview - ",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/movie/:id", verifyAdminToken, async (req, res) => {
  try {
    const userId = req.userId;
    const isLogin = userId ? true : false;
    const isAdmin = true;
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    const reviews = await Review.find({ movie: movie });
    const users = [];
    for (let i = 0; i < reviews.length; i++) {
      users[i] = await User.findById(reviews[i].user);
    }
    res.render("./admin/movie", {
      subject: "MovieReview - ",
      movie: movie,
      reviews: reviews,
      users: users,
      isLogin: isLogin,
      isAdmin: isAdmin,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/movie/edit/:id", verifyAdminToken, async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    res.render("./admin/edit_movie", {
      subject: "MovieReview - ",
      movie: movie,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/movie/edit/save", verifyAdminToken, async (req, res) => {
  try {
    const { movieId, name, description, image, genre, release_year } = req.body;
    await Movie.findByIdAndUpdate(movieId, {
      name,
      description,
      image,
      genre,
      release_year,
    });
    res.redirect("/admin/movie/" + movieId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/movie/delete", verifyAdminToken, async (req, res) => {
  try {
    const movieId = req.body.movieId;
    await Movie.findByIdAndDelete(movieId);
    res.redirect("/admin/");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/reviews", verifyAdminToken, async (req, res) => {
  try {
    const userId = req.userId;
    const isLogin = userId ? true : false;
    const isAdmin = true;
    const user = await User.findById(userId);
    // const movies = await Movie.find({});
    const reviews = await Review.find({}).populate("user");
    res.render("./admin/reviews", {
      subject: "MovieReview - HomePage",
      reviews: reviews,
      isLogin: isLogin,
      isAdmin: isAdmin,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/review/update/approved", verifyAdminToken, async (req, res) => {
  try {
    const userId = req.userId;
    const isLogin = userId ? true : false;

    const reviewId = req.body.reviewId;
    const status = "approved";
    await Review.findByIdAndUpdate(reviewId, { status: status });
    res.redirect("/admin/reviews");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/review/update/declined", verifyAdminToken, async (req, res) => {
  try {
    const userId = req.userId;
    const isLogin = userId ? true : false;

    const reviewId = req.body.reviewId;
    const status = "declined";
    await Review.findByIdAndUpdate(reviewId, { status: status });
    res.redirect("/admin/reviews");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
