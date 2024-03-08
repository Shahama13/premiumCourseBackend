import mongoose, { Mongoose } from "mongoose"

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter course title"],
        minLength: [4, "Title must be atleast 4 characters"],
        maxLength: [80, "Title cannot exceed 80 characters"],
    },
    description: {
        type: String,
        required: [true, "Please enter course title"],
        minLength: [10, "Title must be atleast 10 characters"],
    },
    lectures: [
        {
            video: {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            },
            title: {
                type: String,
                required: [true, "Please enter the title"]
            },
            description: {
                type: String,
                required: [true, "Please enter the description"]
            },
        }
    ],
    poster: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    views: {
        type: Number,
        default: 0
    },
    numOfVideos: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: [true, "Please choose category "]
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

const Course = mongoose.model("Course", schema)

export default Course;