import express from "express"
import { changePassword, createAccount, forgotPassword, changeRole, getAllUsers, resetPasword, deleteUser, getMyProfile, login, logout, updateProfile, addToPlaylist } from "../controllers/userController.js";
import { adminAuth, userAuth } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router()

router.route("/signup").post(createAccount)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/change").put(userAuth, changePassword)
router.route("/me").get(userAuth, getMyProfile).put(userAuth, singleUpload, updateProfile)
router.route("/forgot").post(forgotPassword)
router.route("/reset/:token").put(resetPasword)
router.route("/addtoplaylist").post(userAuth, addToPlaylist)

// Admin routes
router.route("/admin/users").get(userAuth, adminAuth, getAllUsers)
router.route("/admin/user/:id").put(userAuth, adminAuth, changeRole).delete(userAuth,adminAuth,deleteUser)

export default router;