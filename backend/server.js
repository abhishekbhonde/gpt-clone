const express = require("express");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const cors = require("cors")
require("dotenv").config()
const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/auth", authRoutes);

app.get("/health", (req, res)=>{
    res.json({
        message:"API is working"
    })
})
app.listen(4000, ()=>{
    console.log("Server is running on port 4000");
})


