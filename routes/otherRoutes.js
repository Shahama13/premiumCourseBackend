import express from "express"
import { contact } from "../controllers/otherControllers.js";

const router = express.Router();

// contact form 
router.route("/contact").post(contact)

export default router;