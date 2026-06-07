import express from "express";
import { getItems, buyItem } from "../controllers/itemController.js";

const router = express.Router();

router.get("/", getItems);
router.post("/buy", buyItem);

export default router;