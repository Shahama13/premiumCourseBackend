import mongoose from "mongoose";

const schema = new mongoose.Schema({
    razorpay_signature: {
        type: String,
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_order_id: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const Payment = mongoose.model("Payment", schema)

export default Payment