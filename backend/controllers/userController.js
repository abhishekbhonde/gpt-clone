const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    console.log("Register user called");
    console.log(req.body);
    const { name, email, password, openApiKey } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        console.log(existingUser);
        if (existingUser) {
            return res.status(403).json({
                message: "User already exists"
            });
        }
        // Hash the password
        const hashedPass = await bcrypt.hash(password, 10);
        // Create new user
        const response = await User.create({
            name,
            email,
            password: hashedPass,
            openApiKey
        });
        res.status(201).json({
            message: "User created successfully",
            user: response
        });
    } catch (error) {
        res.status(500).json({
            message: "Error occurred while creating user",
            error: error.message
        });
    }
};

const signInUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(401).json({
                message: "Check your credentials (user not found)",
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, userExist.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Check your credentials (invalid password)",
            });
        }

        // Generate JWT token
    const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

        return res.status(200).json({
            message: "User logged in successfully",
            token,
        });

    } catch (error) {
        console.error("Sign-in error:", error);
        return res.status(500).json({
            message: "Something went wrong during login",
            error: error.message,
        });
    }
};


const getMe = async (req,res)=>{
    // get me logic here
    res.json({user: req.user})
}
module.exports = { registerUser, signInUser, getMe };