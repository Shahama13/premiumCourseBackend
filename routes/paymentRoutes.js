import express from "express"
import { userAuth } from "../middlewares/auth.js";
import { buySubscription, cancelSubscription, getRazorpayKey, paymentVerification } from "../controllers/paymentController.js";

const router = express.Router()

// Buy subscription
router.route("/subscribe").post(userAuth, buySubscription)

// Verify payment and save refence in databse
router.route("/paymentverfication").post(userAuth, paymentVerification)

// get razorpay key
router.route("/razorpaykey").get(getRazorpayKey)

//cancel subscription
router.route("/subscription/cancel").delete(userAuth, cancelSubscription)

export default router;