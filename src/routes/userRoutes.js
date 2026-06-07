import express from "express";
import { registerUser, loginUser, getUserProfile, topUpUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/register", (req, res) => res.render("register"));
router.post("/register", registerUser);
router.get("/login", (req, res) => res.render("login"));
router.post("/login", loginUser);
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
router.post("/topup", topUpUser);
router.get("/users/:id", getUserProfile);

export default router;