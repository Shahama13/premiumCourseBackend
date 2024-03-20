import express from "express";
import { getAllCourses, createCourse, getCourseLectures, deleteLecture, deleteCourse, addLectures, createPurchase, getCourseDetailsWithLecturesNotVideos } from "../controllers/courseController.js";
import { adminAuth, userAuth, premiumSubscribers } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// Get all courses without lectures
router.route("/courses").get(getAllCourses)

// Create new course only admin
router
    .route("/course")
    .post(userAuth, adminAuth, singleUpload, createCourse)

// Purchase course 
router.route("/purchase").post(userAuth, createPurchase)

router.route("/courselecture/:id").get(getCourseDetailsWithLecturesNotVideos)

// Add lecture delete course get acourse details
router
    .route("/course/:id")
    .get(userAuth, premiumSubscribers, getCourseLectures)
    .post(userAuth, adminAuth, singleUpload, addLectures)
    .delete(userAuth, adminAuth, deleteCourse)

// delete lecture
router.route("/lecture").delete(userAuth, adminAuth, deleteLecture)

export default router;