import express from "express";

import {
    processJarvisCommand
} from "../controllers/jarvisController.js";

const router = express.Router();

router.post(
    "/api/jarvis/command",
    processJarvisCommand
);

export default router;