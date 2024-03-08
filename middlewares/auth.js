import jwt from "jsonwebtoken"
import { catchAsyncError } from "./catchAsyncError.js"
import ErrorClass from "../utils/errorClass.js";
import User from "../models/User.js";

export const userAuth = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) return next(new ErrorClass("Please login", 401))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded._id)

    next()

})

export const adminAuth = (req, res, next) => {

    if (req.user.role !== 'admin') return next(new ErrorClass(
        "Unauthorized Access: Admin Restricted", 401))
    next();
}

export const premiumSubscribers = (req, res, next) => {
    if (req.user.subscription.status !== "active" && req.user.role !== "admin")
        return next(new ErrorClass("Subscribe to Premium to access", 403))
    next()
}