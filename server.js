import app from "./app.js";
import { connectDB } from "./config/database.js"
import cloudinary from "cloudinary"
import RazorPay from "razorpay"

connectDB()

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

export const instance = new RazorPay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});



app.listen(process.env.PORT, () => {
    console.log(`Server working on PORT ${process.env.PORT}`)
})

