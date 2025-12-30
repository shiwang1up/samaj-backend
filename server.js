const express = require("express");

const connectDB = require("./database/database");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");


dotenv.config();



app.listen(process.env.PORT, () => {
    console.log("Server is running on port 4000");
});
