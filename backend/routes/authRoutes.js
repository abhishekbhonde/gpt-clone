const express = require("express");
const {registerUser, signInUser, getMe} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const router = express.Router()

router.post("/register", registerUser)
router.post("/login", signInUser)
router.get("/me", authMiddleware, getMe)

module.exports = router;