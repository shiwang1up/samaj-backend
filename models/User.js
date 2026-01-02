const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    blockList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

}, { timestamps: true });

const User = mongoose.model("User", userSchema)

module.exports = User;