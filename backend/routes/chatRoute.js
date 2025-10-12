
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {streamChat, deleteConversation, getConversations,
    getMessages,} = require("../controllers/chatController");

//routes

router.post("/", authMiddleware, streamChat);
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversation/:id", authMiddleware, getMessages);
router.delete("/conversation/:id", authMiddleware, deleteConversation);

module.exports = router;