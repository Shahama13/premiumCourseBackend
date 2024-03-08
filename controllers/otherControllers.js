import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorClass from "../utils/errorClass.js";
import sendMail from "../utils/sendMail.js";

export const contact = catchAsyncError(async (req, res, next) => {
    const { name, email, message } = req.body
    if(!name || !email || !message) return next(new ErrorClass("Please enter all fields", 400))
    const to = process.env.SMPT_MAIL
    const subject = `Contact from ${name} at Course`
    const text = `I am ${name} and my email is ${email}. \n ${message}`

    await sendMail(to, subject, text)

    res.status(200).json({
        success: true,
        message:" Your message has been sent "
    })
})
