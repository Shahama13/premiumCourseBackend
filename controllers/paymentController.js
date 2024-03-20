import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import User from "../models/User.js";
import ErrorClass from "../utils/errorClass.js";
import { instance } from "../server.js"
import crypto from "crypto"
import Payment from "../models/Payment.js"

export const buySubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (user.role === "admin") return next(new ErrorClass("Admin can't subscribe", 400))

    // const plan_id = process.env.PLAN_ID || "plan_NjsJFAoe2jhd2P"
    const order = await instance.orders.create({
        amount: Number(req.body.amount * 100),  // amount in the smallest currency unit
        currency: "INR",
    })

    user.subscription.id = `${order.id}+${req.body.courseId}`;
    user.subscription.status = order.status

    await user.save();

    res.status(201).json({
        success: true,
        subscriptionId: order.id,
    })
})

export const paymentVerification = catchAsyncError(async (req, res, next) => {
    const { razorpay_signature, razorpay_payment_id, razorpay_order_id } = req.body
    const user = await User.findById(req.user._id);
    const order_id = user.subscription.id.split("+")[0];
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(order_id + "|" + razorpay_payment_id, "utf-8")
        .digest("hex")
    const isAuthentic = generated_signature === razorpay_signature
    if (!isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/fail`)

    // database comes here
    await Payment.create({
        razorpay_signature, razorpay_payment_id, razorpay_order_id
    })
    user.subscription.status = "active"
    user.purchases.unshift(user.subscription.id.split("+")[1])
    await user.save()
    res.redirect(`${process.env.FRONTEND_URL}/profile`)

})

export const getRazorpayKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })
})


export const cancelSubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;
    let refund = false;
    await instance.subscriptions.cancel(subscriptionId)
    const payment = await Payment.findOne({ razorpay_subscription_id: subscriptionId })

    const gap = Date.now() - payment.createdAt;

    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000

    if (refundTime > gap) {
        await instance.payments.refund(payment.razorpay_payment_id)
        refund = true
    }

    await Payment.findByIdAndDelete(payment._id);
    user.subscription.id = undefined
    user.subscription.status = undefined
    await user.save();


    res.status(200).json({
        success: true,
        message: refund ? "Subscription cancelled, You will recieve full refund within 7 days" :
            "No refund initiated as subscription was cancelled after 7 days "
    })
})