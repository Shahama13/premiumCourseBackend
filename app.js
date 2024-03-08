import express from "express"
import { config } from "dotenv";
import courseR from "./routes/courseRoutes.js"
import userR from "./routes/userRoutes.js"
import otherR from "./routes/otherRoutes.js"
import paymentR from "./routes/paymentRoutes.js"
import errorMiddleware from "./middlewares/error.js"
import cookieParser from "cookie-parser";
import cors from "cors"

config({
    path: "./config/config.env"
})

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))


app.use("/api/v1", courseR)
app.use("/api/v1", userR)
app.use("/api/v1", otherR)
app.use("/api/v1", paymentR)


export default app;

app.use(errorMiddleware)
