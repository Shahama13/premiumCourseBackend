import mongoose from "mongoose"

export const connectDB = async () => {

    const { connection } = await mongoose.connect(process.env.DB_URL)
    console.log(`Database connected with ${connection.host}`)
}