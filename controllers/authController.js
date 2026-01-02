const User = require("../models/User");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");



const registerController = async (req, res) => {
    try {
        // ! 1st
        // const newUser = new User({
        //     username: "john",
        //     email: "john@gmail.com",
        //     password: "123456",
        //     fullName: "John Doe",
        //     bio: "Hey there! This is Shiwang Srivastava."
        // })
        // !2nd
        // const newUser = new User(req.body)
        // const savedUser = await newUser.save();
        // res.status(201).json(savedUser);

        // !3rd
        const { password, username, email } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] })

        if (existingUser) {
            res.status(400).json("Username or Email already exists!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);
        const newUser = new User({ ...req.body, password: hashedPassword })
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)

    } catch (error) {
        console.log("Error creating user", error);
        res.status(500).json(error);
    }
}

const loginController = async (req, res) => {
    try {
        let user;
        if (req.body.email) {
            user = await User.findOne({ email: req.body.email })
        } else {
            user = await User.findOne({ username: req.body.username })
        }
        if (!user) {
            return res.status(404).json("User not found!")
        }
        const matched = await bcrypt.compare(req.body.password, user.password)
        if (!matched) {
            return res.status(401).json("wrong credentials!")
        }
        // const token = jwt.sign({ _id: user._id }, "yoyoyooyoyoyoyoyoyoyo", { expiresIn: "3d" })
        const { password, ...info } = user._doc;
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN })

        //    res.cookie("token", token).status(200).json(data._doc); // For web

        res.status(200).json({ ...info, token });

    } catch (error) {
        console.log(error)
        res.status(500).json(error);

    }
}

const logoutController = async (req, res) => {
    try {
        // res.clearCookie("token", { sameSite: "none", secure: true }).status(200).json("User Logout successfully!") //for web
        res.status(200).json("User Logged out successfully!");
    } catch (error) {
        res.status(500).json(error);
    }
}



const refetchController = async (req, res) => {
    let token = req.cookies.token; // Try cookie first

    // If no cookie, try Authorization header (Mobile/Stateless)
    if (!token && req.headers.authorization) {
        // Handle "Bearer <token>" format
        const authHeader = req.headers.authorization;
        token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    }

    if (!token) {
        return res.status(401).json("Authentication failed: No token provided");
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, {}, async (err, data) => {
        if (err) {
            return res.status(404).json(err);
        }
        try {
            const id = data._id;
            const user = await User.findOne({ _id: id });
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json(error);
        }
    });
}


module.exports = { registerController, loginController, logoutController, refetchController }