const User = require("../models/User");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");



const registerController = async (req, res, next) => {
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
            throw new CustomError("Username or email already exists!", 400)
            // res.status(400).json("Username or Email already exists!"); //? using middleware now... above
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);
        const newUser = new User({ ...req.body, password: hashedPassword })
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)

    } catch (error) {
        // console.log("Error creating user", error); //? using middleware now... above
        // res.status(500).json(error); //? using middleware now... above
        next(error)
    }
}

const loginController = async (req, res, next) => {
    try {
        let user;
        if (req.body.email) {
            user = await User.findOne({ email: req.body.email })
        } else {
            user = await User.findOne({ username: req.body.username })
        }
        if (!user) {
            // return res.status(404).json("User not found!")
            throw new CustomError("User not found!", 404)
        }
        const matched = await bcrypt.compare(req.body.password, user.password)
        if (!matched) {

            // return res.status(401).json("wrong credentials!")
            throw new CustomError("wrong credentials!", 401)
        }
        // const token = jwt.sign({ _id: user._id }, "yoyoyooyoyoyoyoyoyoyo", { expiresIn: "3d" })
        const { password, ...info } = user._doc;
        const token = jwt.sign({ _id: user._id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN })

        //    res.cookie("token", token).status(200).json(data._doc); // For web

        res.status(200).json({ ...info, token });

    } catch (error) {
        // console.log(error)
        // res.status(500).json(error);
        next(error)
    }
}

const logoutController = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        }

        if (!token) {
            return res.status(200).json("User Logged out successfully!");
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, {}, async (err, data) => {
            if (err) {
                // Determine if the token is just expired or invalid
                // If invalid/expired, they are effectively logged out anyway
                return res.status(200).json("User Logged out successfully!");
            }
            try {
                const id = data._id;
                // Increment token version to invalidate all current tokens
                await User.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });
                res.status(200).json("User Logged out successfully!");
            } catch (error) {
                // res.status(500).json(error);
                next(error)
            }
        });
    } catch (error) {
        // res.status(500).json(error);
        next(error)
    }
}



const refetchController = async (req, res, next) => {
    let token = req.cookies.token; // Try cookie first

    // If no cookie, try Authorization header (Mobile/Stateless)
    if (!token && req.headers.authorization) {
        // Handle "Bearer <token>" format
        const authHeader = req.headers.authorization;
        token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    }

    if (!token) {
        throw new CustomError("Authentication failed: No token provided", 401)
        // return res.status(401).json("Authentication failed: No token provided");
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, {}, async (err, data) => {
        if (err) {
            return res.status(404).json(err);
        }
        try {
            const id = data._id;
            const user = await User.findOne({ _id: id });

            if (!user) {
                // return res.status(404).json("User not found!");
                throw new CustomError("User not found!", 404)

            }

            // Check if token version matches user's current version
            const tokenVersion = data.tokenVersion || 0;
            const userVersion = user.tokenVersion || 0;

            if (tokenVersion !== userVersion) {
                throw new CustomError("Token is invalid (Logged out or password changed)", 401)
                // return res.status(401).json("Token is invalid (Logged out or password changed)");
            }

            res.status(200).json(user);
        } catch (error) {
            next(error)
            // res.status(500).json(error);
        }
    });
}


module.exports = { registerController, loginController, logoutController, refetchController }