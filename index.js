const express = require("express");
const connectDB = require("./database/database");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser")
const authRouter = require("./routes/auth")
const cors = require("cors");



dotenv.config();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use("/api/auth", authRouter);

const startServer = async () => {
    await connectDB();
    app.listen(process.env.PORT, () => {
        console.log("Server is running on port", process.env.PORT);
    });
};

startServer();

