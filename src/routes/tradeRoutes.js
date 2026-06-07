import express from "express";
import { tradeItem } from "../controllers/tradeController.js";

const router = express.Router();

router.get("/", (req, res) => res.render("trade"));
router.post("/", tradeItem);

export default router;