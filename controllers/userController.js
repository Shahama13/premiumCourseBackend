import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import User from "../models/User.js";
import Course from "../models/Course.js"
import ErrorClass from "../utils/errorClass.js";
import sendMail from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto"
import cloudinary from "cloudinary"
import getDataUri from "../utils/getDataUri.js"

export const createAccount = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(new ErrorClass("Enter all fields", 400))
    let user = await User.findOne({ email })
    if (user) return next(new ErrorClass("User already exists", 409))
    user = await User.create({ name, email, password })
    sendToken(res, user, 201, "Sign Up Successful")

})

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return next(new ErrorClass("Enter all fields", 400))
    const user = await User.findOne({ email }).select("+password")
    if (!user) return next(new ErrorClass("Invalid email or password  ", 401))
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return next(new ErrorClass("Invalid email or password", 401))
    sendToken(res, user, 200, "Welcome Back")
})

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }).json({
        success: true,
        message: "Logout successful"
    })
})

export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: "purchases",
            populate: {
                path: "createdBy",
                select:"avatar name email"
            },
            select: "-lectures"
        })
        .populate({
            path: "playlist",
            populate: {
                path: "createdBy"  ,             
                select:"avatar name email",
            },
            select: "-lectures"
        })
    res.status(200).json({
        success: true,
        user
    })
})

export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) return next(new ErrorClass("Enter all fields", 400))
    const user = await User.findById(req.user._id).select("+password")
    const isMatched = await user.comparePassword(oldPassword)
    if (!isMatched) return next(new ErrorClass("Incorrect password", 401))
    user.password = newPassword
    await user.save()
    res.status(200).json({
        success: true,
        message: "Password Changed"
    })
})

export const updateProfile = catchAsyncError(async (req, res, next) => {


    const file = req.file;

    const user = await User.findById(req.user._id)


    if (user.avatar.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    }
    const fileUri = getDataUri(file)
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, { folder: "course" })
    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
    }


    await user.save();
    res.status(200).json({
        success: true,
        message: "Profile Updated"
    })
})

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body
    if (!email) return next(new ErrorClass("Enter your email", 400))
    const user = await User.findOne({ email })
    if (!user) return next(new ErrorClass("User not found", 400))
    const resetToken = await user.getResetToken()
    await user.save()

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    const message = `Click on the link to reset your password. ${url} If you have not requested this, then please ignore`

    await sendMail(user.email, "Reset Password", message);

    res.status(200).json({
        success: true,
        message: `Email sent to ${email} `
    })

})

export const resetPasword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })
    if (!user) return next(new ErrorClass("Invalid or Expired Token", 401))
    user.password = req.body.password
    user.resetPasswordToken = null
    user.resetPasswordExpire = null
    await user.save()
    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
})

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    const course = await Course.findById(req.query.id)
    if (!course) return next(new ErrorClass("Invalid Course Id", 404))

    // const itemExists = user.playlist.find((item) => {
    //     if (item.course.toString() === req.query.id.toString())
    //         return true;
    // })

    if (!user.playlist.includes(req.query.id)) {
        user.playlist.unshift(course._id)
        await user.save();
        res.status(200).json({
            success: true,
            message: "Added to your playlist"
        })
    }
    else {
        const latest = user.playlist.filter((item) => item.toString() !== course._id.toString())

        user.playlist = latest
        await user.save()

        res.status(200).json({
            success: true,
            message: "Removed from playlist"
        })

    }
})


// ADMIN routes
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

export const changeRole = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) return next(new ErrorClass("User not found", 404))

    user.role = (user.role === 'user') ? 'admin' : 'user';

    await user.save()
    res.status(200).json({
        success: true,
        message: `User role changed to ${user.role}`
    })
})
