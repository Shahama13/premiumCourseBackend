import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Course from "../models/Course.js"
import User from "../models/User.js";
import ErrorClass from "../utils/errorClass.js";
import getDataUri from "../utils/getDataUri.js";
import cloudinary from "cloudinary"

export const getAllCourses = catchAsyncError(async (req, res, next) => {
    const keyword = req.query.keyword || ""
    const category = req.query.category || ""
    const courses = await Course.find({
        title: {
            $regex: keyword,
            $options: "i"
        }, category: {
            $regex: category,
            $options: "i"
        }
    }).select("-lectures").populate("createdBy");
    res.status(200).json({
        success: true,
        courses,
    })
})

export const createCourse = catchAsyncError(async (req, res, next) => {

    const { title, description, category, price } = req.body;
    const file = req.file;
    const fileUri = getDataUri(file)

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, { folder: "course" })

    if (!title || !description || !category || !price) return next(new ErrorClass("Enter all fields", 400))

    await Course.create({
        title, description, category, price, createdBy: req.user._id, poster: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
    })
    res.status(201).json({
        success: true,
        message: "Course created! Add lEctures Now"
    })
})

export const getCourseLectures = catchAsyncError(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
    if (!course) return next(new ErrorClass("Course not found", 404))
    course.views += 1
    await course.save()
    res.status(200).json({
        success: true,
        course,
    })
})


export const createPurchase = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    const course = await Course.findById(req.body.id)
    if (!course) return next(new ErrorClass("Invalid Course Id", 404))
    user.purchases.unshift(req.body.id)
    await user.save();
    res.status(200).json({
        success: true,
        message: `${course.title} Playlist Purchased!`
    })
})

export const getCourseDetailsWithLecturesNotVideos = catchAsyncError(async (req, res, next) => {
    const course = await Course.findById(req.params.id).select("-lectures.video").populate("createdBy");
    if (!course) return next(new ErrorClass("Course not found", 404))
    course.views += 1
    await course.save()
    res.status(200).json({
        success: true,
        course
    })
})

export const addLectures = catchAsyncError(async (req, res, next) => {

    if (!req.body.avatar) return next(new ErrorClass("Please enter the lecture thumbnail", 404));
    const course = await Course.findById(req.params.id)
    if (!course) return next(new ErrorClass("Course not found", 404))

    const file = req.file;
    const fileUri = getDataUri(file)

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "video",
        folder: "course"
    })
    const mycloudImg = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "course"
    })

    course.lectures.push({
        video: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        },
        poster: {
            public_id: mycloudImg.public_id,
            url: mycloudImg.secure_url
        },
        title: req.body.title,
        description: req.body.description,
    })
    course.numOfVideos = course.lectures.length;

    await course.save()

    res.status(200).json({
        success: true,
        message: "Lecture added"
    })

})

export const deleteCourse = catchAsyncError(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
    if (!course) return next(new ErrorClass("Course not found", 404))

    await cloudinary.v2.uploader.destroy(course.poster.public_id)

    for (let i = 0; i < course.lectures.length; i++) {
        console.log(course.lectures[i].video.public_id)
        await cloudinary.v2.uploader.destroy(course.lectures[i].video.public_id, { resource_type: 'video' })
        await cloudinary.v2.uploader.destroy(course.lectures[i].poster.public_id)
    }

    await Course.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        message: "Course Deleted"
    })

})

export const deleteLecture = catchAsyncError(async (req, res, next) => {
    const { cId, lId } = req.query;
    const course = await Course.findById(cId)
    if (!course) return next(new ErrorClass("Course not found", 404))

    const lecture = course.lectures.find((item) => item._id.toString() === lId.toString())
    await cloudinary.v2.uploader.destroy(lecture.video.public_id, { resource_type: "video" })
    await cloudinary.v2.uploader.destroy(lecture.poster.public_id)


    course.lectures = course.lectures.filter((item) => item._id.toString() !== lId.toString())

    course.numOfVideos = course.lectures.length
    await course.save()

    res.status(200).json({
        success: true,
        message: "Lecture Deleted"
    })

})